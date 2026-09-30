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
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ClientSelectWithCreateProps {
  selectedClientId?: string | number | null;
  onSelectClient: (client: Client | null) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const ClientSelectWithCreate: React.FC<ClientSelectWithCreateProps> = ({
  selectedClientId,
  onSelectClient,
  label = "Client associé",
  required = false,
  placeholder = "Sélectionner un client...",
  className = ""
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
  const [newNotes, setNewNotes] = useState('');

  // Fetch clients on mount and when company changes
  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const data = await fetchClients(company?.id);
      setClients(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des clients:", err);
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

  const handleClientSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!newName.trim()) {
      toast.error("Veuillez saisir le nom du contact.");
      return;
    }

    // Si non connecté, afficher l'interface d'authentification sans perdre les données
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const newClient = await createClient(
        {
          name: newName.trim(),
          company: newCompany.trim() || newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          address: newAddress.trim(),
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
    <div className={`relative ${className}`}>
      {/* Label and "+ Nouveau client" button */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Building2 size={16} className="text-gold" />
          {label} {required && <span className="text-gold">*</span>}
        </label>
        
        <button
          type="button"
          onClick={handleOpenCreate}
          id="btn-add-new-client"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/40 rounded-lg transition-all shadow-sm hover:scale-[1.02]"
        >
          <UserPlus size={13} />
          + Nouveau client
        </button>
      </div>

      {/* Selected Client Display or Select Trigger */}
      {selectedClient ? (
        <div className="flex items-center justify-between p-3.5 bg-[#121624]/90 border border-gold/40 rounded-xl shadow-inner group hover:border-gold transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm">
              {selectedClient.company?.charAt(0) || selectedClient.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                {selectedClient.company || selectedClient.name}
                <span className="text-[10px] bg-gold/20 text-gold border border-gold/30 px-1.5 py-0.5 rounded-full">
                  Client sélectionné
                </span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-3 mt-0.5">
                <span>Contact : {selectedClient.name}</span>
                {selectedClient.email && <span>• {selectedClient.email}</span>}
                {selectedClient.phone && <span>• {selectedClient.phone}</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectClient(null)}
            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Désélectionner"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-3 bg-[#0d101a] border border-gray-700/60 rounded-xl text-left text-sm text-gray-300 hover:border-gold/50 focus:outline-none focus:border-gold transition-colors"
          >
            <span className={selectedClient ? "text-white" : "text-gray-400"}>
              {placeholder}
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-40 w-full mt-2 bg-[#121624] border border-gold/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {/* Search Bar */}
              <div className="p-2 border-b border-gray-800 flex items-center gap-2 bg-[#0d101a]/80">
                <Search size={14} className="text-gray-400 ml-1" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, entreprise, email..."
                  className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none py-1"
                  autoFocus
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white p-1">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Client List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-800/40">
                {isLoadingClients ? (
                  <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin text-gold" />
                    Chargement des clients...
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 mb-2">Aucun client trouvé.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleOpenCreate();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline font-medium"
                    >
                      <UserPlus size={13} />
                      Créer ce client maintenant
                    </button>
                  </div>
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
                      className="w-full text-left p-3 hover:bg-gold/10 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-gold transition-colors">
                          {client.company || client.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {client.name} {client.email ? `• ${client.email}` : ''}
                        </div>
                      </div>
                      {String(selectedClientId) === String(client.id) && (
                        <Check size={16} className="text-gold" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer with "+ Nouveau client" */}
              <div className="p-2 border-t border-gray-800 bg-[#0d101a]/90 flex justify-between items-center">
                <span className="text-[11px] text-gray-400 px-2">
                  {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleOpenCreate();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-gold text-black rounded-lg hover:bg-gold/90 transition-all"
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
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="relative w-full max-w-lg bg-[#121624] border border-gold/40 rounded-3xl p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white my-auto max-h-[92vh] overflow-y-auto transform-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-white">
                  Ajouter un nouveau client
                </h3>
                <p className="text-xs text-gray-400">
                  Créez la fiche client et associez-la immédiatement à ce document.
                </p>
              </div>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Nom du contact <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="w-full bg-[#0d101a] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Entreprise / Raison sociale
                  </label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="ex: SAS Dupont Immobilier"
                    className="w-full bg-[#0d101a] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email professionnel
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="contact@dupont.fr"
                      className="w-full bg-[#0d101a] border border-gray-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full bg-[#0d101a] border border-gray-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Adresse postale
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="12 Avenue Montaigne, 75008 Paris"
                    className="w-full bg-[#0d101a] border border-gray-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Notes internes (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes sur les besoins ou particularités du client..."
                  className="w-full bg-[#0d101a] border border-gray-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold resize-y min-h-[70px]"
                />
              </div>

              {!isAuthenticated && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400 shrink-0" />
                  <span>
                    Vous êtes en mode démo. La connexion vous sera demandée pour enregistrer ce client dans votre entreprise.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-black font-semibold text-xs rounded-xl shadow-lg hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
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
