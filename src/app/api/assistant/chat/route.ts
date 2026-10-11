import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateGroundedAssistantReply } from '@/lib/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, message, history } = body;

    if (!projectId || !message) {
      return NextResponse.json({ error: 'Project ID and message are required.' }, { status: 400 });
    }

    // 1. Fetch current project & modules from database for total grounding
    const { data: project, error: projErr } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projErr || !project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const [
      { data: reqRows },
      { data: entRows },
      { data: epRows },
      { data: taskRows },
      { data: decRows },
    ] = await Promise.all([
      supabaseAdmin.from('requirements').select('*').eq('project_id', projectId),
      supabaseAdmin.from('entities').select('*').eq('project_id', projectId),
      supabaseAdmin.from('api_endpoints').select('*').eq('project_id', projectId),
      supabaseAdmin.from('tasks').select('*').eq('project_id', projectId),
      supabaseAdmin.from('decisions').select('*').eq('project_id', projectId),
    ]);

    const groundedContext = {
      ...project,
      requirements: reqRows || project.constraints?.requirements || [],
      entities: entRows || project.constraints?.entities || [],
      endpoints: epRows || project.constraints?.endpoints || [],
      tasks: taskRows || project.constraints?.tasks || [],
      decisions: decRows || project.constraints?.decisions || [],
    };

    // 2. Call AI Gateway for grounded answer with audited diff proposals
    const response = await generateGroundedAssistantReply({
      project: groundedContext,
      userPrompt: message,
      conversationHistory: history || [],
    });

    return NextResponse.json({
      success: true,
      reply: response.reply,
      proposals: response.proposals || [],
    });
  } catch (err: any) {
    console.error('Assistant error:', err);
    return NextResponse.json(
      {
        error: `Assistant response error: ${err.message}`,
        retryable: true,
      },
      { status: 502 }
    );
  }
}
