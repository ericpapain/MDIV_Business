// src/components/admin/events/CustomFieldsBuilder.tsx
// Constructeur visuel de questions sur-mesure (13 types de champs supportés)

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventCustomField, CustomFieldType, FieldOption } from '@/types/eventEngine';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X, 
  HelpCircle, Sparkles, FileText, List, CheckSquare, 
  Image, Paperclip, Link as LinkIcon, Calendar, Hash, Phone, Mail, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface CustomFieldsBuilderProps {
  eventId: number;
  fields?: EventCustomField[];
  onFieldsChange?: (updatedFields: EventCustomField[]) => void;
}

const FIELD_TYPE_LABELS: Record<CustomFieldType, { label: string; icon: any }> = {
  text: { label: "Texte court", icon: FileText },
  textarea: { label: "Texte long / Paragraphe", icon: FileText },
  email: { label: "Adresse e-mail", icon: Mail },
  phone: { label: "Téléphone", icon: Phone },
  number: { label: "Nombre / Chiffre", icon: Hash },
  date: { label: "Date", icon: Calendar },
  select: { label: "Liste déroulante", icon: List },
  checkbox_group: { label: "Choix multiple (cases à cocher)", icon: CheckSquare },
  radio: { label: "Choix unique (boutons radio)", icon: CheckSquare },
  checkbox: { label: "Case à cocher unique (Oui/Non)", icon: CheckSquare },
  url: { label: "Lien web / URL", icon: LinkIcon },
  file: { label: "Fichier joint (PDF, document)", icon: Paperclip },
  photo: { label: "Photo / Image", icon: Image },
};

