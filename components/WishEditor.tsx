'use client';
import { FormEvent, useState } from 'react';
export default function WishEditor({ initialWishes }: { initialWishes: string }) {
  const [wishes, setWishes] = useState(initialWishes);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/participant/update', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ wishes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudieron guardar los cambios');
      setMessage('¡Tus deseos se guardaron correctamente!');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Error inesperado'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="form-stack" style={{marginTop:18}}>
    <label>Mi lista de deseos<textarea required rows={6} minLength={5} maxLength={800} value={wishes} onChange={e=>setWishes(e.target.value)} /></label>
    <div className="hint">Puedes actualizar tus gustos antes del sorteo. Después permanecerán guardados tal como quedaron.</div>
    {message && <div role="status" className="notice">{message}</div>}
    <button disabled={busy} className="primary-button" type="submit">{busy ? 'Guardando…' : 'Guardar mis deseos'}</button>
  </form>;
}
