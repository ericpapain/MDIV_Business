<?php
// public/api/facturx_generator.php
// Moteur Officiel de Facturation Électronique 2026 (Factur-X / EN 16931 & Statuts PPF / PDP DGFiP)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

function is_valid_luhn_facturx($code) {
    $cleaned = preg_replace('/\s+/', '', (string)$code);
    if (!ctype_digit($cleaned) || strlen($cleaned) === 0) return false;
    $sum = 0;
    $len = strlen($cleaned);
    for ($i = 0; $i < $len; $i++) {
        $digit = intval($cleaned[$len - 1 - $i]);
        if ($i % 2 === 1) {
            $digit *= 2;
            if ($digit > 9) $digit -= 9;
        }
        $sum += $digit;
    }
    return ($sum % 10 === 0);
}

function compute_french_vat_facturx($siren) {
    $cleaned = substr(preg_replace('/\s+/', '', (string)$siren), 0, 9);
    if (strlen($cleaned) !== 9 || !ctype_digit($cleaned)) return '';
    $num = intval($cleaned);
    $key = (12 + 3 * ($num % 97)) % 97;
    $keyStr = ($key < 10) ? '0' . $key : (string)$key;
    return 'FR' . $keyStr . $cleaned;
}

/**
 * Génère le flux XML normalisé Factur-X (Profil Basic / Norme EN 16931)
 */
