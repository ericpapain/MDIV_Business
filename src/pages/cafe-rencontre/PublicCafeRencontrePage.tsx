// src/pages/cafe-rencontre/PublicCafeRencontrePage.tsx
// Page publique Café Rencontre - Synthétique, percutante & 100% optimisée mobile

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Coffee,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MessageSquare,
  Lock,
  X,
  ShieldCheck,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import type {
  PublicCampaignResponse,
  CafeRencontreSpeaker,
  MeetingFormat,
  AvailabilityType
} from '../../types/cafeRencontre';

const TOPIC_OPTIONS = [
  'Développer la présence numérique de mon activité',
  'Découvrir les possibilités de l\'IA et automatiser des tâches',
  'Créer ou moderniser un site internet / application',
  'Améliorer les processus et l\'organisation de mon entreprise',
  'Mieux exploiter mes données et indicateurs de gestion',
  'Échange exploratoire / Conseil stratégique'
];

export const PublicCafeRencontrePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicCampaignResponse | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<CafeRencontreSpeaker | null>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    requester_name: '',
    company_name: '',
    job_title: '',
    email: '',
    phone: '',
    website: '',
    sector: '',
    main_topic: TOPIC_OPTIONS[0],
    secondary_topics: [] as string[],
    need_description: '',
    meeting_format: 'both' as MeetingFormat,
    city: '',
    postal_code: '',
    availability: 'flexible' as AvailabilityType,
    preferred_date: '',
    additional_comment: '',
    consent_accepted: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<any | null>(null);

  // Charger les données de la campagne publique
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/cafe_rencontre.php?action=get_public_campaign&slug=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement campagne publique:', err);
        setData({
          success: false,
          status: 'disabled',
          message: 'Impossible de contacter le serveur.'
        });
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpeaker || !data?.campaign) return;

    if (!formData.requester_name.trim()) {
      setSubmitError('Votre nom et prénom sont obligatoires.');
      return;
    }
    if (!formData.company_name.trim()) {
      setSubmitError('Le nom de votre entreprise est obligatoire.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setSubmitError('Veuillez renseigner une adresse e-mail valide.');
      return;
    }
    if (!formData.city.trim()) {
      setSubmitError('Veuillez renseigner votre ville.');
      return;
    }
    if (!formData.consent_accepted) {
      setSubmitError('Veuillez accepter les conditions de contact.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/cafe_rencontre.php?action=submit_booking_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: data.campaign.id,
          campaign_slug: data.campaign.slug,
          speaker_id: selectedSpeaker.id,
          requester_name: formData.requester_name,
          company_name: formData.company_name,
          job_title: formData.job_title,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          sector: formData.sector,
          main_topic: formData.main_topic,
          secondary_topics: formData.secondary_topics,
          need_description: formData.need_description,
          meeting_format: formData.meeting_format,
          city: formData.city,
          postal_code: formData.postal_code,
          availability: formData.availability,
          preferred_date: formData.preferred_date,
          additional_comment: formData.additional_comment,
          consent_accepted: formData.consent_accepted ? 1 : 0
        })
      });

      const resJson = await res.json();

      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || resJson.message || 'Erreur lors de l\'enregistrement de votre demande.');
      }

      setSubmittedSuccess({
        speaker: selectedSpeaker,
        campaign: data.campaign,
        format: formData.meeting_format,
        email: formData.email,
        request_id: resJson.request_id
      });
      setSelectedSpeaker(null);
    } catch (err: any) {
      setSubmitError(err.message || 'Une erreur est survenue lors de l\'envoi de votre demande.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. ÉTAT CHARGEMENT
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3">
          <Coffee className="w-7 h-7 text-amber-400 animate-spin" />
        </div>
        <p className="text-slate-400 text-xs tracking-wide">Chargement de votre session...</p>
      </div>
    );
  }

  // 2. ÉTAT NON OUVERT (« UPCOMING »)
  if (data?.status === 'upcoming') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Session bientôt disponible</h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Cette session de prise de rendez-vous n'est pas encore ouverte. Revenez prochainement.
          </p>
          <Link
            to={data.campaign?.contact_redirect_url || data.contact_url || '/contact'}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Nous contacter
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. ÉTAT EXPIRÉ OU DÉSACTIVÉ (« EXPIRED » ou « DISABLED »)
  if (!data?.success || data.status === 'expired' || data.status === 'disabled') {
    const contactUrl = data?.campaign?.contact_redirect_url || data?.contact_url || '/contact';

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5">
            <Coffee className="w-7 h-7" />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
            Désolé, cette session de prise de rendez-vous est maintenant fermée.
          </h1>

          <p className="text-slate-300 text-sm font-medium mb-3">
            La période de réservation pour cette rencontre est terminée.
          </p>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
            Vous souhaitez néanmoins échanger avec notre équipe, présenter votre projet ou obtenir davantage d'informations ?
            Nous vous invitons à nous contacter directement via notre site.
            <br />
            <strong className="text-slate-300 block mt-2">Merci pour votre intérêt et à très bientôt !</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={contactUrl}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-transform active:scale-95 shadow-md shadow-amber-500/20"
            >
              Nous contacter
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. ÉCRAN DE CONFIRMATION APRÈS SOUMISSION RÉUSSIE
  if (submittedSuccess) {
    const { speaker, campaign, format } = submittedSuccess;
    const formatLabel =
      format === 'client_premises'
        ? 'Dans vos locaux (nous venons à votre rencontre)'
        : format === 'cafe_public'
        ? 'Dans un café convivial'
        : 'Dans vos locaux ou autour d\'un café';

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            Demande enregistrée
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Merci pour votre demande !
          </h1>

          <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 mb-6 text-left bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800">
            <p>
              Votre demande de Café Rencontre a bien été enregistrée.
            </p>
            <p>
              Nous reviendrons vers vous dans les meilleurs délais afin d'échanger sur vos disponibilités et de fixer ensemble un créneau de 30 minutes.
            </p>
            <p className="font-bold text-amber-400">
              À très bientôt !
            </p>
          </div>

          {/* Récapitulatif */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between gap-2 pb-1.5 border-b border-slate-800">
              <span className="text-slate-400">Intervenant :</span>
              <span className="text-white font-bold text-right">{speaker.display_name}</span>
            </div>
            <div className="flex justify-between gap-2 pb-1.5 border-b border-slate-800">
              <span className="text-slate-400">Format :</span>
              <span className="text-amber-400 font-semibold text-right">{formatLabel}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Rendez-vous confirmé personnellement par notre équipe.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setSubmittedSuccess(null)}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Autre demande
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
            >
              Découvrir MDIV Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. ÉCRAN PUBLIC ACTIF
  const campaign = data.campaign!;
  const speakers = data.speakers || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30 selection:text-amber-300">
      {/* Header compact & sticky */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xs">
              M
            </div>
            <span className="font-extrabold tracking-tight text-sm">MDIV Business</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Session Ouverte
            </span>
            <Link
              to={campaign.contact_redirect_url || '/contact'}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION : SYNTHÉTIQUE, PERCUTANTE & OPTIMISÉE MOBILE */}
      <section className="relative pt-6 pb-8 sm:pt-12 sm:pb-14 border-b border-slate-900 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Coffee className="w-3.5 h-3.5" />
            CAFÉ RENCONTRE — 30 MINUTES POUR ÉCHANGER
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
            Et si nous prenions un café ?
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-4">
            30 minutes d'échange gratuit et sans engagement sur vos projets, vos idées ou votre stratégie numérique.
            Dans vos locaux ou autour d'un café.
          </p>

          {/* Badges d'information compacts */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {campaign.title}
            </span>
            {campaign.location && (
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" />
                {campaign.location}
              </span>
            )}
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold">
              30 min offertes • Gratuit
            </span>
          </div>
        </div>
      </section>

      {/* LISTE DES INTERVENANTS (RESPONSIVE CARDS) */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            Choisissez votre interlocuteur
          </h2>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            {speakers.length} {speakers.length > 1 ? 'experts' : 'expert'}
          </span>
        </div>

        {speakers.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            Intervenants en cours de configuration.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {speakers.map((spk) => {
              const expertisesList = Array.isArray(spk.expertises)
                ? spk.expertises
                : (typeof spk.expertises === 'string' && spk.expertises.trim())
                ? spk.expertises.split(',').map(s => s.trim())
                : [];

              return (
                <div
                  key={spk.id}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    {/* Photo + Infos */}
                    <div className="flex items-center gap-3.5 mb-3.5">
                      {spk.photo_url ? (
                        <img
                          src={spk.photo_url}
                          alt={spk.display_name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/20 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-base shrink-0">
                          {spk.display_name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-white truncate">
                          {spk.display_name}
                        </h3>
                        {spk.job_title && (
                          <p className="text-slate-300 text-xs font-medium truncate flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                            {spk.job_title}
                          </p>
                        )}
                        {spk.company && (
                          <p className="text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                            {spk.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio courte */}
                    {spk.bio && (
                      <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 mb-3 italic">
                        « {spk.bio} »
                      </p>
                    )}

                    {/* Tags expertises */}
                    {expertisesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {expertisesList.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 text-[10px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bouton d'action tactile (hauteur optimale mobile 44px+) */}
                  <button
                    onClick={() => {
                      setSelectedSpeaker(spk);
                      setSubmitError(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <span>Échanger avec {spk.display_name.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Vos informations restent 100% confidentielles. Aucun démarchage abusif.</span>
        </div>
      </main>

      {/* MODALE DU FORMULAIRE MOBILE-FIRST */}
      {selectedSpeaker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative">
            {/* Bouton fermer */}
            <button
              onClick={() => setSelectedSpeaker(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* En-tête modale */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800 pr-8">
              {selectedSpeaker.photo_url ? (
                <img
                  src={selectedSpeaker.photo_url}
                  alt={selectedSpeaker.display_name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center shrink-0">
                  {selectedSpeaker.display_name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Demande de Café (30 min)
                </span>
                <h3 className="text-base font-bold text-white truncate">
                  Avec {selectedSpeaker.display_name}
                </h3>
                <p className="text-slate-400 text-[11px] truncate">
                  {selectedSpeaker.company || campaign.title}
                </p>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* 1. Coordonnées */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Votre Nom & Prénom <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sarah Martin"
                      value={formData.requester_name}
                      onChange={e => setFormData({ ...formData, requester_name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Entreprise / Organisation <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cabinet Martin"
                      value={formData.company_name}
                      onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Adresse e-mail <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@exemple.fr"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Sujet */}
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-slate-300 font-medium mb-1.5">
                  Quel sujet aimeriez-vous aborder ? <span className="text-amber-400">*</span>
                </label>
                <div className="space-y-1.5">
                  {TOPIC_OPTIONS.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        formData.main_topic === opt
                          ? 'bg-amber-500/15 border-amber-500/40 text-white font-medium'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="main_topic"
                        value={opt}
                        checked={formData.main_topic === opt}
                        onChange={() => setFormData({ ...formData, main_topic: opt })}
                        className="mt-0.5 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="leading-snug">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Organisation */}
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-slate-300 font-medium mb-2">
                  Où préférez-vous nous rencontrer ? <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { id: 'client_premises', label: 'Dans vos locaux', sub: 'On vient chez vous' },
                    { id: 'cafe_public', label: 'Au café', sub: 'Lieu convivial' },
                    { id: 'both', label: 'Les deux', sub: 'Selon agenda' }
                  ].map(fmt => (
                    <button
                      type="button"
                      key={fmt.id}
                      onClick={() => setFormData({ ...formData, meeting_format: fmt.id as MeetingFormat })}
                      className={`p-2.5 rounded-xl border text-center transition-colors ${
                        formData.meeting_format === fmt.id
                          ? 'bg-amber-500/15 border-amber-500/50 text-white font-bold'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] leading-tight">{fmt.label}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{fmt.sub}</div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Votre Ville <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Troyes"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Moment préféré
                    </label>
                    <select
                      value={formData.availability}
                      onChange={e => setFormData({ ...formData, availability: e.target.value as AvailabilityType })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="morning">Matinée</option>
                      <option value="afternoon">Après-midi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Consentement RGPD */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consent_accepted}
                    onChange={e => setFormData({ ...formData, consent_accepted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-400 leading-tight">
                    J'accepte d'être recontacté(e) pour fixer ce créneau de 30 minutes sans engagement.
                  </span>
                </label>
              </div>

              {/* Bouton de confirmation */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <span>Confirmer mon Café Rencontre (30 min)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCafeRencontrePage;
