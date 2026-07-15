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

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setReviews(data as Review[]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
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
      const newReview = {
        name: formData.name,
        role: formData.role,
        rating: formData.rating,
        comment: formData.comment,
        event: selectedEventTitle,
      };

      if (!supabase) {
        toast.error("Base de données non configurée.");
        setSent(false);
        return;
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([newReview])
        .select();

      if (error) throw error;

      if (data) {
        setReviews([data[0] as Review, ...reviews]);
        toast.success("Votre avis a été publié avec succès.");
      }
      
      setTimeout(() => {
        setSent(false);
        setFormData({ ...formData, code: "", comment: "", rating: 5 });
      }, 3000);
      
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
                className="w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
                required
              >
                <option value="">Sélectionner</option>
                <option value="France">France</option>
                <option value="Suisse">Suisse</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Belgique">Belgique</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Événement passé</div>
              <select 
                className="w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors"
                value={formData.eventId}
                onChange={e => setFormData({...formData, eventId: e.target.value})}
                required
              >
                <option value="">Sélectionner un événement</option>
                {pastEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title} ({ev.city})</option>
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
          {reviews.map((review) => (
            <div key={review.id} className="luxe-card p-8 rounded-sm animate-fade-up">
              <div className="flex gap-1 mb-3 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-muted" : ""} />
                ))}
              </div>
              <div className="text-xs text-gold-light mb-4 uppercase tracking-[0.1em]">{review.event}</div>
              <p className="font-serif italic text-lg leading-relaxed text-foreground/90 mb-6">« {review.comment} »</p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden shadow-lg border border-white/10 flex">
                  {/* Default colorful avatar background like in prompt */}
                  <div className="flex-1 h-full" style={{ background: "rgb(0, 0, 0)" }} />
                  <div className="flex-1 h-full" style={{ background: "rgb(250, 224, 66)" }} />
                  <div className="flex-1 h-full" style={{ background: "rgb(239, 51, 64)" }} />
                </div>
                <div>
                  <div className="font-display text-base">{review.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
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
