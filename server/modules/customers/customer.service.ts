import { getDb, saveDb } from '../../database/db-connection';
import { isValidLuhnBackend } from '../../shared/utils/luhn.utils';
import { computeFrenchVatBackend } from '../../shared/utils/vat.utils';
import { callLLM } from '../../integrations/llm/llm-orchestrator';
import { ApiError } from '../../shared/errors/api-error';
import { resolveBackendPersona, buildBackendPersonaSystemPrompt } from '../../shared/persona/persona-prompt.builder';

export class CustomerService {
  getClients(companyId: number) {
    const db = getDb();
    let results = db.clients || [];
    if (companyId) {
      results = results.filter((c: any) => !c.company_id || Number(c.company_id) === Number(companyId));
    }
    return results;
  }

  createClient(companyId: number, fields: any) {
    const name = (fields.name || '').trim();
    if (!name) {
      throw ApiError.badRequest("Le nom du client est obligatoire.");
    }

    const rawSiren = (fields.siren || '').replace(/\s+/g, '');
    const rawSiret = (fields.siret || '').replace(/\s+/g, '');

    if (rawSiret && !isValidLuhnBackend(rawSiret)) {
      throw ApiError.unprocessable("Le numéro SIRET fourni est invalide (contrôle de clé de Luhn échoué).");
    }

    const sirenFinal = rawSiren || (rawSiret.length >= 9 ? rawSiret.slice(0, 9) : '');
    const vatNumber = fields.vat_number || computeFrenchVatBackend(sirenFinal);

    const db = getDb();
    if (!db.clients) db.clients = [];

    const clientCompanyId = fields.company_id ? parseInt(fields.company_id, 10) : companyId;

    const existing = db.clients.find((c: any) =>
      c.company_id === clientCompanyId && (
        (rawSiret && c.siret === rawSiret) ||
        (sirenFinal && c.siren === sirenFinal) ||
        (c.name.toLowerCase() === name.toLowerCase())
      )
    );

    if (existing) {
      return { client: existing, isExisting: true };
    }

    const newClient = {
      id: Date.now(),
      company_id: clientCompanyId,
      name,
      company: fields.company || name,
      siren: sirenFinal,
      siret: rawSiret,
      vat_number: vatNumber,
      country_code: fields.country_code || fields.countryCode || 'FR',
      postal_code: fields.postal_code || fields.postalCode || '',
      city: fields.city || '',
      ppf_routing_id: fields.ppf_routing_id || fields.ppfRoutingId || '',
      email: fields.email || '',
      phone: fields.phone || '',
      address: fields.address || '',
      notes: fields.notes || '',
      createdAt: new Date().toISOString(),
    };

    db.clients.push(newClient);
    saveDb(db);
    return { client: newClient, isExisting: false };
  }

  getClient360(companyId: number, clientId: number) {
    const db = getDb();
    let client = (db.clients || []).find((c: any) => Number(c.id) === clientId);
    if (!client) {
      client = {
        id: clientId || 1,
        company_id: companyId,
        name: "Cabinet & Partenaires Associés",
        company: "Cabinet & Partenaires",
        email: "direction@cabinet-associes.fr",
        phone: "01 42 68 00 00",
        address: "48 Rue de la Paix, 75002 Paris",
        notes: "Client grand compte, facturation à 30 jours net",
      };
    }

    const interactions = ((db as any).client_interactions || []).filter((i: any) => Number(i.client_id) === Number(client.id));
    const quotes = (db.quotes || []).filter((q: any) => Number(q.client_id || q.clientId) === Number(client.id));
    const invoices = (db.invoices || []).filter((inv: any) => Number(inv.client_id || inv.clientId) === Number(client.id));

    const pendingQuotesCount = quotes.filter((q: any) => ['draft', 'sent', 'pending'].includes(q.status)).length;
    let overdueInvoicesCount = 0;
    let totalOverdueAmount = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    invoices.forEach((inv: any) => {
      if (inv.status === 'overdue' || (inv.status === 'pending' && inv.due_date && inv.due_date < todayStr)) {
        overdueInvoicesCount++;
        totalOverdueAmount += Number(inv.amount_ttc || inv.total_ttc || inv.amountTTC || 0);
      }
    });

    let executive_context = `Client ${client.company || client.name}. `;
    if (pendingQuotesCount > 0) executive_context += `${pendingQuotesCount} devis en cours d'arbitrage. `;
    if (overdueInvoicesCount > 0) {
      executive_context += `ATTENTION : ${overdueInvoicesCount} facture(s) en retard (${totalOverdueAmount.toFixed(2)} € TTC). `;
    } else {
      executive_context += `Situation financière saine, aucun arriéré. `;
    }

    return {
      client,
      interactions,
      quotes,
      invoices,
      financial_summary: {
        pending_quotes_count: pendingQuotesCount,
        overdue_invoices_count: overdueInvoicesCount,
        total_overdue_amount: totalOverdueAmount,
      },
      executive_context,
    };
  }

