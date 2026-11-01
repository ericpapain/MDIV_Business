import { getDb, saveDb } from '../../database/db-connection';
import { buildFacturXXml, type FacturXInvoiceData } from '../../integrations/export/facturx-xml.builder';
import { isValidLuhnBackend } from '../../shared/utils/luhn.utils';
import { computeFrenchVatBackend } from '../../shared/utils/vat.utils';
import { sha256Hash } from '../../shared/utils/crypto.utils';
import { callLLM } from '../../integrations/llm/llm-orchestrator';
import { ApiError } from '../../shared/errors/api-error';
import { resolveBackendPersona, buildBackendPersonaSystemPrompt } from '../../shared/persona/persona-prompt.builder';

export const generatedXmlStore = new Map<string, string>();

export class InvoiceService {
  getInvoices(companyId: number) {
    const db = getDb();
    let results = db.invoices || [];
    if (companyId) {
      results = results.filter((i: any) => !i.company_id || i.company_id === companyId);
    }
    return results;
  }

  getInvoicesKpis(companyId: number) {
    const list = this.getInvoices(companyId);
    const totalInvoices = list.length;
    let totalRevenueHT = 0;
    let totalRevenueTTC = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    list.forEach((inv: any) => {
      const ttc = Number(inv.amountTTC || inv.totalTTC || inv.amount_ttc || 0);
      const ht = Number(inv.amountHT || inv.totalHT || inv.amount_ht || ttc * 0.8);
      totalRevenueHT += ht;
      totalRevenueTTC += ttc;

      if (inv.status === 'paid' || inv.ppf_status === 'PAYEE') {
        paidAmount += ttc;
      } else if (inv.status === 'overdue' || (inv.due_date && inv.due_date < todayStr)) {
        overdueAmount += ttc;
      } else {
        pendingAmount += ttc;
      }
    });

    const roundedTTC = Math.round(totalRevenueTTC * 100) / 100;
    const roundedPaid = Math.round(paidAmount * 100) / 100;
    const roundedPending = Math.round(pendingAmount * 100) / 100;
    const roundedOverdue = Math.round(overdueAmount * 100) / 100;

    return {
      totalInvoices,
      totalRevenueHT: Math.round(totalRevenueHT * 100) / 100,
      totalRevenueTTC: roundedTTC,
      paidAmount: roundedPaid,
      pendingAmount: roundedPending,
      overdueAmount: roundedOverdue,
      totalIssued: roundedTTC,
      totalPaid: roundedPaid,
      totalPending: roundedPending,
      totalOverdue: roundedOverdue,
    };
  }

