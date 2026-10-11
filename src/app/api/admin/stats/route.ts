import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: User ID required' }, { status: 401 });
    }

    // 1. Strictly enforce admin authorization on the server
    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, role, email')
      .eq('id', userId)
      .single();

    const isExplicitAdmin = profile?.is_admin === true || profile?.role === 'admin';

    if (!isExplicitAdmin) {
      return NextResponse.json(
        {
          error: 'Forbidden: Admin clearance required. Your account lacks administrator privileges.',
          isAdmin: false,
        },
        { status: 403 }
      );
    }

    // 2. Fetch platform aggregates
    const [
      { count: totalProjects },
      { count: totalTasks },
      { count: totalProfiles },
      { data: waitlist },
      { data: recentEvents },
    ] = await Promise.all([
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('tasks').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('waitlist_submissions').select('*').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('activity_events').select('*').order('created_at', { ascending: false }).limit(25),
    ]);

    return NextResponse.json({
      success: true,
      isAdmin: true,
      stats: {
        totalProjects: totalProjects || 0,
        totalTasks: totalTasks || 0,
        totalProfiles: totalProfiles || 0,
        waitlistCount: (waitlist || []).length,
      },
      waitlist: waitlist || [],
      recentEvents: recentEvents || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
