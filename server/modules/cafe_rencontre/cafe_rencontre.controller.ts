// server/modules/cafe_rencontre/cafe_rencontre.controller.ts
// Contrôleur de développement local pour le module CAFÉ RENCONTRE (/api/cafe_rencontre.php)

import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { getDb, saveDb } from '../../database/db-connection';
import type { CafeRencontreCampaign, CafeRencontreSpeaker, CafeRencontreRequest } from '../../../src/types/cafeRencontre';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `campagne-${Date.now()}`;
}

function computeExpiration(validityType: string, startsAtStr: string, customExpires?: string): string | null {
  if (validityType === 'unlimited') return null;
  if (validityType === 'custom' && customExpires) {
    return new Date(customExpires).toISOString().replace('T', ' ').substring(0, 19);
  }
  const startTime = startsAtStr ? new Date(startsAtStr).getTime() : Date.now();
  const map: Record<string, number> = {
    '1h': 1, '3h': 3, '6h': 6, '12h': 12, '24h': 24, '48h': 48, '7d': 168
  };
  const hours = map[validityType] || 12;
  return new Date(startTime + hours * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
}

function computeStatus(c: any): 'active' | 'expired' | 'upcoming' | 'disabled' {
  if (!c.is_active) return 'disabled';
  const now = Date.now();
  const starts = new Date(c.starts_at).getTime();
  if (now < starts) return 'upcoming';
  if (c.expires_at) {
    const expires = new Date(c.expires_at).getTime();
    if (now > expires) return 'expired';
  }
  return 'active';
}

function ensureCollections() {
  const db = getDb();
  if (!Array.isArray(db.cafe_rencontre_campaigns)) {
    db.cafe_rencontre_campaigns = [
      {
        id: 1,
        slug: 'reseau-en-action-2026',
        title: 'Réseau en Action – Novembre 2026',
        description: 'Rencontrez les experts et fondateurs du réseau BNE pour un échange personnalisé de 30 minutes sur vos projets et votre développement.',
        event_date: '2026-11-21',
        location: 'Paris & Île-de-France',
        image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        is_active: true,
        validity_type: '12h',
        starts_at: new Date(Date.now() - 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
        expires_at: new Date(Date.now() + 11 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
        contact_redirect_url: '/contact',
        views_count: 14,
        created_at: new Date().toISOString()
      }
    ];
  }
  if (!Array.isArray(db.cafe_rencontre_speakers)) {
    db.cafe_rencontre_speakers = [
      {
        id: 1,
        campaign_id: 1,
        attendee_id: 84,
        display_name: 'Éric Papain MEZATIO',
        job_title: 'Fondateur MDIV Network & Architecte Digital',
        company: 'MDIV Business / BNE',
        photo_url: '/assets/eric.png',
        bio: 'Expert en transformation numérique, automatisation des processus et intelligence artificielle appliquée aux entreprises.',
        expertises: ['Intelligence Artificielle', 'Transformation Digitale', 'Stratégie B2B', 'Fintech'],
        topics: 'Audit d’opportunités IA, structuration de réseau, développement d’outils propriétaires et mise en relation.',
        location_zone: 'Paris / Grand Est / Déplacement sur demande',
        sort_order: 1,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
  }
  if (!Array.isArray(db.cafe_rencontre_requests)) {
    db.cafe_rencontre_requests = [];
  }
  if (!Array.isArray(db.cafe_rencontre_visits)) {
    db.cafe_rencontre_visits = [];
  }
  saveDb(db);
}

export class CafeRencontreController {
  async handleRequest(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj } = ctx;
    const action = urlObj.searchParams.get('action') || parsed.fields?.action;
    ensureCollections();
    const db = getDb();

    try {
      // 0. INIT SCHEMA
      if (action === 'init_schema') {
        return sendJson(res, 200, { success: true, message: 'Schéma Café Rencontre initialisé' });
      }

      // 1. LISTE DES CAMPAGNES (ADMIN)
      if (action === 'list_campaigns') {
        const campaigns = (db.cafe_rencontre_campaigns || []).map((c: any) => {
          const speakersCount = (db.cafe_rencontre_speakers || []).filter((s: any) => s.campaign_id === c.id && s.is_active).length;
          const requestsCount = (db.cafe_rencontre_requests || []).filter((r: any) => r.campaign_id === c.id).length;
          const statusComputed = computeStatus(c);
          return {
            ...c,
            speakers_count: speakersCount,
            requests_count: requestsCount,
            status_computed: statusComputed,
            is_expired: statusComputed === 'expired'
          };
        });
        return sendJson(res, 200, { success: true, campaigns });
      }

      // 2. DÉTAIL D'UNE CAMPAGNE
      if (action === 'get_campaign') {
        const id = Number(urlObj.searchParams.get('id') || parsed.fields?.id || 0);
        const slug = urlObj.searchParams.get('slug') || parsed.fields?.slug;

        const campaign = (db.cafe_rencontre_campaigns || []).find((c: any) => 
          (id > 0 && c.id === id) || (slug && c.slug === slug)
        );
        if (!campaign) {
          return sendJson(res, 404, { success: false, error: 'Campagne introuvable' });
        }

        const speakers = (db.cafe_rencontre_speakers || [])
          .filter((s: any) => s.campaign_id === campaign.id)
          .map((s: any) => {
            const reqCount = (db.cafe_rencontre_requests || []).filter((r: any) => r.speaker_id === s.id).length;
            return {
              ...s,
              requests_count: reqCount,
              expertises: Array.isArray(s.expertises) ? s.expertises : []
            };
          });

        const statusComputed = computeStatus(campaign);
        return sendJson(res, 200, {
          success: true,
          campaign: {
            ...campaign,
            status_computed: statusComputed,
            is_expired: statusComputed === 'expired'
          },
          speakers
        });
      }

      // 3. ENREGISTRER UNE CAMPAGNE (CRÉATION / MODIFICATION)
      if (action === 'save_campaign' && method === 'POST') {
        const data = parsed.fields || {};
        const id = Number(data.id || 0);
        const title = (data.title || '').trim();
        if (!title) throw new Error("Le titre de la campagne est obligatoire");

        const validityType = data.validity_type || '12h';
        const startsAt = data.starts_at || new Date().toISOString().replace('T', ' ').substring(0, 19);
        const expiresAt = computeExpiration(validityType, startsAt, data.expires_at);

        let slug = (data.slug || '').trim() || slugify(title);
        // Éviter les doublons de slug
        const exists = (db.cafe_rencontre_campaigns || []).some((c: any) => c.slug === slug && c.id !== id);
        if (exists) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        let savedCampaign: any;
        if (id > 0) {
          const idx = db.cafe_rencontre_campaigns.findIndex((c: any) => c.id === id);
          if (idx === -1) throw new Error("Campagne inexistante");
          savedCampaign = {
            ...db.cafe_rencontre_campaigns[idx],
            slug,
            title,
            description: data.description || '',
            event_date: data.event_date || null,
            location: data.location || '',
            image_url: data.image_url || '',
            is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
            validity_type: validityType,
            starts_at: startsAt,
            expires_at: expiresAt,
            contact_redirect_url: data.contact_redirect_url || '/contact',
            updated_at: new Date().toISOString()
          };
          db.cafe_rencontre_campaigns[idx] = savedCampaign;
        } else {
          const nextId = (db.cafe_rencontre_campaigns || []).reduce((max: number, c: any) => Math.max(max, c.id || 0), 0) + 1;
          savedCampaign = {
            id: nextId,
            slug,
            title,
            description: data.description || '',
            event_date: data.event_date || null,
            location: data.location || '',
            image_url: data.image_url || '',
            is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
            validity_type: validityType,
            starts_at: startsAt,
            expires_at: expiresAt,
            contact_redirect_url: data.contact_redirect_url || '/contact',
            views_count: 0,
            created_at: new Date().toISOString()
          };
          db.cafe_rencontre_campaigns.push(savedCampaign);
        }
        saveDb(db);
        return sendJson(res, 200, {
          success: true,
          campaign_id: savedCampaign.id,
          slug: savedCampaign.slug,
          message: 'Campagne enregistrée avec succès'
        });
      }

      // 4. SUPPRESSION D'UNE CAMPAGNE
      if (action === 'delete_campaign' && method === 'POST') {
        const id = Number(parsed.fields?.id || 0);
        db.cafe_rencontre_campaigns = (db.cafe_rencontre_campaigns || []).filter((c: any) => c.id !== id);
        db.cafe_rencontre_speakers = (db.cafe_rencontre_speakers || []).filter((s: any) => s.campaign_id !== id);
        saveDb(db);
        return sendJson(res, 200, { success: true, message: 'Campagne supprimée' });
      }

      // 5. BASCULER STATUT ACTIF/INACTIF
      if (action === 'toggle_campaign_status' && method === 'POST') {
        const id = Number(parsed.fields?.id || 0);
        const c = (db.cafe_rencontre_campaigns || []).find((x: any) => x.id === id);
        if (c) {
          c.is_active = !c.is_active;
          saveDb(db);
        }
        return sendJson(res, 200, { success: true, message: 'Statut mis à jour' });
      }

      // 6. PROLONGER LA VALIDITÉ
      if (action === 'extend_campaign_validity' && method === 'POST') {
        const id = Number(parsed.fields?.id || 0);
        const hours = Number(parsed.fields?.hours || 12);
        const c = (db.cafe_rencontre_campaigns || []).find((x: any) => x.id === id);
        if (!c) throw new Error("Campagne introuvable");

        const baseTime = (c.expires_at && new Date(c.expires_at).getTime() > Date.now())
          ? new Date(c.expires_at).getTime()
          : Date.now();
        const newExpires = new Date(baseTime + hours * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
        c.expires_at = newExpires;
        c.is_active = true;
        saveDb(db);
        return sendJson(res, 200, {
          success: true,
          expires_at: newExpires,
          message: `Campagne prolongée de ${hours} heures`
        });
      }

      // 7. LISTE DES INSCRITS ÉLIGIBLES
      if (action === 'list_eligible_attendees') {
        const search = (urlObj.searchParams.get('search') || '').toLowerCase();
        const campaignId = Number(urlObj.searchParams.get('campaign_id') || 0);

        const currentSpeakers = (db.cafe_rencontre_speakers || [])
          .filter((s: any) => s.campaign_id === campaignId)
          .map((s: any) => s.attendee_id);

        let attendees = (db.event_attendees || []).map((a: any) => ({
          id: a.id,
          first_name: a.first_name,
          last_name: a.last_name,
          full_name: `${a.first_name || ''} ${a.last_name || ''}`.trim(),
          email: a.email,
          phone: a.phone,
          company: a.company,
          job_title: a.job_title,
          sector: a.sector,
          photo_url: a.photo_url,
          created_at: a.created_at,
          is_already_selected: currentSpeakers.includes(a.id)
        }));

        if (search) {
          attendees = attendees.filter((a: any) =>
            a.full_name.toLowerCase().includes(search) ||
            (a.company || '').toLowerCase().includes(search) ||
            (a.job_title || '').toLowerCase().includes(search) ||
            (a.email || '').toLowerCase().includes(search)
          );
        }

        return sendJson(res, 200, { success: true, attendees });
      }

      // 8. AJOUTER DES INTERVENANTS À UNE CAMPAGNE
      if (action === 'add_speakers_to_campaign' && method === 'POST') {
        const campaignId = Number(parsed.fields?.campaign_id || 0);
        const attendeeIds: number[] = Array.isArray(parsed.fields?.attendee_ids) ? parsed.fields.attendee_ids : [];

        if (campaignId <= 0) throw new Error("ID de campagne invalide");
        if (attendeeIds.length === 0) throw new Error("Aucun participant sélectionné");

        let maxOrder = (db.cafe_rencontre_speakers || [])
          .filter((s: any) => s.campaign_id === campaignId)
          .reduce((max: number, s: any) => Math.max(max, s.sort_order || 0), 0);

        let insertedCount = 0;
        for (const attId of attendeeIds) {
          const exists = (db.cafe_rencontre_speakers || []).some((s: any) => s.campaign_id === campaignId && s.attendee_id === attId);
          if (exists) continue;

          const att = (db.event_attendees || []).find((a: any) => a.id === attId);
          if (!att) continue;

          maxOrder++;
          const nextId = (db.cafe_rencontre_speakers || []).reduce((max: number, s: any) => Math.max(max, s.id || 0), 0) + 1;
          db.cafe_rencontre_speakers.push({
            id: nextId,
            campaign_id: campaignId,
            attendee_id: attId,
            display_name: `${att.first_name || ''} ${att.last_name || ''}`.trim() || 'Intervenant BNE',
            job_title: att.job_title || '',
            company: att.company || '',
            photo_url: att.photo_url || '',
            bio: att.pitch_text || '',
            expertises: [att.sector || 'Entrepreneuriat'],
            topics: "Stratégie d'entreprise, partenariats et opportunités business.",
            location_zone: '',
            sort_order: maxOrder,
            is_active: true,
            created_at: new Date().toISOString()
          });
          insertedCount++;
        }
        saveDb(db);
        return sendJson(res, 200, {
          success: true,
          inserted_count: insertedCount,
          message: `${insertedCount} intervenant(s) ajouté(s)`
        });
      }

      // 9. METTRE À JOUR UN INTERVENANT
      if (action === 'update_speaker' && method === 'POST') {
        const data = parsed.fields || {};
        const id = Number(data.id || 0);
        const spk = (db.cafe_rencontre_speakers || []).find((s: any) => s.id === id);
        if (!spk) throw new Error("Intervenant introuvable");

        spk.display_name = (data.display_name || '').trim() || spk.display_name;
        spk.job_title = data.job_title || '';
        spk.company = data.company || '';
        spk.photo_url = data.photo_url || '';
        spk.bio = data.bio || '';
        spk.topics = data.topics || '';
        spk.location_zone = data.location_zone || '';
        spk.sort_order = Number(data.sort_order || spk.sort_order || 1);
        spk.is_active = data.is_active !== undefined ? Boolean(data.is_active) : true;
        if (Array.isArray(data.expertises)) {
          spk.expertises = data.expertises;
        }

        saveDb(db);
        return sendJson(res, 200, { success: true, message: 'Intervenant mis à jour' });
      }

      // 10. RETIRER UN INTERVENANT
      if (action === 'remove_speaker' && method === 'POST') {
        const id = Number(parsed.fields?.id || 0);
        db.cafe_rencontre_speakers = (db.cafe_rencontre_speakers || []).filter((s: any) => s.id !== id);
        saveDb(db);
        return sendJson(res, 200, { success: true, message: 'Intervenant retiré de la campagne' });
      }

      // 11. PAGE PUBLIQUE (SCAN QR CODE)
      if (action === 'get_public_campaign') {
        const slug = urlObj.searchParams.get('slug') || parsed.fields?.slug;
        if (!slug) throw new Error("Slug manquant");

        const campaign = (db.cafe_rencontre_campaigns || []).find((c: any) => c.slug === slug);
        if (!campaign) {
          return sendJson(res, 404, {
            success: false,
            status: 'not_found',
            message: 'Session Café Rencontre introuvable.'
          });
        }

        const now = Date.now();
        const starts = new Date(campaign.starts_at).getTime();
        const expires = campaign.expires_at ? new Date(campaign.expires_at).getTime() : null;
        const contactUrl = campaign.contact_redirect_url || '/contact';

        // Statut d'expiration
        if (!campaign.is_active) {
          return sendJson(res, 200, {
            success: true,
            status: 'disabled',
            contact_url: contactUrl,
            message: 'Désolé, cette session de prise de rendez-vous est actuellement fermée.'
          });
        }
        if (now < starts) {
          return sendJson(res, 200, {
            success: true,
            status: 'upcoming',
            contact_url: contactUrl,
            starts_at: campaign.starts_at,
            message: "Cette session de prise de rendez-vous n'est pas encore ouverte. Revenez prochainement."
          });
        }
        if (expires !== null && now > expires) {
          return sendJson(res, 200, {
            success: true,
            status: 'expired',
            contact_url: contactUrl,
            expires_at: campaign.expires_at,
            message: 'Désolé, cette session de prise de rendez-vous est maintenant fermée.'
          });
        }

        // Enregistrer la visite
        campaign.views_count = (campaign.views_count || 0) + 1;
        saveDb(db);

        // Récupérer UNIQUEMENT les intervenants sélectionnés actifs
        const speakers = (db.cafe_rencontre_speakers || [])
          .filter((s: any) => s.campaign_id === campaign.id && s.is_active)
          .sort((a: any, b: any) => (a.sort_order || 1) - (b.sort_order || 1))
          .map((s: any) => ({
            id: s.id,
            display_name: s.display_name,
            job_title: s.job_title,
            company: s.company,
            photo_url: s.photo_url,
            bio: s.bio,
            expertises: Array.isArray(s.expertises) ? s.expertises : [],
            topics: s.topics,
            location_zone: s.location_zone,
            sort_order: s.sort_order
          }));

        return sendJson(res, 200, {
          success: true,
          status: 'active',
          campaign: {
            id: campaign.id,
            slug: campaign.slug,
            title: campaign.title,
            description: campaign.description,
            event_date: campaign.event_date,
            location: campaign.location,
            image_url: campaign.image_url,
            starts_at: campaign.starts_at,
            expires_at: campaign.expires_at,
            contact_redirect_url: contactUrl
          },
          speakers
        });
      }

      // 12. SOUMETTRE UNE DEMANDE DE RENDEZ-VOUS
      if (action === 'submit_booking_request' && method === 'POST') {
        const data = parsed.fields || {};
        const slug = (data.campaign_slug || '').trim();
        const campaignId = Number(data.campaign_id || 0);
        const speakerId = Number(data.speaker_id || 0);

        const campaign = (db.cafe_rencontre_campaigns || []).find((c: any) =>
          (campaignId > 0 && c.id === campaignId) || (slug && c.slug === slug)
        );
        if (!campaign) throw new Error("Campagne introuvable");

        // Vérification stricte d'expiration
        const now = Date.now();
        const starts = new Date(campaign.starts_at).getTime();
        const expires = campaign.expires_at ? new Date(campaign.expires_at).getTime() : null;

        if (!campaign.is_active || now < starts || (expires && now > expires)) {
          return sendJson(res, 403, {
            success: false,
            error: "La période de réservation pour cette rencontre est expirée ou fermée."
          });
        }

        const speaker = (db.cafe_rencontre_speakers || []).find((s: any) => s.id === speakerId && s.campaign_id === campaign.id);
        if (!speaker) throw new Error("Intervenant sélectionné introuvable");

        const requesterName = (data.requester_name || '').trim();
        const companyName = (data.company_name || '').trim();
        const email = (data.email || '').trim();
        const mainTopic = (data.main_topic || '').trim();
        const city = (data.city || '').trim();

        if (!requesterName) throw new Error("Votre nom et prénom sont obligatoires");
        if (!companyName) throw new Error("Le nom de votre entreprise est obligatoire");
        if (!email || !email.includes('@')) throw new Error("Adresse e-mail valide obligatoire");
        if (!mainTopic) throw new Error("Veuillez choisir un sujet pour votre échange");
        if (!city) throw new Error("Veuillez renseigner votre ville");

        const nextId = (db.cafe_rencontre_requests || []).reduce((max: number, r: any) => Math.max(max, r.id || 0), 0) + 1;
        const newReq = {
          id: nextId,
          campaign_id: campaign.id,
          speaker_id: speaker.id,
          campaign_title: campaign.title,
          campaign_slug: campaign.slug,
          speaker_name: speaker.display_name,
          speaker_company: speaker.company,
          requester_name: requesterName,
          company_name: companyName,
          job_title: data.job_title || '',
          email,
          phone: data.phone || '',
          website: data.website || '',
          sector: data.sector || '',
          main_topic: mainTopic,
          secondary_topics: Array.isArray(data.secondary_topics) ? data.secondary_topics : [],
          need_description: data.need_description || '',
          meeting_format: data.meeting_format || 'client_premises',
          city,
          postal_code: data.postal_code || '',
          availability: data.availability || 'flexible',
          preferred_date: data.preferred_date || '',
          additional_comment: data.additional_comment || '',
          consent_accepted: true,
          consent_at: new Date().toISOString(),
          status: 'new',
          admin_notes: '',
          created_at: new Date().toISOString()
        };

        db.cafe_rencontre_requests.push(newReq);
        saveDb(db);

        return sendJson(res, 200, {
          success: true,
          request_id: nextId,
          speaker_name: speaker.display_name,
          campaign_title: campaign.title,
          meeting_format: newReq.meeting_format,
          message: 'Votre demande de Café Rencontre a bien été enregistrée !'
        });
      }

      // 13. LISTE DES DEMANDES (ADMIN)
      if (action === 'list_requests') {
        const campaignId = Number(urlObj.searchParams.get('campaign_id') || 0);
        const speakerId = Number(urlObj.searchParams.get('speaker_id') || 0);
        const status = urlObj.searchParams.get('status') || '';
        const search = (urlObj.searchParams.get('search') || '').toLowerCase();
        const city = (urlObj.searchParams.get('city') || '').toLowerCase();

        let reqs = [...(db.cafe_rencontre_requests || [])];

        if (campaignId > 0) reqs = reqs.filter((r: any) => r.campaign_id === campaignId);
        if (speakerId > 0) reqs = reqs.filter((r: any) => r.speaker_id === speakerId);
        if (status && status !== 'all') reqs = reqs.filter((r: any) => r.status === status);
        if (city) reqs = reqs.filter((r: any) => (r.city || '').toLowerCase().includes(city));
        if (search) {
          reqs = reqs.filter((r: any) =>
            (r.requester_name || '').toLowerCase().includes(search) ||
            (r.company_name || '').toLowerCase().includes(search) ||
            (r.email || '').toLowerCase().includes(search)
          );
        }

        reqs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const stats: Record<string, number> = {
          total: reqs.length,
          new: 0,
          to_contact: 0,
          contact_established: 0,
          to_schedule: 0,
          confirmed: 0,
          completed: 0,
          closed: 0,
          cancelled: 0
        };

        for (const r of reqs) {
          if (stats[r.status] !== undefined) stats[r.status]++;
        }

        return sendJson(res, 200, { success: true, requests: reqs, stats });
      }

      // 14. METTRE À JOUR LE STATUT D'UNE DEMANDE
      if (action === 'update_request_status' && method === 'POST') {
        const id = Number(parsed.fields?.id || 0);
        const status = parsed.fields?.status;
        const notes = parsed.fields?.admin_notes;

        const req = (db.cafe_rencontre_requests || []).find((r: any) => r.id === id);
        if (!req) throw new Error("Demande introuvable");

        if (status) req.status = status;
        if (notes !== undefined) req.admin_notes = notes;
        req.updated_at = new Date().toISOString();

        saveDb(db);
        return sendJson(res, 200, { success: true, message: 'Statut mis à jour' });
      }

      return sendJson(res, 400, { error: `Action Café Rencontre non reconnue : ${action}` });
    } catch (err: any) {
      return handleHttpError(res, err);
    }
  }
}

export const cafeRencontreController = new CafeRencontreController();
