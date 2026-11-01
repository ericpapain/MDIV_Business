/**
 * WCAG AA / AAA Automated Contrast Checker for MDIV Business Design System
 * Based on W3C Web Content Accessibility Guidelines (WCAG) 2.1 specifications:
 * - Relative luminance formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * - Contrast ratio formula: (L1 + 0.05) / (L2 + 0.05)
 * - Normal text WCAG AA threshold: >= 4.5:1
 * - Large text (>= 18pt / 24px or >= 14pt / 18.5px bold) threshold: >= 3.0:1
 * - UI components / graphical objects threshold: >= 3.0:1
 */

export interface ContrastResult {
  color1: string;
  color2: string;
  ratio: number;
  wcagAA: boolean;
  wcagAALarge: boolean;
  wcagAAA: boolean;
  minRequiredRatio: number;
  status: 'PASS' | 'FAIL';
  elementContext?: string;
}

export interface ThemeContrastReport {
  theme: 'dark' | 'light';
  totalChecked: number;
  passedCount: number;
  failedCount: number;
  results: ContrastResult[];
  compliant: boolean;
}

/**
 * Converts sRGB channel (0-255) to linearized luminance component
 */
function sRGBtoLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Calculates relative luminance L for an [R, G, B] color (0-255)
 */
export function calculateLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb;
  const R = sRGBtoLinear(r);
  const G = sRGBtoLinear(g);
  const B = sRGBtoLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Converts HSL (h: 0-360, s: 0-100, l: 0-100) to RGB [0-255, 0-255, 0-255]
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s = s / 100;
  l = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ];
}

/**
 * Parses CSS color string (hex, rgb, rgba, hsl, space-separated HSL) to [R, G, B]
 */
export function parseColor(color: string): [number, number, number] {
  const trimmed = color.trim().toLowerCase();

  // Hex format: #fff, #ffffff
  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex.slice(0, 6), 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  // HSL CSS syntax: hsl(218 45% 9%) or 218 45% 9% or hsl(218, 45%, 9%)
  const hslMatch = trimmed.match(/(?:hsl\()?([0-9.]+)[,\s]+([0-9.]+)%?[,\s]+([0-9.]+)%?\)?/);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]);
    const l = parseFloat(hslMatch[3]);
    return hslToRgb(h, s, l);
  }

  // RGB syntax: rgb(15, 23, 42) or rgba(15, 23, 42, 0.9)
  const rgbMatch = trimmed.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }

  // Default fallback to black
  return [0, 0, 0];
}

/**
 * Calculates WCAG 2.1 contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  const l1 = calculateLuminance(rgb1);
  const l2 = calculateLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

/**
 * Tests whether two colors pass WCAG AA standard
 */
export function checkWcagAA(
  foreground: string,
  background: string,
  options: { isLargeText?: boolean; elementContext?: string } = {}
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const minRequiredRatio = options.isLargeText ? 3.0 : 4.5;
  const wcagAA = ratio >= 4.5;
  const wcagAALarge = ratio >= 3.0;
  const wcagAAA = ratio >= 7.0;

  const passed = options.isLargeText ? wcagAALarge : wcagAA;

  return {
    color1: foreground,
    color2: background,
    ratio,
    wcagAA,
    wcagAALarge,
    wcagAAA,
    minRequiredRatio,
    status: passed ? 'PASS' : 'FAIL',
    elementContext: options.elementContext,
  };
}

/**
 * Validates design system theme tokens for WCAG AA compliance
 */
