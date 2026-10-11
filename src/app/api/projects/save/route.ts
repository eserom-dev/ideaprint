import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blueprint, userId } = body;

    if (!blueprint || !blueprint.name) {
      return NextResponse.json({ error: 'Valid blueprint data is required.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authenticated user ID is required.' }, { status: 401 });
    }

    // 1. Create project container in Supabase
    const { data: project, error: projErr } = await supabaseAdmin
      .from('projects')
      .insert({
        owner_id: userId,
        name: blueprint.name,
        tagline: blueprint.tagline || '',
        description: blueprint.description || '',
        type: 'website',
        stage: 'plan',
        status: 'active',
        constraints: blueprint,
      })
      .select()
      .single();

    if (projErr || !project) {
      throw new Error(`Failed to create project in database: ${projErr?.message}`);
    }

    const projectId = project.id;

    // 2. Batch insert requirements if present
    if (Array.isArray(blueprint.requirements) && blueprint.requirements.length > 0) {
      const reqRows = blueprint.requirements.map((r: any, idx: number) => ({
        project_id: projectId,
        display_id: r.displayId || `FR-${String(idx + 1).padStart(3, '0')}`,
        kind: r.kind === 'non_functional' ? 'non_functional' : 'functional',
        statement: r.statement,
        priority: ['must', 'should', 'could', 'wont'].includes(r.priority) ? r.priority : 'should',
        category: r.category || 'Core',
        rationale: r.rationale || 'Core project requirement.',
        acceptance_criteria: Array.isArray(r.acceptanceCriteria) ? r.acceptanceCriteria : [],
        origin: r.origin || 'ai_proposed',
        status: 'accepted',
        confidence: 'high',
      }));

      await supabaseAdmin.from('requirements').insert(reqRows);
    }

    // 3. Batch insert components if present
    if (Array.isArray(blueprint.components) && blueprint.components.length > 0) {
      const compRows = blueprint.components.map((c: any, idx: number) => ({
        project_id: projectId,
        display_id: c.displayId || `CMP-${String(idx + 1).padStart(3, '0')}`,
        name: c.name,
        type: ['frontend', 'backend', 'database', 'service', 'gateway', 'worker'].includes(c.type)
          ? c.type
          : 'service',
        technology: c.technology || 'Next.js',
        responsibilities: Array.isArray(c.responsibilities) ? c.responsibilities : [],
        origin: 'ai_proposed',
        status: 'accepted',
      }));

      await supabaseAdmin.from('components').insert(compRows);
    }

    // 4. Batch insert entities if present
    if (Array.isArray(blueprint.entities) && blueprint.entities.length > 0) {
      const entRows = blueprint.entities.map((e: any, idx: number) => ({
        project_id: projectId,
        display_id: e.displayId || `ENT-${String(idx + 1).padStart(3, '0')}`,
        name: e.name,
        description: e.description || '',
        fields: Array.isArray(e.fields) ? e.fields : [],
        rls_policies: Array.isArray(e.rlsPolicies) ? e.rlsPolicies : [],
        origin: 'ai_proposed',
        status: 'accepted',
      }));

      await supabaseAdmin.from('entities').insert(entRows);
    }

    // 5. Batch insert API endpoints if present
    const rawEndpoints = blueprint.endpoints || blueprint.apiEndpoints || [];
    if (Array.isArray(rawEndpoints) && rawEndpoints.length > 0) {
      const epRows = rawEndpoints.map((ep: any, idx: number) => ({
        project_id: projectId,
        display_id: ep.displayId || `API-${String(idx + 1).padStart(3, '0')}`,
        path: ep.path,
        method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(ep.method) ? ep.method : 'GET',
        summary: ep.summary || 'REST handler',
        auth_required: ep.authRequired ?? true,
        parameters: Array.isArray(ep.parameters) ? ep.parameters : [],
        response_schema: typeof ep.responseSchema === 'string' ? ep.responseSchema : JSON.stringify(ep.responseSchema || {}),
        origin: 'ai_proposed',
        status: 'accepted',
      }));

      await supabaseAdmin.from('api_endpoints').insert(epRows);
    }

    // 6. Batch insert tasks if present
    if (Array.isArray(blueprint.tasks) && blueprint.tasks.length > 0) {
      const taskRows = blueprint.tasks.map((t: any, idx: number) => ({
        project_id: projectId,
        display_id: t.displayId || `TSK-${String(idx + 1).padStart(3, '0')}`,
        title: t.title,
        description: t.description || '',
        status: 'todo',
        priority: ['low', 'medium', 'high', 'urgent'].includes(t.priority) ? t.priority : 'medium',
        effort_min_days: t.effortMinDays || 1.0,
        effort_max_days: t.effortMaxDays || 3.0,
        dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
        implements_req: t.implementsReq || null,
        origin: 'ai_proposed',
      }));

      await supabaseAdmin.from('tasks').insert(taskRows);
    }

    // 7. Batch insert test cases if present
    if (Array.isArray(blueprint.testCases) && blueprint.testCases.length > 0) {
      const tcRows = blueprint.testCases.map((tc: any, idx: number) => ({
        project_id: projectId,
        display_id: tc.displayId || `TC-${String(idx + 1).padStart(3, '0')}`,
        category: ['functional', 'security', 'permissions', 'edge', 'accessibility', 'reliability'].includes(tc.category)
          ? tc.category
          : 'functional',
        objective: tc.objective,
        preconditions: tc.preconditions || 'System initialized',
        steps: Array.isArray(tc.steps) ? tc.steps : [],
        expected_result: tc.expectedResult,
        verifies_req: tc.verifiesReq || null,
        verification: 'not_run',
        origin: 'ai_proposed',
        status: 'accepted',
      }));

      await supabaseAdmin.from('test_cases').insert(tcRows);
    }

    // 8. Batch insert decisions if present
    if (Array.isArray(blueprint.decisions) && blueprint.decisions.length > 0) {
      const decRows = blueprint.decisions.map((d: any, idx: number) => ({
        project_id: projectId,
        display_id: d.displayId || `DEC-${String(idx + 1).padStart(3, '0')}`,
        context: d.context,
        decision: d.decision,
        alternatives: Array.isArray(d.alternatives) ? d.alternatives : [],
        consequences: d.consequences || 'Documented engineering consequence',
        origin: 'ai_proposed',
        status: 'accepted',
      }));

      await supabaseAdmin.from('decisions').insert(decRows);
    }

    // 9. Batch insert risks if present
    if (Array.isArray(blueprint.risks) && blueprint.risks.length > 0) {
      const riskRows = blueprint.risks.map((r: any, idx: number) => ({
        project_id: projectId,
        display_id: r.displayId || `RSK-${String(idx + 1).padStart(3, '0')}`,
        description: r.description,
        severity: ['low', 'medium', 'high', 'critical'].includes(r.severity) ? r.severity : 'medium',
        mitigation: r.mitigation,
      }));

      await supabaseAdmin.from('risks').insert(riskRows);
    }

    // 10. Audit event
    await supabaseAdmin.from('activity_events').insert({
      project_id: projectId,
      actor_id: userId,
      event_type: 'PROJECT_CREATED',
      summary: `Created architectural blueprint for ${blueprint.name}`,
    });

    return NextResponse.json({
      success: true,
      projectId,
    });
  } catch (err: any) {
    console.error('Project save error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save project blueprint to database.' },
      { status: 500 }
    );
  }
}
