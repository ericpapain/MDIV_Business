import re

with open('src/pages/EventReplay.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace setActiveVideo
c = re.sub(
    r'onClick=\{\(\) => setActiveVideo\("/videos/[^"]+"\)\}',
    r'onClick={() => window.open("https://www.youtube.com/@BusinessNetworkingExpérience", "_blank")}',
    c
)

# Replace local video tags with a dark zinc background
c = re.sub(
    r'<video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">\s*<source src="/videos/[^"]+" type="video/mp4" />\s*</video>',
    r'<div className="absolute inset-0 w-full h-full bg-zinc-900 transition-transform duration-1000 group-hover:scale-105" />',
    c
)

with open('src/pages/EventReplay.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
