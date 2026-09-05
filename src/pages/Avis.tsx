import { useState, useEffect } from "react";

import { Star, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { events } from "@/data/mockData";
import { useLanguage } from "@/i18n/LanguageContext";
import { TestimonialFlag } from "@/components/site/TestimonialFlag";
import { COUNTRIES } from "@/data/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Review = {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  event: string;
  country: string;
};

export default function Avis() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const localPastEvents = events.past || [];
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  
  const allCountries = [...COUNTRIES, { code: "autre", labelFr: "Autre", labelEn: "Other" }];

  const sortedCountries = allCountries.sort((a, b) => {
    const labelA = isEn ? a.labelEn : a.labelFr;
    const labelB = isEn ? b.labelEn : b.labelFr;
    return labelA.localeCompare(labelB);
  });

  const [formData, setFormData] = useState({
    country: "",
    eventId: "",
    code: "",
    name: "",
    role: "",
    rating: 5,
    comment: "",
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  // URL of the OVH API
  const API_URL = "/api-avis.php";

  useEffect(() => {
    fetchReviews();
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const response = await fetch("/api-public.php?action=events");
      if (!response.ok) throw new Error("Erreur réseau");
      const result = await response.json();
      if (result.data) {
        if (!Array.isArray(result.data)) {
           setDbEvents([...(result.data.upcoming || []), ...(result.data.past || [])]);
        } else if (result.data.length > 0) {
           setDbEvents(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erreur réseau");
      
      const result = await response.json();
      if (result.success && result.data) {
        // Map database fields to Review type if necessary
        const formattedReviews = result.data.map((item: any) => ({
          id: item.id.toString(),
          name: item.nom,
          role: item.role,
          rating: item.note,
          comment: item.commentaire,
          event: item.evenement,
          country: item.pays
        }));
        setReviews(formattedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Optional: Load fallback or mock data if API fails (e.g., local dev)
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allPastEvents = dbEvents.length > 0 
      ? dbEvents.filter((ev: any) => new Date(ev.target_date || ev.date) < new Date())
      : localPastEvents;
    const selectedEvent = allPastEvents.find((ev: any) => (ev.id?.toString()) === formData.eventId);
    const validCode = selectedEvent?.event_code || "";

    if (!formData.country) {
      toast.error(isEn ? "Please select a country." : "Veuillez sélectionner un pays.");
      return;
    }
    
    if (!validCode) {
      toast.error(isEn ? "This event does not accept reviews yet." : "Cet événement n'accepte pas encore d'avis.");
      return;
    }

    if (formData.code.trim().toUpperCase() !== validCode.trim().toUpperCase()) {
      toast.error(isEn ? "Invalid event code. Please check your invitation." : "Code événement invalide. Veuillez vérifier votre invitation.");
      return;
    }
    
    const allPastEventsForTitle = dbEvents.length > 0 
      ? dbEvents.filter((ev: any) => new Date(ev.target_date || ev.date) < new Date())
      : localPastEvents;
    const selectedEventTitle = allPastEventsForTitle.find((ev: any) => (ev.id?.toString()) === formData.eventId)?.title || (isEn ? "BNE Event" : "Événement BNE");
    setSent(true);
    
    try {
      const payload = {
        pays: formData.country,
        evenement: selectedEventTitle,
        code_evenement: formData.code,
        nom: formData.name,
        role: formData.role,
        note: formData.rating,
        commentaire: formData.comment,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Optimistic update of the UI
        const newReview: Review = {
          id: Date.now().toString(),
          name: formData.name,
          role: formData.role,
          rating: formData.rating,
          comment: formData.comment,
          event: selectedEventTitle,
          country: formData.country,
        };
        setReviews([newReview, ...reviews]);
        toast.success(isEn ? "Your review has been published successfully." : "Votre avis a été publié avec succès.");
        
        setTimeout(() => {
          setSent(false);
          setFormData({ ...formData, code: "", comment: "", rating: 5 });
        }, 3000);
      } else {
        throw new Error(result.error || (isEn ? "Server error" : "Erreur serveur"));
      }
    } catch (error) {
      console.error('Error inserting review:', error);
      toast.error(isEn ? "An error occurred while publishing your review." : "Une erreur est survenue lors de la publication de votre avis.");
      setSent(false);
    }
  };

  return (
    <div className="pt-32 pb-20 container max-w-5xl">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">{isEn ? "Your experience" : "Votre expérience"}</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">
          {isEn ? "Give us " : "Donnez-nous "}
          <em className="italic gold-text">{isEn ? "your feedback" : "votre avis"}</em>.
        </h1>
        <p className="mt-6 text-muted-foreground font-serif italic max-w-xl mx-auto">
          {isEn 
            ? "Share your experience with the BNE community. Your feedback is valuable." 
            : "Partagez votre expérience avec la communauté BNE. Votre retour est précieux."}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="glass-strong p-8 md:p-10 rounded-sm space-y-6 corner-deco relative h-fit">
          <h2 className="font-display text-3xl mb-6">{isEn ? "Publish a review" : "Publier un avis"}</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{isEn ? "Country" : "Pays"}</div>
              <Select 
                value={formData.country} 
                onValueChange={(val) => setFormData({...formData, country: val})}
              >
                <SelectTrigger className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 h-12 text-sm outline-none focus:border-gold/60 transition-colors text-foreground">
                  <SelectValue placeholder={isEn ? "Select" : "Sélectionner"} />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0d0f] border-border text-foreground z-[200] max-h-72">
                  {sortedCountries.map((country) => (
                    <SelectItem key={country.code} value={country.labelFr} className="focus:bg-gold/20 cursor-pointer">
                      <div className="flex items-center gap-3">
                        {country.code !== "autre" ? (
                           <TestimonialFlag type={country.code} className="w-5 h-5" />
                        ) : (
                           <div className="w-5 h-5 rounded-full border border-border bg-[#C5A059]" />
                        )}
                        <span>{isEn ? country.labelEn : country.labelFr}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{isEn ? "Past event" : "Événement passé"}</div>
              <select 
                className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors text-foreground"
                value={formData.eventId}
                onChange={e => setFormData({...formData, eventId: e.target.value})}
                required
              >
                <option value="" className="bg-[#0a0d0f]">{isEn ? "Select an event" : "Sélectionner un événement"}</option>
                {(dbEvents.length > 0 
                  ? dbEvents.filter((ev: any) => new Date(ev.target_date || ev.date) < new Date())
                  : localPastEvents
                ).map((ev: any) => (
                  <option key={ev.id} value={ev.id.toString()} className="bg-[#0a0d0f]">{ev.title} ({ev.city || ev.lieu})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <Field 
              label={isEn ? "Event code (e.g. BNE2026)" : "Code de l'événement (ex: BNE2026)"} 
              value={formData.code} 
              onChange={(e: any) => setFormData({...formData, code: e.target.value})} 
              required 
            />
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Field 
                label={isEn ? "Your Name (or initials)" : "Votre Nom (ou initiales)"} 
                value={formData.name} 
                onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
                required 
              />
              <Field 
                label={isEn ? "Your Role / Profile" : "Votre Rôle / Profil"} 
                placeholder={isEn ? "e.g. CEO, TechFlow" : "ex: CEO, TechFlow"}
                value={formData.role} 
                onChange={(e: any) => setFormData({...formData, role: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{isEn ? "Rating" : "Note"}</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className={`transition-colors ${formData.rating >= star ? 'text-primary' : 'text-muted'}`}
                >
                  <Star size={24} fill={formData.rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{isEn ? "Your review" : "Votre avis"}</div>
            <textarea 
              rows={4} 
              className="w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors"
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
              required
            />
          </div>

          <button type="submit" disabled={sent} className="btn-gold w-full py-4 mt-2 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
            {sent 
              ? (isEn ? "Review published" : "Avis publié") 
              : <><Send size={14} /> {isEn ? "Publish my review" : "Publier mon avis"}</>}
          </button>
        </form>

        {/* LISTE DES AVIS */}
        <div className="space-y-12">
          <div className="text-center md:text-left">
            <h2 className="font-display text-3xl mb-2">{isEn ? "Latest reviews" : "Derniers avis"}</h2>
            <p className="text-muted-foreground text-sm italic">{isEn ? "Sorted by experience" : "Classés par expérience"}</p>
          </div>

          {(() => {
            const groupedReviews = reviews.reduce((acc, review) => {
              const key = review.event || (isEn ? "Other testimonials" : "Autres témoignages");
              if (!acc[key]) acc[key] = [];
              acc[key].push(review);
              return acc;
            }, {} as Record<string, Review[]>);

            return Object.entries(groupedReviews).map(([eventName, eventReviews]) => {
              const matchingEvent = dbEvents.find((ev: any) => ev.title === eventName);
              
              return (
                <div key={eventName} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="font-display text-xl text-gold">{eventName}</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
                    {matchingEvent && (
                      <Link to={`/revivre/${matchingEvent.id}`} className="hidden md:flex text-[10px] text-gold-light uppercase tracking-[0.1em] hover:text-gold transition-colors items-center gap-1 border border-gold/20 px-3 py-1 rounded-sm bg-gold/5">
                        Revivre l'événement →
                      </Link>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6 transition-opacity duration-500">
                    {eventReviews.map((review, i) => {
                      const c = review.country?.toLowerCase() || "";
                      return (
                        <div key={review.id} className="luxe-card p-8 rounded-sm animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                          <div className="flex gap-1 mb-5 text-primary">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} size={12} fill={j < review.rating ? "currentColor" : "none"} className={j >= review.rating ? "text-muted" : ""} />
                            ))}
                          </div>
                          
                          {matchingEvent && (
                             <Link to={`/revivre/${matchingEvent.id}`} className="md:hidden text-xs text-gold-light mb-4 uppercase tracking-[0.1em] hover:text-gold transition-colors underline underline-offset-2 decoration-gold/30 hover:decoration-gold block">
                               {review.event} →
                             </Link>
                          )}

                          <p className="font-serif italic text-lg leading-relaxed text-foreground/90 mb-6">« {review.comment} »</p>
                          
                          <div className="flex items-center gap-4 pt-4 border-t border-border">
                            <TestimonialFlag type={c} />
                            <div>
                              <div className="font-display text-base">{review.name}</div>
                              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{review.role}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required, placeholder }: any) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
        {label} {required && <span className="text-gold">*</span>}
      </div>
      <input 
        type={type} 
        className="w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors" 
        value={value} 
        onChange={onChange} 
        required={required} 
        placeholder={placeholder}
      />
    </div>
  );
}
