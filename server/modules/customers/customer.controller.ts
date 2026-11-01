import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { customerService } from './customer.service';

export class CustomerController {
  async handleClients(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method } = ctx;
    const cid = Number(ctx.urlObj?.searchParams.get('company_id')) || ctx.companyId || (parsed.fields ? Number(parsed.fields.company_id || parsed.fields.companyId) : undefined) || 1;
    try {
      if (method === 'GET') {
        const clients = customerService.getClients(cid);
        return sendJson(res, 200, clients);
      }

      if (method === 'POST') {
        const result = customerService.createClient(cid, parsed.fields);
        return sendJson(res, 200, { success: true, ...result });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleContextHub(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, urlObj, companyId } = ctx;
    const action = urlObj.searchParams.get('action') || parsed.fields.action || '';
    const clientId = Number(urlObj.searchParams.get('client_id') || parsed.fields.client_id || 0);

    try {
      if (action === 'get_client_360') {
        const data = customerService.getClient360(companyId, clientId);
        return sendJson(res, 200, { success: true, ...data });
      }

      if (action === 'save_interaction') {
        const data = customerService.saveInteraction(companyId, clientId, parsed.fields);
        return sendJson(res, 200, { success: true, ...data });
      }

      if (action === 'contextual_email_reply') {
        const data = await customerService.generateContextualEmailReply(companyId, clientId, parsed.fields);
        return sendJson(res, 200, { success: true, ...data });
      }

      if (action === 'bind_modules') {
        const data = customerService.bindModules(companyId, clientId, parsed.fields);
        return sendJson(res, 200, { success: true, ...data });
      }

      return sendJson(res, 400, { success: false, error: "Action inconnue." });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const customerController = new CustomerController();
