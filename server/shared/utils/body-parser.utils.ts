import type http from 'http';
import path from 'path';
import zlib from 'zlib';
import mammoth from 'mammoth';
import type { ParsedRequest } from '../types/http.types';

export async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.docx') {
    try {
      const res = await mammoth.extractRawText({ buffer });
      if (res.value && res.value.trim().length > 0) {
        return res.value.trim();
      }
    } catch (e) {
      console.warn('[Parser] Erreur extraction DOCX:', e);
    }
  }

  if (ext === '.pdf') {
    try {
      let extracted = '';
      const raw = buffer.toString('binary');
      const streams = raw.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g);
      if (streams) {
        for (const s of streams) {
          const inner = s.replace(/^stream[\r\n]+/, '').replace(/[\r\n]+endstream$/, '');
          try {
            const uncompressed = zlib.inflateSync(Buffer.from(inner, 'binary')).toString('utf-8');
            const matches = uncompressed.match(/\((.*?)\)[\r\n]*Tj/g);
            if (matches) {
              extracted += matches.map(m => m.replace(/^[\(\s]+/, '').replace(/[\)\sTj]+$/, '')).join(' ') + ' ';
            }
          } catch {}
        }
      }
      if (extracted.trim().length > 20) {
        return extracted.trim();
      }
    } catch {}
  }

  // Fallback UTF-8 text
  const asText = buffer.toString('utf-8');
  const isPrintable = /^[\x20-\x7E\r\n\t\u00A0-\uFFFF]*$/.test(asText.slice(0, 500));
  if (isPrintable && asText.trim().length > 0) {
    return asText.trim();
  }
  return '';
}

export function parseRequestBody(req: http.IncomingMessage): Promise<ParsedRequest> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); });
    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';

      if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(buffer.toString('utf-8'));
          return resolve({ fields: parsed, files: [] });
        } catch {
          return resolve({ fields: {}, files: [] });
        }
      }

      if (contentType.includes('multipart/form-data')) {
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;

        if (boundary) {
          const rawString = buffer.toString('binary');
          const parts = rawString.split('--' + boundary);
          const fields: Record<string, any> = {};
          const files: Array<{ name: string; filename: string; text: string; buffer?: Buffer }> = [];

          for (const part of parts) {
            if (!part || part.trim() === '' || part.trim() === '--') continue;
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd === -1) continue;

            const headerPart = part.slice(0, headerEnd);
            const bodyPart = part.slice(headerEnd + 4).replace(/\r\n$/, '');

            const nameMatch = headerPart.match(/name="([^"]+)"/i);
            const filenameMatch = headerPart.match(/filename="([^"]+)"/i);

            if (nameMatch) {
              const fieldName = nameMatch[1];
              if (filenameMatch) {
                const filename = filenameMatch[1];
                const bodyBuffer = Buffer.from(bodyPart, 'binary');
                const textContent = await extractTextFromBuffer(bodyBuffer, filename);
                files.push({ name: fieldName, filename, text: textContent, buffer: bodyBuffer });
              } else {
                fields[fieldName] = Buffer.from(bodyPart, 'binary').toString('utf-8');
              }
            }
          }
          return resolve({ fields, files });
        }
      }

      // Fallback x-www-form-urlencoded
      try {
        const str = buffer.toString('utf-8');
        const params = new URLSearchParams(str);
        const fields: Record<string, any> = {};
        params.forEach((v, k) => { fields[k] = v; });
        return resolve({ fields, files: [] });
      } catch {
        return resolve({ fields: {}, files: [] });
      }
    });
  });
}
