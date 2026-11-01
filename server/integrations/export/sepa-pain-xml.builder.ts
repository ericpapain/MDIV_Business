export interface SepaTransfer {
  amount: number;
  creditorName: string;
  creditorIban: string;
}

export interface SepaBatchData {
  batchId: string;
  debtorName: string;
  debtorIban: string;
  debtorBic: string;
  transfers: SepaTransfer[];
}

export function buildSepaPainXml(data: SepaBatchData): { xml: string; totalAmount: number; count: number } {
  const totalAmount = data.transfers.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${data.batchId}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>${data.transfers.length}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <InitgPty><Nm>${data.debtorName}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${data.batchId}-001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <Dbtr><Nm>${data.debtorName}</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>${data.debtorIban}</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BIC>${data.debtorBic}</BIC></FinInstnId></DbtrAgt>
      ${data.transfers.map((t, idx) => `
      <CdtTrfTxInf>
        <PmtId><EndToEndId>${data.batchId}-${idx + 1}</EndToEndId></PmtId>
        <Amt><InstdAmt Ccy="EUR">${Number(t.amount || 0).toFixed(2)}</InstdAmt></Amt>
        <Cdtr><Nm>${t.creditorName || 'Fournisseur'}</Nm></Cdtr>
        <CdtrAcct><Id><IBAN>${t.creditorIban || data.debtorIban}</IBAN></Id></CdtrAcct>
      </CdtTrfTxInf>`).join('')}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;

  return { xml, totalAmount, count: data.transfers.length };
}
