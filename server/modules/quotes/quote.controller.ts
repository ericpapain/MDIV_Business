import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { quoteService } from './quote.service';

export class QuoteController {
  async handleQuotes(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj, companyId } = ctx;
    try {
      if (method === 'GET') {
        const list = quoteService.getQuotes(companyId);
        return sendJson(res, 200, list);
      }
      if (method === 'POST') {
        const quote = quoteService.saveQuote(companyId, parsed.fields);
        return sendJson(res, 200, { success: true, quote });
      }
      if (method === 'DELETE') {
        const id = urlObj.searchParams.get('id');
        quoteService.deleteQuote(companyId, id!);
        return sendJson(res, 200, { success: true });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleProjects(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj, companyId } = ctx;
    try {
      if (method === 'GET') {
        const list = quoteService.getProjects(companyId);
        return sendJson(res, 200, list);
      }
      if (method === 'POST') {
        const project = quoteService.saveProject(companyId, parsed.fields);
        return sendJson(res, 200, { success: true, project });
      }
      if (method === 'DELETE') {
        const id = urlObj.searchParams.get('id');
        quoteService.deleteProject(companyId, id!);
        return sendJson(res, 200, { success: true });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleAiAssist(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, companyId } = ctx;
    try {
      const clientName = parsed.fields.clientName || parsed.fields.clientContext || 'Client';
      const sector = parsed.fields.sector || '';
      const objective = parsed.fields.objective || parsed.fields.projectDescription || '';
      const cid = companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const result = await quoteService.assistQuoteGeneration(clientName, sector, objective, cid, parsed.fields);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const quoteController = new QuoteController();
