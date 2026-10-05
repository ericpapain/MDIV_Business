// src/lib/ocrVisionService.ts
import { getApiUrl } from './apiConfig';

export type ExpenseCategory = 
  | 'carburant' 
  | 'peage' 
  | 'materiaux' 
  | 'outillage' 
  | 'location' 
  | 'restauration' 
  | 'sous_traitance' 
  | 'autre';

export type PaymentMethod = 'cb' | 'virement' | 'cheque' | 'especes' | 'prelevement';

export interface ExtractedReceipt {
  merchant: string;
  date: string;
  invoice_number: string;
  category: ExpenseCategory;
  amount_ht: number;
  tva_rate: number;
  amount_tva: number;
  amount_ttc: number;
  payment_method: PaymentMethod;
  raw_text?: string;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, { label: string; color: string; badge: string }> = {
  carburant: { label: 'Carburant & Énergie', color: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  peage: { label: 'Déplacements & Transports', color: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  materiaux: { label: 'Achats & Fournitures professionnelles', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  outillage: { label: 'Matériel, Équipements & Logiciels', color: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  location: { label: 'Location & Abonnements', color: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  restauration: { label: 'Repas & Frais de Mission', color: 'text-pink-400', badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  sous_traitance: { label: 'Sous-traitance & Prestataires externes', color: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  autre: { label: 'Autres Frais Généraux', color: 'text-slate-400', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
};

/**
 * Redimensionne une photo de reçu mobile si nécessaire afin d'optimiser l'envoi API
 */
export async function fileToOptimizedBase64(file: File, maxDimension = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Analyse optique de haute précision par Vision Multimodale (Groq Vision / GPT-4o-mini).
 * Extrait automatiquement : Enseigne, Date, N° Facture, Catégorie, Montant HT, TVA, TTC, Paiement.
 */
export async function parseReceiptWithVision(
  fileOrBase64: File | string,
  onProgress?: (message: string) => void
): Promise<ExtractedReceipt> {
  if (onProgress) onProgress("Préparation et optimisation de l'image...");
  
  let base64String = '';
  if (typeof fileOrBase64 === 'string') {
    base64String = fileOrBase64;
  } else {
    base64String = await fileToOptimizedBase64(fileOrBase64);
  }

  if (onProgress) onProgress("Lecture optique multimodale par IA Vision...");

  try {
    const res = await fetch(getApiUrl('ocr_vision_parse.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64String })
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || `Erreur serveur Vision (${res.status})`);
    }

    if (onProgress) onProgress("Structuration fiscale et calcul des taux de TVA...");
    const data = await res.json();

    if (!data.success || !data.extracted) {
      throw new Error("L'IA n'a pas pu extraire les données du reçu.");
    }

    return data.extracted as ExtractedReceipt;
  } catch (err: any) {
    console.error("Erreur OCR Vision:", err);
    throw new Error(err.message || "Échec de l'analyse OCR Vision.");
  }
}
