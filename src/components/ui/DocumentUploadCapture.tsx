import { useState, useRef } from "react";
import { openDocumentCamera } from "@/lib/ocrService";
import { parseUploadedDocument } from "@/lib/documentParserService";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface DocumentUploadCaptureProps {
  onDocumentProcessed: (data: { file: File; text: string; isImage: boolean }) => void;
  acceptedFormats?: string;
  label?: string;
  disabled?: boolean;
}

export function DocumentUploadCapture({
  onDocumentProcessed,
  acceptedFormats = ".pdf,.docx,.doc,.txt,.md,.csv,.json,.log,.jpg,.jpeg,.png,.webp",
  label = "Déposez votre document (PDF, Word DOCX, Contrat, Facture, Photo...)",
  disabled = false,
}: DocumentUploadCaptureProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [extractedPreview, setExtractedPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setPreviewName(file.name);
    setLoading(true);
    setProgress(10);
    setStatusMsg("Analyse du format documentaire...");

    try {
      const res = await parseUploadedDocument(file, (p, s) => {
        setProgress(p);
        setStatusMsg(s);
      });

      const extractedText = res.text;

      if (extractedText && extractedText.trim().length > 0) {
        setExtractedPreview(
          extractedText.slice(0, 250) + (extractedText.length > 250 ? "..." : "")
        );
        const formatLabel = 
          res.format === 'docx' 
            ? `Document Word (.docx) extrait (${res.wordCount} mots)` 
            : res.format === 'pdf'
            ? `PDF extrait avec succès (${res.numPages || 1} page(s), ${res.wordCount} mots)${res.isScanned ? ' [OCR Vision]' : ''}`
            : res.format === 'image'
            ? `Texte extrait par OCR Vision (${res.wordCount} mots)`
            : `Fichier texte lu avec succès (${res.wordCount} mots)`;
        setStatusMsg(`${formatLabel} !`);
      } else {
        setExtractedPreview(`Document joint : ${file.name} (${(file.size / 1024).toFixed(1)} Ko)`);
        setStatusMsg("Document joint pour l'analyse.");
      }

      onDocumentProcessed({ file, text: extractedText, isImage: res.format === 'image' });
    } catch (err: any) {
      console.error("Erreur traitement document:", err);
      setStatusMsg(err.message || "Erreur lors du traitement");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = () => {
    openDocumentCamera((file) => {
      handleFile(file);
    });
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-xl p-6 bg-gradient-to-br from-blue-100 to-blue-200 text-center transition-all shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          className="hidden"
          disabled={disabled || loading}
        />

        <div className="flex justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            <FileText className="w-6 h-6" />
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Camera className="w-6 h-6" />
          </div>
        </div>

        <h4 className="text-sm font-bold text-blue-950 mb-1">{label}</h4>
        <p className="text-xs text-blue-800 max-w-md mx-auto mb-4">
          Formats acceptés : PDF, JPG, PNG, WEBP, reçus ou photos prises sur le vif avec votre appareil.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || loading}
            className="text-xs border-border hover:border-gold gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Parcourir les fichiers
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleCameraCapture}
            disabled={disabled || loading}
            className="text-xs bg-gold hover:bg-gold-light text-black font-medium gap-1.5 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            Prendre une photo du document
          </Button>
        </div>

        {/* INDICATEUR DE CHARGEMENT & PROGRESSION OCR */}
        {loading && (
          <div className="mt-4 p-3 bg-muted/20 border border-border/70 rounded-lg max-w-md mx-auto space-y-2 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-foreground font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                {statusMsg}
              </span>
              <span className="font-mono text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
        )}

        {/* SUCCÈS OU APERÇU DU FICHER SÉLECTIONNÉ */}
        {!loading && previewName && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg max-w-md mx-auto text-left flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-medium text-foreground">{previewName}</div>
              {extractedPreview && (
                <p className="text-[11px] text-muted-foreground italic">
                  OCR Extrait : "{extractedPreview}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
