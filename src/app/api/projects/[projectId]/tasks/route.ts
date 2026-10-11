import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const TaskUpdateSchema = z.object({
  taskId: z.string(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']),
  userId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await req.json();
    const validated = TaskUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { taskId, status, userId } = validated.data;

    // 1. Fetch current task and its dependencies to check DAG rules
    const { data: allTasks, error: taskFetchErr } = await supabaseAdmin
      .from('tasks')
      .select('display_id, status, dependencies, title')
      .eq('project_id', projectId);

    if (taskFetchErr) {
      return NextResponse.json(
        { error: `Database error: ${taskFetchErr.message}` },
        { status: 500 }
      );
    }

    const currentTask = allTasks?.find((t) => t.display_id === taskId);
    if (!currentTask) {
      return NextResponse.json(
        { error: `Task ${taskId} not found in project.` },
        { status: 404 }
      );
    }

    // 2. Strict DAG validation: if moving to 'done', verify all prerequisites are 'done'
    if (status === 'done' && Array.isArray(currentTask.dependencies) && currentTask.dependencies.length > 0) {
      const unfinishedDeps = allTasks.filter(
        (t) => currentTask.dependencies.includes(t.display_id) && t.status !== 'done'
      );

      if (unfinishedDeps.length > 0) {
        const depNames = unfinishedDeps.map((d) => `${d.display_id} (${d.status})`).join(', ');
        return NextResponse.json(
          {
            error: `Prerequisite Blocked: Task ${taskId} cannot advance to Done until dependencies are complete: ${depNames}`,
            blockedBy: unfinishedDeps.map((d) => d.display_id),
          },
          { status: 422 }
        );
      }
    }

    // 3. Update task in Supabase
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('tasks')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .eq('display_id', taskId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: `Failed to update task: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // 4. Log activity audit event
    await supabaseAdmin.from('activity_events').insert({
      project_id: projectId,
      user_id: userId || null,
      actor_id: userId || null,
      event_type: 'task_status_changed',
      action: 'updated',
      details: {
        taskId,
        taskTitle: currentTask.title,
        previousStatus: currentTask.status,
        newStatus: status,
      },
    });

    return NextResponse.json({
      success: true,
      taskId,
      newStatus: status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
