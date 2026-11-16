import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import AdminPanel from '@/components/AdminPanel';
import LogoutButton from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/');
  if (session.role !== 'admin') redirect('/mi-amigo');
  const sql = db();
  // El panel NO consulta columnas de nombres, deseos, ni pares del sorteo.
  const [settings, counts] = await Promise.all([
    sql`SELECT expected_count, draw_completed, registration_open FROM app_settings WHERE id = 1`,
    sql`SELECT (SELECT count(*)::integer FROM participants) AS registered,
               (SELECT count(*)::integer FROM assignments) AS assigned`
  ]);
  const registered = Number(counts[0]?.registered || 0);
  const assigned = Number(counts[0]?.assigned || 0);
  const expected = settings[0]?.expected_count === null ? null : Number(settings[0]?.expected_count);
  const drawn = settings[0]?.draw_completed === true;
  return <div className="dashboard-wrap">
    <header className="dash-header"><a className="wordmark" href="/">✦ Santa Secreto</a><LogoutButton/></header>
    <div className="dash-intro"><span className="eyebrow">PANEL DE ORGANIZACIÓN</span><h1>El gran sorteo familiar</h1><p>Familia Cristancho Moreno · Control sin revelar secretos.</p></div>
    <div className="stat-grid"><div className="stat"><span>Inscritos</span><strong>{registered}</strong></div><div className="stat"><span>Cupo previsto</span><strong>{expected ?? '—'}</strong></div><div className="stat"><span>Asignados</span><strong>{assigned}</strong></div></div>
    <div className="content-card admin-main"><div className="status-line"><span className={`status-dot ${drawn?'complete':''}`}/>{drawn ? 'Sorteo realizado' : registered >= 2 && expected === registered ? '¡Listo para sortear!' : 'Esperando inscripciones'}</div>
      <h2>Control del intercambio</h2>
      <p>El administrador solo tiene acceso a cantidades y estados generales; nunca a los nombres de quienes se asignaron ni a las listas de deseos.</p>
      <AdminPanel initialExpected={expected} registered={registered} drawn={drawn}/>
    </div>
    <div className="privacy-note dashboard-privacy">🔒 Privacidad: el sorteo ocurre en PostgreSQL, no en el navegador del administrador.</div>
  </div>;
}
