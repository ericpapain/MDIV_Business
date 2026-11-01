export interface InseeCompanyResult {
  siren: string;
  nom_complet: string;
  nom_raison_sociale?: string;
  siege?: {
    siret?: string;
    adresse?: string;
    code_postal?: string;
    commune?: string;
    activite_principale?: string;
  };
  categorie_entreprise?: string;
  date_creation?: string;
  etat_administratif?: string;
}

export class InseeSirenClient {
  private cache = new Map<string, { data: InseeCompanyResult[]; timestamp: number }>();
  private readonly CACHE_TTL_MS = 1000 * 60 * 60; // 1 heure

  async searchCompanies(query: string, limit = 5): Promise<InseeCompanyResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const cached = this.cache.get(cleanQuery);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(cleanQuery)}&per_page=${limit}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Erreur API Recherche Entreprises (${res.status})`);
      }
      const json = await res.json();
      const results: InseeCompanyResult[] = json.results || [];
      this.cache.set(cleanQuery, { data: results, timestamp: Date.now() });
      return results;
    } catch (err) {
      console.warn('[InseeSirenClient] Fallback recherche entreprise:', err);
      return [];
    }
  }
}

export const inseeSirenClient = new InseeSirenClient();
