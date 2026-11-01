import { sha256Hash } from '../../shared/utils/crypto.utils';

export interface FacturXInvoiceData {
  invoiceNumber: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  sellerName: string;
  sellerSiret: string;
  sellerVat: string;
  sellerAddress?: string;
  sellerCity?: string;
  sellerPostalCode?: string;
  clientName: string;
  buyerSiret?: string;
  buyerVat?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerPostalCode?: string;
  buyerCountry?: string;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  lines: Array<{
    description: string;
    quantity: number;
    unitPriceHT: number;
    unitCode?: string;
    vatRate?: number;
    vatExemptionReason?: string;
  }>;
  opNature?: 'services' | 'goods' | 'mixed';
  vatPaymentOnDebit?: string;
}

export function buildFacturXXml(data: FacturXInvoiceData): { xml: string; hash: string } {
  const opNature = data.opNature || 'services';
  const vatPayment = data.vatPaymentOnDebit || 'TVA sur les encaissements';
  const issueDateFormatted = data.issueDate.replace(/-/g, '');
  const dueDateFormatted = data.dueDate.replace(/-/g, '');
  const sellerSiret9 = (data.sellerSiret || '000000000').replace(/\s+/g, '').slice(0, 9);
  const buyerSiret9 = (data.buyerSiret || '000000000').replace(/\s+/g, '').slice(0, 9);

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${data.invoiceNumber}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${issueDateFormatted}</udt:DateTimeString>
    </ram:IssueDateTime>
    <ram:IncludedNote>
      <ram:Content>Nature de l opération : ${opNature === 'services' ? 'Prestations de services' : (opNature === 'goods' ? 'Livraison de biens' : 'Opération mixte')} - ${vatPayment}</ram:Content>
    </ram:IncludedNote>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    ${data.lines.map((line, idx) => {
      const vRate = line.vatRate !== undefined && !isNaN(Number(line.vatRate)) ? Number(line.vatRate) : 20;
      const isExempt = vRate === 0;
      const lineHT = (Number(line.quantity || 1) * Number(line.unitPriceHT || 0)).toFixed(2);
      return `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${idx + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${(line.description || 'Prestation').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${Number(line.unitPriceHT || 0).toFixed(2)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="${line.unitCode || 'H87'}">${Number(line.quantity || 1).toFixed(4)}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${isExempt ? 'E' : 'S'}</ram:CategoryCode>
          <ram:RateApplicablePercent>${vRate.toFixed(2)}</ram:RateApplicablePercent>
          ${isExempt && line.vatExemptionReason ? `<ram:ExemptionReason>${line.vatExemptionReason.replace(/&/g, '&amp;')}</ram:ExemptionReason>` : ''}
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${lineHT}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
    }).join('')}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${(data.sellerName || 'MDIV Business').replace(/&/g, '&amp;')}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0009">${sellerSiret9}</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${data.sellerPostalCode || '75008'}</ram:PostcodeCode>
          <ram:LineOne>${(data.sellerAddress || '10 Rue de la Paix').replace(/&/g, '&amp;')}</ram:LineOne>
          <ram:CityName>${(data.sellerCity || 'Paris').replace(/&/g, '&amp;')}</ram:CityName>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${data.sellerVat || 'FR00000000000'}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${(data.clientName || 'Client').replace(/&/g, '&amp;')}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0009">${buyerSiret9}</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${data.buyerPostalCode || '75000'}</ram:PostcodeCode>
          <ram:LineOne>${(data.buyerAddress || 'Adresse client').replace(/&/g, '&amp;')}</ram:LineOne>
          <ram:CityName>${(data.buyerCity || 'Paris').replace(/&/g, '&amp;')}</ram:CityName>
          <ram:CountryID>${data.buyerCountry || 'FR'}</CountryID>
        </ram:PostalTradeAddress>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${data.buyerVat || 'FR00000000000'}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${issueDateFormatted}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>42</ram:TypeCode>
        <ram:Information>Virement bancaire SEPA</ram:Information>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${data.totalVAT.toFixed(2)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${data.totalHT.toFixed(2)}</ram:BasisAmount>
        <ram:CategoryCode>${data.totalVAT === 0 ? 'E' : 'S'}</ram:CategoryCode>
        <ram:RateApplicablePercent>${data.totalHT > 0 ? ((data.totalVAT / data.totalHT) * 100).toFixed(2) : '0.00'}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${dueDateFormatted}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${data.totalHT.toFixed(2)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${data.totalHT.toFixed(2)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${data.totalVAT.toFixed(2)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${data.totalTTC.toFixed(2)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${data.totalTTC.toFixed(2)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;

  const hash = sha256Hash(xmlContent);
  return { xml: xmlContent, hash };
}
