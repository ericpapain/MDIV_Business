// src/components/admin/events/EventRegieControlTab.tsx
// Pupitre de contrôle de la régie événementielle (Event Live Regie Control)
// Contrôle temps réel : changement de scène, bandeau ticker, vidéo, spotlight participant, QR code, mode auto.

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MonitorPlay,
  Play,
  Pause,
  Tv,
  Radio,
  ExternalLink,
  MessageSquare,
  QrCode,
  UserCheck,
  Video,
  VideoOff,
  Sparkles,
  Users,
  Trophy,
  Gift,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EventLiveState, LiveSceneType } from '@/types/eventEngine';

interface EventRegieControlTabProps {
  eventId: number;
}

const ALL_SCENES: { id: LiveSceneType; label: string; description: string; icon: any }[] = [
  { id: 'welcome', label: '1. Welcome & Accueil', description: 'Titre, date, compte à rebours et wifi', icon: Sparkles },
  { id: 'presentation', label: '2. Présentation', description: 'Mission MDIV Network et 3 piliers', icon: Layers },
  { id: 'members', label: '3. Membres', description: 'Figures clés et ambassadeurs', icon: Users },
  { id: 'partners', label: '4. Partenaires', description: 'Logos et sponsors officiels', icon: Trophy },
  { id: 'speakers', label: '5. Conférenciers', description: 'Intervenants d’honneur et sujets', icon: UserCheck },
  { id: 'networking', label: '6. Networking Wall', description: 'Galerie dynamique des participants', icon: Users },
  { id: 'pitches', label: '7. Pitchs Entreprises', description: 'Ordre de passage et projets retenus', icon: Radio },
  { id: 'qr_booking', label: '8. QR Codes B2B', description: 'Grands QR codes de réservation stand', icon: QrCode },
  { id: 'statistics', label: '9. Statistiques Live', description: 'Inscrits, présents et baromètre', icon: Clock },
  { id: 'tombola', label: '10. Tombola Officielle', description: 'Tirage au sort certifié et gagnant', icon: Gift },
  { id: 'closing', label: '11. Clôture & Closing', description: 'Remerciements et fin de journée', icon: CheckCircle2 },
];

