// src/lib/deepDiveService.ts

import { getApiUrl } from './apiConfig';

export interface DeepDiveResponse {
  answer: string;
  key_takeaways?: string[];
}

export async function requestDeepDive(params: {
  sectionTitle: string;
  sectionContent: any;
  question: string;
  globalContext?: string;
  toolType?: string;
}): Promise<DeepDiveResponse> {
  const response = await fetch(getApiUrl('deep_dive.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    let errorMsg = "Impossible d'approfondir cette section pour le moment.";
    try {
      const err = await response.json();
      if (err.error) errorMsg = err.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}
