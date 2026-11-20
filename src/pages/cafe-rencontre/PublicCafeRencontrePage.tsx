// src/pages/cafe-rencontre/PublicCafeRencontrePage.tsx
// Page publique Café Rencontre - Accessible sans connexion via QR Code ou lien direct

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Coffee,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  Lock,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import type {
  PublicCampaignResponse,
  CafeRencontreSpeaker,
  MeetingFormat,
  AvailabilityType
} from '../../types/cafeRencontre';

const TOPIC_OPTIONS = [
  'Développer la présence numérique de mon activité',
  'Découvrir les possibilités de l\'intelligence artificielle',
  'Automatiser certaines tâches et gagner du temps',
  'Créer ou améliorer un site internet ou une application',
  'Mieux exploiter mes données et mes indicateurs',
  'Faire le point sur ma stratégie numérique',
  'Améliorer l\'organisation et les processus de mon entreprise',
  'Autre sujet / Simple échange exploratoire'
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
    consent_accepted: false
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

  const handleToggleSecondaryTopic = (topic: string) => {
    setFormData(prev => {
      const exists = prev.secondary_topics.includes(topic);
      if (exists) {
        return { ...prev, secondary_topics: prev.secondary_topics.filter(t => t !== topic) };
      } else {
        return { ...prev, secondary_topics: [...prev.secondary_topics, topic] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpeaker || !data?.campaign) return;

    if (!formData.requester_name.trim()) {
      setSubmitError('Votre nom et prénom sont obligatoires.');
      return;
    }
    if (!formData.company_name.trim()) {
      setSubmitError('Le nom de votre entreprise ou organisation est obligatoire.');
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
      setSubmitError('Veuillez accepter les conditions de contact pour valider votre demande.');
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 animate-pulse">
          <Coffee className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm">Chargement de votre session Café Rencontre...</p>
      </div>
    );
  }

  // 2. ÉTAT NON OUVERT (« UPCOMING »)
  if (data?.status === 'upcoming') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-sm shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Session bientôt disponible</h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Cette session de prise de rendez-vous n'est pas encore ouverte. Revenez prochainement.
          </p>
          <Link
            to={data.campaign?.contact_redirect_url || data.contact_url || '/contact'}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all border border-slate-700"
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 sm:p-10 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Coffee className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight">
            Désolé, cette session de prise de rendez-vous est maintenant fermée.
          </h1>

          <p className="text-slate-300 text-base leading-relaxed mb-6 font-normal">
            La période de réservation pour cette rencontre est terminée.
          </p>

          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
            Vous souhaitez néanmoins échanger avec notre équipe, présenter votre projet ou obtenir davantage d'informations ?
            <br className="hidden sm:inline" /> Nous vous invitons à nous contacter directement via notre site.
            <br />
            <span className="text-slate-300 font-medium mt-2 inline-block">
              Merci pour votre intérêt et à très bientôt !
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={contactUrl}
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              Nous contacter
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3.5 px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all border border-slate-700/60"
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
        ? 'Dans un café ou lieu convivial convenu ensemble'
        : 'Dans vos locaux ou autour d\'un café selon convenance';

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Demande confirmée
          </span>

          <h1 className="text-3xl font-extrabold text-white mb-4">
            Merci pour votre demande !
          </h1>

          <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 mb-8 text-left bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
            <p>
              Votre demande de Café Rencontre a bien été enregistrée.
            </p>
            <p>
              Nous vous remercions pour votre intérêt et reviendrons vers vous dans les meilleurs délais afin d'échanger sur vos disponibilités et de fixer ensemble un créneau de 30 minutes.
            </p>
            <p>
              Que ce soit dans vos locaux ou autour d'un café, nous serons ravis de faire votre connaissance et de discuter de vos projets.
            </p>
            <p className="font-semibold text-amber-400 pt-2">
              À très bientôt !
            </p>
          </div>

          {/* Récapitulatif clair */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm space-y-2.5 mb-8">
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
              <span className="text-slate-400">Intervenant choisi :</span>
              <span className="text-white font-semibold text-right">
                {speaker.display_name} {speaker.company ? `(${speaker.company})` : ''}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
              <span className="text-slate-400">Campagne :</span>
              <span className="text-white font-medium text-right">{campaign.title}</span>
            </div>
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
              <span className="text-slate-400">Format souhaité :</span>
              <span className="text-amber-400 font-medium text-right">{formatLabel}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Rappel : le rendez-vous sera confirmé après notre prise de contact personnalisée.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedSuccess(null);
                setFormData({
                  requester_name: '',
                  company_name: '',
                  job_title: '',
                  email: '',
                  phone: '',
                  website: '',
                  sector: '',
                  main_topic: TOPIC_OPTIONS[0],
                  secondary_topics: [],
                  need_description: '',
                  meeting_format: 'both',
                  city: '',
                  postal_code: '',
                  availability: 'flexible',
                  preferred_date: '',
                  additional_comment: '',
                  consent_accepted: false
                });
              }}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
            >
              Faire une autre demande
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
            >
              Découvrir le site MDIV Business
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
      {/* Barre supérieure discrète */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white hover:text-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-sm">
              M
            </div>
            <span className="font-bold tracking-tight text-sm">MDIV Business</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
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

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Coffee className="w-4 h-4" />
            CAFÉ RENCONTRE — 30 MINUTES POUR ÉCHANGER
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
            Et si nous prenions un café ?
          </h1>

          <div className="max-w-2xl mx-auto space-y-3 text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            <p className="font-semibold text-white">
              30 minutes pour échanger sur vos projets, vos idées et vos défis professionnels.
            </p>
            <p className="text-slate-400 text-sm sm:text-base">
              Vous avez un projet, une difficulté ou simplement envie de découvrir ce que le numérique et l'intelligence artificielle peuvent apporter à votre activité ?
            </p>
            <p className="text-slate-300 text-sm sm:text-base">
              Choisissez votre interlocuteur et proposez un rendez-vous gratuit, sans engagement.
            </p>
            <p className="text-amber-400/90 text-sm font-medium">
              Nous pouvons venir vous rencontrer dans vos locaux ou vous retrouver autour d'un café.
            </p>
          </div>

          {/* Badges d'information sur la campagne */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-200">{campaign.title}</span>
            </div>
            {campaign.location && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{campaign.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>30 min gratuites • Sans engagement</span>
            </div>
          </div>
        </div>
      </section>

      {/* LISTE DES INTERVENANTS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-amber-400" />
              Nos intervenants disponibles
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Sélectionnez la personne avec laquelle vous aimeriez échanger :
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono">
            {speakers.length} {speakers.length > 1 ? 'experts' : 'expert'}
          </span>
        </div>

        {speakers.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
            <Coffee className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Aucun intervenant affiché</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Les intervenants pour cette session sont en cours de configuration par l'équipe organisatrice.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((spk) => {
              const expertisesList = Array.isArray(spk.expertises)
                ? spk.expertises
                : (typeof spk.expertises === 'string' && spk.expertises.trim())
                ? spk.expertises.split(',').map(s => s.trim())
                : [];

              return (
                <div
                  key={spk.id}
                  className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-amber-500/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

                  <div>
                    {/* Photo & Nom */}
                    <div className="flex items-center gap-4 mb-5">
                      {spk.photo_url ? (
                        <img
                          src={spk.photo_url}
                          alt={spk.display_name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-amber-500/40 transition-colors shadow-md shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-slate-800 border-2 border-slate-800 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                          {spk.display_name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                          {spk.display_name}
                        </h3>
                        {spk.job_title && (
                          <p className="text-slate-300 text-xs font-medium truncate flex items-center gap-1.5 mt-0.5">
                            <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                            {spk.job_title}
                          </p>
                        )}
                        {spk.company && (
                          <p className="text-slate-400 text-xs truncate flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                            {spk.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Présentation / Bio */}
                    {spk.bio && (
                      <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 mb-4 italic">
                        « {spk.bio} »
                      </p>
                    )}

                    {/* Domaines d'expertise */}
                    {expertisesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {expertisesList.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bouton d'action */}
                  <button
                    onClick={() => {
                      setSelectedSpeaker(spk);
                      setSubmitError(null);
                    }}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10 active:scale-95 group/btn"
                  >
                    <span>Échanger avec cette personne</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Note récapitulative bas de page */}
        <div className="mt-12 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 text-center text-xs text-slate-400 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Lock className="w-4 h-4 text-emerald-400" />
            Confidentialité garantie
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span>Vos coordonnées sont exclusivement transmises pour l'organisation de ce rendez-vous.</span>
        </div>
      </main>

      {/* MODALE DU FORMULAIRE DE PRISE DE RENDEZ-VOUS */}
      {selectedSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Bouton fermer */}
            <button
              onClick={() => setSelectedSpeaker(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* En-tête avec rappel de l'intervenant sélectionné */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-800 pr-10">
              {selectedSpeaker.photo_url ? (
                <img
                  src={selectedSpeaker.photo_url}
                  alt={selectedSpeaker.display_name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30 shadow-md shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 font-bold text-lg flex items-center justify-center shrink-0">
                  {selectedSpeaker.display_name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  Demande de Café Rencontre (30 min)
                </span>
                <h3 className="text-xl font-bold text-white">
                  Échanger avec {selectedSpeaker.display_name}
                </h3>
                <p className="text-slate-400 text-xs">
                  {selectedSpeaker.job_title ? `${selectedSpeaker.job_title} • ` : ''}
                  {selectedSpeaker.company || campaign.title}
                </p>
              </div>
            </div>

            {submitError && (
              <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* SECTION 1 : VOS INFORMATIONS */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  1. Vos coordonnées professionnelles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nom et prénom <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sarah Martin"
                      value={formData.requester_name}
                      onChange={e => setFormData({ ...formData, requester_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Entreprise / Organisation <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Entreprise Martin & Co"
                      value={formData.company_name}
                      onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Votre fonction
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Dirigeante, Responsable Technique..."
                      value={formData.job_title}
                      onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Adresse e-mail <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah.martin@exemple.fr"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Téléphone (optionnel)
                    </label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Secteur d'activité (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Industrie, Commerce, Services, Artisanat..."
                      value={formData.sector}
                      onChange={e => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 : SUJET DE L'ÉCHANGE */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  2. Sujet de notre échange
                </h4>
                <p className="text-xs text-slate-300 font-medium mb-3">
                  Quel sujet aimeriez-vous aborder lors de notre échange ? <span className="text-amber-400">*</span>
                </p>

                {/* Sujet principal */}
                <div className="space-y-2 mb-4">
                  {TOPIC_OPTIONS.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        formData.main_topic === opt
                          ? 'bg-amber-500/10 border-amber-500/40 text-white font-medium'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="main_topic"
                        value={opt}
                        checked={formData.main_topic === opt}
                        onChange={() => setFormData({ ...formData, main_topic: opt })}
                        className="mt-0.5 text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>

                {/* Sujets secondaires facultatifs */}
                <div className="mb-4">
                  <p className="text-[11px] text-slate-400 mb-2">
                    Sujets secondaires que vous souhaiteriez également évoquer (facultatif) :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_OPTIONS.filter(o => o !== formData.main_topic).map((opt, i) => {
                      const isSelected = formData.secondary_topics.includes(opt);
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => handleToggleSecondaryTopic(opt)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] transition-all border ${
                            isSelected
                              ? 'bg-slate-800 text-amber-400 border-amber-500/40 font-medium'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    En quelques mots, que souhaitez-vous discuter avec nous ?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Détaillez en quelques lignes votre contexte ou vos interrogations..."
                    value={formData.need_description}
                    onChange={e => setFormData({ ...formData, need_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* SECTION 3 : ORGANISATION DU RENDEZ-VOUS */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  3. Organisation du rendez-vous (30 minutes)
                </h4>
                
                <p className="text-xs text-slate-300 font-medium mb-2.5">
                  Où préférez-vous que nous nous rencontrions ? <span className="text-amber-400">*</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                  {[
                    { id: 'client_premises', label: 'Dans nos locaux', sub: 'Vous venez à notre rencontre' },
                    { id: 'cafe_public', label: 'Autour d\'un café', sub: 'Dans un lieu convivial' },
                    { id: 'both', label: 'Les deux me conviennent', sub: 'Selon vos disponibilités' }
                  ].map(fmt => (
                    <button
                      type="button"
                      key={fmt.id}
                      onClick={() => setFormData({ ...formData, meeting_format: fmt.id as MeetingFormat })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.meeting_format === fmt.id
                          ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{fmt.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{fmt.sub}</div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Ville <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Troyes"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 10000"
                      value={formData.postal_code}
                      onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Moment préféré
                    </label>
                    <select
                      value={formData.availability}
                      onChange={e => setFormData({ ...formData, availability: e.target.value as AvailabilityType })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="morning">Matinée</option>
                      <option value="afternoon">Après-midi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Précisions ou commentaire complémentaire (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: plutôt les mardis ou jeudis, semaine prochaine..."
                    value={formData.additional_comment}
                    onChange={e => setFormData({ ...formData, additional_comment: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* SECTION 4 : CONSENTEMENT RGPD */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consent_accepted}
                    onChange={e => setFormData({ ...formData, consent_accepted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    J'accepte que les informations renseignées soient utilisées pour traiter ma demande et organiser la prise de contact pour ce Café Rencontre.{' '}
                    <span className="text-slate-400">Aucun démarchage commercial abusif.</span>
                  </span>
                </label>
              </div>

              {/* ACTIONS */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSpeaker(null)}
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Enregistrement en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmer ma demande de rendez-vous</span>
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

