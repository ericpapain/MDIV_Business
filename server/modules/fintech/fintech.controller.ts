import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { fintechService, sepaXmlStore } from './fintech.service';

export class FintechController {
  async handleSepaPayment(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, urlObj } = ctx;
    try {
      if (urlObj.searchParams.get('download') === '1') {
        const batchId = urlObj.searchParams.get('batchId') || 'SEPA-BATCH';
        const xml = sepaXmlStore.get(batchId) || '<?xml version="1.0" encoding="UTF-8"?><Document/>';
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="sepa-${batchId}.xml"`);
        return res.end(xml);
      }

      const result = fintechService.generateSepaPayment(parsed.fields);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleBankReconciliation(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, companyId } = ctx;
    try {
      if (method === 'POST' && parsed.fields.action === 'reconcile') {
        return sendJson(res, 200, {
          success: true,
          message: "Rapprochement bancaire enregistré avec succès.",
          reconciled_at: new Date().toISOString(),
        });
      }

      const data = fintechService.getBankReconciliationQueue(companyId);
      return sendJson(res, 200, { success: true, ...data });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleFecExport(ctx: RequestContext) {
    const { res, urlObj, companyId } = ctx;
    try {
      if (urlObj.searchParams.get('download') === '1') {
        const result = fintechService.getFecData(companyId, true);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="FEC_MDIV_2026.txt"');
        return res.end(result.text);
      }

      const stats = fintechService.getFecData(companyId, false);
      return sendJson(res, 200, stats);
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const fintechController = new FintechController();
