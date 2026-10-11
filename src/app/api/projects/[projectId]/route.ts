import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 1. Fetch core project record
    const { data: project, error: projErr } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projErr || !project) {
      return NextResponse.json(
        { error: `Project not found: ${projErr?.message || 'Invalid ID'}` },
        { status: 404 }
      );
    }

    // 2. Fetch all related entity tables in parallel
    const [
      { data: reqRows },
      { data: compRows },
      { data: entRows },
      { data: epRows },
      { data: taskRows },
      { data: testRows },
      { data: decRows },
      { data: riskRows },
      { data: eventRows },
    ] = await Promise.all([
      supabaseAdmin.from('requirements').select('*').eq('project_id', projectId).order('display_id'),
      supabaseAdmin.from('components').select('*').eq('project_id', projectId).order('display_id'),
      supabaseAdmin.from('entities').select('*').eq('project_id', projectId).order('display_id'),
      supabaseAdmin.from('api_endpoints').select('*').eq('project_id', projectId).order('display_id'),
      supabaseAdmin.from('tasks').select('*').eq('project_id', projectId).order('display_id'),
      supabaseAdmin.from('test_cases').select('*').eq('project_id', projectId).order('display_id'),
      supabaseAdmin.from('decisions').select('*').eq('project_id', projectId).order('display_id'),
      supabaseAdmin.from('risks').select('*').eq('project_id', projectId).order('display_id'),
      supabaseAdmin.from('activity_events').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(20),
    ]);

    const c = project.constraints || {};

    // 3. Map child tables with fallback to stored constraints if child tables are empty
    const requirements = (reqRows && reqRows.length > 0)
      ? reqRows.map((r) => ({
          displayId: r.display_id,
          kind: r.kind,
          statement: r.statement,
          priority: r.priority,
          category: r.category,
          rationale: r.rationale,
          acceptanceCriteria: r.acceptance_criteria || [],
          origin: r.origin,
          status: r.status,
          confidence: r.confidence || 'high',
          locked: r.locked || false,
        }))
      : c.requirements || [];

    const components = (compRows && compRows.length > 0)
      ? compRows.map((cmp) => ({
          displayId: cmp.display_id,
          name: cmp.name,
          type: cmp.type,
          technology: cmp.technology,
          responsibilities: cmp.responsibilities || [],
          satisfies: cmp.satisfies || [],
          origin: cmp.origin,
          status: cmp.status,
        }))
      : c.components || [];

    const entities = (entRows && entRows.length > 0)
      ? entRows.map((e) => ({
          displayId: e.display_id,
          name: e.name,
          description: e.description || '',
          fields: e.fields || [],
          rlsPolicies: e.rls_policies || [],
          origin: e.origin,
          status: e.status,
        }))
      : c.entities || [];

    const endpoints = (epRows && epRows.length > 0)
      ? epRows.map((ep) => ({
          displayId: ep.display_id,
          path: ep.path,
          method: ep.method,
          summary: ep.summary,
          authRequired: ep.auth_required ?? true,
          parameters: ep.parameters || [],
          responseSchema: ep.response_schema || '{}',
          origin: ep.origin,
          status: ep.status,
        }))
      : c.endpoints || c.apiEndpoints || [];

    const tasks = (taskRows && taskRows.length > 0)
      ? taskRows.map((t) => ({
          displayId: t.display_id,
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority,
          effortMinDays: Number(t.effort_min_days || 1),
          effortMaxDays: Number(t.effort_max_days || 3),
          dependencies: t.dependencies || [],
          implementsReq: t.implements_req,
          origin: t.origin,
        }))
      : c.tasks || [];

    const testCases = (testRows && testRows.length > 0)
      ? testRows.map((tc) => ({
          displayId: tc.display_id,
          category: tc.category,
          objective: tc.objective,
          preconditions: tc.preconditions,
          steps: tc.steps || [],
          expectedResult: tc.expected_result,
          verifiesReq: tc.verifies_req,
          verification: tc.verification || 'not_run',
          lastRun: tc.last_run,
          origin: tc.origin,
          status: tc.status,
        }))
      : c.testCases || [];

    const decisions = (decRows && decRows.length > 0)
      ? decRows.map((d) => ({
          displayId: d.display_id,
          context: d.context,
          decision: d.decision,
          alternatives: d.alternatives || [],
          consequences: d.consequences,
          origin: d.origin,
          status: d.status,
        }))
      : c.decisions || [];

    const risks = (riskRows && riskRows.length > 0)
      ? riskRows.map((r) => ({
          displayId: r.display_id,
          description: r.description,
          severity: r.severity,
          mitigation: r.mitigation,
        }))
      : c.risks || [];

    const consolidated = {
      id: project.id,
      name: project.name,
      tagline: project.tagline || '',
      description: project.description || '',
      type: project.type || 'website',
      stage: project.stage || 'plan',
      status: project.status || 'active',
      updatedAt: project.updated_at || project.created_at,
      constraints: {
        appType: c.appType || 'Website Application',
        stack: c.stack || ['TypeScript', 'Next.js 14', 'PostgreSQL (Supabase)'],
        skills: c.skills || 'Full-Stack TypeScript & PostgreSQL',
        budget: c.budget || '$0 Free Tier MVP',
        timeline: c.timeline || '4-6 Weeks',
        hosting: c.hosting || 'Supabase / Cloudflare / Vercel',
        codebase: c.codebase || [],
      },
      requirements,
      components,
      entities,
      endpoints,
      tasks,
      testCases,
      decisions,
      risks,
      activity: eventRows || [],
    };

    return NextResponse.json({ success: true, project: consolidated });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}
