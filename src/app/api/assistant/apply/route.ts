import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const ApplyProposalSchema = z.object({
  projectId: z.string(),
  proposal: z.object({
    id: z.string(),
    target: z.string(),
    type: z.enum(['requirement', 'entity', 'endpoint', 'task', 'code', 'general']),
    action: z.enum(['add', 'update', 'delete']),
    summary: z.string(),
    proposedContent: z.string(),
  }),
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ApplyProposalSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid proposal payload', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { projectId, proposal, userId } = validated.data;

    // Apply change based on proposal type
    if (proposal.type === 'requirement') {
      if (proposal.action === 'add') {
        await supabaseAdmin.from('requirements').insert({
          project_id: projectId,
          display_id: proposal.target || `FR-NEW`,
          kind: 'functional',
          statement: proposal.proposedContent,
          priority: 'should',
          category: 'Copilot Proposed',
          rationale: proposal.summary,
          acceptance_criteria: ['User verified requirement'],
          origin: 'ai_proposed',
          status: 'accepted',
        });
      } else if (proposal.action === 'update') {
        await supabaseAdmin
          .from('requirements')
          .update({ statement: proposal.proposedContent, updated_at: new Date().toISOString() })
          .eq('project_id', projectId)
          .eq('display_id', proposal.target);
      }
    } else if (proposal.type === 'task') {
      if (proposal.action === 'add') {
        await supabaseAdmin.from('tasks').insert({
          project_id: projectId,
          display_id: proposal.target || `TSK-NEW`,
          title: proposal.summary,
          description: proposal.proposedContent,
          status: 'todo',
          priority: 'medium',
          origin: 'ai_proposed',
        });
      } else if (proposal.action === 'update') {
        await supabaseAdmin
          .from('tasks')
          .update({ description: proposal.proposedContent, updated_at: new Date().toISOString() })
          .eq('project_id', projectId)
          .eq('display_id', proposal.target);
      }
    }

    // Always log the audit activity event
    await supabaseAdmin.from('activity_events').insert({
      project_id: projectId,
      user_id: userId || null,
      actor_id: userId || null,
      event_type: 'copilot_diff_accepted',
      action: proposal.action,
      details: {
        proposalId: proposal.id,
        target: proposal.target,
        summary: proposal.summary,
      },
    });

    return NextResponse.json({
      success: true,
      proposalId: proposal.id,
      summary: `Accepted and applied: ${proposal.summary}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
