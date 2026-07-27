import re

with open('src/pages/EventReplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The second section starts with:
# {/* Défilement Automatique Vidéos - Section 2 : Ambiance & Masterclass (Marquee Normal) */}
# And it is contained within a `<div className="mb-16">...</div>`
# Then the next section is `{/* ── Galerie Photos ── */}`

# Regex to capture and remove the second section
search_pattern = r'\{\/\* Défilement Automatique Vidéos - Section 2 : Ambiance & Masterclass \(Marquee Normal\) \*\/\}\s*<div className=\"mb-16\">.*?<\/div>\s*<\/div>\s*(?=\{\/\* ── Galerie Photos)'
content = re.sub(search_pattern, '', content, flags=re.DOTALL)

with open('src/pages/EventReplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
