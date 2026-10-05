<?php
// public/api/fraud_check_iban.php
// Moteur de Sécurité & Détection de Fraude IBAN / Faux RIB (Algorithme MOD 97 & Historique Fournisseurs)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

/**
 * Validation mathématique rigoureuse de l'IBAN selon la norme ISO 13616 (MOD 97-10)
 */
function validate_iban_mod97($iban) {
    $clean = strtoupper(preg_replace('/[\s\-]/', '', $iban));
    if (strlen($clean) < 15 || strlen($clean) > 34) {
        return ['valid' => false, 'reason' => 'Longueur d\'IBAN invalide (' . strlen($clean) . ' caractères)'];
    }

    // Déplacer les 4 premiers caractères à la fin
    $reordered = substr($clean, 4) . substr($clean, 0, 4);

    // Remplacer chaque lettre par sa valeur numérique (A=10, B=11, ..., Z=35)
    $numeric = '';
    for ($i = 0; $i < strlen($reordered); $i++) {
        $char = $reordered[$i];
        if (ctype_alpha($char)) {
            $numeric .= (ord($char) - 55);
        } elseif (ctype_digit($char)) {
            $numeric .= $char;
        } else {
            return ['valid' => false, 'reason' => 'Caractères non autorisés détectés'];
        }
    }

    // Calcul du modulo 97 sur de grands nombres par morceaux
    $remainder = 0;
    $chunkSize = 7;
    for ($pos = 0; $pos < strlen($numeric); $pos += $chunkSize) {
        $chunk = $remainder . substr($numeric, $pos, $chunkSize);
        $remainder = intval($chunk) % 97;
    }

    if ($remainder !== 1) {
        return ['valid' => false, 'reason' => 'Échec du contrôle modulo 97 (Clé de contrôle IBAN erronée)'];
    }

    $country = substr($clean, 0, 2);
    return [
        'valid' => true,
        'country' => $country,
        'formatted' => chunk_split($clean, 4, ' ')
    ];
}

/**
 * Calcul et vérification de la clé RIB française (Banque 5, Guichet 5, Compte 11, Clé 2)
 */
