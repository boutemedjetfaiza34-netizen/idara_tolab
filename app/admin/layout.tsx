import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('boutimjit_admin_session');

  if (adminCookie && adminCookie.value.startsWith('admin_authenticated_')) {
    return <AdminLayoutClient userEmail="boutemedjetfaiza34@gmail.com">{children}</AdminLayoutClient>;
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/secure-admin-login');
    }

    return <AdminLayoutClient userEmail={user.email ?? 'boutemedjetfaiza34@gmail.com'}>{children}</AdminLayoutClient>;
  } catch {
    redirect('/secure-admin-login');
  }
}
