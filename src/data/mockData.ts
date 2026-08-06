import hero from "@/assets/original/business_meeting_hero.png";
import expHotel from "@/assets/original/fleur.jpg";
import expDining from "@/assets/original/diner.jpg";
import expYacht from "@/assets/original/Champagne.jpg";
import eventNetworking from "@/assets/original/tallk.jpg";
import eventSummit from "@/assets/original/Pitch.jpg";
import eventFondateur from "@/assets/original/fondateur.jpg";
import eventImmobilier from "@/assets/original/immobilier.jpg";
import eventAvenir from "@/assets/original/avenir.jpeg";
import eventIndia from "@/assets/original/india.jpeg";
import cerise from "@/assets/profils/cerise.jpg";
import kassa from "@/assets/profils/kassa.jpg";
import mathilda from "@/assets/profils/mathilda.jpg";
import pierre from "@/assets/profils/pierre.jpg";
import remy from "@/assets/profils/remy.jpg";
import micke from "@/assets/profils/micke.jpeg";
import eric from "@/assets/profils/eric.png";

export const images = { hero, expHotel, expDining, expYacht, eventNetworking, eventSummit };

export type Profile = "entrepreneur" | "investor" | "freelancer";
export type Objective = "networking" | "investment" | "discovery";

export type Offer = {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  costBreakdown: { hotel: number; dining: number; activity: number; commission: number };
  margin: number;
  features: string[];
  badge?: string;
  image: string;
};

export const offers: Offer[] = [
  {
    id: "networking",
    name: "PROCHAINS SÉJOURS BNE",
    tagline: "L'Odyssée Entrepreneuriale",
    basePrice: 1490,
    costBreakdown: { hotel: 480, dining: 320, activity: 180, commission: 80 },
    margin: 0.32,
    features: [
      "Immersion totale au cœur de territoires d'exception",
      "Synergies stratégiques entre esprits visionnaires",
      "Expériences sensorielles et mémorables hors du temps",
      "Des connexions authentiques qui transcendent les frontières",
      "Bénéfices : Expansion internationale, alliances durables et opportunités inédites",
      "Impact : Rayonnement économique et attractivité décuplée pour les territoires hôtes"
    ],
    image: eventNetworking,
  },
  {
    id: "investor",
    name: "DEMANDER UN ACCOMPAGNEMENT BNE ENTREPRISES",
    tagline: "Propulser votre rayonnement vers l'excellence",
    basePrice: 3890,
    costBreakdown: { hotel: 980, dining: 720, activity: 540, commission: 220 },
    margin: 0.38,
    features: [
      "Fondation Stratégique : Analyse pointue, positionnement sur-mesure et création de récits captivants",
      "Résonance Digitale : Amplification de votre aura, storytelling immersif et activation de réseaux qualifiés",
      "Conquête & Synergies : Événements signatures, rencontres exclusives et tissage de liens à haute valeur",
      "Finalité : Métamorphoser votre visibilité en croissance exponentielle et opportunités tangibles"
    ],
    image: expYacht,
  },
  {
    id: "exclusive",
    name: "INTELLIGENCE ARTIFICIELLE || DEMANDER UN ACCOMPAGNEMENT",
    tagline: "L'Intelligence Artificielle comme levier d'avant-garde",
    basePrice: 9800,
    costBreakdown: { hotel: 2400, dining: 1600, activity: 1800, commission: 600 },
    margin: 0.45,
    features: [
      "Audit Visionnaire : Détection chirurgicale des gisements de productivité et des opportunités d'innovation",
      "Aura Augmentée : Création de contenus magnétisants et stratégie d'influence propulsée par les algorithmes",
      "Machine de Conquête : Automatisation de l'acquisition, qualification ultra-ciblée et fidélisation",
      "Élévation Humaine : Acculturation de vos équipes pour maîtriser les outils de demain",
      "L'ambition : Transcender vos limites, gagner un temps précieux et catalyser la performance globale"
    ],
    image: expHotel,
  },
];

