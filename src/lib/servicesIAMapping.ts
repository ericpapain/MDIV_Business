/**
 * src/lib/servicesIAMapping.ts
 * 
 * MAPPING CENTRALISÉ DES SERVICES IA & PERSONNALISATION DE L'ESPACE UTILISATEUR
 * 
 * Source unique de vérité reliant :
 * - Les besoins cochés dans le questionnaire (Question 3 : 'NEEDS')
 * - Les modules, outils, fonctionnalités, automatisations et recommandations activés sur la plateforme
 * 
 * Règles d'activation :
 * - Une même réponse peut activer plusieurs services.
 * - Un même service peut être activé par plusieurs réponses différentes.
 * - AUCUN outil n'est activé par défaut sans sélection réelle de l'utilisateur.
 */

export type DiagnosticNeedId = 
  | 'devis'
  | 'relance'
  | 'clients'
  | 'visible'
  | 'mails'
  | 'efacture'
  | 'audit_roi';

export interface DiagnosticNeedDefinition {
  id: DiagnosticNeedId;
  title: string;
  actionTitle: string;
  categoryLabel: string;
  description: string;
}

export const DIAGNOSTIC_NEEDS: DiagnosticNeedDefinition[] = [
  {
    id: 'devis',
    title: 'Faire mes devis et mes factures',
    actionTitle: 'Faire votre premier devis conforme',
    categoryLabel: 'Factures & paiements · environ 2 minutes',
    description: 'Créez vos devis et factures Factur-X en quelques clics et suivez vos encaissements.'
  },
  {
    id: 'relance',
    title: 'Courir après les clients qui ne paient pas',
    actionTitle: 'Activer les relances automatiques',
    categoryLabel: 'Factures & paiements · on relance poliment pour vous',
    description: 'Automatisez vos relances impayées par e-mail et courrier pour être payé sans friction.'
  },
  {
    id: 'clients',
    title: 'Trouver de nouveaux clients',
    actionTitle: 'Voir les clients potentiels près de chez vous',
    categoryLabel: 'Trouver des clients',
    description: 'Détectez les opportunités de chantiers locaux et contactez vos prospects avec des arguments ciblés.'
  },
  {
    id: 'visible',
    title: 'Être visible sur internet',
    actionTitle: 'Publier votre premier chantier en 1 clic',
    categoryLabel: 'Me faire connaître · une photo suffit',
    description: 'Transformez vos photos de chantier en publications réseaux sociaux et collectez des avis Google.'
  },
  {
    id: 'mails',
    title: 'Les e-mails et la paperasse',
    actionTitle: 'Répondre à vos e-mails professionnels plus vite',
    categoryLabel: 'Mon quotidien',
    description: 'Connectez votre boîte mail pour répondre rapidement, résumer les contrats et dicter vos mémos.'
  },
  {
    id: 'efacture',
    title: 'Me mettre en règle pour la facture électronique',
    actionTitle: 'Vérifier votre conformité légale PPF 2026',
    categoryLabel: 'Factures & paiements · obligatoire bientôt',
    description: 'Mise en conformité Factur-X EN 16931, archivage PAF et interconnexion Portail Public de Facturation.'
  },
  {
    id: 'audit_roi',
    title: 'Gagner du temps et faire des économies au quotidien',
    actionTitle: 'Faire mon bilan express et calculer mes heures gagnées',
    categoryLabel: 'Gains de temps & Économies · 2 minutes',
    description: 'Faites le point sur vos besoins, calculez les heures de paperasse que vous pouvez récupérer et comparez vos méthodes à celles de votre métier.'
  }
];

export interface PlatformServiceItem {
  id: string;
  name: string;
  category: 'Factures & paiements' | 'Trouver des clients' | 'Me faire connaître' | 'Mon quotidien' | 'Gains de temps & Économies';
  desc: string;
  link: string;
  icon: string;
  activatedBy: DiagnosticNeedId[];
  quickAction: {
    label: string;
    icon: string;
    link: string;
  };
  automations: string[];
  checklistStep: {
    id: string;
    label: string;
    action: string;
    link: string;
  };
  advice: string;
}

