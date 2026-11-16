import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import AuthHome from '@/components/AuthHome';

export const dynamic = 'force-dynamic';
export default async function HomePage() {
  const session = await getSession();
  if (session?.role === 'admin') redirect('/admin');
  if (session?.role === 'participant') redirect('/mi-amigo');
  return <AuthHome/>;
}
