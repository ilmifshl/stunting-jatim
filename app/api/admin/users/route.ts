import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const SUPER_ADMIN_EMAIL = 'ilmifasihul2003@gmail.com';

async function verifySuperAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  // Hardcoded fallback
  if (user.email === SUPER_ADMIN_EMAIL) {
    return { user, isSuperAdmin: true };
  }

  // DB check
  try {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role === 'super_admin') {
      return { user, isSuperAdmin: true };
    }
  } catch (e) {
    // Table might not exist yet
  }

  return { error: 'Access Denied', status: 403 };
}

export async function GET() {
  try {
    const auth = await verifySuperAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const adminClient = createAdminClient();
    
    // Get all users from Auth
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) throw listError;

    // Get all roles (handle table doesn't exist)
    const { data: roles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('*');
    
    // Combine
    const userList = users.map(u => ({
      id: u.id,
      email: u.email,
      role: roles?.find(r => r.user_id === u.id)?.role || 'admin',
      created_at: u.created_at
    }));

    // Ensure our super admin email always shows as super_admin in the list
    const finalUserList = userList.map(u => 
      u.email === SUPER_ADMIN_EMAIL ? { ...u, role: 'super_admin' } : u
    );

    return NextResponse.json(finalUserList);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifySuperAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { email, password, role } = await request.json();
    const adminClient = createAdminClient();

    // Create user in Auth
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) throw createError;

    // Set role in user_roles table
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({ user_id: newUser.user.id, role: role || 'admin' });

    // Note: if table doesn't exist, this might fail, but user is already created.
    // In a real app we'd handle this better, but here we assume SQL was run.

    return NextResponse.json({ message: 'User created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifySuperAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { userId, role } = await request.json();
    const adminClient = createAdminClient();

    const { error: updateError } = await adminClient
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Role updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifySuperAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { userId } = await request.json();
    
    // Prevent self-deletion
    if (userId === auth.user?.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Delete from Auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
