import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { errorResponse, parseJson, textField } from '@/lib/security';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'participant') return errorResponse('No tienes permiso.', 403);
  try {
    const data = await parseJson(request);
    const wishes = textField(data.wishes);
    if (wishes.length < 5 || wishes.length > 800) return errorResponse('Los deseos deben tener entre 5 y 800 caracteres.');
    const sql = db();
    const result = await sql`UPDATE participants SET wishes=${wishes}
      WHERE id=${session.id}::uuid AND EXISTS (
        SELECT 1 FROM app_settings WHERE id=1 AND registration_open=true AND draw_completed=false
      ) RETURNING id`;
    if (!result.length) return errorResponse('Ya no es posible cambiar tus deseos.', 409);
    return Response.json({ok: true, message: 'Deseos guardados.'}, {headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && error.message.startsWith('Solicitud'))) return errorResponse('Solicitud inválida.',400);
    console.error('Wishes update failed');
    return errorResponse('No se pudieron guardar los deseos.',500);
  }
}