export const PLATFORM_SERVICES: PlatformServiceItem[] = [
  // ── FACTURES & PAIEMENTS ──────────────────────────────────────────────────
  {
    id: 'devis',
    name: 'Devis Factur-X & Chiffrage IA',
    category: 'Factures & paiements',
    desc: 'Création rapide de devis professionnels avec chiffrage automatique et export PDF.',
    link: '/services-ia/factures',
    icon: 'file-text',
    activatedBy: ['devis'],
    quickAction: {
      label: 'Faire un devis',
      icon: 'file-text',
      link: '/services-ia/factures'
    },
    automations: [
      'Conversion automatique de devis signé en facture en 1 clic',
      'Calcul automatique des taux de TVA réduits (5.5%, 10%, 20%)'
    ],
    checklistStep: {
      id: 'step_devis',
      label: 'Faire mon premier devis',
      action: 'Faire',
      link: '/services-ia/factures'
    },
    advice: 'Les devis envoyés dans les 24h après la visite client ont un taux de signature supérieur de 40%.'
  },
  {
    id: 'facturation',
    name: 'Facturation conforme PPF 2026',
    category: 'Factures & paiements',
    desc: 'Factures aux normes légales Factur-X avec mentions obligatoires et transmission PPF.',
    link: '/services-ia/factures',
    icon: 'receipt',
    activatedBy: ['devis', 'efacture'],
    quickAction: {
      label: 'Faire une facture',
      icon: 'receipt',
      link: '/services-ia/factures'
    },
    automations: [
      'Numérotation chronologique séquentielle sans rupture',
      'Génération du fichier XML Factur-X EN 16931 embarqué'
    ],
    checklistStep: {
      id: 'step_facture',
      label: 'Émettre une facture conforme Factur-X',
      action: 'Créer',
      link: '/services-ia/factures'
    },
    advice: 'Vérifiez bien le numéro SIRET de votre client pour garantir l’acheminement sur le portail public.'
  },
  {
    id: 'paiements',
    name: 'Suivi des paiements & encaissements',
    category: 'Factures & paiements',
    desc: 'Visualisation en temps réel de votre trésorerie, factures en attente et règlements reçus.',
    link: '/services-ia/factures',
    icon: 'receipt',
    activatedBy: ['devis', 'relance'],
    quickAction: {
      label: 'Suivre mes paiements',
      icon: 'receipt',
      link: '/services-ia/factures'
    },
    automations: [
      'Rapprochement bancaire des paiements reçus',
      'Calcul automatique de l’encours client et des délais moyens de paiement'
    ],
    checklistStep: {
      id: 'step_paiements',
      label: 'Consulter mon tableau de trésorerie',
      action: 'Voir',
      link: '/services-ia/factures'
    },
    advice: 'Surveillez votre encours chaque fin de semaine pour anticiper vos besoins d’achats fournisseurs.'
  },
  {
    id: 'relance',
    name: 'Relances automatiques des impayés',
    category: 'Factures & paiements',
    desc: 'Courriers et e-mails de rappel polis et programmés pour être payé à temps sans conflit.',
    link: '/services-ia/relances',
    icon: 'refresh-cw',
    activatedBy: ['relance', 'devis'],
    quickAction: {
      label: 'Relancer un client',
      icon: 'refresh-cw',
      link: '/services-ia/relances'
    },
    automations: [
      'Rappel préventif courtois à J-3 avant la date d’échéance',
      'Relance de niveau 1 à J+7 et niveau 2 à J+15 avec calcul des pénalités légales'
    ],
    checklistStep: {
      id: 'step_relance',
      label: 'Activer mes relances automatiques',
      action: 'Configurer',
      link: '/services-ia/relances'
    },
    advice: 'Une relance préventive 3 jours avant l’échéance évite 70% des retards de paiement involontaires.'
  },
  {
    id: 'impayes',
    name: 'Gestion du recouvrement & litiges',
    category: 'Factures & paiements',
    desc: 'Historique des échanges de relances, courriers recommandés et gestion des échéanciers.',
    link: '/services-ia/relances',
    icon: 'shield-check',
    activatedBy: ['relance'],
    quickAction: {
      label: 'Dossiers d’impayés',
      icon: 'shield-check',
      link: '/services-ia/relances'
    },
    automations: [
      'Génération automatique de mise en demeure conforme avec accusé',
      'Proposition d’échéancier de règlement en 3 fois sans frais'
    ],
    checklistStep: {
      id: 'step_impayes',
      label: 'Paramétrer le modèle de mise en demeure',
      action: 'Vérifier',
      link: '/services-ia/relances'
    },
    advice: 'Formalisez toujours les accords de paiement par écrit directement via l’outil pour garder une trace légale.'
  },
  {
    id: 'efacture',
    name: 'Module Facture électronique 2026 (PPF)',
    category: 'Factures & paiements',
    desc: 'Conformité légale Factur-X EN 16931, validation Luhn et archivage PAF.',
    link: '/services-ia/factures',
    icon: 'shield-check',
    activatedBy: ['efacture'],
    quickAction: {
      label: 'Conformité PPF 2026',
      icon: 'shield-check',
      link: '/services-ia/factures'
    },
    automations: [
      'Contrôle automatique de validité du SIREN client (Luhn)',
      'Génération du flux structuré pour les plateformes de dématérialisation partenaires (PDP)'
    ],
    checklistStep: {
      id: 'step_efacture',
      label: 'Activer la conformité Facture électronique 2026',
      action: 'Activer',
      link: '/services-ia/factures'
    },
    advice: 'Dès septembre 2026, toutes les entreprises françaises devront obligatoirement pouvoir recevoir les factures électroniques.'
  },
  {
    id: 'expenses',
    name: 'Achats fournisseurs & Dépenses (Scan OCR)',
    category: 'Factures & paiements',
    desc: 'Factures d’achats, tickets et notes de frais : scannez vos justificatifs pour extraire automatiquement montants et TVA déductible.',
    link: '/services-ia/factures?tab=achats',
    icon: 'shopping-bag',
    activatedBy: ['devis', 'mails'],
    quickAction: {
      label: 'Ajouter un achat',
      icon: 'shopping-bag',
      link: '/services-ia/factures?tab=achats'
    },
    automations: [
      'Extraction OCR instantanée du montant HT, TTC et TVA des factures d’achat',
      'Catégorisation automatique des dépenses (matériaux, sous-traitance, outillage)'
    ],
    checklistStep: {
      id: 'step_expenses',
      label: 'Scanner un premier achat fournisseur',
      action: 'Scanner',
      link: '/services-ia/factures?tab=achats'
    },
    advice: 'Photographiez vos factures fournisseurs dès réception pour ne plus jamais perdre de déduction de TVA.'
  },

  // ── TROUVER DES CLIENTS ───────────────────────────────────────────────────
  {
    id: 'clients',
    name: 'Trouver de nouveaux clients',
    category: 'Trouver des clients',
    desc: 'Détection d’opportunités locales et messages de présentation prêts à l’envoi.',
    link: '/services-ia/generateur-leads',
    icon: 'users',
    activatedBy: ['clients'],
    quickAction: {
      label: 'Trouver des prospects',
      icon: 'users',
      link: '/services-ia/generateur-leads'
    },
    automations: [
      'Détection automatique de chantiers et demandes dans votre zone géographique',
      'Génération de fiches prospects avec coordonnées vérifiées'
    ],
    checklistStep: {
      id: 'step_clients',
      label: 'Lancer ma première recherche de prospects locaux',
      action: 'Lancer',
      link: '/services-ia/generateur-leads'
    },
    advice: 'Ciblez en priorité les demandes dans un rayon de 15 km pour optimiser vos temps de déplacement.'
  },
  {
    id: 'prospection',
    name: 'Messages de prospection ciblés',
    category: 'Trouver des clients',
    desc: 'Courriels et arguments personnalisés pour démarcher efficacement de nouveaux clients.',
    link: '/services-ia/prospection-email',
    icon: 'mail',
    activatedBy: ['clients'],
    quickAction: {
      label: 'Message de prospection',
      icon: 'mail',
      link: '/services-ia/prospection-email'
    },
    automations: [
      'Personnalisation automatique des messages selon le profil du prospect',
      'Suivi des taux d’ouverture et de réponse'
    ],
    checklistStep: {
      id: 'step_prospecting',
      label: 'Rédiger mon premier message d’approche',
      action: 'Rédiger',
      link: '/services-ia/prospection-email'
    },
    advice: 'Un message court mettant en avant une réalisation récente obtient deux fois plus de réponses.'
  },
  {
    id: 'rdv_online',
    name: 'Prise de rendez-vous en ligne 24h/24',
    category: 'Trouver des clients',
    desc: 'Vos clients bloquent un rendez-vous ou demandent un devis sans vous déranger sur le chantier.',
    link: '/services-ia/dashboard?view=rdv_online',
    icon: 'calendar',
    activatedBy: ['clients'],
    quickAction: {
      label: 'Gérer mon planning RDV',
      icon: 'calendar',
      link: '/services-ia/dashboard?view=rdv_online'
    },
    automations: [
      'Synchronisation bidirectionnelle avec votre agenda (Google / Outlook)',
      'Rappel automatique par SMS/email au client la veille du rendez-vous'
    ],
    checklistStep: {
      id: 'step_rdv_online',
      label: 'Configurer mes créneaux de disponibilité',
      action: 'Régler',
      link: '/services-ia/dashboard?view=rdv_online'
    },
    advice: 'Bloquez vos demi-journées chantiers et laissez les fins d’après-midi pour les visites de devis.'
  },
  {
    id: 'rdv',
    name: 'Préparation d’un rendez-vous client',
    category: 'Trouver des clients',
    desc: 'Fiche synthétique prête en 2 minutes avant d’arriver chez votre client.',
    link: '/services-ia/prepa-reunion',
    icon: 'calendar',
    activatedBy: ['clients', 'mails'],
    quickAction: {
      label: 'Préparer un rendez-vous',
      icon: 'calendar',
      link: '/services-ia/prepa-reunion'
    },
    automations: [
      'Génération automatique de la fiche mémo avec historique client',
      'Questions clés à poser sur place pour qualifier le budget'
    ],
    checklistStep: {
      id: 'step_prepa_rdv',
      label: 'Préparer ma première fiche client',
      action: 'Préparer',
      link: '/services-ia/prepa-reunion'
    },
    advice: 'Relisez la fiche 5 minutes avant d’arriver pour appeler votre client par son nom et vous souvenir de ses contraintes.'
  },

  // ── ME FAIRE CONNAÎTRE ────────────────────────────────────────────────────
  {
    id: 'visible',
    name: 'Visibilité web & Posts chantiers',
    category: 'Me faire connaître',
    desc: 'Une photo de chantier devient une publication Facebook, Instagram et page web professionnelle.',
    link: '/services-ia/generateur-contenu',
    icon: 'megaphone',
    activatedBy: ['visible'],
    quickAction: {
      label: 'Publier un chantier',
      icon: 'megaphone',
      link: '/services-ia/generateur-contenu'
    },
    automations: [
      'Rédaction IA automatique des textes descriptifs avant/après à partir de vos photos',
      'Adaptation automatique des formats (Instagram, Facebook, LinkedIn, site web)'
    ],
    checklistStep: {
      id: 'step_visible',
      label: 'Publier mon premier chantier photo',
      action: 'Créer',
      link: '/services-ia/generateur-contenu'
    },
    advice: 'Prenez toujours une photo "avant" et une photo "après" sous le même angle : ce sont les posts qui génèrent le plus de partages.'
  },
  {
    id: 'siteweb',
    name: 'Vitrine web & Référencement local (SEO)',
    category: 'Me faire connaître',
    desc: 'Un site moderne et rapide qui transforme les visiteurs en appels directs et demandes de devis.',
    link: '/services-ia/generateur-contenu',
    icon: 'megaphone',
    activatedBy: ['visible'],
    quickAction: {
      label: 'Gérer ma vitrine web',
      icon: 'megaphone',
      link: '/services-ia/generateur-contenu'
    },
    automations: [
      'Optimisation SEO automatique sur votre ville et vos spécialités',
      'Mise à jour automatique de vos dernières réalisations sur votre fiche'
    ],
    checklistStep: {
      id: 'step_siteweb',
      label: 'Vérifier la présentation de mon activité',
      action: 'Vérifier',
      link: '/services-ia/generateur-contenu'
    },
    advice: 'Indiquez clairement vos villes d’intervention principales pour apparaître dans les recherches Google locales.'
  },
  {
    id: 'avis',
    name: 'Réponses aux avis Google & e-réputation',
    category: 'Me faire connaître',
    desc: 'Réponses soignées et automatiques pour valoriser votre réputation locale et rassurer les futurs clients.',
    link: '/services-ia/generateur-contenu',
    icon: 'message-square',
    activatedBy: ['visible'],
    quickAction: {
      label: 'Répondre aux avis',
      icon: 'message-square',
      link: '/services-ia/generateur-contenu'
    },
    automations: [
      'Notification instantanée à chaque nouvel avis client déposé',
      'Proposition de 3 réponses personnalisées (remerciement chaleureux, réponse professionnelle)'
    ],
    checklistStep: {
      id: 'step_avis',
      label: 'Générer mon lien d’invitation aux avis Google',
      action: 'Obtenir',
      link: '/services-ia/generateur-contenu'
    },
    advice: 'Demandez l’avis à votre client le jour même de la livraison du chantier : 8 clients sur 10 le déposent s’ils reçoivent le lien immédiatement.'
  },

  // ── MON QUOTIDIEN ─────────────────────────────────────────────────────────
  {
    id: 'mails',
    name: 'Gestion des e-mails professionnels',
    category: 'Mon quotidien',
    desc: 'Connexion directe à votre boîte mail (Gmail, OVH, etc.) et réponses rapides sans fautes.',
    link: '/services-ia/assistant-email',
    icon: 'mail',
    activatedBy: ['mails'],
    quickAction: {
      label: 'Traiter mes e-mails',
      icon: 'mail',
      link: '/services-ia/assistant-email'
    },
    automations: [
      'Tri automatique des demandes de devis urgentes',
      'Propositions de réponses prêtes à envoyer en 1 clic'
    ],
    checklistStep: {
      id: 'step_mails',
      label: 'Connecter ma boîte e-mail professionnelle',
      action: 'Connecter',
      link: '/services-ia/assistant-email'
    },
    advice: 'Laissez l’IA rédiger les réponses types aux demandes de tarifs pour gagner 30 minutes chaque soir.'
  },
  {
    id: 'docs',
    name: 'Résumer et comprendre un document',
    category: 'Mon quotidien',
    desc: 'Comprenez un document technique, contrat de sous-traitance ou juridique en quelques secondes.',
    link: '/services-ia/resume-documents',
    icon: 'file-text',
    activatedBy: ['mails'],
    quickAction: {
      label: 'Résumer un document',
      icon: 'file-text',
      link: '/services-ia/resume-documents'
    },
    automations: [
      'Détection automatique des clauses pièges et délais contractuels',
      'Synthèse des points clés et obligations en français simple'
    ],
    checklistStep: {
      id: 'step_docs',
      label: 'Tester l’analyse d’un premier document',
      action: 'Tester',
      link: '/services-ia/resume-documents'
    },
    advice: 'Faites analyser les conditions générales de vos fournisseurs pour repérer les frais cachés de livraison.'
  },
  {
    id: 'reunions',
    name: 'Comptes-rendus automatiques & mémos vocaux',
    category: 'Mon quotidien',
    desc: 'Transformez vos réunions de chantier ou mémos vocaux pris en voiture en compte-rendu clair.',
    link: '/services-ia/comptes-rendus',
    icon: 'mic',
    activatedBy: ['mails'],
    quickAction: {
      label: 'Créer un mémo vocal',
      icon: 'mic',
      link: '/services-ia/comptes-rendus'
    },
    automations: [
      'Transcription vocale haute précision avec vocabulaire métier',
      'Extraction automatique des actions à faire et des responsables'
    ],
    checklistStep: {
      id: 'step_reunions',
      label: 'Enregistrer mon premier mémo de chantier',
      action: 'Enregistrer',
      link: '/services-ia/comptes-rendus'
    },
    advice: 'Dictez vos remarques dans votre voiture juste après avoir quitté le chantier : le compte-rendu sera prêt avant votre retour à l’atelier.'
  },

  // ── GAINS DE TEMPS & ÉCONOMIES ───────────────────────────────────────────
  {
    id: 'diagnostic_express',
    name: 'Bilan express de mon entreprise',
    category: 'Gains de temps & Économies',
    desc: 'Faites le point en 2 minutes sur votre organisation pour repérer où vous perdez du temps et découvrir les aides adaptées.',
    link: '/services-ia/dashboard?view=diagnostic_express',
    icon: 'sparkles',
    activatedBy: ['audit_roi'],
    quickAction: {
      label: 'Faire mon bilan express',
      icon: 'sparkles',
      link: '/services-ia/dashboard?view=diagnostic_express'
    },
    automations: [
      'Repérage immédiat des corvées et tâches répétitives qui vous prennent du temps',
      'Sélection automatique des outils les plus simples et rentables pour votre métier'
    ],
    checklistStep: {
      id: 'step_diagnostic_express',
      label: 'Faire le bilan express de mon entreprise',
      action: 'Faire',
      link: '/services-ia/dashboard?view=diagnostic_express'
    },
    advice: 'Prenez 2 minutes pour faire ce bilan : vous saurez exactement par quoi commencer pour alléger vos soirées.'
  },
  {
    id: 'calc_roi',
    name: 'Calculer mon temps gagné & mes économies',
    category: 'Gains de temps & Économies',
    desc: 'Voyez clairement combien d’heures de paperasse vous pouvez récupérer chaque semaine et l’argent économisé sur l’année.',
    link: '/services-ia/calc-roi',
    icon: 'trending-up',
    activatedBy: ['audit_roi'],
    quickAction: {
      label: 'Calculer mes gains',
      icon: 'trending-up',
      link: '/services-ia/calc-roi'
    },
    automations: [
      'Calcul automatique des heures de bureau épargnées par semaine selon la taille de votre équipe',
      'Estimation des devis supplémentaires que vous pouvez chiffrer avec ce temps libéré'
    ],
    checklistStep: {
      id: 'step_calc_roi',
      label: 'Calculer mon temps gagné et mes économies',
      action: 'Calculer',
      link: '/services-ia/calc-roi'
    },
    advice: 'Les artisans qui automatisent leurs devis et relances récupèrent en moyenne 1 journée complète de chantier par mois.'
  },
  {
    id: 'benchmark',
    name: 'Me comparer aux pros de mon secteur',
    category: 'Gains de temps & Économies',
    desc: 'Regardez comment travaillent et s’organisent les autres artisans de votre métier pour ne pas vous laisser distancer.',
    link: '/services-ia/benchmark',
    icon: 'bar-chart',
    activatedBy: ['audit_roi'],
    quickAction: {
      label: 'Comparer mon métier',
      icon: 'bar-chart',
      link: '/services-ia/benchmark'
    },
    automations: [
      'Comparatif anonyme des habitudes de travail des entreprises de votre région',
      'Conseils pratiques observés chez les artisans les plus efficaces pour vos tarifs'
    ],
    checklistStep: {
      id: 'step_benchmark',
      label: 'Voir comment s’organisent les pros de mon métier',
      action: 'Comparer',
      link: '/services-ia/benchmark'
    },
    advice: 'Jetez un œil aux méthodes des confrères de votre secteur : cela donne souvent d’excellentes idées pour simplifier ses chantiers.'
  }
];

