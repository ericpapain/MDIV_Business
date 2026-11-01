import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { expenseService } from './expense.service';

export class ExpenseController {
  async handleExpenses(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj, companyId } = ctx;
    try {
      if (method === 'GET') {
        const list = expenseService.getExpenses(companyId);
        return sendJson(res, 200, list);
      }
      if (method === 'POST') {
        const exp = expenseService.saveExpense(companyId, parsed.fields);
        return sendJson(res, 200, { success: true, expense: exp });
      }
      if (method === 'DELETE') {
        const id = urlObj.searchParams.get('id');
        expenseService.deleteExpense(companyId, id!);
        return sendJson(res, 200, { success: true });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleExtractLines(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, companyId } = ctx;
    try {
      const ocrText = parsed.fields.ocr_text || '';
      const cid = companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const result = await expenseService.extractLinesFromOcr(ocrText, cid, parsed.fields);
      return sendJson(res, 200, result);
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleOcrVisionParse(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, companyId } = ctx;
    try {
      const imageBase64 = parsed.fields.imageBase64 || parsed.fields.image || '';
      const cid = companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const extracted = await expenseService.parseOcrVision(imageBase64, cid);
      return sendJson(res, 200, { success: true, extracted });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleOcrDocumentVision(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const imageBase64 = parsed.fields.imageBase64 || parsed.fields.image || '';
      const docType = parsed.fields.document_type || 'auto';
      const highAcc = !!parsed.fields.high_accuracy;
      const result = await expenseService.parseOcrDocumentVision(imageBase64, docType, highAcc);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const expenseController = new ExpenseController();
