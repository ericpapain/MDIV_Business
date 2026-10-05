<?php
/**
 * Service d'Enrichissement & Recherche d'Entreprise Multi-Sources (SIREN)
 * Sources : INSEE Sirene (via Recherche Entreprises Gouv), INPI RNE, BODACC, Pappers (optionnel)
 */
require_once __DIR__ . '/config.php';

header("Content-Type: application/json; charset=UTF-8");

$rawSiren = $_GET['siren'] ?? '';

// 1. Nettoyage strict de la saisie (espaces, tirets, points)
$siren = preg_replace('/[^0-9]/', '', $rawSiren);

if (empty($siren)) {
    http_response_code(400);
    echo json_encode(["error" => "Veuillez fournir un numéro SIREN."]);
    exit;
}

if (strlen($siren) !== 9) {
    http_response_code(400);
    echo json_encode(["error" => "Le numéro SIREN doit contenir exactement 9 chiffres."]);
    exit;
}

try {
    $pdo = get_db_connection();

    // 2. Vérification si l'entreprise est déjà inscrite sur la plateforme (non-bloquant)
    $isAlreadyRegistered = false;
    $existingCompany = null;
    try {
        $stmtCheck = $pdo->prepare("SELECT id, company_name, email, siren FROM companies WHERE siren = ? LIMIT 1");
        $stmtCheck->execute([$siren]);
        $existingCompany = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        $isAlreadyRegistered = !empty($existingCompany);
    } catch (Throwable $eDbCheck) {
        // En cas de mise à jour de schéma en cours, on ne bloque pas la recherche INSEE
    }

    // 3. Vérification du Cache API Local (pour éviter les quotas et latences inutiles, non-bloquant)
    try {
        $stmtCache = $pdo->prepare("SELECT response_json, expires_at FROM company_api_cache WHERE siren = ? AND expires_at > NOW() LIMIT 1");
        $stmtCache->execute([$siren]);
        $cached = $stmtCache->fetch(PDO::FETCH_ASSOC);

        if ($cached && !empty($cached['response_json'])) {
            $data = json_decode($cached['response_json'], true);
            $data['already_registered'] = $isAlreadyRegistered;
            $data['existing_company_id'] = $isAlreadyRegistered ? ($existingCompany['id'] ?? null) : null;
            $data['from_cache'] = true;
            echo json_encode($data);
            exit;
        }
    } catch (Throwable $eCache) {
        // En cas d'absence de table cache, continuer vers l'API officielle
    }

    // 4. MULTI-SOURCES ENRICHMENT ENGINE
    $sourcesUsed = [];
    $companyData = null;

    // --- SOURCE PRIORITAIRE 1 : API Recherche Entreprises (Gouv.fr - INSEE SIRENE & RNE) ---
    $gouvUrl = "https://recherche-entreprises.api.gouv.fr/search?q=" . urlencode($siren) . "&page=1&per_page=1";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $gouvUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    curl_setopt($ch, CURLOPT_USERAGENT, "MDIV-Business-B2B/1.0 (contact@mdiv-business.fr)");
    $gouvResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $gouvResponse) {
        $gouvJson = json_decode($gouvResponse, true);
        if (!empty($gouvJson['results']) && is_array($gouvJson['results'])) {
            $item = $gouvJson['results'][0];
            $siege = $item['siege'] ?? [];
            
            $sourcesUsed[] = "INSEE_SIRENE";
            
            // Formatage de l'adresse
            $addrParts = [];
            if (!empty($siege['numero_voie'])) $addrParts[] = $siege['numero_voie'];
            if (!empty($siege['type_voie'])) $addrParts[] = $siege['type_voie'];
            if (!empty($siege['libelle_voie'])) $addrParts[] = $siege['libelle_voie'];
            if (!empty($siege['adresse'])) {
                $formattedAddress = $siege['adresse'];
            } else {
                $formattedAddress = implode(' ', $addrParts);
            }

            // Extraction des dirigeants
            $dirigeants = [];
            if (!empty($item['dirigeants']) && is_array($item['dirigeants'])) {
                foreach ($item['dirigeants'] as $d) {
                    $dName = trim(($d['prenoms'] ?? '') . ' ' . ($d['nom'] ?? ''));
                    $dRole = $d['qualite'] ?? 'Dirigeant';
                    if ($dName) {
                        $dirigeants[] = [
                            'name' => $dName,
                            'role' => $dRole
                        ];
                    }
                }
            }

            $companyData = [
                'siren' => $item['siren'] ?? $siren,
                'siret_siege' => $siege['siret'] ?? ($siren . '00010'),
                'legal_name' => $item['nom_complet'] ?? $item['nom_raison_sociale'] ?? '',
                'trade_name' => $item['sigle'] ?? $siege['enseigne_1'] ?? null,
                'legal_form' => $item['nature_juridique'] ?? 'Société commerciale',
                'naf_code' => $item['activite_principale'] ?? $siege['activite_principale'] ?? '',
                'activity' => $item['libelle_activite_principale'] ?? 'Activités des entreprises',
                'address' => $formattedAddress ?: ($siege['code_postal'] . ' ' . $siege['libelle_commune']),
                'postal_code' => $siege['code_postal'] ?? '',
                'city' => $siege['libelle_commune'] ?? $siege['commune'] ?? '',
                'country' => 'France',
                'creation_date' => $item['date_creation'] ?? null,
                'administrative_status' => ($item['etat_administratif'] ?? 'A') === 'A' ? 'ACTIVE' : 'CESSEE',
                'employee_range' => $item['tranche_effectif_salarie'] ?? 'Non communiqué',
                'capital' => null,
                'dirigeants' => $dirigeants,
                'raw_insee' => $item
            ];
        }
    }

    // --- SOURCE 2 : BODACC (Annonces Légales & Procédures) ---
    $bodaccEvents = [];
    $bodaccUrl = "https://bodacc-datadila.opendatasoft.com/api/records/1.0/search/?dataset=annonces-commerciales&q=" . urlencode($siren) . "&rows=5";
    
    $chBodacc = curl_init();
    curl_setopt($chBodacc, CURLOPT_URL, $bodaccUrl);
    curl_setopt($chBodacc, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chBodacc, CURLOPT_TIMEOUT, 4);
    curl_setopt($chBodacc, CURLOPT_USERAGENT, "MDIV-Business-B2B/1.0");
    $bodaccResponse = curl_exec($chBodacc);
    $bodaccHttp = curl_getinfo($chBodacc, CURLINFO_HTTP_CODE);
    curl_close($chBodacc);

    if ($bodaccHttp === 200 && $bodaccResponse) {
        $bodaccJson = json_decode($bodaccResponse, true);
        if (!empty($bodaccJson['records'])) {
            $sourcesUsed[] = "BODACC";
            foreach ($bodaccJson['records'] as $rec) {
                $fields = $rec['fields'] ?? [];
                $bodaccEvents[] = [
                    'date' => $fields['dateparution'] ?? null,
                    'type' => $fields['familleavis_lib'] ?? $fields['typeavis_lib'] ?? 'Annonce Légale',
                    'tribunal' => $fields['tribunal'] ?? null,
                    'description' => $fields['jugement'] ?? $fields['depot'] ?? $fields['creation'] ?? 'Publication officielle BODACC'
                ];
            }
        }
    }

    // --- SOURCE OPTIONNELLE : PAPPERS (si clé d'enrichissement configurée) ---
    $pappersApiKey = getenv('PAPPERS_API_KEY');
    if (!empty($pappersApiKey) && $pappersApiKey !== 'none') {
        $pappersUrl = "https://api.pappers.fr/v2/entreprise?siren=" . urlencode($siren) . "&api_token=" . urlencode($pappersApiKey);
        $chPappers = curl_init();
        curl_setopt($chPappers, CURLOPT_URL, $pappersUrl);
        curl_setopt($chPappers, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chPappers, CURLOPT_TIMEOUT, 4);
        $pappersRes = curl_exec($chPappers);
        $pappersCode = curl_getinfo($chPappers, CURLINFO_HTTP_CODE);
        curl_close($chPappers);

        if ($pappersCode === 200 && $pappersRes) {
            $pappersJson = json_decode($pappersRes, true);
            if (!empty($pappersJson)) {
                $sourcesUsed[] = "PAPPERS";
                if (!empty($pappersJson['capital_forme'])) {
                    if ($companyData) $companyData['capital'] = $pappersJson['capital_forme'];
                }
            }
        }
    }

    // Si aucune donnée trouvée dans les registres officiels
    if (!$companyData) {
        http_response_code(404);
        echo json_encode([
            "error" => "Aucune entreprise correspondant à ce SIREN n'a été trouvée dans le répertoire officiel.",
            "siren" => $siren,
            "suggestion" => "Vérifiez le numéro ou utilisez l'inscription manuelle si votre société est en cours d'immatriculation."
        ]);
        exit;
    }

    $finalPayload = [
        "success" => true,
        "already_registered" => $isAlreadyRegistered,
        "existing_company_id" => $isAlreadyRegistered ? $existingCompany['id'] : null,
        "sources_used" => $sourcesUsed,
        "company" => [
            "siren" => $companyData['siren'],
            "siret" => $companyData['siret_siege'],
            "company_name" => $companyData['legal_name'],
            "trade_name" => $companyData['trade_name'],
            "legal_form" => $companyData['legal_form'],
            "naf_code" => $companyData['naf_code'],
            "activity" => $companyData['activity'],
            "address" => $companyData['address'],
            "postal_code" => $companyData['postal_code'],
            "city" => $companyData['city'],
            "country" => $companyData['country'],
            "creation_date" => $companyData['creation_date'],
            "administrative_status" => $companyData['administrative_status'],
            "employee_range" => $companyData['employee_range'],
            "capital" => $companyData['capital'],
            "dirigeants" => $companyData['dirigeants'],
            "bodacc_events" => $bodaccEvents
        ],
        "fetched_at" => date('c')
    ];

    // 5. Sauvegarde dans le cache SQL (Valide 48 heures)
    try {
        $expiresAt = date('Y-m-d H:i:s', time() + (86400 * 2));
        $stmtSaveCache = $pdo->prepare("
            INSERT INTO company_api_cache (siren, provider, response_json, expires_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE response_json = VALUES(response_json), expires_at = VALUES(expires_at), fetched_at = CURRENT_TIMESTAMP
        ");
        $stmtSaveCache->execute([$siren, implode('+', $sourcesUsed), json_encode($finalPayload), $expiresAt]);
    } catch (Exception $e) {
        // En cas d'erreur de cache, on ne bloque pas la réponse client
    }

    echo json_encode($finalPayload);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur de service : " . $e->getMessage()]);
}
