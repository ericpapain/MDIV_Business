// src/lib/invoiceService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export interface InvoiceKPIs {
  totalIssued: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId?: string | number | null;
  date: string;
  dueDate: string;
  amountHT?: number;
  amountTTC: number;
  downpayment?: number;
  lines?: any[];
  status: 'paid' | 'pending' | 'overdue';
}

export interface InvoiceAICheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedMentions: string[];
}

/**
 * Supprime une facture de la base de données.
 */
export async function deleteInvoice(id: string, companyId?: number): Promise<boolean> {
  const url = createApiUrl('invoices.php');
  url.searchParams.append('id', id);
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    // Fallback POST avec action=delete
    const postRes = await fetch(getApiUrl('invoices.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id, company_id: companyId })
    });
    return postRes.ok;
  }
  return true;
}

/**
 * Enregistre ou met à jour une facture en base de données.
 */
export async function saveInvoice(invoiceData: any, companyId?: number): Promise<any> {
  const cid = companyId || invoiceData.company_id;
  if (!cid) throw new Error("Authentification requise pour enregistrer une facture.");

  const response = await fetch(getApiUrl('invoices.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...invoiceData,
      company_id: cid
    })
  });
  if (!response.ok) {
    let err = "Erreur de sauvegarde de la facture.";
    try {
      const d = await response.json();
      if (d.error) err = d.error;
    } catch {}
    throw new Error(err);
  }
  return response.json();
}


/**
 * Récupère les KPIs de facturation réels (Tableau de bord).
 */
export async function fetchInvoiceKPIs(companyId?: number): Promise<InvoiceKPIs> {
  if (!companyId) {
    return { totalIssued: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0 };
  }
  const url = createApiUrl('invoices_kpis.php');
  url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    return { totalIssued: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0 };
  }
  return response.json();
}

/**
 * Récupère la liste des factures réelles.
 */
export async function fetchInvoicesList(companyId?: number): Promise<Invoice[]> {
  if (!companyId) {
    return [];
  }
  const url = createApiUrl('invoices.php');
  url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    return []; 
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Récupère un devis validé pour le transformer en facture.
 */
export async function fetchQuoteToInvoice(quoteId: string, companyId?: number): Promise<any> {
  const url = createApiUrl('quotes_to_invoice.php');
  url.searchParams.append('quote_id', quoteId);
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Impossible de charger le devis.");
  return response.json();
}

/**
 * Demande à l'IA d'auditer la facture avant émission (erreurs de calcul, mentions légales, etc).
 */
export async function checkInvoiceWithAI(invoiceData: any, companyId?: number): Promise<InvoiceAICheckResult> {
  const response = await fetch(getApiUrl('invoice_ai_check.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...invoiceData, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Service de vérification IA indisponible.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch(e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

import { downloadInvoicePDF, InvoiceExportData } from './pdfExportService';

/**
 * Exporte la facture en vrai fichier binaire PDF haute fidélité.
 * Déclenche le téléchargement immédiat du document vectoriel sans rendu HTML intermédiaire.
 */
export async function exportInvoicePDF(invoiceData: any, companyId?: number) {
  try {
    const payload: InvoiceExportData = {
      invoiceNumber: invoiceData.invoiceNumber || ('FA-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)),
      issueDate: invoiceData.issueDate || invoiceData.date || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      client: invoiceData.client,
      clientName: invoiceData.clientName || (invoiceData.client ? (invoiceData.client.company || invoiceData.client.name) : undefined),
      lines: invoiceData.lines || [],
      downpayment: Number(invoiceData.downpayment) || 0,
      totals: invoiceData.totals,
      paymentTerms: invoiceData.paymentTerms || "Paiement à 30 jours date d'émission.",
      notes: invoiceData.notes,
      company: invoiceData.company
    };

    await downloadInvoicePDF(payload);
  } catch (error) {
    console.error("Erreur lors de la génération PDF de la facture:", error);
    throw error;
  }
}

/**
 * Extrait les lignes d'articles, quantités et montants à partir d'un texte OCR de facture/ticket
 */
export async function extractInvoiceLinesFromOCR(ocrText: string, companyId?: number): Promise<any> {
  const response = await fetch(getApiUrl('invoice_extract_lines.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ocr_text: ocrText, company_id: companyId })
  });
  
  if (!response.ok) {
    let err = "Erreur lors de l'extraction IA des lignes.";
    try {
      const d = await response.json();
      if (d.error) err = d.error;
    } catch {}
    throw new Error(err);
  }
  return response.json();
}

