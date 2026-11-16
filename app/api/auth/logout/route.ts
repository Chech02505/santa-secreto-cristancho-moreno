import { endSession } from '@/lib/session';
import { checkJsonRequest, errorResponse } from '@/lib/security';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!checkJsonRequest(request)) return errorResponse('Solicitud no permitida.', 403);
  await endSession();
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
