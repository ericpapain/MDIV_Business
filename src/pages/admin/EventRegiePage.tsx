// src/pages/admin/EventRegiePage.tsx
// Studio Régie LIVE plein écran (/admin/events/:id/regie)
// Interface de régie professionnelle avec moniteur de retour scène en direct et pupitre de contrôle.

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MonitorPlay, Tv, ExternalLink, Radio, Sliders } from 'lucide-react';
import { EventRegieControlTab } from '@/components/admin/events/EventRegieControlTab';
import { Button } from '@/components/ui/button';

export default function EventRegiePage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id) || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Studio Bar */}
      <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux Événements
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h1 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Studio Régie Événementielle • Événement #{eventId}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/evenements/${eventId}/live`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
          >
            <Tv className="w-3.5 h-3.5" />
            Lancer l'Écran de Scène (1080p)
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Controls Column */}
          <div className="lg:col-span-8 space-y-6">
            <EventRegieControlTab eventId={eventId} />
          </div>

          {/* Right Column: Mini Stage Monitor Preview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <MonitorPlay className="w-4 h-4 text-amber-400" />
                  Retour Scène (Preview 16:9)
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">
                  DIRECT
                </span>
              </div>

              {/* Scaled iframe preview of live display */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-black shadow-inner">
                <iframe
                  src={`/evenements/${eventId}/live`}
                  className="w-[1920px] h-[1080px] border-0 origin-top-left transform scale-[0.19] sm:scale-[0.24] pointer-events-none select-none"
                  title="Retour Scène"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Ce moniteur reflète en temps réel la projection en cours dans la salle de conférence ou sur scène.
              </p>
            </div>

            {/* Quick tips */}
            <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-2 text-xs text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Conseils Régie Double Écran
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Placez l'écran de diffusion sur votre 2ème sortie vidéo (HDMI/Vidéoprojecteur).</li>
                <li>Appuyez sur <strong className="text-amber-300">F</strong> ou <strong className="text-amber-300">F11</strong> sur l'écran pour passer en Full HD 1080p sans bordure.</li>
                <li>Les touches <strong className="text-amber-300">1 à 0</strong> du clavier changent instantanément de scène en secours.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