// ── FONCTIONS CENTRALISÉES DE RÉSOLUTION ────────────────────────────────────

/**
 * Résout les services de la plateforme activés par les besoins choisis.
 * Ne charge AUCUN service par défaut si needs est vide.
 */
export function resolveServicesFromNeeds(needs: string[]): PlatformServiceItem[] {
  if (!Array.isArray(needs) || needs.length === 0) {
    return [];
  }
  const cleanNeeds = needs.map(n => n.trim().toLowerCase());
  return PLATFORM_SERVICES.filter(service => 
    service.activatedBy.some(needId => cleanNeeds.includes(needId))
  );
}

/**
 * Résout les identifiants d'outils activés à partir des besoins.
 */
export function resolveActivatedToolIds(needs: string[]): string[] {
  const services = resolveServicesFromNeeds(needs);
  return Array.from(new Set(services.map(s => s.id)));
}

/**
 * Résout les services non activés mais disponibles à découvrir.
 */
export function resolveAvailableServices(needs: string[]): PlatformServiceItem[] {
  const activeIds = new Set(resolveActivatedToolIds(needs));
  return PLATFORM_SERVICES.filter(service => !activeIds.has(service.id));
}

/**
 * Résout les actions rapides prioritaires pour le tableau de bord de l'utilisateur.
 */
