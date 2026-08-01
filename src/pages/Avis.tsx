import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";
import { events } from "@/data/mockData";

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
  const pastEvents = events.past || [];
  
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
  const API_URL = "https://mdiv-network.com/api-avis.php";

  useEffect(() => {
    fetchReviews();
  }, []);

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
    const selectedEvent = pastEvents.find(ev => ev.id === formData.eventId);
    const validCode = selectedEvent ? selectedEvent.code : "BNE2026";

    if (formData.code !== validCode) {
      toast.error("Code événement invalide. Veuillez vérifier votre invitation.");
      return;
    }
    
    const selectedEventTitle = pastEvents.find(ev => ev.id === formData.eventId)?.title || "Événement BNE";
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
        toast.success("Votre avis a été publié avec succès.");
        
        setTimeout(() => {
          setSent(false);
          setFormData({ ...formData, code: "", comment: "", rating: 5 });
        }, 3000);
      } else {
        throw new Error(result.error || "Erreur serveur");
      }
    } catch (error) {
      console.error('Error inserting review:', error);
      toast.error("Une erreur est survenue lors de la publication de votre avis.");
      setSent(false);
    }
  };

  return (
    <div className="pt-32 pb-20 container max-w-5xl">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">Votre expérience</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">Donnez-nous <em className="italic gold-text">votre avis</em>.</h1>
        <p className="mt-6 text-muted-foreground font-serif italic max-w-xl mx-auto">
          Partagez votre expérience avec la communauté BNE. Votre retour est précieux.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="glass-strong p-8 md:p-10 rounded-sm space-y-6 corner-deco relative h-fit">
          <h2 className="font-display text-3xl mb-6">Publier un avis</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Pays</div>
              <select 
                className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors text-foreground"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
                required
              >
                <option value="" className="bg-[#0a0d0f]">Sélectionner</option>
                <option value="France" className="bg-[#0a0d0f]">France</option>
                <option value="Suisse" className="bg-[#0a0d0f]">Suisse</option>
                <option value="Luxembourg" className="bg-[#0a0d0f]">Luxembourg</option>
                <option value="Belgique" className="bg-[#0a0d0f]">Belgique</option>
                <option value="Autre" className="bg-[#0a0d0f]">Autre</option>
              </select>
            </div>
            
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Événement passé</div>
              <select 
                className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors text-foreground"
                value={formData.eventId}
                onChange={e => setFormData({...formData, eventId: e.target.value})}
                required
              >
                <option value="" className="bg-[#0a0d0f]">Sélectionner un événement</option>
                {pastEvents.map(ev => (
                  <option key={ev.id} value={ev.id} className="bg-[#0a0d0f]">{ev.title} ({ev.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <Field 
              label="Code de l'événement (ex: BNE2026)" 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              required 
            />
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Field 
                label="Votre Nom (ou initiales)" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
              <Field 
                label="Votre Rôle / Profil" 
                placeholder="ex: CEO, TechFlow"
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Note</div>
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
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Votre avis</div>
            <textarea 
              rows={4} 
              className="w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors"
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
              required
            />
          </div>

          <button type="submit" disabled={sent} className="btn-gold w-full py-4 mt-2 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
            {sent ? "Avis publié" : <><Send size={14} /> Publier mon avis</>}
          </button>
        </form>

        {/* LISTE DES AVIS */}
        <div className="space-y-6">
          <h2 className="font-display text-3xl mb-6">Derniers avis</h2>
          {reviews.map((review) => {
            let colors = ["#C5A059", "#0A0D0F", "#C5A059"];
            const c = review.country?.toLowerCase() || "";
            if (c === "france") colors = ["#002654", "#ffffff", "#ed2939"];
            else if (c === "belgique") colors = ["#000000", "#fdda24", "#ef3340"];
            else if (c === "luxembourg") colors = ["#ed2939", "#ffffff", "#00a1de"]; // Technically horizontal, but works as 3 stripes
            else if (c === "suisse") colors = ["#ff0000", "#ffffff", "#ff0000"];

            return (
              <div key={review.id} className="luxe-card p-8 rounded-sm animate-fade-up">
                <div className="flex gap-1 mb-3 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-muted" : ""} />
                  ))}
                </div>
                <div className="text-xs text-gold-light mb-4 uppercase tracking-[0.1em]">{review.event}</div>
                <p className="font-serif italic text-lg leading-relaxed text-foreground/90 mb-6">« {review.comment} »</p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  {/* Dynamic Flag Avatar */}
                  <div className={`shrink-0 w-12 h-12 rounded-full overflow-hidden shadow-lg border border-border/10 flex ${c === 'luxembourg' ? 'flex-col' : ''}`}>
                    <div className="flex-1 h-full w-full" style={{ background: colors[0] }} />
                    <div className="flex-1 h-full w-full" style={{ background: colors[1] }} />
                    <div className="flex-1 h-full w-full" style={{ background: colors[2] }} />
                  </div>
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