  saveInteraction(companyId: number, clientId: number, fields: any) {
    const db = getDb();
    if (!(db as any).client_interactions) (db as any).client_interactions = [];
    const interactionId = Date.now();
    const newInter = {
      id: interactionId,
      company_id: companyId,
      client_id: clientId,
      direction: fields.direction || 'inbound',
      channel: fields.channel || 'email',
      subject: fields.subject || 'Échange sans objet',
      body_text: fields.body_text || '',
      summary: fields.summary || (fields.body_text ? fields.body_text.slice(0, 140) + '...' : ''),
      sentiment: fields.sentiment || 'neutral',
      reference_id: fields.reference_id || null,
      created_at: new Date().toISOString(),
    };
    (db as any).client_interactions.unshift(newInter);
    saveDb(db);
    return { interactionId };
  }

  async generateContextualEmailReply(companyId: number, clientId: number, fields: any) {
    const incomingText = fields.incoming_email_text || '';
    const tone = fields.tone || 'Professionnel';
    const objective = fields.objective || 'Réponse stratégique';
    const customInstructions = fields.custom_instructions || '';

    const db = getDb();
    const client = (db.clients || []).find((c: any) => Number(c.id) === clientId);
    const clientName = client ? client.name : 'Client';
    const clientCompany = client ? client.company : '';

    const overdueInvoices = (db.invoices || []).filter(
      (inv: any) => Number(inv.client_id || inv.clientId) === clientId && (inv.status === 'overdue' || inv.status === 'pending')
    );
    const financialWarning = overdueInvoices.length > 0 ? `Attention : ${overdueInvoices.length} facture(s) en attente ou impayée(s) pour ce client.` : '';

    const persona = resolveBackendPersona(companyId);
    const personaPrompt = buildBackendPersonaSystemPrompt(persona, "Réponse contextuelle à un e-mail client avec historique CRM");

    const prompt = `${personaPrompt}

=== MISSION : RÉPONSE E-MAIL CLIENT CONTEXTUALISÉE ===
Tu rédiges la réponse au nom de l'entreprise (${persona.companyName} — ${persona.metierLabel}).
Destinataire : ${clientName} (${clientCompany || 'Client particulier / professionnel'})
Ton souhaité : ${tone}
Objectif : ${objective}
${financialWarning ? `${financialWarning}` : ''}
${customInstructions ? `Instructions spécifiques : ${customInstructions}` : ''}

Consignes impératives :
1. Reste fidèle au métier (${persona.specificActivity || persona.metierLabel}) : utilise les expressions et le vocabulaire technique réalistes.
2. Emploie "je" si artisan/indépendant seul (${persona.profile}), ou "nous" si équipe.
3. Rédige un message clair, poli, prêt à l'envoi.

Réponds STRICTEMENT en format JSON :
{
  "subject": "Objet précis et professionnel",
  "body": "Corps du message complet avec salutations et signature"
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: `EMAIL REÇU :\n"""\n${incomingText}\n"""\nGénère la réponse JSON.` }
    ], true);

    const content = aiRes?.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    return {
      reply_text: parsed.body || "Impossible de générer le corps de l'email.",
      subject: parsed.subject || "Sans objet",
      context_summary: {
        client_name: clientName,
        client_company: clientCompany,
        tone_applied: tone,
        has_financial_warning: !!financialWarning,
      },
    };
  }

  bindModules(companyId: number, clientId: number, fields: any) {
    const db = getDb();
    if (!(db as any).cross_module_bindings) (db as any).cross_module_bindings = [];
    const linkId = Date.now();
    const newLink = {
      id: linkId,
      company_id: companyId,
      client_id: clientId,
      source_module: fields.source_module,
      source_id: fields.source_id,
      target_module: fields.target_module,
      target_id: fields.target_id,
      link_type: fields.link_type || 'referenced_by',
      created_at: new Date().toISOString(),
    };
    (db as any).cross_module_bindings.unshift(newLink);
    saveDb(db);
    return { linkId };
  }
}

export const customerService = new CustomerService();
