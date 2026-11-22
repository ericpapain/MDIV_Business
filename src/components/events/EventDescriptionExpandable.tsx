// src/components/events/EventDescriptionExpandable.tsx
// Rendu typographique de la description d'événement : texte justifié, support HTML enrichi,
// limitation à 6 lignes avec fondu dégradé et chevron central animé pour déplier / replier.

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DOMPurify from 'dompurify';

interface EventDescriptionExpandableProps {
  description?: string | null;
  maxLines?: number;
  isEn?: boolean;
  className?: string;
}

export default function EventDescriptionExpandable({
  description = '',
  maxLines = 6,
  isEn = false,
  className = ''
}: EventDescriptionExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsClamping, setNeedsClamping] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const cleanHtml = useMemo(() => {
    if (!description || !description.trim()) return '';

    let content = description.trim();

    // Décodage si le texte est sous forme d'entités HTML échappées (&lt;div...&gt;)
    if (/&lt;\/?[a-z]/i.test(content)) {
      if (typeof document !== 'undefined') {
        const txt = document.createElement('textarea');
        txt.innerHTML = content;
        content = txt.value;
      } else {
        content = content
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');
      }
    }

    // Détection si c'est du HTML ou du texte brut
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(content);

    if (hasHtmlTags) {
      // Nettoyage sécurisé du HTML avec styles autorisés (couleurs, alignement justifié, encadrés)
      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 
          'ul', 'ol', 'li', 'h3', 'h4', 'h5', 'h6', 'div', 'blockquote', 'hr', 'font', 'a'
        ],
        ALLOWED_ATTR: ['style', 'class', 'color', 'href', 'target', 'rel']
      });
    }

    // Si texte brut : conversion des sauts de ligne en HTML propre
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .split(/\n{2,}/)
      .map(p => `<p class="mb-2.5">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }, [description]);

  // Mesure pour savoir si le texte dépasse 6 lignes
  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        // En mode plié, scrollHeight est plus grand que clientHeight si le texte dépasse
        const isOverflowing = contentRef.current.scrollHeight > contentRef.current.clientHeight + 8;
        setNeedsClamping(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [cleanHtml, maxLines]);

  if (!description || !description.trim()) {
    return null;
  }

  return (
    <div className={`w-full my-2 ${className}`}>
      {/* Zone de texte justifié avec limitation de hauteur en mode plié */}
      <div className="relative">
        <div
          ref={contentRef}
          style={
            !isExpanded
              ? {
                  maxHeight: `${maxLines * 1.55}rem`,
                  overflow: 'hidden'
                }
              : {
                  maxHeight: 'none'
                }
          }
          className="text-sm text-muted-foreground leading-relaxed text-justify [text-align-last:left] [hyphens:auto] transition-all duration-300 break-words space-y-2 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_strong]:text-foreground [&_b]:text-foreground [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:text-base [&_h4]:mt-3 [&_h4]:mb-1"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />

        {/* Dégradé de fondu progressif si le texte est tronqué */}
        {needsClamping && !isExpanded && (
          <div 
            className="pointer-events-none absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-card via-card/75 to-transparent transition-opacity duration-300"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Bouton avec Chevron Central clignotant / rebondissant pour déplier ou replier */}
      {needsClamping && (
        <div className="flex flex-col items-center justify-center pt-2 pb-1 relative z-10">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold/60 text-gold hover:text-gold-light text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            aria-expanded={isExpanded}
            title={isExpanded ? (isEn ? "Collapse text" : "Réduire la description") : (isEn ? "Read more" : "Lire la suite de la description")}
          >
            <span>
              {isExpanded ? (isEn ? "Réduire" : "Réduire") : (isEn ? "Lire la suite" : "Lire la suite")}
            </span>
            {isExpanded ? (
              <ChevronUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown size={14} className="animate-bounce transition-transform group-hover:translate-y-0.5 text-amber-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

