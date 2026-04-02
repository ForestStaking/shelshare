/**
 * POST /api/report
 *
 * Abuse / DMCA report submission.
 * Records the report in Supabase for manual review.
 * Responds quickly so reporters aren't left hanging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shortId, reportType, description, reporterEmail } = body;

    if (!shortId || !reportType || !description) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify the file exists
    const { data: file } = await supabase
      .from('files')
      .select('id, short_id, shelby_address')
      .eq('short_id', shortId)
      .single();

    if (!file) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    // Store report (table created below)
    await supabase.from('reports').insert({
      file_id:       file.id,
      short_id:      shortId,
      report_type:   reportType,   // 'dmca' | 'malware' | 'illegal' | 'spam'
      description:   description.slice(0, 2000),
      reporter_email: reporterEmail ?? null,
      shelby_address: file.shelby_address,
      status:        'pending',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[report]', err);
    return NextResponse.json({ error: 'Failed to submit report.' }, { status: 500 });
  }
}
