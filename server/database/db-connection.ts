import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';

export interface DatabaseSchema {
  companies: any[];
  clients: any[];
  invoices: any[];
  quotes: any[];
  projects: any[];
  savedWorks: any[];
  followups: any[];
  integrations: any[];
  expenses: any[];
  appointments: any[];
  appointment_settings: any;
  booking_links: any[];
  appointment_notifications: any[];
  aiSettings: {
    primaryProvider: 'groq' | 'openai' | 'mistral' | 'auto';
    groqModel: string;
    openaiModel: string;
    mistralModel: string;
    temperature: number;
    fallbackEnabled: boolean;
  };
  pafAuditTrail?: any[];
  aiAuditLogs?: any[];
  client_interactions?: any[];
  cross_module_bindings?: any[];
  [key: string]: any;
}

let cachedDb: DatabaseSchema | null = null;
let isDirty = false;

function getDefaultDb(): DatabaseSchema {
  return {
    companies: [],
    clients: [],
    invoices: [],
    quotes: [],
    projects: [],
    savedWorks: [],
    followups: [],
    integrations: [],
    expenses: [],
    appointments: [],
    appointment_settings: {},
    booking_links: [],
    appointment_notifications: [],
    aiSettings: {
      primaryProvider: 'groq',
      groqModel: 'qwen/qwen3.8-27b',
      openaiModel: 'gpt-4o-mini',
      mistralModel: 'mistral-small-latest',
      temperature: 0.7,
      fallbackEnabled: true,
    },
    pafAuditTrail: [],
    aiAuditLogs: [],
    client_interactions: [],
    cross_module_bindings: [],
  };
}

export function getDb(): DatabaseSchema {
  if (cachedDb) return cachedDb;
  try {
    if (fs.existsSync(ENV.DEV_DB_PATH)) {
      const content = fs.readFileSync(ENV.DEV_DB_PATH, 'utf-8');
      cachedDb = { ...getDefaultDb(), ...JSON.parse(content) };
      return cachedDb!;
    }
  } catch (err) {
    console.warn('[DbConnection] Erreur lecture dev_db.json, utilisation du store par défaut:', err);
  }
  cachedDb = getDefaultDb();
  return cachedDb;
}

export function saveDb(updated?: Partial<DatabaseSchema>) {
  if (updated && cachedDb) {
    cachedDb = { ...cachedDb, ...updated };
  }
  const db = cachedDb || getDb();
  try {
    fs.writeFileSync(ENV.DEV_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    isDirty = false;
  } catch (err) {
    console.error('[DbConnection] Erreur écriture dev_db.json:', err);
  }
}
