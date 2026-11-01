export function computeFrenchVatBackend(sirenOrSiret: string): string {
  const cleaned = String(sirenOrSiret || '').replace(/\s+/g, '').slice(0, 9);
  if (cleaned.length !== 9 || !/^\d{9}$/.test(cleaned)) return '';
  const num = parseInt(cleaned, 10);
  const key = (12 + 3 * (num % 97)) % 97;
  return `FR${key < 10 ? '0' + key : key}${cleaned}`;
}
