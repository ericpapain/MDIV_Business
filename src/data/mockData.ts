import hero from "@/assets/original/Resto.jpg";
import expHotel from "@/assets/original/fleur.jpg";
import expDining from "@/assets/original/diner.jpg";
import expYacht from "@/assets/original/Champagne.jpg";
import eventNetworking from "@/assets/original/tallk.jpg";
import eventSummit from "@/assets/original/Pitch.jpg";
import portrait1 from "@/assets/original/CEO.jpg";
import portrait2 from "@/assets/original/CEO.jpg";

export const images = { hero, expHotel, expDining, expYacht, eventNetworking, eventSummit, portrait1, portrait2 };

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
    name: "Networking Experience",
    tagline: "Pour entrepreneurs en quête de connexions stratégiques",
    basePrice: 1490,
    costBreakdown: { hotel: 480, dining: 320, activity: 180, commission: 80 },
    margin: 0.32,
    features: [
      "2 nuits hôtel 5 étoiles",
      "1 dîner d'affaires Michelin",
      "Accès soirée privée",
      "3 contacts qualifiés garantis",
      "Conciergerie 24/7",
    ],
    image: eventNetworking,
  },
  {
    id: "investor",
    name: "Investor Experience",
    tagline: "Sourcing d'opportunités d'investissement vérifiées",
    basePrice: 3890,
    costBreakdown: { hotel: 980, dining: 720, activity: 540, commission: 220 },
    margin: 0.38,
    features: [
      "Suite signature 3 nuits",
      "Yacht privé & dîner gastronomique",
      "Pitch de 5 startups pré-sélectionnées",
      "Due diligence flash incluse",
      "Driver privé Mercedes Classe S",
    ],
    badge: "Le plus choisi",
    image: expYacht,
  },
  {
    id: "exclusive",
    name: "Premium Exclusive",
    tagline: "Ultra-personnalisation. Sur invitation uniquement.",
    basePrice: 9800,
    costBreakdown: { hotel: 2400, dining: 1600, activity: 1800, commission: 600 },
    margin: 0.45,
    features: [
      "Villa privée avec staff dédié",
      "Jet partagé sur demande",
      "Rencontres organisées family offices",
      "Concierge ex-Bristol assigné",
      "Programme cousu-main 100 %",
    ],
    badge: "Privé",
    image: expHotel,
  },
];

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
    { id: "u1", title: "BUSINESS NETWORKING || SEJOUR FONDATEUR  #2", date: "27 — 28 JUIN 2026", city: "LA TABLE D'ESSOYES", desc: "Sommet privé réunissant 80 family offices européens.", image: eventSummit },
    { id: "u2", title: "Founders Dinner Series #14", date: "28 Sept 2026", city: "Paris", desc: "Dîner intimiste pour 24 fondateurs Série A+.", image: eventNetworking },
    { id: "u3", title: "Yacht Investor Day", date: "10 Oct 2026", city: "Saint-Tropez", desc: "Une journée. Cinq startups. Vingt investisseurs.", image: eventSummit },
  ],
  past: [
    { id: "p1", title: "Marrakech Business Retreat", date: "Mars 2026", city: "Marrakech", desc: "3 jours de retraite stratégique avec 40 leaders.", image: eventNetworking },
    { id: "p2", title: "Geneva Wealth Circle", date: "Janvier 2026", city: "Genève", desc: "Cercle confidentiel autour de la transmission.", image: eventSummit },
    { id: "p3", title: "Dubai Founders Brunch", date: "Novembre 2025", city: "Dubai", desc: "Brunch panoramique sur la Marina.", image: eventNetworking },
  ],
};

export const partners = [
  { name: "Ritz-Carlton", category: "Hôtellerie", country: "International" },
  { name: "Hôtel de Crillon", category: "Hôtellerie", country: "France" },
  { name: "Aman Resorts", category: "Hôtellerie", country: "International" },
  { name: "Guy Savoy", category: "Gastronomie", country: "France" },
  { name: "Alain Ducasse Collection", category: "Gastronomie", country: "International" },
  { name: "Cheval Blanc", category: "Hôtellerie", country: "France" },
  { name: "Family Office Geneva", category: "Investissement", country: "Suisse" },
  { name: "Atomico Partners", category: "Investissement", country: "UK" },
  { name: "Mubadala Capital", category: "Investissement", country: "UAE" },
];

export const media = [
  { id: "m1", type: "Web Série", title: "Inside the Circle — Ep.01", duration: "12:34", image: eventNetworking },
  { id: "m2", type: "Web Série", title: "Founders by Night — Ep.02", duration: "09:18", image: expHotel },
  { id: "m3", type: "Reel", title: "48h à Monaco", duration: "0:58", image: expYacht },
  { id: "m4", type: "Reel", title: "Une nuit au Crillon", duration: "1:12", image: expHotel },
  { id: "m5", type: "Documentaire", title: "L'art du Deal — Genève", duration: "22:40", image: eventSummit },
  { id: "m6", type: "Reel", title: "Champagne & Pitch", duration: "0:42", image: expDining },
];

export const testimonials = [
  { name: "Alexandre M.", role: "Fondateur, SaaS B2B (Série B)", quote: "J'ai signé deux LPs pendant le week-end. Le ROI est immédiat.", flagType: "france" },
  { name: "Sofia R.", role: "Managing Partner, Family Office", quote: "L'expérience est d'une élégance rare. Le sourcing, d'une rigueur absolue.", flagType: "suisse" },
  { name: "Karim B.", role: "CEO, FinTech MENA", quote: "Le seul cercle où l'on rencontre les bons interlocuteurs sans les chercher.", flagType: "belgique" },
];

export const leads = [
  { id: "L-2401", name: "Julien Carrère", profile: "entrepreneur" as Profile, score: 92, budget: 4200, offer: "Investor Experience", status: "Qualifié", country: "France" },
  { id: "L-2402", name: "Mei Tanaka", profile: "investor" as Profile, score: 88, budget: 9800, offer: "Premium Exclusive", status: "Contact privé", country: "Japon" },
  { id: "L-2403", name: "Ahmed El Sayed", profile: "investor" as Profile, score: 76, budget: 6200, offer: "Investor Experience", status: "Qualifié", country: "UAE" },
  { id: "L-2404", name: "Clara Voss", profile: "entrepreneur" as Profile, score: 64, budget: 1490, offer: "Networking Experience", status: "Nurturing", country: "Allemagne" },
  { id: "L-2405", name: "Pablo Ortega", profile: "freelancer" as Profile, score: 41, budget: 900, offer: "Networking Experience", status: "Froid", country: "Espagne" },
  { id: "L-2406", name: "Isabelle Granger", profile: "investor" as Profile, score: 95, budget: 12500, offer: "Premium Exclusive", status: "Closed", country: "Suisse" },
  { id: "L-2407", name: "Yuki Sato", profile: "entrepreneur" as Profile, score: 73, budget: 3800, offer: "Investor Experience", status: "Qualifié", country: "Japon" },
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

export function computeLeadScore(profile: Profile, objective: Objective, budget: number, interests: string[], duration: number) {
  let s = 30;
  if (profile === "investor") s += 25;
  if (profile === "entrepreneur") s += 18;
  if (objective === "investment") s += 20;
  if (objective === "networking") s += 12;
  s += Math.min(25, Math.round(budget / 400));
  s += Math.min(10, interests.length * 2);
  s += Math.min(8, duration * 2);
  return Math.min(99, s);
}