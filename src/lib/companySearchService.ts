// src/lib/companySearchService.ts
import { getApiUrl } from './apiConfig';

export interface OfficialCompanyData {
  siren: string;
  siret: string;
  company_name: string;
  trade_name?: string | null;
  legal_form: string;
  naf_code: string;
  activity: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  creation_date?: string | null;
  administrative_status: 'ACTIVE' | 'CESSEE' | string;
  employee_range?: string | null;
  capital?: string | null;
  dirigeants?: { name: string; role: string }[];
  bodacc_events?: {
    date: string | null;
    type: string;
    tribunal?: string | null;
    description: string;
  }[];
}

export interface CompanySearchResult {
  success: boolean;
  already_registered: boolean;
  existing_company_id?: number | null;
  sources_used: string[];
  company: OfficialCompanyData;
  from_cache?: boolean;
  fetched_at?: string;
}

/**
 * Nettoie la saisie d'un SIREN (suppression des espaces, tirets, points)
 * Ex: "981 123 456" -> "981123456"
 */
export const cleanSiren = (input: string): string => {
  return (input || '').replace(/[^0-9]/g, '');
};

/**
 * Formate un SIREN avec des espaces pour un affichage lisible
 * Ex: "981123456" -> "981 123 456"
 */
export const formatSiren = (siren: string): string => {
  const cleaned = cleanSiren(siren);
  if (cleaned.length !== 9) return siren;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
};

/**
 * Formate un SIRET avec des espaces pour affichage
 * Ex: "98112345600012" -> "981 123 456 00012"
 */
export const formatSiret = (siret: string): string => {
  const cleaned = cleanSiren(siret);
  if (cleaned.length !== 14) return siret;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 14)}`;
};

/**
 * Valide le format strict d'un SIREN (9 chiffres)
 */
export const isValidSiren = (input: string): boolean => {
  const cleaned = cleanSiren(input);
  return cleaned.length === 9;
};

/**
 * Interroge le service multi-sources officiel (INSEE, RNE, BODACC)
 */
export const searchCompanyBySiren = async (rawSiren: string): Promise<CompanySearchResult> => {
  const siren = cleanSiren(rawSiren);
  
  if (!isValidSiren(siren)) {
    throw new Error("Le numéro SIREN doit contenir exactement 9 chiffres (ex : 981 123 456).");
  }

  const response = await fetch(getApiUrl(`company_search.php?siren=${encodeURIComponent(siren)}`));
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Aucune entreprise trouvée pour ce numéro SIREN.");
  }

  return data as CompanySearchResult;
};
