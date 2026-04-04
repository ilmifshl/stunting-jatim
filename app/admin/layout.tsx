import Sidebar from '@/components/admin/Sidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect('/login');
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .single();

  let userRole = roleData?.role || 'admin';

  // Hardcoded fallback for the primary Super Admin
  if (userData.user.email === 'ilmifasihul2003@gmail.com') {
    userRole = 'super_admin';
  }

  // DEBUG LOGS
  console.log('--- ADMIN DEBUG ---');
  console.log('User Email:', userData.user.email);
  console.log('Fetched Role:', roleData?.role);
  console.log('Final Role:', userRole);
  console.log('Pathname (Header):', pathname);
  console.log('-------------------');

  // Protect /admin/users - only super_admin
  if (pathname.includes('/admin/users') && userRole !== 'super_admin') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-right" richColors />
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64 flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
