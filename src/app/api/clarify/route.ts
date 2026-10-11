import { NextRequest, NextResponse } from 'next/server';
import { generateClarifyingQuestions } from '@/lib/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idea, projectName } = body;

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return NextResponse.json(
        { error: 'An idea statement is required to generate clarifying questions.' },
        { status: 400 }
      );
    }

    const questions = await generateClarifyingQuestions(idea.trim());

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (err: any) {
    console.error('Clarify generation error:', err);
    return NextResponse.json(
      {
        error:
          err.message ||
          'Failed to generate clarifying questions with the active AI provider.',
      },
      { status: 500 }
    );
  }
}
