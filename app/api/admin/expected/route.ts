import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { errorResponse, parseJson } from '@/lib/security';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return errorResponse('No tienes permiso.', 403);
  try {
    const data = await parseJson(request);
    if (typeof data.expected !== 'number' || !Number.isInteger(data.expected) || data.expected < 2 || data.expected > 100) {
      return errorResponse('El total debe ser un número entre 2 y 100.');
    }
    const sql = db();
    await sql`SELECT set_expected_participants(${data.expected}::integer)`;
    return Response.json({ok:true,message:'Cantidad de participantes guardada.'},{headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('DRAW_ALREADY_COMPLETED')) return errorResponse('El sorteo ya se realizó.',409);
    if (message.includes('INVALID_CAPACITY')) return errorResponse('El cupo no puede ser menor al número de inscritos ni superar 100.',409);
    if (error instanceof SyntaxError || message.startsWith('Solicitud')) return errorResponse('Solicitud inválida.',400);
    console.error('Capacity update failed');
    return errorResponse('No fue posible guardar el cupo.',500);
  }
}