export const getOffers = (t: (key: string) => string) => {
  return offers.map(o => {
    const translatedName = t(`mock_offers.${o.id}.name`);
    const translatedTagline = t(`mock_offers.${o.id}.tagline`);
    
    return {
      ...o,
      name: translatedName !== `mock_offers.${o.id}.name` ? translatedName : o.name,
      tagline: translatedTagline !== `mock_offers.${o.id}.tagline` ? translatedTagline : o.tagline,
      features: o.features.map((_, i) => {
        const tf = t(`mock_offers.${o.id}.features.${i}`);
        return tf !== `mock_offers.${o.id}.features.${i}` ? tf : o.features[i];
      })
    };
  });
};

export const experiences = [
  { id: "h1", category: "Hôtels", title: "Penthouse Suite — Genève", price: 2400, location: "Suisse", image: expHotel },
  { id: "h2", category: "Hôtels", title: "Riad Royal — Marrakech", price: 1800, location: "Maroc", image: expHotel },
  { id: "d1", category: "Gastronomie", title: "Table du Chef — 3 étoiles", price: 480, location: "Paris", image: expDining },
  { id: "d2", category: "Gastronomie", title: "Cave & Champagne privée", price: 360, location: "Reims", image: expDining },
  { id: "y1", category: "Expériences", title: "Yacht 32m — Côte d'Azur", price: 6800, location: "Monaco", image: expYacht },
  { id: "y2", category: "Expériences", title: "Hélicoptère & Brunch panoramique", price: 1900, location: "Dubai", image: expYacht },
  { id: "b1", category: "Business", title: "Salon privé deal-room", price: 1200, location: "Londres", image: eventNetworking },
  { id: "b2", category: "Business", title: "Pitch Day Family Office", price: 2200, location: "Zurich", image: eventSummit },
];

export const events = {
  upcoming: [
    { id: "u1", title: "Namaste India", type: "Événement", date: "VENDREDI 7 AOÛT 2026", day: "7", month: "AOÛT", targetDate: "2026-08-07T19:00:00", city: "23 boulevard Georges Pompidou, 10003 Troyes", country: "France", desc: "Le rendez-vous des entrepreneurs et dirigeants. Buffet à volonté, networking business et défilé de mode.", image: eventIndia },
    { id: "u2", title: "Sion - Suisse", type: "Séjour", date: "10 OCTOBRE 2026", day: "10", month: "OCT", targetDate: "2026-10-10T09:00:00", city: "Sion", country: "Suisse", desc: "Sommet privé dédié à l'investissement et la préservation de patrimoine.", image: eventAvenir },
  ],
  past: [
    { id: "p1", title: "Séjour Fondateur #1", date: "27 Juin 2026", city: "Essoyes", country: "France", desc: "La première édition historique du rassemblement fondateur.", image: eventFondateur, code: "FND26", hasReplay: true },
    { id: "p2", title: "Networking Spécial Immobilier #1", date: "19 Juin 2026", city: "Troyes", country: "France", desc: "Rencontre confidentielle entre leaders de l'immobilier.", image: eventImmobilier, code: "IMM26", hasReplay: true },
  ],
};

export const getEvents = (t: (key: string) => string) => {
  return {
    upcoming: events.upcoming.map(e => {
      const translatedTitle = t(`mock_events.${e.id}.title`);
      const translatedType = t(`mock_events.${e.id}.type`);
      const translatedMonth = t(`mock_events.${e.id}.month`);
      const translatedCountry = t(`mock_events.${e.id}.country`);
      const translatedDesc = t(`mock_events.${e.id}.desc`);
      const translatedDate = t(`mock_events.${e.id}.date`);
      
      return {
        ...e,
        title: translatedTitle !== `mock_events.${e.id}.title` ? translatedTitle : e.title,
        type: translatedType !== `mock_events.${e.id}.type` ? translatedType : e.type,
        month: translatedMonth !== `mock_events.${e.id}.month` ? translatedMonth : e.month,
        country: translatedCountry !== `mock_events.${e.id}.country` ? translatedCountry : e.country,
        desc: translatedDesc !== `mock_events.${e.id}.desc` ? translatedDesc : e.desc,
        date: translatedDate !== `mock_events.${e.id}.date` ? translatedDate : e.date,
      };
    }),
    past: events.past.map(e => {
      const translatedTitle = t(`mock_events.${e.id}.title`);
      const translatedDesc = t(`mock_events.${e.id}.desc`);
      const translatedCountry = t(`mock_events.${e.id}.country`);
      const translatedDate = t(`mock_events.${e.id}.date`);

      return {
        ...e,
        title: translatedTitle !== `mock_events.${e.id}.title` ? translatedTitle : e.title,
        desc: translatedDesc !== `mock_events.${e.id}.desc` ? translatedDesc : e.desc,
        country: translatedCountry !== `mock_events.${e.id}.country` ? translatedCountry : e.country,
        date: translatedDate !== `mock_events.${e.id}.date` ? translatedDate : e.date,
      };
    }),
  };
};

