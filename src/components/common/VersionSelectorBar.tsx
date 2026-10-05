import React from 'react';
import { Sparkles, History, Check, Loader2, RefreshCw } from 'lucide-react';

export interface VersionItem<T = any> {
  id: string;
  versionNumber: number;
  label?: string;
  timestamp: string;
  data: T;
}

interface VersionSelectorBarProps<T = any> {
  versions: VersionItem<T>[];
  activeVersionIndex: number;
  onSelectVersion: (index: number) => void;
  onGenerateNewVersion: () => void;
  isGeneratingNewVersion?: boolean;
  className?: string;
  toolLabel?: string;
}

export function VersionSelectorBar<T = any>({
  versions,
  activeVersionIndex,
  onSelectVersion,
  onGenerateNewVersion,
  isGeneratingNewVersion = false,
  className = '',
  toolLabel = 'Proposition',
}: VersionSelectorBarProps<T>) {
  if (!versions || versions.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md ${className}`}>
      {/* Versions Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mr-2 uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-blue-400" />
          Versions :
        </div>

        {versions.map((ver, idx) => {
          const isActive = idx === activeVersionIndex;
          return (
            <button
              key={ver.id || idx}
              type="button"
              onClick={() => onSelectVersion(idx)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {isActive && <Check className="w-3 h-3 text-emerald-300 stroke-[3]" />}
              <span>{ver.label || `Version ${ver.versionNumber || (idx + 1)}`}</span>
              <span className="text-[10px] opacity-70 font-normal ml-0.5">
                {ver.timestamp || ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Button to request an alternative version */}
      <button
        type="button"
        onClick={onGenerateNewVersion}
        disabled={isGeneratingNewVersion}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        {isGeneratingNewVersion ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Génération d'une nouvelle version...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Proposer une autre version</span>
          </>
        )}
      </button>
    </div>
  );
}
