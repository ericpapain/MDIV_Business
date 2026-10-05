// src/lib/quoteService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export interface Client {
  id: string | number;
  company_id?: number;
  name: string;
  email: string;
  company: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  description: string;
  defaultPrice: number;
  vatRate: number;
}

export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
  discountPercentage: number;
}

export interface Quote {
  id: string;
  company_id: number;
  clientId?: string | number | null;
  clientName?: string;
  quoteNumber: string;
  date: string;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  executiveSummary?: string;
  paymentTerms?: string;
  lines: QuoteLine[];
  createdAt?: string;
}

export interface ProjectWork {
  id: string;
  company_id: number;
  clientId?: string | number | null;
  clientName?: string;
  quoteId?: string | null;
  title: string;
  description?: string;
  budget: number;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface QuoteAIAssistRequest {
  clientContext: string;
  projectDescription: string;
  budget?: string;
  exampleQuotesText?: string;
}

export interface QuoteAIAssistResponse {
  suggestedLines: QuoteLine[];
  executiveSummary: string;
  paymentTerms: string;
}

/**
 * Récupère la liste des clients réels depuis la base de données SQL / locale.
 */
export async function fetchClients(companyId?: number): Promise<Client[]> {
  if (!companyId) {
    return [];
  }
  const url = createApiUrl('clients.php');
  url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Crée un nouveau client rattaché à l'entreprise.
 */
export async function createClient(
  clientData: Partial<Client>, 
  companyId?: number, 
  token?: string
): Promise<Client> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(getApiUrl('clients.php'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...clientData, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Impossible de créer le client.";
    try {
      const err = await response.json();
      if (err.error) errorMsg = err.error;
    } catch {}
    throw new Error(errorMsg);
  }

  const res = await response.json();
  return res.client || res;
}

/**
 * Récupère le catalogue de produits/prestations réels.
 */
export async function fetchProducts(companyId?: number): Promise<Product[]> {
  const url = createApiUrl('products.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Demande à l'IA de générer un pré-devis basé sur la description du projet.
 */
export async function generateQuoteAIAssist(
  request: QuoteAIAssistRequest,
  companyId?: number
): Promise<QuoteAIAssistResponse> {
  const response = await fetch(getApiUrl('quote_ai_assist.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Service de génération de devis IA indisponible.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Sauvegarde un devis dans la base de données.
 */
export async function saveQuote(
  quoteData: Partial<Quote>, 
  companyId?: number, 
  token?: string
): Promise<Quote> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(getApiUrl('quotes.php'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...quoteData, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Erreur lors de la sauvegarde du devis.";
    try {
      const err = await response.json();
      if (err.error) errorMsg = err.error;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.quote || data;
}

/**
 * Récupère l'historique des devis pour l'entreprise connectée.
 */
export async function fetchQuotes(companyId?: number, token?: string): Promise<Quote[]> {
  if (!companyId) return [];
  const url = createApiUrl('quotes.php');
  url.searchParams.append('company_id', companyId.toString());

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) return [];

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Supprime un devis.
 */
export async function deleteQuote(quoteId: string, companyId?: number, token?: string): Promise<boolean> {
  const url = createApiUrl('quotes.php');
  url.searchParams.append('id', quoteId);
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers,
  });

  return response.ok;
}

/**
 * Sauvegarde un travail / prestation / projet.
 */
export async function saveProject(
  projectData: Partial<ProjectWork>, 
  companyId?: number, 
  token?: string
): Promise<ProjectWork> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(getApiUrl('projects.php'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...projectData, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Erreur lors de la sauvegarde du projet.";
    try {
      const err = await response.json();
      if (err.error) errorMsg = err.error;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.project || data;
}

/**
 * Récupère les travaux / projets de l'entreprise.
 */
export async function fetchProjects(companyId?: number, token?: string): Promise<ProjectWork[]> {
  if (!companyId) return [];
  const url = createApiUrl('projects.php');
  url.searchParams.append('company_id', companyId.toString());

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) return [];

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Supprime un travail / projet.
 */
export async function deleteProject(projectId: string, companyId?: number, token?: string): Promise<boolean> {
  const url = createApiUrl('projects.php');
  url.searchParams.append('id', projectId);
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers,
  });

  return response.ok;
}

import { downloadQuotePDF, QuoteExportData } from './pdfExportService';

/**
 * Exporte le devis en vrai fichier binaire PDF haute fidélité.
 * Déclenche le téléchargement immédiat du document vectoriel sans rendu HTML intermédiaire.
 */
export async function exportQuotePDF(quoteData: any, companyId?: number) {
  try {
    const payload: QuoteExportData = {
      quoteNumber: quoteData.quoteNumber || ('DEV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)),
      date: quoteData.date || new Date().toISOString().split('T')[0],
      validityDays: quoteData.validityDays || 30,
      client: quoteData.client,
      clientName: quoteData.clientName || (quoteData.client ? (quoteData.client.company || quoteData.client.name) : undefined),
      lines: quoteData.lines || [],
      executiveSummary: quoteData.executiveSummary,
      paymentTerms: quoteData.paymentTerms || "Paiement à 30 jours date d'émission.",
      totals: quoteData.totals,
      company: quoteData.company
    };

    await downloadQuotePDF(payload);
  } catch (error) {
    console.error("Erreur lors de la génération PDF du devis:", error);
    throw error;
  }
}

