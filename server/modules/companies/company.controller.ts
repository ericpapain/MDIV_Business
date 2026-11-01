import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { companyService } from './company.service';

export class CompanyController {
  async handleProfile(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, companyId } = ctx;
    try {
      if (method === 'GET') {
        const profile = companyService.getProfile(companyId);
        return sendJson(res, 200, { success: true, company: profile });
      }

      if (method === 'POST') {
        const updated = companyService.updateProfile(companyId, parsed.fields);
        return sendJson(res, 200, { success: true, company: updated });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleSearch(ctx: RequestContext) {
    const { res, urlObj } = ctx;
    try {
      const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '';
      const results = await companyService.searchInsee(q);
      return sendJson(res, 200, { results });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const companyController = new CompanyController();
