// src/components/admin/RichTextEditor.tsx
// Éditeur visuel WYSIWYG & enrichi pour les descriptions d'événements :
// - Alignement Justifié automatique et personnalisable
// - Choix de tailles (Normal, Grand, Titre)
// - Palette de couleurs (Or MDIV, Blanc, Émeraude, Alerte, Muted)
// - Mise en valeur d'éléments importants (Badges / Blocs dorés)
// - Listes à puces et listes numérotées
// - Aperçu en direct intégré

import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignJustify, 
  AlignLeft, 
  AlignCenter, 
  List, 
  ListOrdered, 
  Heading, 
  Palette, 
  Sparkles, 
  Eye, 
  Code, 
  Undo, 
  Redo, 
  Eraser,
  Type
} from 'lucide-react';
import EventDescriptionExpandable from '@/components/events/EventDescriptionExpandable';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = "Rédigez la description de l'événement...",
  required = false,
  minHeight = "180px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'html'>('editor');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  // Synchronisation initiale du contenu dans l'élément contenteditable
  useEffect(() => {
    if (editorRef.current && activeTab === 'editor') {
      const currentHtml = editorRef.current.innerHTML;
      if (currentHtml !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, activeTab]);

  // Commande d'exécution format
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, arg);
      handleInput();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Insertion d'un bloc de mise en avant "Important"
  const insertImportantBlock = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      const selectedText = selection && selection.toString().trim() 
        ? selection.toString() 
        : "Élément important à retenir";
      
      const blockHtml = `<div style="background-color: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 10px 14px; border-radius: 6px; margin: 10px 0; color: #f8fafc; font-weight: 500;"><strong>★ IMPORTANT :</strong> ${selectedText}</div><p></p>`;
      document.execCommand('insertHTML', false, blockHtml);
      handleInput();
    }
  };

  // Application de la couleur
  const applyColor = (hex: string) => {
    executeCommand('foreColor', hex);
    setShowColorPicker(false);
  };

  // Application de la taille
  const applySize = (tag: string, styleAttr?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (styleAttr) {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : "";
        if (selectedText) {
          const styledHtml = `<span style="${styleAttr}">${selectedText}</span>`;
          document.execCommand('insertHTML', false, styledHtml);
        }
      } else {
        executeCommand('formatBlock', tag);
      }
      handleInput();
    }
    setShowSizePicker(false);
  };

  // Définition par défaut du style justifié
  const setJustify = () => {
    executeCommand('justifyFull');
  };

  const colors = [
    { label: "Or MDIV", hex: "#d4af37", bg: "bg-[#d4af37]" },
    { label: "Blanc", hex: "#ffffff", bg: "bg-white" },
    { label: "Émeraude", hex: "#10b981", bg: "bg-emerald-500" },
    { label: "Rouge", hex: "#ef4444", bg: "bg-red-500" },
    { label: "Bleu Ciel", hex: "#38bdf8", bg: "bg-sky-400" },
    { label: "Gris Atténué", hex: "#94a3b8", bg: "bg-slate-400" },
  ];

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold block">
            {label} {required && <span className="text-red-400">*</span>}
          </label>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                activeTab === 'editor' 
                  ? 'bg-gold/20 text-gold font-bold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Éditeur
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2 py-0.5 rounded-sm flex items-center gap-1 transition-colors ${
                activeTab === 'preview' 
                  ? 'bg-gold/20 text-gold font-bold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye size={11} /> Aperçu public
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`px-2 py-0.5 rounded-sm flex items-center gap-1 transition-colors ${
                activeTab === 'html' 
                  ? 'bg-gold/20 text-gold font-bold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code size={11} /> HTML
            </button>
          </div>
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden bg-card/60 shadow-xs focus-within:border-gold/60 transition-colors">
        {/* BARRE D'OUTILS RICH TEXT */}
        {activeTab === 'editor' && (
          <div className="flex flex-wrap items-center gap-1 p-1.5 bg-muted/40 border-b border-border/80 text-foreground text-xs select-none">
            {/* Gras, Italique, Souligné */}
            <div className="flex items-center bg-card/70 border border-border/50 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                className="p-1.5 rounded hover:bg-muted/70 text-foreground transition-colors cursor-pointer"
                title="Gras (Ctrl+B)"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                className="p-1.5 rounded hover:bg-muted/70 text-foreground transition-colors cursor-pointer"
                title="Italique (Ctrl+I)"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('underline')}
                className="p-1.5 rounded hover:bg-muted/70 text-foreground transition-colors cursor-pointer"
                title="Souligné (Ctrl+U)"
              >
                <Underline size={13} />
              </button>
            </div>

            <div className="h-4 w-px bg-border/80 mx-0.5" />

            {/* Alignement : Justifié prioritaire */}
            <div className="flex items-center bg-card/70 border border-border/50 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={setJustify}
                className="p-1.5 rounded bg-gold/15 text-gold font-semibold hover:bg-gold/25 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                title="Texte Justifié (Recommandé pour un rendu harmonieux)"
              >
                <AlignJustify size={13} />
                <span className="hidden sm:inline text-[10px]">Justifier</span>
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyLeft')}
                className="p-1.5 rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Aligner à gauche"
              >
                <AlignLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyCenter')}
                className="p-1.5 rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Centrer"
              >
                <AlignCenter size={13} />
              </button>
            </div>

            <div className="h-4 w-px bg-border/80 mx-0.5" />

            {/* Listes à puces & numérotées */}
            <div className="flex items-center bg-card/70 border border-border/50 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => executeCommand('insertUnorderedList')}
                className="p-1.5 rounded hover:bg-muted/70 text-foreground transition-colors cursor-pointer"
                title="Liste à puces"
              >
                <List size={13} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertOrderedList')}
                className="p-1.5 rounded hover:bg-muted/70 text-foreground transition-colors cursor-pointer"
                title="Liste numérotée"
              >
                <ListOrdered size={13} />
              </button>
            </div>

            <div className="h-4 w-px bg-border/80 mx-0.5" />

            {/* Sélecteur de Taille de Texte */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSizePicker(!showSizePicker)}
                className="px-2 py-1 rounded-lg bg-card/70 border border-border/50 hover:bg-muted/70 text-foreground transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                title="Changer la taille du texte"
              >
                <Type size={12} className="text-gold" />
                <span>Taille</span>
              </button>

              {showSizePicker && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl p-1 z-30 min-w-[140px] space-y-0.5 animate-scale-in">
                  <button
                    type="button"
                    onClick={() => applySize('h4')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gold/15 hover:text-gold text-xs font-bold transition-colors"
                  >
                    Grand Titre (H4)
                  </button>
                  <button
                    type="button"
                    onClick={() => applySize('', 'font-size: 16px; font-weight: 600;')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gold/15 hover:text-gold text-xs font-semibold transition-colors"
                  >
                    Moyenne (16px)
                  </button>
                  <button
                    type="button"
                    onClick={() => applySize('p')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gold/15 hover:text-gold text-xs transition-colors"
                  >
                    Normal (14px)
                  </button>
                  <button
                    type="button"
                    onClick={() => applySize('', 'font-size: 12px;')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gold/15 hover:text-gold text-[11px] text-muted-foreground transition-colors"
                  >
                    Petite (12px)
                  </button>
                </div>
              )}
            </div>

            {/* Sélecteur de Couleur */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="px-2 py-1 rounded-lg bg-card/70 border border-border/50 hover:bg-muted/70 text-foreground transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                title="Couleur du texte"
              >
                <Palette size={12} className="text-gold" />
                <span className="hidden sm:inline">Couleur</span>
              </button>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl p-2 z-30 grid grid-cols-3 gap-1.5 min-w-[170px] animate-scale-in">
                  {colors.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => applyColor(c.hex)}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-muted/60 text-[10.5px] transition-colors text-left"
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${c.bg} border border-border/60 shrink-0`} />
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton Élément Important / Badge */}
            <button
              type="button"
              onClick={insertImportantBlock}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              title="Encadrer le texte sélectionné comme élément important"
            >
              <Sparkles size={12} />
              <span>Important</span>
            </button>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => executeCommand('undo')}
                className="p-1 rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                title="Annuler (Ctrl+Z)"
              >
                <Undo size={12} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('redo')}
                className="p-1 rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                title="Rétablir (Ctrl+Y)"
              >
                <Redo size={12} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('removeFormat')}
                className="p-1 rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                title="Effacer le formatage"
              >
                <Eraser size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ZONE D'ÉDITION WYSIWYG */}
        {activeTab === 'editor' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-3.5 text-sm text-foreground leading-relaxed text-justify [text-align-last:left] focus:outline-none overflow-y-auto max-h-[360px] select-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:text-base [&_h4]:mt-3 [&_h4]:mb-1"
          />
        )}

        {/* ONGLET APERÇU EN DIRECT DU RENDU PUBLIC */}
        {activeTab === 'preview' && (
          <div className="p-4 bg-background/50 overflow-y-auto max-h-[360px]">
            <div className="text-[10px] uppercase font-bold tracking-wider text-gold mb-2 flex items-center gap-1">
              <Eye size={12} /> Aperçu carte publique (Texte justifié & Limité à 6 lignes avec chevron) :
            </div>
            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm max-w-lg mx-auto">
              <EventDescriptionExpandable description={value} maxLines={6} />
            </div>
          </div>
        )}

        {/* ONGLET CODE HTML SOURCE */}
        {activeTab === 'html' && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight }}
            placeholder="Code HTML de la description..."
            className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 border-none focus:outline-none resize-y"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
        <span>Le texte est automatiquement justifié. Utilisez la barre d'outils pour varier tailles, couleurs et listes.</span>
        <span>{value ? `${value.replace(/<[^>]*>/g, '').length} car.` : '0 car.'}</span>
      </div>
    </div>
  );
}

