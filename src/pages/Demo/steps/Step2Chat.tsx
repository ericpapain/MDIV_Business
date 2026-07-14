import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEMO_CHAT_MESSAGES, AUDIT_CHAT_MESSAGES } from '../../../data/mockDemoData';
import { Bot, User, ArrowRight } from 'lucide-react';
import { DemoType } from '../DemoFlow';

interface Props {
  onNext: () => void;
  demoType: DemoType;
}

export function Step2Chat({ onNext, demoType }: Props) {
  const sourceMessages = demoType === 'network' ? DEMO_CHAT_MESSAGES : AUDIT_CHAT_MESSAGES;
  
  const [messages, setMessages] = useState<typeof sourceMessages>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (currentIndex < sourceMessages.length) {
      const nextMsg = sourceMessages[currentIndex];
      
      const timer = setTimeout(() => {
        if (nextMsg.sender === 'aria') setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, nextMsg]);
          setCurrentIndex(prev => prev + 1);
        }, nextMsg.sender === 'aria' ? 1500 : 500);
        
      }, nextMsg.delay - (currentIndex > 0 ? sourceMessages[currentIndex - 1].delay : 0));
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, sourceMessages]);

  const allMessagesDone = currentIndex === sourceMessages.length;

  return (
    <div className="w-full max-w-3xl flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-20 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'aria' ? 'bg-indigo-600' : 'bg-neutral-700'
              }`}>
                {msg.sender === 'aria' ? <Bot size={18} className="text-white" /> : <User size={18} className="text-white" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 text-[15px] leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-neutral-800 text-white rounded-tr-sm' 
                  : 'bg-neutral-900/80 border border-neutral-800 text-neutral-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
              <motion.div className="w-2 h-2 bg-neutral-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
              <motion.div className="w-2 h-2 bg-neutral-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
              <motion.div className="w-2 h-2 bg-neutral-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {allMessagesDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={onNext}
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-400"
            >
              {demoType === 'network' ? 'Générer mon programme' : 'Générer mon Audit Flash'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -z-10 rounded-full blur-md bg-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
