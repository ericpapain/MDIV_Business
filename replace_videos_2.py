import re

with open('src/pages/EventReplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Modal logic to handle youtube iframes
modal_search = r'(<div className=\"relative w-full max-w-6xl aspect-video rounded-sm overflow-hidden\">\s*)<video\s*autoPlay\s*controls\s*className=\"w-full h-full object-contain\"\s*src=\{activeVideo\}\s*\/>(\s*<\/div>)'
modal_replace = r'''\1{activeVideo.includes('youtube.com') ? (
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
              autoPlay 
              controls 
              className="w-full h-full object-contain"
              src={activeVideo}
            />
          )}\2'''

content = re.sub(modal_search, modal_replace, content)

# 2. Replace the hardcoded marquee with a dynamic one
marquee_search = r'<div className=\"relative w-full overflow-hidden rounded-sm py-2\">\s*<div className=\"flex w-max animate-marquee-reverse gap-4 md:gap-8 items-center\">.*?(?=<div className=\"absolute inset-y-0 left-0 w-20)'

marquee_data = '''
const immersionVideos = [
  { id: 'KMZT7eYhURA', title: 'Cerise', desc: 'LA FORCE DE LA DIVERSITÉ DES PROFILS' },
  { id: 'Kvlq85gxpdY', title: 'Témoignage', desc: "L'ÉCOSYSTÈME UNE RÉELLE OPPORTUNITÉ" },
  { id: 'Ycsw4STiU_I', title: 'Micke', desc: 'LA NAISSANCE DU BNE' },
  { id: 'dJAelLe1ZmY', title: 'Olivier', desc: "L'IMPORTANCE DU RÉSEAU" },
  { id: 'X8kX2YtiDuA', title: 'Partenaire', desc: 'FOCUS PARTENAIRE' },
];
'''

marquee_jsx = r'''<div className="relative w-full overflow-hidden rounded-sm py-2">
            <div className="flex w-max animate-marquee-reverse gap-4 md:gap-8 items-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 md:gap-8 shrink-0">
                  {immersionVideos.map((vid) => (
                    <div 
                      key={vid.id}
                      className="relative overflow-hidden rounded-sm aspect-[9/16] w-[180px] md:w-[240px] shrink-0 group border border-white/5 cursor-pointer"
                      onClick={() => setActiveVideo(`https://www.youtube.com/shorts/${vid.id}`)}
                    >
                      <div className="absolute inset-0 w-full h-full bg-zinc-900 transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                          <Play className="text-white ml-1" size={24} />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-sm font-display mb-1">{vid.title}</div>
                        <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest leading-tight">{vid.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
'''

content = re.sub(marquee_search, marquee_jsx, content, flags=re.DOTALL)

if 'const immersionVideos = [' not in content:
    content = content.replace('  return (', marquee_data + '\n  return (')

with open('src/pages/EventReplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
