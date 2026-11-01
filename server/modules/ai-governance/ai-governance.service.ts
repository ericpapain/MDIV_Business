import { getDb, saveDb } from '../../database/db-connection';
import { groqProvider } from '../../integrations/llm/groq.provider';
import { openAIProvider } from '../../integrations/llm/openai.provider';
import { mistralProvider } from '../../integrations/llm/mistral.provider';

export class AiGovernanceService {
  getSettings() {
    const db = getDb();
    return db.aiSettings;
  }

  saveSettings(fields: any) {
    const db = getDb();
    db.aiSettings = {
      ...db.aiSettings,
      ...fields,
    };
    saveDb(db);
    return db.aiSettings;
  }

  async testProvider(provider: string, model?: string) {
    const testMsg = [{ role: 'user' as const, content: 'Bonjour ! Réponds en 1 mot.' }];
    const startTime = Date.now();
    try {
      if (provider === 'groq') {
        const res = await groqProvider.call(testMsg, false, model || 'qwen/qwen3.8-27b', 0.5);
        return { success: true, provider, latencyMs: Date.now() - startTime, reply: res.choices?.[0]?.message?.content };
      }
      if (provider === 'openai') {
        const res = await openAIProvider.call(testMsg, false, model || 'gpt-4o-mini', 0.5);
        return { success: true, provider, latencyMs: Date.now() - startTime, reply: res.choices?.[0]?.message?.content };
      }
      if (provider === 'mistral') {
        const res = await mistralProvider.call(testMsg, false, model || 'mistral-small-latest', 0.5);
        return { success: true, provider, latencyMs: Date.now() - startTime, reply: res.choices?.[0]?.message?.content };
      }
      return { success: false, error: 'Fournisseur inconnu.' };
    } catch (err: any) {
      return { success: false, provider, error: err.message, latencyMs: Date.now() - startTime };
    }
  }

  getTelemetry(companyId: number, toolType?: string, limit = 25) {
    const db = getDb();
    if (!(db as any).aiAuditLogs || (db as any).aiAuditLogs.length === 0) {
      (db as any).aiAuditLogs = [
        {
          id: 1,
          company_id: 1,
          session_id: "sess_revue_direction_01",
          tool_type: "meeting",
          document_name: "Comité de Direction Q4",
          provider: "groq",
          model: "qwen/qwen3.8-27b",
          total_latency_ms: 3820,
          prompt_tokens: 1450,
          completion_tokens: 680,
          total_tokens: 2130,
          cost_estimate_eur: 0.000383,
          consensus_status: "ARBITRATED",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      saveDb(db);
    }

    let logs: any[] = (db as any).aiAuditLogs || [];
    if (companyId > 0) {
      logs = logs.filter(l => l.company_id === companyId);
    }
    if (toolType) {
      logs = logs.filter(l => l.tool_type === toolType);
    }

    const totalRuns = logs.length;
    const totalTokens = logs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
    const totalPromptTokens = logs.reduce((acc, l) => acc + (l.prompt_tokens || 0), 0);
    const totalCompletionTokens = logs.reduce((acc, l) => acc + (l.completion_tokens || 0), 0);
    const totalCostEur = logs.reduce((acc, l) => acc + (l.cost_estimate_eur || 0), 0);
    const avgLatencyMs = totalRuns > 0 ? logs.reduce((acc, l) => acc + (l.total_latency_ms || 0), 0) / totalRuns : 0;
    const arbitratedCount = logs.filter(l => l.consensus_status === 'ARBITRATED').length;
    const unanimousCount = logs.filter(l => l.consensus_status === 'UNANIMOUS').length;

    return {
      status: 'success',
      company_id: companyId,
      kpis: {
        total_runs: totalRuns,
        total_tokens: totalTokens,
        total_prompt_tokens: totalPromptTokens,
        total_completion_tokens: totalCompletionTokens,
        total_cost_eur: Math.round(totalCostEur * 10000) / 10000,
        avg_latency_ms: Math.round(avgLatencyMs),
        arbitrated_rate: totalRuns > 0 ? Math.round((arbitratedCount / totalRuns) * 100) : 0,
        unanimous_rate: totalRuns > 0 ? Math.round((unanimousCount / totalRuns) * 100) : 0,
      },
      recent_logs: logs.slice(0, limit),
    };
  }
}

export const aiGovernanceService = new AiGovernanceService();
