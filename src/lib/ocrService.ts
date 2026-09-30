import { createWorker } from 'tesseract.js';

export interface OCROptions {
  language?: string;
  onProgress?: (progress: number, status: string) => void;
}

export interface OCRResult {
  text: string;
  confidence: number;
  wordCount: number;
}

/**
 * Extrait le texte d'une image ou d'une photo de document avec Tesseract OCR.
 * Compatible avec : JPG, JPEG, PNG, WEBP, captures d'écran, photos mobiles.
 */
export async function extractTextFromImage(
  imageSource: File | Blob | string,
  options?: OCROptions
): Promise<OCRResult> {
  const lang = options?.language || 'fra+eng';
  const onProgress = options?.onProgress;

  try {
    if (onProgress) onProgress(10, 'Initialisation du moteur OCR...');
    const worker = await createWorker(lang);

    if (onProgress) onProgress(40, 'Analyse de l\'image et reconnaissance des caractères...');
    const ret = await worker.recognize(imageSource);

    if (onProgress) onProgress(90, 'Extraction et structuration du texte...');
    await worker.terminate();

    const text = ret.data.text ? ret.data.text.trim() : '';
    const words = text ? text.split(/\s+/).length : 0;

    if (onProgress) onProgress(100, 'Terminé');

    return {
      text,
      confidence: ret.data.confidence || 0,
      wordCount: words,
    };
  } catch (error: any) {
    console.error('Erreur OCR Tesseract:', error);
    throw new Error(`Échec de la reconnaissance OCR : ${error.message || 'Image illisible'}`);
  }
}

/**
 * Déclenche l'appareil photo du téléphone ou de l'ordinateur portable
 * pour photographier un document (facture, devis, contrat, compte-rendu).
 */
export function openDocumentCamera(
  onPhotoCaptured: (file: File) => void,
  onError?: (err: Error) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment'; // Ouvre la caméra arrière sur smartphone

  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      onPhotoCaptured(file);
    } else if (onError) {
      onError(new Error('Aucune photo prise.'));
    }
  };

  input.click();
}
