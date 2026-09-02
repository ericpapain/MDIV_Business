import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Mail, Lock, User, LogOut, FileText, BarChart3, Calendar, Check, AlertCircle, Loader2, Download, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'reports';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, defaultTab = 'profile' }) => {
  const { company, token, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'reports'>(defaultTab);

  // Profile Form States
  const [name, setName] = useState(company?.name || '');
  const [email, setEmail] = useState(company?.email || '');
  const [password, setPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Reports States
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setName(company.name);
      setEmail(company.email);
    }
  }, [company]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (isOpen && activeTab === 'reports' && token) {
      fetchDiagnostics();
    }
  }, [isOpen, activeTab, token]);

  const fetchDiagnostics = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost/mdiv_business/api';
      const response = await fetch(`${API_BASE_URL}/user/diagnostics.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur de chargement des diagnostics");
      setDiagnostics(data.diagnostics || []);
    } catch (err: any) {
      setReportsError(err.message);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost/mdiv_business/api';
      const response = await fetch(`${API_BASE_URL}/user/profile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          password: password.trim() || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur de mise à jour du profil");

      // Mettre à jour le contexte global
      if (token) {
        login(token, data.company);
      }
      setProfileSuccess("Vos informations ont été mises à jour avec succès !");
      setPassword('');
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const downloadPDF = (reportData: any) => {
    if (!reportData) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = import.meta.env.PROD ? '/api/diagnostic_pdf.php' : 'http://localhost/mdiv_business/api/diagnostic_pdf.php';
    form.target = '_blank';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'report';
    input.value = typeof reportData === 'string' ? reportData : JSON.stringify(reportData);
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modale */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              {company?.name ? company.name.substring(0, 2).toUpperCase() : 'EP'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {company?.name || 'Mon Compte'}
              </h2>
              <p className="text-xs text-slate-500">{company?.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Onglets */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings size={16} /> Modifier mon compte
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText size={16} /> Mes Rapports Générés ({diagnostics.length})
          </button>
        </div>

        {/* Contenu Onglets */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {profileSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm border border-emerald-200 flex items-center gap-2">
                  <Check size={18} /> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-200 flex items-center gap-2">
                  <AlertCircle size={18} /> {profileError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nom de l'entreprise
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Adresse e-mail professionnelle
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="contact@entreprise.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nouveau mot de passe (Laissez vide pour conserver l'actuel)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Au moins 8 caractères</p>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { logout(); onClose(); }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut size={16} className="mr-2" /> Se déconnecter
                </Button>
                <Button type="submit" disabled={profileLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  {profileLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check size={16} className="mr-2" />}
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reportsLoading ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-blue-600" size={28} />
                  <span>Chargement de vos diagnostics...</span>
                </div>
              ) : reportsError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                  {reportsError}
                </div>
              ) : diagnostics.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Aucun rapport généré pour le moment</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Réalisez votre premier diagnostic IA gratuit pour obtenir un audit personnalisé de votre entreprise.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {diagnostics.map((diag) => {
                    const report = diag.report || {};
                    return (
                      <div key={diag.id} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 uppercase">
                              Diagnostic Express
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar size={13} />
                              {new Date(diag.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Score de Maturité :</span>
                            <span className="text-blue-600 font-extrabold text-lg">{diag.score}/100</span>
                          </div>
                          {report.synthesis && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {report.synthesis}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button 
                            onClick={() => downloadPDF(report)}
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
                          >
                            <Download size={14} /> Télécharger le PDF
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
