// server/modules/events/event.controller.ts
// Contrôleur HTTP pour MDIV EVENT ENGINE

import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { eventService } from './event.service';

export class EventController {
  // 1. API Publique des événements (compatibilité /api-public.php?action=events)
  async handlePublicEvents(ctx: RequestContext) {
    try {
      const type = ctx.urlObj.searchParams.get('type') || undefined;
      const data = eventService.getEvents(type);
      return sendJson(ctx.res, 200, { success: true, data });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  // 2. API Admin des événements (/api-admin.php?action=add_event | edit_event | delete_event)
  async handleAdminEvents(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj } = ctx;
    const action = urlObj.searchParams.get('action');

    try {
      if (action === 'events' || (!action && method === 'GET')) {
        const data = eventService.getEvents();
        return sendJson(res, 200, { success: true, data });
      }

      if (action === 'add_event' || action === 'edit_event') {
        const saved = eventService.saveEvent(parsed.fields);
        return sendJson(res, 200, { success: true, event: saved });
      }

      if (action === 'delete_event') {
        const id = parsed.fields?.id || urlObj.searchParams.get('id');
        if (!id) throw new Error("ID d'événement manquant");
        eventService.deleteEvent(Number(id));
        return sendJson(res, 200, { success: true });
      }

      return sendJson(res, 400, { error: `Action admin non reconnue : ${action}` });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  // 3. API Centralisée Event Engine (/api/event_engine.php)
  async handleEventEngine(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj } = ctx;
    const action = urlObj.searchParams.get('action') || parsed.fields?.action;

    try {
      // --- DÉTAIL D'UN ÉVÉNEMENT AVEC SES CHAMPS ---
      if (action === 'get_event') {
        const id = urlObj.searchParams.get('id') || parsed.fields?.id;
        if (!id) throw new Error("ID événement requis");
        const event = eventService.getEventById(Number(id));
        if (!event) return sendJson(res, 404, { error: "Événement non trouvé" });
        return sendJson(res, 200, { success: true, data: event });
      }

      // --- CONSTRUCTEUR DE QUESTIONS PERSONNALISÉES ---
      if (action === 'get_custom_fields') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const fields = eventService.getCustomFields(Number(eventId));
        return sendJson(res, 200, { success: true, data: fields });
      }

      if (action === 'save_custom_field') {
        const eventId = parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const saved = eventService.saveCustomField(Number(eventId), parsed.fields);
        return sendJson(res, 200, { success: true, data: saved });
      }

      if (action === 'delete_custom_field') {
        const id = parsed.fields?.field_id || parsed.fields?.id || urlObj.searchParams.get('id') || urlObj.searchParams.get('field_id');
        if (!id) throw new Error("ID de champ requis");
        eventService.deleteCustomField(Number(id));
        return sendJson(res, 200, { success: true, message: "Question supprimée avec succès" });
      }

      if (action === 'duplicate_custom_field' && method === 'POST') {
        const eventId = parsed.fields?.event_id;
        const fieldId = parsed.fields?.field_id || parsed.fields?.id;
        if (!eventId || !fieldId) throw new Error("event_id et field_id requis");
        const dup = eventService.duplicateCustomField(Number(eventId), Number(fieldId));
        return sendJson(res, 200, { success: true, data: dup, message: "Question dupliquée avec succès" });
      }

      if (action === 'reorder_custom_fields' && method === 'POST') {
        const eventId = parsed.fields?.event_id;
        const orderedIds = parsed.fields?.ordered_ids || [];
        if (!eventId) throw new Error("event_id requis");
        eventService.reorderCustomFields(Number(eventId), orderedIds);
        return sendJson(res, 200, { success: true, message: "Ordre mis à jour" });
      }

      if (action === 'duplicate_event' && method === 'POST') {
        const eventId = parsed.fields?.event_id || parsed.fields?.id;
        if (!eventId) throw new Error("event_id requis");
        const dupEvent = eventService.duplicateEvent(Number(eventId));
        return sendJson(res, 200, { success: true, data: dupEvent, message: "Événement dupliqué avec succès" });
      }

      if (action === 'archive_event' && method === 'POST') {
        const eventId = parsed.fields?.event_id || parsed.fields?.id;
        if (!eventId) throw new Error("event_id requis");
        const archEvent = eventService.archiveEvent(Number(eventId));
        return sendJson(res, 200, { success: true, data: archEvent, message: "Statut d'archivage mis à jour" });
      }

      // --- INSCRIPTION PUBLIQUE DU PARTICIPANT ---
      if (action === 'register' && method === 'POST') {
        const result = await eventService.registerAttendee(parsed.fields);
        return sendJson(res, 200, result);
      }

      // --- GESTION DES INSCRITS / CRM ---
      if (action === 'get_attendees') {
        const eventId = urlObj.searchParams.get('event_id') ? Number(urlObj.searchParams.get('event_id')) : undefined;
        const attendees = eventService.getAttendees(eventId);
        return sendJson(res, 200, { success: true, data: attendees });
      }

      // --- SUPPRESSION D'INSCRIPTION / PARTICIPANT ---
      if (action === 'delete_attendee' && method === 'POST') {
        const attendeeId = parsed.fields?.attendee_id || parsed.fields?.id || urlObj.searchParams.get('id');
        if (!attendeeId) throw new Error("attendee_id requis");
        eventService.deleteAttendee(Number(attendeeId));
        return sendJson(res, 200, { success: true, message: "Inscription supprimée avec succès" });
      }

      // --- ÉMARGEMENT / CHECK-IN ---
      if (action === 'check_in' && method === 'POST') {
        const ticketCode = parsed.fields?.ticket_code;
        const checkedInBy = parsed.fields?.checked_in_by || "Sandra / Accueil";
        if (!ticketCode) throw new Error("ticket_code requis");
        const result = eventService.checkInAttendee(ticketCode, checkedInBy);
        return sendJson(res, 200, {
          success: true,
          data: result.attendee,
          already_checked_in: result.already_checked_in,
          message: result.already_checked_in
            ? `Participant déjà émargé (${result.attendee.first_name} ${result.attendee.last_name})`
            : `Émargement validé avec succès pour ${result.attendee.first_name} ${result.attendee.last_name}`
        });
      }

      if (action === 'self_check_in' && method === 'POST') {
        const eventId = Number(parsed.fields?.event_id);
        const emailQuery = parsed.fields?.email_query;
        if (!eventId || !emailQuery) throw new Error("event_id et email_query requis");
        const result = eventService.selfCheckInAttendee(eventId, emailQuery);
        return sendJson(res, 200, {
          success: true,
          data: result.attendee,
          already_checked_in: result.already_checked_in,
          message: result.already_checked_in
            ? `Bienvenue ${result.attendee.first_name} ! Vous êtes déjà enregistré.`
            : `Bienvenue ${result.attendee.first_name} ${result.attendee.last_name} ! Présence confirmée.`
        });
      }


      // --- PITCH ENTREPRISE (CANDIDATURE, MODÉRATION, SHOWCASE) ---
      if (action === 'get_pitches') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const status = urlObj.searchParams.get('status') || parsed.fields?.status;
        const pitches = eventService.getPitches(Number(eventId), status);
        return sendJson(res, 200, { success: true, data: pitches });
      }

      if (action === 'submit_pitch' && method === 'POST') {
        const pitch = eventService.submitPitch(parsed.fields);
        return sendJson(res, 200, { success: true, data: pitch, message: "Candidature au pitch transmise avec succès." });
      }

      if (action === 'moderate_pitch' && method === 'POST') {
        const pitchId = parsed.fields?.pitch_id || parsed.fields?.id;
        const status = parsed.fields?.status;
        if (!pitchId || !status) throw new Error("pitch_id et status requis");
        const pitch = eventService.moderatePitch(Number(pitchId), status, parsed.fields);
        return sendJson(res, 200, { success: true, data: pitch, message: `Pitch ${status === 'approved' ? 'validé' : 'refusé'}.` });
      }

      if (action === 'reorder_pitches' && method === 'POST') {
        const eventId = parsed.fields?.event_id;
        const orderedIds = parsed.fields?.ordered_ids;
        if (!eventId || !Array.isArray(orderedIds)) throw new Error("event_id et ordered_ids requis");
        eventService.reorderPitches(Number(eventId), orderedIds);
        return sendJson(res, 200, { success: true });
      }

      // --- RÉSERVATIONS DE RENDEZ-VOUS 1-TO-1 (B2B MEETINGS) ---
      if (action === 'get_meeting_slots') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const partnerId = urlObj.searchParams.get('partner_id') ? Number(urlObj.searchParams.get('partner_id')) : undefined;
        const slots = eventService.getMeetingSlots(Number(eventId), partnerId);
        return sendJson(res, 200, { success: true, data: slots });
      }

      if (action === 'create_meeting_slot' && method === 'POST') {
        const slot = eventService.createMeetingSlot(parsed.fields);
        return sendJson(res, 200, { success: true, data: slot });
      }

      if (action === 'delete_meeting_slot' && method === 'POST') {
        const slotId = parsed.fields?.slot_id || parsed.fields?.id || urlObj.searchParams.get('id');
        if (!slotId) throw new Error("slot_id requis");
        eventService.deleteMeetingSlot(Number(slotId));
        return sendJson(res, 200, { success: true });
      }

      if (action === 'book_meeting' && method === 'POST') {
        const result = eventService.bookMeeting(parsed.fields);
        return sendJson(res, 200, { success: true, ...result, message: "Rendez-vous 1-to-1 confirmé et synchronisé avec le CRM." });
      }

      if (action === 'cancel_meeting' && method === 'POST') {
        const bookingId = parsed.fields?.booking_id || parsed.fields?.id;
        const reason = parsed.fields?.reason || "";
        if (!bookingId) throw new Error("booking_id requis");
        const result = eventService.cancelMeeting(Number(bookingId), reason);
        return sendJson(res, 200, { success: true, data: result, message: "Rendez-vous annulé et créneau libéré." });
      }

      if (action === 'get_meeting_bookings') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const bookings = eventService.getMeetingBookings(Number(eventId));
        return sendJson(res, 200, { success: true, data: bookings });
      }

