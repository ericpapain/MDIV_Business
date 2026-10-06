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
  modelUsed?: string;
}

/**
 * Détecte le type sémantique probable d'après le nom de fichier
 */
function inferDocumentTypeFromName(filename: string): 'auto' | 'invoice' | 'quote' | 'meeting' | 'contract' | 'technical' {
  const f = filename.toLowerCase();
  if (f.includes('facture') || f.includes('invoice') || f.includes('ticket') || f.includes('recu') || f.includes('note_frais')) {
    return 'invoice';
  }
  if (f.includes('devis') || f.includes('quote') || f.includes('chiffrage') || f.includes('proposition') || f.includes('tarif')) {
    return 'quote';
  }
  if (f.includes('reunion') || f.includes('meeting') || f.includes('compte_rendu') || f.includes('pv_') || f.includes('brief')) {
    return 'meeting';
  }
  if (f.includes('contrat') || f.includes('contract') || f.includes('accord') || f.includes('avenant') || f.includes('convention')) {
    return 'contract';
  }
  if (f.includes('spec') || f.includes('cahier') || f.includes('technique') || f.includes('plan') || f.includes('schema')) {
    return 'technical';
  }
  return 'auto';
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
 * bascule automatiquement vers l'OCR Multimodal OpenAI GPT-4o Vision.
 */
export async function extractTextFromPdf(
  file: File | Blob,
  onProgress?: (progress: number, status: string) => void,
  suggestedType: 'auto' | 'invoice' | 'quote' | 'meeting' | 'contract' | 'technical' = 'auto'
): Promise<{ text: string; numPages: number; isScanned: boolean; modelUsed?: string }> {
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
      const pagePercent = 10 + Math.round((pageNum / numPages) * 60);
      if (onProgress) onProgress(pagePercent, `Lecture de la structure - Page ${pageNum}/${numPages}...`);

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
    let modelUsed = 'PDF.js Native Engine';

    // Si le PDF est un document scanné (quasi aucun caractère extrait par le moteur natif)
    if (combinedText.length < 50 && numPages > 0) {
      if (onProgress) onProgress(75, 'PDF scanné détecté : exécution de l\'IA Vision Multimodale...');
      isScanned = true;

      try {
        const ocrPages: string[] = [];
        const maxPages = Math.min(numPages, 5); // Scanne jusqu'à 5 pages en haute résolution

        for (let p = 1; p <= maxPages; p++) {
          if (onProgress) {
            const pct = 75 + Math.round((p / maxPages) * 22);
            onProgress(pct, `Transcription OpenAI Vision - Page ${p}/${maxPages}...`);
          }

          const page = await pdfDoc.getPage(p);
          const viewport = page.getViewport({ scale: 2.0 }); // 2.0x pour une clarté maximale
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
            if (blob) {
              const ocrRes = await extractTextFromImage(blob, {
                documentType: suggestedType,
                highAccuracy: true
              });
              if (ocrRes.text) {
                ocrPages.push(`--- Page ${p} (Transcription Vision IA) ---\n` + ocrRes.text);
                modelUsed = ocrRes.modelUsed || 'OpenAI Vision';
              }
            }
          }
        }

        if (ocrPages.length > 0) {
          combinedText = ocrPages.join('\n\n');
        }
      } catch (ocrErr) {
        console.warn('Échec de la transcription Vision sur PDF scanné:', ocrErr);
      }
    }

    if (onProgress) onProgress(100, 'Extraction PDF terminée !');

    return {
      text: combinedText,
      numPages,
      isScanned,
      modelUsed
    };
  } catch (error: any) {
    console.error('Erreur extraction PDF:', error);
    throw new Error(`Échec de la lecture du fichier PDF : ${error.message || 'Format non reconnu'}`);
  }
}

/**
 * Service Universel d'Extraction Documentaire pour tous les modules IA :
 * Gère PDF natif, PDF scanné, Word DOCX, Images (OCR Vision Spécialisé) et Fichiers Texte.
 */
export async function parseUploadedDocument(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<DocumentParseResult> {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  const detectedDocType = inferDocumentTypeFromName(file.name);

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
      modelUsed: 'Mammoth DOCX Engine'
    };
  }

  // 2. Détection PDF
  if (fileName.endsWith('.pdf') || mimeType === 'application/pdf') {
    const res = await extractTextFromPdf(file, onProgress, detectedDocType);
    return {
      text: res.text,
      wordCount: res.text ? res.text.split(/\s+/).length : 0,
      numPages: res.numPages,
      isScanned: res.isScanned,
      format: 'pdf',
      modelUsed: res.modelUsed
    };
  }

  // 3. Détection Image (Photos, Reçus, Scans JPG/PNG/WEBP)
  if (mimeType.startsWith('image/')) {
    if (onProgress) onProgress(10, 'Préparation de l\'analyse visuelle haute précision...');
    const ocrRes = await extractTextFromImage(file, {
      documentType: detectedDocType,
      highAccuracy: true,
      onProgress: (p, s) => {
        if (onProgress) onProgress(p, s);
      },
    });
    return {
      text: ocrRes.text,
      wordCount: ocrRes.wordCount,
      isScanned: true,
      format: 'image',
      modelUsed: ocrRes.modelUsed || 'OpenAI Vision'
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
      modelUsed: 'Raw Text Stream'
    };
  }

  // Fallback si format binaire inconnu
  return {
    text: '',
    wordCount: 0,
    format: 'unknown',
  };
}
