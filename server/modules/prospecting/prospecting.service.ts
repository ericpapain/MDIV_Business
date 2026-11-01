import { callLLM } from '../../integrations/llm/llm-orchestrator';
import { getDb, saveDb } from '../../database/db-connection';
import { resolveBackendPersona, buildBackendPersonaSystemPrompt } from '../../shared/persona/persona-prompt.builder';

export class ProspectingService {
  getLeadsKpis() {
    return {
      totalGenerated: 48,
      highlyQualified: 32,
      activeSegments: 6,
      totalExports: 14,
    };
  }

  async searchLeads(fields: any) {
    const sector = fields.sector || 'Technologie & Conseil';
    const country = fields.country || 'France';
    const region = fields.region || 'Toutes régions';
    const companySize = fields.companySize || 'PME (51-250)';
    const targetFunction = fields.targetFunction || 'CEO / DSI';
    const keywords = fields.keywords || 'transformation digitale, automatisation';

    const systemPrompt = `Tu es un moteur de prospection commerciale B2B spécialisé pour MDIV Business.
Génère une liste de 4 à 6 entreprises cibles crédibles et hautement qualifiées avec leur profil d'enrichissement.
Pour chaque site web : si l'entreprise est très connue mets son URL, sinon obligatoirement "https://www.google.com/search?q=" suivi du nom et de la ville encodés.
Réponds STRICTEMENT par un tableau JSON valide :
[
  {
    "companyName": "Nom entreprise",
    "sector": "${sector}",
    "size": "${companySize}",
    "location": "Paris, ${country}",
    "website": "https://www.google.com/search?q=Nom+Paris",
    "digitalMaturityScore": "Moyen",
    "aiPotentialScore": "Élevé",
    "purchaseProbability": "Très élevé",
    "decisionMakerName": "Prénom Nom",
    "decisionMakerFunction": "${targetFunction}",
    "technologiesUsed": ["Microsoft 365", "ERP SAP"]
  }
]`;

    const aiRes = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Critères : ${sector}, ${country}, ${region}, ${companySize}, ${targetFunction}, ${keywords}` }
    ], false);

    const content = aiRes.choices?.[0]?.message?.content || '[]';
    let leadsData: any[] = [];
    try {
      leadsData = JSON.parse(content);
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) leadsData = JSON.parse(match[0]);
    }
    return leadsData;
  }

  async generateProspectingPitch(fields: any, companyId?: number) {
    const targetCompany = fields.targetCompany || fields.target || 'Entreprise Partenaire';
    const sector = fields.sector || 'BTP & Immobilier';
    const contactRole = fields.contactRole || fields.targetRole || 'Directeur Général / Décideur';
    const offer = fields.offer || 'Prestations techniques qualifiées';
    const tone = fields.tone || 'Professionnel';
    const objective = fields.objective || 'Premier contact';
    const language = fields.language || 'Français';

    const persona = resolveBackendPersona(companyId);
    const personaPrompt = buildBackendPersonaSystemPrompt(persona, "Campagne d'approche et de prospection commerciale B2B ciblée");

    const prompt = `${personaPrompt}

=== MISSION : PROSPECTION COMMERCIALE & PITCH ULTRA-CIBLÉ ===
Tu es le directeur commercial et copywriter de l'entreprise : ${persona.companyName} (${persona.metierLabel} — ${persona.specificActivity}).
Rédige un message de prospection percutant à destination de :
- Entreprise cible : ${targetCompany}
- Secteur cible : ${sector}
- Interlocuteur : ${contactRole}
- Offre à valoriser : ${offer}
- Objectif visé : ${objective}
- Ton souhaité : ${tone}
- Langue : ${language}

Directives d'impact :
1. Adopte le pronom "${persona.profile === 'seul' || persona.profile === 'creation' ? 'je' : 'nous'}" correspondant à la structure de l'entreprise.
2. Utilise le vocabulaire technique réaliste du métier de l'expéditeur (${persona.metierLabel}) pour établir une légitimité terrain immédiate.
3. Rédige un objet irrésistible, une accroche empathique sur les douleurs du client, la proposition de valeur concrète et un appel à l'action non agressif.
4. Évalue rigoureusement les KPIs de performance commerciale du message.

Réponds STRICTEMENT par un JSON valide :
{
  "subject": "Objet percutant sans spam words",
  "content": "Corps complet du message avec salutations, proposition de valeur aérée et formule de politesse",
  "kpis": {
    "impactScore": 92,
    "clarityScore": 94,
    "personalizationScore": 95,
    "engagementScore": 89,
    "estimatedReadTimeSeconds": 45,
    "persuasionLevel": "Très élevé",
    "suggestions": [
      "Relance douce à J+4 si absence de réponse",
      "Valoriser une référence locale similaire"
    ]
  }
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: `Génère le pitch de prospection pour contacter ${contactRole} chez ${targetCompany}.` }
    ], true);

    const rawContent = aiRes.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    const emailBody = parsed.content || parsed.pitch || `Bonjour,\n\nJe me permets de vous contacter concernant ${offer}.\n\nRestant à votre écoute,\n${persona.companyName}`;

    return {
      id: 'camp_' + Date.now(),
      subject: parsed.subject || `Opportunité de collaboration - ${persona.companyName}`,
      content: emailBody,
      pitch: emailBody,
      kpis: {
        impactScore: Number(parsed.kpis?.impactScore) || 92,
        clarityScore: Number(parsed.kpis?.clarityScore) || 90,
        personalizationScore: Number(parsed.kpis?.personalizationScore) || 95,
        engagementScore: Number(parsed.kpis?.engagementScore) || 88,
        estimatedReadTimeSeconds: Number(parsed.kpis?.estimatedReadTimeSeconds) || 45,
        persuasionLevel: parsed.kpis?.persuasionLevel || "Très élevé",
        suggestions: Array.isArray(parsed.kpis?.suggestions) ? parsed.kpis.suggestions : [
          "Prévoir une relance téléphonique courte à J+4",
          "Joindre un exemple de réalisation récente"
        ]
      },
      date: new Date().toISOString()
    };
  }

  async searchTenders(sector: string, region = 'France') {
    const prompt = `Tu es un veilleur stratégique en marchés publics et privés d'entreprises.
Génère une liste de 3 opportunités d'appels d'offres récents ou en cours dans le secteur "${sector}" (${region}).
Réponds STRICTEMENT par un tableau JSON :
[
  {
    "title": "Intitulé du marché",
    "issuer": "Pouvoir adjudicateur ou Entreprise",
    "sector": "${sector}",
    "deadline": "2026-11-30",
    "budgetEstimated": "Sur consultation",
    "summary": "Description brève des besoins"
  }
]`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Recherche les appels d offres.' }
    ], false);

    const content = aiRes.choices?.[0]?.message?.content || '[]';
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) parsed = JSON.parse(match[0]);
    }
    return parsed;
  }

  async generateEmail(fields: any, companyId?: number) {
    const userRawText = (fields.text || '').trim();
    const task = fields.task || 'Rédaction';
    const tone = fields.tone || 'Professionnel';
    const objective = fields.objective || 'Email B2B';

    const persona = resolveBackendPersona(companyId);
    const personaPrompt = buildBackendPersonaSystemPrompt(persona, "Rédaction de correspondances et d'e-mails professionnels");

    const systemPrompt = `${personaPrompt}

=== MISSION DE RÉDACTION D'E-MAIL ===
Tâche demandée : ${task}
Ton requis : ${tone}
Objectif : ${objective}

Directives d'exécution :
1. Rédige l'e-mail EN TANT QUE l'entreprise et le professionnel décrits ci-dessus (${persona.companyName} — ${persona.metierLabel}).
2. Mobilise naturellement le vocabulaire technique, les expressions courantes et la réalité pratique de son métier (${persona.specificActivity || persona.metierLabel}).
3. Adapte le pronom selon la taille : emploie "je" pour un artisan/indépendant seul, et "nous" pour une structure avec salariés.
4. Structure obligatoire :
   - Ligne 1 : "Objet : [Titre précis, clair et engageant]"
   - Ligne 2 : [Ligne vide]
   - Salutation adaptée (ex: Bonjour M./Mme..., Cher client...)
   - Corps du message clair, direct, aéré en paragraphes distincts.
   - Formule de politesse professionnelle adaptée au ton choisi.
   - Signature soignée comprenant le nom de l'entreprise (${persona.companyName}).`;

    const groqRes = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userRawText || `Rédige un message pour : ${objective}` }
    ]);

    return groqRes.choices?.[0]?.message?.content || "Message généré.";
  }

  async analyzeEmail(text: string, companyId?: number) {
    const persona = resolveBackendPersona(companyId);
    const personaPrompt = buildBackendPersonaSystemPrompt(persona, "Analyse et qualification intelligente d'un message entrant");

    const prompt = `${personaPrompt}

=== MISSION D'ANALYSE D'UN MESSAGE / E-MAIL ENTRANT ===
Analyse le message reçu par l'entreprise (${persona.companyName} — ${persona.metierLabel}).
Évalue précisément :
1. sentiment : "positif", "neutre", "négatif" ou "critique"
2. urgency : "basse", "moyenne" ou "haute"
3. intent : intention principale formulée dans le vocabulaire du métier (ex: "Demande de devis pour travaux", "Urgence dépannage", "Suivi de chantier", "Contestation de facture", "Relance fournisseur")
4. keyTopics : tableau de 2 à 4 thèmes clés identifiés
5. recommendedAction : recommandation concrète d'action pour le chef d'entreprise / artisan

Réponds STRICTEMENT par un JSON valide :
{
  "sentiment": "neutre",
  "urgency": "moyenne",
  "intent": "Intention qualifiée selon le métier",
  "keyTopics": ["Thème 1", "Thème 2"],
  "recommendedAction": "Action recommandée immédiate"
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: `Email entrant à analyser :\n"""\n${text}\n"""` }
    ], true);

    const content = aiRes.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }
    return parsed;
  }

  getFollowupTargets(companyId: number) {
    const db = getDb();
    const invoices = (db.invoices || []).filter((i: any) => (!i.company_id || i.company_id === companyId) && (i.status === 'overdue' || i.status === 'pending'));
    return invoices.map((inv: any) => ({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName || 'Client',
      amountTTC: inv.amountTTC || inv.totalTTC || 0,
      dueDate: inv.due_date || inv.dueDate || '',
      daysOverdue: 14,
    }));
  }

  async generateFollowupMessage(fields: any, companyId?: number) {
    const persona = resolveBackendPersona(companyId, fields);
    const personaSystem = buildBackendPersonaSystemPrompt(persona, "Rédaction d'une relance d'impayé professionnelle");

    const clientName = fields.clientName || 'Client';
    const invoiceNumber = fields.invoiceNumber || 'FA-2026-001';
    const amount = fields.amount || '0';
    const tone = fields.tone || 'Courtois et ferme';

    const prompt = `${personaSystem}

Rédige une relance de facture impayée pour le client "${clientName}".
Facture concernée : ${invoiceNumber} d'un montant de ${amount} €.
Ton souhaité : ${tone}.

DIRECTIVES DE RELANCE MÉTIER :
- Réfère-toi naturellement à la prestation ou au chantier réalisé ("suite aux travaux réalisés", "suite à la livraison de votre commande", "suite à notre intervention"), sans agressivité inutile mais avec professionnalisme.
- Rappelle les modalités convenues et les délais légaux (art. L. 441-10 du Code de commerce, indemnité forfaitaire de 40 € pour les professionnels).
- Propose une solution constructive (confirmer la bonne réception de la facture, virement ou contact direct avec le dirigeant).

Réponds en JSON :
{
  "subject": "Relance facture ${invoiceNumber}",
  "message": "Corps du message de relance adapté au métier"
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Génère la relance.' }
    ], true);

    const content = aiRes.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }
    return parsed;
  }

  async generateContent(fields: any, companyId?: number): Promise<any[]> {
    const sourceType = fields.sourceType || 'text';
    const sourceContent = (fields.sourceContent || fields.topic || '').trim();
    const rawChannels = Array.isArray(fields.channels) && fields.channels.length > 0
      ? fields.channels
      : ['linkedin', 'x', 'instagram', 'facebook', 'newsletter', 'blog', 'youtube', 'telegram'];
    
    const persona = resolveBackendPersona(companyId);
    const personaPrompt = buildBackendPersonaSystemPrompt(persona, "Création de contenus digitaux, posts chantiers & vitrine web");

    const brandSettings = fields.brandSettings || {};
    const tone = brandSettings.tone || 'Professionnel, authentique et valorisant le savoir-faire terrain';
    const keywords = brandSettings.keywords || `${persona.metierLabel}, qualité, réactivité, savoir-faire, satisfaction client`;
    const targetAudience = fields.targetAudience || 'Clients particuliers, syndics et entreprises locales';

    // Règles par canal demandé
    const channelRules: string[] = [];
    const channelNames: { id: string; name: string }[] = [];

    for (const c of rawChannels) {
      const id = String(c).toLowerCase().trim();
      if (id === 'linkedin') {
        channelNames.push({ id: 'linkedin', name: 'LinkedIn' });
        channelRules.push('- LINKEDIN (id: "linkedin"): Accroche choc en 1 ligne, sauts de ligne aérés pour lecture mobile, 3-5 émojis pro, retour d\'expérience chantier ou expertise métier, question engageante / call to action, 3-5 hashtags.');
      } else if (id === 'x' || id === 'twitter') {
        channelNames.push({ id: 'x', name: 'X (Twitter)' });
        channelRules.push('- X / TWITTER (id: "x"): Ultra-percutant, direct (< 280 caractères) ou structure en micro-thread rythmé. Émojis dynamiques, 2-3 hashtags viraux.');
      } else if (id === 'instagram') {
        channelNames.push({ id: 'instagram', name: 'Instagram' });
        channelRules.push('- INSTAGRAM (id: "instagram"): Storytelling visuel de réalisation. Commence par "[📸 Visuel suggéré : Photo avant/après chantier]", émojis expressifs, description des étapes et des matériaux, 6-10 hashtags ciblés.');
      } else if (id === 'facebook') {
        channelNames.push({ id: 'facebook', name: 'Facebook' });
        channelRules.push('- FACEBOOK (id: "facebook"): Post local chaleureux et convivial, valorisation du travail bien fait pour les riverains/clients locaux, invite au partage et aux avis, numéro ou contact.');
      } else if (id === 'newsletter') {
        channelNames.push({ id: 'newsletter', name: 'Newsletter' });
        channelRules.push('- NEWSLETTER (id: "newsletter"): Objet d\'e-mail percutant en guise de titre, salutation chaleureuse, 3 conseils d\'entretien ou nouveautés travaux, conclusion et contact direct.');
      } else if (id === 'blog') {
        channelNames.push({ id: 'blog', name: 'Article Blog' });
        channelRules.push('- ARTICLE BLOG (id: "blog"): Titre SEO local H1 percutant, introduction rassurante, 2 sous-parties structurées avec intertitres [H2] valorisant les normes et bonnes pratiques, conclusion avec incitation au devis gratuit.');
      } else if (id === 'youtube') {
        channelNames.push({ id: 'youtube', name: 'Script Vidéo' });
        channelRules.push('- SCRIPT VIDÉO (id: "youtube"): Hook accrocheur (5 premières secondes face caméra ou sur chantier), explication du problème et de la solution technique, déroulé en points clés, outro avec appel à s\'abonner.');
      } else if (id === 'telegram') {
        channelNames.push({ id: 'telegram', name: 'Telegram' });
        channelRules.push('- TELEGRAM (id: "telegram"): Message direct, concis et orienté action, mots-clés en gras, 1-2 émojis, lien vers l\'action.');
      } else {
        channelNames.push({ id, name: id.charAt(0).toUpperCase() + id.slice(1) });
        channelRules.push(`- ${id.toUpperCase()} (id: "${id}"): Adapter le ton et la structure spécifiquement à ce canal.`);
      }
    }

    const rulesStr = channelRules.join('\n');
    const channelsListStr = channelNames.map(c => `"${c.id}" (${c.name})`).join(', ');

    const systemPrompt = `${personaPrompt}

=== MISSION : STRATÉGIE DE CONTENU & VISIBILITÉ MULTI-CANAL ===
Tu rédiges les publications officielles pour l'entreprise : ${persona.companyName} (${persona.metierLabel} — ${persona.specificActivity}).
Tu dois décliner et adapter le sujet/chantier source UNIQUEMENT pour les ${channelNames.length} canaux demandés : ${channelsListStr}.

RÈGLES ÉDITORIALES PAR CANAL :
${rulesStr}

CONTEXTE DE MARQUE & CIBLE :
- Expéditeur : ${persona.companyName} (${persona.metierLabel})
- Audience cible : ${targetAudience}
- Ton : ${tone}
- Mots-clés : ${keywords}

EXIGENCE CRITIQUE :
- Rédige TOUS les textes obligatoirement en français de qualité professionnelle.
- Réponds EXCLUSIVEMENT avec un tableau JSON valide (strictement aucun texte avant ou après).
Format JSON strict attendu :
[
  {
    "channel": "<ID_DU_CANAL_EXACT_EXEMPLE_linkedin_OU_x_OU_instagram>",
    "title": "<Titre accrocheur en français>",
    "body": "<Texte complet rédigé et mis en forme pour le canal>",
    "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3"]
  }
]`;

    const userPrompt = `Sujet / Contenu source (${sourceType}) :
${sourceContent || 'Développement d\'activité, automatisation et solutions concrètes pour les professionnels et entreprises.'}

Canaux à générer impérativement : ${channelNames.map(c => c.id).join(', ')}`;

    try {
      const aiRes = await callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], true);

      const rawContent = aiRes.choices?.[0]?.message?.content || '[]';
      
      let parsedArray: any[] = [];
      try {
        const directParsed = JSON.parse(rawContent);
        if (Array.isArray(directParsed)) {
          parsedArray = directParsed;
        } else if (directParsed && typeof directParsed === 'object') {
          for (const key of Object.keys(directParsed)) {
            if (Array.isArray(directParsed[key])) {
              parsedArray = directParsed[key];
              break;
            }
          }
          if (parsedArray.length === 0 && directParsed.channel && directParsed.body) {
            parsedArray = [directParsed];
          }
        }
      } catch {
        const arrayMatch = rawContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          try {
            parsedArray = JSON.parse(arrayMatch[0]);
          } catch {}
        }
      }

      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        return parsedArray.map((item: any, idx: number) => {
          const fallbackChannel = channelNames[idx]?.id || 'linkedin';
          let chan = String(item.channel || fallbackChannel).toLowerCase().trim();
          if (chan.includes('link')) chan = 'linkedin';
          else if (chan.includes('twit') || chan === 'x') chan = 'x';
          else if (chan.includes('insta')) chan = 'instagram';
          else if (chan.includes('face')) chan = 'facebook';
          else if (chan.includes('news')) chan = 'newsletter';
          else if (chan.includes('blog') || chan.includes('article')) chan = 'blog';
          else if (chan.includes('yout') || chan.includes('video') || chan.includes('script')) chan = 'youtube';
          else if (chan.includes('tele')) chan = 'telegram';

          const matchingConfig = channelNames.find(c => c.id === chan);
          const channelTitleName = matchingConfig ? matchingConfig.name : (item.channel || chan);

          return {
            channel: chan,
            title: item.title || `Publication ${channelTitleName}`,
            body: item.body || item.content || item.text || '',
            hashtags: Array.isArray(item.hashtags) ? item.hashtags : ['#Business', '#Innovation']
          };
        });
      }

      // Si le LLM a renvoyé du texte brut, générer les versions pour chaque canal
      return channelNames.map(c => ({
        channel: c.id,
        title: `Publication ${c.name} - ${targetAudience}`,
        body: rawContent.length > 50 ? rawContent : `🚀 ${sourceContent}\n\nDécouvrez comment nous accompagnons nos clients pour accélérer leurs résultats et simplifier leur quotidien.\n\n👉 Contactez-nous pour échanger sur vos projets !`,
        hashtags: ['#Business', '#Croissance', '#Innovation', '#Reussite']
      }));
    } catch (err: any) {
      console.error('[generateContent] Error during LLM generation:', err);
      return channelNames.map(c => ({
        channel: c.id,
        title: `Publication ${c.name} : ${sourceContent.slice(0, 40) || 'Actualité'}`,
        body: `🎯 ${sourceContent || 'Innovez et développez votre activité'}\n\nUne approche adaptée pour : ${targetAudience}.\n\nPoints clés :\n• Gain de temps mesurable\n• Processus optimisés\n• Accompagnement sur-mesure\n\nContactez notre équipe pour en savoir plus !`,
        hashtags: ['#Business', '#Innovation', '#Performance']
      }));
    }
  }
}

export const prospectingService = new ProspectingService();
