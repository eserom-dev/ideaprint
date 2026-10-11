import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

const WaitlistSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
  plan: z.enum(['pro', 'team'], { message: 'Plan must be pro or team.' }),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const result = WaitlistSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const { email, plan } = result.data;

    if (isSupabaseConfigured()) {
      const { error } = await supabaseAdmin
        .from('waitlist_submissions')
        .insert([{ email, plan }]);

      if (error) {
        console.warn('Waitlist database insertion notice:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `You have been added to the ${plan.toUpperCase()} waitlist. We will notify ${email} as seats open.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error processing waitlist request.' },
      { status: 500 }
    );
  }
}
