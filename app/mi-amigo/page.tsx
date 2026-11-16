import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';
import WishEditor from '@/components/WishEditor';

export const dynamic = 'force-dynamic';
export default async function MySecret() {
  const session = await getSession();
  if (!session) redirect('/');
  if (session.role === 'admin') redirect('/admin');
  const sql = db();
  const own = await sql`SELECT display_name, wishes FROM participants WHERE id = ${session.id}::uuid`;
  if (!own.length) return <div className="dashboard-wrap"><header className="dash-header"><span className="wordmark">✦ Santa Secreto</span><LogoutButton/></header><section className="content-card"><h2>Tu cuenta no está disponible</h2><p>Esta sesión no corresponde a un registro activo. Cierra sesión y consulta a quien organiza el evento.</p></section></div>;
  const settings = await sql`SELECT draw_completed FROM app_settings WHERE id=1`;
  const drawn = settings[0]?.draw_completed === true;
  let recipient: {display_name:string;wishes:string} | null = null;
  if (drawn) {
    const matched = await sql`
      SELECT recipient.display_name, recipient.wishes
      FROM assignments assigned
      JOIN participants recipient ON recipient.id=assigned.receiver_id
      WHERE assigned.giver_id=${session.id}::uuid
    `;
    if (matched.length) recipient = { display_name:String(matched[0].display_name), wishes:String(matched[0].wishes) };
  }
  return <div className="dashboard-wrap">
    <header className="dash-header"><a className="wordmark" href="/">✦ Santa Secreto</a><LogoutButton/></header>
    <div className="dash-intro"><span className="eyebrow">FAMILIA CRISTANCHO MORENO</span><h1>¡Hola, {String(own[0].display_name)}!</h1><p>Este es tu rincón secreto de Navidad.</p></div>
    {drawn ? recipient ? <section className="reveal-card">
      <div className="reveal-icon" aria-hidden="true">🎁</div><span className="eyebrow">TU MISIÓN SECRETA</span>
      <h2>¡Te tocó regalarle a…</h2><div className="recipient-name">{recipient.display_name}</div>
      <p className="reveal-caption">Estas son las ideas que compartió especialmente para su regalo:</p>
      <div className="wish-box">{recipient.wishes}</div>
      <p className="hint centered">Guarda el secreto hasta el intercambio. ¡La magia depende de ti!</p>
    </section> : <section className="content-card"><h2>Estamos comprobando tu asignación</h2><p>El sorteo aparece completado, pero no se encontró una asignación para tu usuario. Contacta a quien organiza el evento.</p></section>
    : <section className="content-card"><span className="eyebrow">ANTES DEL SORTEO</span><h2>Tu lista para Santa</h2><p>Cuando todos estén inscritos y la organizadora realice el sorteo, aquí aparecerá únicamente tu persona asignada.</p><WishEditor initialWishes={String(own[0].wishes)} /></section>}
    <div className="privacy-note dashboard-privacy">🔒 Tus datos son privados. El panel organizador no muestra asignaciones ni deseos.</div>
  </div>;
}
