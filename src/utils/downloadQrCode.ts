// src/utils/downloadQrCode.ts
// Utilitaire haute fiabilité pour forcer le téléchargement physique réel du QR Code (Blob)
// avec nommage normalisé : QR_[Nom_Evenement]_[Nom_Participant].png

export async function downloadQrCode(
  qrUrlOrData: string,
  eventTitle: string = 'Evenement',
  attendeeName: string = 'Participant'
): Promise<void> {
  if (!qrUrlOrData) {
    throw new Error("URL ou données du QR Code introuvables");
  }

  // Nettoyage strict des noms pour un nom de fichier lisible et sans caractères spéciaux
  const cleanEvent = (eventTitle || 'MDIV_Event')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 30);

  const cleanName = (attendeeName || 'Participant')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 30);

  const fileName = `QR_${cleanEvent}_${cleanName}.png`;

  try {
    let blob: Blob;

    if (qrUrlOrData.startsWith('data:image/')) {
      // Cas 1 : Data URL base64 existant
      const res = await fetch(qrUrlOrData);
      blob = await res.blob();
    } else {
      // Cas 2 : URL distante (ex: api.qrserver.com)
      // On fetch en blob pour forcer le téléchargement et contourner le comportement d'ouverture d'onglet
      try {
        const res = await fetch(qrUrlOrData, { mode: 'cors' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        blob = await res.blob();
      } catch (corsErr) {
        // Fallback canvas si le serveur distant bloque le fetch CORS direct
        blob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 400;
            canvas.height = img.naturalHeight || 400;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error("Contexte canvas indisponible"));
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((b) => {
              if (b) resolve(b);
              else reject(new Error("Échec conversion Blob"));
            }, 'image/png');
          };
          img.onerror = (e) => reject(e);
          img.src = qrUrlOrData;
        });
      }
    }

    // Déclencher le téléchargement du blob
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
  } catch (err) {
    console.error("Erreur lors du téléchargement du QR code:", err);
    // Dernier recours si tout échoue : redirection
    window.open(qrUrlOrData, '_blank');
  }
}

