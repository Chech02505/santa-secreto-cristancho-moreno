import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { startSession, getSession } from '@/lib/session';
import { errorResponse, normalizeUsername, parseJson, passwordValid, safeEquals, textField, validUsername } from '@/lib/security';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (await getSession()) return errorResponse('Cierra tu sesión antes de inscribir otro usuario.', 409);
    const data = await parseJson(request);
    const displayName = textField(data.displayName);
    const username = normalizeUsername(textField(data.username));
    const password = typeof data.password === 'string' ? data.password : '';
    const wishes = textField(data.wishes);
    const inviteCode = textField(data.inviteCode);
    const expectedInvite = process.env.INVITE_CODE;
    const adminName = normalizeUsername(process.env.ADMIN_USERNAME || 'organizador');
    if (!expectedInvite || expectedInvite.length < 8) return errorResponse('Falta configurar el código de invitación.', 503);
    if (!safeEquals(inviteCode, expectedInvite)) return errorResponse('El código de invitación no es válido.', 403);
    if (!validUsername(username) || username === adminName) return errorResponse('El usuario debe tener entre 3 y 24 caracteres: letras minúsculas, números, punto, guion o guion bajo.');
    if (displayName.length < 2 || displayName.length > 70) return errorResponse('Escribe un nombre de entre 2 y 70 caracteres.');
    if (!passwordValid(password)) return errorResponse('La contraseña debe tener entre 8 y 72 bytes.');
    if (wishes.length < 5 || wishes.length > 800) return errorResponse('Escribe una lista de deseos de entre 5 y 800 caracteres.');
    const hashed = await hash(password, 12);
    const sql = db();
    const rows = await sql`SELECT enroll_participant(${username}, ${displayName}, ${hashed}, ${wishes}) AS id`;
    await startSession(String(rows[0].id), 'participant');
    return Response.json({ role: 'participant', message: 'Inscripción completada.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('participants_username_key')) return errorResponse('Ese nombre de usuario ya está registrado.', 409);
    if (message.includes('REGISTRATION_CLOSED')) return errorResponse('Las inscripciones ya están cerradas.', 409);
    if (message.includes('REGISTRATION_FULL')) return errorResponse('Ya se completaron todos los cupos.', 409);
    if (message === 'Solicitud no permitida' || message === 'Solicitud demasiado grande' || error instanceof SyntaxError) return errorResponse('Solicitud inválida.', 400);
    console.error('Registration failed', error instanceof Error ? error.name : 'unknown');
    return errorResponse('No fue posible inscribirte. Intenta otra vez.', 500);
  }
}
