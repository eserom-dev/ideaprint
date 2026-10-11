import JSZip from 'jszip';

export interface ProjectExportData {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  stage?: string;
  type?: string;
  constraints?: {
    appType?: string;
    stack?: string[];
    skills?: string;
    budget?: string;
    timeline?: string;
    hosting?: string;
  };
  requirements?: Array<{
    displayId: string;
    kind?: string;
    statement: string;
    priority: string;
    category?: string;
    rationale?: string;
    acceptanceCriteria?: string[];
    origin?: string;
    status?: string;
  }>;
  components?: Array<{
    displayId: string;
    name: string;
    type: string;
    technology: string;
    responsibilities?: string[];
    satisfies?: string[];
  }>;
  entities?: Array<{
    displayId: string;
    name: string;
    description?: string;
    fields?: Array<{
      name: string;
      type: string;
      required?: boolean;
      isPrimary?: boolean;
      isNullable?: boolean;
      references?: string;
      description?: string;
    }>;
    rlsPolicies?: string[];
  }>;
  endpoints?: Array<{
    displayId: string;
    path: string;
    method: string;
    summary: string;
    authRequired?: boolean;
    parameters?: string[];
    responseSchema?: string;
  }>;
  tasks?: Array<{
    displayId: string;
    title: string;
    description: string;
    status: string;
    priority?: string;
    effortMinDays?: number;
    effortMaxDays?: number;
    dependencies?: string[];
    implementsReq?: string;
  }>;
  testCases?: Array<{
    displayId: string;
    category?: string;
    objective: string;
    expectedResult: string;
    verification?: string;
    verifiesReq?: string;
  }>;
  decisions?: Array<{
    displayId: string;
    decision: string;
    context: string;
    alternatives?: string[];
    consequences: string;
    status?: string;
  }>;
  risks?: Array<{
    displayId: string;
    description: string;
    severity: string;
    mitigation: string;
  }>;
}

/**
 * 1. Generate Markdown Specification (BLUEPRINT.md)
 */
export function generateMarkdownBlueprint(project: ProjectExportData): string {
  const reqs = project.requirements || [];
  const cmps = project.components || [];
  const ents = project.entities || [];
  const eps = project.endpoints || [];
  const tsks = project.tasks || [];
  const tests = project.testCases || [];
  const decs = project.decisions || [];
  const rsks = project.risks || [];

  return `# ${project.name} — Software Blueprint Specification
> **Tagline:** ${project.tagline || 'Engineered with IDEAPRINT'}  
> **Stage:** ${project.stage || 'plan'} | **Platform:** ${project.type || 'website'}  
> **Export Timestamp:** ${new Date().toISOString()}

---

## 1. Executive Summary & Problem Statement
${project.description || 'Full-stack software application specification.'}

### System Constraints & Stack
- **Target Stack:** ${(project.constraints?.stack || ['Next.js 14', 'TypeScript', 'Supabase PostgreSQL']).join(', ')}
- **Skill Profile:** ${project.constraints?.skills || 'Full-Stack Developer'}
- **Budget Band:** ${project.constraints?.budget || '$0 Free Tier MVP'}
- **Timeline:** ${project.constraints?.timeline || '4-6 Weeks'}

---

## 2. Requirements Matrix (${reqs.length} Items)
${reqs
  .map(
    (r) => `### [${r.displayId}] ${r.statement}
- **Priority:** ${r.priority.toUpperCase()} | **Category:** ${r.category || 'Core'} | **Origin:** ${r.origin || 'ai_proposed'}
- **Rationale:** ${r.rationale || 'Essential capability.'}
- **Acceptance Criteria:**
${(r.acceptanceCriteria || []).map((c) => `  - [ ] ${c}`).join('\n') || '  - [ ] Verified in testing.'}
`
  )
  .join('\n')}

---

## 3. System Architecture Components (${cmps.length} Nodes)
${cmps
  .map(
    (c) => `### [${c.displayId}] ${c.name} (${c.type.toUpperCase()})
- **Technology:** ${c.technology}
- **Responsibilities:**
${(c.responsibilities || []).map((res) => `  - ${res}`).join('\n')}
- **Satisfies Requirements:** ${(c.satisfies || []).join(', ') || 'N/A'}
`
  )
  .join('\n')}

---

## 4. Relational Database Design (${ents.length} Entities)
${ents
  .map(
    (e) => `### [${e.displayId}] Table: \`${e.name.toLowerCase()}\`
${e.description ? `*${e.description}*\n` : ''}
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
${(e.fields || [])
  .map(
    (f) =>
      `| \`${f.name}\` | \`${f.type}\` | ${f.isPrimary ? 'PK ' : ''}${!f.isNullable ? 'NOT NULL ' : ''}${f.references ? `→ ${f.references}` : ''} | ${f.description || '—'} |`
  )
  .join('\n')}

**Row Level Security (RLS) Policies:**
\`\`\`sql
${(e.rlsPolicies || ['CREATE POLICY "user_isolation" ON public.' + e.name.toLowerCase() + ' FOR ALL USING (auth.uid() = owner_id);']).join('\n')}
\`\`\`
`
  )
  .join('\n')}

