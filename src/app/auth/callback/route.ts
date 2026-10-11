import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.warn('OAuth code exchange warning:', error.message);
    } catch (err) {
      console.error('Error exchanging OAuth code:', err);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
