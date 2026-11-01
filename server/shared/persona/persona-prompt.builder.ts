/**
 * server/shared/persona/persona-prompt.builder.ts
 * 
 * CONSTRUCTEUR DE PROMPT SYSTÈME PERSONA MÉTIER DYNAMIQUE (BACKEND)
 * 
 * Ne fige aucun lexique statique : instruit le LLM de mobiliser dynamiquement
 * l'authentique vocabulaire, les normes, les unités de mesure et le jargon terrain
 * du métier exact de l'utilisateur, quelle que soit la profession (y compris métiers rares).
 */

import { getDb } from '../../database/db-connection';

export interface PersonaProfileInput {
  companyId?: number;
  companyName?: string;
  legalForm?: string;
  city?: string;
  activity?: string;
  profile?: 'creation' | 'seul' | 'petite' | 'grande' | string;
  metier?: string;
  customMetier?: string;
  metierLabel?: string;
  level?: 'min' | 'debrouille' | 'aise' | string;
  needs?: string[];
  [key: string]: any;
}

/**
 * Récupère le persona stocké en base de données ou passé dans la requête.
 */
export function resolveBackendPersona(companyId?: number, override?: PersonaProfileInput): PersonaProfileInput {
  const db = getDb();
  let companyData: any = {};
  if (companyId && db.companies) {
    companyData = db.companies.find((c: any) => c.id === companyId) || {};
  } else if (db.companies && db.companies.length > 0) {
    companyData = db.companies[0] || {};
  }

  // Chercher d'abord dans db.personas, puis company.persona
  const personas = db.personas || [];
  const dbPersona = personas.find((p: any) => p.company_id === companyId || p.id === companyId) || companyData.persona || {};

  return {
    companyId: companyId || companyData.id || 1,
    companyName: override?.companyName || dbPersona.companyName || companyData.company_name || companyData.name || 'Mon Entreprise',
    legalForm: override?.legalForm || dbPersona.legalForm || companyData.legal_form || 'Entreprise Individuelle',
    city: override?.city || dbPersona.city || companyData.city || 'France',
    activity: override?.activity || dbPersona.activity || companyData.activity || '',
    profile: override?.profile || dbPersona.profile || companyData.employee_range || 'seul',
    metier: override?.metier || dbPersona.metier || 'bat',
    customMetier: override?.customMetier || dbPersona.customMetier || companyData.activity || '',
    metierLabel: override?.metierLabel || dbPersona.metierLabel || override?.activity || companyData.activity || 'Artisanat & Métiers de terrain',
    level: override?.level || dbPersona.level || 'debrouille',
    needs: override?.needs || dbPersona.needs || ['devis'],
  };
}

/**
 * Construit le bloc Prompt Système personnalisé en fonction du Persona métier.
 * 100% DYNAMIQUE — Aucun lexique pré-créé en dur pour éviter les fausses réponses sur les métiers inédits.
 */
export function buildBackendPersonaSystemPrompt(personaInput: PersonaProfileInput, taskName?: string): string {
  const specificActivity = (
    personaInput.customMetier?.trim() || 
    personaInput.activity?.trim() || 
    personaInput.metierLabel || 
    'Artisanat / Professionnel de terrain'
  ).trim();

  const metierLabel = personaInput.metierLabel || specificActivity;

  const profileCode = (personaInput.profile || 'seul').toLowerCase();
  const isSolo = profileCode === 'seul' || profileCode === 'creation';
  const profileLabel = isSolo 
    ? (profileCode === 'creation' ? 'Créateur d’entreprise (< 1 an)' : 'Artisan / Indépendant travaillant seul')
    : (profileCode === 'petite' ? 'Petite équipe de 2 à 9 personnes' : 'Entreprise de 10 personnes et plus');

  const toneRule = isSolo
    ? 'Emploie la 1re personne du singulier ("je" / "mon entreprise"), valorise la proximité, le travail direct du patron et la réactivité.'
    : 'Emploie la 1re personne du pluriel ("nous" / "notre équipe technique"), valorise le savoir-faire collectif et la coordination d’équipe.';

  const levelCode = (personaInput.level || 'debrouille').toLowerCase();
  const levelLabel = levelCode === 'min'
    ? 'Je fais le minimum (Guidage pas à pas, phrases simples, zéro jargon informatique)'
    : (levelCode === 'aise' ? 'Je suis à l’aise (Direct au but, dense, orienté gain de temps maximal)' : 'Je me débrouille (Ton professionnel, structuré)');

  const simplicityRule = levelCode === 'min'
    ? 'RÈGLE DE SIMPLICITÉ MAXIMALE : Zéro jargon bureaucratique ou informatique. Reste concret, clair et immédiatement utilisable.'
    : 'RÈGLE DE STYLE : Rendu professionnel, rigoureux et précis.';

  const needsList = Array.isArray(personaInput.needs) && personaInput.needs.length > 0
    ? personaInput.needs.join(', ')
    : 'Facturation, gestion et développement';

  return `=== CONTEXTE IDENTITÉ & PERSONA MÉTIER DE L'UTILISATEUR CONNECTÉ ===
- Entreprise : ${personaInput.companyName || 'Mon Entreprise'} (${personaInput.legalForm || 'Entreprise'} — ${personaInput.city || 'France'})
- Métier / Secteur d'activité déclaré (Q2) : ${metierLabel} (Activité précise : ${specificActivity})
- Taille & Structure (Q1) : ${profileLabel}
- Besoins et priorités déclarées (Q3) : ${needsList}
- Niveau d'accompagnement souhaité (Q4) : ${levelLabel}

=== DIRECTIVES D'ADAPTATION MÉTIER DYNAMIQUE (AUCUN LEXIQUE PRÉ-GÉGÉ OU FIGÉ) ===
1. ADAPTATION DYNAMIQUE AU MÉTIER DU PROFESSIONNEL :
   Tu travailles exclusivement pour un professionnel dont l'activité exacte est : "${specificActivity}" (Secteur : "${metierLabel}").
   N'utilise AUCUN lexique générique ou d'un autre secteur non lié.
   Mobilise dynamiquement TOUTE ton expertise réelle sur ce métier précis :
   - Adopte son vocabulaire technique authentique, son jargon de terrain, les termes exacts utilisés quotidiennement par les professionnels de cette profession.
   - Utilise les unités de mesure usuelles de ce métier (ex: m², ml, forfait, heure, vacation, quintal, acte, ensemble, etc. selon la profession exacte).
   - Intègre les réalités de son quotidien : ses types de chantiers / commandes / interventions, ses relations clients (devis, visite, acompte, livraison/réception), ses contraintes réglementaires et ses types de fournitures / matériels.
   - Si le métier est très spécifique ou atypique (artisanat d'art, niche technique, nouveau métier), adapte-toi fidèlement à sa réalité concrète sans jamais extrapoler ni inventer de faux termes.

2. ADAPTATION À LA TAILLE D'ENTREPRISE (Q1 = ${profileCode}) :
   ${toneRule}

3. CALIBRAGE SELON LE NIVEAU D'AISANCE (Q4 = ${levelCode}) :
   ${simplicityRule}

4. INTERDICTION STRICTE DES FORMULES GÉNÉRIQUES :
   Ne produis JAMAIS de texte abstrait de type "Prestataire B2B / Cabinet de conseil / Entreprise lambda". Chaque document, e-mail, devis, relance ou publication doit être immédiatement crédible et sembler rédigé par un professionnel chevronné du métier "${specificActivity}".${taskName ? `\nTâche spécifique en cours : ${taskName}.` : ''}
`;
}
