import type http from 'http';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

export interface RequestContext {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  urlObj: URL;
  pathname: string;
  method: HttpMethod;
  companyId: number;
  userId?: string | number;
}

export interface ParsedRequest {
  fields: Record<string, any>;
  files: Array<{
    name: string;
    filename: string;
    text: string;
    buffer?: Buffer;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
