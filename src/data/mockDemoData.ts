export const DEMO_PROFILES = [
  {
    id: 'p1',
    name: 'Laurent Dubois',
    role: 'Expert-Comptable Associé',
    company: 'Cabinet Fiducia (Strasbourg)',
    sector: 'Comptabilité',
    matchPercentage: 98,
    isExternal: false,
    reason: "Membre du réseau. Spécialisé dans l'optimisation fiscale pour le secteur de la restauration et l'immobilier commercial.",
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  },
  {
    id: 'p2',
    name: 'Sophie Martin',
    role: 'Agent Immobilier Commercial',
    company: 'ImmoPro Grand Est (Metz)',
    sector: 'Immobilier',
    matchPercentage: 95,
    isExternal: false,
    reason: "Membre du réseau. Dispose de 4 mandats exclusifs pour des locaux commerciaux adaptés à la restauration en centre-ville.",
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b',
  },
  {
    id: 'p3',
    name: 'Antoine Rivière',
    role: 'Restaurateur & Investisseur',
    company: 'Groupe Terroir (Nancy)',
    sector: 'Restauration',
    matchPercentage: 92,
    isExternal: false,
    reason: "Membre du réseau. Cherche à revendre deux de ses établissements pour se concentrer sur un nouveau projet.",
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
  },
  {
    id: 'p4',
    name: 'Marie Leroy',
    role: 'Directrice Développement',
    company: 'Fonds ImmoRégion (Reims)',
    sector: 'Immobilier',
    matchPercentage: 88,
    isExternal: true,
    reason: "Trouvée via LinkedIn. Elle recherche des investisseurs pour co-financer la rénovation d'une zone commerciale.",
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026708c',
  },
  {
    id: 'p5',
    name: 'Thomas Vidal',
    role: 'Architecte d\'Intérieur',
    company: 'Design CHR (Mulhouse)',
    sector: 'Aménagement',
    matchPercentage: 85,
    isExternal: true,
    reason: "Trouvé sur un annuaire B2B. A réalisé l'aménagement de 15 restaurants dans la région. Excellent pour vos projets d'ouverture.",
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026709d',
  },
  {
    id: 'p6',
    name: 'Claire Dupont',
    role: 'Avocate en Droit des Affaires',
    company: 'Cabinet Dupont & Associés',
    sector: 'Juridique',
    matchPercentage: 82,
    isExternal: true,
    reason: "Trouvée via la chambre de commerce. Experte dans la rédaction de baux commerciaux et cessions de fonds de commerce.",
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026701a',
  },
];

export const DEMO_CHAT_MESSAGES = [
  {
    id: 1,
    sender: 'aria',
    text: "Bonjour. Je suis ARIA, l'intelligence artificielle de M.DIV. Je suis là pour vous aider à préparer votre séjour. Pour commencer, pouvez-vous me dire quel est votre secteur d'activité ?",
    delay: 500,
  },
  {
    id: 2,
    sender: 'user',
    text: "Bonjour, je suis investisseur immobilier et je possède également trois restaurants dans la région.",
    delay: 3500,
  },
  {
    id: 3,
    sender: 'aria',
    text: "Très bien. Immobilier et restauration, c'est noté. Quel est l'objectif principal de ce séjour avec nous ?",
    delay: 5500,
  },
  {
    id: 4,
    sender: 'user',
    text: "Je cherche à acheter de nouveaux biens commerciaux pour ouvrir d'autres restaurants. J'ai aussi besoin d'un bon expert-comptable pour optimiser la fiscalité de mon groupe.",
    delay: 10000,
  },
  {
    id: 5,
    sender: 'aria',
    text: "D'accord, recherche de locaux commerciaux et conseil fiscal spécialisé. Quel type de séjour souhaitez-vous ? (Plutôt orienté travail intensif, détente, ou mixte ?)",
    delay: 13500,
  },
  {
    id: 6,
    sender: 'user',
    text: "Un séjour de travail intensif, je veux voir un maximum de choses. Juste moi, pour 2 jours.",
    delay: 17000,
  },
  {
    id: 7,
    sender: 'aria',
    text: "Parfait. Pour vous proposer des options réalistes, quel est le budget alloué pour ce séjour (hébergement, repas et rencontres) ?",
    delay: 19500,
  },
  {
    id: 8,
    sender: 'user',
    text: "Autour de 2500 euros.",
    delay: 22000,
  },
  {
    id: 9,
    sender: 'aria',
    text: "Merci. J'analyse vos besoins... J'ai généré un programme de 2 jours orienté travail pour 1 personne. Tarif calculé : 2 350€. J'ai trouvé 3 membres de notre réseau (dont un expert-comptable et un agent spécialisé) et 3 profils externes très pertinents. Souhaitez-vous voir le programme et les profils ?",
    delay: 26000,
  },
];

