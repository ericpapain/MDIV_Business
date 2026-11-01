import crypto from 'crypto';

export function sha256Hash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function generateToken(prefix = '', bytes = 8): string {
  const randomHex = crypto.randomBytes(bytes).toString('hex');
  return prefix ? `${prefix}-${randomHex}` : randomHex;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
