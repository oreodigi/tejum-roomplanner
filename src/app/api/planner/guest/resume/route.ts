import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || token.length !== 6) {
      return NextResponse.json({ error: 'Invalid or missing token.' }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Planner persistence is not configured.' }, { status: 503 });
    }

    const supabase = await createServiceClient();

    // The token is stored inside metadata->>'share_token'
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, metadata, hardware_estimate_low, hardware_estimate_high')
      .eq('metadata->>share_token', token.toUpperCase())
      .single();

    if (error || !project) {
      return NextResponse.json({ error: 'Plan not found or token expired.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        metadata: project.metadata,
      }
    });

  } catch (error) {
    console.error('Planner resume error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
