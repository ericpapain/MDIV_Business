import re

with open('src/pages/Offers.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

search_pattern = r'<div className="luxe-card overflow-hidden rounded-2xl flex flex-col flex-1 w-full max-w-none transition-all duration-500 hover:border-gold/60 hover:-translate-y-2 lg:hover:-translate-y-4 hover:shadow-\[0_30px_80px_-30px_hsl\(42_60%_54%\/0\.4\)\]">\s*<div className="w-full h-48 relative overflow-hidden group bg-gradient-to-br from-background via-background to-gold/5 flex items-center justify-center border-b border-gold/10">'

replacement = r'''<div className="relative flex flex-col flex-1 w-full max-w-none group/card transition-all duration-700 hover:-translate-y-4">
                {/* Aura lumineuse animée (effet premium) */}
                <div className="absolute -inset-[2px] rounded-[18px] bg-gradient-to-br from-gold/60 via-gold/10 to-gold/60 opacity-0 group-hover/card:opacity-100 blur-sm transition-opacity duration-1000 group-hover/card:animate-pulse-slow" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* Conteneur principal de la carte */}
                <div className="relative h-full luxe-card overflow-hidden rounded-2xl flex flex-col flex-1 bg-[#0a0d0f]/95 backdrop-blur-2xl border border-white/10 group-hover/card:border-gold/50 transition-colors duration-700 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)] group-hover/card:shadow-[0_40px_100px_-20px_rgba(197,160,89,0.3)]">
                  {/* Reflet de verre (Glassmorphism highlight) */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 z-50" />
                  <div className="absolute top-0 inset-x-0 h-[100px] bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 z-40 pointer-events-none" />

                  <div className="w-full h-48 relative overflow-hidden group bg-gradient-to-br from-[#12161b] via-[#0a0d0f] to-gold/5 flex items-center justify-center border-b border-white/5">'''

content = re.sub(search_pattern, replacement, content)

# I need to add one extra `</div>` at the end of the map function because I wrapped the card in another `div`.
# Let's find the end of the return statement for `offers.map`
# The return statement ends around line 431 with:
#                 )}
#               </div>
#             </Fragment>
#           );

end_search = r'(\s*</div>\s*</Fragment>\s*\);\s*})'
end_replace = r'''
                </div>
\1'''

content = re.sub(end_search, end_replace, content)

with open('src/pages/Offers.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
