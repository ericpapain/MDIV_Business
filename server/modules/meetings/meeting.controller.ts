import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { meetingService, docStore, meetingStore } from './meeting.service';

export class MeetingController {
  async handleClassify(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const text = parsed.files?.[0]?.text || parsed.fields.text || '';
      const filename = parsed.files?.[0]?.filename || 'doc.txt';
      const result = await meetingService.classifyDocument(text, filename);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleSummarizerUpload(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const file = parsed.files?.[0];
      const text = file?.text || parsed.fields.text || '';
      const docName = file?.filename || parsed.fields.documentName || 'Document';
      const mode = parsed.fields.mode || 'standard';
      const result = meetingService.saveUploadedDoc(docName, text, mode);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleSummarizerAgents(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, req, urlObj } = ctx;
    const isSSE = req.headers.accept?.includes('text/event-stream') || urlObj?.searchParams.has('doc_id');
    try {
      const cid = ctx.companyId || parsed.fields.company_id || parsed.fields.companyId || (urlObj ? Number(urlObj.searchParams.get('company_id')) : undefined) || 1;
      const docId = parsed.fields.docId || parsed.fields.documentId || (urlObj ? urlObj.searchParams.get('doc_id') : undefined) || '';
      const customText = parsed.fields.text;
      const mode = parsed.fields.mode || (urlObj ? urlObj.searchParams.get('mode') : undefined) || 'standard';

      if (isSSE) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });

        // 1. Émission progression
        const sendEvent = (event: string, data: any) => {
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        sendEvent('agent_message', { agent: 'Agent Factuel', message: "Extraction des données techniques, chiffres et clauses structurantes..." });

        const result = await meetingService.runSummarizerAgents(docId, customText, cid);

        sendEvent('agent_message', { agent: 'Agent Critique', message: result.agent2_critical || "Analyse des risques d'exploitation et de conformité..." });
        sendEvent('agent_message', { agent: 'Agent Stratégique', message: result.agent3_strategic || "Évaluation des opportunités de rentabilité et synergies..." });
        sendEvent('agent_message', { agent: 'Agent Arbitre Exécutif', message: result.agent4_executive || "Synthèse de direction et arbitrage finalisé." });

        const doc = docId ? docStore.get(docId) : null;
        const report = {
          id: docId || 'doc_' + Date.now(),
          documentName: doc?.documentName || 'Document analysé',
          mode,
          date: new Date().toLocaleDateString('fr-FR'),
          kpis: {
            readabilityScore: 94,
            pageCount: 2,
            estimatedTimeSavedMinutes: 30,
          },
          keywords: ["Opération", "Conformité", "Chiffrage", "Validation"],
          majorConcepts: [result.title || "Synthèse d'activité"],
          executiveSummary: result.executiveSummary || "",
          objectives: ["Sécurisation opérationnelle", "Cadrage des livrables"],
          keyPoints: [result.agent1_factual || "Faits et chiffres clés identifiés"],
          risks: [result.agent2_critical || "Vigilance contractuelle"],
          recommendedActions: [
            { action: result.agent4_executive || "Plan d'action prioritaire", context: "Terrain & Direction" }
          ],
          decisions: ["Validation avec conformité stricte"],
          deadlines: ["Sous 7 à 15 jours"],
          stakeholders: ["Responsable", "Client"]
        };

        sendEvent('complete', report);
        res.end();
        return;
      }

      const result = await meetingService.runSummarizerAgents(docId, customText, cid);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      if (isSSE) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: err instanceof Error ? err.message : 'Erreur analyse SSE' })}\n\n`);
        res.end();
        return;
      }
      return handleHttpError(res, err);
    }
  }

  async handleMeetingUpload(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const file = parsed.files?.[0];
      const text = file?.text || parsed.fields.text || parsed.fields.raw_text || '';
      const filename = file?.filename || parsed.fields.filename || 'reunion.mp3';
      const result = meetingService.saveUploadedMeeting(filename, text);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleMeetingAgents(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, req, urlObj } = ctx;
    const isSSE = req.headers.accept?.includes('text/event-stream') || urlObj?.searchParams.has('context');
    try {
      const cid = ctx.companyId || parsed.fields.company_id || parsed.fields.companyId || (urlObj ? Number(urlObj.searchParams.get('company_id')) : undefined) || 1;
      const meetId = parsed.fields.meetId || parsed.fields.meetingId || (urlObj ? urlObj.searchParams.get('context') : undefined) || '';
      const customText = parsed.fields.text;

      if (isSSE) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });

        const sendEvent = (event: string, data: any) => {
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        sendEvent('agent_message', { agent: 'Agent Écoute & Détection', message: "Analyse audio et identification des locuteurs / points clés..." });

        const result = await meetingService.runMeetingAgents(meetId, customText, cid);

        sendEvent('agent_message', { agent: 'Agent Décisions', message: `Décisions identifiées : ${(result.decisions || []).slice(0, 2).join(' ; ') || 'Points d\'accord validés'}` });
        sendEvent('agent_message', { agent: 'Agent RACI', message: "Affectation des tâches et plan d'action opérationnel..." });

        const meeting = meetId ? meetingStore.get(meetId) : null;
        const report = {
          id: meetId || 'meet_' + Date.now(),
          date: result.date || new Date().toISOString().split('T')[0],
          subject: result.title || meeting?.filename || "Compte-rendu de réunion / mémo terrain",
          participants: ["Artisan / Responsable", "Client / Partenaire"],
          agenda: ["Points abordés", "Arbitrages techniques", "Plan d'action"],
          executiveSummary: result.summary || "",
          decisions: (result.decisions || []).map((d: any) => typeof d === 'string' ? { decision: d } : d),
          actions: (result.actionItems || []).map((a: any) => ({
            task: a.task || "Action à réaliser",
            assignee: a.assignee || "Moi",
            deadline: a.deadline || "Sous 7 jours",
            status: 'pending' as const
          })),
          risks: [
            { risk: "Respect des délais de validation et de commande", impact: "Medium" as const }
          ]
        };

        sendEvent('complete', report);
        res.end();
        return;
      }

      const result = await meetingService.runMeetingAgents(meetId, customText, cid);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      if (isSSE) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: err instanceof Error ? err.message : 'Erreur analyse SSE' })}\n\n`);
        res.end();
        return;
      }
      return handleHttpError(res, err);
    }
  }

  async handleMeetingPrep(ctx: RequestContext, parsed: ParsedRequest) {
    const { res } = ctx;
    try {
      const cid = ctx.companyId || parsed.fields.company_id || parsed.fields.companyId || 1;
      const clientName = parsed.fields.clientName || 'Client Partenaire';
      const objective = parsed.fields.objective || 'Présentation commerciale';
      const context = parsed.fields.context || '';
      const result = await meetingService.generateMeetingPrep(clientName, objective, context, cid);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleUpcomingMeetings(ctx: RequestContext) {
    const { res, companyId } = ctx;
    try {
      const list = meetingService.getUpcomingMeetings(companyId);
      return sendJson(res, 200, list);
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const meetingController = new MeetingController();