export function resolveQuickActions(needs: string[]) {
  const activeServices = resolveServicesFromNeeds(needs);
  const actions = activeServices.map(s => ({
    id: s.id,
    label: s.quickAction.label,
    icon: s.icon,
    link: s.quickAction.link
  }));

  // Retourne jusqu'à 4 actions prioritaires
  if (actions.length > 0) {
    return actions.slice(0, 4);
  }

  // Fallback si l'utilisateur n'a encore rien coché
  return [
    { id: 'devis', label: 'Faire un devis', icon: 'file-text', link: '/services-ia/factures' },
    { id: 'clients', label: 'Trouver des clients', icon: 'users', link: '/services-ia/generateur-leads' },
    { id: 'visible', label: 'Publier un chantier', icon: 'megaphone', link: '/services-ia/generateur-contenu' },
    { id: 'mails', label: 'Traiter mes e-mails', icon: 'mail', link: '/services-ia/assistant-email' }
  ];
}

/**
 * Construit la checklist de démarrage personnalisée d'après les besoins exprimés.
 */
export function resolveChecklist(needs: string[], metierLabel?: string) {
  const activeServices = resolveServicesFromNeeds(needs);
  
  const baseSteps = [
    { id: 'space', label: 'Créer mon espace entreprise', done: true },
    { id: 'bilan', label: `Diagnostic complété (${metierLabel || 'votre activité'})`, done: true }
  ];

  const serviceSteps = activeServices.map(s => ({
    ...s.checklistStep,
    done: false
  }));

  const all = [...baseSteps, ...serviceSteps];
  // On limite à 5 étapes prioritaires
  return all.slice(0, 5);
}

