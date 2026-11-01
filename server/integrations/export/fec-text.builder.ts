export interface FecEntry {
  invoices: any[];
  expenses: any[];
}

export function buildFecText(invoicesList: any[], expensesList: any[]): string {
  const fecColumns = [
    'JournalCode\tJournalLib\tEcritureNum\tEcritureDate\tCompteNum\tCompteLib\tCompAuxNum\tCompAuxLib\tPieceRef\tPieceDate\tEcritureLib\tDebit\tCredit\tEcritureLet\tDateLet\tValidDate\tMontantdevise\tIdevise'
  ];
  let ecritureNum = 1;

  for (const inv of invoicesList) {
    const dateStr = (inv.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const ref = inv.invoiceNumber || ('FA-' + inv.id);
    const client = inv.clientName || 'Client';
    const ttc = Number(inv.amountTTC || inv.totalTTC) || 0;
    const ht = Number(inv.amountHT || inv.totalHT || (ttc * 0.8)) || 0;
    const vat = ttc - ht;

    fecColumns.push(`VE\tJournal des Ventes\t${ecritureNum}\t${dateStr}\t411000\tClients\t\t${client}\t${ref}\t${dateStr}\tFacture ${ref}\t${ttc.toFixed(2)}\t0,00\t\t\t${dateStr}\t\tEUR`);
    fecColumns.push(`VE\tJournal des Ventes\t${ecritureNum}\t${dateStr}\t706000\tPrestations de services\t\t\t${ref}\t${dateStr}\tPrestations HT\t0,00\t${ht.toFixed(2)}\t\t\t${dateStr}\t\tEUR`);
    if (vat > 0) {
      fecColumns.push(`VE\tJournal des Ventes\t${ecritureNum}\t${dateStr}\t445710\tTVA Collectee 20%\t\t\t${ref}\t${dateStr}\tTVA Collectee\t0,00\t${vat.toFixed(2)}\t\t\t${dateStr}\t\tEUR`);
    }
    ecritureNum++;
  }

  for (const exp of expensesList) {
    const dateStr = (exp.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const ref = exp.invoice_number || ('REC-' + exp.id);
    const supplier = exp.merchant || 'Fournisseur';
    const ttc = Number(exp.amount_ttc) || 0;
    const ht = Number(exp.amount_ht) || 0;
    const vat = Number(exp.amount_tva) || 0;

    fecColumns.push(`AC\tJournal des Achats\t${ecritureNum}\t${dateStr}\t606000\tAchats & Fournitures\t\t\t${ref}\t${dateStr}\tAchat ${supplier}\t${ht.toFixed(2)}\t0,00\t\t\t${dateStr}\t\tEUR`);
    if (vat > 0) {
      fecColumns.push(`AC\tJournal des Achats\t${ecritureNum}\t${dateStr}\t445660\tTVA Deductible 20%\t\t\t${ref}\t${dateStr}\tTVA Deductible\t${vat.toFixed(2)}\t0,00\t\t\t${dateStr}\t\tEUR`);
    }
    fecColumns.push(`AC\tJournal des Achats\t${ecritureNum}\t${dateStr}\t401000\tFournisseurs\t\t${supplier}\t${ref}\t${dateStr}\tFacture ${supplier}\t0,00\t${ttc.toFixed(2)}\t\t\t${dateStr}\t\tEUR`);
    ecritureNum++;
  }

  return fecColumns.join('\r\n');
}
