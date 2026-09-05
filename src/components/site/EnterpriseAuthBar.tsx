import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { UserProfileModal } from '@/components/auth/UserProfileModal';
import { Sparkles, ChevronDown, Settings, FileText, Building2, LogOut, LogIn } from 'lucide-react';

interface EnterpriseAuthBarProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const EnterpriseAuthBar: React.FC<EnterpriseAuthBarProps> = ({
  title,
  subtitle,
  className = ""
}) => {
  const { company, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; tab: 'profile' | 'reports' }>({
    isOpen: false,
    tab: 'profile'
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayTitle = title || (isEn ? "Explore application modules" : "Explorez les modules applicatifs");

  return (
    <>
      <div className={`relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-blue-500/30 shadow-2xl shadow-blue-950/40 text-white ${className}`}>
        {/* Halos lumineux décoratifs */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1.5">
            <Sparkles size={14} className="animate-pulse text-amber-400" /> {isEn ? "Enterprise Portal" : "Espace Entreprise & IA"}
          </span>
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
            {displayTitle}
          </h2>
          {subtitle && <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>}
        </div>

        <div className="relative z-10">
          {isAuthenticated ? (
            /* Menu déroulant profil si connecté (Bouton agrandi & Widget en vert Émeraude) */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3.5 px-6 py-3 md:px-7 md:py-3.5 rounded-full text-sm md:text-base font-extrabold bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white hover:shadow-xl hover:shadow-emerald-500/35 transition-all transform hover:-translate-y-0.5 border border-emerald-300/60 cursor-pointer shadow-lg"
              >
                <div className="w-8.5 h-8.5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-black text-xs md:text-sm shadow-inner text-white shrink-0">
                  {company?.name ? company.name.substring(0, 2).toUpperCase() : 'MD'}
                </div>
                <span className="max-w-[200px] sm:max-w-[260px] md:max-w-[320px] truncate text-sm md:text-base font-extrabold tracking-wide">
                  {company?.name || 'Mon Entreprise'}
                </span>
                <ChevronDown size={18} className={`transition-transform duration-200 shrink-0 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-68 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{company?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{company?.email}</p>
                  </div>

                  <div className="py-1.5">
                    <button
                      onClick={() => { setUserDropdownOpen(false); setModalState({ isOpen: true, tab: 'profile' }); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <Settings size={16} className="text-blue-600" />
                      <span>{isEn ? "Edit profile info" : "Modifier mes informations"}</span>
                    </button>

                    <button
                      onClick={() => { setUserDropdownOpen(false); setModalState({ isOpen: true, tab: 'reports' }); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <FileText size={16} className="text-blue-600" />
                      <span>{isEn ? "My Generated Reports" : "Mes Rapports générés"}</span>
                    </button>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50/80 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center gap-3 transition-colors"
                    >
                      <Building2 size={16} className="text-blue-600" />
                      <span>{isEn ? "Dashboard" : "Tableau de bord"}</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1">
                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>{isEn ? "Log out" : "Se déconnecter"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Boutons Connexion & Créer un compte élégants et contrastés si non connecté */
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all shadow-sm transform hover:-translate-y-0.5 backdrop-blur-md"
              >
                <LogIn size={16} />
                {isEn ? "Sign in" : "Connexion"}
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:shadow-lg hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 border border-amber-300/50 shadow-md"
              >
                <Building2 size={16} />
                {isEn ? "Create Account" : "Créer un compte"}
              </Link>
            </div>
          )}
        </div>
      </div>

      <UserProfileModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        defaultTab={modalState.tab}
      />
    </>
  );
};
