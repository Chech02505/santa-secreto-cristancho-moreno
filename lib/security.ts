import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

export const normalizeUsername = (value: string) => value.trim().toLowerCase();

export function validUsername(value: string) {
  return /^[a-z0-9][a-z0-9._-]{2,23}$/.test(value);
}

export function safeEquals(a: string, b: string) {
  const digestA = createHash('sha256').update(a).digest();
  const digestB = createHash('sha256').update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

export function passwordValid(value: string) {
  const bytes = Buffer.byteLength(value, 'utf8');
  return bytes >= 8 && bytes <= 72;
}

export function checkJsonRequest(req: Request) {
  if (!req.headers.get('content-type')?.toLowerCase().includes('application/json')) return false;
  const site = req.headers.get('sec-fetch-site');
  if (site === 'cross-site') return false;
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const requestHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
    return Boolean(requestHost) && new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function parseJson(req: Request) {
  if (!checkJsonRequest(req)) throw new Error('Solicitud no permitida');
  if (Number(req.headers.get('content-length') || 0) > 9000) throw new Error('Solicitud demasiado grande');
  return req.json() as Promise<Record<string, unknown>>;
}

export function textField(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