      // --- TOMBOLA & TIRAGE AU SORT SÉCURISÉ ---
      if (action === 'get_tombola_config' || action === 'get_tombola_prizes') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        if (!eventId) {
          const prizes = eventService.getPublicTombolaPrizes();
          return sendJson(res, 200, { success: true, data: { prizes, draws: [] } });
        }
        const prizes = eventService.getTombolaPrizes(Number(eventId));
        const history = eventService.getTombolaHistory(Number(eventId));
        return sendJson(res, 200, { success: true, data: { prizes, draws: history.draws } });
      }

      if (action === 'get_public_tombola_prizes' || action === 'tombola_prizes') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        const prizes = eventService.getPublicTombolaPrizes(eventId ? Number(eventId) : undefined);
        return sendJson(res, 200, { success: true, data: prizes });
      }

      if (action === 'save_tombola_prize' && method === 'POST') {
        const eventId = parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const prize = eventService.saveTombolaPrize(Number(eventId), parsed.fields);
        return sendJson(res, 200, { success: true, data: prize, prize });
      }

      if (action === 'delete_tombola_prize' && method === 'POST') {
        const prizeId = parsed.fields?.prize_id || parsed.fields?.id || urlObj.searchParams.get('id');
        if (!prizeId) throw new Error("prize_id requis");
        eventService.deleteTombolaPrize(Number(prizeId));
        return sendJson(res, 200, { success: true, message: "Lot supprimé avec succès" });
      }

      if (action === 'toggle_tombola_prize_status' && method === 'POST') {
        const prizeId = parsed.fields?.prize_id || parsed.fields?.id;
        if (!prizeId) throw new Error("prize_id requis");
        const newStatus = eventService.toggleTombolaPrizeStatus(Number(prizeId), parsed.fields?.is_active);
        return sendJson(res, 200, { success: true, is_active: newStatus ? 1 : 0 });
      }

      if (action === 'reorder_tombola_prizes' && method === 'POST') {
        const prizes = parsed.fields?.prizes;
        if (!prizes) throw new Error("prizes requis");
        eventService.reorderTombolaPrizes(prizes);
        return sendJson(res, 200, { success: true, message: "Ordre mis à jour" });
      }

      if ((action === 'execute_tombola_draw' || action === 'draw_tombola') && method === 'POST') {
        const eventId = parsed.fields?.event_id;
        const prizeId = parsed.fields?.prize_id;
        const rules = parsed.fields?.rules;
        if (!eventId || !prizeId) throw new Error("event_id et prize_id requis");
        const result = eventService.executeTombolaDraw(Number(eventId), Number(prizeId), rules);
        return sendJson(res, 200, { success: true, ...result, data: result.draw, message: `Gagnant tiré au sort avec succès !` });
      }

      if (action === 'get_tombola_history') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const history = eventService.getTombolaHistory(Number(eventId));
        return sendJson(res, 200, { success: true, data: history });
      }

      if (action === 'reset_tombola_draws' && method === 'POST') {
        const eventId = parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        eventService.resetTombolaDraws(Number(eventId));
        return sendJson(res, 200, { success: true, message: "Tirages réinitialisés avec succès." });
      }

      // --- NETWORKING WALL ---
      if (action === 'get_networking_wall') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const sector = urlObj.searchParams.get('sector') || undefined;
        const search = urlObj.searchParams.get('search') || undefined;
        const wall = eventService.getNetworkingWall(Number(eventId), { sector, search });
        return sendJson(res, 200, { success: true, data: wall });
      }

      // --- RÉGIE LIVE & ÉCRAN DE DIFFUSION (EVENT LIVE DISPLAY & CONTROL) ---
      if (action === 'get_live_state') {
        const eventId = urlObj.searchParams.get('event_id') || parsed.fields?.event_id;
        if (!eventId) throw new Error("event_id requis");
        const liveState = eventService.getLiveState(Number(eventId));
        return sendJson(res, 200, { success: true, ...liveState, data: liveState });
      }

      if (action === 'update_live_state' && method === 'POST') {
        const eventId = parsed.fields?.event_id || urlObj.searchParams.get('event_id');
        if (!eventId) throw new Error("event_id requis");
        const updated = eventService.updateLiveState(Number(eventId), parsed.fields);
        return sendJson(res, 200, { success: true, data: updated, message: "État de la régie LIVE synchronisé." });
      }

      return sendJson(res, 400, { error: `Action event_engine non supportée : ${action}` });
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const eventController = new EventController();

