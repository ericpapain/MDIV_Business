import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { prospectingService } from './prospecting.service';

export class ProspectingController {
  async handleLeadsKpis(ctx: RequestContext) {
    const kpis = prospectingService.getLeadsKpis();
    return sendJson(ctx.res, 200, kpis);
  }

  async handleLeadsSearch(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const results = await prospectingService.searchLeads(parsed.fields);
      return sendJson(ctx.res, 200, results);
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleProspectingGenerate(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const cid = ctx.companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const result = await prospectingService.generateProspectingPitch(parsed.fields, cid);
      return sendJson(ctx.res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleTendersSearch(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const sector = parsed.fields.sector || ctx.urlObj.searchParams.get('sector') || 'BTP & Construction';
      const results = await prospectingService.searchTenders(sector);
      return sendJson(ctx.res, 200, { success: true, tenders: results });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleEmailGenerate(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const cid = ctx.companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const text = await prospectingService.generateEmail(parsed.fields, cid);
      return sendJson(ctx.res, 200, { success: true, generatedText: text });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleEmailAnalyze(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const cid = ctx.companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const rawText = parsed.fields.text || '';
      const analysis = await prospectingService.analyzeEmail(rawText, cid);
      return sendJson(ctx.res, 200, { success: true, analysis });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleFollowupTargets(ctx: RequestContext) {
    const targets = prospectingService.getFollowupTargets(ctx.companyId);
    return sendJson(ctx.res, 200, targets);
  }

  async handleFollowupKpis(ctx: RequestContext) {
    return sendJson(ctx.res, 200, {
      totalDue: 4250,
      overdueCount: 2,
      recoveredThisMonth: 12800,
    });
  }

  async handleFollowupGenerate(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const cid = ctx.companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const result = await prospectingService.generateFollowupMessage(parsed.fields, cid);
      return sendJson(ctx.res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleFollowupSend(ctx: RequestContext, parsed: ParsedRequest) {
    return sendJson(ctx.res, 200, {
      success: true,
      message: "Relance programmée et archivée.",
    });
  }

  async handleContentGenerate(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const cid = ctx.companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const result = await prospectingService.generateContent(parsed.fields, cid);
      return sendJson(ctx.res, 200, result);
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleContentBrandSettings(ctx: RequestContext, parsed?: ParsedRequest) {
    return sendJson(ctx.res, 200, {
      tone: 'Professionnel, visionnaire et axé sur les résultats concrets',
      editorialGuide: "Privilégier les exemples chiffrés, le pragmatisme opérationnel et la souveraineté des données d'entreprise.",
      keywords: 'Intelligence Artificielle, ROI, Transformation Digitale, Automatisation, Productivité, PME'
    });
  }

  async handleContentKpis(ctx: RequestContext) {
    return sendJson(ctx.res, 200, {
      totalGenerated: 64,
      wordsGenerated: 28400,
      activeCampaigns: 8,
      timeSavedHours: 42
    });
  }

  async handleContentHistory(ctx: RequestContext) {
    return sendJson(ctx.res, 200, [
      {
        id: 'cont_1',
        sourceType: 'text',
        sourceTitle: "Comment l'IA libère 30% du temps des dirigeants de PME",
        date: new Date().toLocaleDateString('fr-FR'),
        channels: ['LinkedIn', 'X (Twitter)'],
        isFavorite: true
      },
      {
        id: 'cont_2',
        sourceType: 'url',
        sourceTitle: "Guide de sélection d'un LLM souverain en 2026",
        date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('fr-FR'),
        channels: ['Article Blog', 'Newsletter'],
        isFavorite: false
      }
    ]);
  }

  async handleContentExport(ctx: RequestContext, parsed: ParsedRequest) {
    let contents: any[] = [];
    try {
      contents = JSON.parse(parsed.fields.content_data || '[]');
    } catch {
      contents = [];
    }
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Contenus générés - MDIV Business</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; line-height: 1.6; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
    .channel { display: inline-block; background: #0A66C2; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
    .btn { background: #0A66C2; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
    @media print { .btn { display: none; } }
  </style>
</head>
<body>
  <button class="btn" onclick="window.print()">Imprimer / Sauvegarder</button>
  <h1>MDIV Business - Contenus Éditoriaux Multi-Canaux</h1>
  <p style="color: #64748b;">Date : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</p>
  ${contents.map(item => `
    <div class="card">
      <span class="channel">${item.channel || 'Canal'}</span>
      ${item.title ? `<h3 style="margin-top: 5px;">${item.title}</h3>` : ''}
      <p style="white-space: pre-wrap;">${item.body || ''}</p>
      ${item.hashtags && item.hashtags.length ? `<p style="color: #0284c7; font-size: 13px;">${item.hashtags.join(' ')}</p>` : ''}
    </div>
  `).join('')}
</body>
</html>`;
    ctx.res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    ctx.res.end(html);
  }
}

export const prospectingController = new ProspectingController();
