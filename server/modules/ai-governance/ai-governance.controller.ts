import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { aiGovernanceService } from './ai-governance.service';

export class AiGovernanceController {
  async handleSettings(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method } = ctx;
    try {
      if (method === 'GET') {
        const settings = aiGovernanceService.getSettings();
        return sendJson(res, 200, { success: true, settings });
      }
      if (method === 'POST') {
        const saved = aiGovernanceService.saveSettings(parsed.fields);
        return sendJson(res, 200, { success: true, settings: saved });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleTestProvider(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const provider = parsed.fields.provider || 'groq';
      const model = parsed.fields.model;
      const result = await aiGovernanceService.testProvider(provider, model);
      return sendJson(res, 200, result);
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleTelemetry(ctx: RequestContext) {
    const { res, urlObj, companyId } = ctx;
    try {
      const toolType = urlObj.searchParams.get('tool_type') || undefined;
      const limit = Number(urlObj.searchParams.get('limit') || 25);
      const data = aiGovernanceService.getTelemetry(companyId, toolType, limit);
      return sendJson(res, 200, data);
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const aiGovernanceController = new AiGovernanceController();
