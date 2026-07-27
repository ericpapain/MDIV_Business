import re

with open('src/pages/EventReplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add the import
if 'import { motion }' not in content:
    content = content.replace('import { useEffect, useState } from "react";', 'import { useEffect, useState } from "react";\nimport { motion } from "framer-motion";')

# 2. Replace the modal
modal_search = r'\{\/\* ── Modal Vidéo ── \*\/}.*?(?=\{\/\* ── Modal Image ── \*\/})'

new_modal = r'''{/* ── Modal Vidéo ── */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-end p-4 md:p-8">
          <div className="absolute inset-0 bg-black/20 pointer-events-none backdrop-blur-sm" />
          
          <motion.div 
            drag
            dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
            className="relative pointer-events-auto w-[280px] md:w-[320px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/20 cursor-grab active:cursor-grabbing"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
          >
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveVideo(null); }}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors pointer-events-auto"
            >
              <X size={16} />
            </button>
            <div className="w-full h-full pointer-events-auto">
              {activeVideo.includes('youtube.com') ? (
                <iframe
                  src={activeVideo.replace('/shorts/', '/embed/') + '?autoplay=1'}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <video 
                  key={activeVideo}
                  src={activeVideo} 
                  autoPlay 
                  controls 
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
      '''

content = re.sub(modal_search, new_modal, content, flags=re.DOTALL)

with open('src/pages/EventReplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