export function CustomFieldsBuilder({ eventId, fields: controlledFields, onFieldsChange }: CustomFieldsBuilderProps) {
  const [editingField, setEditingField] = useState<Partial<EventCustomField> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");

  const queryClient = useQueryClient();

  // Mode autonome si les fields ne sont pas passés en props
  const { data: remoteFields = [], isLoading } = useQuery({
    queryKey: ['custom-fields', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_custom_fields&event_id=${eventId}`);
      const json = await res.json();
      return json.data || [];
    },
    enabled: controlledFields === undefined && !!eventId,
  });

  const fields: EventCustomField[] = controlledFields !== undefined ? (controlledFields || []) : (remoteFields || []);

  const saveMutation = useMutation({
    mutationFn: async (fieldData: Partial<EventCustomField>) => {
      const res = await fetch('/api/event_engine.php?action=save_custom_field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, field: fieldData }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success("Question enregistrée avec succès !");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la sauvegarde.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (fieldId: number) => {
      const res = await fetch('/api/event_engine.php?action=delete_custom_field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, field_id: fieldId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success("Question supprimée du formulaire.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur de suppression.");
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: number[]) => {
      const res = await fetch('/api/event_engine.php?action=reorder_custom_fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, ordered_ids: orderedIds }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields', eventId] });
    }
  });

  const handleOpenAddModal = () => {
    setEditingField({
      event_id: eventId,
      field_key: `field_${Date.now()}`,
      label: "",
      description: "",
      field_type: "text",
      is_required: false,
      placeholder: "",
      options: [],
      is_active: true,
      sort_order: (fields?.length || 0) + 1
    });
    setNewOptionText("");
    setIsModalOpen(true);
  };

  const handleEditField = (field: EventCustomField) => {
    setEditingField({ ...field, options: field.options ? [...field.options] : [] });
    setNewOptionText("");
    setIsModalOpen(true);
  };

  const handleDeleteField = (index: number) => {
    const targetField = fields[index];
    if (onFieldsChange) {
      const updated = fields.filter((_, idx) => idx !== index);
      onFieldsChange(updated);
      toast.success("Question supprimée du formulaire.");
    } else if (targetField?.id) {
      deleteMutation.mutate(targetField.id);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Réassignation du sort_order
    updated.forEach((f, idx) => { f.sort_order = idx + 1; });

    if (onFieldsChange) {
      onFieldsChange(updated);
    } else {
      const ids = updated.map(f => f.id).filter(Boolean) as number[];
      if (ids.length > 0) reorderMutation.mutate(ids);
    }
  };

  const handleSaveModal = () => {
    if (!editingField?.label?.trim()) {
      toast.error("Veuillez saisir le libellé de la question.");
      return;
    }

    const fieldKey = editingField.field_key || editingField.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const finalField: EventCustomField = {
      event_id: eventId,
      field_key: fieldKey,
      label: editingField.label.trim(),
      description: editingField.description || "",
      field_type: editingField.field_type || "text",
      is_required: !!editingField.is_required,
      placeholder: editingField.placeholder || "",
      default_value: editingField.default_value || "",
      options: editingField.options || [],
      validation_rules: editingField.validation_rules || {},
      conditional_logic: editingField.conditional_logic,
      sort_order: editingField.sort_order || (fields.length + 1),
      is_active: editingField.is_active !== undefined ? editingField.is_active : true,
      id: editingField.id
    };

    if (onFieldsChange) {
      let updated: EventCustomField[];
      const existingIdx = fields.findIndex(f => f.field_key === finalField.field_key || (finalField.id && f.id === finalField.id));
      if (existingIdx !== -1) {
        updated = [...fields];
        updated[existingIdx] = finalField;
      } else {
        updated = [...fields, finalField];
      }
      onFieldsChange(updated);
      toast.success("Question enregistrée avec succès !");
    } else {
      saveMutation.mutate(finalField);
    }

    setIsModalOpen(false);
    setEditingField(null);
  };

  const addOptionToEditingField = () => {
    if (!newOptionText.trim() || !editingField) return;
    const currentOptions = editingField.options || [];
    const val = newOptionText.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setEditingField({
      ...editingField,
      options: [...currentOptions, { label: newOptionText.trim(), value: val }]
    });
    setNewOptionText("");
  };

  const removeOptionFromEditingField = (optIdx: number) => {
    if (!editingField || !editingField.options) return;
    setEditingField({
      ...editingField,
      options: editingField.options.filter((_, idx) => idx !== optIdx)
    });
  };

  const needsOptions = editingField && ['select', 'radio', 'checkbox_group'].includes(editingField.field_type || '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <List className="text-amber-400" size={18} />
            Constructeur de Formulaire d'Inscription
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configurez les questions additionnelles posées aux participants lors de leur inscription en ligne.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenAddModal}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow px-4 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} /> + Nouveau champ
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center gap-2 text-xs text-muted-foreground">
          <Loader2 size={16} className="animate-spin text-amber-400" /> Chargement des champs...
        </div>
      ) : fields.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl p-6 bg-muted/10">
          <HelpCircle className="mx-auto text-muted-foreground mb-2" size={32} />
          <h4 className="text-sm font-semibold text-foreground">Aucune question personnalisée</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Par défaut, le formulaire demande : Nom, Prénom, E-mail, Téléphone, Entreprise, Poste et Photo. Vous pouvez ajouter des questions sur-mesure ici.
          </p>
          <Button
            type="button"
            onClick={handleOpenAddModal}
            variant="outline"
            className="text-xs rounded-xl border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
          >
            <Plus size={14} className="mr-1" /> Créer la première question
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => {
            const typeInfo = FIELD_TYPE_LABELS[field.field_type] || { label: field.field_type, icon: FileText };
            const Icon = typeInfo.icon;

            return (
              <div 
                key={field.field_key || idx}
                className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-amber-500/40 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 font-mono text-xs">
                    {idx + 1}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate">{field.label}</span>
                      {field.is_required && (
                        <Badge variant="outline" className="text-[9px] text-red-400 border-red-500/20 bg-red-500/5 px-1.5 py-0">
                          Obligatoire
                        </Badge>
                      )}
                      {!field.is_active && (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground">
                          Désactivé
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="text-amber-300/80">{typeInfo.label}</span>
                      {field.options && field.options.length > 0 && (
                        <span>• {field.options.length} option(s)</span>
                      )}
                      {field.description && (
                        <span className="truncate max-w-xs text-slate-400">• {field.description}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions de réordonnancement et édition */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                    title="Monter"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === fields.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                    title="Descendre"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditField(field)}
                    className="p-1.5 text-muted-foreground hover:text-amber-400 cursor-pointer"
                    title="Modifier"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteField(idx)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'ajout / édition de question */}
      {isModalOpen && editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-scale-in">
            <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="text-amber-400" size={18} />
              {editingField.id ? "Modifier la Question" : "Ajouter une Question au Formulaire"}
            </h3>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Type de champ */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Type de réponse attendue *
                </label>
                <select
                  value={editingField.field_type || "text"}
                  onChange={(e) => setEditingField({ ...editingField, field_type: e.target.value as CustomFieldType })}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                >
                  {Object.entries(FIELD_TYPE_LABELS).map(([type, meta]) => (
                    <option key={type} value={type}>{meta.label}</option>
                  ))}
                </select>
              </div>

              {/* Libellé question */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Question / Intitulé du champ *
                </label>
                <input
                  type="text"
                  name="custom_field_label"
                  required
                  placeholder="Ex: Quel est votre objectif principal pour cette journée ?"
                  value={editingField.label || ""}
                  onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Description / Aide */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Indication ou note explicative (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cela nous permettra de vous placer sur la bonne table."
                  value={editingField.description || ""}
                  onChange={(e) => setEditingField({ ...editingField, description: e.target.value })}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Options pour select / radio / checkbox_group */}
              {needsOptions && (
                <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
                  <label className="block text-xs font-semibold text-foreground">
                    Options de choix possibles *
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nouvelle option (ex: BTP & Artisanat)"
                      value={newOptionText}
                      onChange={(e) => setNewOptionText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOptionToEditingField(); } }}
                      className="flex-1 bg-background border border-input rounded-xl px-3 py-1.5 text-xs text-foreground"
                    />
                    <Button
                      type="button"
                      onClick={addOptionToEditingField}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-xl px-3"
                    >
                      Ajouter
                    </Button>
                  </div>

                  {editingField.options && editingField.options.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {editingField.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center justify-between bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs">
                          <span>{opt.label}</span>
                          <button
                            type="button"
                            onClick={() => removeOptionFromEditingField(oIdx)}
                            className="text-muted-foreground hover:text-red-400 p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-400/80 italic">
                      Ajoutez au moins deux options pour ce type de sélection.
                    </p>
                  )}
                </div>
              )}

              {/* Paramètres : Obligatoire & Actif */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Question obligatoire</div>
                    <div className="text-[10.5px] text-muted-foreground">Le participant devra y répondre avant de valider son inscription</div>
                  </div>
                  <Switch
                    checked={editingField.is_required || false}
                    onCheckedChange={(checked) => setEditingField({ ...editingField, is_required: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Champ actif</div>
                    <div className="text-[10.5px] text-muted-foreground">Visible sur le formulaire public</div>
                  </div>
                  <Switch
                    checked={editingField.is_active !== false}
                    onCheckedChange={(checked) => setEditingField({ ...editingField, is_active: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Actions modal */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsModalOpen(false); setEditingField(null); }}
                className="text-xs rounded-xl"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSaveModal}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow px-5"
              >
                <Check size={14} className="mr-1" />
                {editingField.id ? "Mettre à jour" : "Créer le champ"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
