import type http from 'http';
import { ApiError } from './api-error';

export function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  if (res.headersSent) return;
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(data));
}

export function handleHttpError(res: http.ServerResponse, error: any) {
  if (res.headersSent) return;
  if (error instanceof ApiError) {
    return sendJson(res, error.statusCode, {
      success: false,
      error: error.message,
      details: error.details,
    });
  }

  const message = error?.message || 'Erreur interne du serveur.';
  return sendJson(res, 500, {
    success: false,
    error: message,
  });
}
