/**
 * src/lib/personaEngine.ts
 * 
 * MOTEUR UNIFIÉ DE PERSONA MÉTIER DYNAMIQUE (FRONTEND & SERVICES IA)
 * 
 * - Persistance 100% en Base de Données (via /api/persona.php).
 * - AUCUN lexique pré-créé en dur : le prompt instruit dynamiquement le modèle
 *   de mobiliser le jargon technique et les normes du métier exact de l'utilisateur.
 */

import { UserServicesConfig, loadUserServicesConfig, saveUserServicesConfig } from './servicesIAMapping';

export interface ActivePersonaContext {
  companyName: string;
  legalForm: string;
  city: string;
  metierCode: string;
  metierLabel: string;
  specificActivity: string;
  profileCode: string;
  profileLabel: string;
  teamContext: string;
  levelCode: string;
  levelLabel: string;
  needsCodes: string[];
  needsLabels: string;
}

/**
 * Enregistre le persona directement en base de données via l'API backend.
 */
export async function savePersonaToDatabase(config: UserServicesConfig, companyId?: number | null): Promise<any> {
  const cid = companyId || 1;
  const payload = {
    ...config,
    company_id: cid,
    companyId: cid,
  };

  // 1. Sauvegarde locale de secours
  saveUserServicesConfig(config, cid);

  // 2. Persistance directe en base de données
  try {
    const res = await fetch(`/api/persona.php?company_id=${cid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      return data.persona || payload;
    }
  } catch (err) {
    console.warn("[PersonaEngine] Sauvegarde API différée :", err);
  }
  return payload;
}

/**
 * Récupère le persona depuis la base de données via l'API backend.
 */
export async function loadPersonaFromDatabase(companyId?: number | null): Promise<UserServicesConfig | null> {
  const cid = companyId || 1;
  try {
    const res = await fetch(`/api/persona.php?company_id=${cid}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.persona) {
        // Synchroniser localement
        saveUserServicesConfig(data.persona, cid);
        return data.persona;
      }
    }
  } catch (err) {
    console.warn("[PersonaEngine] Chargement API différé :", err);
  }
  return loadUserServicesConfig(cid);
}

/**
 * Assemble le Persona métier actif complet depuis le profil de l'utilisateur et la fiche entreprise.
 */
export function getActivePersonaContext(company?: any, profileConfigOverride?: UserServicesConfig | null): ActivePersonaContext {
  const profileConfig = profileConfigOverride || loadUserServicesConfig(company?.id);

  const companyName = company?.company_name || company?.name || profileConfig?.companyName || 'Mon Entreprise';
  const legalForm = company?.legal_form || 'Entreprise Individuelle';
  const city = company?.city || 'France';

  const specificActivity = (
    profileConfig?.customMetier?.trim() || 
    company?.activity?.trim() || 
    profileConfig?.metierLabel || 
    'Artisanat & Métiers de terrain'
  ).trim();

  const metierCode = profileConfig?.metier || 'bat';
  const metierLabel = profileConfig?.metierLabel || specificActivity;

  const profileCode = profileConfig?.profile || 'seul';
  const profileLabels: Record<string, { label: string; context: string }> = {
    creation: { label: 'Entreprise en création (< 1 an)', context: 'Artisan / Entrepreneur qui lance son activité, privilégie le contact direct et la réactivité' },
    seul: { label: 'Artisan / Indépendant travaillant seul', context: 'Patron artisan seul sur le terrain, gère lui-même ses chantiers/commandes, ses devis et sa gestion' },
    petite: { label: 'Petite équipe de 2 à 9 personnes', context: 'Dirigeant avec une équipe d’ouvriers/collaborateurs sur le terrain, organise le planning et les fournitures' },
    grande: { label: 'PME de 10 personnes et plus', context: 'Entreprise avec plusieurs équipes, responsables d’opérations et organisation structurée' }
  };
  const profileInfo = profileLabels[profileCode] || profileLabels.seul;

  const levelCode = profileConfig?.level || 'debrouille';
  const levelLabels: Record<string, string> = {
    min: 'Je fais le minimum (Guidage pas à pas, phrases simples, zéro jargon informatique)',
    debrouille: 'Je me débrouille (Ton professionnel, structuré, explications ciblées)',
    aise: 'Je suis à l’aise (Direct au but, dense, orienté gain de temps maximal)'
  };
  const levelLabel = levelLabels[levelCode] || levelLabels.debrouille;

  const needsCodes = profileConfig?.needs || ['devis'];
  const needsDescriptions: Record<string, string> = {
    devis: 'Faire des devis et factures',
    relance: 'Relancer les clients impayés',
    clients: 'Trouver de nouveaux clients',
    visible: 'Être visible sur internet et réseaux',
    mails: 'Gérer les e-mails et la paperasse',
    efacture: 'Conformité Facture électronique 2026',
    audit_roi: 'Gagner du temps et calculer les économies'
  };
  const needsLabels = needsCodes.map(code => needsDescriptions[code] || code).join(', ');

  return {
    companyName,
    legalForm,
    city,
    metierCode,
    metierLabel,
    specificActivity,
    profileCode,
    profileLabel: profileInfo.label,
    teamContext: profileInfo.context,
    levelCode,
    levelLabel,
    needsCodes,
    needsLabels
  };
}