function generate_facturx_xml($invoice) {
    $invoiceNumber = htmlspecialchars(trim($invoice['invoiceNumber'] ?? ''));
    if (empty($invoiceNumber)) {
        throw new InvalidArgumentException("Le numéro de facture est obligatoire.");
    }

    $buyerName = htmlspecialchars(trim($invoice['clientName'] ?? ''));
    if (empty($buyerName)) {
        throw new InvalidArgumentException("La raison sociale du client acheteur est obligatoire.");
    }

    $buyerSiret = preg_replace('/\s+/', '', trim($invoice['buyerSiret'] ?? ''));
    if (empty($buyerSiret)) {
        throw new InvalidArgumentException("Le SIRET du client acheteur est obligatoire (Norme Facturation 2026).");
    }

    if (!is_valid_luhn_facturx($buyerSiret)) {
        throw new InvalidArgumentException("Le numéro SIRET de l'acheteur est invalide (échec du contrôle de clé de Luhn).");
    }

    $issueDate = date('Ymd', strtotime($invoice['date'] ?? 'now'));
    $dueDate = date('Ymd', strtotime($invoice['dueDate'] ?? '+30 days'));
    
    $sellerName = htmlspecialchars(trim($invoice['sellerName'] ?? 'MDIV Business Solutions SAS'));
    $sellerSiret = preg_replace('/\s+/', '', trim($invoice['sellerSiret'] ?? '92134567800012'));
    $sellerVat = htmlspecialchars(trim($invoice['sellerVat'] ?? compute_french_vat_facturx($sellerSiret)));
    
    $buyerSiren = substr($buyerSiret, 0, 9);
    $buyerVat = htmlspecialchars(trim($invoice['buyerVat'] ?? compute_french_vat_facturx($buyerSiren)));
    $buyerCountry = htmlspecialchars(trim($invoice['buyerCountry'] ?? 'FR'));
    $buyerCity = htmlspecialchars(trim($invoice['buyerCity'] ?? 'Paris'));
    $buyerPostalCode = htmlspecialchars(trim($invoice['buyerPostalCode'] ?? '75000'));
    $buyerAddress = htmlspecialchars(trim($invoice['buyerAddress'] ?? 'Adresse client'));

    $opNature = $invoice['operationNature'] ?? 'services';
    $vatDebit = !empty($invoice['vatPaymentOnDebit']) ? 'Option pour le paiement de la taxe d après les débits' : 'TVA sur les encaissements';
    
    $totalHT = number_format(floatval($invoice['totalHT'] ?? 0), 2, '.', '');
    $totalVAT = number_format(floatval($invoice['totalVAT'] ?? 0), 2, '.', '');
    $totalTTC = number_format(floatval($invoice['totalTTC'] ?? 0), 2, '.', '');
    $lines = $invoice['lines'] ?? [];

    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"' . "\n";
    $xml .= '    xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"' . "\n";
    $xml .= '    xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"' . "\n";
    $xml .= '    xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">' . "\n";

    // Contexte et Profil Factur-X BASIC EN 16931
    $xml .= "  <rsm:ExchangedDocumentContext>\n";
    $xml .= "    <ram:GuidelineSpecifiedDocumentContextParameter>\n";
    $xml .= "      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</ram:ID>\n";
    $xml .= "    </ram:GuidelineSpecifiedDocumentContextParameter>\n";
    $xml .= "  </rsm:ExchangedDocumentContext>\n";

    // En-tête du document
    $xml .= "  <rsm:ExchangedDocument>\n";
    $xml .= "    <ram:ID>$invoiceNumber</ram:ID>\n";
    $xml .= "    <ram:TypeCode>380</ram:TypeCode>\n";
    $xml .= "    <ram:IssueDateTime>\n";
    $xml .= "      <udt:DateTimeString format=\"102\">$issueDate</udt:DateTimeString>\n";
    $xml .= "    </ram:IssueDateTime>\n";
    $xml .= "    <ram:IncludedNote>\n";
    $xml .= "      <ram:Content>Nature : " . ($opNature === 'services' ? 'Prestations de services' : ($opNature === 'goods' ? 'Livraison de biens' : 'Opération mixte')) . " - $vatDebit</ram:Content>\n";
    $xml .= "    </ram:IncludedNote>\n";
    $xml .= "  </rsm:ExchangedDocument>\n";

    // Transaction commerciale
    $xml .= "  <rsm:SupplyChainTradeTransaction>\n";

    // Lignes détaillées d'articles
    $lineIndex = 1;
    foreach ($lines as $line) {
        $desc = htmlspecialchars($line['description'] ?? "Prestation $lineIndex");
        $qty = number_format(floatval($line['quantity'] ?? 1), 4, '.', '');
        $pu = number_format(floatval($line['unitPriceHT'] ?? 0), 2, '.', '');
        $lineHT = number_format(floatval($qty) * floatval($pu), 2, '.', '');
        $vatRate = floatval($line['vatRate'] ?? 20);
        $vatRateFmt = number_format($vatRate, 2, '.', '');
        $catCode = ($vatRate == 0) ? 'E' : 'S';
        $unitCode = htmlspecialchars($line['unitCode'] ?? 'H87');

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
        $xml .= "        <ram:BilledQuantity unitCode=\"$unitCode\">$qty</ram:BilledQuantity>\n";
        $xml .= "      </ram:SpecifiedLineTradeDelivery>\n";
        $xml .= "      <ram:SpecifiedLineTradeSettlement>\n";
        $xml .= "        <ram:ApplicableTradeTax>\n";
        $xml .= "          <ram:TypeCode>VAT</ram:TypeCode>\n";
        $xml .= "          <ram:CategoryCode>$catCode</ram:CategoryCode>\n";
        $xml .= "          <ram:RateApplicablePercent>$vatRateFmt</ram:RateApplicablePercent>\n";
        if ($vatRate == 0 && !empty($line['vatExemptionReason'])) {
            $reason = htmlspecialchars($line['vatExemptionReason']);
            $xml .= "          <ram:ExemptionReason>$reason</ram:ExemptionReason>\n";
        }
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
    $xml .= "          <ram:ID schemeID=\"0009\">" . substr($sellerSiret, 0, 9) . "</ram:ID>\n";
    $xml .= "        </ram:SpecifiedLegalOrganization>\n";
    $xml .= "        <ram:PostalTradeAddress>\n";
    $xml .= "          <ram:PostcodeCode>75008</ram:PostcodeCode>\n";
    $xml .= "          <ram:LineOne>10 Rue de la Paix</ram:LineOne>\n";
    $xml .= "          <ram:CityName>Paris</ram:CityName>\n";
    $xml .= "          <ram:CountryID>FR</ram:CountryID>\n";
    $xml .= "        </ram:PostalTradeAddress>\n";
    $xml .= "        <ram:SpecifiedTaxRegistration>\n";
    $xml .= "          <ram:ID schemeID=\"VA\">$sellerVat</ram:ID>\n";
    $xml .= "        </ram:SpecifiedTaxRegistration>\n";
    $xml .= "      </ram:SellerTradeParty>\n";
    $xml .= "      <ram:BuyerTradeParty>\n";
    $xml .= "        <ram:Name>$buyerName</ram:Name>\n";
    $xml .= "        <ram:SpecifiedLegalOrganization>\n";
    $xml .= "          <ram:ID schemeID=\"0009\">$buyerSiren</ram:ID>\n";
    $xml .= "        </ram:SpecifiedLegalOrganization>\n";
    $xml .= "        <ram:PostalTradeAddress>\n";
    $xml .= "          <ram:PostcodeCode>$buyerPostalCode</ram:PostcodeCode>\n";
    $xml .= "          <ram:LineOne>$buyerAddress</ram:LineOne>\n";
    $xml .= "          <ram:CityName>$buyerCity</ram:CityName>\n";
    $xml .= "          <ram:CountryID>$buyerCountry</ram:CountryID>\n";
    $xml .= "        </ram:PostalTradeAddress>\n";
    $xml .= "        <ram:SpecifiedTaxRegistration>\n";
    $xml .= "          <ram:ID schemeID=\"VA\">$buyerVat</ram:ID>\n";
    $xml .= "        </ram:SpecifiedTaxRegistration>\n";
    $xml .= "      </ram:BuyerTradeParty>\n";
    $xml .= "    </ram:ApplicableHeaderTradeAgreement>\n";

    // Livraison et Échéances
    $xml .= "    <ram:ApplicableHeaderTradeDelivery>\n";
    $xml .= "      <ram:ActualDeliverySupplyChainEvent>\n";
    $xml .= "        <ram:OccurrenceDateTime>\n";
    $xml .= "          <udt:DateTimeString format=\"102\">$issueDate</udt:DateTimeString>\n";
    $xml .= "        </ram:OccurrenceDateTime>\n";
    $xml .= "      </ram:ActualDeliverySupplyChainEvent>\n";
    $xml .= "    </ram:ApplicableHeaderTradeDelivery>\n";

    // Règlements et Totaux
    $xml .= "    <ram:ApplicableHeaderTradeSettlement>\n";
    $xml .= "      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>\n";
    $xml .= "      <ram:SpecifiedTradeSettlementPaymentMeans>\n";
    $xml .= "        <ram:TypeCode>42</ram:TypeCode>\n";
    $xml .= "        <ram:Information>Virement SEPA</ram:Information>\n";
    $xml .= "      </ram:SpecifiedTradeSettlementPaymentMeans>\n";
    $xml .= "      <ram:ApplicableTradeTax>\n";
    $xml .= "        <ram:CalculatedAmount>$totalVAT</ram:CalculatedAmount>\n";
    $xml .= "        <ram:TypeCode>VAT</ram:TypeCode>\n";
    $xml .= "        <ram:BasisAmount>$totalHT</ram:BasisAmount>\n";
    $xml .= "        <ram:CategoryCode>" . (floatval($totalVAT) == 0 ? "E" : "S") . "</ram:CategoryCode>\n";
    $xml .= "        <ram:RateApplicablePercent>" . (floatval($totalHT) > 0 ? number_format((floatval($totalVAT) / floatval($totalHT)) * 100, 2, '.', '') : '0.00') . "</ram:RateApplicablePercent>\n";
    if (floatval($totalVAT) == 0) {
        foreach ($lines as $l) {
            if (!empty($l['vatExemptionReason'])) {
                $xml .= "        <ram:ExemptionReason>" . htmlspecialchars($l['vatExemptionReason']) . "</ram:ExemptionReason>\n";
                break;
            }
        }
    }
    $xml .= "      </ram:ApplicableTradeTax>\n";
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

try {
    $action = $_GET['action'] ?? 'generate';

    if ($action === 'download_xml') {
        $invNum = trim($_GET['invoiceNumber'] ?? '');
        $invoiceData = json_decode(file_get_contents('php://input'), true) ?: $_GET;
        $xml = generate_facturx_xml($invoiceData);
        $filename = 'FacturX_' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $invNum ?: 'FA') . '.xml';
        
        header('Content-Type: application/xml; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo $xml;
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $invoiceNumber = trim($input['invoiceNumber'] ?? '');
    if (empty($invoiceNumber)) {
        http_response_code(400);
        echo json_encode(['error' => 'Numéro de facture obligatoire']);
        exit;
    }

    $xmlContent = generate_facturx_xml($input);
    $sha256Hash = hash('sha256', $xmlContent);

    // Sauvegarde de l'audit PAF
    $dbPath = __DIR__ . '/../../dev_db.json';
    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
    if (!isset($db['pafAuditTrail'])) $db['pafAuditTrail'] = [];

    $currentStatus = $input['pdp_status'] ?? 'DEPOSITED';
    $auditEntry = [
        'invoiceNumber' => $invoiceNumber,
        'status' => $currentStatus,
        'sha256_hash' => $sha256Hash,
        'pdpOperator' => 'PDP n° 0039 (Crédit Agricole / LCL)',
        'profile' => 'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic',
        'timestamp' => date('c'),
        'xmlSize' => strlen($xmlContent)
    ];

    $db['pafAuditTrail'][] = $auditEntry;
    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'invoiceNumber' => $invoiceNumber,
        'pdpStatus' => $currentStatus,
        'sha256_hash' => $sha256Hash,
        'audit' => $auditEntry,
        'xmlLength' => strlen($xmlContent),
        'xmlPreview' => substr($xmlContent, 0, 1200) . "\n...",
        'downloadUrl' => 'api/facturx_generator.php?action=download_xml&invoiceNumber=' . urlencode($invoiceNumber)
    ], JSON_UNESCAPED_UNICODE);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
