import { z } from 'zod';
import { getServerEnv } from './server-env.ts';

// Server-side guard
if (typeof window !== 'undefined') {
  throw new Error('FATAL: ai-gateway.ts cannot be imported in client-side code!');
}

export interface GatewayCallParams {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

async function callGroqDirect(params: GatewayCallParams, model: string, apiKey: string): Promise<string> {
  const maxTokens = Math.min(params.maxTokens ?? 3200, 3200);
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.prompt },
      ],
      temperature: params.temperature ?? 0.2,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err: any = new Error(`Groq AI request failed (HTTP ${res.status}): ${errText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned empty response');
  return content;
}

async function callGoogleDirect(params: GatewayCallParams, model: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${params.system}\n\nUser Request:\n${params.prompt}` }],
        },
      ],
      generationConfig: {
        temperature: params.temperature ?? 0.2,
        maxOutputTokens: params.maxTokens ?? 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err: any = new Error(`Google AI request failed (HTTP ${res.status}): ${errText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Google AI returned empty content');
  return raw;
}

async function callOpenAIDirect(params: GatewayCallParams, model: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.prompt },
      ],
      temperature: params.temperature ?? 0.2,
      max_tokens: params.maxTokens ?? 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const err: any = new Error(`OpenAI request failed (HTTP ${res.status}): ${errText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');
  return content;
}

export async function callRawAI(params: GatewayCallParams): Promise<string> {
  const env = getServerEnv();
  const { aiProvider, aiModel, aiApiKey } = env;

  try {
    if (aiProvider === 'groq') {
      return await callGroqDirect(params, aiModel, aiApiKey);
    }
    if (aiProvider === 'google' || aiProvider === 'gemini') {
      return await callGoogleDirect(params, aiModel, aiApiKey);
    }
    if (aiProvider === 'openai') {
      return await callOpenAIDirect(params, aiModel, aiApiKey);
    }
  } catch (primaryErr: any) {
    // If rate-limited or TPM token payload ceiling exceeded, check if a backup provider is available
    const isRateOrPayloadLimit =
      primaryErr.status === 413 ||
      primaryErr.status === 429 ||
      /rate_limit|too large|TPM|exceeded/i.test(primaryErr.message);

    if (aiProvider === 'groq' && isRateOrPayloadLimit) {
      const backupGoogleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
      if (backupGoogleKey) {
        console.warn(
          `[AI-Gateway] Groq token/rate limit encountered (${primaryErr.message}). Automatically falling back to Google Gemini...`
        );
        return await callGoogleDirect(params, 'gemini-flash-latest', backupGoogleKey);
      }
    } else if ((aiProvider === 'google' || aiProvider === 'gemini') && isRateOrPayloadLimit) {
      const backupGroqKey = process.env.GROQ_API_KEY;
      if (backupGroqKey) {
        console.warn(
          `[AI-Gateway] Google Gemini rate limit encountered (${primaryErr.message}). Automatically falling back to Groq...`
        );
        return await callGroqDirect(params, 'openai/gpt-oss-120b', backupGroqKey);
      }
    }

    throw primaryErr;
  }

  throw new Error(`Unsupported AI provider: ${aiProvider}`);
}

function cleanJsonString(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Structured Generation with Zod Schema Validation and 1 Automatic Repair Attempt
 */
export async function generateStructured<T>(
  params: GatewayCallParams,
  schema: z.ZodSchema<T>
): Promise<T> {
  const rawResponse = await callRawAI(params);

  try {
    const cleaned = cleanJsonString(rawResponse);
    const parsed = JSON.parse(cleaned);
    const validated = schema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }

    // Attempt 1: Automatic Repair Attempt
    const repairPrompt = `The previous JSON response did not match the strict schema.
Validation Issues:
${JSON.stringify(validated.error.issues, null, 2)}

Original Invalid Output:
${cleaned.slice(0, 3000)}

Please return the corrected JSON that strictly satisfies the schema. Return ONLY valid JSON:`;

    const repairRaw = await callRawAI({
      system: 'You are an automated JSON schema repair engine. Return only valid JSON conforming strictly to the requested structure.',
      prompt: repairPrompt,
      temperature: 0.1,
    });

    const repairCleaned = cleanJsonString(repairRaw);
    const repairParsed = JSON.parse(repairCleaned);
    const repairValidated = schema.parse(repairParsed);
    return repairValidated;
  } catch (err: any) {
    throw new Error(`Structured AI generation failed schema validation: ${err.message}`);
  }
}

// ========================================================================
// Specific Domain Generator Methods
// ========================================================================

export const ClarifyQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      why: z.string(),
      assumedIfSkipped: z.string(),
    })
  ).min(1).max(5),
});