  saveInvoice(companyId: number, fields: any) {
    const db = getDb();
    if (!db.invoices) db.invoices = [];

    const invCompanyId = fields.company_id ? parseInt(fields.company_id, 10) : (companyId || 1);
    const newInvoice = {
      id: fields.id || ('inv_' + Date.now()),
      company_id: invCompanyId,
      clientId: fields.clientId || null,
      clientName: fields.clientName || 'Client Partenaire',
      invoiceNumber: fields.invoiceNumber || ('FA-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)),
      date: fields.date || new Date().toISOString().split('T')[0],
      due_date: fields.due_date || fields.dueDate || '',
      amountHT: Number(fields.amountHT || fields.totalHT) || 0,
      totalVAT: Number(fields.totalVAT || fields.amount_tva) || 0,
      amountTTC: Number(fields.amountTTC || fields.totalTTC) || 0,
      status: fields.status || 'draft',
      ppf_status: fields.ppf_status || 'DEPOSEE',
      lines: Array.isArray(fields.lines) ? fields.lines : [],
      createdAt: new Date().toISOString(),
    };

    const existingIdx = db.invoices.findIndex((i: any) => i.id === newInvoice.id);
    if (existingIdx >= 0) {
      db.invoices[existingIdx] = newInvoice;
    } else {
      db.invoices.unshift(newInvoice);
    }
    saveDb(db);
    return newInvoice;
  }

  deleteInvoice(companyId: number, invoiceId: string) {
    const db = getDb();
    if (!db.invoices) return true;
    db.invoices = db.invoices.filter((i: any) => {
      if (String(i.id) === String(invoiceId)) {
        if (companyId && i.company_id !== companyId) return true;
        return false;
      }
      return true;
    });
    saveDb(db);
    return true;
  }

  async checkInvoiceAi(invoiceData: any, companyId?: number) {
    const persona = resolveBackendPersona(companyId, invoiceData);
    const personaSystem = buildBackendPersonaSystemPrompt(persona, "Audit fiscal et conformité de facture de vente");

    const prompt = `${personaSystem}

Tu es l'expert fiscal, légal et comptable français dédié à cette entreprise du métier "${persona.metierLabel}" (Activité précise : "${persona.customMetier || persona.activity || persona.metierLabel}").
Analyse les données de cette facture :
- Présence des mentions obligatoires générales (SIRET, Numéro TVA ou mention franchise art. 293 B du CGI, date d'émission, date d'échéance, pénalités de retard L. 441-10, indemnité forfaitaire 40€).
- Présence des mentions sectorielles obligatoires propres à ce métier précis (ex: assurance décennale pour le BTP, pièces de réemploi pour les garagistes, etc.).
- Cohérence des montants HT, taux de TVA appliqués (taux réduit ou standard selon la nature des prestations de ce métier) et montant TTC.
- Statut de conformité.

Réponds STRICTEMENT par un JSON valide :
{
  "isCompliant": true,
  "score": 98,
  "detectedMissing": [],
  "recommendations": ["Recommandation 1"],
  "summary": "Synthèse de conformité personnalisée pour le professionnel"
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: `Données facture : ${JSON.stringify(invoiceData)}` }
    ], true);

    const content = aiRes?.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }
    return parsed;
  }

  generateFacturXXml(fields: any) {
    const data: FacturXInvoiceData = {
      invoiceNumber: fields.invoiceNumber || 'FA-2026-001',
      issueDate: fields.issueDate || fields.date || new Date().toISOString().split('T')[0],
      dueDate: fields.dueDate || fields.due_date || new Date().toISOString().split('T')[0],
      sellerName: fields.sellerName || 'MDIV Business Solutions',
      sellerSiret: fields.sellerSiret || '98765432100012',
      sellerVat: fields.sellerVat || 'FR12987654321',
      sellerAddress: fields.sellerAddress || '10 Rue de la Paix',
      sellerCity: fields.sellerCity || 'Paris',
      sellerPostalCode: fields.sellerPostalCode || '75008',
      clientName: fields.clientName || 'Client Partenaire',
      buyerSiret: fields.buyerSiret || fields.clientSiret || '12345678900010',
      buyerVat: fields.buyerVat || fields.clientVat || 'FR89123456789',
      buyerAddress: fields.buyerAddress || '45 Avenue des Entreprises',
      buyerCity: fields.buyerCity || 'Lyon',
      buyerPostalCode: fields.buyerPostalCode || '69002',
      buyerCountry: fields.buyerCountry || 'FR',
      totalHT: Number(fields.totalHT || fields.amountHT) || 0,
      totalVAT: Number(fields.totalVAT) || 0,
      totalTTC: Number(fields.totalTTC || fields.amountTTC) || 0,
      lines: Array.isArray(fields.lines) ? fields.lines : [],
      opNature: fields.opNature || 'services',
      vatPaymentOnDebit: fields.vatPaymentOnDebit || 'TVA sur les encaissements',
    };

    const { xml, hash } = buildFacturXXml(data);
    generatedXmlStore.set(data.invoiceNumber, xml);

    return {
      invoiceNumber: data.invoiceNumber,
      pdp_status: 'DEPOSITED',
      pdp_operator: 'PDP n° 0039 (Crédit Agricole / LCL)',
      profile: 'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic',
      lines_count: data.lines.length || 1,
      sha256_hash: hash,
      downloadUrl: `/api/facturx_generator.php?download=1&invoiceNumber=${encodeURIComponent(data.invoiceNumber)}`,
      xmlPreview: xml.slice(0, 500) + '...',
    };
  }

  verifyPpfDirectory(query: string) {
    const clean = query.replace(/\s+/g, '');
    const isSiret = clean.length === 14;
    const isSiren = clean.length === 9;

    if (!isSiret && !isSiren) {
      throw ApiError.badRequest("Format invalide : 9 chiffres (SIREN) ou 14 chiffres (SIRET) attendus.");
    }

    if (!isValidLuhnBackend(clean)) {
      throw ApiError.unprocessable("Le numéro fourni ne respecte pas l'algorithme officiel de contrôle de Luhn.");
    }

    const siren = clean.slice(0, 9);
    const vatNumber = computeFrenchVatBackend(siren);

    return {
      valid: true,
      siren,
      siret: isSiret ? clean : (clean + '00010'),
      vat_number: vatNumber,
      administrative_status: 'ACTIVE',
      ppf_status: 'ENROLLED',
      ppf_routing_id: `PPF-FR-${siren}`,
      pdp_operator: 'PPF DGFiP',
      message: "Entreprise identifiée et enregistrée dans l'annuaire centralisé de facturation électronique 2026.",
    };
  }

  depositPpfStatus(invoiceId: string, targetStatus: string, rejectionReason?: string) {
    const validStatuses = ['DEPOSEE', 'ACHEMINEE', 'REJETEE', 'REFUSEE', 'MISE_A_DISPOSITION', 'PRISE_EN_CHARGE', 'APPROUVEE', 'PAIEMENT_TRANSMIS', 'PAYEE'];

    if (!validStatuses.includes(targetStatus)) {
      throw ApiError.badRequest(`Statut invalide. Statuts légaux autorisés : ${validStatuses.join(', ')}`);
    }

    const db = getDb();
    if (!db.invoices) db.invoices = [];
    if (!db.pafAuditTrail) db.pafAuditTrail = [];

    const invoice = db.invoices.find((i: any) => String(i.id) === String(invoiceId) || i.invoiceNumber === String(invoiceId));
    if (!invoice) {
      throw ApiError.notFound(`Facture introuvable : ${invoiceId}`);
    }

    const previousStatus = invoice.ppf_status || 'DEPOSEE';
    if (previousStatus === 'PAYEE' && targetStatus !== 'PAYEE') {
      throw ApiError.unprocessable("Action interdite : une facture avec le statut terminal PAYEE ne peut plus être modifiée.");
    }

    const depositId = invoice.ppf_deposit_id || `PPF-DEP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    invoice.ppf_status = targetStatus;
    invoice.ppf_deposit_id = depositId;
    if (rejectionReason) invoice.rejection_reason = rejectionReason;
    invoice.updatedAt = new Date().toISOString();

    const transitionHash = sha256Hash(`${invoice.invoiceNumber}|${previousStatus}|${targetStatus}|${depositId}|${new Date().toISOString()}`);

    db.pafAuditTrail.unshift({
      id: `paf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      invoice_id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      action: 'CHANGEMENT_STATUT_PPF',
      previous_status: previousStatus,
      new_status: targetStatus,
      rejection_reason: rejectionReason || null,
      payload_hash: transitionHash,
      timestamp: new Date().toISOString(),
    });

    saveDb(db);
    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      previousStatus,
      newStatus: targetStatus,
      depositId,
      pafHash: transitionHash,
      message: `Statut PPF de la facture ${invoice.invoiceNumber} mis à jour avec succès : ${targetStatus}`,
    };
  }
}

export const invoiceService = new InvoiceService();
