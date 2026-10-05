import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { extractTextFromImage } from './ocrService';

// Initialisation du worker PDF.js (CDN sécurisé ou blob pour Vite)
if (typeof window !== 'undefined' && 'GlobalWorkerOptions' in pdfjsLib) {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface DocumentParseResult {
  text: string;
  wordCount: number;
  numPages?: number;
  isScanned?: boolean;
  format: 'pdf' | 'docx' | 'image' | 'text' | 'unknown';
}

/**
 * Extrait le texte intégral d'un fichier Word DOCX (.docx)
 * Décode la structure XML (paragraphes, puces, cellules de tableau).
 */
export async function extractTextFromDocx(file: File | Blob | ArrayBuffer): Promise<string> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else {
      arrayBuffer = await file.arrayBuffer();
    }

    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value ? result.value.trim() : '';

    if (!text && result.messages && result.messages.length > 0) {
      console.warn('Avertissements Mammoth DOCX:', result.messages);
    }

    return text;
  } catch (error: any) {
    console.error('Erreur extraction DOCX:', error);
    throw new Error(`Échec de la lecture du document Word (.docx) : ${error.message || 'Fichier corrompu'}`);
  }
}

/**
 * Extrait le texte d'un PDF page par page avec PDF.js.
 * Si le document est un scan ou une image sans flux textuel natif,
 * bascule automatiquement vers l'OCR Tesseract.
 */
export async function extractTextFromPdf(
  file: File | Blob,
  onProgress?: (progress: number, status: string) => void
): Promise<{ text: string; numPages: number; isScanned: boolean }> {
  try {
    if (onProgress) onProgress(10, 'Chargement de la structure du PDF...');
    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const fullTextArray: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const pagePercent = 10 + Math.round((pageNum / numPages) * 70);
      if (onProgress) onProgress(pagePercent, `Extraction du texte - Page ${pageNum}/${numPages}...`);

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStrings = textContent.items
        .map((item: any) => (item.str !== undefined ? item.str : ''))
        .filter(str => str.trim().length > 0);

      const pageJoined = pageStrings.join(' ');
      if (pageJoined.trim()) {
        fullTextArray.push(`--- Page ${pageNum} ---\n` + pageJoined);
      }
    }

    let combinedText = fullTextArray.join('\n\n').trim();
    let isScanned = false;

    // Si le PDF est un document scanné (quasi aucun caractère extrait)
    if (combinedText.length < 50 && numPages > 0) {
      if (onProgress) onProgress(85, 'PDF scanné détecté : exécution de l\'OCR Vision...');
      isScanned = true;

      // On rend la 1ère page sur un canvas pour l'OCR Tesseract
      try {
        const firstPage = await pdfDoc.getPage(1);
        const viewport = firstPage.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await firstPage.render({ canvasContext: ctx, viewport }).promise;
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            const ocrRes = await extractTextFromImage(blob, {
              onProgress: (p, s) => {
                if (onProgress) onProgress(85 + Math.round(p * 0.15), `OCR Scan : ${s}`);
              }
            });
            combinedText = ocrRes.text;
          }
        }
      } catch (ocrErr) {
        console.warn('Échec fallback OCR sur PDF scanné:', ocrErr);
      }
    }

    if (onProgress) onProgress(100, 'Extraction PDF terminée !');

    return {
      text: combinedText,
      numPages,
      isScanned,
    };
  } catch (error: any) {
    console.error('Erreur extraction PDF.js:', error);
    throw new Error(`Échec de la lecture du fichier PDF : ${error.message || 'Format non reconnu'}`);
  }
}

/**
 * Service Universel d'Extraction Documentaire pour tous les modules IA :
 * Gère PDF natif, PDF scanné, Word DOCX, Images (OCR) et Fichiers Texte.
 */
export async function parseUploadedDocument(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<DocumentParseResult> {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // 1. Détection DOCX
  if (
    fileName.endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    if (onProgress) onProgress(20, 'Lecture du document Word (.docx)...');
    const text = await extractTextFromDocx(file);
    if (onProgress) onProgress(100, 'Document Word (.docx) extrait avec succès !');
    return {
      text,
      wordCount: text ? text.split(/\s+/).length : 0,
      format: 'docx',
    };
  }

  // 2. Détection PDF
  if (fileName.endsWith('.pdf') || mimeType === 'application/pdf') {
    const res = await extractTextFromPdf(file, onProgress);
    return {
      text: res.text,
      wordCount: res.text ? res.text.split(/\s+/).length : 0,
      numPages: res.numPages,
      isScanned: res.isScanned,
      format: 'pdf',
    };
  }

  // 3. Détection Image (Photos, Reçus, Scans JPG/PNG/WEBP)
  if (mimeType.startsWith('image/')) {
    if (onProgress) onProgress(10, 'Traitement OCR de l\'image...');
    const ocrRes = await extractTextFromImage(file, {
      onProgress: (p, s) => {
        if (onProgress) onProgress(p, s);
      },
    });
    return {
      text: ocrRes.text,
      wordCount: ocrRes.wordCount,
      isScanned: true,
      format: 'image',
    };
  }

  // 4. Détection Fichiers Texte Bruts (TXT, MD, CSV, JSON, LOG)
  if (
    mimeType.startsWith('text/') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.json') ||
    fileName.endsWith('.log')
  ) {
    if (onProgress) onProgress(50, 'Lecture du fichier texte...');
    const text = await file.text();
    if (onProgress) onProgress(100, 'Fichier texte lu avec succès !');
    return {
      text,
      wordCount: text ? text.split(/\s+/).length : 0,
      format: 'text',
    };
  }

  // Fallback si format binaire inconnu
  return {
    text: '',
    wordCount: 0,
    format: 'unknown',
  };
}