export type ClarifyingQuestion = z.infer<typeof ClarifyQuestionsSchema>['questions'][number];

/**
 * Step 2 Clarify: Generate at most 5 targeted clarifying questions based on user's idea
 */
export async function generateClarifyingQuestions(idea: string): Promise<ClarifyingQuestion[]> {
  const system = `You are a Principal Software Architect.
Analyze the user's software idea and generate at most 5 critical clarifying questions.
Each question must target an architectural fork: user authentication, multi-tenancy, payments, offline support, or core third-party integrations.
Provide:
- id: e.g. "Q-01"
- question: clear, direct question
- why: technical rationale
- assumedIfSkipped: the safe default assumption if the user skips this question

Output MUST be a JSON object: { "questions": [...] }`;

  const result = await generateStructured(
    { system, prompt: `Software Idea: ${idea}` },
    ClarifyQuestionsSchema
  );

  return result.questions.slice(0, 5);
}

export const FullBlueprintSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  type: z.string().default('Website Application'),
  stage: z.string().default('plan'),
  constraints: z.object({
    appType: z.string(),
    stack: z.array(z.string()),
    skills: z.string(),
    budget: z.string(),
    timeline: z.string(),
  }),
  requirements: z.array(
    z.object({
      displayId: z.string(),
      kind: z.enum(['functional', 'non_functional']),
      statement: z.string(),
      priority: z.enum(['must', 'should', 'could', 'wont']),
      category: z.string(),
      rationale: z.string(),
      acceptanceCriteria: z.array(z.string()),
      derivesFrom: z.array(z.string()).default([]),
      origin: z.enum(['user', 'ai_proposed', 'ai_assumed']),
      status: z.enum(['proposed', 'accepted']).default('proposed'),
      confidence: z.enum(['low', 'medium', 'high']).default('high'),
      locked: z.boolean().default(false),
    })
  ),
  components: z.array(
    z.object({
      displayId: z.string(),
      name: z.string(),
      type: z.enum(['frontend', 'backend', 'database', 'service', 'gateway', 'worker']),
      technology: z.string(),
      responsibilities: z.array(z.string()),
      satisfies: z.array(z.string()).default([]),
      origin: z.string().default('ai_proposed'),
      status: z.string().default('accepted'),
    })
  ),
  entities: z.array(
    z.object({
      displayId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      fields: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean().default(false),
        })
      ),
      rlsPolicies: z.array(z.string()).default([]),
      origin: z.string().default('ai_proposed'),
      status: z.string().default('accepted'),
    })
  ),
  endpoints: z.array(
    z.object({
      displayId: z.string(),
      path: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      summary: z.string(),
      authRequired: z.boolean().default(true),
      parameters: z.array(z.string()).default([]),
      responseSchema: z.string(),
      origin: z.string().default('ai_proposed'),
      status: z.string().default('accepted'),
    })
  ),
  tasks: z.array(
    z.object({
      displayId: z.string(),
      title: z.string(),
      description: z.string(),
      status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      effortMinDays: z.number().default(1),
      effortMaxDays: z.number().default(3),
      dependencies: z.array(z.string()).default([]),
      implementsReq: z.string().optional(),
      origin: z.string().default('ai_proposed'),
    })
  ),
  testCases: z.array(
    z.object({
      displayId: z.string(),
      category: z.enum(['functional', 'security', 'permissions', 'edge', 'accessibility', 'reliability']),
      objective: z.string(),
      preconditions: z.string(),
      steps: z.array(z.string()),
      expectedResult: z.string(),
      verifiesReq: z.string().optional(),
      verification: z.enum(['not_run', 'passed', 'failed', 'blocked']).default('not_run'),
      origin: z.string().default('ai_proposed'),
      status: z.string().default('accepted'),
    })
  ),
  decisions: z.array(
    z.object({
      displayId: z.string(),
      context: z.string(),
      decision: z.string(),
      alternatives: z.array(z.string()).default([]),
      consequences: z.string(),
      status: z.enum(['proposed', 'accepted', 'superseded']).default('accepted'),
    })
  ),
  risks: z.array(
    z.object({
      displayId: z.string(),
      description: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      mitigation: z.string(),
    })
  ),
});

