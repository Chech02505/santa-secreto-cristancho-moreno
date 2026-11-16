'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return <button type="button" className="link-button" disabled={busy} onClick={async()=>{
    setBusy(true);
    try {
      const result = await fetch('/api/auth/logout', {method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      if (!result.ok) throw new Error();
      router.replace('/'); router.refresh();
    } catch { setBusy(false); alert('No se pudo cerrar la sesión. Inténtalo otra vez.'); }
  }}>{busy ? 'Saliendo…' : 'Cerrar sesión'}</button>;
}
