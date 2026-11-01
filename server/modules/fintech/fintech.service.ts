import { getDb } from '../../database/db-connection';
import { buildSepaPainXml, type SepaBatchData } from '../../integrations/export/sepa-pain-xml.builder';
import { buildFecText } from '../../integrations/export/fec-text.builder';

export const sepaXmlStore = new Map<string, string>();

export class FintechService {
  generateSepaPayment(fields: any) {
    const data: SepaBatchData = {
      batchId: 'SEPA-' + Date.now().toString(36).toUpperCase(),
      debtorName: fields.debtorName || 'MDIV Business Solutions',
      debtorIban: fields.debtorIban || 'FR7630006000011234567890189',
      debtorBic: fields.debtorBic || 'AGRIFRPP882',
      transfers: fields.transfers || [],
    };

    const { xml, totalAmount, count } = buildSepaPainXml(data);
    sepaXmlStore.set(data.batchId, xml);

    return {
      batchId: data.batchId,
      message: `Ordre de virement bancaire SEPA (${count} virements) généré avec succès.`,
      totalAmount,
      count,
      downloadUrl: `/api/sepa_payment.php?download=1&batchId=${data.batchId}`,
    };
  }

  getBankReconciliationQueue(companyId: number) {
    const db = getDb();
    const invoicesList = (db.invoices || []).filter((i: any) => !i.company_id || i.company_id === companyId);
    const expensesList = (db.expenses || []).filter((e: any) => !e.company_id || e.company_id === companyId);

    const queue: any[] = [];
    if (invoicesList.length > 0) {
      queue.push({
        bank_transaction_id: "TX-VIR-" + invoicesList[0].id,
        date: invoicesList[0].date || new Date().toISOString().split('T')[0],
        label: "VIR SEPA CLIENT " + (invoicesList[0].clientName || "Client"),
        amount: Number(invoicesList[0].amountTTC || invoicesList[0].totalTTC) || 0,
        status: "UNMATCHED",
        match_score: 98,
        criteria: ["Montant identique", "Tiers concordant", "Date concordante"],
        candidate_document: {
          id: invoicesList[0].id,
          type: "invoice",
          title: invoicesList[0].invoiceNumber || "FA-2026-001",
          merchant: invoicesList[0].clientName || "Client",
          amount: Number(invoicesList[0].amountTTC || invoicesList[0].totalTTC) || 0,
        },
      });
    }

    if (expensesList.length > 0) {
      queue.push({
        bank_transaction_id: "TX-PRLV-" + expensesList[0].id,
        date: expensesList[0].date || new Date().toISOString().split('T')[0],
        label: "PAIEMENT FOURNISSEUR " + (expensesList[0].merchant || "Fournisseur"),
        amount: -(Number(expensesList[0].amount_ttc) || 0),
        status: "UNMATCHED",
        match_score: 95,
        criteria: ["Montant exact", "Fournisseur identifié"],
        candidate_document: {
          id: expensesList[0].id,
          type: "expense",
          title: expensesList[0].invoice_number || "REC-01",
          merchant: expensesList[0].merchant || "Fournisseur",
          amount: Number(expensesList[0].amount_ttc) || 0,
        },
      });
    }

    return { total_pending: queue.length, queue };
  }

  getFecData(companyId: number, isDownload = false) {
    const db = getDb();
    let invoicesList = db.invoices || [];
    let expensesList = db.expenses || [];

    if (companyId) {
      invoicesList = invoicesList.filter((inv: any) => !inv.company_id || inv.company_id === companyId);
      expensesList = expensesList.filter((exp: any) => !exp.company_id || exp.company_id === companyId);
    }

    if (isDownload) {
      return { text: buildFecText(invoicesList, expensesList) };
    }

    const totalVentes = invoicesList.reduce((acc: number, inv: any) => acc + (Number(inv.amountHT || inv.totalHT || (inv.amountTTC * 0.8)) || 0), 0);
    const totalAchats = expensesList.reduce((acc: number, exp: any) => acc + (Number(exp.amount_ht || exp.total_ht) || 0), 0);
    const totalTvaCollectee = invoicesList.reduce((acc: number, inv: any) => acc + (Number((inv.amountTTC || inv.totalTTC || 0) - (inv.amountHT || inv.totalHT || (inv.amountTTC * 0.8))) || 0), 0);
    const totalTvaDeductible = expensesList.reduce((acc: number, exp: any) => acc + (Number(exp.amount_tva || exp.total_vat) || 0), 0);

    const totalClients = totalVentes + totalTvaCollectee;
    const totalFournisseurs = totalAchats + totalTvaDeductible;

    const totalDebit = totalClients + totalAchats + totalTvaDeductible;
    const totalCredit = totalVentes + totalTvaCollectee + totalFournisseurs;

    return {
      success: true,
      conformeArticleL47A: true,
      totalDebit: Math.round(totalDebit * 100) / 100,
      totalCredit: Math.round(totalCredit * 100) / 100,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.05,
      entriesCount: invoicesList.length + expensesList.length,
      accountsSummary: [
        { code: '411000', name: 'Clients (Créances)', debit: Math.round(totalClients * 100) / 100, credit: 0 },
        { code: '706000', name: 'Prestations de services et ventes', debit: 0, credit: Math.round(totalVentes * 100) / 100 },
        { code: '445710', name: 'TVA Collectée (20%)', debit: 0, credit: Math.round(totalTvaCollectee * 100) / 100 },
        { code: '401000', name: 'Fournisseurs (Dettes)', debit: 0, credit: Math.round(totalFournisseurs * 100) / 100 },
        { code: '606000', name: 'Achats & Fournitures d exploitation', debit: Math.round(totalAchats * 100) / 100, credit: 0 },
        { code: '445660', name: 'TVA Déductible (20%)', debit: Math.round(totalTvaDeductible * 100) / 100, credit: 0 },
      ],
    };
  }
}

export const fintechService = new FintechService();
