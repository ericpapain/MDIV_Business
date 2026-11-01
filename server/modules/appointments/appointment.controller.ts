import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { appointmentService } from './appointment.service';

export class AppointmentController {
  async handleAppointments(ctx: RequestContext, parsed: ParsedRequest) {
    const { req, res, method, urlObj, companyId } = ctx;
    try {
      if (method === 'GET') {
        const list = appointmentService.getAppointments(companyId);
        return sendJson(res, 200, list);
      }

      if (method === 'POST') {
        const created = appointmentService.createAppointment(companyId, parsed.fields);
        return sendJson(res, 201, { success: true, appointment: created });
      }

      if (method === 'PUT') {
        const id = urlObj.searchParams.get('id');
        const updated = appointmentService.updateAppointment(id!, parsed.fields);
        return sendJson(res, 200, { success: true, appointment: updated });
      }

      if (method === 'DELETE') {
        const id = urlObj.searchParams.get('id');
        appointmentService.deleteAppointment(id!);
        return sendJson(res, 200, { success: true });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleSettings(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method } = ctx;
    try {
      if (method === 'GET') {
        const settings = appointmentService.getSettings();
        return sendJson(res, 200, { success: true, settings });
      }
      if (method === 'POST') {
        const saved = appointmentService.saveSettings(parsed.fields);
        return sendJson(res, 200, { success: true, settings: saved });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleBookingLinks(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, urlObj, companyId } = ctx;
    try {
      if (method === 'GET') {
        const token = urlObj.searchParams.get('token');
        if (!token) {
          // Liste
          const dbLinks = appointmentService.getAppointments(companyId); // fallback or get links
          return sendJson(res, 200, dbLinks);
        }
        const data = appointmentService.getBookingLinkByToken(token);
        return sendJson(res, 200, { success: true, ...data });
      }

      if (method === 'POST') {
        const link = appointmentService.createBookingLink(companyId, parsed.fields);
        return sendJson(res, 201, { success: true, link });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }

  async handleNotifications(ctx: RequestContext, parsed: ParsedRequest) {
    const { res, method, companyId } = ctx;
    try {
      if (method === 'GET') {
        const list = appointmentService.getNotifications(companyId);
        return sendJson(res, 200, list);
      }

      if (method === 'POST') {
        const { action } = parsed.fields;
        if (action === 'mark_read') {
          appointmentService.markNotificationsRead();
        } else if (action === 'clear') {
          appointmentService.clearNotifications();
        }
        return sendJson(res, 200, { success: true });
      }
    } catch (err) {
      return handleHttpError(res, err);
    }
  }
}

export const appointmentController = new AppointmentController();
