import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { diagnosticService } from './diagnostic.service';

export class DiagnosticController {
  async handleStep(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const answers = parsed.fields.answers || [];
      const step = Number(parsed.fields.step) || 1;
      const result = await diagnosticService.processDiagnosticStep(answers, step);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleAgents(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const answers = parsed.fields.answers || [];
      const result = await diagnosticService.runDiagnosticAgents(answers);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleDeepDive(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const answers = parsed.fields.answers || [];
      const sector = parsed.fields.sector || 'PME & Services';
      const result = await diagnosticService.runDeepDive(answers, sector);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const diagnosticController = new DiagnosticController();
