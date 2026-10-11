import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateCodeStudioFiles } from '@/lib/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blueprint, projectId, targetTask, userId } = body;

    if (!blueprint || !blueprint.name) {
      return NextResponse.json({ error: 'Valid blueprint data is required.' }, { status: 400 });
    }

    // Call real AI gateway to generate complete compilable code files
    const files = await generateCodeStudioFiles({
      projectName: blueprint.name,
      description: blueprint.description || '',
      stack: blueprint.constraints?.stack || ['Next.js 14 App Router', 'TypeScript', 'Tailwind CSS', 'Supabase PostgreSQL'],
      requirements: blueprint.requirements || [],
      entities: blueprint.entities || [],
      endpoints: blueprint.endpoints || blueprint.apiEndpoints || [],
      targetTask: targetTask || undefined,
    });

    // If projectId is provided, persist generated codebase back to Supabase project
    if (projectId) {
      const { data: currentProject } = await supabaseAdmin
        .from('projects')
        .select('constraints')
        .eq('id', projectId)
        .single();

      if (currentProject) {
        const updatedConstraints = {
          ...(currentProject.constraints || {}),
          codebase: files,
          lastCodeGeneratedAt: new Date().toISOString(),
        };

        await supabaseAdmin
          .from('projects')
          .update({
            constraints: updatedConstraints,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        // Record activity log
        await supabaseAdmin.from('activity_events').insert({
          project_id: projectId,
          user_id: userId || null,
          actor_id: userId || null,
          event_type: 'code_generated',
          action: 'generated',
          details: {
            fileCount: files.length,
            targetTask: targetTask ? targetTask.displayId : 'full_project',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
      provenance: 'AI generated · Not verified',
    });
  } catch (err: any) {
    console.error('Code generation error:', err);
    return NextResponse.json(
      {
        error: `Code generation failed: ${err.message}. Please verify your AI provider keys in .env.local and retry.`,
        retryable: true,
      },
      { status: 502 }
    );
  }
}
