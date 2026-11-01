export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: any) {
    return new ApiError(message, 400, details);
  }

  static unauthorized(message = 'Non autorisé.') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Accès interdit.') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Ressource introuvable.') {
    return new ApiError(message, 404);
  }

  static unprocessable(message: string, details?: any) {
    return new ApiError(message, 422, details);
  }

  static internal(message = 'Erreur interne du serveur.', details?: any) {
    return new ApiError(message, 500, details);
  }
}
