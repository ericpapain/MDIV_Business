import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEMO_PROFILES, AUDIT_SOLUTIONS } from '../../../data/mockDemoData';
import { Bot, User, Send, CheckCircle2, Circle, RefreshCcw } from 'lucide-react';
import { DemoType } from '../DemoFlow';

interface Props {
  onReset: () => void;
  demoType: DemoType;
}

export function Step8End({ onReset, demoType }: Props) {
  const isNetwork = demoType === 'network';
  const initialItems = isNetwork ? DEMO_PROFILES : AUDIT_SOLUTIONS;

  const [items, setItems] = useState(initialItems);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialItems.map(i => i.id));
  
  const [messages, setMessages] = useState([
    { id: '1', sender: 'aria', text: isNetwork 
      ? 'Voici les recommandations finales. Souhaitez-vous ajuster le ciblage (ex: remplacer un profil, changer le secteur) avant validation ?' 
      : 'Voici la feuille de route technologique. Souhaitez-vous modifier une brique ou me poser des questions sur l\'intégration ?' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
    setIsTyping(true);

    // Simulate AI response and data update after delay
    setTimeout(() => {
      setIsTyping(false);
      
      let aiResponse = "";
      if (isNetwork) {
        aiResponse = "C'est noté. J'ai pris en compte vos préférences et ajusté les recommandations. J'ai ajouté un nouveau profil d'avocat fiscaliste de notre réseau privé et retiré l'architecte. Le tarif reste inchangé à 2 350€.";
        
        // Fake update of the items array
        setItems(prev => {
          const newItems = [...prev];
          const index = newItems.findIndex(i => i.name.includes("Vidal") || i.name.includes("Architecte"));
          if (index !== -1) {
            newItems[index] = {
              id: 'p7_new',
              name: 'Marc Levêque',
              role: 'Avocat Fiscaliste',
              company: 'Levêque & Associés',
              sector: 'Juridique',
              matchPercentage: 94,
              isExternal: false,
              reason: "Profil ajouté suite à votre demande. Expert en fiscalité immobilière, membre du club M.DIV depuis 2 ans.",
              avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026701b'
            };
            setSelectedIds(prevIds => [...prevIds.filter(id => id !== prev[index].id), 'p7_new']);
          }
          return newItems;
        });

      } else {
        aiResponse = "Entendu. J'ai ajusté la sélection. Plutôt qu'un agent IA pour les emails, j'ai inclus une solution de prévision des stocks qui vous fera économiser environ 15 000€ supplémentaires par an.";
        
        setItems(prev => {
          const newItems = [...prev];
          const index = newItems.findIndex(i => i.name.includes("Agent") || i.role.includes("Automatisation"));
          if (index !== -1) {
            newItems[index] = {
              id: 's4_new',
              name: 'Prévision de Stocks IA',
              role: 'Optimisation des approvisionnements',
              company: 'Technologie : Inventoro',
              sector: 'Supply Chain',
              matchPercentage: 91,
              isExternal: true,
              reason: "Solution ajoutée. Analyse vos historiques de vente pour prédire les ruptures et surstocks. ROI immédiat.",
              avatar: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c66a41?w=150&h=150&fit=crop'
            };
            setSelectedIds(prevIds => [...prevIds.filter(id => id !== prev[index].id), 's4_new']);
          }
          return newItems;
        });
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'aria', text: aiResponse }]);
    }, 2500);
  };

  return (
    <div className="w-full max-w-7xl h-full flex flex-col pt-8 pb-8 overflow-hidden">
      <div className="mb-8 flex justify-between items-end px-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Espace de Co-construction</h2>
          <p className="text-neutral-400">
            Ajustez vos choix ou discutez avec l'IA pour affiner la proposition.
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:text-foreground hover:bg-neutral-800 transition-colors"
        >
          <RefreshCcw size={14} />
          Terminer / Recommencer
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden px-4">
        {/* Left column: Chat */}
        <div className="w-1/3 flex flex-col bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="bg-neutral-800/50 p-4 border-b border-neutral-800 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-foreground" />
            </div>
            <span className="font-semibold text-sm">Assistant ARIA</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-neutral-800 text-neutral-200 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="bg-neutral-800 rounded-2xl rounded-tl-sm p-3 flex gap-1 items-center">
                  <motion.div className="w-1.5 h-1.5 bg-neutral-500 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-neutral-500 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-neutral-500 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-neutral-900/80 border-t border-neutral-800 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ex: Remplace le profil X..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-full py-3 pl-4 pr-12 text-sm text-foreground focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-1 top-1 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 rounded-full flex items-center justify-center transition-colors"
              >
                <Send size={16} className="text-foreground ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Selectable List */}
        <div className="flex-1 bg-neutral-900/20 border border-neutral-800/50 rounded-3xl p-6 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Sélection Finale ({selectedIds.length}/{items.length})</h3>
            <button className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full hover:bg-indigo-500/30 transition-colors">
              Valider la sélection
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => toggleSelection(item.id)}
                    className={`cursor-pointer flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                      isSelected 
                        ? 'bg-neutral-800/80 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                        : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 size={24} className="text-indigo-400" />
                      ) : (
                        <Circle size={24} className="text-neutral-600" />
                      )}
                    </div>
                    
                    <img 
                      src={item.avatar} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-full border-2 border-neutral-800 object-cover shrink-0 bg-neutral-800"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-base truncate pr-2">{item.name}</h4>
                        <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md shrink-0">
                          {item.matchPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mb-1">{item.role} • {item.company}</p>
                      <p className="text-xs text-neutral-500 line-clamp-1 italic">{item.reason}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
