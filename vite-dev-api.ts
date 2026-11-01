// vite-dev-api.ts
// Proxy rétrocompatible vers la nouvelle architecture modulaire Clean Architecture / DDD (server/)
export { devApiPlugin } from './server/index';
export { dispatchDevApi } from './server/app';
export { callLLM } from './server/integrations/llm/llm-orchestrator';
export { getDb, saveDb } from './server/database/db-connection';
