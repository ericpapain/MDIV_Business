// src/components/admin/cafe-rencontre/CampaignQrCodeCard.tsx
// Composant d'affichage, génération et téléchargement de QR Code haute fidélité pour les campagnes Café Rencontre

import React, { useRef, useState } from 'react';
import { QrCode, Download, Copy, ExternalLink, Printer, Check, Sparkles, FileImage, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CampaignQrCodeCardProps {
  slug: string;
  campaignTitle: string;
  isExpired?: boolean;
}

export function CampaignQrCodeCard({ slug, campaignTitle, isExpired }: CampaignQrCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // URL publique absolue
  const publicUrl = `${window.location.origin}/cafe-rencontre/${slug}`;

  // URL du QR code haute résolution avec marge confortable
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicUrl)}&margin=20&format=png`;
  const qrCodeSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicUrl)}&margin=20&format=svg`;

  const cleanName = (campaignTitle || 'Campagne')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);

  // Copie de l'URL publique
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("URL publique copiée dans le presse-papier !");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier l'URL");
    }
  };

  // Téléchargement du QR Code en PNG HD avec fond blanc optimisé pour PowerPoint
  const handleDownloadPng = async (withPowerPointCard = false) => {
    setDownloading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = withPowerPointCard ? 1200 : 1000;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas non disponible");

        // Fond blanc pur adapté aux diapositives PowerPoint
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        if (withPowerPointCard) {
          // En-tête sur le visuel pour slide
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 44px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText("CAFÉ RENCONTRE", size / 2, 90);

          ctx.fillStyle = '#d97706';
          ctx.font = 'bold 30px sans-serif';
          ctx.fillText("30 minutes pour échanger — Scannez le QR Code", size / 2, 145);

          // Dessiner le QR code centré
          ctx.drawImage(img, 150, 180, 900, 900);

          // Sous-titre avec nom de la campagne
          ctx.fillStyle = '#64748b';
          ctx.font = '24px sans-serif';
          ctx.fillText(campaignTitle, size / 2, 1130);
        } else {
          ctx.drawImage(img, 0, 0, size, size);
        }

        canvas.toBlob((blob) => {
          if (!blob) throw new Error("Échec génération blob");
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const suffix = withPowerPointCard ? 'Slide_PowerPoint' : 'HD';
          link.download = `QR_Cafe_Rencontre_${cleanName}_${suffix}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          toast.success("QR Code téléchargé en haute résolution !");
          setDownloading(false);
        }, 'image/png');
      };
      img.onerror = () => {
        toast.error("Erreur de chargement du QR code distant");
        setDownloading(false);
      };
      img.src = qrCodeUrl;
    } catch (e: any) {
      toast.error(e.message || "Erreur de téléchargement");
      setDownloading(false);
    }
  };

  // Téléchargement en SVG vectoriel
  const handleDownloadSvg = async () => {
    try {
      const res = await fetch(qrCodeSvgUrl);
      const svgText = await res.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Cafe_Rencontre_${cleanName}_Vectoriel.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success("QR Code SVG vectoriel téléchargé !");
    } catch {
      toast.error("Impossible de télécharger le SVG");
    }
  };

  // Impression
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code — ${campaignTitle}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            h1 { font-size: 28px; margin-bottom: 8px; color: #0f172a; }
            h2 { font-size: 20px; color: #d97706; margin-bottom: 30px; font-weight: normal; }
            img { width: 450px; height: 450px; border: 1px solid #cbd5e1; padding: 10px; border-radius: 12px; }
            p { font-size: 16px; color: #64748b; margin-top: 25px; }
            .url { font-family: monospace; font-weight: bold; color: #0284c7; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h1>CAFÉ RENCONTRE</h1>
          <h2>30 minutes pour échanger — Scannez le QR Code</h2>
          <img src="${qrCodeUrl}" alt="QR Code" />
          <p>Opération : <strong>${campaignTitle}</strong></p>
          <p class="url">${publicUrl}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            QR Code Permanent de la Campagne
          </div>
          <h4 className="text-lg font-bold text-white">Prêt pour Projection & Diapositives PowerPoint</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Ce QR code pointe vers une URL stable. Même si vous modifiez la sélection des intervenants ou prolongez la validité, le QR code ne change pas.
          </p>
        </div>

        {isExpired && (
          <span className="self-start sm:self-auto px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
            Campagne Expirée
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Aperçu du QR Code sur fond blanc contrasté */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative p-5 bg-white rounded-2xl shadow-2xl border-4 border-amber-400/40 group transition-transform hover:scale-[1.02]">
            <img
              src={qrCodeUrl}
              alt={`QR Code ${campaignTitle}`}
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              loading="lazy"
            />
            <div className="mt-3 text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900 bg-amber-400/30 px-3 py-1 rounded-full">
                Café Rencontre • BNE
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Format 1000×1000 HD sans perte</span>
        </div>

        {/* Actions et options d'exportation */}
        <div className="md:col-span-7 space-y-4">
          {/* Boîte URL publique */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center justify-between">
              <span>URL Publique Permanente</span>
              <span className="text-amber-400 font-mono text-[10px]">Stable</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none select-all"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 text-xs gap-1.5 h-9 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </Button>
            </div>
          </div>

          {/* Grille d'actions de téléchargement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Button
              type="button"
              onClick={() => handleDownloadPng(true)}
              disabled={downloading}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold rounded-xl h-10 gap-2 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Visuel PowerPoint (Slide)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleDownloadPng(false)}
              disabled={downloading}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs rounded-xl h-10 gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>PNG Haute Résolution</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadSvg}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs rounded-xl h-10 gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Format SVG Vectoriel</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs rounded-xl h-10 gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Imprimer la Fiche QR</span>
            </Button>
          </div>

          <div className="pt-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Tester la page publique (vue visiteur)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

