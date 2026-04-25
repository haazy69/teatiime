import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST - Create a new request
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { activity, note, latitude, longitude } = body;

    if (!activity) {
      return NextResponse.json({ error: 'Activity required' }, { status: 400 });
    }

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Location required' }, { status: 400 });
    }

    // Create expiration time (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Use Supabase RPC function to insert with PostGIS location
    // This calls a database function that handles the geography type
    const { data, error } = await supabase.rpc('create_request', {
      p_activity: activity,
      p_note: note || null,
      p_lat: latitude,
      p_lng: longitude,
    });

    if (error) {
      console.error('Insert error:', error);
      
      // Fallback: Try direct insert with PostGIS POINT format
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('requests')
        .insert({
          creator_id: user.id,
          activity,
          note: note || null,
          status: 'open',
          expires_at: expiresAt.toISOString(),
          location: `POINT(${longitude} ${latitude})`,
        })
        .select()
        .single();

      if (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }

      return NextResponse.json({ data: fallbackData, success: true });
    }

    return NextResponse.json({ data, success: true });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}