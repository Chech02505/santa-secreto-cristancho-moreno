import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { errorResponse, parseJson } from '@/lib/security';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return errorResponse('No tienes permiso.',403);
  try {
    await parseJson(request);
    const sql = db();
    // Devuelve solo la cantidad asignada; nunca expone parejas, nombres ni deseos.
    const rows = await sql`SELECT perform_secret_draw() AS assigned_count`;
    const count = Number(rows[0].assigned_count);
    return Response.json({ok:true,message:`¡Sorteo completado! ${count} personas fueron asignadas sin revelar ningún nombre.`},{headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('DRAW_ALREADY_COMPLETED')) return errorResponse('El sorteo ya fue realizado y no se puede repetir.',409);
    if (message.includes('CAPACITY_NOT_SET')) return errorResponse('Primero define la cantidad total de participantes.',409);
    if (message.includes('PARTICIPANTS_INCOMPLETE')) return errorResponse('Todavía no se han inscrito todos los participantes.',409);
    if (error instanceof SyntaxError || message.startsWith('Solicitud')) return errorResponse('Solicitud inválida.',400);
    console.error('Draw failed');
    return errorResponse('No se pudo realizar el sorteo.',500);
  }
}
