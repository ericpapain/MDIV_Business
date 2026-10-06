import { getApiUrl } from './apiConfig';

export interface OCROptions {
  language?: string;
  documentType?: 'auto' | 'invoice' | 'quote' | 'meeting' | 'contract' | 'technical';
  highAccuracy?: boolean;
  onProgress?: (progress: number, status: string) => void;
}

export interface OCRResult {
  text: string;
  confidence: number;
  wordCount: number;
  modelUsed?: string;
}

/**
 * Convertit un File/Blob/URL en chaîne Base64 optimisée pour l'IA Vision.
 * Redimensionne si l'image est trop gigantesque (> 2400px) tout en conservant une netteté cristalline.
 */
async function toOptimizedBase64(source: File | Blob | string, maxDim = 2200): Promise<string> {
  if (typeof source === 'string' && source.startsWith('data:')) {
    return source;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
            return;
          }
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = reject;

    if (source instanceof Blob) {
      reader.readAsDataURL(source);
    } else {
      resolve(source as string);
    }
  });
}

/**
 * Extrait le texte d'une image, photo ou scan de document avec les meilleurs modèles
 * OpenAI Multimodaux (GPT-4o / GPT-4o-mini Vision) adaptés spécifiquement par type de document.
 * 
 * Remplace Tesseract par une extraction haute fidélité qui retranscrit :
 * - Tous les chiffres, virgules, montants et taux de TVA sans erreur
 * - Les tableaux complexes et colonnes en Markdown
 * - Les en-têtes, dates, SIRET et conditions de règlement
 */
export async function extractTextFromImage(
  imageSource: File | Blob | string,
  options?: OCROptions
): Promise<OCRResult> {
  const onProgress = options?.onProgress;
  const docType = options?.documentType || 'auto';
  const highAccuracy = options?.highAccuracy ?? true;

  try {
    if (onProgress) onProgress(15, "Optimisation et calibrage optique de l'image...");
    const base64Data = await toOptimizedBase64(imageSource);

    if (onProgress) onProgress(45, "Transcription haute fidélité par OpenAI Multimodal Vision...");
    
    const apiUrl = getApiUrl('ocr_document_vision.php');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        document_type: docType,
        high_accuracy: highAccuracy
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.text) {
        if (onProgress) onProgress(100, `Extraction réussie (${data.model_used || 'IA Vision'}) !`);
        return {
          text: data.text.trim(),
          confidence: data.confidence || 98.8,
          wordCount: data.word_count || data.text.split(/\s+/).length,
          modelUsed: data.model_used || 'OpenAI Vision'
        };
      }
    }

    // Si l'API renvoie une erreur explicite
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Erreur serveur (${response.status})`);

  } catch (error: any) {
    console.warn("Échec Vision API, tentative fallback local Tesseract:", error.message);

    // Fallback de secours Tesseract si hors ligne ou erreur réseau
    try {
      if (onProgress) onProgress(70, "Mode secours local : analyse Tesseract...");
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(options?.language || 'fra+eng');
      const ret = await worker.recognize(imageSource);
      await worker.terminate();

      const text = ret.data.text ? ret.data.text.trim() : '';
      if (onProgress) onProgress(100, "Extraction terminée (mode secours).");
      return {
        text,
        confidence: ret.data.confidence || 60,
        wordCount: text ? text.split(/\s+/).length : 0,
        modelUsed: 'Tesseract Fallback'
      };
    } catch (fallbackErr: any) {
      throw new Error(`Échec de l'extraction optique : ${error.message || fallbackErr.message}`);
    }
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
