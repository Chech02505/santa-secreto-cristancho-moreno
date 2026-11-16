import { neon } from '@neondatabase/serverless';

const connection = process.env.DATABASE_URL;
if (!connection || !connection.startsWith('postgresql://')) {
  console.error('No se encontró DATABASE_URL. Crea .env.local con la cadena de conexión de Neon.');
  process.exitCode = 1;
} else {
  try {
    const sql = neon(connection);
    const [status] = await sql`SELECT (SELECT count(*)::integer FROM participants) AS inscritos,
      (SELECT draw_completed FROM app_settings WHERE id=1) AS sorteado`;
    console.log('Conexión PostgreSQL correcta.');
    console.log(`Inscritos: ${status.inscritos} | Sorteo realizado: ${status.sorteado ? 'sí' : 'no'}`);
  } catch (error) {
    console.error('No se pudo conectar o faltan tablas. Ejecuta db/schema.sql en Neon y revisa DATABASE_URL.');
    console.error('Detalle técnico:', error instanceof Error ? error.message : 'Error desconocido');
    process.exitCode = 1;
  }
}
