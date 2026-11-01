import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Client, fetchClients, createClient } from '@/lib/quoteService';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { 
  UserPlus, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  ChevronDown, 
  X, 
  Loader2, 
  Sparkles,
  UserCheck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { isValidSiret, computeFrenchVat } from '@/lib/validationLuhn';

interface ClientSelectWithCreateProps {
  selectedClientId?: string | number | null;
  onSelectClient: (client: Client | null) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  theme?: 'light' | 'dark';
}

export const ClientSelectWithCreate: React.FC<ClientSelectWithCreateProps> = ({
  selectedClientId,
  onSelectClient,
  label = "Client associé",
  required = false,
  placeholder = "Sélectionner un client...",
  className = "",
  theme = "light"
}) => {
  const { company, token, isAuthenticated } = useAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new client
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('FR');
  const [newSiret, setNewSiret] = useState('');
  const [newVatNumber, setNewVatNumber] = useState('');
  const [siretStatus, setSiretStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [siretMsg, setSiretMsg] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Fetch clients on mount and when company changes
  const loadClients = async () => {
    if (!company?.id) {
      setClients([]);
      setIsLoadingClients(false);
      return;
    }
    setIsLoadingClients(true);
    try {
      const data = await fetchClients(company.id);
      setClients(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des clients:", err);
      setClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [company?.id]);

  // Bloquer le défilement et écouter Échap quand la modale est ouverte
  useEffect(() => {
    if (!isCreateModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCreateModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCreateModalOpen]);

  const selectedClient = clients.find(c => String(c.id) === String(selectedClientId)) || null;

  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSiretChange = (val: string) => {
    const raw = val.replace(/\s+/g, '');
    setNewSiret(raw);
    if (raw.length === 14) {
      if (isValidSiret(raw)) {
        setSiretStatus('valid');
        setSiretMsg('SIRET vérifié et conforme à l\'algorithme de Luhn');
        if (!newVatNumber) {
          const autoVat = computeFrenchVat(raw);
          setNewVatNumber(autoVat);
        }
      } else {
        setSiretStatus('invalid');
        setSiretMsg('SIRET non conforme (clé de contrôle de Luhn invalide)');
      }
    } else if (raw.length > 0) {
      setSiretStatus('invalid');
      setSiretMsg(`${raw.length}/14 chiffres requis`);
    } else {
      setSiretStatus('idle');
      setSiretMsg('');
    }
  };

  const handleClientSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!newName.trim()) {
      toast.error("Veuillez saisir le nom du contact.");
      return;
    }

    if (newSiret.trim() && !isValidSiret(newSiret.trim())) {
      toast.error("Le numéro SIRET fourni est invalide (échec contrôle de Luhn). Corrigez-le avant de continuer.");
      return;
    }

    // Si non connecté, afficher l'interface d'authentification sans perdre les données
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanSiret = newSiret.trim();
      const cleanSiren = cleanSiret.length >= 9 ? cleanSiret.slice(0, 9) : undefined;
      const cleanVat = newVatNumber.trim() || (cleanSiret.length === 14 ? computeFrenchVat(cleanSiret) : undefined);

      const newClient = await createClient(
        {
          name: newName.trim(),
          company: newCompany.trim() || newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          address: newAddress.trim(),
          postal_code: newPostalCode.trim() || undefined,
          city: newCity.trim() || undefined,
          country_code: newCountryCode.trim() || 'FR',
          siret: cleanSiret || undefined,
          siren: cleanSiren,
          vat_number: cleanVat,
          notes: newNotes.trim()
        },
        company?.id,
        token || undefined
      );

      toast.success(`Client ${newClient.name} (${newClient.company}) créé avec succès !`);
      
      // Recharger la liste, fermer le modal et sélectionner le nouveau client
      await loadClients();
      onSelectClient(newClient);
      
      // Réinitialiser les champs
      setNewName('');
      setNewCompany('');
      setNewEmail('');
      setNewPhone('');
      setNewAddress('');
      setNewPostalCode('');
      setNewCity('');
      setNewCountryCode('FR');
      setNewSiret('');
      setNewVatNumber('');
      setSiretStatus('idle');
      setSiretMsg('');
      setNewNotes('');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Après connexion réussie depuis le modal d'authentification
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    // Exécuter l'enregistrement maintenant que l'utilisateur est connecté
    handleClientSubmit();
  };

  return (
    <div className={`relative ${isDropdownOpen ? 'z-[9999]' : 'z-20'} ${className}`}>
      {/* Label and "+ Nouveau client" button */}
      <div className="flex items-center justify-between mb-2">
        <label className={`text-[11px] uppercase font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
          <Building2 size={14} className={theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'} />
          {label} {required && <span className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}>*</span>}
        </label>
        
        <button
          type="button"
          onClick={handleOpenCreate}
          id="btn-add-new-client"
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-all shadow-sm hover:scale-[1.02] cursor-pointer ${theme === 'dark' ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100'}`}
        >
          <UserPlus size={13} />
          + Nouveau client
        </button>
      </div>

      {/* Selected Client Display or Select Trigger */}
      {selectedClient ? (
        <div className={`flex items-center justify-between p-3 border rounded-2xl shadow-sm group transition-all ${theme === 'dark' ? 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/60' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${theme === 'dark' ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'}`}>
              {selectedClient.company?.charAt(0) || selectedClient.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className={`text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {selectedClient.company || selectedClient.name}
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-700'}`}>
                  Client sélectionné
                </span>
              </div>
              <div className={`text-[11px] font-semibold flex items-center gap-3 mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Contact : {selectedClient.name}</span>
                {selectedClient.email && <span>• {selectedClient.email}</span>}
                {selectedClient.phone && <span>• {selectedClient.phone}</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectClient(null)}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Désélectionner"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            role="combobox"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-3 border rounded-xl text-left text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm cursor-pointer ${theme === 'dark' ? 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/60 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900 focus:border-slate-400'}`}
          >
            <span className={selectedClient ? (theme === 'dark' ? "text-white" : "text-slate-900") : (theme === 'dark' ? "text-slate-400" : "text-slate-500")} data-placeholder="true">
              {placeholder}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Backdrop transparent pour fermer au clic extérieur */}
          {isDropdownOpen && (
            <div 
              className="fixed inset-0 z-[9998] bg-transparent" 
              onClick={() => setIsDropdownOpen(false)} 
            />
          )}

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-[9999] left-0 right-0 w-full mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-slate-900/5">
              {/* Search Bar */}
              <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-[#F8F7F4]">
                <Search size={14} className="text-slate-400 ml-1" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, entreprise, email..."
                  className="w-full bg-transparent text-xs text-[#222222] placeholder-[#666666] focus:outline-none py-1"
                  autoFocus
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Client List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                {isLoadingClients ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    Chargement des clients...
                  </div>
                ) : filteredClients.length === 0 ? (
                  !isAuthenticated ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-500 mb-2">Connectez-vous pour retrouver vos clients enregistrés.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-bold"
                      >
                        <Building2 size={13} />
                        Se connecter à mon entreprise
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-500 mb-2">Aucun client trouvé.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleOpenCreate();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                      >
                        <UserPlus size={13} />
                        Créer ce client maintenant
                      </button>
                    </div>
                  )
                ) : (
                  filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        onSelectClient(client);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 hover:bg-[#F8F7F4] transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#222222] group-hover:text-blue-600 transition-colors">
                          {client.company || client.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {client.name} {client.email ? `• ${client.email}` : ''}
                        </div>
                      </div>
                      {String(selectedClientId) === String(client.id) && (
                        <Check size={16} className="text-blue-600" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer with "+ Nouveau client" */}
              <div className="p-2 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="text-[11px] text-slate-500 px-2">
                  {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleOpenCreate();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  <UserPlus size={12} />
                  + Nouveau client
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Création d'un nouveau client (via Portal au-dessus de tout) */}
      {isCreateModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 my-auto max-h-[92vh] overflow-y-auto transform-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  Ajouter un nouveau client
                </h3>
                <p className="text-xs text-slate-500">
                  Créez la fiche client et associez-la immédiatement à ce document.
                </p>
              </div>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nom du contact <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Entreprise / Raison sociale
                  </label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="ex: SAS Dupont Immobilier"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email professionnel
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="contact@dupont.fr"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Adresse postale (Rue / Voie)
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="12 Avenue Montaigne"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Code Postal
                  </label>
                  <input
                    type="text"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    placeholder="75008"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Paris"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Pays ISO
                  </label>
                  <select
                    value={newCountryCode}
                    onChange={(e) => setNewCountryCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="FR">France (FR)</option>
                    <option value="BE">Belgique (BE)</option>
                    <option value="CH">Suisse (CH)</option>
                    <option value="LU">Luxembourg (LU)</option>
                    <option value="DE">Allemagne (DE)</option>
                    <option value="IT">Italie (IT)</option>
                    <option value="ES">Espagne (ES)</option>
                  </select>
                </div>
              </div>

              {/* Bloc Mentions Légales Facturation Électronique 2026 (PPF / Factur-X) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <ShieldCheck size={14} className="text-blue-600" />
                    <span>Conformité Facturation 2026 (PPF / EN 16931)</span>
                  </div>
                  {siretStatus === 'valid' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <Check size={11} /> Clé Luhn validée
                    </span>
                  )}
                  {siretStatus === 'invalid' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                      <AlertCircle size={11} /> {siretMsg}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Numéro SIRET (14 chiffres)
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={newSiret}
                      onChange={(e) => handleSiretChange(e.target.value)}
                      placeholder="ex: 54205118000017"
                      className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-mono font-medium outline-none transition-colors ${
                        siretStatus === 'valid' ? 'border-emerald-500 focus:ring-emerald-500' :
                        siretStatus === 'invalid' ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      N° TVA Intracommunautaire
                    </label>
                    <input
                      type="text"
                      value={newVatNumber}
                      onChange={(e) => setNewVatNumber(e.target.value.toUpperCase())}
                      placeholder="ex: FR59542051180"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Notes internes (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes sur les besoins ou particularités du client..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {!isAuthenticated && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500 shrink-0" />
                  <span>
                    Vous êtes en mode démo. La connexion vous sera demandée pour enregistrer ce client dans votre entreprise.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} />
                      Enregistrer et associer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal d'authentification requise au bon moment */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title="Connectez-vous pour ajouter ce client"
        description="Ce client sera sauvegardé dans votre espace entreprise de manière permanente pour tous vos devis et factures."
      />
    </div>
  );
};
