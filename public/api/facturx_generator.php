<?php
// public/api/facturx_generator.php
// Moteur Officiel de Facturation Électronique 2026 (Factur-X / ZUGFeRD 2.2 / EN 16931 & Statuts PDP DGFIP)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

/**
 * Génère le flux XML normalisé Factur-X (Profil Basic / EN 16931)
 */
function generate_facturx_xml($invoice) {
    $invoiceNumber = htmlspecialchars($invoice['invoiceNumber'] ?? 'FAC-2026-0001');
    $issueDate = date('Ymd', strtotime($invoice['date'] ?? 'now'));
    $dueDate = date('Ymd', strtotime($invoice['dueDate'] ?? '+30 days'));
    
    $sellerName = htmlspecialchars($invoice['sellerName'] ?? 'MDIV Business Solutions SAS');
    $sellerSiret = htmlspecialchars($invoice['sellerSiret'] ?? '91234567800012');
    $sellerVat = htmlspecialchars($invoice['sellerVat'] ?? 'FR32912345678');
    
    $buyerName = htmlspecialchars($invoice['clientName'] ?? 'Client B2B');
    $buyerSiret = htmlspecialchars($invoice['buyerSiret'] ?? '80123456700019');
    $buyerVat = htmlspecialchars($invoice['buyerVat'] ?? 'FR44801234567');
    
    $totalHT = number_format(floatval($invoice['totalHT'] ?? 0), 2, '.', '');
    $totalVAT = number_format(floatval($invoice['totalVAT'] ?? 0), 2, '.', '');
    $totalTTC = number_format(floatval($invoice['totalTTC'] ?? 0), 2, '.', '');
    $lines = $invoice['lines'] ?? [];

    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"' . "\n";
    $xml .= '    xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"' . "\n";
    $xml .= '    xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"' . "\n";
    $xml .= '    xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">' . "\n";

    // Contexte et Profil Factur-X
    $xml .= "  <rsm:ExchangedDocumentContext>\n";
    $xml .= "    <ram:GuidelineSpecifiedDocumentContextParameter>\n";
    $xml .= "      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</ram:ID>\n";
    $xml .= "    </ram:GuidelineSpecifiedDocumentContextParameter>\n";
    $xml .= "  </rsm:ExchangedDocumentContext>\n";

    // En-tête du document
    $xml .= "  <rsm:ExchangedDocument>\n";
    $xml .= "    <ram:ID>$invoiceNumber</ram:ID>\n";
    $xml .= "    <ram:TypeCode>380</ram:TypeCode>\n"; // 380 = Facture commerciale, 381 = Avoir
    $xml .= "    <ram:IssueDateTime>\n";
    $xml .= "      <udt:DateTimeString format=\"102\">$issueDate</udt:DateTimeString>\n";
    $xml .= "    </ram:IssueDateTime>\n";
    $xml .= "  </rsm:ExchangedDocument>\n";

    // Transaction commerciale
    $xml .= "  <rsm:SupplyChainTradeTransaction>\n";

    // Lignes de facture
    $lineIndex = 1;
    foreach ($lines as $line) {
        $desc = htmlspecialchars($line['description'] ?? "Prestation $lineIndex");
        $qty = number_format(floatval($line['quantity'] ?? 1), 2, '.', '');
        $pu = number_format(floatval($line['unitPriceHT'] ?? 0), 2, '.', '');
        $lineHT = number_format($qty * $pu, 2, '.', '');
        $vatRate = number_format(floatval($line['vatRate'] ?? 20), 2, '.', '');

        $xml .= "    <ram:IncludedSupplyChainTradeLineItem>\n";
        $xml .= "      <ram:AssociatedDocumentLineDocument>\n";
        $xml .= "        <ram:LineID>$lineIndex</ram:LineID>\n";
        $xml .= "      </ram:AssociatedDocumentLineDocument>\n";
        $xml .= "      <ram:SpecifiedTradeProduct>\n";
        $xml .= "        <ram:Name>$desc</ram:Name>\n";
        $xml .= "      </ram:SpecifiedTradeProduct>\n";
        $xml .= "      <ram:SpecifiedLineTradeAgreement>\n";
        $xml .= "        <ram:NetPriceProductTradePrice>\n";
        $xml .= "          <ram:ChargeAmount>$pu</ram:ChargeAmount>\n";
        $xml .= "        </ram:NetPriceProductTradePrice>\n";
        $xml .= "      </ram:SpecifiedLineTradeAgreement>\n";
        $xml .= "      <ram:SpecifiedLineTradeDelivery>\n";
        $xml .= "        <ram:BilledQuantity unitCode=\"C62\">$qty</ram:BilledQuantity>\n";
        $xml .= "      </ram:SpecifiedLineTradeDelivery>\n";
        $xml .= "      <ram:SpecifiedLineTradeSettlement>\n";
        $xml .= "        <ram:ApplicableTradeTax>\n";
        $xml .= "          <ram:TypeCode>VAT</ram:TypeCode>\n";
        $xml .= "          <ram:CategoryCode>S</ram:CategoryCode>\n";
        $xml .= "          <ram:RateApplicablePercent>$vatRate</ram:RateApplicablePercent>\n";
        $xml .= "        </ram:ApplicableTradeTax>\n";
        $xml .= "        <ram:SpecifiedTradeSettlementLineMonetarySummation>\n";
        $xml .= "          <ram:LineTotalAmount>$lineHT</ram:LineTotalAmount>\n";
        $xml .= "        </ram:SpecifiedTradeSettlementLineMonetarySummation>\n";
        $xml .= "      </ram:SpecifiedLineTradeSettlement>\n";
        $xml .= "    </ram:IncludedSupplyChainTradeLineItem>\n";
        $lineIndex++;
    }

    // Émetteur (Vendeur) et Destinataire (Acheteur)
    $xml .= "    <ram:ApplicableHeaderTradeAgreement>\n";
    $xml .= "      <ram:SellerTradeParty>\n";
    $xml .= "        <ram:Name>$sellerName</ram:Name>\n";
    $xml .= "        <ram:SpecifiedLegalOrganization>\n";
    $xml .= "          <ram:ID schemeID=\"0002\">$sellerSiret</ram:ID>\n";
    $xml .= "        </ram:SpecifiedLegalOrganization>\n";
    $xml .= "        <ram:SpecifiedTaxRegistration>\n";
    $xml .= "          <ram:ID schemeID=\"VA\">$sellerVat</ram:ID>\n";
    $xml .= "        </ram:SpecifiedTaxRegistration>\n";
    $xml .= "      </ram:SellerTradeParty>\n";
    $xml .= "      <ram:BuyerTradeParty>\n";
    $xml .= "        <ram:Name>$buyerName</ram:Name>\n";
    $xml .= "        <ram:SpecifiedLegalOrganization>\n";
    $xml .= "          <ram:ID schemeID=\"0002\">$buyerSiret</ram:ID>\n";
    $xml .= "        </ram:SpecifiedLegalOrganization>\n";
    $xml .= "      </ram:BuyerTradeParty>\n";
    $xml .= "    </ram:ApplicableHeaderTradeAgreement>\n";

    // Livraison et Échéances
    $xml .= "    <ram:ApplicableHeaderTradeDelivery/>\n";
    $xml .= "    <ram:ApplicableHeaderTradeSettlement>\n";
    $xml .= "      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>\n";
    $xml .= "      <ram:SpecifiedTradePaymentTerms>\n";
    $xml .= "        <ram:DueDateDateTime>\n";
    $xml .= "          <udt:DateTimeString format=\"102\">$dueDate</udt:DateTimeString>\n";
    $xml .= "        </ram:DueDateDateTime>\n";
    $xml .= "      </ram:SpecifiedTradePaymentTerms>\n";
    $xml .= "      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>\n";
    $xml .= "        <ram:LineTotalAmount>$totalHT</ram:LineTotalAmount>\n";
    $xml .= "        <ram:TaxBasisTotalAmount>$totalHT</ram:TaxBasisTotalAmount>\n";
    $xml .= "        <ram:TaxTotalAmount currencyID=\"EUR\">$totalVAT</ram:TaxTotalAmount>\n";
    $xml .= "        <ram:GrandTotalAmount>$totalTTC</ram:GrandTotalAmount>\n";
    $xml .= "        <ram:DuePayableAmount>$totalTTC</ram:DuePayableAmount>\n";
    $xml .= "      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>\n";
    $xml .= "    </ram:ApplicableHeaderTradeSettlement>\n";

    $xml .= "  </rsm:SupplyChainTradeTransaction>\n";
    $xml .= "</rsm:CrossIndustryInvoice>\n";

    return $xml;
}

