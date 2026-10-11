import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  stage: z.string().optional(),
  userId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await req.json();
    const validated = ProjectUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { name, tagline, description, stage, userId } = validated.data;
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (name) updates.name = name;
    if (tagline !== undefined) updates.tagline = tagline;
    if (description !== undefined) updates.description = description;
    if (stage) updates.stage = stage;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: `Failed to update project: ${updateErr.message}` },
        { status: 500 }
      );
    }

    await supabaseAdmin.from('activity_events').insert({
      project_id: projectId,
      user_id: userId || null,
      actor_id: userId || null,
      event_type: 'project_updated',
      action: 'updated',
      details: { updates },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Delete project from Supabase - foreign keys will cascade
    const { error: delErr } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (delErr) {
      return NextResponse.json(
        { error: `Failed to delete project: ${delErr.message}` },
        { status: 500 }
      );
    }

    if (userId) {
      await supabaseAdmin.from('activity_events').insert({
        project_id: null,
        user_id: userId,
        actor_id: userId,
        event_type: 'project_deleted',
        action: 'deleted',
        details: { projectId },
      });
    }

    return NextResponse.json({ success: true, deletedId: projectId });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
