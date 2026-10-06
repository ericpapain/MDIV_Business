/**
 * Visuel illustratif des services IA.
 * Remplace les anciennes vidéos tierces (droits d'auteur) par une illustration originale.
 */
export default function ServiceHeroImage({ alt = "Illustration du service IA MDIV Business" }: { alt?: string }) {
  return (
    <img
      src="/images/service-ia-visual.jpg"
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover"
    />
  );
}
