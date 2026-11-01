import type { Plugin, ViteDevServer } from 'vite';
import { dispatchDevApi } from './app';
import { handleDevAnalyticsRequest } from '../vite-dev-analytics';
import { handleDevMailRequest } from '../vite-dev-mail';
import { handleDevTeamRequest } from '../vite-dev-team';

import { requireApiAuth } from './shared/middleware/auth.middleware';

export function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-server',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const urlObj = new URL(req.url || '/', 'http://localhost:8080');
          const pathname = urlObj.pathname;

          // 1. Immediately pass all non-API requests (HTML, JS, CSS, assets) to Vite
          if (!pathname.startsWith('/api/') && !pathname.startsWith('/api-')) {
            return next();
          }

          // 2. Global CORS Preflight for any API route
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
            res.end();
            return;
          }

          // 3. Contrôle d'authentification et de sécurité strict côté Backend
          const authResult = requireApiAuth(req, res, urlObj, pathname);
          if (!authResult.allowed) {
            return; // Réponse 401 ou 403 déjà envoyée
          }

          // Attachement du contexte d'authentification vérifié
          if (authResult.companyId) {
            (req as any).authCompanyId = authResult.companyId;
            (req as any).authRole = authResult.role;
          }

          // 4. Analytics Engine Sub-Handler (must always finish the response)
          if (pathname === '/api-analytics.php') {
            await handleDevAnalyticsRequest(req, res, urlObj);
            return;
          }

          // 4. Delegated Mail / Messaging Sub-Handler
          if (pathname.startsWith('/api/integrations/') && await handleDevMailRequest(req, res, urlObj, pathname)) {
            return;
          }

          // 5. Delegated Team & Roles Sub-Handler
          if ((pathname === '/api/team.php' || pathname === '/api/roles.php' || pathname === '/api/team_activity.php') && await handleDevTeamRequest(req, res, urlObj, pathname)) {
            return;
          }

          // 6. Central Dispatcher across all DDD domain modules
          const handled = await dispatchDevApi(req, res);
          if (handled) return;

          // 7. Unknown API Route: Always return 404 JSON, NEVER call next()
          if (!res.headersSent) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: `Endpoint API non trouvé: ${pathname}` }));
          }
        } catch (err: any) {
          console.error('[devApiPlugin] Error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: err.message || "Erreur interne du serveur de développement." }));
          }
        }
      });
    },
  };
}
