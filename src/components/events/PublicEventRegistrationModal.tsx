// src/components/events/PublicEventRegistrationModal.tsx
// Formulaire d'inscription dynamique public connecté au MDIV EVENT ENGINE

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventCustomField, RegistrationPayload, RegistrationResult } from '@/types/eventEngine';
import { EventRegistrationConfirmation } from './EventRegistrationConfirmation';
import { 
  Ticket, Calendar, MapPin, Building2, User, Mail, Phone, 
  Camera, Upload, CheckCircle2, AlertCircle, Loader2, X, 
  Sparkles, Lock, ArrowRight, ShieldCheck, RefreshCw, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PublicEventRegistrationModalProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
}

const isTruthyBool = (val: any): boolean => val === true || val === 1 || val === '1' || val === 'true';

export function PublicEventRegistrationModal({
  eventId,
  isOpen,
  onClose
}: PublicEventRegistrationModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    sector: "",
    pitch_text: "",
    linkedin_url: "",
    networking_opt_in: true,
    photo_consent: true,
    gdpr_consent: false,
  });

  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoFilename, setPhotoFilename] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Récupération des données de l'événement et des questions personnalisées
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['public-event-details', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_event&id=${eventId}`);
      const json = await res.json();
      return json.data;
    },
    enabled: isOpen && !!eventId
  });

  const event = eventData;
  const featuresConfig = event?.features_config || {};
  const isCustomFieldsEnabled = featuresConfig['custom_fields']?.enabled !== false;
  const isNetworkingEnabled = featuresConfig['networking_wall']?.enabled !== false;
  const customFields: EventCustomField[] = (event?.custom_fields || []).filter((f: EventCustomField) => f.is_active === undefined || isTruthyBool(f.is_active));

  // Gestion de l'upload photo
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type MIME
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      toast.error("Format de photo non supporté. Veuillez sélectionner une image JPG, PNG ou WebP.");
      return;
    }

    // Vérification de la taille (5 Mo max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La photo ne doit pas dépasser 5 Mo.");
      return;
    }

    setPhotoFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setPhotoPreview(b64);
      setPhotoBase64(b64);
      toast.success("Photo chargée avec succès !");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoFilename("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error("Veuillez renseigner votre nom et prénom.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error("Veuillez renseigner une adresse e-mail valide.");
      return;
    }
    if (!formData.gdpr_consent) {
      toast.error("Veuillez accepter les conditions de traitement des données pour valider votre inscription.");
      return;
    }

    // Validation des champs personnalisés obligatoires
    if (isCustomFieldsEnabled) {
      for (const field of customFields) {
        const isRequired = isTruthyBool(field.is_required);
        if (isRequired) {
          const val = customAnswers[field.field_key];
          if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0)) {
            toast.error(`Le champ obligatoire « ${field.label} » doit être renseigné.`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);

    try {
      const payload: RegistrationPayload = {
        event_id: Number(eventId),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        job_title: formData.job_title,
        sector: formData.sector,
        pitch_text: formData.pitch_text,
        linkedin_url: formData.linkedin_url,
        photo_base64: photoBase64 || undefined,
        photo_filename: photoFilename || undefined,
        networking_opt_in: formData.networking_opt_in,
        photo_consent: formData.photo_consent,
        gdpr_consent: formData.gdpr_consent,
        custom_answers: customAnswers,
        acquisition_source: "website_modal"
      };

      const res = await fetch('/api/event_engine.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'enregistrement de l'inscription.");
      }

      const resultWithAttendee = {
        ...data,
        attendee: data.attendee || {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          job_title: formData.job_title,
          photo_url: photoPreview,
          ticket_code: data.ticket_code
        }
      };
      setRegistrationResult(resultWithAttendee);
      toast.success("Votre inscription a bien été prise en compte !");
    } catch (err: any) {
      toast.error(err.message || "Erreur réseau lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative my-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-amber-400 w-8 h-8" />
            <p className="text-xs text-muted-foreground">Chargement des détails de l'événement...</p>
          </div>
        ) : registrationResult ? (
          <EventRegistrationConfirmation
            result={registrationResult}
            event={event}
            onReset={() => {
              setRegistrationResult(null);
              onClose();
            }}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* En-tête de l'événement */}
            <div className="border-b border-border pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10.5px] font-semibold mb-2">
                <Sparkles size={12} /> Inscription Officielle en Ligne
              </div>
              <h2 className="font-extrabold text-xl md:text-2xl text-foreground font-serif leading-tight">
                {event?.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                {event?.date && (
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Calendar size={13} /> {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
                {event?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} /> {event.location}
                  </span>
                )}
                {event?.price && (
                  <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded text-[11px]">
                    {event.price}
                  </span>
                )}
              </div>
            </div>

            {/* SECTION 1 : COORDONNÉES DU PARTICIPANT */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <User size={14} /> 1. Vos Informations Personnelles & Professionnelles
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">Prénom *</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Jean"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">Nom *</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Dupont"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">E-mail professionnel *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@entreprise.fr"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">Téléphone mobile</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">Entreprise / Organisation</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Cabinet Dupont / SARL Renov"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">Fonction / Rôle</label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="Dirigeant, Architecte, Responsable..."
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 : PHOTO PARTICIPANT (POUR BADGE & CRM) */}
            <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Camera size={14} className="text-amber-400" />
                    Photo de Profil (Pour votre badge numérique & le trombinoscope)
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Téléchargez un portrait clair depuis votre smartphone ou votre ordinateur (JPG, PNG, WebP — max 5 Mo).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                {photoPreview ? (
                  <div className="relative group shrink-0">
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow hover:bg-red-700 cursor-pointer"
                      title="Retirer la photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-muted border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground shrink-0">
                    <User size={24} className="opacity-40" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="attendee-photo-upload"
                  />
                  <label
                    htmlFor="attendee-photo-upload"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all"
                    style={{ color: '#ffffff', backgroundColor: '#0f172a' }}
                  >
                    <Upload size={13} style={{ color: '#ffffff' }} />
                    <span style={{ color: '#ffffff' }}>{photoPreview ? "Changer la photo" : "Choisir une photo"}</span>
                  </label>
                  {photoFilename && (
                    <span className="text-[10.5px] text-muted-foreground ml-2 truncate inline-block max-w-[150px]">
                      {photoFilename}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3 : NETWORKING & PITCH ENTREPRISE (SI ACTIVÉ) */}
            {isNetworkingEnabled && (
              <div className="space-y-3 p-4 bg-amber-500/[0.03] border border-amber-500/20 rounded-2xl">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" />
                  2. Présentation B2B & Networking Wall
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    Pitch express de votre entreprise (max 300 caractères)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={formData.pitch_text}
                    onChange={(e) => setFormData({ ...formData, pitch_text: e.target.value })}
                    placeholder="ex: Spécialiste de la rénovation thermique et plomberie pour syndics parisiens. Recherche partenaires prescripteurs."
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    Lien profil LinkedIn (facultatif)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://www.linkedin.com/in/votre-profil"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* SECTION 4 : QUESTIONS SUR-MESURE (SI ACTIVÉ) */}
            {isCustomFieldsEnabled && customFields.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <FileText size={14} /> 3. Questions Spécifiques à l'Événement
                </h4>

                <div className="space-y-3.5">
                  {customFields.map((field) => {
                    const isRequired = isTruthyBool(field.is_required);
                    const val = customAnswers[field.field_key] || "";
                    const optionsList = Array.isArray(field.options)
                      ? field.options
                      : (typeof field.options === 'string' && field.options.trim()
                          ? (() => { try { return JSON.parse(field.options); } catch { return []; } })()
                          : []);

                    return (
                      <div key={field.field_key} className="space-y-1">
                        <label className="block text-[11px] font-bold text-foreground">
                          {field.label} {isRequired && <span className="text-red-400">*</span>}
                        </label>
                        {field.description && (
                          <p className="text-[10.5px] text-muted-foreground">{field.description}</p>
                        )}

                        {/* Rendu dynamique selon le type */}
                        {field.field_type === 'textarea' ? (
                          <textarea
                            required={isRequired}
                            rows={3}
                            value={val}
                            onChange={(e) => setCustomAnswers({ ...customAnswers, [field.field_key]: e.target.value })}
                            placeholder={field.placeholder || ""}
                            className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                          />
                        ) : field.field_type === 'select' ? (
                          <select
                            required={isRequired}
                            value={val}
                            onChange={(e) => setCustomAnswers({ ...customAnswers, [field.field_key]: e.target.value })}
                            className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                          >
                            <option value="">{field.placeholder || "Sélectionnez une option..."}</option>
                            {optionsList.map((opt: any) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : field.field_type === 'radio' ? (
                          <div className="space-y-1.5 pt-1">
                            {optionsList.map((opt: any) => (
                              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                                <input
                                  type="radio"
                                  name={field.field_key}
                                  value={opt.value}
                                  checked={val === opt.value}
                                  onChange={(e) => setCustomAnswers({ ...customAnswers, [field.field_key]: e.target.value })}
                                  className="text-amber-500"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        ) : field.field_type === 'checkbox_group' ? (
                          <div className="space-y-1.5 pt-1">
                            {optionsList.map((opt: any) => {
                              const currentSelected = Array.isArray(val) ? val : (typeof val === 'string' && val ? val.split(',') : []);
                              const isChecked = currentSelected.includes(opt.value);
                              return (
                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const nextSelected = e.target.checked
                                        ? [...currentSelected, opt.value]
                                        : currentSelected.filter((v: string) => v !== opt.value);
                                      setCustomAnswers({ ...customAnswers, [field.field_key]: nextSelected });
                                    }}
                                    className="rounded text-amber-500 border-slate-600 focus:ring-amber-500/20"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : field.field_type === 'checkbox' ? (
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200 dark:text-slate-100 font-medium pt-1">
                            <input
                              type="checkbox"
                              checked={!!val}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [field.field_key]: e.target.checked })}
                              className="rounded text-amber-500 border-slate-600 focus:ring-amber-500/20"
                            />
                            <span>{field.placeholder || "Oui, je confirme"}</span>
                          </label>
                        ) : (
                          <input
                            type={
                              field.field_type === 'email' ? 'email' :
                              field.field_type === 'phone' ? 'tel' :
                              field.field_type === 'number' ? 'number' :
                              field.field_type === 'date' ? 'date' :
                              field.field_type === 'url' ? 'url' : 'text'
                            }
                            required={isRequired}
                            value={val}
                            onChange={(e) => setCustomAnswers({ ...customAnswers, [field.field_key]: e.target.value })}
                            placeholder={field.placeholder || ""}
                            className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 5 : CONSENTEMENTS & RGPD */}
            <div className="pt-2 border-t border-border space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 dark:text-slate-100 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={formData.gdpr_consent}
                  onChange={(e) => setFormData({ ...formData, gdpr_consent: e.target.checked })}
                  className="mt-0.5 rounded text-amber-500 border-slate-500 focus:ring-amber-500/20 cursor-pointer"
                />
                <span className="text-[12px] leading-relaxed font-medium">
                  J'accepte que mes données soient traitées par MDIV Network pour la gestion de mon inscription et le suivi de cet événement conformément à la politique de confidentialité. *
                </span>
              </label>

              {isNetworkingEnabled && (
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-200 dark:text-slate-100 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.networking_opt_in}
                    onChange={(e) => setFormData({ ...formData, networking_opt_in: e.target.checked })}
                    className="mt-0.5 rounded text-amber-500 border-slate-500 focus:ring-amber-500/20 cursor-pointer"
                  />
                  <span className="text-[12px] leading-relaxed font-medium">
                    J'autorise la publication de mon profil professionnel (nom, entreprise, photo et pitch) sur le Networking Wall réservé aux participants.
                  </span>
                </label>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-xs text-muted-foreground"
              >
                Annuler
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg px-6 py-3 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Validation de l'inscription...
                  </>
                ) : (
                  <>
                    Confirmer mon inscription <ArrowRight size={15} />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
