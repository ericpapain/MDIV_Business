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
  const url = createApiUrl('clients.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

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
  const url = createApiUrl('quotes.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

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
 * Sauvegarde un travail / chantier / projet.
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
  const url = createApiUrl('projects.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

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

/**
 * Demande la génération du fichier PDF du devis au backend.
 */
export async function exportQuotePDF(quoteData: any, companyId?: number) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = getApiUrl('quote_export.php');
  form.target = '_blank';
  
  const dataInput = document.createElement('input');
  dataInput.type = 'hidden';
  dataInput.name = 'quote_data';
  dataInput.value = JSON.stringify(quoteData);

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
