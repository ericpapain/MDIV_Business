import fs from 'fs';
import path from 'path';

export function getEnvVar(key: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [k, ...v] = trimmed.split('=');
        if (k.trim() === key) return v.join('=').trim();
      }
    }
  } catch {}
  return '';
}

export const ENV = {
  GROQ_API_KEY: getEnvVar('GROQ_API_KEY'),
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  MISTRAL_API_KEY: getEnvVar('MISTRAL_API_KEY'),
  APP_MODE: getEnvVar('APP_MODE') || 'live',
  PORT: parseInt(getEnvVar('PORT') || '8080', 10),
  DEV_DB_PATH: path.resolve(process.cwd(), 'dev_db.json'),
  DEV_MAIL_STORE_PATH: path.resolve(process.cwd(), 'dev_mail_store.json'),
};

export const AI_ENDPOINTS = {
  GROQ_URL: 'https://api.groq.com/openai/v1/chat/completions',
  OPENAI_URL: 'https://api.openai.com/v1/chat/completions',
  MISTRAL_URL: 'https://api.mistral.ai/v1/chat/completions',
};
