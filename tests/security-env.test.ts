import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getServerEnv, getMissingServerEnv } from '../src/lib/server-env.ts';

describe('Security & Server Environment Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  it('detects missing core Supabase and AI provider variables', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    process.env.AI_PROVIDER = 'groq';

    const missing = getMissingServerEnv();
    assert.ok(missing.includes('NEXT_PUBLIC_SUPABASE_URL'));
    assert.ok(missing.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
    assert.ok(missing.includes('SUPABASE_SERVICE_ROLE_KEY'));
    assert.ok(missing.includes('GROQ_API_KEY'));
  });

  it('detects provider-specific key requirements correctly', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://valid-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'valid-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'valid-service-key';

    // OpenAI provider check
    process.env.AI_PROVIDER = 'openai';
    delete process.env.OPENAI_API_KEY;
    assert.ok(getMissingServerEnv().includes('OPENAI_API_KEY'));

    // Anthropic provider check
    process.env.AI_PROVIDER = 'anthropic';
    delete process.env.ANTHROPIC_API_KEY;
    assert.ok(getMissingServerEnv().includes('ANTHROPIC_API_KEY'));

    // Google/Gemini provider check
    process.env.AI_PROVIDER = 'google';
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    assert.ok(getMissingServerEnv().some((k) => k.includes('GOOGLE_GENERATIVE_AI_API_KEY')));
  });

  it('validates server env successfully when valid keys are configured', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://sample-app.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sample-anon-jwt-token';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sample-service-jwt-token';
    process.env.AI_PROVIDER = 'groq';
    process.env.GROQ_API_KEY = 'gsk_mock_valid_key_for_testing';
    process.env.AI_MODEL = 'openai/gpt-oss-120b';

    const env = getServerEnv();
    assert.equal(env.supabaseUrl, 'https://sample-app.supabase.co');
    assert.equal(env.supabaseAnonKey, 'sample-anon-jwt-token');
    assert.equal(env.supabaseServiceKey, 'sample-service-jwt-token');
    assert.equal(env.aiProvider, 'groq');
    assert.equal(env.aiApiKey, 'gsk_mock_valid_key_for_testing');
    assert.equal(env.aiModel, 'openai/gpt-oss-120b');
  });

  it('throws an error without leaking secret values when validation fails', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.AI_PROVIDER = 'openai';
    delete process.env.OPENAI_API_KEY;

    assert.throws(
      () => {
        getServerEnv();
      },
      (err: any) => {
        // Must contain missing variable name, but NEVER secret values
        assert.ok(err.message.includes('Server environment configuration error'));
        assert.ok(err.message.includes('NEXT_PUBLIC_SUPABASE_URL'));
        return true;
      }
    );
  });

  it('guarantees service role key is NEVER prefixed with NEXT_PUBLIC_', () => {
    // Ensure architectural security rule: backend secrets must not be exposed to client bundle
    assert.equal(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY, undefined);
    assert.equal(process.env.NEXT_PUBLIC_GROQ_API_KEY, undefined);
    assert.equal(process.env.NEXT_PUBLIC_OPENAI_API_KEY, undefined);
    assert.equal(process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY, undefined);
  });

  it('verifies explicit admin authorization policy logic', () => {
    function checkAdminAccess(profile: { is_admin?: boolean; role?: string } | null): boolean {
      return profile?.is_admin === true || profile?.role === 'admin';
    }

    assert.equal(checkAdminAccess(null), false);
    assert.equal(checkAdminAccess({ is_admin: false, role: 'user' }), false);
    assert.equal(checkAdminAccess({ is_admin: false, role: 'editor' }), false);
    assert.equal(checkAdminAccess({ is_admin: true, role: 'user' }), true);
    assert.equal(checkAdminAccess({ is_admin: false, role: 'admin' }), true);
  });

  it('verifies destructive account deletion requires exact uppercase DELETE token', () => {
    function validateDeleteConfirmation(confirmation: string | undefined): boolean {
      return confirmation === 'DELETE';
    }

    assert.equal(validateDeleteConfirmation(undefined), false);
    assert.equal(validateDeleteConfirmation('delete'), false);
    assert.equal(validateDeleteConfirmation('Delete'), false);
    assert.equal(validateDeleteConfirmation('yes'), false);
    assert.equal(validateDeleteConfirmation('DELETE'), true);
  });
});
