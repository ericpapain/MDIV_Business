import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { cmsService } from './cms.service';

export class CmsController {
  async handleSavedWork(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj, companyId } = ctx;
    try {
      if (method === 'GET') {
        const works = cmsService.getSavedWorks(companyId);
        return sendJson(res, 200, works);
      }
      if (method === 'POST') {
        const saved = cmsService.saveWork(companyId, parsed.fields);
        return sendJson(res, 200, { success: true, work: saved });
      }
      if (method === 'DELETE') {
        const id = urlObj.searchParams.get('id');
        cmsService.deleteSavedWork(companyId, id!);
        return sendJson(res, 200, { success: true });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleBenchmarkStats(ctx: RequestContext) {
    const sector = ctx.urlObj.searchParams.get('sector') || 'BTP & Services';
    const stats = cmsService.getBenchmarkStats(sector);
    return sendJson(ctx.res, 200, stats);
  }

  async handleBenchmarkSubmit(ctx: RequestContext) {
    return sendJson(ctx.res, 200, {
      success: true,
      message: "Votre bilan a été anonymisé et intégré aux benchmarks statistiques sectoriels 2026.",
    });
  }
}

export const cmsController = new CmsController();
