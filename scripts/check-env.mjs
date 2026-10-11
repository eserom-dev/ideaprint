import fs from 'fs';
import path from 'path';

// 1. Manually parse .env.local if not loaded
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

async function checkEnv() {
  console.log('\n=== IDEAPRINT Server Environment Check ===\n');
  let hasErrors = false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Verify Supabase
  if (!supabaseUrl || !supabaseAnon) {
    console.error('✗ Supabase: FAIL (Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
    hasErrors = true;
  } else {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: {
          apikey: supabaseAnon,
          Authorization: `Bearer ${supabaseAnon}`,
        },
      });
      if (res.ok && res.status === 200) {
        console.log('✓ Supabase Connection: PASS');
      } else {
        console.error(`✗ Supabase Connection: FAIL (HTTP Status ${res.status})`);
        hasErrors = true;
      }
    } catch (err) {
      console.error('✗ Supabase Connection: FAIL (Network connection error)');
      hasErrors = true;
    }
  }

  // Determine AI Provider
  const provider = (
    process.env.AI_PROVIDER ||
    (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
      ? 'google'
      : process.env.GROQ_API_KEY
      ? 'groq'
      : 'openai')
  ).toLowerCase();
  const model = process.env.AI_MODEL || (provider === 'groq' ? 'openai/gpt-oss-120b' : provider === 'google' ? 'gemini-flash-latest' : 'gpt-4o-mini');

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;

  if (provider === 'groq') {
    if (!groqKey) {
      console.error('✗ AI Provider (Groq): FAIL (GROQ_API_KEY is missing)');
      hasErrors = true;
    } else {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
        });
        if (res.ok) {
          console.log(`✓ AI Provider (Groq / ${model}): PASS`);
        } else {
          console.error(`✗ AI Provider (Groq): FAIL (HTTP Status ${res.status})`);
          hasErrors = true;
        }
      } catch (err) {
        console.error('✗ AI Provider (Groq): FAIL (Network request error)');
        hasErrors = true;
      }
    }
  } else if (provider === 'google' || provider === 'gemini') {
    if (!geminiKey) {
      console.error('✗ AI Provider (Google): FAIL (GOOGLE_GENERATIVE_AI_API_KEY is missing)');
      hasErrors = true;
    } else {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'ping' }] }],
              generationConfig: { maxOutputTokens: 100 },
            }),
          }
        );
        if (res.ok) {
          console.log(`✓ AI Provider (Google / ${model}): PASS`);
        } else {
          console.error(`✗ AI Provider (Google): FAIL (HTTP Status ${res.status})`);
          hasErrors = true;
        }
      } catch (err) {
        console.error('✗ AI Provider (Google): FAIL (Network request error)');
        hasErrors = true;
      }
    }
  } else if (provider === 'openai') {
    if (!openaiKey) {
      console.error('✗ AI Provider (OpenAI): FAIL (OPENAI_API_KEY is missing)');
      hasErrors = true;
    } else {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
        });
        if (res.ok) {
          console.log(`✓ AI Provider (OpenAI / ${model}): PASS`);
        } else {
          console.error(`✗ AI Provider (OpenAI): FAIL (HTTP Status ${res.status})`);
          hasErrors = true;
        }
      } catch (err) {
        console.error('✗ AI Provider (OpenAI): FAIL (Network request error)');
        hasErrors = true;
      }
    }
  } else {
    console.log(`✓ AI Provider configured: ${provider}`);
  }

  console.log('\n==========================================\n');
  if (hasErrors) {
    console.error('RESULT: FAIL — Check your environment variables.');
    process.exit(1);
  } else {
    console.log('RESULT: PASS — All required environment connections verified.');
    process.exit(0);
  }
}

checkEnv().catch((err) => {
  console.error('Unexpected check-env error:', err);
  process.exit(1);
});
