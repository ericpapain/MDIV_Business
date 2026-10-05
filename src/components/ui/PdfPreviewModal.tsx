// src/components/ui/PdfPreviewModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  X, Download, Printer, ZoomIn, ZoomOut, RotateCw, 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Loader2,
  FileText, AlertCircle
} from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string | null;
  pdfBlob?: Blob | null;
  title?: string;
  fileName?: string;
  onDownload?: () => void;
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  pdfBlob,
  title = "Prévisualisation du Document PDF",
  fileName = "document.pdf",
  onDownload
}: PdfPreviewModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialisation du worker PDF.js si besoin
  useEffect(() => {
    if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjsLib) {
      if (!(pdfjsLib as any).GlobalWorkerOptions.workerSrc) {
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      }
    }
  }, []);

  // Gestion de l'URL du PDF (Blob ou string direct)
  useEffect(() => {
    if (!isOpen) return;

    let urlToUse: string | null = null;
    let createdBlobUrl = false;

    if (pdfBlob) {
      urlToUse = URL.createObjectURL(pdfBlob);
      createdBlobUrl = true;
    } else if (pdfUrl) {
      urlToUse = pdfUrl;
    }

    setActiveUrl(urlToUse);
    setCurrentPage(1);
    setError(null);
    setIsLoading(true);

    return () => {
      if (createdBlobUrl && urlToUse) {
        URL.revokeObjectURL(urlToUse);
      }
    };
  }, [isOpen, pdfUrl, pdfBlob]);

  // Chargement du document PDF via PDF.js
  useEffect(() => {
    if (!activeUrl || !isOpen) return;

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: activeUrl,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.error("Erreur chargement PDF:", err);
        setError("Impossible de charger le document PDF. Vous pouvez toutefois le télécharger directement.");
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [activeUrl, isOpen]);

  // Rendu de la page courante sur le Canvas en Haute Résolution (devicePixelRatio)
  useEffect(() => {
    if (!pdfDocRef.current || !canvasRef.current || isLoading) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calcul de la résolution haute fidélité (Retina / 2x / 3x)
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale, rotation: rotation });

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn("Erreur de rendu de page PDF:", err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [currentPage, scale, rotation, isLoading]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (activeUrl) {
      const link = document.createElement('a');
      link.href = activeUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (!activeUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = activeUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        window.open(activeUrl, '_blank');
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
    };
  };

  const zoomIn = () => setScale(prev => Math.min(3.0, prev + 0.25));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.25));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4">
      <div 
        ref={containerRef}
        className={`bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[92vh]'
        }`}
      >
        {/* Header / Barre d'outils */}
        <div className="bg-slate-850 px-4 py-3 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText size={18} />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-slate-100 truncate">{title}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">{fileName}</p>
            </div>
          </div>

          {/* Contrôles de navigation et zoom */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Pagination */}
            {numPages > 1 && (
              <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700/50"
                  title="Page précédente"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-mono px-1">
                  {currentPage} / {numPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                  disabled={currentPage >= numPages}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700/50"
                  title="Page suivante"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Zoom */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700/50"
                title="Zoom arrière"
              >
                <ZoomOut size={15} />
              </button>
              <span className="font-mono px-1 w-11 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= 3.0}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700/50"
                title="Zoom avant"
              >
                <ZoomIn size={15} />
              </button>
            </div>

            {/* Rotation */}
            <button
              type="button"
              onClick={rotate}
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors text-xs"
              title="Pivoter à 90°"
            >
              <RotateCw size={15} />
            </button>

            {/* Impression */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors text-xs font-medium"
              title="Imprimer"
            >
              <Printer size={15} />
              <span>Imprimer</span>
            </button>

            {/* Bouton Téléchargement immédiat */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-xs font-bold shadow-md shadow-blue-600/30"
              title="Télécharger le fichier PDF"
            >
              <Download size={15} />
              <span>Télécharger</span>
            </button>

            {/* Plein écran */}
            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Fermer */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Fermer la prévisualisation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Zone centrale d'affichage du PDF */}
        <div className="flex-1 bg-slate-950 overflow-auto p-4 sm:p-8 flex justify-center items-start">
          {isLoading && (
            <div className="flex flex-col items-center justify-center my-auto py-16 text-slate-400 gap-3">
              <Loader2 size={36} className="animate-spin text-blue-500" />
              <p className="text-sm font-medium">Chargement du document PDF haute qualité...</p>
            </div>
          )}

          {error && (
            <div className="max-w-md my-auto p-6 bg-red-950/40 border border-red-800/50 rounded-2xl text-center space-y-4">
              <AlertCircle size={36} className="text-red-400 mx-auto" />
              <p className="text-sm text-red-200">{error}</p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 mx-auto"
              >
                <Download size={14} /> Télécharger le fichier PDF
              </button>
            </div>
          )}

          <div className={`${isLoading || error ? 'hidden' : 'block'} flex justify-center shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white`}>
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
          </div>
        </div>

        {/* Pied de page du Viewer */}
        <div className="bg-slate-850 px-4 py-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Rendu vectoriel A4 • 300 DPI</span>
          <span>{numPages > 0 ? `Document complet (${numPages} page${numPages > 1 ? 's' : ''})` : 'Prêt'}</span>
        </div>
      </div>
    </div>
  );
}