export const DEMO_TIMELINE = [
  {
    day: 'Jour 1',
    title: 'Focus Immobilier Commercial',
    events: [
      { time: '09:00', type: 'Arrivée', description: 'Installation à l\'hôtel' },
      { time: '10:00', type: 'Rendez-vous', description: 'Rencontre avec Sophie Martin (ImmoPro) pour visiter 3 locaux commerciaux' },
      { time: '13:00', type: 'Déjeuner', description: 'Repas de travail avec Antoine Rivière, restaurateur local' },
      { time: '15:30', type: 'Visite', description: 'Visite d\'une zone commerciale en rénovation avec Marie Leroy' },
    ]
  },
  {
    day: 'Jour 2',
    title: 'Structuration & Fiscalité',
    events: [
      { time: '09:00', type: 'Expertise', description: 'Audit comptable avec Laurent Dubois (Cabinet Fiducia)' },
      { time: '11:30', type: 'Rendez-vous', description: 'Visio avec Claire Dupont (Avocate) sur les baux commerciaux' },
      { time: '13:00', type: 'Déjeuner', description: 'Repas rapide' },
      { time: '14:30', type: 'Rencontre', description: 'Entretien avec Thomas Vidal pour deviser l\'aménagement d\'un local' },
      { time: '17:00', type: 'Départ', description: 'Fin du séjour et retour' },
    ]
  }
];

export const DEMO_DASHBOARD_STATS = {
  compatibility: 89,
  qualifiedMeetings: 6,
  businessPotential: '+150 k€',
  satisfaction: 94,
  generationTime: 8,
};

// --- AUDIT USE CASE DATA ---

export const AUDIT_CHAT_MESSAGES = [
  {
    id: 1,
    sender: 'aria',
    text: "Bonjour. Je suis ARIA. Pour démarrer ce diagnostic IA, pouvez-vous me dire quel est votre secteur d'activité et la taille de votre entreprise ?",
    delay: 500,
  },
  {
    id: 2,
    sender: 'user',
    text: "Bonjour, je dirige une PME de 45 personnes dans la distribution de matériel B2B.",
    delay: 3500,
  },
  {
    id: 3,
    sender: 'aria',
    text: "Très bien, la distribution B2B. Comment gérez-vous actuellement vos commandes clients et le support ?",
    delay: 5500,
  },
  {
    id: 4,
    sender: 'user',
    text: "C'est assez manuel. On a 4 personnes qui lisent les emails, saisissent les commandes dans notre vieux logiciel comptable, et répondent aux réclamations.",
    delay: 9500,
  },
  {
    id: 5,
    sender: 'aria',
    text: "Je vois. Utilisez-vous un CRM moderne ou un ERP interconnecté pour centraliser tout cela ?",
    delay: 13000,
  },
  {
    id: 6,
    sender: 'user',
    text: "Non, pas vraiment. On utilise beaucoup Excel pour faire le lien entre les différents services.",
    delay: 16500,
  },
  {
    id: 7,
    sender: 'aria',
    text: "L'utilisation intensive d'Excel pour lier des processus crée souvent des goulots d'étranglement. Avez-vous une idée du coût lié aux erreurs de saisie ou aux retards de traitement ?",
    delay: 20000,
  },
  {
    id: 8,
    sender: 'user',
    text: "C'est difficile à dire exactement... Mais on doit perdre facilement 40 000€ par an en retours ou pénalités, sans parler du temps perdu à chercher l'information.",
    delay: 24500,
  },
  {
    id: 9,
    sender: 'aria',
    text: "C'est un manque à gagner significatif. Comment gérez-vous la facturation fournisseurs ? Est-ce également manuel ?",
    delay: 28000,
  },
  {
    id: 10,
    sender: 'user',
    text: "Oui, on reçoit les factures par courrier ou email, on les imprime, et la comptable les ressaisit une par une.",
    delay: 31500,
  },
  {
    id: 11,
    sender: 'aria',
    text: "Merci pour ces précisions. J'ai suffisamment d'éléments pour établir un premier diagnostic. Vos processus comportent de nombreux 'trous dans la raquette' digitaux. Souhaitez-vous voir le rapport d'Audit Flash IA généré avec les solutions recommandées ?",
    delay: 36000,
  },
];

