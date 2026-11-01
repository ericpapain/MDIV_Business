export function isValidLuhnBackend(code: string): boolean {
  const cleaned = String(code || '').replace(/\s+/g, '');
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
