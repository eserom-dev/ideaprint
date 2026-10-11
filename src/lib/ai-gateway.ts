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

const GOOGLE_MODELS_POOL = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
];

async function callGoogleDirect(params: GatewayCallParams, primaryModel: string, apiKey: string): Promise<string> {
  const modelsToTry = [primaryModel, ...GOOGLE_MODELS_POOL.filter((m) => m !== primaryModel)];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
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
        const err: any = new Error(`Google AI (${model}) request failed (HTTP ${res.status}): ${errText}`);
        err.status = res.status;
        lastError = err;
        if (res.status === 503 || res.status === 429 || res.status === 404) {
          console.warn(`[AI-Gateway] Google model ${model} returned HTTP ${res.status}. Trying next model in pool...`);
          continue;
        }
        throw err;
      }

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) {
        throw new Error(`Google AI (${model}) returned empty content`);
      }
      return raw;
    } catch (err: any) {
      lastError = err;
      if (err.status === 503 || err.status === 429 || err.status === 404 || /503|429|demand|overload|exhaust/i.test(err.message)) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Google Gemini models in pool were unavailable.');
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
      primaryErr.status === 503 ||
      /rate_limit|too large|TPM|exceeded|demand|overload/i.test(primaryErr.message);

    if (aiProvider === 'groq' && isRateOrPayloadLimit) {
      const backupGoogleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
      if (backupGoogleKey) {
        console.warn(
          `[AI-Gateway] Groq token/rate limit encountered (${primaryErr.message}). Automatically falling back to Google Gemini...`
        );
        return await callGoogleDirect(params, 'gemini-3.5-flash', backupGoogleKey);
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
 * Heals truncated JSON strings by balancing open braces, brackets, and quotes
 */
export function repairTruncatedJson(raw: string): string {
  let str = raw.trim();
  try {
    JSON.parse(str);
    return str;
  } catch (_) {}

  str = str.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  let inString = false;
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '\\' && inString) {
      escaped = !escaped;
    } else if (char === '"' && !escaped) {
      inString = !inString;
    } else {
      escaped = false;
    }
  }

  if (inString) {
    str += '"';
  }

  str = str.replace(/,\s*([}\]])/g, '$1');
  str = str.replace(/,\s*$/g, '');
  str = str.replace(/:\s*$/g, ': null');

  const stack: string[] = [];
  let inStr = false;
  let isEsc = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '\\' && inStr) {
      isEsc = !isEsc;
    } else if (char === '"' && !isEsc) {
      inStr = !inStr;
    } else if (!inStr) {
      if (char === '{') stack.push('}');
      else if (char === '[') stack.push(']');
      else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    } else {
      isEsc = false;
    }
  }

  while (stack.length > 0) {
    str += stack.pop();
  }

  str = str.replace(/,\s*([}\]])/g, '$1');
  return str;
}

/**
 * Structured Generation with Zod Schema Validation, Automatic Truncation Healing, and 1 Repair Attempt
 */
export async function generateStructured<T>(
  params: GatewayCallParams,
  schema: z.ZodSchema<T>
): Promise<T> {
  const rawResponse = await callRawAI(params);

  try {
    const cleaned = cleanJsonString(rawResponse);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (_parseErr) {
      // Auto-heal truncated JSON
      const repaired = repairTruncatedJson(cleaned);
      parsed = JSON.parse(repaired);
    }

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
    let repairParsed: any;
    try {
      repairParsed = JSON.parse(repairCleaned);
    } catch (_repairErr) {
      const repaired = repairTruncatedJson(repairCleaned);
      repairParsed = JSON.parse(repaired);
    }

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
Your task is to generate a comprehensive, production-grade implementation blueprint from the user's idea and architectural constraints.
Rigor Requirements:
1. Requirements: 4-6 essential Functional Requirements (FR-001, FR-002...) and 2-3 Non-Functional Requirements (NFR-001...). Each acceptance criteria must be crisp and testable (e.g. Given/When/Then).
2. Entities: 4-6 primary database tables (snake_case). Specify primary keys, foreign keys, and production-ready PostgreSQL Row Level Security (RLS) policies (e.g. "create policy tenant_isolation on table for all using (owner_id = auth.uid())").
3. Endpoints: 5-8 REST endpoints (GET, POST, PUT, DELETE) with path parameters, request bodies, and RFC-compliant JSON responses.
4. Tasks: 8-12 DAG-ordered tasks with explicit prerequisite dependencies in the "dependencies" array.
5. Testing Lab: 4-6 test cases with concrete steps and expected results, verification strictly set to "not_run".
6. Architecture Decisions: 3-4 formal ADRs with context, decision, rejected alternatives, and consequences.
7. Risk Register: 3-4 key technical risks with explicit mitigation strategies.

Keep architectural descriptions dense, precise, and concise without repetitive prose padding so the output stays within token boundaries.
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

