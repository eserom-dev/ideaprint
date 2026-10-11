import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMarkdownBlueprint,
  generatePostgresSchema,
  generateOpenApiJson,
  generateMermaidArchitecture,
  generateTasksCsv,
} from '../src/lib/export-generators.ts';
import { testProject } from './fixtures/testProject.mjs';

describe('Export Generators Test Suite', () => {
  it('generates comprehensive Markdown blueprint with all metadata', () => {
    const md = generateMarkdownBlueprint(testProject as any);
    assert.ok(md.includes('# EduTrack OS'), 'Must include project title');
    assert.ok(md.includes('FR-001'), 'Must include requirement FR-001');
    assert.ok(md.includes('NFR-001'), 'Must include non-functional requirement');
    assert.ok(md.includes('CMP-001'), 'Must include component');
    assert.ok(md.includes('schools'), 'Must include database entity');
    assert.ok(md.includes('/api/v1/attendance'), 'Must include endpoint');
    assert.ok(md.includes('TC-001'), 'Must include test case');
    assert.ok(md.includes('DEC-001'), 'Must include architecture decision');
  });

  it('generates valid PostgreSQL DDL with RLS and constraints', () => {
    const sql = generatePostgresSchema(testProject as any);
    assert.ok(sql.includes('create table if not exists public.schools'), 'Must create schools table');
    assert.ok(sql.includes('create table if not exists public.students'), 'Must create students table');
    assert.ok(sql.includes('alter table public.schools enable row level security;'), 'Must enable RLS');
    assert.ok(sql.includes('create policy'), 'Must generate RLS policies');
    assert.ok(sql.includes('references public.schools(id)'), 'Must define foreign key relation');
  });

  it('generates valid, parseable OpenAPI 3.1 JSON', () => {
    const jsonStr = generateOpenApiJson(testProject as any);
    const parsed = JSON.parse(jsonStr);
    assert.equal(parsed.openapi, '3.1.0', 'Must be OpenAPI 3.1.0');
    assert.equal(parsed.info.title, 'EduTrack OS');
    assert.ok(parsed.paths['/api/v1/attendance'], 'Must include attendance endpoint');
    assert.ok(parsed.paths['/api/v1/attendance'].post, 'Must define POST operation');
  });

  it('generates valid Mermaid diagram format', () => {
    const mmd = generateMermaidArchitecture(testProject as any);
    assert.ok(mmd.startsWith('flowchart TB') || mmd.startsWith('graph TD') || mmd.startsWith('graph TB'), 'Must have flowchart header');
    assert.ok(mmd.includes('CMP-001') || mmd.includes('CMP001') || mmd.includes('UI Shell'), 'Must reference component');
  });

  it('generates structured CSV with headers and task rows', () => {
    const csv = generateTasksCsv(testProject as any);
    const lines = csv.trim().split('\n');
    assert.ok(lines.length >= 3, 'Must contain header and at least 2 task lines');
    assert.ok(lines[0].includes('Task ID'), 'Header must contain Task ID');
    assert.ok(csv.includes('TSK-001'), 'CSV must include TSK-001');
    assert.ok(csv.includes('TSK-002'), 'CSV must include TSK-002');
  });
});