/**
 * Génère le bloc système d'adaptation métier à injecter dans les prompts IA.
 * 100% Dynamique — Aucun lexique figé.
 */
export function buildPersonaPromptSnippet(context: ActivePersonaContext, taskName?: string): string {
  const isSolo = context.profileCode === 'seul' || context.profileCode === 'creation';
  const tonePronoun = isSolo 
    ? 'Emploie la 1re personne du singulier ("je" / "mon entreprise"), valorise le travail direct du patron et la proximité.'
    : 'Emploie la 1re personne du pluriel ("nous" / "notre équipe"), valorise le savoir-faire de l’équipe et la coordination technique.';

  const simplicityRule = context.levelCode === 'min'
    ? 'RÈGLE DE SIMPLICITÉ MAXIMALE : Zéro jargon informatique ou bureaucratique. Reste concret, clair et immédiatement utilisable.'
    : 'RÈGLE DE STYLE : Rendu professionnel, rigoureux et précis.';

  return `=== CONTEXTE IDENTITÉ & PERSONA MÉTIER DE L'UTILISATEUR CONNECTÉ ===
- Entreprise : ${context.companyName} (${context.legalForm} — ${context.city})
- Métier / Secteur d'activité déclaré (Q2) : ${context.metierLabel} (Activité précise : ${context.specificActivity})
- Taille & Structure (Q1) : ${context.profileLabel} (${context.teamContext})
- Priorités déclarées (Q3) : ${context.needsLabels}
- Niveau d'accompagnement souhaité (Q4) : ${context.levelLabel}

=== DIRECTIVES D'ADAPTATION MÉTIER DYNAMIQUE (AUCUN LEXIQUE PRÉ-GÉGÉ OU FIGÉ) ===
1. ADAPTATION DYNAMIQUE AU MÉTIER DU PROFESSIONNEL :
   Tu travailles pour un professionnel dont l'activité exacte est : "${context.specificActivity}" (Secteur : "${context.metierLabel}").
   N'utilise AUCUN lexique générique ou d'un autre secteur.
   Mobilise dynamiquement TOUTE ton expertise réelle sur ce métier précis :
   - Adopte son vocabulaire technique authentique, son jargon de terrain, les termes exacts utilisés quotidiennement par les professionnels de cette profession.
   - Utilise les unités de mesure usuelles de ce métier (ex: m², ml, forfait, heure, vacation, quintal, acte, etc. selon la profession exacte).
   - Intègre les réalités de son quotidien : ses types de chantiers / commandes / interventions, ses relations clients (devis, visite, acompte, livraison/réception), ses contraintes réglementaires et ses types de fournitures / matériels.
   - Si le métier est très spécifique ou atypique (artisanat d'art, niche technique, nouveau métier), adapte-toi fidèlement à sa réalité concrète sans jamais extrapoler ni inventer de faux termes.

2. ADAPTATION À LA TAILLE D'ENTREPRISE (Q1 = ${context.profileCode}) :
   ${tonePronoun}

3. CALIBRAGE SELON LE NIVEAU D'AISANCE (Q4 = ${context.levelCode}) :
   ${simplicityRule}

4. INTERDICTION STRICTE DES FORMULES GÉNÉRIQUES :
   Ne produis JAMAIS de texte abstrait de type "Prestataire B2B / Cabinet de conseil / Entreprise lambda". Chaque document, e-mail, devis, relance ou publication doit être immédiatement crédible et sembler rédigé par un professionnel chevronné du métier "${context.specificActivity}".${taskName ? `\nTâche spécifique en cours : ${taskName}.` : ''}
`;
}
