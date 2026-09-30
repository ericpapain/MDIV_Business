/** Convertit les emoji de drapeaux en images (fix rendu Windows) */
export function Emoji({ symbol }: { symbol: string }) {
  if (!symbol) return null;
  const chars = Array.from(symbol);
  if (chars.length >= 2) {
    const cp1 = chars[0].codePointAt(0);
    const cp2 = chars[1].codePointAt(0);
    if (
      cp1 && cp2 &&
      cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff &&
      cp2 >= 0x1f1e6 && cp2 <= 0x1f1ff
    ) {
      const code =
        String.fromCharCode(cp1 - 0x1f1e6 + 97) +
        String.fromCharCode(cp2 - 0x1f1e6 + 97);
      return (
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          alt={symbol}
          className="w-8 h-auto object-contain inline-block drop-shadow-sm rounded-[2px]"
        />
      );
    }
  }
  return (
    <span
      style={{
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      }}
    >
      {symbol}
    </span>
  );
}
