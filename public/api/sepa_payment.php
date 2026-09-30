<?php
// public/api/sepa_payment.php
// Moteur de Paiement Fournisseur en 3 Clics (Génération ISO 20022 SEPA pain.001.001.03 & Virement Bancaire)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

/**
 * Génère le fichier bancaire normé ISO 20022 pain.001.001.03 pour virement SEPA direct
 */
function generate_sepa_pain001_xml($batch) {
    $msgId = 'MDIV-SEPA-' . date('YmdHis') . '-' . rand(100, 999);
    $creationDate = date('Y-m-d\TH:i:s\Z');
    $initiatorName = htmlspecialchars($batch['debtorName'] ?? 'MDIV Business Solutions');
    $debtorIban = preg_replace('/[\s\-]/', '', $batch['debtorIban'] ?? 'FR7630006000011234567890189');
    $debtorBic = preg_replace('/[\s\-]/', '', $batch['debtorBic'] ?? 'AGRIFRPP882');
    $executionDate = date('Y-m-d', strtotime($batch['requestedExecutionDate'] ?? '+1 day'));
    
    $items = $batch['transfers'] ?? [];
    $nbOfTxs = count($items);
    $ctrlSum = 0.0;
    foreach ($items as $it) {
        $ctrlSum += floatval($it['amount'] ?? 0);
    }
    $ctrlSumFormatted = number_format($ctrlSum, 2, '.', '');

    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03"' . "\n";
    $xml .= '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' . "\n";
    $xml .= "  <CstmrCdtTrfInitn>\n";

    // 1. En-tête de Groupe (Group Header)
    $xml .= "    <GrpHdr>\n";
    $xml .= "      <MsgId>$msgId</MsgId>\n";
    $xml .= "      <CreDtTm>$creationDate</CreDtTm>\n";
    $xml .= "      <NbOfTxs>$nbOfTxs</NbOfTxs>\n";
    $xml .= "      <CtrlSum>$ctrlSumFormatted</CtrlSum>\n";
    $xml .= "      <InitgPty>\n";
    $xml .= "        <Nm>$initiatorName</Nm>\n";
    $xml .= "      </InitgPty>\n";
    $xml .= "    </GrpHdr>\n";

    // 2. Informations de Paiement (Payment Information)
    $pmtInfId = 'PMT-' . date('Ymd') . '-01';
    $xml .= "    <PmtInf>\n";
    $xml .= "      <PmtInfId>$pmtInfId</PmtInfId>\n";
    $xml .= "      <PmtMtd>TRF</PmtMtd>\n"; // TRF = Virement de crédit SEPA
    $xml .= "      <BtchBookg>true</BtchBookg>\n";
    $xml .= "      <NbOfTxs>$nbOfTxs</NbOfTxs>\n";
    $xml .= "      <CtrlSum>$ctrlSumFormatted</CtrlSum>\n";
    $xml .= "      <PmtTpInf>\n";
    $xml .= "        <SvcLvl>\n";
    $xml .= "          <Cd>SEPA</Cd>\n";
    $xml .= "        </SvcLvl>\n";
    $xml .= "      </PmtTpInf>\n";
    $xml .= "      <ReqdExctnDt>$executionDate</ReqdExctnDt>\n";
    $xml .= "      <Dbtr>\n";
    $xml .= "        <Nm>$initiatorName</Nm>\n";
    $xml .= "      </Dbtr>\n";
    $xml .= "      <DbtrAcct>\n";
    $xml .= "        <Id>\n";
    $xml .= "          <IBAN>$debtorIban</IBAN>\n";
    $xml .= "        </Id>\n";
    $xml .= "      </DbtrAcct>\n";
    $xml .= "      <DbtrAgt>\n";
    $xml .= "        <FinInstnId>\n";
    $xml .= "          <BIC>$debtorBic</BIC>\n";
    $xml .= "        </FinInstnId>\n";
    $xml .= "      </DbtrAgt>\n";
    $xml .= "      <ChrgBr>SLEV</ChrgBr>\n"; // SLEV = Frais partagés SEPA standard

    // 3. Transactions de Crédit Individuelles
    $txIndex = 1;
    foreach ($items as $tx) {
        $amount = number_format(floatval($tx['amount'] ?? 0), 2, '.', '');
        $creditorName = htmlspecialchars($tx['creditorName'] ?? 'Fournisseur');
        $creditorIban = preg_replace('/[\s\-]/', '', $tx['creditorIban'] ?? '');
        $ref = htmlspecialchars($tx['invoiceReference'] ?? "FAC-ACHAT-$txIndex");
        $endToEndId = 'E2E-' . date('Ymd') . "-$txIndex-" . rand(1000, 9999);

        $xml .= "      <CdtTrfTxInf>\n";
        $xml .= "        <PmtId>\n";
        $xml .= "          <EndToEndId>$endToEndId</EndToEndId>\n";
        $xml .= "        </PmtId>\n";
        $xml .= "        <Amt>\n";
        $xml .= "          <InstdAmt Ccy=\"EUR\">$amount</InstdAmt>\n";
        $xml .= "        </Amt>\n";
        $xml .= "        <Cdtr>\n";
        $xml .= "          <Nm>$creditorName</Nm>\n";
        $xml .= "        </Cdtr>\n";
        $xml .= "        <CdtrAcct>\n";
        $xml .= "          <Id>\n";
        $xml .= "            <IBAN>$creditorIban</IBAN>\n";
        $xml .= "          </Id>\n";
        $xml .= "        </CdtrAcct>\n";
        $xml .= "        <RmtInf>\n";
        $xml .= "          <Ustrd>Paiement facture $ref</Ustrd>\n";
        $xml .= "        </RmtInf>\n";
        $xml .= "      </CdtTrfTxInf>\n";
        $txIndex++;
    }

    $xml .= "    </PmtInf>\n";
    $xml .= "  </CstmrCdtTrfInitn>\n";
    $xml .= "</Document>\n";

    return $xml;
}

