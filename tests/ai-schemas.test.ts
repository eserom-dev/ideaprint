import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ClarifyQuestionsSchema,
  FullBlueprintSchema,
  CodeFilesSchema,
  AssistantReplySchema,
} from '../src/lib/ai-gateway.ts';
import { testProject } from './fixtures/testProject.mjs';

describe('AI Gateway Schema Validation Suite', () => {
  it('validates clarifying questions array correctly', () => {
    const validQuestions = {
      questions: [
        {
          id: 'Q-01',
          question: 'Will this application require multi-tenant school isolation?',
          why: 'Multi-tenancy changes database architecture and RLS policies.',
          assumedIfSkipped: 'Single-tenant deployment with organizational workspaces.',
        },
      ],
    };
    const res = ClarifyQuestionsSchema.safeParse(validQuestions);
    assert.equal(res.success, true);
  });

  it('rejects empty clarifying questions array (min 1 required)', () => {
    const invalidQuestions = { questions: [] };
    const res = ClarifyQuestionsSchema.safeParse(invalidQuestions);
    assert.equal(res.success, false);
  });

  it('validates a complete engineering blueprint with honest test statuses', () => {
    const blueprintData = {
      name: testProject.name,
      tagline: testProject.tagline,
      description: testProject.description,
      type: testProject.type,
      stage: 'plan',
      constraints: testProject.constraints,
      requirements: testProject.requirements.map((r: any) => ({
        ...r,
        origin: r.origin || 'user',
        status: 'accepted',
        confidence: 'high',
        locked: r.locked ?? false,
      })),
      components: testProject.components.map((c: any) => ({
        ...c,
        responsibilities: c.responsibilities || [],
        satisfies: c.satisfies || [],
        origin: 'user',
        status: 'accepted',
      })),
      entities: testProject.entities.map((e: any) => ({
        ...e,
        fields: (e.fields || []).map((f: any) => ({
          name: f.name,
          type: f.type,
          required: !f.isNullable,
        })),
        rlsPolicies: e.rlsPolicies || [],
      })),
      endpoints: testProject.endpoints.map((ep: any) => ({
        ...ep,
        authRequired: ep.authRequired ?? true,
        parameters: ep.parameters || [],
        responseSchema: ep.responseSchema || '{}',
      })),
      tasks: testProject.tasks.map((t: any) => ({
        ...t,
        status: t.status as any,
        priority: 'high' as const,
        effortMinDays: 1,
        effortMaxDays: 3,
        dependencies: t.dependencies || [],
      })),
      testCases: testProject.testCases.map((tc: any) => ({
        ...tc,
        category: 'security' as const,
        preconditions: tc.preconditions,
        steps: tc.steps,
        expectedResult: tc.expectedResult,
        verification: 'not_run' as const,
      })),
      decisions: testProject.decisions.map((d: any) => ({
        ...d,
        alternatives: d.alternatives || [],
        consequences: d.consequences,
        status: 'accepted' as const,
      })),
      risks: testProject.risks.map((r: any) => ({
        ...r,
        severity: 'high' as const,
        mitigation: r.mitigation,
      })),
    };

    const res = FullBlueprintSchema.safeParse(blueprintData);
    assert.equal(res.success, true, res.error ? JSON.stringify(res.error.issues) : '');
  });

  it('validates Code Studio code files payload', () => {
    const codePayload = {
      files: [
        {
          path: 'src/app/page.tsx',
          description: 'Main landing page',
          language: 'typescript',
          content: 'export default function Page() { return <div>Hello</div>; }',
        },
      ],
    };
    const res = CodeFilesSchema.safeParse(codePayload);
    assert.equal(res.success, true);
  });

  it('validates Grounded Copilot assistant diff proposals', () => {
    const assistantPayload = {
      reply: 'I have prepared an architecture modification proposal.',
      proposals: [
        {
          id: 'PROP-01',
          target: 'FR-001',
          type: 'requirement' as const,
          action: 'update' as const,
          summary: 'Increase attendance SLA requirement to sub-200ms',
          proposedContent: 'Teachers can record attendance in under 200ms with offline cache.',
        },
      ],
    };
    const res = AssistantReplySchema.safeParse(assistantPayload);
    assert.equal(res.success, true);
  });
});
