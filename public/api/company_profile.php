<?php
/**
 * public/api/company_profile.php
 * 
 * Gestion et paramétrage complet du compte Entreprise (table `companies`)
 * - Logo d'entreprise (upload / data URL)
 * - Raison sociale, enseigne, SIREN, SIRET (norme légale 2026)
 * - N° TVA intracommunautaire, Forme juridique, NAF/APE, Capital
 * - Coordonnées (Adresse, CP, Ville, Téléphone, Email, Site web)
 * - Coordonnées bancaires (IBAN, BIC) pour factures et devis
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$devDbPath = __DIR__ . '/../../dev_db.json';

// Helper pour calculer la TVA intracommunautaire française depuis le SIREN
function compute_french_vat_profile($siren) {
    $clean = preg_replace('/\D/', '', $siren);
    if (strlen($clean) < 9) return '';
    $s9 = substr($clean, 0, 9);
    $key = (12 + 3 * (intval($s9) % 97)) % 97;
    return 'FR' . ($key < 10 ? '0' . $key : $key) . $s9;
}

// Extraction du token ou du paramètre company_id
$companyId = intval($_GET['company_id'] ?? 0);
$token = get_bearer_token();
if ($token) {
    $payload = verify_jwt($token);
    if ($payload && isset($payload['company_id'])) {
        $companyId = intval($payload['company_id']);
    }
}

if ($companyId <= 0) {
    // Si non connecté, par défaut entreprise 1
    $companyId = 1;
}

try {
    $pdo = null;
    try {
        $pdo = get_db_connection();
    } catch (Throwable $eDb) {
        $pdo = null;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MÉTHODE GET : Récupération de la fiche complète de l'entreprise
    // ─────────────────────────────────────────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $company = null;

        if ($pdo) {
            $stmt = $pdo->prepare("SELECT * FROM companies WHERE id = ? LIMIT 1");
            $stmt->execute([$companyId]);
            $company = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // Fallback dev_db.json
        if (!$company && file_exists($devDbPath)) {
            $db = json_decode(file_get_contents($devDbPath), true) ?: [];
            foreach ($db['companies'] ?? [] as $c) {
                if ((int)($c['id'] ?? 0) === $companyId) {
                    $company = $c;
                    break;
                }
            }
        }

        if (!$company) {
            $company = [
                'id' => $companyId,
                'name' => 'Mon Entreprise',
                'company_name' => 'Mon Entreprise',
                'email' => 'contact@mon-entreprise.fr',
                'siret' => '',
                'siren' => '',
                'vat_number' => '',
                'legal_form' => 'SARL',
                'naf_code' => '',
                'activity' => '',
                'address' => '',
                'postal_code' => '',
                'city' => '',
                'country' => 'France',
                'capital' => '',
                'employee_range' => '1 à 5 salariés',
                'phone' => '',
                'website' => '',
                'iban' => '',
                'bic' => '',
                'logo_url' => '',
                'avatar_url' => ''
            ];
        }

        // Normalisation
        $company['name'] = $company['company_name'] ?? $company['name'] ?? 'Mon Entreprise';
        $company['logo'] = $company['logo_url'] ?? $company['avatar_url'] ?? $company['logo'] ?? null;
        if (empty($company['vat_number']) && !empty($company['siren'])) {
            $company['vat_number'] = compute_french_vat_profile($company['siren']);
        }

        unset($company['password_hash']);
        echo json_encode(['success' => true, 'company' => $company]);
        exit;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MÉTHODE POST : Mise à jour de la table `companies`
    // ─────────────────────────────────────────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?: $_POST;

        $targetId = intval($input['id'] ?? $companyId);
        if ($targetId <= 0) $targetId = 1;

        $companyName = trim($input['company_name'] ?? $input['name'] ?? 'Mon Entreprise');
        $tradeName = trim($input['trade_name'] ?? '');
        $email = trim($input['email'] ?? '');
        $siret = preg_replace('/\s+/', '', trim($input['siret'] ?? ''));
        $siren = preg_replace('/\s+/', '', trim($input['siren'] ?? ''));
        
        if (empty($siren) && strlen($siret) >= 9) {
            $siren = substr($siret, 0, 9);
        }
        if (!empty($siren) && empty($siret)) {
            $siret = $siren . '00010';
        }

        $vatNumber = trim($input['vat_number'] ?? '');
        if (empty($vatNumber) && !empty($siren)) {
            $vatNumber = compute_french_vat_profile($siren);
        }

        $legalForm = trim($input['legal_form'] ?? '');
        $nafCode = trim($input['naf_code'] ?? '');
        $activity = trim($input['activity'] ?? '');
        $address = trim($input['address'] ?? '');
        $postalCode = trim($input['postal_code'] ?? '');
        $city = trim($input['city'] ?? '');
        $country = trim($input['country'] ?? 'France');
        $capital = trim($input['capital'] ?? '');
        $employeeRange = trim($input['employee_range'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $website = trim($input['website'] ?? '');
        $iban = preg_replace('/\s+/', '', trim($input['iban'] ?? ''));
        $bic = preg_replace('/\s+/', '', trim($input['bic'] ?? ''));
        $logoUrl = trim($input['logo_url'] ?? $input['logo'] ?? $input['avatar_url'] ?? '');

        // 1. Mise à jour MySQL si disponible
        if ($pdo) {
            $stmt = $pdo->prepare("
                UPDATE companies SET
                    company_name = ?,
                    trade_name = ?,
                    siren = ?,
                    siret = ?,
                    vat_number = ?,
                    legal_form = ?,
                    naf_code = ?,
                    activity = ?,
                    address = ?,
                    postal_code = ?,
                    city = ?,
                    country = ?,
                    capital = ?,
                    employee_range = ?,
                    phone = ?,
                    email = COALESCE(NULLIF(?, ''), email),
                    website = ?,
                    iban = ?,
                    bic = ?,
                    logo_url = ?,
                    avatar_url = COALESCE(NULLIF(?, ''), avatar_url)
                WHERE id = ?
            ");
            $stmt->execute([
                $companyName,
                $tradeName ?: null,
                $siren ?: null,
                $siret ?: null,
                $vatNumber ?: null,
                $legalForm ?: null,
                $nafCode ?: null,
                $activity ?: null,
                $address ?: null,
                $postalCode ?: null,
                $city ?: null,
                $country ?: 'France',
                $capital ?: null,
                $employeeRange ?: null,
                $phone ?: null,
                $email ?: null,
                $website ?: null,
                $iban ?: null,
                $bic ?: null,
                $logoUrl ?: null,
                $logoUrl ?: null,
                $targetId
            ]);
        }

        // 2. Synchronisation dev_db.json
        if (file_exists($devDbPath)) {
            $db = json_decode(file_get_contents($devDbPath), true) ?: [];
            if (!isset($db['companies'])) $db['companies'] = [];

            $found = false;
            foreach ($db['companies'] as &$c) {
                if ((int)($c['id'] ?? 0) === $targetId) {
                    $c['company_name'] = $companyName;
                    $c['name'] = $companyName;
                    $c['trade_name'] = $tradeName;
                    $c['siren'] = $siren;
                    $c['siret'] = $siret;
                    $c['vat_number'] = $vatNumber;
                    $c['legal_form'] = $legalForm;
                    $c['naf_code'] = $nafCode;
                    $c['activity'] = $activity;
                    $c['address'] = $address;
                    $c['postal_code'] = $postalCode;
                    $c['city'] = $city;
                    $c['country'] = $country;
                    $c['capital'] = $capital;
                    $c['employee_range'] = $employeeRange;
                    $c['phone'] = $phone;
                    if (!empty($email)) $c['email'] = $email;
                    $c['website'] = $website;
                    $c['iban'] = $iban;
                    $c['bic'] = $bic;
                    $c['logo_url'] = $logoUrl;
                    $c['logo'] = $logoUrl;
                    $c['avatar_url'] = $logoUrl;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $db['companies'][] = [
                    'id' => $targetId,
                    'company_name' => $companyName,
                    'name' => $companyName,
                    'trade_name' => $tradeName,
                    'siren' => $siren,
                    'siret' => $siret,
                    'vat_number' => $vatNumber,
                    'legal_form' => $legalForm,
                    'naf_code' => $nafCode,
                    'activity' => $activity,
                    'address' => $address,
                    'postal_code' => $postalCode,
                    'city' => $city,
                    'country' => $country,
                    'capital' => $capital,
                    'employee_range' => $employeeRange,
                    'phone' => $phone,
                    'email' => $email ?: 'contact@mon-entreprise.fr',
                    'website' => $website,
                    'iban' => $iban,
                    'bic' => $bic,
                    'logo_url' => $logoUrl,
                    'logo' => $logoUrl,
                    'avatar_url' => $logoUrl,
                    'status' => 'active'
                ];
            }
            file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        $responseCompany = [
            'id' => $targetId,
            'name' => $companyName,
            'company_name' => $companyName,
            'trade_name' => $tradeName,
            'siren' => $siren,
            'siret' => $siret,
            'vat_number' => $vatNumber,
            'legal_form' => $legalForm,
            'naf_code' => $nafCode,
            'activity' => $activity,
            'address' => $address,
            'postal_code' => $postalCode,
            'city' => $city,
            'country' => $country,
            'capital' => $capital,
            'employee_range' => $employeeRange,
            'phone' => $phone,
            'email' => $email,
            'website' => $website,
            'iban' => $iban,
            'bic' => $bic,
            'logo' => $logoUrl,
            'logo_url' => $logoUrl
        ];

        echo json_encode([
            'success' => true,
            'message' => "Informations de l'entreprise mises à jour avec succès.",
            'company' => $responseCompany
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => "Erreur lors de l'enregistrement de l'entreprise : " . $e->getMessage()]);
}