export const AUDIT_SOLUTIONS = [
  {
    id: 's1',
    name: 'Extraction Intelligente (OCR IA)',
    role: 'Traitement des factures fournisseurs',
    company: 'Technologie : Rossum / Base64',
    sector: 'Comptabilité',
    matchPercentage: 99,
    isExternal: true,
    reason: "Élimine 100% de la saisie manuelle des factures. L'IA lit les PDF et injecte les données directement dans votre logiciel comptable.",
    avatar: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&h=150&fit=crop',
  },
  {
    id: 's2',
    name: 'Agent Support Client IA',
    role: 'Automatisation des réponses de niveau 1',
    company: 'Technologie : Intercom Fin / Chatbase',
    sector: 'Service Client',
    matchPercentage: 96,
    isExternal: true,
    reason: "L'agent peut lire les emails entrants, comprendre la demande (ex: 'Où est ma commande ?'), vérifier dans la base et répondre instantanément.",
    avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&h=150&fit=crop',
  },
  {
    id: 's3',
    name: 'Workflow d\'Automatisation',
    role: 'Remplacement des ponts Excel',
    company: 'Technologie : Make / Zapier',
    sector: 'Opérations',
    matchPercentage: 93,
    isExternal: false,
    reason: "Nous mettons en place des ponts automatiques entre vos emails, votre logiciel comptable et vos équipes opérationnelles pour supprimer les copier-coller.",
    avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&h=150&fit=crop',
  },
];

export const AUDIT_TIMELINE = [
  {
    day: 'Jour 1-2',
    title: 'Cartographie des Processus',
    events: [
      { time: 'Matin', type: 'Interviews', description: 'Entretiens avec les responsables ADV et Comptabilité' },
      { time: 'Après-midi', type: 'Shadowing', description: 'Observation des saisies manuelles et traitement des commandes' },
    ]
  },
  {
    day: 'Jour 3-4',
    title: 'Analyse IA & Architecture',
    events: [
      { time: 'Matin', type: 'Modélisation', description: 'Identification des tâches automatisables par IA' },
      { time: 'Après-midi', type: 'Sourcing', description: 'Sélection des outils (OCR, Agents, Workflows) adaptés à votre PME' },
    ]
  },
  {
    day: 'Jour 5',
    title: 'Restitution',
    events: [
      { time: '10:00', type: 'Réunion Codir', description: 'Présentation de la feuille de route d\'implémentation' },
      { time: '14:00', type: 'Livrable', description: 'Remise du rapport chiffré (ROI et temps gagné)' },
    ]
  }
];

export const AUDIT_DASHBOARD_STATS = {
  compatibility: 95, // Maturité IA potentielle
  qualifiedMeetings: 1500, // Heures sauvées par an
  businessPotential: '+50 k€', // Économies annuelles
  satisfaction: 85, // Réduction des erreurs en %
  generationTime: 4,
};
