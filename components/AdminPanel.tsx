'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminPanel({ initialExpected, registered, drawn }: {initialExpected:number | null;registered:number;drawn:boolean}) {
  const router = useRouter();
  const [expected, setExpected] = useState(initialExpected ? String(initialExpected) : '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState<'ok'|'error'>('ok');
  async function request(endpoint: string, data: Record<string,unknown>) {
    setBusy(true);setMessage('');
    try {
      const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo completar la solicitud');
      setMessage(result.message || 'Cambios guardados.');setKind('ok');router.refresh();
    } catch (err) {setKind('error');setMessage(err instanceof Error ? err.message : 'Error inesperado');}
    finally {setBusy(false);}
  }
  function saveCapacity(e: FormEvent) {e.preventDefault();request('/api/admin/expected',{expected:Number(expected)});}
  function draw() {
    if (!confirm('¿Confirmas el sorteo definitivo? Después no podrás modificar los participantes ni repetirlo. NO podrás ver quién le tocó a quién.')) return;
    request('/api/admin/draw',{});
  }
  return <div className="admin-controls">
    {!drawn && <>
      <form className="capacity-form" onSubmit={saveCapacity}>
        <label>Cantidad total de participantes<input min={Math.max(2,registered)} max={100} type="number" required value={expected} onChange={e=>setExpected(e.target.value)} placeholder="Ej. 12" /></label>
        <button disabled={busy} type="submit" className="outline-button">Guardar cupo</button>
      </form>
      <p className="hint">Cuando se inscriban exactamente todos los participantes, podrás iniciar el sorteo.</p>
      <button className="primary-button" type="button" disabled={busy || initialExpected===null || registered!==initialExpected || registered<2} onClick={draw}>Realizar sorteo definitivo ✦</button>
    </>}
    {drawn && <div className="notice success">El sorteo está cerrado. Las asignaciones permanecen privadas y no pueden repetirse desde este panel.</div>}
    {message && <div role="status" className={`notice ${kind==='error'?'error':'success'}`}>{message}</div>}
  </div>;
}
