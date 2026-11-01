import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { invoiceService, generatedXmlStore } from './invoice.service';

export class InvoiceController {
  async handleInvoices(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj, companyId } = ctx;
    try {
      if (method === 'GET') {
        const list = invoiceService.getInvoices(companyId);
        return sendJson(res, 200, list);
      }
      if (method === 'POST') {
        const inv = invoiceService.saveInvoice(companyId, parsed.fields);
        return sendJson(res, 200, { success: true, invoice: inv });
      }
      if (method === 'DELETE') {
        const id = urlObj.searchParams.get('id');
        invoiceService.deleteInvoice(companyId, id!);
        return sendJson(res, 200, { success: true });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleKpis(ctx: RequestContext) {
    const { res, companyId } = ctx;
    try {
      const kpis = invoiceService.getInvoicesKpis(companyId);
      return sendJson(res, 200, kpis);
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleAiCheck(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, companyId } = ctx;
    try {
      const cid = companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const result = await invoiceService.checkInvoiceAi(parsed.fields, cid);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleFacturXGenerator(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, urlObj } = ctx;
    try {
      if (urlObj.searchParams.get('download') === '1') {
        const invNumber = urlObj.searchParams.get('invoiceNumber') || 'FACTURE';
        const xml = generatedXmlStore.get(invNumber) || '<?xml version="1.0" encoding="UTF-8"?><FacturX/>';
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="factur-x-${invNumber}.xml"`);
        return res.end(xml);
      }

      const result = invoiceService.generateFacturXXml(parsed.fields);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handlePpfVerify(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, urlObj } = ctx;
    try {
      const query = urlObj.searchParams.get('siret') || urlObj.searchParams.get('siren') || parsed.fields.siret || parsed.fields.siren || '';
      const result = invoiceService.verifyPpfDirectory(query);
      return sendJson(res, 200, result);
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handlePpfDeposit(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const invoiceId = parsed.fields.invoiceId || parsed.fields.id;
      const targetStatus = parsed.fields.status || parsed.fields.targetStatus;
      const rejectionReason = parsed.fields.rejectionReason || parsed.fields.rejection_reason;
      const result = invoiceService.depositPpfStatus(invoiceId, targetStatus, rejectionReason);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const invoiceController = new InvoiceController();
