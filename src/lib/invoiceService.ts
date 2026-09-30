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
  date: string;
  dueDate: string;
  amountTTC: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface InvoiceAICheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedMentions: string[];
}

/**
 * Récupère les KPIs de facturation réels (Tableau de bord).
 */
export async function fetchInvoiceKPIs(companyId?: number): Promise<InvoiceKPIs> {
  const url = createApiUrl('invoices_kpis.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    // Zero Mock : Si pas d'API, on retourne 0
    return { totalIssued: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0 };
  }
  return response.json();
}

/**
 * Récupère la liste des factures réelles.
 */
export async function fetchInvoicesList(companyId?: number): Promise<Invoice[]> {
  const url = createApiUrl('invoices.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

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

/**
 * Exporte la facture en PDF via le backend.
 */
export async function exportInvoicePDF(invoiceData: any, companyId?: number) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = getApiUrl('invoice_export.php');
  form.target = '_blank';
  
  const dataInput = document.createElement('input');
  dataInput.type = 'hidden';
  dataInput.name = 'invoice_data';
  dataInput.value = JSON.stringify(invoiceData);

  const compInput = document.createElement('input');
  compInput.type = 'hidden';
  compInput.name = 'company_id';
  compInput.value = companyId?.toString() || '';

  form.appendChild(dataInput);
  form.appendChild(compInput);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
