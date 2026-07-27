import re

with open('src/pages/EventReplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

search_pattern = r'''<video\s+key=\{activeVideo\}\s+src=\{activeVideo\}\s+autoPlay\s+controls\s+playsInline\s+className="w-full h-full object-contain"\s+/>'''

replace_pattern = r'''{activeVideo.includes('youtube.com') ? (
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
                className="w-full h-full object-contain"
              />
            )}'''

content = re.sub(search_pattern, replace_pattern, content)

with open('src/pages/EventReplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
