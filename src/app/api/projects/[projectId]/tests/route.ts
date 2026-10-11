import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const TestUpdateSchema = z.object({
  testId: z.string(),
  verification: z.enum(['not_run', 'passed', 'failed', 'blocked']),
  executedBy: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await req.json();
    const validated = TestUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { testId, verification, executedBy, notes, userId } = validated.data;

    const lastRunAudit = {
      executedBy: executedBy || 'Staff Engineer (Manual Verification)',
      executedAt: new Date().toISOString(),
      notes: notes || `Verification recorded as ${verification.toUpperCase()}`,
    };

    // 1. Update test_case record in Supabase
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('test_cases')
      .update({
        verification,
        last_run: lastRunAudit,
      })
      .eq('project_id', projectId)
      .eq('display_id', testId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: `Failed to record test run: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // 2. Log activity audit event
    await supabaseAdmin.from('activity_events').insert({
      project_id: projectId,
      user_id: userId || null,
      actor_id: userId || null,
      event_type: 'test_recorded',
      action: 'verified',
      details: {
        testId,
        verification,
        executedBy: lastRunAudit.executedBy,
        timestamp: lastRunAudit.executedAt,
      },
    });

    return NextResponse.json({
      success: true,
      testId,
      verification,
      lastRun: lastRunAudit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
