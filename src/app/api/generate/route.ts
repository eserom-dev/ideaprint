import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { generateCompleteBlueprint } from '@/lib/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, projectName, clarifications, constraints, userId } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'The Idea Statement is required.' },
        { status: 400 }
      );
    }

    const cleanIdea = prompt.trim();
    const cleanName = (projectName && typeof projectName === 'string' && projectName.trim()) || 'Engineered Website';

    // 1. Invoke Real AI Gateway (Zod Validated, with 1 automatic repair attempt)
    const blueprint = await generateCompleteBlueprint({
      idea: cleanIdea,
      projectName: cleanName,
      clarifications: Array.isArray(clarifications) ? clarifications : [],
      constraints: {
        stack: constraints?.stack || ['Next.js 14 (App Router)', 'TypeScript', 'Tailwind CSS', 'Supabase PostgreSQL'],
        developerSkills: constraints?.skills || 'Full-Stack Developer (TypeScript / PostgreSQL)',
        budget: constraints?.budget || '$0 Free Tier',
        timeline: constraints?.timeline || '4-6 Weeks',
      },
    });

    return NextResponse.json({
      success: true,
      blueprint: {
        ...blueprint,
        type: 'website',
        stage: 'plan',
      },
    });
  } catch (err: any) {
    console.error('Blueprint AI generation error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          'AI blueprint generation failed. Check your API provider key or retry.',
      },
      { status: 500 }
    );
  }
}
