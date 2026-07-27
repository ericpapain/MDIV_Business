import re

with open('src/pages/EventReplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reduce padding of the section
content = content.replace('section className="container py-24"', 'section className="container py-12"')
content = content.replace('mb-12 gap-4', 'mb-8 gap-4')

# Reduce text sizes of headers slightly
content = content.replace('font-display text-4xl md:text-5xl mb-2', 'font-display text-3xl md:text-4xl mb-2')
content = content.replace('font-display text-2xl md:text-3xl text-white/90', 'font-display text-xl md:text-2xl text-white/90')

# Reduce the size of the video cards
content = content.replace('aspect-[9/16] w-[180px] md:w-[240px]', 'aspect-[9/16] w-[140px] md:w-[180px]')

# Reduce the play button size
content = content.replace('w-16 h-16 rounded-full', 'w-10 h-10 rounded-full')
content = content.replace('size={24}', 'size={18}')

with open('src/pages/EventReplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
