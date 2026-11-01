// src/lib/validationLuhn.ts
// Algorithme officiel de Luhn (SIREN 9 chiffres, SIRET 14 chiffres) et calcul TVA intracommunautaire DGFiP

/**
 * Valide un code numérique selon l'algorithme de Luhn.
 * Chaque chiffre de rang impair (en comptant depuis la droite) est doublé ;
 * si le résultat est > 9, on soustrait 9. La somme totale doit être divisible par 10.
 */
export function isValidLuhn(code: string): boolean {
  const cleaned = code.replace(/\s+/g, '');
  if (!/^\d+$/.test(cleaned) || cleaned.length === 0) return false;

  let sum = 0;
  for (let i = 0; i < cleaned.length; i++) {
    let digit = parseInt(cleaned.charAt(cleaned.length - 1 - i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Vérifie la validité d'un numéro SIREN (9 chiffres + clé Luhn).
 */
export function isValidSiren(siren: string): boolean {
  const cleaned = siren.replace(/\s+/g, '');
  return cleaned.length === 9 && isValidLuhn(cleaned);
}

/**
 * Vérifie la validité d'un numéro SIRET (14 chiffres : 9 SIREN + 5 NIC + clé Luhn).
 */
export function isValidSiret(siret: string): boolean {
  const cleaned = siret.replace(/\s+/g, '');
  return cleaned.length === 14 && isValidLuhn(cleaned);
}

/**
 * Calcule automatiquement la clé et le numéro de TVA intracommunautaire français
 * à partir d'un SIREN (9 chiffres) ou SIRET (14 chiffres).
 * Formule légale DGFiP : Clé = (12 + 3 * (SIREN % 97)) % 97
 */
export function computeFrenchVat(sirenOrSiret: string): string {
  const cleaned = sirenOrSiret.replace(/\s+/g, '').slice(0, 9);
  if (cleaned.length !== 9 || !/^\d{9}$/.test(cleaned)) return '';
  const num = parseInt(cleaned, 10);
  const key = (12 + 3 * (num % 97)) % 97;
  const keyStr = key < 10 ? '0' + key : String(key);
  return `FR${keyStr}${cleaned}`;
}

/**
 * Valide le format d'un numéro de TVA intracommunautaire (France ou UE).
 */
export function isValidVatNumber(vat: string): boolean {
  const cleaned = vat.replace(/[\s\.]+/g, '').toUpperCase();
  if (cleaned.startsWith('FR')) {
    if (cleaned.length !== 13) return false;
    const siren = cleaned.slice(4);
    const expected = computeFrenchVat(siren);
    return expected === cleaned;
  }
  // Format général UE (2 lettres de pays + 2 à 12 caractères alphanumériques)
  return /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(cleaned);
}
