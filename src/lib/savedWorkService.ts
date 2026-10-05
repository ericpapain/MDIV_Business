// src/lib/savedWorkService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export interface SavedWorkItem {
  id: string;
  company_id?: number;
  client_id?: string | number | null;
  client_name?: string;
  project_id?: string | number | null;
  project_name?: string | null;
  tool_type: string; // 'quote' | 'meeting' | 'email' | 'summarizer' | 'diagnostic' | 'prospecting' | 'content' | 'followup' | 'benchmark' | 'lead' | 'invoice'
  title: string;
  summary?: string;
  content_payload: any;
  version?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export async function saveWork(
  data: Partial<SavedWorkItem>,
  companyId?: number,
  token?: string
): Promise<SavedWorkItem> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(getApiUrl('saved_work.php'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...data,
      company_id: companyId || data.company_id || 1,
    }),
  });

  if (!response.ok) {
    let errorMsg = "Erreur lors de l'enregistrement dans l'historique.";
    try {
      const err = await response.json();
      if (err.error) errorMsg = err.error;
    } catch {}
    throw new Error(errorMsg);
  }

  const res = await response.json();
  return res.savedWork || res;
}

export async function fetchSavedWorks(
  filters?: {
    clientId?: string | number;
    projectId?: string | number;
    toolType?: string;
  },
  companyId?: number,
  token?: string
): Promise<SavedWorkItem[]> {
  const url = createApiUrl('saved_work.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());
  if (filters?.clientId) url.searchParams.append('client_id', filters.clientId.toString());
  if (filters?.projectId) url.searchParams.append('project_id', filters.projectId.toString());
  if (filters?.toolType) url.searchParams.append('tool_type', filters.toolType);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) return [];

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function deleteSavedWork(
  id: string,
  companyId?: number,
  token?: string
): Promise<boolean> {
  const url = createApiUrl('saved_work.php');
  url.searchParams.append('id', id);
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers,
  });

  return response.ok;
}
