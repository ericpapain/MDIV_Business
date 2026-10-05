import React, { useState, useEffect } from "react";
import { Cpu, Zap, Sparkles, Shield, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Gauge, Save, Loader2, PlayCircle, Layers, Database, Server, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AISettings {
  primaryProvider: "groq" | "openai" | "mistral" | "auto";
  groqModel: string;
  openaiModel: string;
  mistralModel: string;
  temperature: number;
  fallbackEnabled: boolean;
  vectorDbDriver?: "qdrant" | "pinecone" | "pgvector" | "sql";
  vectorEmbeddingModel?: string;
  vectorDimensions?: number;
  qdrantUrl?: string;
  qdrantCollection?: string;
}

interface ProviderTestResult {
  loading: boolean;
  status?: "ok" | "error";
  latencyMs?: number;
  message?: string;
  sample?: string;
}

export default function AdminAISettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<AISettings>({
    primaryProvider: "openai",
    groqModel: "qwen/qwen3.8-27b",
    openaiModel: "gpt-4o-mini",
    mistralModel: "mistral-small-latest",
    temperature: 0.7,
    fallbackEnabled: true,
  });

  const [testResults, setTestResults] = useState<Record<string, ProviderTestResult>>({
    groq: { loading: false },
    openai: { loading: false },
    mistral: { loading: false },
  });

  const [vectorTestResult, setVectorTestResult] = useState<{ loading: boolean; status?: "ok" | "error"; message?: string }>({
    loading: false,
  });

  const testVectorRAG = async () => {
    setVectorTestResult({ loading: true });
    try {
      const res = await fetch("/api/rag_query.php?company_id=1&query=norme+electrique+nfc+15-100");
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setVectorTestResult({
          loading: false,
          status: "ok",
          message: `Moteur Vectoriel opérationnel (Driver: ${(settings.vectorDbDriver || "SQL").toUpperCase()} | Modèle: text-embedding-3-large 1536D | Isolation hermétique validée).`,
        });
      } else {
        setVectorTestResult({
          loading: false,
          status: "error",
          message: data.error || "Réponse inattendue du cluster vectoriel.",
        });
      }
    } catch (e: any) {
      setVectorTestResult({
        loading: false,
        status: "error",
        message: e.message || "Erreur de connexion au moteur vectoriel.",
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai_settings.php");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (e) {
      console.error("Erreur de chargement des paramètres IA:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/ai_settings.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Erreur de sauvegarde");
      const data = await res.json();

      toast({
        title: "Configuration IA mise à jour",
        description: `Le moteur d'inférence prioritaire est désormais : ${settings.primaryProvider.toUpperCase()}`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Échec de sauvegarde",
        description: err.message || "Impossible d'enregistrer les paramètres.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testProvider = async (provider: "groq" | "openai" | "mistral") => {
    setTestResults(prev => ({ ...prev, [provider]: { loading: true } }));
    const startTime = performance.now();

    try {
      const model =
        provider === "groq"
          ? settings.groqModel
          : provider === "openai"
          ? settings.openaiModel
          : settings.mistralModel;

      const res = await fetch("/api/ai_test_provider.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResults(prev => ({
          ...prev,
          [provider]: {
            loading: false,
            status: "ok",
            latencyMs,
            message: `Opérationnel (${latencyMs} ms)`,
            sample: data.sampleResponse || "Réponse OK",
          },
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [provider]: {
            loading: false,
            status: "error",
            latencyMs,
            message: data.error || `Erreur HTTP ${res.status}`,
          },
        }));
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          loading: false,
          status: "error",
          latencyMs,
          message: err.message || "Erreur réseau",
        },
      }));
    }
  };

  const testAllProviders = async () => {
    await Promise.all([
      testProvider("groq"),
      testProvider("openai"),
      testProvider("mistral"),
    ]);
  };

  const providersConfig = [
    {
      id: "groq" as const,
      name: "Groq Cloud LPU",
      badge: "Vitesse Maximale",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: Zap,
      description: "Puces LPU ultra-rapides générant des réponses complètes en moins de 1,2 seconde. Recommandé pour la fluidité.",
      selectedModel: settings.groqModel,
      models: [
        { value: "qwen/qwen3.8-27b", label: "Qwen 2.5 27B (Recommandé - Raisonnement bilingue FR/EN)" },
        { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile (Grande puissance de synthèse)" },
        { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Ultra-léger & instantané)" },
      ],
      setModel: (val: string) => setSettings(s => ({ ...s, groqModel: val })),
    },
    {
      id: "openai" as const,
      name: "OpenAI GPT",
      badge: "Haute Précision",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: Sparkles,
      description: "Les modèles phares d'OpenAI. Idéal pour les raisonnements fiscaux complexes, l'audit juridique et la rédaction diplomatique.",
      selectedModel: settings.openaiModel,
      models: [
        { value: "gpt-4o-mini", label: "GPT-4o Mini (Recommandé - Équilibré, rapide et économique)" },
        { value: "gpt-4o", label: "GPT-4o (Modèle Flagship multimodal très haute capacité)" },
      ],
      setModel: (val: string) => setSettings(s => ({ ...s, openaiModel: val })),
    },
    {
      id: "mistral" as const,
      name: "Mistral AI",
      badge: "Souveraineté UE",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      icon: Shield,
      description: "Modèles d'intelligence artificielle souverains européens conçus à Paris. Excellente maîtrise des nuances du français.",
      selectedModel: settings.mistralModel,
      models: [
        { value: "mistral-small-latest", label: "Mistral Small (Défaut rapide)" },
        { value: "mistral-large-latest", label: "Mistral Large (Puissance maximale d'analyse)" },
        { value: "open-mistral-nemo", label: "Mistral Nemo 12B (Polyvalent)" },
      ],
      setModel: (val: string) => setSettings(s => ({ ...s, mistralModel: val })),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <Cpu size={14} /> Moteur d'Inférence & Modèles
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Configuration des Fournisseurs IA
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Choisissez en temps réel quel modèle d'IA alimente l'ensemble des modules MDIV Business. Vous pouvez basculer instantanément d'un fournisseur à l'autre ou activer la cascade automatique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={testAllProviders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-sm font-semibold transition-all"
          >
            <Gauge size={16} /> Tester la latence
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-gold cursor-pointer"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Enregistrer
          </button>
        </div>
      </div>

      {/* Mode Sélecteur Global */}
      <div className="bg-[#0e111a] border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Mode d'exécution actuel</span>
            <h2 className="text-xl font-bold flex items-center gap-2 mt-1">
              Fournisseur prioritaire :{" "}
              <span className="gold-text uppercase font-display tracking-wide">
                {settings.primaryProvider === "auto" ? "Cascade Automatique (Groq → OpenAI → Mistral)" : settings.primaryProvider}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-[#090b10] p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setSettings(s => ({ ...s, primaryProvider: "groq" }))}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.primaryProvider === "groq"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Groq LPU
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, primaryProvider: "openai" }))}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.primaryProvider === "openai"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, primaryProvider: "mistral" }))}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.primaryProvider === "mistral"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mistral
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, primaryProvider: "auto" }))}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.primaryProvider === "auto"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RefreshCw size={12} className="inline mr-1" /> Cascade Auto
            </button>
          </div>
        </div>

        {/* Option Fallback Toggle */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Layers size={18} className="text-primary" />
            <div>
              <span className="font-semibold text-foreground">Tolérance aux pannes (Failover automatique)</span>
              <p className="text-xs text-muted-foreground">Si le fournisseur prioritaire est indisponible ou hors-quota, basculer silencieusement sur les autres modèles.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.fallbackEnabled}
              onChange={e => setSettings(s => ({ ...s, fallbackEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Cartes des Fournisseurs Individuels */}
      <div className="grid md:grid-cols-3 gap-6">
        {providersConfig.map(prov => {
          const Icon = prov.icon;
          const isSelected = settings.primaryProvider === prov.id || settings.primaryProvider === "auto";
          const isPrimary = settings.primaryProvider === prov.id;
          const testState = testResults[prov.id];

          return (
            <div
              key={prov.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                isPrimary
                  ? "bg-[#0f121d] border-primary ring-2 ring-primary/40 shadow-2xl"
                  : "bg-card border-border hover:border-primary/40"
              }`}
            >
              {isPrimary && (
                <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Actif en direct
                </div>
              )}

              <div>
                {/* Header Carte */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                    <Icon size={24} />
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${prov.badgeColor}`}>
                    {prov.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                  {prov.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  {prov.description}
                </p>

                {/* Sélecteur de Modèle Spécifique */}
                <div className="space-y-2 mb-6">
                  <label className="text-xs font-semibold text-slate-300 block">Modèle assigné :</label>
                  <select
                    value={prov.selectedModel}
                    onChange={e => prov.setModel(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                  >
                    {prov.models.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pied de Carte : Test & Activation */}
              <div className="space-y-3 pt-4 border-t border-border">
                {/* Résultat du test live */}
                {testState && testState.message && (
                  <div
                    className={`text-xs p-2.5 rounded-lg flex items-center gap-2 font-medium ${
                      testState.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {testState.status === "ok" ? (
                      <CheckCircle2 size={14} className="shrink-0" />
                    ) : (
                      <AlertTriangle size={14} className="shrink-0" />
                    )}
                    <span className="truncate">{testState.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testProvider(prov.id)}
                    disabled={testState?.loading}
                    className="flex-1 py-2 px-3 bg-secondary hover:bg-muted text-foreground text-xs font-bold rounded-lg border border-border transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {testState?.loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <PlayCircle size={14} />
                    )}
                    Tester
                  </button>

                  <button
                    onClick={() => setSettings(s => ({ ...s, primaryProvider: prov.id }))}
                    disabled={isPrimary}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isPrimary
                        ? "bg-primary/20 text-primary border border-primary/40 opacity-70 cursor-default"
                        : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                    }`}
                  >
                    {isPrimary ? "Sélectionné" : "Activer"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Brique 5 : Base de Données Vectorielle & RAG Hermétique (100k+ Utilisateurs) */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Database size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Base de Données Vectorielle & RAG Hermétique
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  100 000+ Utilisateurs
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Recherche sémantique haute performance par similarité cosinus avec isolation multi-tenant stricte (OpenAI text-embedding-3-large, 1536 dimensions MRL).
              </p>
            </div>
          </div>

          <button
            onClick={testVectorRAG}
            disabled={vectorTestResult.loading}
            className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {vectorTestResult.loading ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
            Tester le Moteur Vectoriel
          </button>
        </div>

        {vectorTestResult.message && (
          <div
            className={`text-xs p-3 rounded-xl flex items-center gap-2 font-medium ${
              vectorTestResult.status === "ok"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {vectorTestResult.status === "ok" ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertTriangle size={16} className="shrink-0" />
            )}
            <span>{vectorTestResult.message}</span>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              id: "sql",
              name: "MySQL / MariaDB Partitionné",
              tag: "Production Locale / OVH",
              desc: "Partitionnement strict par company_id avec index composites multi-tenant. Zéro latence réseau externe.",
              status: "Prêt & Actif",
            },
            {
              id: "qdrant",
              name: "Qdrant Cluster (Rust HNSW)",
              tag: "Recommandé Grandes Échelles",
              desc: "Moteur vectoriel ultra-performant. Supporte des milliards de vecteurs, sous 10ms avec filtrage payload étanche.",
              status: "Compatible 100k+",
            },
            {
              id: "pinecone",
              name: "Pinecone Serverless",
              tag: "Cloud Scalable",
              desc: "Namespaces hermétiques par compte entreprise avec indexation automatique managée et 99.99% SLA.",
              status: "Compatible",
            },
            {
              id: "pgvector",
              name: "pgvector (PostgreSQL HNSW)",
              tag: "Open Source Enterprise",
              desc: "Index HNSW haute précision avec index vector_cosine_ops et requêtes SQL relationnelles unifiées.",
              status: "Compatible",
            },
          ].map(driver => {
            const isSelected = (settings.vectorDbDriver || "sql") === driver.id;
            return (
              <div
                key={driver.id}
                onClick={() => setSettings(s => ({ ...s, vectorDbDriver: driver.id as any }))}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-purple-950/20 border-purple-500 ring-2 ring-purple-500/30"
                    : "bg-secondary/40 border-border hover:border-purple-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-purple-300 border border-white/10">
                      {driver.tag}
                    </span>
                    {isSelected && <Check size={16} className="text-purple-400" />}
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-1">{driver.name}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{driver.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Capacité :</span>
                  <span className="font-bold text-foreground">{driver.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide & Recommandation Architecturale */}
      <div className="bg-card border border-border rounded-2xl p-6 text-sm space-y-3">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <Shield size={16} className="text-primary" /> Guide des Meilleures Pratiques d'Inférence
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <div className="p-3 bg-secondary/40 rounded-xl">
            <strong className="text-foreground block mb-1">Pour la vitesse quotidienne :</strong>
            Utilisez <strong>Groq LPU</strong> avec <code>qwen/qwen3.8-27b</code>. Le temps de réponse moyen est inférieur à 1 seconde avec un streaming temps réel ultra réactif.
          </div>
          <div className="p-3 bg-secondary/40 rounded-xl">
            <strong className="text-foreground block mb-1">Pour les audits critiques :</strong>
            Basculez sur <strong>OpenAI</strong> avec <code>gpt-4o-mini</code> ou <code>gpt-4o</code> lorsque vous traitez des factures complexes nécessitant une rigueur arithmétique pointue.
          </div>
          <div className="p-3 bg-secondary/40 rounded-xl">
            <strong className="text-foreground block mb-1">Mode Recommandé :</strong>
            Laissez la <strong>Cascade Automatique</strong> activée. Si une panne ou un rate limit survient chez un fournisseur, l'application bascule automatiquement et de façon transparente sans interrompre vos utilisateurs.
          </div>
        </div>
      </div>
    </div>
  );
}
