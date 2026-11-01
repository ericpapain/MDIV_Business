// src/pages/EventRegistrationPage.tsx
// Page publique d'inscription dédiée pour chaque événement (/evenements/:id/inscription)

import { useParams, Link, useNavigate } from 'react-router-dom';
import { PublicEventRegistrationModal } from '@/components/events/PublicEventRegistrationModal';
import { ArrowLeft } from 'lucide-react';

export default function EventRegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-28 pb-16 container max-w-4xl mx-auto px-4">
      <div className="mb-6">
        <Link
          to="/evenements"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à la liste des événements
        </Link>
      </div>

      {id && (
        <PublicEventRegistrationModal
          eventId={Number(id)}
          isOpen={true}
          onClose={() => navigate('/evenements')}
        />
      )}
    </div>
  );
}

