import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const requestSchema = z.object({
  projectId: z.string().uuid(),
  phone: z.string().min(10).max(20).optional(),
});

export async function POST(request: Request) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Planner persistence is not configured.' }, { status: 503 });
    }

    const body = requestSchema.parse(await request.json());
    const supabase = await createServiceClient();

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, lead_id')
      .eq('id', body.projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Generate a unique 6-character alphanumeric share token
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Store the share token in the project metadata
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        metadata: {
          share_token: token,
          shared_at: new Date().toISOString(),
        }
      })
      .eq('id', body.projectId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to generate share link.' }, { status: 500 });
    }

    // In a real application, if phone was provided, you might trigger an SMS/WhatsApp here.

    return NextResponse.json({ 
      success: true, 
      token,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/plan/${token}`
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input.', details: (error as z.ZodError<any>).errors }, { status: 400 });
    }
    console.error('Planner share error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
