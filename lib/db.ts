import 'server-only';
import { neon } from '@neondatabase/serverless';

export function db() {
  const connection = process.env.DATABASE_URL;
  if (!connection) throw new Error('Falta la variable DATABASE_URL');
  return neon(connection);
}
