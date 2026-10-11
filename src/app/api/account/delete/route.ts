import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, confirmation } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Typed confirmation DELETE in uppercase is required.' },
        { status: 400 }
      );
    }

    // 1. Delete all user projects and child records (cascades via foreign keys)
    await supabaseAdmin.from('projects').delete().eq('owner_id', userId);

    // 2. Delete user profile record
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // 3. Delete auth account in Supabase
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authErr) {
      return NextResponse.json(
        { error: `Failed to remove user auth account: ${authErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deletedUserId: userId });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
