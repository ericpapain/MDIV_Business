import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { personaService } from './persona.service';

export class PersonaController {
  async handlePersona(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, companyId, urlObj } = ctx;
    try {
      const qCompanyId = urlObj.searchParams.get('company_id') || urlObj.searchParams.get('id');
      const cid = qCompanyId ? parseInt(qCompanyId, 10) : (companyId || 1);

      if (method === 'GET') {
        const persona = personaService.getPersona(cid);
        return sendJson(res, 200, { success: true, persona });
      }

      if (method === 'POST') {
        const payload = parsed.fields || {};
        const saved = personaService.savePersona(cid, payload);
        return sendJson(res, 200, { success: true, persona: saved });
      }

      return sendJson(res, 405, { error: 'Method Not Allowed' });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const personaController = new PersonaController();

