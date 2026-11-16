'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'register';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo completar la solicitud');
      router.replace(result.role === 'admin' ? '/admin' : '/mi-amigo');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Error inesperado'); }
    finally { setBusy(false); }
  }
  return (
    <div className="home-grid">
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">✦ UNA TRADICIÓN PARA COMPARTIR ✦</div>
          <div className="big-ornament" aria-hidden="true"><div className="ornament-top"/><span>✧</span></div>
          <p className="hero-small">La Navidad llega a la</p>
          <h1>Familia<br/><em>Cristancho Moreno</em></h1>
          <div className="decorative-divider"><span>✦</span><span>✦</span><span>✦</span></div>
          <p className="hero-text">Una pequeña sorpresa, un gran secreto y muchos momentos para recordar.</p>
          <span className="hero-tag">SANTA SECRETO 2026</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="form-card">
          <span className="mini-icon" aria-hidden="true">✉</span>
          <h2>{mode === 'login' ? 'Tu misión navideña comienza aquí' : 'Únete a la magia'}</h2>
          <p className="subheading">{mode === 'login' ? 'Ingresa para conocer tu misión secreta cuando llegue el gran día.' : 'Cada persona se inscribe por separado. Tus deseos serán privados.'}</p>
          <div className="mode-switch" role="group" aria-label="Modo de acceso">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => {setMode('login');setMessage('');}}>Iniciar sesión</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => {setMode('register');setMessage('');}}>Inscribirme</button>
          </div>
          <form onSubmit={submit} className="form-stack" key={mode}>
            {mode === 'register' && <label>Nombre que verá tu Amigo Secreto<input name="displayName" type="text" required minLength={2} maxLength={70} autoComplete="name" placeholder="Ej. María Cristancho" /></label>}
            <label>Usuario<input name="username" type="text" required minLength={3} maxLength={24} autoCapitalize="none" autoComplete="username" spellCheck={false} placeholder="Ej. maria.cristancho" /></label>
            <label>Contraseña
              <div className="password-wrap"><input name="password" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={72} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder="Mínimo 8 caracteres"/><button aria-label={showPassword?'Ocultar contraseña':'Mostrar contraseña'} type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?'Ocultar':'Ver'}</button></div>
            </label>
            {mode === 'register' && <>
              <label>¿Qué te gustaría recibir esta Navidad?<textarea name="wishes" required minLength={5} maxLength={800} rows={4} placeholder="Cuéntanos tus gustos, colores favoritos, libros, accesorios, pasatiempos, ideas de regalo..."/></label>
              <label>Código de invitación familiar<input name="inviteCode" required type="password" autoComplete="off" placeholder="Solicítalo a la organizadora" /></label>
              <p className="hint">Tus gustos solo se mostrarán a quien te corresponda en el sorteo. Podrás editarlos antes del sorteo.</p>
            </>}
            {message && <div className="notice error" role="alert">{message}</div>}
            <button className="primary-button" disabled={busy} type="submit">{busy ? 'Procesando…' : mode === 'login' ? 'Entrar a mi espacio ✦' : 'Confirmar mi inscripción ✦'}</button>
          </form>
          <div className="privacy-note"><span>♧</span> Acceso privado · Solo para personas invitadas</div>
        </div>
      </section>
    </div>
  );
}