export type GeneratedBlueprint = z.infer<typeof FullBlueprintSchema>;

/**
 * Stage 4: Staged Blueprint Pipeline Generation
 */
export async function generateCompleteBlueprint(options: {
  idea: string;
  projectName: string;
  clarifications: { question: string; answer: string; assumed: boolean }[];
  constraints: {
    stack: string[];
    developerSkills?: string;
    budget?: string;
    timeline?: string;
  };
}): Promise<GeneratedBlueprint> {
  const system = `You are IDEAPRINT, the Principal Product Engineering Architect.
Your task is to generate an exhaustive, production-grade implementation blueprint from the user's idea and architectural constraints.
Rigor Requirements:
1. Requirements: Each must have stable displayIds (FR-001, NFR-001). Acceptance criteria MUST be specific and testable (e.g. Given/When/Then or measurable latency/error thresholds).
2. Entities: Table names must be snake_case. Every entity must specify primary key (uuid default gen_random_uuid()), foreign keys, and production-ready PostgreSQL Row Level Security (RLS) policies (e.g. "create policy tenant_isolation on table for all using (owner_id = auth.uid())").
3. Endpoints: Standard REST endpoints (GET, POST, PUT, PATCH, DELETE) with path parameters, request bodies, and RFC-compliant JSON responses.
4. Tasks: Organized as a directed acyclic graph (DAG) with explicit prerequisite dependencies in the "dependencies" array.
5. Testing Lab: Every test case must have concrete steps and expected results, and verification MUST be strictly set to "not_run" (never claim tests passed without execution).
6. Architecture Decisions: Formal ADR format with context, decision, rejected alternatives, and consequences.
7. Risk Register: Identified failure modes with explicit mitigation strategies.

Return ONLY valid JSON matching the complete blueprint schema.`;

  const prompt = `Project Name: ${options.projectName}
Original Idea: ${options.idea}
Clarification Answers & Assumptions:
${options.clarifications.map((c) => `- Q: ${c.question}\n  A: ${c.answer} (${c.assumed ? 'Assumed Default' : 'User Answered'})`).join('\n')}

Technical Constraints:
- Stack: ${options.constraints.stack.join(', ')}
- Skills: ${options.constraints.developerSkills || 'TypeScript / React / PostgreSQL'}
- Budget: ${options.constraints.budget || '$0 MVP'}
- Timeline: ${options.constraints.timeline || '4-6 Weeks'}`;

  return await generateStructured({ system, prompt, temperature: 0.2 }, FullBlueprintSchema);
}

// ========================================================================
// Code Studio Codebase & Task Generation
// ========================================================================

export const CodeFilesSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      description: z.string(),
      language: z.string(),
      content: z.string(),
    })
  ).min(1),
});

export type GeneratedCodeFile = z.infer<typeof CodeFilesSchema>['files'][number];

