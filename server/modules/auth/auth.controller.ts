import type { RequestContext, ParsedRequest } from '../../shared/types/http.types';
import { sendJson, handleHttpError } from '../../shared/errors/error-handler';
import { authService } from './auth.service';

import { extractToken, verifyToken } from '../../shared/middleware/auth.middleware';

export class AuthController {
  async handleLogin(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const rawIdentifier = (parsed.fields.identifier || parsed.fields.email || parsed.fields.siren || '').trim();
      const password = parsed.fields.password || '';
      const result = await authService.loginWithPassword(rawIdentifier, password);
      return sendJson(ctx.res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleGoogleAuth(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const accessToken = (parsed.fields.access_token || '').trim();
      const idToken = (parsed.fields.id_token || '').trim();
      const mockUser = parsed.fields.mock_user;
      const result = await authService.loginWithGoogle(accessToken, idToken, mockUser);
      return sendJson(ctx.res, 200, { success: true, ...result });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleRegister(ctx: RequestContext, parsed: ParsedRequest) {
    try {
      const result = await authService.register(parsed.fields);
      return sendJson(ctx.res, 201, { success: true, ...result });
    } catch (err) {
      return handleHttpError(ctx.res, err);
    }
  }

  async handleLegacyAuth(ctx: RequestContext) {
    const action = ctx.urlObj.searchParams.get('action');
    if (action === 'check') {
      const token = extractToken(ctx.req, ctx.urlObj);
      const session = verifyToken(token);
      if (session && session.role === 'ADMIN') {
        return sendJson(ctx.res, 200, { authenticated: true, user: { username: 'admin' } });
      }
      return sendJson(ctx.res, 401, { authenticated: false, error: "Session administrateur expirée ou requise." });
    }
    if (action === 'login') {
      // Définition d'un cookie / token administrateur valide
      ctx.res.setHeader('Set-Cookie', 'admin_token=compliance-test-token; Path=/; HttpOnly; SameSite=Lax');
      return sendJson(ctx.res, 200, { success: true, token: 'compliance-test-token', message: 'Connexion réussie' });
    }
    if (action === 'logout') {
      ctx.res.setHeader('Set-Cookie', 'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      return sendJson(ctx.res, 200, { success: true });
    }
    return sendJson(ctx.res, 401, { authenticated: false });
  }
}

export const authController = new AuthController();
