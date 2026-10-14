import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  required?: boolean;
}

export function ImageUpload({ 
  value, 
  onChange, 
  label = "Image URL",
  labelClassName = "text-sm font-medium text-foreground",
  placeholder = "URL de l'image ou cliquer sur 'Télécharger du PC'",
  required = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api-admin.php?action=upload_image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.success && data.url) {
        onChange(data.url);
        toast.success("Image importée avec succès !");
      } else {
        toast.error(data.error || "Erreur lors de l'importation de l'image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur réseau lors de l'importation");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className={labelClassName}>
          {label} {required && <span className="text-gold">*</span>}
        </label>
      )}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-background/80 border border-border/80 rounded-sm pl-9 pr-3 py-2 text-xs text-foreground focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" 
            placeholder={placeholder}
          />
        </div>
        
        <div className="shrink-0">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, image/webp, image/gif" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto px-3.5 py-2 text-xs uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 border border-gold/40 bg-gold/10 hover:bg-gold/20 text-gold hover:text-gold-light whitespace-nowrap disabled:opacity-50 transition-all font-semibold cursor-pointer shadow-sm"
          >
            {isUploading ? (
              <Loader2 size={14} className="animate-spin text-gold" />
            ) : (
              <Upload size={14} className="text-gold" />
            )}
            {isUploading ? "Envoi..." : "Télécharger du PC"}
          </button>
        </div>
      </div>
      
      {value && (
        <div className="mt-2.5 p-1.5 bg-[#0a0d0f] rounded-sm border border-border inline-block max-w-[220px]">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-black/50">
            <img 
              src={value.startsWith('http') || value.startsWith('/') ? value : `/${value}`} 
              alt="Aperçu" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