export async function generateCodeStudioFiles(options: {
  projectName: string;
  description: string;
  stack?: string[];
  requirements?: any[];
  entities?: any[];
  endpoints?: any[];
  targetTask?: { displayId: string; title: string; description: string };
}): Promise<GeneratedCodeFile[]> {
  const isTaskTargeted = !!options.targetTask;

  const system = `You are a Principal Software Engineer generating real, runnable, production code for ${options.projectName}.
Rules:
1. Zero placeholders, zero ellipses, zero lorem ipsum. Output actual, compilable Next.js 14 App Router, TypeScript, Tailwind CSS, and Supabase PostgreSQL code.
2. Every database query must use Supabase client with proper Row Level Security awareness.
3. Every API route must validate inputs and handle errors.
4. Output MUST be valid JSON: { "files": [ { "path": "...", "description": "...", "language": "...", "content": "..." } ] }`;

  let prompt = `Project: ${options.projectName}
Description: ${options.description}
Stack: ${(options.stack || ['Next.js 14 App Router', 'TypeScript', 'Tailwind CSS', 'Supabase PostgreSQL']).join(', ')}

Requirements:
${(options.requirements || []).slice(0, 6).map((r) => `- [${r.displayId}] ${r.statement}`).join('\n')}

Database Entities:
${(options.entities || []).slice(0, 5).map((e) => `- ${e.name} (${(e.fields || []).map((f: any) => `${f.name}:${f.type}`).join(', ')})`).join('\n')}

API Endpoints:
${(options.endpoints || []).slice(0, 5).map((ep) => `- ${ep.method} ${ep.path}: ${ep.summary}`).join('\n')}`;

  if (isTaskTargeted) {
    prompt += `\n\nTARGET TASK SPECIFICATION:
Task ID: ${options.targetTask?.displayId}
Title: ${options.targetTask?.title}
Description: ${options.targetTask?.description}

Synthesize or update the specific code files that implement this task directly.`;
  } else {
    prompt += `\n\nGenerate the complete core full-stack application file tree:
1. package.json
2. tsconfig.json
3. tailwind.config.ts
4. src/app/layout.tsx
5. src/app/page.tsx
6. src/lib/supabase.ts
7. src/lib/types.ts
8. src/app/api/data/route.ts
9. supabase/schema.sql
10. README.md`;
  }

  const result = await generateStructured({ system, prompt, temperature: 0.2 }, CodeFilesSchema);
  return result.files;
}

// ========================================================================
// Grounded Project Assistant (With Audited Diff Proposals)
// ========================================================================

export const AssistantReplySchema = z.object({
  reply: z.string(),
  proposals: z.array(
    z.object({
      id: z.string(),
      target: z.string(),
      type: z.enum(['requirement', 'entity', 'endpoint', 'task', 'code', 'general']),
      action: z.enum(['add', 'update', 'delete']),
      summary: z.string(),
      originalContent: z.string().optional(),
      proposedContent: z.string(),
    })
  ).default([]),
});

export type AssistantReply = z.infer<typeof AssistantReplySchema>;

export async function generateGroundedAssistantReply(options: {
  project: any;
  userPrompt: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<AssistantReply> {
  const p = options.project;

  const system = `You are the IDEAPRINT Grounded Engineering Copilot.
You have complete real-time access to the current project data:
- Name: ${p.name}
- Stage: ${p.stage || 'plan'}
- Requirements (${(p.requirements || []).length} items)
- Entities (${(p.entities || []).length} tables)
- Endpoints (${(p.endpoints || []).length} endpoints)
- Tasks (${(p.tasks || []).length} tasks)
- Decisions (${(p.decisions || []).length} ADRs)

RULES:
1. Answer questions accurately based strictly on this project's real architecture.
2. If the user asks to modify, add, or delete any requirement, schema, endpoint, task, or code, you MUST formulate each change as an explicit PROPOSAL with a diff.
3. NEVER make silent edits. All changes must be returned in the "proposals" array so the user can review, accept, or reject them.
4. Output MUST be valid JSON: { "reply": "markdown text", "proposals": [ ... ] }`;

  let prompt = `CURRENT PROJECT CONTEXT:
Requirements: ${(p.requirements || []).slice(0, 6).map((r: any) => `[${r.displayId}] ${r.statement}`).join('; ')}
Database Entities: ${(p.entities || []).slice(0, 5).map((e: any) => e.name).join(', ')}
API Endpoints: ${(p.endpoints || []).slice(0, 5).map((ep: any) => `${ep.method} ${ep.path}`).join(', ')}
Tasks: ${(p.tasks || []).slice(0, 6).map((t: any) => `[${t.displayId}: ${t.status}] ${t.title}`).join('; ')}

User Prompt: "${options.userPrompt}"`;

  return await generateStructured({ system, prompt, temperature: 0.2 }, AssistantReplySchema);
}

