import React, { useState, useEffect } from 'react';
import { Save, X, CheckCircle2, Loader2, FolderKanban, Tag, FileText, User } from 'lucide-react';
import { ClientSelectWithCreate } from '@/components/clients/ClientSelectWithCreate';
import { saveWork, SavedWorkItem } from '@/lib/savedWorkService';
import { Client, fetchClients } from '@/lib/quoteService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SaveWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolType: string;
  defaultTitle: string;
  contentPayload: any;
  summary?: string;
  currentVersion?: number;
  initialClientId?: string;
  onSavedSuccess?: (savedItem: SavedWorkItem) => void;
}

export const SaveWorkModal: React.FC<SaveWorkModalProps> = ({
  isOpen,
  onClose,
  toolType,
  defaultTitle,
  contentPayload,
  summary,
  currentVersion = 1,
  initialClientId = '',
  onSavedSuccess,
}) => {
  const { company, token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId);
  const [title, setTitle] = useState(defaultTitle);
  const [projectName, setProjectName] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setSelectedClientId(initialClientId);
      setIsSuccess(false);
      loadClients();
    }
  }, [isOpen, defaultTitle, initialClientId]);

  const loadClients = async () => {
    try {
      const list = await fetchClients(company?.id);
      setClients(list);
    } catch {}
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Veuillez donner un titre à ce travail.");
      return;
    }

    setIsSaving(true);
    try {
      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
      const clientName = selectedClient ? `${selectedClient.name} (${selectedClient.company})` : 'Client général';

      const saved = await saveWork({
        company_id: company?.id || 1,
        client_id: selectedClientId || null,
        client_name: clientName,
        project_name: projectName.trim() || null,
        tool_type: toolType,
        title: title.trim(),
        summary: summary || '',
        content_payload: contentPayload,
        version: currentVersion,
        tags,
      }, company?.id, token);

      setIsSuccess(true);
      toast.success("Enregistré avec succès dans l'historique !");
      if (onSavedSuccess) onSavedSuccess(saved);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-400/30">
              <Save className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Sauvegarder dans l'historique</h3>
              <p className="text-xs text-slate-300">Rattacher ce travail à un client ou projet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Titre du travail */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Titre du document / travail <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Compte-rendu cadrage, Devis Plomberie..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Association Client */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Client / Prospect associé
            </label>
            <ClientSelectWithCreate
              clients={clients}
              selectedClientId={selectedClientId}
              onSelectClient={(id) => setSelectedClientId(id)}
              onClientCreated={(newC) => {
                setClients(prev => [newC, ...prev]);
                setSelectedClientId(String(newC.id));
              }}
              companyId={company?.id}
              token={token}
              disabled={isSaving}
            />
          </div>

          {/* Projet / Chantier optionnel */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
              Projet / Chantier (Optionnel)
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: Rénovation Siège, Déploiement IA 2026..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              Mots-clés / Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ajouter un tag (Entrée)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Ajouter
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-blue-900 text-[10px]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving || isSuccess}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde en cours...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Confirmer l'enregistrement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