export function EventRegieControlTab({ eventId }: EventRegieControlTabProps) {
  const queryClient = useQueryClient();

  const [tickerInput, setTickerInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [autoInterval, setAutoInterval] = useState(25);
  const [spotlightQrInput, setSpotlightQrInput] = useState('');

  // Fetch current live state
  const { data: liveState, isLoading } = useQuery<EventLiveState & { bundles?: any; stats?: any }>({
    queryKey: ['admin-live-state', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_live_state&event_id=${eventId}`);
      const json = await res.json();
      return json.data || json;
    },
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (liveState) {
      if (liveState.ticker_message && !tickerInput) setTickerInput(liveState.ticker_message);
      if (liveState.active_video_url && !videoUrlInput) setVideoUrlInput(liveState.active_video_url);
      if (liveState.auto_interval_seconds) setAutoInterval(liveState.auto_interval_seconds);
    }
  }, [liveState]);

  // Mutation to update state
  const updateStateMutation = useMutation({
    mutationFn: async (patch: Partial<EventLiveState>) => {
      const res = await fetch('/api/event_engine.php?action=update_live_state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer compliance-test-token',
        },
        body: JSON.stringify({
          event_id: eventId,
          ...patch,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur mise à jour régie');

      // Also broadcast on local channel for instant multi-window sync
      try {
        const channel = new BroadcastChannel(`mdiv_live_control_${eventId}`);
        if (patch.current_scene) {
          channel.postMessage({ type: 'SCENE_CHANGE', scene: patch.current_scene });
        }
        channel.close();
      } catch (e) {}

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-live-state', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-live-display', eventId] });
      toast.success("Ordre régie transmis à l'écran de scène !");
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur régie');
    },
  });

  const currentScene = liveState?.current_scene || 'welcome';
  const isAutoMode = !!liveState?.is_auto_mode;
  const isVideoPlaying = !!liveState?.is_video_playing;

  const handleSceneSelect = (scene: LiveSceneType) => {
    updateStateMutation.mutate({ current_scene: scene, is_auto_mode: false });
  };

  const handleToggleAutoMode = () => {
    updateStateMutation.mutate({
      is_auto_mode: !isAutoMode,
      auto_interval_seconds: autoInterval,
    });
  };

  const handleUpdateTicker = () => {
    updateStateMutation.mutate({
      ticker_message: tickerInput,
      ticker_enabled: true,
    });
  };

  const handleToggleTicker = () => {
    updateStateMutation.mutate({
      ticker_enabled: !liveState?.ticker_enabled,
    });
  };

  const handleToggleVideo = () => {
    updateStateMutation.mutate({
      active_video_url: videoUrlInput,
      is_video_playing: !isVideoPlaying,
    });
  };

  const handleTriggerSpotlight = (name: string, qrUrl?: string) => {
    updateStateMutation.mutate({
      spotlight_speaker_name: name,
      spotlight_attendee_id: Date.now(),
      spotlight_qr_url: qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/evenements/' + eventId)}`,
      spotlight_qr_title: `Fiche de ${name}`,
    });
  };

  const handleClearSpotlight = () => {
    updateStateMutation.mutate({
      spotlight_attendee_id: null,
      spotlight_speaker_name: null,
      spotlight_qr_url: null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-lg">Pupitre de Contrôle Régie LIVE</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                À l'Antenne : {currentScene.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilotez l'écran de projection en salle (1920×1080) en temps réel avec synchronisation instantanée.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Button to open live stage display in new window for 2nd monitor */}
          <a
            href={`/evenements/${eventId}/live`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5" />
            Ouvrir l'Écran de Scène (1080p)
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={`/admin/events/${eventId}/regie`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Studio Régie Plein Écran
          </a>
        </div>
      </div>

      {/* Mode Switcher : Manual vs Auto Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase">Mode de Défilement</span>
            <Button
              size="sm"
              onClick={handleToggleAutoMode}
              className={`text-xs h-7 px-3 gap-1.5 ${
                isAutoMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isAutoMode ? (
                <>
                  <Pause className="w-3 h-3" /> Auto Actif ({autoInterval}s)
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> Passer en Mode Auto
                </>
              )}
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">
            {isAutoMode
              ? 'Le carrousel avance automatiquement d\'une scène à l\'autre.'
              : 'Mode manuel : vous choisissez exactement quelle scène afficher.'}
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase">Durée par scène (secondes)</span>
          <div className="flex items-center gap-2">
            {[15, 25, 40, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setAutoInterval(sec);
                  if (isAutoMode) updateStateMutation.mutate({ auto_interval_seconds: sec });
                }}
                className={`flex-1 py-1 text-xs rounded font-mono font-bold transition-all ${
                  autoInterval === sec
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase">Mise à l'Honneur (Spotlight)</span>
            {liveState?.spotlight_attendee_id && (
              <button
                onClick={handleClearSpotlight}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Retirer l'overlay
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {liveState?.spotlight_attendee_id
              ? `Actif : ${liveState.spotlight_speaker_name}`
              : 'Aucun intervenant mis en avant actuellement.'}
          </p>
        </div>
      </div>

      {/* SCENE SELECTOR GRID (Visual 1-Click Buttons) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-400" />
          Sélection Rapide des Scènes (Cliquez pour envoyer à l'antenne)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_SCENES.map((scene) => {
            const Icon = scene.icon;
            const isLive = currentScene === scene.id;

            return (
              <button
                key={scene.id}
                onClick={() => handleSceneSelect(scene.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer ${
                  isLive
                    ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                {isLive && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isLive ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-bold truncate ${
                      isLive ? 'text-amber-300' : 'text-slate-200'
                    }`}
                  >
                    {scene.label}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 line-clamp-1">{scene.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* TICKER CONTROLS & LIVE OVERLAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        {/* Ticker / Bandeau d'annonce défilant */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Bandeau Défilant (Ticker Live en bas d'écran)
            </h4>
            <button
              onClick={handleToggleTicker}
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                liveState?.ticker_enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {liveState?.ticker_enabled ? 'Activé' : 'Masqué'}
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              rows={2}
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              placeholder="Saisissez un message à diffuser en direct sur l'écran..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none font-medium"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] text-slate-400">
                <span>Suggestions :</span>
                <button
                  type="button"
                  onClick={() => setTickerInput("Rendez-vous dans 15 minutes en salle plénière pour la keynote d'ouverture")}
                  className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hover:text-white truncate max-w-[180px]"
                >
                  Keynote 15 min
                </button>
                <button
                  type="button"
                  onClick={() => setTickerInput("Le cocktail networking est ouvert dans le salon Champagne")}
                  className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hover:text-white truncate max-w-[180px]"
                >
                  Cocktail ouvert
                </button>
              </div>

              <Button
                size="sm"
                onClick={handleUpdateTicker}
                disabled={updateStateMutation.isPending}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-7 px-3 shrink-0"
              >
                Diffuser le bandeau
              </Button>
            </div>
          </div>
        </div>

        {/* Lecteur Vidéo Plein Écran */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              Lancement Vidéo / Teaser en Direct
            </h4>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                isVideoPlaying
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isVideoPlaying ? 'Lecture En Cours' : 'En Pause'}
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              placeholder="URL MP4 ou YouTube (ex: https://mdiv.fr/video/teaser.mp4)..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              {isVideoPlaying ? (
                <Button
                  size="sm"
                  onClick={handleToggleVideo}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-7 px-3 gap-1.5"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  Arrêter la Vidéo
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleToggleVideo}
                  disabled={!videoUrlInput}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 px-3 gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Lancer la Vidéo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SPOTLIGHT ACTIONS */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Actions Rapides : Mettre à l'Honneur & Diffuser un QR Code
        </h4>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTriggerSpotlight("Eric Mezatis", "/eric.png")}
            className="border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            Spotlight : Eric Mezatis (CEO)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTriggerSpotlight("Alexandre De Montmirail")}
            className="border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            Spotlight : Alexandre De Montmirail
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTriggerSpotlight("Réservation B2B Partenaires")}
            className="border-slate-800 text-xs text-emerald-400 hover:text-emerald-300"
          >
            Afficher QR B2B Géant
          </Button>

          {liveState?.spotlight_attendee_id && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClearSpotlight}
              className="text-xs ml-auto"
            >
              Fermer l'overlay
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

