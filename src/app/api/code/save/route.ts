import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const SaveCodeSchema = z.object({
  projectId: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      description: z.string().default(''),
      language: z.string().default('typescript'),
      content: z.string(),
    })
  ).min(1),
  userId: z.string().optional(),
  commitMessage: z.string().optional(),
});

function validateSyntax(files: Array<{ path: string; content: string }>): string | null {
  for (const file of files) {
    if (file.path.endsWith('.json')) {
      try {
        JSON.parse(file.content);
      } catch (err: any) {
        return `Syntax Error in ${file.path}: Invalid JSON (${err.message})`;
      }
    }

    if (file.path.endsWith('.ts') || file.path.endsWith('.tsx') || file.path.endsWith('.js') || file.path.endsWith('.jsx')) {
      // Check balanced braces and parentheses
      let braces = 0;
      let parens = 0;
      for (const char of file.content) {
        if (char === '{') braces++;
        else if (char === '}') braces--;
        else if (char === '(') parens++;
        else if (char === ')') parens--;
      }
      if (braces !== 0) {
        return `Syntax Warning in ${file.path}: Unbalanced curly braces detected (difference: ${braces})`;
      }
      if (parens !== 0) {
        return `Syntax Warning in ${file.path}: Unbalanced parentheses detected (difference: ${parens})`;
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = SaveCodeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { projectId, files, userId, commitMessage } = validated.data;

    // Syntax validation
    const syntaxError = validateSyntax(files);
    if (syntaxError) {
      return NextResponse.json({ error: syntaxError }, { status: 422 });
    }

    // Load current project
    const { data: project, error: fetchErr } = await supabaseAdmin
      .from('projects')
      .select('constraints')
      .eq('id', projectId)
      .single();

    if (fetchErr || !project) {
      return NextResponse.json(
        { error: `Project not found: ${fetchErr?.message || ''}` },
        { status: 404 }
      );
    }

    const currentConstraints = project.constraints || {};
    const updatedConstraints = {
      ...currentConstraints,
      codebase: files,
      lastCodeSavedAt: new Date().toISOString(),
      codeVersion: (currentConstraints.codeVersion || 1) + 1,
    };

    const { error: updateErr } = await supabaseAdmin
      .from('projects')
      .update({
        constraints: updatedConstraints,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateErr) {
      return NextResponse.json(
        { error: `Database update failed: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // Log activity event
    await supabaseAdmin.from('activity_events').insert({
      project_id: projectId,
      user_id: userId || null,
      actor_id: userId || null,
      event_type: 'code_saved',
      action: 'saved',
      details: {
        fileCount: files.length,
        version: updatedConstraints.codeVersion,
        note: commitMessage || 'Manual code edit saved',
      },
    });

    return NextResponse.json({
      success: true,
      version: updatedConstraints.codeVersion,
      savedAt: updatedConstraints.lastCodeSavedAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
