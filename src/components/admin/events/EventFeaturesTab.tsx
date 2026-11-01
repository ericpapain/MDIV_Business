// src/components/admin/events/EventFeaturesTab.tsx
// Onglet « Fonctionnalités de l'événement » (Catalogue modulaire & Dépendances)

import { useState } from 'react';
import { 
  EVENT_FEATURE_CATALOG, 
  FEATURE_CATEGORIES, 
  validateFeatureDependencies,
  getFeaturesByCategory 
} from '@/lib/eventFeatureCatalog';
import { EventFeaturesMap, EventFeatureDefinition } from '@/types/eventEngine';
import { 
  Ticket, ListPlus, Users, Megaphone, CalendarClock, CalendarDays, 
  Handshake, Trophy, Sparkles, QrCode, MonitorPlay, UserCheck,
  CheckCircle2, AlertTriangle, Settings2, Info, ShieldCheck, X
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ICON_MAP: Record<string, any> = {
  Ticket,
  ListPlus,
  Users,
  Megaphone,
  CalendarClock,
  CalendarDays,
  Handshake,
  Trophy,
  Sparkles,
  QrCode,
  MonitorPlay,
  UserCheck,
};

interface EventFeaturesTabProps {
  featuresConfig?: EventFeaturesMap;
  config?: EventFeaturesMap;
  eventId?: number;
  onChange: (updated: EventFeaturesMap) => void;
  onOpenSettings?: (featureId: string) => void;
}

export function EventFeaturesTab({ featuresConfig, config, onChange }: EventFeaturesTabProps) {
  const [selectedFeature, setSelectedFeature] = useState<EventFeatureDefinition | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const activeConfig: EventFeaturesMap = (featuresConfig || config) ? { ...(featuresConfig || config) } : {};

  // Liste des identifiants actuellement activés
  const activeFeatureIds = Object.keys(activeConfig).filter(id => activeConfig[id]?.enabled);

  // Validation des dépendances
  const { valid, errors } = validateFeatureDependencies(activeFeatureIds);

  const toggleFeature = (feature: EventFeatureDefinition, checked: boolean) => {
    const nextConfig: EventFeaturesMap = { ...activeConfig };

    if (checked) {
      // Vérifier les dépendances avant d'activer
      const missingDeps = feature.dependencies.filter(depId => !nextConfig[depId]?.enabled);
      if (missingDeps.length > 0) {
        // Active automatiquement les dépendances requises
        missingDeps.forEach(depId => {
          const depDef = EVENT_FEATURE_CATALOG.find(f => f.id === depId);
          if (depDef) {
            nextConfig[depId] = {
              enabled: true,
              version: depDef.version,
              settings: depDef.defaultSettings,
              updated_at: new Date().toISOString()
            };
          }
        });
      }

      nextConfig[feature.id] = {
        enabled: true,
        version: feature.version,
        settings: nextConfig[feature.id]?.settings || feature.defaultSettings,
        updated_at: new Date().toISOString()
      };
    } else {
      // Désactivation : désactive également les fonctionnalités qui dépendent de celle-ci
      nextConfig[feature.id] = {
        ...nextConfig[feature.id],
        enabled: false,
        updated_at: new Date().toISOString()
      };

      // Désactiver les sous-dépendances
      EVENT_FEATURE_CATALOG.forEach(f => {
        if (f.dependencies.includes(feature.id) && nextConfig[f.id]?.enabled) {
          nextConfig[f.id] = {
            ...nextConfig[f.id],
            enabled: false,
            updated_at: new Date().toISOString()
          };
        }
      });
    }

    onChange(nextConfig);
  };

  const openSettings = (feature: EventFeatureDefinition) => {
    setSelectedFeature(feature);
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête explicatif */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              MDIV EVENT ENGINE — Bibliothèque de fonctionnalités modulaires
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Sélectionnez ci-dessous les modules à activer pour cet événement. Les dépendances techniques sont gérées automatiquement et synchronisées avec votre CRM sans créer de doublon.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-300 px-3 py-1 bg-amber-500/5">
            {activeFeatureIds.length} active(s) sur {EVENT_FEATURE_CATALOG.length}
          </Badge>
        </div>
      </div>

      {/* Alerte si dépendances manquantes */}
      {!valid && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <div>
            <span className="font-bold">Attention aux dépendances :</span> certaines fonctionnalités nécessitent d'activer leurs prérequis.
          </div>
        </div>
      )}

      {/* Grille par catégorie */}
      <div className="space-y-8">
        {FEATURE_CATEGORIES.map(category => {
          const catFeatures = getFeaturesByCategory(category.id);
          if (catFeatures.length === 0) return null;

          return (
            <div key={category.id} className="space-y-3">
              <div className="border-b border-border/60 pb-2">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  {category.label}
                </h4>
                <p className="text-[11px] text-muted-foreground">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catFeatures.map(feature => {
                  const Icon = ICON_MAP[feature.iconName] || Ticket;
                  const isEnabled = !!activeConfig[feature.id]?.enabled;
                  const isAvailable = feature.status === 'available';
                  const hasMissingDep = errors[feature.id]?.length > 0;

                  return (
                    <div
                      key={feature.id}
                      className={`relative rounded-2xl p-4.5 border transition-all flex flex-col justify-between ${
                        isEnabled 
                          ? 'bg-amber-500/[0.04] border-amber-500/40 shadow-sm ring-1 ring-amber-500/20' 
                          : 'bg-card border-border hover:border-border/80'
                      }`}
                    >
                      <div>
                        {/* En-tête de la carte */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-muted text-muted-foreground'
                            }`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-foreground leading-tight">{feature.name}</h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {isAvailable ? (
                                  <span className="text-[9.5px] text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Prêt
                                  </span>
                                ) : (
                                  <span className="text-[9.5px] text-amber-400/90 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> En préparation
                                  </span>
                                )}
                                <span className="text-[9.5px] text-muted-foreground">v{feature.version}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bascule ON / OFF */}
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => toggleFeature(feature, checked)}
                            className="cursor-pointer data-[state=checked]:bg-amber-500"
                          />
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                          {feature.description}
                        </p>

                        {/* Dépendances requises */}
                        {feature.dependencies.length > 0 && (
                          <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-1 mb-2">
                            <span className="text-muted-foreground">Dépend de :</span>
                            {feature.dependencies.map(depId => {
                              const depDef = EVENT_FEATURE_CATALOG.find(f => f.id === depId);
                              const isDepActive = !!activeConfig[depId]?.enabled;
                              return (
                                <span 
                                  key={depId} 
                                  className={`px-1.5 py-0.5 rounded text-[9.5px] font-medium border ${
                                    isDepActive 
                                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                                      : 'bg-red-500/10 text-red-300 border-red-500/20'
                                  }`}
                                >
                                  {depDef?.name || depId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Barre d'action inférieure de la carte */}
                      <div className="pt-2.5 border-t border-border/50 flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {isEnabled ? "Fonctionnalité active" : "Désactivée"}
                        </span>

                        {isEnabled && (
                          <button
                            type="button"
                            onClick={() => openSettings(feature)}
                            className="text-[10.5px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                          >
                            <Settings2 size={13} /> Paramètres
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de réglages rapides de fonctionnalité */}
      {isSettingsModalOpen && selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <Settings2 className="text-amber-400" size={18} />
                <h3 className="font-bold text-sm text-foreground">
                  Paramètres : {selectedFeature.name}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl text-muted-foreground leading-relaxed">
                {selectedFeature.description}
              </div>

              {selectedFeature.id === 'online_registration' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold mb-1">Jauge maximale de participants (places)</label>
                    <input 
                      type="number"
                      defaultValue={activeConfig['online_registration']?.settings?.max_attendees || 100}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const next = { ...activeConfig };
                        next['online_registration'].settings.max_attendees = val;
                        onChange(next);
                      }}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span>Envoi automatique d'email de confirmation</span>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              )}

              {selectedFeature.id === 'digital_badge' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Afficher le QR code sur le badge</span>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Autoriser le téléchargement PDF par le participant</span>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              )}

              {selectedFeature.id === 'networking_wall' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Trombinoscope et recherche par compétences activés</span>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Autoriser le participant à masquer son profil (Opt-out)</span>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl px-4 py-2"
                >
                  Enregistrer les paramètres
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