/**
 * Résout les automatisations métier actives d'après les réponses du questionnaire.
 */
export function resolveAutomations(needs: string[]) {
  const activeServices = resolveServicesFromNeeds(needs);
  const allAutomations: { service: string; text: string }[] = [];
  
  activeServices.forEach(s => {
    s.automations.forEach(auto => {
      allAutomations.push({ service: s.name, text: auto });
    });
  });

  return allAutomations;
}

/**
 * Résout les conseils et alertes IA personnalisés.
 */
export function resolveAdvice(needs: string[], metierLabel?: string) {
  const activeServices = resolveServicesFromNeeds(needs);
  return activeServices.map(s => ({
    id: s.id,
    service: s.name,
    advice: s.advice,
    category: s.category
  }));
}

/**
 * Calcule l'estimation des heures économisées d'après les besoins ou outils sélectionnés.
 */
export function calculateHoursSaved(items: string[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  let hours = 2; // Gain de base
  if (items.some(x => ['devis', 'efacture', 'facturation', 'paiements', 'expenses'].includes(x))) hours += 2.5;
  if (items.some(x => ['relance', 'impayes'].includes(x))) hours += 2;
  if (items.some(x => ['mails', 'docs', 'reunions'].includes(x))) hours += 2;
  if (items.some(x => ['visible', 'siteweb', 'avis'].includes(x))) hours += 1.5;
  if (items.some(x => ['clients', 'prospection', 'rdv_online', 'rdv'].includes(x))) hours += 1.5;
  if (items.some(x => ['diagnostic_express', 'calc_roi', 'benchmark'].includes(x))) hours += 1.5;
  return Math.min(Math.round(hours), 14);
}

// ── PERSISTANCE & SYNCHRONISATION DU PROFIL ─────────────────────────────────

export interface UserServicesConfig {
  needs: string[];
  activatedTools: string[];
  hoursSaved: number;
  profile?: string | null;
  metier?: string | null;
  customMetier?: string;
  metierLabel?: string;
  level?: string | null;
  userName?: string;
  companyName?: string;
  email?: string;
  updatedAt?: string;
}

const STORAGE_KEY_CONFIG = 'mdiv_services_config';
const STORAGE_KEY_TOOLS = 'mdiv_activated_tools';
const STORAGE_KEY_PROFILE = 'mdiv_ia_user_profile';

/**
 * Enregistre la configuration complète de l'utilisateur (source unique de vérité).
 * Respecte fidèlement les outils activés manuellement sans les écraser.
 */
export function saveUserServicesConfig(config: UserServicesConfig, companyId?: number | null) {
  const activatedTools = Array.isArray(config.activatedTools)
    ? Array.from(new Set(config.activatedTools))
    : resolveActivatedToolIds(config.needs || []);

  const fullConfig: UserServicesConfig = {
    ...config,
    activatedTools,
    hoursSaved: config.hoursSaved || calculateHoursSaved(activatedTools.length > 0 ? activatedTools : config.needs),
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(fullConfig));
    localStorage.setItem(STORAGE_KEY_TOOLS, JSON.stringify(activatedTools));
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(fullConfig));
    
    if (companyId) {
      localStorage.setItem(`${STORAGE_KEY_CONFIG}_${companyId}`, JSON.stringify(fullConfig));
    }
    
    if (config.userName) localStorage.setItem('mdiv_user_name', config.userName);
    if (config.companyName) localStorage.setItem('mdiv_company_name', config.companyName);

    // Synchronisation en tâche de fond avec le backend si companyId est disponible
    if (companyId) {
      fetch(`/api/company_profile.php?company_id=${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: companyId,
          persona: fullConfig,
          activity: fullConfig.customMetier || fullConfig.metierLabel || undefined,
        })
      }).catch(() => {});
    }

    // Déclencher un événement global pour que les composants ouverts se synchronisent immédiatement
    window.dispatchEvent(new CustomEvent('mdiv-tools-updated', { detail: fullConfig }));
  } catch (e) {
    console.error("Erreur lors de la sauvegarde de la configuration des services", e);
  }

  return fullConfig;
}

/**
 * Charge la configuration de l'utilisateur. Retourne null si aucune configuration n'existe.
 */
export function loadUserServicesConfig(companyId?: number | null): UserServicesConfig | null {
  try {
    let conf: UserServicesConfig | null = null;
    if (companyId) {
      const companyConfig = localStorage.getItem(`${STORAGE_KEY_CONFIG}_${companyId}`);
      if (companyConfig) conf = JSON.parse(companyConfig);
    }
    if (!conf) {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG) || localStorage.getItem(STORAGE_KEY_PROFILE);
      if (raw) conf = JSON.parse(raw);
    }
    if (conf) {
      // Priorité à la liste des outils stockée explicitement
      const storedTools = localStorage.getItem(STORAGE_KEY_TOOLS);
      if (storedTools) {
        try {
          const parsed = JSON.parse(storedTools);
          if (Array.isArray(parsed)) {
            conf.activatedTools = parsed;
          }
        } catch {}
      }
      return conf;
    }
  } catch {}
  return null;
}
