import { z } from 'zod';

// Ensure module is strictly server-side
if (typeof window !== 'undefined') {
  throw new Error('FATAL: server-env.ts cannot be imported into client-side code!');
}

const ServerEnvSchema = z.object({
  supabaseUrl: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  supabaseAnonKey: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  supabaseServiceKey: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  aiProvider: z.enum(['groq', 'google', 'gemini', 'openai', 'anthropic', 'openrouter', 'mistral']),
  aiModel: z.string().min(1, 'AI_MODEL is required'),
  aiApiKey: z.string().min(1, 'Active AI provider API key is required'),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function getMissingServerEnv(): string[] {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  const provider = (process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : process.env.GEMINI_API_KEY ? 'google' : 'openai')).toLowerCase();

  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) missing.push('GROQ_API_KEY');
  } else if (provider === 'google' || provider === 'gemini') {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
      missing.push('GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY)');
    }
  } else if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  } else if (provider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  } else if (provider === 'openrouter') {
    if (!process.env.OPENROUTER_API_KEY) missing.push('OPENROUTER_API_KEY');
  } else if (provider === 'mistral') {
    if (!process.env.MISTRAL_API_KEY) missing.push('MISTRAL_API_KEY');
  }

  return missing;
}

export function getServerEnv(): ServerEnv {
  const provider = (
    process.env.AI_PROVIDER ||
    (process.env.GROQ_API_KEY ? 'groq' : process.env.GEMINI_API_KEY ? 'google' : 'openai')
  ).toLowerCase() as any;

  let activeApiKey = '';
  if (provider === 'groq') {
    activeApiKey = process.env.GROQ_API_KEY || '';
  } else if (provider === 'google' || provider === 'gemini') {
    activeApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
  } else if (provider === 'openai') {
    activeApiKey = process.env.OPENAI_API_KEY || '';
  } else if (provider === 'anthropic') {
    activeApiKey = process.env.ANTHROPIC_API_KEY || '';
  } else if (provider === 'openrouter') {
    activeApiKey = process.env.OPENROUTER_API_KEY || '';
  } else if (provider === 'mistral') {
    activeApiKey = process.env.MISTRAL_API_KEY || '';
  }

  const model =
    process.env.AI_MODEL ||
    (provider === 'groq'
      ? 'openai/gpt-oss-120b'
      : provider === 'google' || provider === 'gemini'
      ? 'gemini-flash-latest'
      : 'gpt-4o-mini');

  const raw = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qietlsnyhryfxmaephaw.supabase.co',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    aiProvider: provider,
    aiModel: model,
    aiApiKey: activeApiKey,
  };

  const parsed = ServerEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const missing = getMissingServerEnv();
    throw new Error(
      `Server environment configuration error: Missing or invalid variables [${missing.join(', ')}]. ` +
        JSON.stringify(parsed.error.issues)
    );
  }

  return parsed.data;
}
