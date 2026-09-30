// src/lib/benchmarkService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export interface SectorBenchmarkData {
  sector: string;
  global_avg: number;
  global_top10: number;
  ai_avg: number;
  data_avg: number;
  process_avg: number;
  infra_avg: number;
  culture_avg: number;
  strategy_avg: number;
}

export interface LeadGenData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  sector: string;
  country: string;
  employees: string;
  revenue: string;
  sitesCount: string;
}

/**
 * Récupère les données de benchmark sectoriel réelles depuis l'API.
 * S'il n'y a pas de données pour ce secteur, retourne null.
 */
export async function fetchSectorBenchmark(sector: string, country?: string): Promise<SectorBenchmarkData | null> {
  try {
    const url = createApiUrl('benchmark_stats.php');
    url.searchParams.append('sector', sector);
    if (country) url.searchParams.append('country', country);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Si l'API retourne un objet vide ou explicitement sans données
    if (!data || Object.keys(data).length === 0 || data.no_data) {
      return null;
    }

    return data as SectorBenchmarkData;
  } catch (error) {
    console.error("Erreur lors de la récupération du benchmark:", error);
    // On ne lève pas l'erreur, on retourne null pour afficher le message "Les données... ne sont pas encore disponibles"
    return null;
  }
}

/**
 * Soumet les résultats du benchmark (Lead + Scores) pour sauvegarde.
 */
export async function submitBenchmarkResults(lead: LeadGenData, scores: Record<string, number>, globalScore: number, aiScore: number): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(getApiUrl('benchmark_submit.php'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lead, scores, globalScore, aiScore }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erreur lors de l'enregistrement des résultats.");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Erreur lors de la soumission du benchmark:", error);
    throw new Error(error.message || "Impossible de sauvegarder le benchmark.");
  }
}
