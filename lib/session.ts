import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const cookieName = 'santa_cm_session';
type Role = 'admin' | 'participant';
export type Session = { id: string; role: Role };

function key() {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 32) throw new Error('APP_SECRET debe tener al menos 32 caracteres');
  return new TextEncoder().encode(secret);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(cookieName)?.value;
  if (!value) return null;
  try {
    const verified = await jwtVerify(value, key(), { issuer: 'santa-cristancho' });
    const role = verified.payload.role;
    const id = verified.payload.sub;
    if (!id || (role !== 'admin' && role !== 'participant')) return null;
    return { id, role };
  } catch {
    return null;
  }
}

export async function startSession(id: string, role: Role) {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('santa-cristancho')
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(key());
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 14 * 24 * 60 * 60,
    path: '/'
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(cookieName);
}
