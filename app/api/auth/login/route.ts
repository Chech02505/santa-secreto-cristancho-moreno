import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { startSession, getSession } from '@/lib/session';
import { errorResponse, normalizeUsername, parseJson, passwordValid, safeEquals, textField, validUsername } from '@/lib/security';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (await getSession()) return errorResponse('Ya hay una sesión iniciada en este dispositivo.', 409);
    const data = await parseJson(request);
    const username = normalizeUsername(textField(data.username));
    const password = typeof data.password === 'string' ? data.password : '';
    if (!validUsername(username) || !passwordValid(password)) return errorResponse('Usuario o contraseña incorrectos.', 401);
    const sql = db();
    const attempts = await sql`SELECT failures, blocked_until FROM login_attempts WHERE username=${username}`;
    if (attempts.length && attempts[0].blocked_until && new Date(String(attempts[0].blocked_until)).getTime() > Date.now()) {
      return errorResponse('Demasiados intentos. Prueba nuevamente dentro de 15 minutos.', 429);
    }
    const adminUsername = normalizeUsername(process.env.ADMIN_USERNAME || 'organizador');
    let id = '';
    let role: 'admin' | 'participant' = 'participant';
    let valid = false;
    if (username === adminUsername) {
      role = 'admin'; id = 'family-admin';
      const adminPassword = process.env.ADMIN_PASSWORD || '';
      valid = adminPassword.length >= 12 && safeEquals(password, adminPassword);
    } else {
      const rows = await sql`SELECT id, password_hash FROM participants WHERE username=${username}`;
      if (rows.length) {
        id = String(rows[0].id);
        valid = await compare(password, String(rows[0].password_hash));
      }
    }
    if (!valid) {
      await sql`INSERT INTO login_attempts(username,failures,blocked_until) VALUES(${username},1,NULL)
        ON CONFLICT(username) DO UPDATE SET
          failures=CASE WHEN login_attempts.blocked_until < now() THEN 1 ELSE login_attempts.failures+1 END,
          blocked_until=CASE WHEN login_attempts.blocked_until < now() THEN NULL WHEN login_attempts.failures+1 >= 5 THEN now()+interval '15 minutes' ELSE NULL END`;
      return errorResponse('Usuario o contraseña incorrectos.', 401);
    }
    await sql`DELETE FROM login_attempts WHERE username=${username}`;
    await startSession(id, role);
    return Response.json({ role }, { headers: { 'Cache-Control':'no-store' } });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && error.message.startsWith('Solicitud'))) return errorResponse('Solicitud inválida.', 400);
    console.error('Login failed', error instanceof Error ? error.name : 'unknown');
    return errorResponse('No fue posible iniciar sesión.', 500);
  }
}