export function auditDesignSystemContrast(): {
  darkReport: ThemeContrastReport;
  lightReport: ThemeContrastReport;
  allPassing: boolean;
} {
  // Dark mode active tokens
  const darkBg = 'hsl(218 45% 9%)'; // #0d1522
  const darkCard = 'hsl(218 40% 12%)'; // #121c2b
  const darkSlate900 = '#0f172a';

  const darkChecks: Array<{ fg: string; bg: string; ctx: string; isLarge?: boolean }> = [
    { fg: 'hsl(45 35% 94%)', bg: darkBg, ctx: 'Texte standard (foreground) sur fond sombre' },
    { fg: 'hsl(45 35% 94%)', bg: darkCard, ctx: 'Texte standard (card-foreground) sur carte sombre' },
    { fg: 'hsl(218 20% 78%)', bg: darkBg, ctx: 'Texte secondaire (muted-foreground) sur fond sombre' },
    { fg: 'hsl(218 20% 78%)', bg: darkCard, ctx: 'Texte secondaire (muted-foreground) sur carte sombre' },
    { fg: 'hsl(45 35% 94%)', bg: darkCard, ctx: 'Labels de formulaires (--form-label) sur carte sombre' },
    { fg: 'hsl(218 25% 92%)', bg: darkBg, ctx: 'Labels de cases à cocher / RGPD (--form-checkbox-label) sur fond' },
    { fg: 'hsl(218 25% 92%)', bg: darkCard, ctx: 'Labels de cases à cocher / RGPD sur carte sombre' },
    { fg: 'hsl(218 20% 72%)', bg: darkSlate900, ctx: 'Placeholders de saisie (--form-placeholder) sur input sombre' },
    { fg: '#94a3b8', bg: darkSlate900, ctx: 'Placeholders Tailwind slate-400 sur input slate-900' },
    { fg: '#e2e8f0', bg: darkBg, ctx: 'Texte slate-200 sur fond sombre' },
    { fg: '#f1f5f9', bg: darkCard, ctx: 'Texte slate-100 sur carte sombre' },
    { fg: 'hsl(42 55% 56%)', bg: darkBg, ctx: 'Boutons / Liens or (--primary) grand format', isLarge: true },
    { fg: '#60a5fa', bg: darkBg, ctx: 'Liens bleus blue-400 sur fond sombre' },
    { fg: '#fbbf24', bg: darkBg, ctx: 'Liens or amber-400 sur fond sombre' },
    { fg: '#f8fafc', bg: 'hsl(218 35% 16%)', ctx: 'Texte bouton secondaire sur fond secondaire sombre' },
  ];

  const darkResults = darkChecks.map(c => checkWcagAA(c.fg, c.bg, { isLargeText: c.isLarge, elementContext: c.ctx }));
  const darkPassed = darkResults.filter(r => r.status === 'PASS').length;

  const darkReport: ThemeContrastReport = {
    theme: 'dark',
    totalChecked: darkResults.length,
    passedCount: darkPassed,
    failedCount: darkResults.length - darkPassed,
    results: darkResults,
    compliant: darkPassed === darkResults.length,
  };

  // Light mode checks
  const lightBg = 'hsl(45 35% 98%)';
  const lightCard = 'hsl(45 35% 100%)';

  const lightChecks: Array<{ fg: string; bg: string; ctx: string; isLarge?: boolean }> = [
    { fg: '#000000', bg: lightBg, ctx: 'Texte standard (foreground) sur fond clair' },
    { fg: 'hsl(0 0% 30%)', bg: lightBg, ctx: 'Texte atténué (muted-foreground) sur fond clair' },
    { fg: 'hsl(218 30% 18%)', bg: lightCard, ctx: 'Labels de formulaires sur carte blanche' },
    { fg: 'hsl(218 30% 20%)', bg: lightBg, ctx: 'Labels cases à cocher sur fond clair' },
    { fg: '#475569', bg: '#ffffff', ctx: 'Placeholders slate-600 sur input blanc' },
    { fg: '#1d4ed8', bg: lightBg, ctx: 'Liens bleus sur fond clair' },
    { fg: '#b45309', bg: lightBg, ctx: 'Liens dorés amber-700 sur fond clair' },
  ];

  const lightResults = lightChecks.map(c => checkWcagAA(c.fg, c.bg, { isLargeText: c.isLarge, elementContext: c.ctx }));
  const lightPassed = lightResults.filter(r => r.status === 'PASS').length;

  const lightReport: ThemeContrastReport = {
    theme: 'light',
    totalChecked: lightResults.length,
    passedCount: lightPassed,
    failedCount: lightResults.length - lightPassed,
    results: lightResults,
    compliant: lightPassed === lightResults.length,
  };

  return {
    darkReport,
    lightReport,
    allPassing: darkReport.compliant && lightReport.compliant,
  };
}

