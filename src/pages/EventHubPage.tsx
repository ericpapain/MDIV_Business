// src/pages/EventHubPage.tsx
// Hub public de l'événement (/evenements/:id) intégrant dynamiquement les modules activés par le MDIV EVENT ENGINE :
// - Inscription & Badges numériques
// - Pitchs Entreprises
// - Rendez-vous B2B 1-to-1 avec les partenaires
// - Tombola & Tirage au sort auditable
// - Mur de Networking (Networking Wall)

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  Ticket,
  Megaphone,
  CalendarCheck,
  Gift,
  Users,
  ArrowLeft,
  Share2,
  Clock,
  Sparkles,
  Award,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicEventRegistrationModal } from '@/components/events/PublicEventRegistrationModal';
import { EventPitchesSection } from '@/components/events/EventPitchesSection';
import { EventPartnersMeetingsSection } from '@/components/events/EventPartnersMeetingsSection';
import { EventTombolaAnimation } from '@/components/events/EventTombolaAnimation';
import { EventNetworkingWall } from '@/components/events/EventNetworkingWall';
import EventDescriptionExpandable from "@/components/events/EventDescriptionExpandable";
import { SimpleCountdown } from '@/components/event/SimpleCountdown';
import { toast } from 'sonner';
import { EventFeaturesConfig } from '@/types/eventEngine';
import { defaultEventFeatures } from '@/lib/eventFeatureCatalog';

export default function EventHubPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = Number(id);
  const navigate = useNavigate();

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Active tab state from URL or default
  const tabParam = searchParams.get('tab') || 'hub';
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch all events to find the target event
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['public-events-all'],
    queryFn: async () => {
      const res = await fetch('/api-public.php?action=events');
      const json = await res.json();
      return json.data || { upcoming: [], past: [] };
    },
  });

  const allEvents = [...(eventsData?.upcoming || []), ...(eventsData?.past || [])];
  const event = allEvents.find((e: any) => Number(e.id) === eventId);

  const featuresConfig: EventFeaturesConfig = event?.features_config
    ? typeof event.features_config === 'string'
      ? JSON.parse(event.features_config)
      : event.features_config
    : defaultEventFeatures;

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const handleShare = async () => {
    const shareData = {
      title: event?.title || 'Événement MDIV Business Network',
      text: event?.short_description || event?.title,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien de l'événement copié dans le presse-papier !");
    } catch {
      toast.error('Impossible de copier le lien.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-32 pb-20 container max-w-3xl mx-auto px-4 text-center text-white">
        <h2 className="text-2xl font-bold">Événement introuvable</h2>
        <p className="text-slate-400 mt-2">Cet événement n'existe pas ou a été archivé.</p>
        <Link to="/evenements" className="inline-flex items-center gap-2 text-amber-400 mt-4 underline text-sm">
          <ArrowLeft size={16} /> Retour aux événements
        </Link>
      </div>
    );
  }

  // Feature checks based on event configuration
  const hasRegistration = featuresConfig?.online_registration?.enabled !== false;
  const hasPitches = featuresConfig?.pitch_directory?.enabled !== false;
  const hasMeetings = featuresConfig?.b2b_meetings?.enabled !== false;
  const hasTombola = featuresConfig?.event_tombola?.enabled !== false;
  const hasNetworking = featuresConfig?.networking_wall?.enabled !== false;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-950 text-white selection:bg-amber-500/30">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link
          to="/evenements"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à la liste des événements
        </Link>
      </div>

      {/* Hero Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Event details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  MDIV Event Engine
                </span>
                {event.price && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {event.price}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  {new Date(event.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    {event.location}
                  </div>
                )}
              </div>

              <div className="max-w-2xl">
                <EventDescriptionExpandable description={event.description} maxLines={8} />
              </div>

              {/* Countdown */}
              <div className="pt-2">
                <SimpleCountdown targetDateStr={event.date} />
              </div>

              {/* Registration CTA - Design Responsive Mobile & Desktop */}
              <div className="pt-4 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                {hasRegistration && (
                  <Button
                    type="button"
                    onClick={() => setIsRegistrationOpen(true)}
                    className="w-full sm:w-auto flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold px-4 sm:px-6 py-3.5 sm:py-2.5 h-auto min-h-[48px] rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] text-xs sm:text-sm tracking-wide text-center"
                  >
                    <Ticket className="w-4 h-4 shrink-0 text-slate-950" />
                    <span className="leading-tight">Réserver ma place &amp; Obtenir mon Badge</span>
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleShare}
                  className="w-full sm:w-auto border-border/80 bg-card/60 hover:bg-card text-foreground hover:text-amber-400 text-xs h-11 sm:h-12 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Partager</span>
                </Button>
              </div>
            </div>

            {/* Right Column: Event Image */}
            {event.image_url && (
              <div className="lg:col-span-5">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Tabs (Generated strictly according to featuresConfig) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-8 overflow-x-auto">
          <button
            onClick={() => handleTabChange('hub')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'hub'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Vue d'ensemble
          </button>

          {hasPitches && (
            <button
              onClick={() => handleTabChange('pitches')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'pitches'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4" /> Pitchs Entreprises
            </button>
          )}

          {hasMeetings && (
            <button
              onClick={() => handleTabChange('meetings')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'meetings'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4" /> Rendez-vous B2B
            </button>
          )}

          {hasTombola && (
            <button
              onClick={() => handleTabChange('tombola')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'tombola'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Gift className="w-4 h-4" /> Tombola Officielle
            </button>
          )}

          {hasNetworking && (
            <button
              onClick={() => handleTabChange('networking')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'networking'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Networking Wall
            </button>
          )}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'hub' && (
          <div className="space-y-12">
            {hasPitches && <EventPitchesSection eventId={eventId} />}
            {hasMeetings && <EventPartnersMeetingsSection eventId={eventId} />}
            {hasTombola && <EventTombolaAnimation eventId={eventId} />}
            {hasNetworking && <EventNetworkingWall eventId={eventId} />}
          </div>
        )}

        {activeTab === 'pitches' && hasPitches && (
          <EventPitchesSection eventId={eventId} />
        )}

        {activeTab === 'meetings' && hasMeetings && (
          <EventPartnersMeetingsSection eventId={eventId} />
        )}

        {activeTab === 'tombola' && hasTombola && (
          <EventTombolaAnimation eventId={eventId} />
        )}

        {activeTab === 'networking' && hasNetworking && (
          <EventNetworkingWall eventId={eventId} />
        )}
      </div>

      {/* Registration Modal */}
      {isRegistrationOpen && (
        <PublicEventRegistrationModal
          eventId={eventId}
          isOpen={true}
          onClose={() => setIsRegistrationOpen(false)}
        />
      )}
    </div>
  );
}

