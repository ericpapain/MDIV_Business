// src/lib/tenderService.ts

import { getApiUrl } from './apiConfig';

export interface TenderItem {
  id: string;
  title: string;
  platform: 'BOAMP' | 'TED Europa' | 'Marchés-Publics.info' | 'Francemarches' | 'Marchés de l\'État' | string;
  link: string;
  deadline: string;
  location: string;
  estimatedBudget?: string;
  buyer?: string;
  sector?: string;
}

export interface TendersSearchResponse {
  success: boolean;
  query: string;
  count: number;
  tenders: TenderItem[];
}

export async function searchTenders(
  query: string,
  count: number = 5,
  offset: number = 0,
  location: string = ''
): Promise<TendersSearchResponse> {
  const response = await fetch(getApiUrl('tenders_search.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, count, offset, location }),
  });

  if (!response.ok) {
    let errorMsg = "Erreur lors de la recherche des appels d'offres.";
    try {
      const err = await response.json();
      if (err.error) errorMsg = err.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}