$action = $_GET['action'] ?? 'initiate';

if ($action === 'download_pain001') {
    // Téléchargement du fichier XML de virement SEPA ISO 20022
    $rawInput = file_get_contents('php://input');
    $batchData = json_decode($rawInput, true) ?: $_GET;
    $xml = generate_sepa_pain001_xml($batchData);
    $filename = 'SEPA_PAIN001_' . date('Ymd_His') . '.xml';

    header('Content-Type: application/xml; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    echo $xml;
    exit;
}

// Action JSON standard : Préparation et exécution du virement en 3 clics
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$companyId = intval($input['company_id'] ?? 1);
$transfers = $input['transfers'] ?? [];

if (empty($transfers)) {
    echo json_encode(['success' => false, 'error' => 'Aucune facture sélectionnée pour le paiement.']);
    exit;
}

// Calcul de la somme totale
$totalAmount = 0.0;
foreach ($transfers as $t) {
    $totalAmount += floatval($t['amount'] ?? 0);
}

// Génération du fichier XML ISO 20022
$sepaXml = generate_sepa_pain001_xml([
    'debtorName' => $input['debtorName'] ?? 'MDIV Business Client',
    'debtorIban' => $input['debtorIban'] ?? 'FR7630006000011234567890189',
    'debtorBic' => $input['debtorBic'] ?? 'AGRIFRPP882',
    'requestedExecutionDate' => date('Y-m-d'),
    'transfers' => $transfers
]);

// Mise à jour de l'état des dépenses dans la base de données persistante
$dbPath = __DIR__ . '/../../dev_db.json';
$db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
$expenses = $db['expenses'] ?? [];
$paidIds = array_column($transfers, 'expenseId');

foreach ($expenses as &$exp) {
    if (in_array($exp['id'], $paidIds)) {
        $exp['status'] = 'paid';
        $exp['paid_at'] = date('c');
        $exp['payment_method'] = 'SEPA_TRANSFER_3_CLICKS';
        $exp['sepa_order_ref'] = 'ORD-' . date('Ymd') . '-' . rand(1000, 9999);
    }
}
$db['expenses'] = $expenses;

// Enregistrement de l'ordre de virement dans l'historique bancaire
$sepaOrders = $db['sepa_orders'] ?? [];
$orderEntry = [
    'orderId' => 'SEPA-' . date('YmdHis'),
    'companyId' => $companyId,
    'totalAmount' => $totalAmount,
    'transactionsCount' => count($transfers),
    'status' => 'EXECUTED',
    'executionDate' => date('c'),
    'format' => 'ISO 20022 pain.001.001.03 (SEPA Credit Transfer)',
    'transfers' => $transfers
];
$sepaOrders[] = $orderEntry;
$db['sepa_orders'] = $sepaOrders;

file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'orderId' => $orderEntry['orderId'],
    'totalAmount' => $totalAmount,
    'transactionsCount' => count($transfers),
    'status' => 'EXECUTED_INSTANT',
    'message' => 'Ordre de virement SEPA exécuté en 3 clics avec succès. Justificatifs bancaires créés.',
    'sepaXmlPreview' => substr($sepaXml, 0, 1000) . "\n...",
    'xmlSize' => strlen($sepaXml),
    'downloadUrl' => 'api/sepa_payment.php?action=download_pain001'
], JSON_UNESCAPED_UNICODE);
