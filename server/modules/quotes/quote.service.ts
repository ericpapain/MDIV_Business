import { getDb, saveDb } from '../../database/db-connection';
import { callLLM } from '../../integrations/llm/llm-orchestrator';
import { resolveBackendPersona, buildBackendPersonaSystemPrompt } from '../../shared/persona/persona-prompt.builder';

export class QuoteService {
  getQuotes(companyId: number) {
    const db = getDb();
    let results = db.quotes || [];
    if (companyId) {
      results = results.filter((q: any) => q.company_id === companyId);
    }
    return results;
  }

  saveQuote(companyId: number, fields: any) {
    const db = getDb();
    if (!db.quotes) db.quotes = [];

    const quoteCompanyId = fields.company_id ? parseInt(fields.company_id, 10) : (companyId || 1);

    let clientName = fields.clientName;
    if (!clientName && fields.clientId && db.clients) {
      const foundClient = db.clients.find((c: any) => String(c.id) === String(fields.clientId));
      if (foundClient) clientName = foundClient.company || foundClient.name;
    }

    const newQuote = {
      id: fields.id || ('dev_' + Date.now()),
      company_id: quoteCompanyId,
      clientId: fields.clientId || null,
      clientName: clientName || 'Client Partenaire',
      quoteNumber: fields.quoteNumber || ('DEV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)),
      date: fields.date || new Date().toISOString().split('T')[0],
      totalHT: Number(fields.totalHT) || 0,
      totalVAT: Number(fields.totalVAT) || 0,
      totalTTC: Number(fields.totalTTC) || 0,
      status: fields.status || 'draft',
      executiveSummary: fields.executiveSummary || '',
      paymentTerms: fields.paymentTerms || 'Acompte 30% à la commande, solde à 30 jours.',
      lines: Array.isArray(fields.lines) ? fields.lines : [],
      createdAt: new Date().toISOString(),
    };

    const existingIdx = db.quotes.findIndex((q: any) => q.id === newQuote.id);
    if (existingIdx >= 0) {
      db.quotes[existingIdx] = newQuote;
    } else {
      db.quotes.unshift(newQuote);
    }
    saveDb(db);
    return newQuote;
  }

  deleteQuote(companyId: number, quoteId: string) {
    const db = getDb();
    if (!db.quotes) return true;
    db.quotes = db.quotes.filter((q: any) => {
      if (String(q.id) === String(quoteId)) {
        if (companyId && q.company_id !== companyId) return true;
        return false;
      }
      return true;
    });
    saveDb(db);
    return true;
  }

  getProjects(companyId: number) {
    const db = getDb();
    let results = db.projects || [];
    if (companyId) {
      results = results.filter((p: any) => p.company_id === companyId);
    }
    return results;
  }

  saveProject(companyId: number, fields: any) {
    const db = getDb();
    if (!db.projects) db.projects = [];

    const projectCompanyId = fields.company_id ? parseInt(fields.company_id, 10) : (companyId || 1);

    let clientName = fields.clientName;
    if (!clientName && fields.clientId && db.clients) {
      const foundClient = db.clients.find((c: any) => String(c.id) === String(fields.clientId));
      if (foundClient) clientName = foundClient.company || foundClient.name;
    }

    const newProject = {
      id: fields.id || ('prj_' + Date.now()),
      company_id: projectCompanyId,
      clientId: fields.clientId || null,
      clientName: clientName || 'Client Partenaire',
      quoteId: fields.quoteId || null,
      title: fields.title || 'Projet Commercial',
      description: fields.description || '',
      budget: Number(fields.budget) || 0,
      status: fields.status || 'in_progress',
      startDate: fields.startDate || new Date().toISOString().split('T')[0],
      endDate: fields.endDate || '',
      createdAt: new Date().toISOString(),
    };

    const existingIdx = db.projects.findIndex((p: any) => p.id === newProject.id);
    if (existingIdx >= 0) {
      db.projects[existingIdx] = newProject;
    } else {
      db.projects.unshift(newProject);
    }
    saveDb(db);
    return newProject;
  }

  deleteProject(companyId: number, projectId: string) {
    const db = getDb();
    if (!db.projects) return true;
    db.projects = db.projects.filter((p: any) => {
      if (String(p.id) === String(projectId)) {
        if (companyId && p.company_id !== companyId) return true;
        return false;
      }
      return true;
    });
    saveDb(db);
    return true;
  }

  async assistQuoteGeneration(clientName: string, sector: string, objective: string, companyId?: number, fields?: any) {
    const persona = resolveBackendPersona(companyId, fields);
    const personaSystem = buildBackendPersonaSystemPrompt(persona, "Estimation et chiffrage d'un devis professionnel détaillé");

    const prompt = `${personaSystem}

Tu es l'estimateur et métreur professionnel de référence pour cette entreprise (${persona.companyName} — ${persona.metierLabel}).
Génère une proposition de lignes de devis réalistes, exhaustives et parfaitement adaptées au métier "${persona.metierLabel}" (Activité : "${persona.customMetier || persona.activity || persona.metierLabel}") pour le client "${clientName}".
Objectif / Demande formulée : "${objective || 'Prestation complète selon les règles de l’art'}".

EXIGENCES MÉTIER & TARIFAIRES CRITIQUES :
1. Chaque ligne doit être formulée avec le vocabulaire technique authentique de cette profession (fourniture, pose, matériel, main-d'œuvre, dépose, évacuation, mise en service selon le cas).
2. Quantités et unités usuelles crédibles (ex: m², ml, heure, forfait, ensemble, unité, etc.).
3. Taux de TVA français en vigueur pour ce type de prestation (10% pour rénovation habitat, 5.5% pour rénovation énergétique, 20% standard, 0% pour auto-entrepreneur franchise).
4. OBLIGATION ABSOLUE DE CHIFFRAGE SUR LES PRIX UNITAIRES (unitPriceHT) :
   - Tu DOIS IMPÉRATIVEMENT attribuer un prix unitaire HT réaliste supérieur à 0 pour chaque ligne (ex: 45 €/h, 65 €/h, 180 € forfait, 450 €, 1 200 € selon le matériel ou la prestation).
   - Ne mets JAMAIS 0 € ni un prix vide. L'artisan pourra ensuite ajuster ces montants librement sur l'interface, mais le devis doit être pré-chiffré de manière crédible.

Réponds STRICTEMENT par un JSON valide :
{
  "executiveSummary": "Synthèse professionnelle courte et rassurante de l'intervention pour le client",
  "paymentTerms": "Conditions de règlement adaptées (ex: acompte 30% à la commande, solde à réception)",
  "suggestedLines": [
    { "id": "1", "description": "Désignation technique précise", "quantity": 1, "unitPriceHT": 450, "vatRate": 10 }
  ]
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: `Génère le chiffrage détaillé avec prix unitaires réalistes pour : ${objective || clientName}` }
    ], true);

    const content = aiRes?.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    // Normalisation défensive des lignes et des prix unitaires HT
    const rawLines = Array.isArray(parsed.suggestedLines)
      ? parsed.suggestedLines
      : (Array.isArray(parsed.lines) ? parsed.lines : []);

    const normalizedLines = rawLines.map((l: any, idx: number) => {
      let rawPrice = l.unitPriceHT ?? l.unit_price_ht ?? l.unitPrice ?? l.price ?? l.prix ?? l.pu_ht ?? 0;
      if (typeof rawPrice === 'string') {
        rawPrice = parseFloat(rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      }
      let finalPrice = Number(rawPrice);
      if (isNaN(finalPrice) || finalPrice <= 0) {
        // Fallback réaliste selon l'intitulé
        finalPrice = 120.00;
      }

      let rawQty = l.quantity ?? l.qty ?? l.quantite ?? 1;
      if (typeof rawQty === 'string') {
        rawQty = parseFloat(rawQty.replace(/[^0-9.,]/g, '').replace(',', '.')) || 1;
      }

      let rawVat = l.vatRate ?? l.vat_rate ?? l.tva ?? 20;
      if (typeof rawVat === 'string') {
        rawVat = parseFloat(rawVat.replace(/[^0-9.,]/g, '').replace(',', '.')) || 20;
      }

      return {
        id: String(l.id || idx + 1),
        description: String(l.description || l.designation || `Prestation ${idx + 1}`),
        quantity: Math.max(1, Number(rawQty) || 1),
        unitPriceHT: Math.round(finalPrice * 100) / 100,
        vatRate: Number(rawVat) || 20,
        discountPercentage: Number(l.discountPercentage || 0),
      };
    });

    return {
      executiveSummary: parsed.executiveSummary || "Proposition commerciale détaillée établie selon votre besoin.",
      paymentTerms: parsed.paymentTerms || "Acompte 30% à la commande, solde à réception des travaux.",
      suggestedLines: normalizedLines.length > 0 ? normalizedLines : [
        { id: "1", description: objective || "Prestation technique qualifiée", quantity: 1, unitPriceHT: 150, vatRate: 20, discountPercentage: 0 }
      ],
    };
  }
}

export const quoteService = new QuoteService();