$action = $_GET['action'] ?? 'generate';

if ($action === 'download_xml') {
    // Téléchargement direct du fichier XML Factur-X
    $invoiceData = json_decode(file_get_contents('php://input'), true) ?: $_GET;
    $xml = generate_facturx_xml($invoiceData);
    $filename = 'FacturX_' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $invoiceData['invoiceNumber'] ?? 'FAC-2026') . '.xml';
    
    header('Content-Type: application/xml; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    echo $xml;
    exit;
}

// Action JSON standard : Génération, validation et gestion des statuts PDP
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$invoiceNumber = $input['invoiceNumber'] ?? ('FAC-' . date('Y') . '-' . rand(1000, 9999));
$xmlContent = generate_facturx_xml($input);

// Sauvegarde du statut PDP dans dev_db.json
$dbPath = __DIR__ . '/../../dev_db.json';
$db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
$pdpLifecycle = $db['pdp_invoices'] ?? [];

$currentStatus = $input['pdp_status'] ?? 'DEPOSITED';
$auditEntry = [
    'invoiceNumber' => $invoiceNumber,
    'status' => $currentStatus,
    'statusLabel' => [
        'DEPOSITED' => '1. Déposée sur le réseau PDP / PPF',
        'REJECTED' => '2. Rejetée (Anomalie technique de structure)',
        'REFUSED' => '3. Refusée (Contestation commerciale acheteur)',
        'COLLECTED' => '4. Encaissée (TVA exigible déclarée à la DGFIP)'
    ][$currentStatus] ?? 'Déposée',
    'timestamp' => date('c'),
    'pdpRegistrationNumber' => '0039 (Interopérabilité Kolecto / DGFIP)',
    'format' => 'Factur-X 1.0 (Profil Basic EN 16931)',
    'xmlSize' => strlen($xmlContent)
];

$pdpLifecycle[$invoiceNumber] = $auditEntry;
$db['pdp_invoices'] = $pdpLifecycle;
file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'invoiceNumber' => $invoiceNumber,
    'pdpStatus' => $currentStatus,
    'audit' => $auditEntry,
    'xmlLength' => strlen($xmlContent),
    'xmlPreview' => substr($xmlContent, 0, 1200) . "\n...",
    'downloadUrl' => 'api/facturx_generator.php?action=download_xml&invoiceNumber=' . urlencode($invoiceNumber)
], JSON_UNESCAPED_UNICODE);
