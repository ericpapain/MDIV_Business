import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Mail, Lock, LogOut, FileText, Calendar, Check, AlertCircle, Loader2, Download, X, Settings } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modale */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {company?.name ? company.name.substring(0, 2).toUpperCase() : 'EP'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {company?.name || 'Mon Compte'}
              </h2>
              <p className="text-xs text-slate-500">{company?.email}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Onglets */}
        <div className="flex border-b border-slate-100 px-6 bg-white">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Settings size={15} /> Paramètres Compte
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText size={15} /> Mes Rapports ({diagnostics.length})
          </button>
        </div>

        {/* Contenu Onglets */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
                  <Check size={16} className="text-emerald-600" /> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" /> {profileError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de l'entreprise
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="Ex: Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail professionnelle
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="contact@entreprise.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nouveau mot de passe (Optionnel)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { logout(); onClose(); }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                >
                  <LogOut size={15} className="mr-1.5" /> Se déconnecter
                </Button>
                <Button type="submit" disabled={profileLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">
                  {profileLoading ? <Loader2 className="animate-spin mr-1.5" size={15} /> : <Check size={15} className="mr-1.5" />}
                  Enregistrer
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reportsLoading ? (
                <div className="py-10 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                  <span className="text-xs">Chargement des diagnostics...</span>
                </div>
              ) : reportsError ? (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs">
                  {reportsError}
                </div>
              ) : diagnostics.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl">
                  <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                  <h3 className="font-semibold text-slate-700 text-sm">Aucun rapport généré pour le moment</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Réalisez un diagnostic IA pour retrouver vos audits personnalisés ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {diagnostics.map((diag) => {
                    const report = diag.report || {};
                    return (
                      <div key={diag.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              Diagnostic IA
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(diag.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>Maturité :</span>
                            <span className="text-blue-600 font-extrabold">{diag.score}/100</span>
                          </div>
                          {report.synthesis && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {report.synthesis}
                            </p>
                          )}
                        </div>

                        <Button 
                          onClick={() => downloadPDF(report)}
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5 rounded-xl shrink-0"
                        >
                          <Download size={13} /> Télécharger PDF
                        </Button>
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

export default UserProfileModal;