---

## 5. REST API Contracts (${eps.length} Endpoints)
${eps
  .map(
    (ep) => `### [${ep.displayId}] \`${ep.method} ${ep.path}\`
- **Summary:** ${ep.summary}
- **Authentication:** ${ep.authRequired ? 'Required (JWT Bearer)' : 'Public'}
- **Parameters:** ${(ep.parameters || []).join(', ') || 'None'}
- **Response Schema:**
\`\`\`json
${ep.responseSchema || '{}'}
\`\`\`
`
  )
  .join('\n')}

---

## 6. Implementation Task Graph (${tsks.length} Tasks)
${tsks
  .map(
    (t) => `### [${t.displayId}] ${t.title}
- **Status:** ${t.status} | **Effort:** ${t.effortMinDays || 1}–${t.effortMaxDays || 3} days
- **Dependencies:** ${(t.dependencies || []).join(', ') || 'None (Unblocked)'}
- **Implements:** ${t.implementsReq || 'N/A'}
- **Description:** ${t.description}
`
  )
  .join('\n')}

---

## 7. Verification & Test Plan (${tests.length} Test Cases)
${tests
  .map(
    (tc) => `### [${tc.displayId}] ${tc.objective}
- **Category:** ${(tc.category || 'functional').toUpperCase()}
- **Verification Status:** **${(tc.verification || 'not_run').toUpperCase()}** *(Generated tests stay Not Run until human or test runner verifies)*
- **Expected Outcome:** ${tc.expectedResult}
- **Verifies:** ${tc.verifiesReq || 'N/A'}
`
  )
  .join('\n')}

---

## 8. Architecture Decision Records (ADRs)
${decs
  .map(
    (d) => `### [${d.displayId}] ${d.decision}
- **Context:** ${d.context}
- **Alternatives Rejected:** ${(d.alternatives || []).join(', ') || 'None'}
- **Consequences:** ${d.consequences}
`
  )
  .join('\n')}

---

## 9. Risk Register & Mitigations
${rsks
  .map(
    (r) => `- **[${r.displayId}] (${r.severity.toUpperCase()}):** ${r.description}  
  ↳ *Mitigation:* ${r.mitigation}`
  )
  .join('\n')}