export const partners = [
  { name: "Immobilier", category: "Investissement", country: "France & International" },
  { name: "Finance & Banque", category: "Investissement", country: "International" },
  { name: "Technologies & IA", category: "Innovation", country: "International" },
  { name: "Hôtellerie & Tourisme", category: "Hôtellerie", country: "France & International" },
  { name: "Santé & Bien-être", category: "Innovation", country: "France" },
  { name: "Luxe & Mode", category: "Hôtellerie", country: "International" },
  { name: "Énergie & Environnement", category: "Innovation", country: "International" },
  { name: "Restauration & Gastronomie", category: "Gastronomie", country: "France & International" },
  { name: "Transport & Logistique", category: "Investissement", country: "International" },
];

export const media = [
  { id: "m1", type: "Web Série", title: "Inside the Circle — Ep.01", duration: "12:34", image: eventNetworking },
  { id: "m2", type: "Web Série", title: "Founders by Night — Ep.02", duration: "09:18", image: expHotel },
  { id: "m3", type: "Reel", title: "48h à Monaco", duration: "0:58", image: expYacht },
  { id: "m4", type: "Reel", title: "Une nuit au Crillon", duration: "1:12", image: expHotel },
  { id: "m5", type: "Documentaire", title: "L'art du Deal — Genève", duration: "22:40", image: eventSummit },
  { id: "m6", type: "Reel", title: "Champagne & Pitch", duration: "0:42", image: expDining },
];

export const testimonials: { name: string; role: string; quote: string; flagType: string }[] = [
  // Les avis s'ajouteront ici
];



export function computeFinalPrice(o: Offer) {
  const cost = o.costBreakdown.hotel + o.costBreakdown.dining + o.costBreakdown.activity + o.costBreakdown.commission;
  return Math.round(cost * (1 + o.margin));
}

export function recommendOffer(profile: Profile, objective: Objective, budget: number) {
  if (budget >= 7000 || objective === "investment" && budget >= 4000) return offers[2];
  if (profile === "investor" || objective === "investment") return offers[1];
  return offers[0];
}



export const members = [
  { id: 1, name: "Rémy", role: "Dirigeant Agence web spécialisée dans la création de sites web et d'applications pour les indépendants et les PME", image: remy, flag: "🇧🇪", countryCode: "BE" },
  { id: 2, name: "Cerise", role: "Dirigeante Cabinet Médico-Esthétique en Rajeunissement de la peau", image: cerise, flag: "🇧🇪", countryCode: "BE" },
  { id: 3, name: "Pierre", role: "Marchand de biens", image: pierre, flag: "🇫🇷", countryCode: "FR" },
  { id: 4, name: "Mathilda", role: "Référente Suisse du Royalty Club", image: mathilda, flag: "🇨🇭", countryCode: "CH" },
  { id: 5, name: "Kassa-Kassa", role: "Economiste - Financier - Fiscaliste", image: kassa, flag: "🇱🇺", countryCode: "LU" },
  { id: 6, name: "Micke", role: "Partenaire / Collaborateur", image: micke, flag: "🇫🇷", countryCode: "FR" },
  { id: 7, name: "Eric", role: "Docteur en Informatique & Consultant IA", image: eric, flag: "🇫🇷", countryCode: "FR" },
];

export const getMembers = (t: (key: string) => string) => {
  return members.map(m => {
    const key = m.name.toLowerCase();
    const translatedRole = t(`mock_members.${key}`);
    return {
      ...m,
      role: translatedRole !== `mock_members.${key}` ? translatedRole : m.role
    };
  });
};