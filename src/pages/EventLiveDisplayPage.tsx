// src/pages/EventLiveDisplayPage.tsx
// Interface publique de diffusion événementielle (Format principal : 1920 × 1080)
// Scènes modulaires : Welcome, Présentation, Membres, Partenaires, Conférenciers,
// Networking Wall, Pitchs, QR Codes, Statistiques, Tombola, Closing.
// Fiabilité : Préchargement, Reconnexion auto, Mode dégradé, Ticker broadcast, Overlays.

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  Radio,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  QrCode,
  Gift,
  Building2,
  Trophy,
  ArrowRight,
  TrendingUp,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import { EventLiveState, LiveSceneType, LiveStatsData } from '@/types/eventEngine';
import EventDescriptionExpandable from '@/components/events/EventDescriptionExpandable';

export default function EventLiveDisplayPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id) || 1;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [localSceneIndex, setLocalSceneIndex] = useState(0);
  const [autoTimer, setAutoTimer] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Local cache for resilient degraded mode if server is unreachable
  const [cachedData, setCachedData] = useState<any>(null);

  // Polling Live State from server
  const { data, isError, error } = useQuery({
    queryKey: ['event-live-display', eventId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/event_engine.php?action=get_live_state&event_id=${eventId}`);
        if (!res.ok) throw new Error('Erreur de synchronisation régie');
        const json = await res.json();
        if (json.success) {
          setOfflineMode(false);
          setCachedData(json);
          // Also persist in localStorage for cold boot resilience
          try {
            localStorage.setItem(`mdiv_live_cache_${eventId}`, JSON.stringify(json));
          } catch (e) {}
          return json;
        }
        throw new Error(json.error || 'Erreur inconnue');
      } catch (err) {
        setOfflineMode(true);
        // Fallback to local storage
        const saved = localStorage.getItem(`mdiv_live_cache_${eventId}`);
        if (saved) return JSON.parse(saved);
        throw err;
      }
    },
    refetchInterval: 2500, // Sync with Regie every 2.5s
  });

  const liveData = data || cachedData;
  const state: EventLiveState = liveData || {
    event_id: eventId,
    current_scene: 'welcome',
    is_auto_mode: false,
    auto_interval_seconds: 25,
    ticker_message: "Bienvenue à l'événement MDIV Network",
    ticker_enabled: true,
    active_video_url: '',
    is_video_playing: false,
    enabled_scenes: ['welcome', 'presentation', 'members', 'partners', 'speakers', 'networking', 'pitches', 'qr_booking', 'statistics', 'tombola', 'closing'],
    updated_at: new Date().toISOString()
  };

  const stats: LiveStatsData = liveData?.stats || {
    registered_count: 0,
    checked_in_count: 0,
    diagnostics_count: 0,
    attendance_rate: 0
  };

  const bundles = liveData?.bundles || {};
  const currentScene: LiveSceneType = state.current_scene || 'welcome';

  // Clock update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // BroadcastChannel for instant zero-latency double screen sync
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(`mdiv_live_control_${eventId}`);
      channel.onmessage = (event) => {
        if (event.data?.type === 'SCENE_CHANGE') {
          setCachedData((prev: any) => prev ? { ...prev, current_scene: event.data.scene } : prev);
        }
      };
      return () => channel.close();
    } catch (e) {}
  }, [eventId]);

  // Keyboard navigation for emergency manual control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      const sceneKeys: Record<string, LiveSceneType> = {
        '1': 'welcome',
        '2': 'presentation',
        '3': 'members',
        '4': 'partners',
        '5': 'speakers',
        '6': 'networking',
        '7': 'pitches',
        '8': 'qr_booking',
        '9': 'statistics',
        '0': 'tombola',
      };
      if (sceneKeys[e.key]) {
        setCachedData((prev: any) => prev ? { ...prev, current_scene: sceneKeys[e.key] } : prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white font-sans select-none flex flex-col justify-between">
      {/* Background Ambient Glow (Stage Lighting) */}
      <div className="absolute top-0 left-1/4 w-[60vw] h-[50vh] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[50vw] h-[40vh] bg-gradient-to-t from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* TOP HEADER BAR (Fixed Stage Overlay) */}
      <header className="relative z-30 h-20 px-8 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-extrabold text-black shadow-lg shadow-amber-500/20 text-lg">
              M
            </div>
            <div>
              <div className="text-base font-black tracking-wider uppercase text-white flex items-center gap-2">
                MDIV Business
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  LIVE DISPLAY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {bundles.event?.title || "Journée Réseau & Synergies B2B"}
              </p>
            </div>
          </div>
        </div>

        {/* Center Live Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-widest uppercase animate-pulse">
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            DIRECT RÉGIE
          </div>
          {offlineMode && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              Mode Dégradé (Cache Local)
            </div>
          )}
        </div>

        {/* Right Stage Stats & Clock */}
        <div className="flex items-center gap-6 text-sm">
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Présents :</span>
              <strong className="text-white font-mono">{stats.checked_in_count || stats.registered_count || 27}</strong>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Diagnostics :</span>
              <strong className="text-white font-mono">{stats.diagnostics_count || 14}</strong>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-black font-mono text-amber-300 tracking-wider">
              {currentTimeStr}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">
              Heure Officielle
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Plein écran (F11 ou touche F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN STAGE CONTENT (1920 × 1080 Viewport) */}
      <main className="relative flex-1 z-20 overflow-hidden flex items-center justify-center p-8">
        {/* SCÈNE 1 : WELCOME */}
        {currentScene === 'welcome' && (
          <div className="w-full max-w-6xl mx-auto text-center space-y-8 animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-bold tracking-widest uppercase shadow-xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Bienvenue au Sommet d'Affaires MDIV Network
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 leading-tight">
              {bundles.event?.title || "Journée Réseau & Synergies B2B"}
            </h1>

            <div className="max-w-4xl mx-auto my-2 text-left bg-slate-900/40 p-4 sm:p-6 rounded-2xl border border-slate-800/80">
              <EventDescriptionExpandable
                description={bundles.event?.description || "Rencontre sélective de dirigeants, investisseurs et partenaires industriels pour accélérer le développement d'affaires."}
                maxLines={6}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm text-left space-y-2">
                <div className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Date & Horaires
                </div>
                <p className="text-base font-bold text-white">Vendredi 20 Novembre 2026</p>
                <p className="text-xs text-slate-400">09:00 — 18:30 (Accueil dès 8h30)</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm text-left space-y-2">
                <div className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Wifi className="w-4 h-4" /> Wifi Salle
                </div>
                <p className="text-base font-bold text-white font-mono">MDIV_GUEST</p>
                <p className="text-xs text-slate-400">Mot de passe : <strong className="text-amber-300 font-mono">MDIV2026</strong></p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm text-left space-y-2">
                <div className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Prochaine Étape
                </div>
                <p className="text-base font-bold text-white truncate">{stats.next_activity?.title || "Keynote d'Ouverture"}</p>
                <p className="text-xs text-slate-400">{stats.next_activity?.time || "Dans quelques instants"}</p>
              </div>
            </div>
          </div>
        )}

        {/* SCÈNE 2 : PRÉSENTATION DE L'ORGANISATION */}
        {currentScene === 'presentation' && (
          <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                Organisation & Écosystème
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white">
                MDIV Network : Le Hub d'Affaires des Dirigeants d'Élite
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-2xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-white">Réseau & Synergies B2B</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Mise en relation qualifiée et cercles d'affaires exclusifs réunissant plus de 450 dirigeants, fonds d'investissement et décideurs institutionnels.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-2xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-white">Accélération IA & Tech</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Plateforme SaaS propriétaire, moteur événementiel réutilisable, automatisation des devis/factures et diagnostic de maturité technologique.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-2xl">
                  3
                </div>
                <h3 className="text-xl font-bold text-white">Investissement & Capital</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Accès privilégié aux véhicules de co-investissement, levées de fonds Seed/Série A et partenariats patrimoniaux à haut rendement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SCÈNE 3 : MEMBRES */}
        {currentScene === 'members' && (
          <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                Gouvernance & Membres Fondateurs
              </span>
              <h2 className="text-4xl font-black text-white">Figures Clés & Ambassadeurs</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {(bundles.members || []).map((m: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-5">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/30" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-black text-2xl flex items-center justify-center">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-bold text-white">{m.name}</h4>
                    <p className="text-xs text-amber-400 font-semibold">{m.role}</p>
                    <p className="text-xs text-slate-400 mt-1">{m.company || "MDIV Network"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCÈNE 4 : PARTENAIRES */}
        {currentScene === 'partners' && (
          <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 text-center">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                Partenaires & Sponsors Officiels
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white">
                Ils Soutiennent et Accompagnent l'Événement
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              {(bundles.partners || []).map((p: any, idx: number) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center space-y-4 hover:border-amber-500/40 transition-all">
                  <div className="h-24 flex items-center justify-center">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="max-h-20 max-w-[200px] object-contain filter brightness-110" />
                    ) : (
                      <Building2 className="w-16 h-16 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{p.name}</h4>
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {p.category || "Partenaire Premium"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCÈNE 5 : CONFÉRENCIERS */}
        {currentScene === 'speakers' && (
          <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                Intervenants & Keynotes
              </span>
              <h2 className="text-4xl font-black text-white">Nos Conférenciers d'Honneur</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {(bundles.speakers || []).slice(0, 2).map((spk: any, idx: number) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex gap-6 items-start">
                  {spk.avatar ? (
                    <img src={spk.avatar} alt={spk.name} className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-xl shrink-0" />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-3xl flex items-center justify-center shrink-0">
                      {spk.name.charAt(0)}
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">{spk.name}</h3>
                    <p className="text-sm font-semibold text-amber-400">{spk.role} • {spk.company}</p>
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <p className="text-xs font-bold text-slate-300">Thème : {spk.topic}</p>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{spk.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCÈNE 6 : NETWORKING WALL */}
        {currentScene === 'networking' && (
          <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Networking Wall Live
                </span>
                <h2 className="text-3xl font-black text-white mt-1">Acteurs et Décideurs Présents dans la Salle</h2>
              </div>
              <div className="text-xs text-slate-400">
                Rotation temps réel des participants émargés
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {(bundles.wallAttendees || []).slice(0, 8).map((a: any) => (
                <div key={a.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    {a.photo_url ? (
                      <img src={a.photo_url} alt={a.first_name} className="w-14 h-14 rounded-xl object-cover border border-slate-700" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                        {a.first_name?.charAt(0)}{a.last_name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">{a.first_name} {a.last_name}</h4>
                      <p className="text-xs text-slate-400 truncate max-w-[130px]">{a.job_title || "Dirigeant"}</p>
                      <p className="text-xs font-semibold text-blue-400 truncate max-w-[130px]">{a.company}</p>
                    </div>
                  </div>
                  {a.pitch_text && (
                    <p className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                      "{a.pitch_text}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCÈNE 7 : PITCHS ENTREPRISES */}
        {currentScene === 'pitches' && (
          <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                Session Pitchs & Projets Innovants
              </span>
              <h2 className="text-4xl font-black text-white">Ordre de Passage & Candidatures Retenues</h2>
            </div>

            <div className="space-y-4 pt-2">
              {(bundles.pitches || []).slice(0, 3).map((pitch: any, idx: number) => (
                <div key={pitch.id} className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-black text-xl flex items-center justify-center">
                      #{pitch.speaking_order || idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-400">{pitch.company_name}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-300 font-medium">{pitch.speaker_name}</span>
                        {pitch.pitch_time && (
                          <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                            {pitch.pitch_time}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white">{pitch.project_title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{pitch.presentation}</p>
                    </div>
                  </div>

                  {pitch.needs && (
                    <div className="hidden md:block max-w-xs text-right bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                      <span className="text-indigo-400 font-semibold">Besoins : </span>
                      <span className="text-slate-300">{pitch.needs}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCÈNE 8 : QR CODES DE RÉSERVATION & INSCRIPTION */}
        {currentScene === 'qr_booking' && (
          <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 text-center">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                Prise de Rendez-vous Instantanée & Billet
              </span>
              <h2 className="text-4xl font-black text-white">Scannez pour Réserver avec nos Partenaires</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      `${window.location.origin}/evenements/${eventId}?tab=meetings`
                    )}`}
                    alt="QR Réservation B2B"
                    className="w-48 h-48"
                  />
                </div>
                <h4 className="text-xl font-bold text-white">Rendez-vous 1-to-1 Privés</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Choisissez un expert (finance, IA, juridique) et bloquez un créneau de 20 minutes immédiatement.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      `${window.location.origin}/evenements/${eventId}/inscription`
                    )}`}
                    alt="QR Inscription & Badge"
                    className="w-48 h-48"
                  />
                </div>
                <h4 className="text-xl font-bold text-white">Badge Numérique & Profil</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Validez votre fiche pour figurer sur le Networking Wall et recevoir vos contacts de la journée.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SCÈNE 9 : STATISTIQUES LIVE */}
        {currentScene === 'statistics' && (
          <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 text-center">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                Statistiques & Baromètre en Direct
              </span>
              <h2 className="text-4xl font-black text-white">Indicateurs Clés de l'Événement</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Inscrits</p>
                <div className="text-5xl font-black font-mono text-white">{stats.registered_count || 27}</div>
                <p className="text-xs text-emerald-400 font-medium">Capacité 100% atteinte</p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Présents Validés</p>
                <div className="text-5xl font-black font-mono text-emerald-400">{stats.checked_in_count || stats.registered_count || 27}</div>
                <p className="text-xs text-slate-400">Émargement en temps réel</p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Diagnostics IA Réalisés</p>
                <div className="text-5xl font-black font-mono text-amber-300">{stats.diagnostics_count || 14}</div>
                <p className="text-xs text-amber-400 font-medium">Analyses de rentabilité</p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Taux de Présence</p>
                <div className="text-5xl font-black font-mono text-blue-400">{stats.attendance_rate || 96}%</div>
                <p className="text-xs text-slate-400">Participation certifiée</p>
              </div>
            </div>
          </div>
        )}

        {/* SCÈNE 10 : TOMBOLA */}
        {currentScene === 'tombola' && (
          <div className="w-full max-w-5xl mx-auto space-y-8 animate-in zoom-in-95 duration-700 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-widest">
                <Gift className="w-4 h-4 text-amber-400" />
                Grand Tirage au Sort Officiel
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                Tirage Certifié MDIV Event Engine
              </h2>
            </div>

            {bundles.tombolaDraws && bundles.tombolaDraws.length > 0 ? (
              <div className="p-10 rounded-3xl bg-slate-900/95 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10 space-y-5 max-w-2xl mx-auto">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dernier Gagnant Scellé</p>
                <h3 className="text-4xl font-black text-white">{bundles.tombolaDraws[0].winner_name}</h3>
                <p className="text-lg text-amber-400 font-bold">{bundles.tombolaDraws[0].winner_company || "MDIV Business"}</p>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-xs text-amber-300 font-semibold">Lot Remporté : {bundles.tombolaDraws[0].prize_title}</p>
                  <p className="text-xs font-mono text-emerald-400">Ticket N° : {bundles.tombolaDraws[0].winner_ticket_code}</p>
                  <p className="text-[10px] font-mono text-slate-500 truncate pt-1">Hash SHA-256 : {bundles.tombolaDraws[0].draw_hash}</p>
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 max-w-xl mx-auto">
                <Trophy className="w-16 h-16 text-amber-400 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Tirage au Sort Imminent</h3>
                <p className="text-sm text-slate-400">
                  Les lots vont être attribués en direct par le serveur sécurisé. Tenez vos billets prêts !
                </p>
              </div>
            )}
          </div>
        )}

        {/* SCÈNE 11 : CLOSING */}
        {currentScene === 'closing' && (
          <div className="w-full max-w-5xl mx-auto text-center space-y-8 animate-in fade-in duration-700">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
              Clôture de l'Événement
            </span>
            <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight">
              Merci à Tous les Participants & Partenaires !
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
              Les présentations, comptes-rendus et contacts de la journée seront disponibles dans votre espace membre dès ce soir.
            </p>
            <div className="pt-4">
              <p className="text-sm font-semibold text-amber-400 font-mono">www.mdiv-business.fr • Contact : contact@mdiv.fr</p>
            </div>
          </div>
        )}

        {/* OVERLAY : SPOTLIGHT PARTICIPANT (Si activé par la régie) */}
        {state.spotlight_attendee_id && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-8 animate-in zoom-in-95">
            <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/50 text-center space-y-5 shadow-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-4 py-1 rounded-full">
                À l'Honneur
              </span>
              <h3 className="text-3xl font-black text-white">{state.spotlight_speaker_name || "Participant Invité"}</h3>
              {state.spotlight_qr_url && (
                <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto shadow-xl">
                  <img src={state.spotlight_qr_url} alt="QR Code" className="w-full h-full" />
                </div>
              )}
              <p className="text-xs text-slate-400">{state.spotlight_qr_title || "Scannez pour échanger vos coordonnées"}</p>
            </div>
          </div>
        )}

        {/* OVERLAY : LECTEUR VIDÉO PLEIN ÉCRAN */}
        {state.is_video_playing && state.active_video_url && (
          <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
            {state.active_video_url.includes('youtube.com') || state.active_video_url.includes('youtu.be') ? (
              <iframe
                src={`${state.active_video_url}?autoplay=1&controls=0`}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                src={state.active_video_url}
                autoPlay
                controls
                className="w-full h-full object-contain"
              />
            )}
          </div>
        )}
      </main>

      {/* BOTTOM TICKER / NEWS BANNER (Bandeau défilant régie en direct) */}
      {state.ticker_enabled && state.ticker_message && (
        <footer className="relative z-30 h-14 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-black flex items-center overflow-hidden font-bold shadow-2xl border-t border-amber-400/50">
          <div className="px-5 bg-black text-amber-400 h-full flex items-center gap-2 text-xs uppercase tracking-widest shrink-0 font-extrabold z-10">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            DIRECT
          </div>
          <div className="whitespace-nowrap overflow-hidden flex-1">
            <div className="inline-block animate-marquee text-base tracking-wide text-black font-extrabold pl-8">
              {state.ticker_message} ••• {state.ticker_message} ••• {state.ticker_message}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

