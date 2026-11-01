import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { ragService } from './rag.service';

export class RagController {
  async handleIndex(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, companyId } = ctx;
    try {
      const file = parsed.files?.[0];
      const text = file?.text || parsed.fields.text || '';
      const docName = file?.filename || parsed.fields.document_name || 'Document';
      const category = parsed.fields.category || 'general';
      const result = ragService.indexDocument(companyId, docName, text, category);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleQuery(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, companyId } = ctx;
    try {
      const query = parsed.fields.query || '';
      const result = await ragService.queryRag(companyId, query);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleFeedback(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, companyId } = ctx;
    try {
      const result = ragService.recordFeedback(companyId, parsed.fields);
      return sendJson(res, 200, { success: true, feedback: result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const ragController = new RagController();
