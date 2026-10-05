import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { getApiUrl } from '@/lib/apiConfig';
import { 
  searchCompanyBySiren, cleanSiren, formatSiren, formatSiret, isValidSiren, 
  OfficialCompanyData, CompanySearchResult 
} from '@/lib/companySearchService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Building2, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft,
  Sparkles, CheckCircle2, Eye, EyeOff, User, 
  Search, Check, RefreshCw, Briefcase, Phone, MapPin, 
  AlertTriangle, Hash
} from 'lucide-react';

const JOB_FUNCTIONS = [
  'Dirigeant / Fondateur',
  'Directeur Général / Associé',
  'Directeur / Responsable Administratif & Financier',
  'Directeur / Responsable Commercial',
  'Directeur / Responsable Informatique (DSI)',
  'Responsable Innovation & IA',
  'Ressources Humaines (DRH)',
  'Consultant / Expert Métier',
  'Autre'
];

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [step, setStep] = useState<'choice' | 'siren_search' | 'company_verify' | 'user_profile'>('choice');
  const [hasSiren, setHasSiren] = useState<boolean | null>(null);

  // Recherche SIREN
  const [sirenInput, setSirenInput] = useState('');
  const [isSearchingSiren, setIsSearchingSiren] = useState(false);
  const [sirenError, setSirenError] = useState<string | null>(null);
  const [officialCompany, setOfficialCompany] = useState<OfficialCompanyData | null>(null);
  const [sourcesUsed, setSourcesUsed] = useState<string[]>([]);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Formulaire Entreprise
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    trade_name: '',
    siren: '',
    siret: '',
    legal_form: '',
    naf_code: '',
    activity: '',
    address: '',
    postal_code: '',
    city: '',
    creation_date: '',
    employee_range: '',
    capital: '',
    phone: '',
    website: '',
    company_status: 'ACTIVE' as 'ACTIVE' | 'MANUAL' | 'SIREN_PENDING'
  });

  // Formulaire Utilisateur
  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: 'Dirigeant / Fondateur',
    password: '',
    confirm_password: '',
    accept_terms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recherche SIREN
  const handleSirenSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSirenError(null);
    setAlreadyRegistered(false);

    const cleaned = cleanSiren(sirenInput);
    if (!isValidSiren(cleaned)) {
      setSirenError(isEn ? "SIREN must contain exactly 9 digits." : "Le numéro SIREN doit comporter exactement 9 chiffres (ex: 981 123 456).");
      return;
    }

    setIsSearchingSiren(true);

    try {
      const result: CompanySearchResult = await searchCompanyBySiren(cleaned);
      
      setOfficialCompany(result.company);
      setSourcesUsed(result.sources_used);
      setAlreadyRegistered(result.already_registered);

      setCompanyForm({
        company_name: result.company.company_name || '',
        trade_name: result.company.trade_name || '',
        siren: result.company.siren || cleaned,
        siret: result.company.siret || '',
        legal_form: result.company.legal_form || '',
        naf_code: result.company.naf_code || '',
        activity: result.company.activity || '',
        address: result.company.address || '',
        postal_code: result.company.postal_code || '',
        city: result.company.city || '',
        creation_date: result.company.creation_date || '',
        employee_range: result.company.employee_range || '',
        capital: result.company.capital || '',
        phone: '',
        website: '',
        company_status: 'ACTIVE'
      });

      if (result.company.dirigeants && result.company.dirigeants.length > 0) {
        const d = result.company.dirigeants[0];
        const parts = d.name.split(' ');
        if (parts.length >= 2) {
          setUserForm(prev => ({
            ...prev,
            first_name: prev.first_name || parts[0],
            last_name: prev.last_name || parts.slice(1).join(' '),
            job_title: d.role || prev.job_title
          }));
        }
      }

    } catch (err: any) {
      setSirenError(err.message || "Aucune entreprise trouvée avec ce numéro SIREN.");
    } finally {
      setIsSearchingSiren(false);
    }
  };

  const startManualRegistration = () => {
    setHasSiren(false);
    setCompanyForm({
      company_name: '',
      trade_name: '',
      siren: '',
      siret: '',
      legal_form: 'Société en cours de création',
      naf_code: '',
      activity: 'Services aux entreprises',
      address: '',
      postal_code: '',
      city: '',
      creation_date: '',
      employee_range: '1-10',
      capital: '',
      phone: '',
      website: '',
      company_status: 'MANUAL'
    });
    setStep('company_verify');
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!userForm.accept_terms) {
      setSubmitError(isEn ? "Please accept terms of service." : "Veuillez accepter les conditions d'utilisation.");
      return;
    }

    if (userForm.password !== userForm.confirm_password) {
      setSubmitError(isEn ? "Passwords do not match." : "Les mots de passe ne correspondent pas.");
      return;
    }

    if (userForm.password.length < 8) {
      setSubmitError(isEn ? "Password must be at least 8 characters." : "Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (!userForm.email || !userForm.first_name || !userForm.last_name) {
      setSubmitError(isEn ? "Please fill in all personal details." : "Veuillez renseigner votre prénom, nom et email professionnel.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl('auth/register.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...companyForm,
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          email: userForm.email,
          phone: userForm.phone || companyForm.phone,
          job_title: userForm.job_title,
          password: userForm.password,
          data_source: hasSiren && officialCompany ? 'INSEE' : 'MANUAL',
          official_data: officialCompany
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isEn ? 'Registration failed' : 'Erreur lors de la création du compte'));
      }

      if (data.token && data.company) {
        login(data.token, data.company);
        navigate(location.state?.from?.pathname || '/dashboard', { 
          replace: true,
          state: { message: "Compte entreprise créé et activé avec succès !" }
        });
      } else {
        navigate('/login', {
          state: { 
            message: "Compte entreprise créé avec succès ! Veuillez vous connecter.",
            email: userForm.email
          }
        });
      }

    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 text-slate-900 flex flex-col justify-center relative overflow-hidden">
      {/* Halos décoratifs discrets */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
          <Sparkles size={14} className="text-amber-500" />
          <span>{isEn ? "Enterprise Onboarding" : "Inscription Entreprise"}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-semibold">INSEE & RNE</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {step === 'choice' && (isEn ? "Create Enterprise Account" : "Créer votre compte entreprise")}
          {step === 'siren_search' && (isEn ? "Search by SIREN" : "Identification par SIREN")}
          {step === 'company_verify' && (isEn ? "Verify Enterprise Details" : "Vérification des informations")}
          {step === 'user_profile' && (isEn ? "Administrator Profile" : "Profil administrateur")}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {step === 'choice' && "Accédez à vos outils IA, facturation et génération en illimité."}
          {step === 'siren_search' && "Entrez votre SIREN pour récupérer automatiquement vos données légales."}
          {step === 'company_verify' && "Vérifiez les données officielles avant de continuer."}
          {step === 'user_profile' && "Définissez vos accès administrateur."}
        </p>

        {/* Stepper horizontal épuré */}
        <div className="flex items-center justify-center gap-2 mt-5 max-w-xs mx-auto">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 'choice' || step === 'siren_search' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 'company_verify' ? 'bg-amber-500' : (step === 'user_profile' ? 'bg-emerald-500' : 'bg-slate-200')}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 'user_profile' ? 'bg-amber-500' : 'bg-slate-200'}`} />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-7 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">

          {/* ÉTAPE 1 : CHOIX */}
          {step === 'choice' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Option A : SIREN */}
                <button
                  type="button"
                  onClick={() => {
                    setHasSiren(true);
                    setStep('siren_search');
                  }}
                  className="p-5 rounded-2xl border-2 border-amber-400 bg-amber-50/40 hover:bg-amber-50/80 transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                      <Building2 size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5">
                      Recommandé
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                      Avec numéro SIREN
                    </h4>
                    <p className="text-xs text-slate-500">
                      Préremplissage automatique en 2 secondes via INSEE & RNE.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-amber-700">
                    <span>Rechercher</span>
                    <ArrowRight size={14} className="ml-1" />
                  </div>
                </button>

                {/* Option B : Manuel */}
                <button
                  type="button"
                  onClick={startManualRegistration}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                      <Briefcase size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      En création / Étranger
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                      Sans SIREN
                    </h4>
                    <p className="text-xs text-slate-500">
                      Saisie manuelle des informations de l'entreprise.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-slate-600">
                    <span>Saisie manuelle</span>
                    <ArrowRight size={14} className="ml-1" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : RECHERCHE SIREN */}
          {step === 'siren_search' && (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
              >
                <ArrowLeft size={14} /> Retour
              </button>

              <form onSubmit={handleSirenSearch} className="space-y-3">
                <Label htmlFor="siren" className="text-xs font-bold text-slate-700">
                  Numéro SIREN (9 chiffres)
                </Label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash size={16} />
                    </div>
                    <Input
                      id="siren"
                      type="text"
                      autoFocus
                      placeholder="Ex: 981 123 456"
                      value={sirenInput}
                      onChange={(e) => setSirenInput(e.target.value)}
                      className="pl-10 h-11 bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 font-mono text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSearchingSiren || !sirenInput.trim()}
                    className="h-11 px-5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSearchingSiren ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Recherche...</span>
                      </>
                    ) : (
                      <>
                        <Search size={15} />
                        <span>Identifier</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {sirenError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-red-700">
                    <AlertCircle size={15} />
                    <span>Entreprise introuvable</span>
                  </div>
                  <p>{sirenError}</p>
                  <button
                    type="button"
                    onClick={startManualRegistration}
                    className="text-amber-700 hover:underline font-bold text-[11px] block pt-1"
                  >
                    Saisir manuellement sans SIREN →
                  </button>
                </div>
              )}

              {alreadyRegistered && officialCompany && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle size={15} />
                    <span>Compte déjà existant pour cette entreprise</span>
                  </div>
                  <p>
                    <strong>{officialCompany.company_name}</strong> est déjà enregistrée.
                  </p>
                  <Link
                    to="/login"
                    state={{ siren: officialCompany.siren }}
                    className="inline-block px-3.5 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700 transition-colors"
                  >
                    Se connecter avec ce SIREN
                  </Link>
                </div>
              )}

              {officialCompany && !alreadyRegistered && (
                <div className="p-5 bg-slate-50/70 border border-emerald-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 size={15} />
                      <span>Entreprise identifiée</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {officialCompany.administrative_status}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Raison sociale</span>
                      <span className="text-sm font-bold text-slate-900 block">{officialCompany.company_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">SIREN</span>
                      <span className="text-sm font-mono font-bold text-slate-800 block">
                        {formatSiren(officialCompany.siren)}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 font-medium block">Siège</span>
                      <span className="text-slate-700 block flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        {officialCompany.address}, {officialCompany.postal_code} {officialCompany.city}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setStep('company_verify')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <span>Valider et continuer</span>
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 3 : VÉRIFICATION ENTREPRISE */}
          {step === 'company_verify' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <button
                  type="button"
                  onClick={() => setStep(hasSiren ? 'siren_search' : 'choice')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <ArrowLeft size={14} /> Retour
                </button>
                <span className="text-xs text-amber-700 font-bold">
                  Étape 2 / 3
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-bold text-slate-700">
                        Nom ou Raison Sociale *
                      </Label>
                      {hasSiren && (
                        <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                          <Check size={11} /> Certifié INSEE
                        </span>
                      )}
                    </div>
                    <Input
                      type="text"
                      required
                      value={companyForm.company_name}
                      onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                      className="h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                      placeholder="Ex: ABC SAS"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 mb-1 block">
                      SIREN
                    </Label>
                    <Input
                      type="text"
                      readOnly={hasSiren === true && !!companyForm.siren}
                      value={companyForm.siren ? formatSiren(companyForm.siren) : ''}
                      onChange={(e) => setCompanyForm({ ...companyForm, siren: cleanSiren(e.target.value) })}
                      className="h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm font-mono"
                      placeholder={hasSiren ? "981 123 456" : "Optionnel"}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 mb-1 block">
                      Forme Juridique
                    </Label>
                    <Input
                      type="text"
                      value={companyForm.legal_form}
                      onChange={(e) => setCompanyForm({ ...companyForm, legal_form: e.target.value })}
                      className="h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                      placeholder="SAS, SARL, etc."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold text-slate-700 mb-1 block">
                      Adresse du siège *
                    </Label>
                    <Input
                      type="text"
                      required
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                      className="h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                      placeholder="10 Rue de la Paix"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 mb-1 block">
                      Code Postal *
                    </Label>
                    <Input
                      type="text"
                      required
                      value={companyForm.postal_code}
                      onChange={(e) => setCompanyForm({ ...companyForm, postal_code: e.target.value })}
                      className="h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                      placeholder="75001"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 mb-1 block">
                      Ville *
                    </Label>
                    <Input
                      type="text"
                      required
                      value={companyForm.city}
                      onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                      className="h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                      placeholder="Paris"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      if (!companyForm.company_name.trim()) {
                        alert("Veuillez renseigner le nom de l'entreprise.");
                        return;
                      }
                      setStep('user_profile');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <span>Étape suivante : Administrateur</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : PROFIL RESPONSABLE */}
          {step === 'user_profile' && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <button
                  type="button"
                  onClick={() => setStep('company_verify')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <ArrowLeft size={14} /> Retour
                </button>
                <span className="text-xs text-amber-700 font-bold">
                  Étape 3 / 3
                </span>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-red-700 font-medium">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">
                    Prénom *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User size={15} />
                    </div>
                    <Input
                      type="text"
                      required
                      autoFocus
                      placeholder="Jean"
                      value={userForm.first_name}
                      onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                      className="pl-9 h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">
                    Nom *
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="Dupont"
                    value={userForm.last_name}
                    onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                    className="h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">
                    Email professionnel *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
                    </div>
                    <Input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="contact@entreprise.fr"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="pl-9 h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">
                    Téléphone
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone size={15} />
                    </div>
                    <Input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="pl-9 h-10 bg-slate-50/80 border-slate-200 text-slate-900 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">
                    Fonction *
                  </Label>
                  <select
                    value={userForm.job_title}
                    onChange={(e) => setUserForm({ ...userForm, job_title: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50/80 border border-slate-200 text-slate-900 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-600 font-medium"
                  >
                    {JOB_FUNCTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">
                    Mot de passe (8+ car.) *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="pl-9 pr-9 h-10 bg-slate-50/80 border-slate-200 text-slate-900 text-sm rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">
                    Confirmer le mot de passe *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={userForm.confirm_password}
                      onChange={(e) => setUserForm({ ...userForm, confirm_password: e.target.value })}
                      className="pl-9 h-10 bg-slate-50/80 border-slate-200 text-slate-900 text-sm rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div 
                className="flex items-start gap-2.5 pt-1 cursor-pointer select-none group"
                onClick={() => setUserForm(prev => ({ ...prev, accept_terms: !prev.accept_terms }))}
              >
                <div 
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    userForm.accept_terms 
                      ? 'bg-amber-600 border-amber-600 text-white shadow-xs' 
                      : 'border-slate-300 bg-white group-hover:border-amber-500'
                  }`}
                >
                  {userForm.accept_terms && <Check size={14} className="stroke-[3]" />}
                </div>
                <div className="text-xs text-slate-500 font-normal leading-relaxed">
                  J'accepte les{' '}
                  <Link 
                    to="/terms" 
                    onClick={(e) => e.stopPropagation()} 
                    className="text-amber-700 hover:underline font-medium"
                  >
                    Conditions Générales
                  </Link>{' '}
                  et la{' '}
                  <Link 
                    to="/privacy" 
                    onClick={(e) => e.stopPropagation()} 
                    className="text-amber-700 hover:underline font-medium"
                  >
                    Confidentialité
                  </Link>.
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 mt-2" 
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon compte entreprise</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Lien vers Connexion */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 ml-1">
                <span>Se connecter</span>
                <ArrowRight size={13} />
              </Link>
            </p>
          </div>
        </div>

        {/* Retour */}
        <div className="mt-5 text-center">
          <Link 
            to="/services-ia" 
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-medium"
          >
            <span>← Retour aux Applications IA</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