`;
}

/**
 * 2. Generate PostgreSQL DDL & Row Level Security Migration (schema.sql)
 */
export function generatePostgresSchema(project: ProjectExportData): string {
  const ents = project.entities || [];
  const lines: string[] = [];

  lines.push(`-- ========================================================================`);
  lines.push(`-- PostgreSQL Schema & Row Level Security (RLS) Policies`);
  lines.push(`-- Project: ${project.name}`);
  lines.push(`-- Generated by IDEAPRINT Engineering Platform`);
  lines.push(`-- Exported: ${new Date().toISOString()}`);
  lines.push(`-- ========================================================================\n`);
  lines.push(`create extension if not exists "uuid-ossp";`);
  lines.push(`create extension if not exists "pgcrypto";\n`);

  if (ents.length === 0) {
    lines.push(`-- Sample application table`);
    lines.push(`create table if not exists public.records (`);
    lines.push(`  id uuid primary key default gen_random_uuid(),`);
    lines.push(`  owner_id uuid references auth.users(id) on delete cascade,`);
    lines.push(`  title text not null,`);
    lines.push(`  created_at timestamptz not null default now()`);
    lines.push(`);\n`);
    lines.push(`alter table public.records enable row level security;`);
    lines.push(`create policy "records_owner" on public.records for all using (auth.uid() = owner_id);\n`);
    return lines.join('\n');
  }

  ents.forEach((e) => {
    const tableName = e.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    lines.push(`-- ------------------------------------------------------------------------`);
    lines.push(`-- Table: ${tableName} (${e.displayId})`);
    if (e.description) lines.push(`-- ${e.description}`);
    lines.push(`-- ------------------------------------------------------------------------`);
    lines.push(`create table if not exists public.${tableName} (`);

    const fieldLines: string[] = [];
    fieldLines.push(`  id uuid primary key default gen_random_uuid()`);
    fieldLines.push(`  owner_id uuid references auth.users(id) on delete cascade`);

    (e.fields || []).forEach((f) => {
      if (f.name.toLowerCase() === 'id' || f.name.toLowerCase() === 'owner_id') return;
      const colName = f.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      let pgType = 'text';
      const t = f.type.toLowerCase();
      if (t.includes('uuid')) pgType = 'uuid';
      else if (t.includes('int') || t.includes('number')) pgType = 'numeric';
      else if (t.includes('bool')) pgType = 'boolean';
      else if (t.includes('json') || t.includes('object') || t.includes('array')) pgType = 'jsonb';
      else if (t.includes('date') || t.includes('time')) pgType = 'timestamptz';

      let constraints = '';
      if (!f.isNullable) constraints += ' not null';
      if (f.references) {
        const refTable = f.references.includes('.') ? f.references.split('.')[0] : f.references;
        constraints += ` references public.${refTable}(id) on delete cascade`;
      }

      fieldLines.push(`  ${colName} ${pgType}${constraints}`);
    });

    fieldLines.push(`  created_at timestamptz not null default now()`);
    fieldLines.push(`  updated_at timestamptz not null default now()`);

    lines.push(fieldLines.join(',\n'));
    lines.push(`);\n`);

    lines.push(`-- RLS Security Guard`);
    lines.push(`alter table public.${tableName} enable row level security;\n`);

    if (e.rlsPolicies && e.rlsPolicies.length > 0) {
      e.rlsPolicies.forEach((pol, idx) => {
        if (pol.toLowerCase().startsWith('create policy')) {
          lines.push(`${pol};`);
        } else {
          lines.push(`create policy "${tableName}_policy_${idx + 1}" on public.${tableName} for all using (${pol});`);
        }
      });
    } else {
      lines.push(`create policy "${tableName}_owner_isolation" on public.${tableName}`);
      lines.push(`  for all using (auth.uid() = owner_id);\n`);
    }

    lines.push(``);
  });

  return lines.join('\n');
}

/**
 * 3. Generate OpenAPI 3.1 Contract JSON (openapi.json)
 */
export function generateOpenApiJson(project: ProjectExportData): string {
  const eps = project.endpoints || [];

  const paths: Record<string, any> = {};

  eps.forEach((ep) => {
    const formattedPath = ep.path.startsWith('/') ? ep.path : `/${ep.path}`;
    if (!paths[formattedPath]) {
      paths[formattedPath] = {};
    }

    const methodLower = ep.method.toLowerCase();
    paths[formattedPath][methodLower] = {
      summary: ep.summary,
      operationId: `${methodLower}_${ep.displayId.toLowerCase()}`,
      security: ep.authRequired ? [{ bearerAuth: [] }] : [],
      parameters: (ep.parameters || []).map((p) => ({
        name: p,
        in: 'query',
        required: false,
        schema: { type: 'string' },
      })),
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: ep.responseSchema || 'Payload result',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized access',
        },
      },
    };
  });

  const spec = {
    openapi: '3.1.0',
    info: {
      title: project.name,
      description: project.description || 'API Contract generated by IDEAPRINT',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'https://api.yourdomain.com/v1',
        description: 'Production API Gateway',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Local Next.js Development Server',
      },
    ],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };

  return JSON.stringify(spec, null, 2);
}

/**
 * 4. Generate Mermaid Architecture Diagram (.mmd)
 */
export function generateMermaidArchitecture(project: ProjectExportData): string {
  const cmps = project.components || [];
  const ents = project.entities || [];

  const lines: string[] = [];
  lines.push('graph TD');
  lines.push('  %% Styling classes');
  lines.push('  classDef client fill:#18181b,stroke:#f97316,stroke-width:2px,color:#fff;');
  lines.push('  classDef api fill:#18181b,stroke:#06b6d4,stroke-width:2px,color:#fff;');
  lines.push('  classDef db fill:#18181b,stroke:#10b981,stroke-width:2px,color:#fff;');
  lines.push('  classDef svc fill:#18181b,stroke:#a855f7,stroke-width:2px,color:#fff;\n');

  lines.push('  Client["Client Browser / Mobile PWA"]:::client');

  if (cmps.length === 0) {
    lines.push('  Frontend["Next.js 14 App Router"]:::client');
    lines.push('  API["Supabase REST & Edge Functions"]:::api');
    lines.push('  Database[("PostgreSQL Database")]:::db');
    lines.push('  Client --> Frontend');
    lines.push('  Frontend --> API');
    lines.push('  API --> Database');
  } else {
    cmps.forEach((c) => {
      const safeId = c.displayId.replace(/[^a-zA-Z0-9]/g, '_');
      const cls = c.type === 'frontend' ? 'client' : c.type === 'database' ? 'db' : c.type === 'gateway' ? 'api' : 'svc';
      lines.push(`  ${safeId}["${c.name} (${c.technology})"]:::${cls}`);
    });

    lines.push('');
    // Connect client to frontend components
    const frontendNodes = cmps.filter((c) => c.type === 'frontend');
    if (frontendNodes.length > 0) {
      frontendNodes.forEach((fn) => {
        lines.push(`  Client --> ${fn.displayId.replace(/[^a-zA-Z0-9]/g, '_')}`);
      });
    } else {
      lines.push(`  Client --> ${cmps[0].displayId.replace(/[^a-zA-Z0-9]/g, '_')}`);
    }

    // Connect frontend to services
    const serviceNodes = cmps.filter((c) => c.type !== 'frontend' && c.type !== 'database');
    const dbNodes = cmps.filter((c) => c.type === 'database');

    if (frontendNodes.length > 0 && serviceNodes.length > 0) {
      frontendNodes.forEach((fn) => {
        serviceNodes.forEach((sn) => {
          lines.push(`  ${fn.displayId.replace(/[^a-zA-Z0-9]/g, '_')} --> ${sn.displayId.replace(/[^a-zA-Z0-9]/g, '_')}`);
        });
      });
    }

    if (serviceNodes.length > 0 && dbNodes.length > 0) {
      serviceNodes.forEach((sn) => {
        dbNodes.forEach((dn) => {
          lines.push(`  ${sn.displayId.replace(/[^a-zA-Z0-9]/g, '_')} --> ${dn.displayId.replace(/[^a-zA-Z0-9]/g, '_')}`);
        });
      });
    } else if (dbNodes.length > 0 && frontendNodes.length > 0) {
      frontendNodes.forEach((fn) => {
        dbNodes.forEach((dn) => {
          lines.push(`  ${fn.displayId.replace(/[^a-zA-Z0-9]/g, '_')} --> ${dn.displayId.replace(/[^a-zA-Z0-9]/g, '_')}`);
        });
      });
    }
  }

  if (ents.length > 0) {
    lines.push('\n  subgraph DataLayer ["Data & Entities (RLS Guarded)"]');
    ents.forEach((e) => {
      const entId = e.displayId.replace(/[^a-zA-Z0-9]/g, '_');
      lines.push(`    ${entId}[("${e.name} Table")]:::db`);
    });
    lines.push('  end');
  }

  return lines.join('\n');
}

/**
 * 5. Generate Tasks CSV (tasks.csv)
 */
export function generateTasksCsv(project: ProjectExportData): string {
  const tsks = project.tasks || [];
  const rows: string[] = [];

  rows.push('"Task ID","Title","Status","Priority","Min Days","Max Days","Dependencies","Linked Requirement"');

  tsks.forEach((t) => {
    const deps = (t.dependencies || []).join('; ');
    const safeTitle = (t.title || '').replace(/"/g, '""');
    rows.push(
      `"${t.displayId}","${safeTitle}","${t.status}","${t.priority || 'medium'}",${t.effortMinDays || 1},${t.effortMaxDays || 3},"${deps}","${t.implementsReq || ''}"`
    );
  });

  return rows.join('\n');
}

/**
 * Utility to download raw text as a file in the browser
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 6. Generate Complete AI Coding Assistant Build Pack (.zip)
 */
export async function downloadBuildPackZip(project: ProjectExportData) {
  const zip = new JSZip();
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Add all individual assets
  zip.file('BLUEPRINT.md', generateMarkdownBlueprint(project));
  zip.file('schema.sql', generatePostgresSchema(project));
  zip.file('openapi.json', generateOpenApiJson(project));
  zip.file('architecture.mmd', generateMermaidArchitecture(project));
  zip.file('tasks.csv', generateTasksCsv(project));

  // Add specialized Cursor / Claude / Copilot Prompt instructions
  const agentInstructions = `# AI Assistant Prompt Context for ${project.name}

You are an expert full-stack software engineer building **${project.name}**.
All architectural decisions, database schemas with Row Level Security, API endpoints, and task dependencies have been pre-specified by IDEAPRINT.

## Getting Started
1. Review \`BLUEPRINT.md\` for complete specifications and user stories.
2. Run \`schema.sql\` in your Supabase PostgreSQL console to initialize tables with RLS.
3. Review \`openapi.json\` for exact route parameters and response formats.
4. Execute tasks sequentially following the DAG dependencies in \`tasks.csv\`.

## Architectural Rules
- All user data must be scoped with Row Level Security (\`auth.uid() = owner_id\`).
- Use TypeScript strictly; avoid \`any\`.
- All routes must validate payloads with Zod.
`;
  zip.file('AI_PROMPT_INSTRUCTIONS.md', agentInstructions);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}-ideaprint-build-pack.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
