// src/lib/telemetryService.ts
/**
 * Service Client pour l'Observabilité IA, la Traçabilité d'Arbitrage et les Token Economics (Brique 7)
 */

import { getApiUrl } from './apiConfig';

export interface AgentsTrail {
  agent1_factuel?: string;
  agent2_critique?: string;
  agent3_arbitre?: string;
  agent4_dg?: string;
  [key: string]: any;
}

export interface AuditLogItem {
  id: number;
  company_id: number;
  session_id: string;
  tool_type: string;
  document_name: string;
  provider: string;
  model: string;
  total_latency_ms: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  cost_estimate_eur: number;
  consensus_status: 'UNANIMOUS' | 'ARBITRATED' | 'FLAGGED_RISK' | 'FAILED';
  agents_trail: AgentsTrail;
  created_at: string;
}

export interface TelemetryKpis {
  total_runs: number;
  total_tokens: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost_eur: number;
  avg_latency_ms: number;
  arbitrated_rate: number;
  unanimous_rate: number;
}

export interface TelemetryResponse {
  status: 'success' | 'error';
  company_id?: number;
  kpis: TelemetryKpis;
  recent_logs: AuditLogItem[];
  error?: string;
}

export class TelemetryService {
  /**
   * Récupère les métriques de coût, latence et historique des arbitrages multi-agents
   */
  static async getTelemetry(companyId?: number, toolType?: string, limit = 25): Promise<TelemetryResponse> {
    const params = new URLSearchParams();
    if (companyId) params.set('company_id', String(companyId));
    if (toolType) params.set('tool_type', toolType);
    params.set('limit', String(limit));

    const url = getApiUrl(`ai_telemetry.php?${params.toString()}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status} lors de la récupération de la télémétrie.`);
    }

    return await response.json();
  }
}