function validate_french_rib($bankCode, $branchCode, $accountNumber, $ribKey) {
    // Remplacement des lettres dans le numéro de compte français selon la table de conversion standard
    $trans = [
        'A' => 1, 'B' => 2, 'C' => 3, 'D' => 4, 'E' => 5, 'F' => 6, 'G' => 7, 'H' => 8, 'I' => 9,
        'J' => 1, 'K' => 2, 'L' => 3, 'M' => 4, 'N' => 5, 'O' => 6, 'P' => 7, 'Q' => 8, 'R' => 9,
        'S' => 2, 'T' => 3, 'U' => 4, 'V' => 5, 'W' => 6, 'X' => 7, 'Y' => 8, 'Z' => 9
    ];
    $cleanAccount = strtoupper($accountNumber);
    $convertedAccount = '';
    for ($i = 0; $i < strlen($cleanAccount); $i++) {
        $c = $cleanAccount[$i];
        $convertedAccount .= isset($trans[$c]) ? $trans[$c] : $c;
    }

    // Formule officielle de la clé RIB française : Clé = 97 - ((89*B + 15*G + 3*C) % 97)
    $b = intval($bankCode);
    $g = intval($branchCode);
    $c = floatval($convertedAccount); // Traité avec précision
    $sum = (89 * $b) + (15 * $g) + fmod(3 * $c, 97);
    $computedKey = 97 - intval(fmod($sum, 97));
    if ($computedKey === 0) $computedKey = 97;

    return intval($ribKey) === $computedKey;
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $companyId = isset($input['company_id']) ? intval($input['company_id']) : 1;
    $supplierName = trim($input['supplier_name'] ?? '');
    $supplierSiret = trim($input['supplier_siret'] ?? '');
    $iban = strtoupper(trim($input['iban'] ?? ''));
    $invoiceNumber = trim($input['invoice_number'] ?? '');
    $amountTTC = floatval($input['amount_ttc'] ?? 0);

    if (empty($iban)) {
        echo json_encode([
            'success' => false,
            'status' => 'MISSING_IBAN',
            'message' => 'Aucun IBAN fourni pour l\'analyse de sécurité.'
        ]);
        exit;
    }

    // 1. Validation mathématique de l'IBAN
    $ibanCheck = validate_iban_mod97($iban);
    if (!$ibanCheck['valid']) {
        echo json_encode([
            'success' => true,
            'verdict' => 'CRITICAL_INVALID_IBAN',
            'severity' => 'danger',
            'badge' => 'IBAN INVALIDE',
            'score' => 0,
            'explanation' => 'Cet IBAN est mathématiquement erroné (' . $ibanCheck['reason'] . '). Tout virement vers ce compte sera rejeté par votre banque.',
            'canPay' => false
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $cleanIban = preg_replace('/[\s\-]/', '', $iban);
    $country = substr($cleanIban, 0, 2);

    // 2. Contrôle de l'historique Fournisseur (Anti-Fraude au Faux RIB Kolecto)
    $dbPath = __DIR__ . '/../../dev_db.json';
    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
    $trustedRegistry = $db['trusted_supplier_ibans'] ?? [];
    $expenses = $db['expenses'] ?? [];

    $previousMatches = array_filter($trustedRegistry, function($item) use ($companyId, $supplierName, $supplierSiret) {
        if (($item['company_id'] ?? 1) !== $companyId) return false;
        if (!empty($supplierSiret) && !empty($item['siret']) && $item['siret'] === $supplierSiret) return true;
        if (!empty($supplierName) && strtolower($item['supplier_name'] ?? '') === strtolower($supplierName)) return true;
        return false;
    });

    $verdict = 'SAFE_VERIFIED';
    $severity = 'success';
    $badge = 'IBAN VÉRIFIÉ & SÉCURISÉ';
    $score = 98;
    $explanation = 'L\'IBAN est conforme à la norme ISO et correspond aux règlements historiques enregistrés pour ce fournisseur.';
    $canPay = true;

    if (!empty($previousMatches)) {
        $firstMatch = reset($previousMatches);
        $knownIban = preg_replace('/[\s\-]/', '', $firstMatch['iban']);
        if ($knownIban !== $cleanIban) {
            // ALERTE ROUGE : Changement inattendu de RIB chez un fournisseur connu !
            $verdict = 'CRITICAL_ALTERED_IBAN';
            $severity = 'danger';
            $badge = 'ALERTE : CHANGEMENT DE RIB SUSPECT';
            $score = 15;
            $explanation = "ATTENTION DANGER : Le fournisseur « $supplierName » utilisait précédemment le compte " . substr($knownIban, 0, 8) . "..." . substr($knownIban, -4) . ". L'IBAN sur cette facture est différent. Procédez impérativement à un contre-appel téléphonique avant tout règlement (Risque avéré d'usurpation de RIB).";
            $canPay = false;
        }
    } else {
        // Premier enregistrement pour ce fournisseur
        $verdict = 'FIRST_SEEN_IBAN';
        $severity = 'warning';
        $badge = 'NOUVEAU BÉNÉFICIAIRE';
        $score = 75;
        $explanation = "Premier règlement à destination de ce compte $country. L'IBAN est syntaxiquement valide. Il sera ajouté à votre annuaire sécurisé dès validation.";
        
        // Alerte géographique si fournisseur français avec IBAN exotique
        if (!empty($supplierSiret) && $country !== 'FR' && $country !== 'MC') {
            $verdict = 'SUSPICIOUS_OFFSHORE_IBAN';
            $severity = 'danger';
            $badge = 'IBAN TRANSFRONTALIER SUSPECT';
            $score = 30;
            $explanation = "Alerte de conformité : L'entreprise possède un SIRET français mais fournit un compte bancaire étranger ($country). Risque accru d'intermédiaire frauduleux.";
            $canPay = false;
        }
    }

    // 3. Détection des doublons de facturation
    $isDuplicate = false;
    $duplicateRef = '';
    foreach ($expenses as $exp) {
        if (($exp['company_id'] ?? 1) === $companyId) {
            $sameRef = !empty($invoiceNumber) && !empty($exp['invoice_number']) && strtoupper($exp['invoice_number']) === strtoupper($invoiceNumber);
            $sameAmount = abs(floatval($exp['amount_ttc'] ?? $exp['total_ttc'] ?? 0) - $amountTTC) < 0.01;
            $sameSupplier = !empty($supplierName) && strtolower($exp['supplier'] ?? $exp['merchant'] ?? '') === strtolower($supplierName);

            if (($sameRef && $sameSupplier) || ($sameAmount && $sameSupplier && !empty($invoiceNumber) && $sameRef)) {
                $isDuplicate = true;
                $duplicateRef = $exp['invoice_number'] ?? $exp['id'];
                break;
            }
        }
    }

    echo json_encode([
        'success' => true,
        'iban' => $cleanIban,
        'formattedIban' => chunk_split($cleanIban, 4, ' '),
        'country' => $country,
        'verdict' => $verdict,
        'severity' => $severity,
        'badge' => $badge,
        'score' => $score,
        'explanation' => $explanation,
        'canPay' => $canPay,
        'duplicateDetected' => $isDuplicate,
        'duplicateReference' => $duplicateRef,
        'analyzedAt' => date('c')
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
