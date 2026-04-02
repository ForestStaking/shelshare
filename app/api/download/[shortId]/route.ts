/**
 * GET /api/download/[shortId]
 *
 * Resolves a short_id to a shelbyAddress in Supabase, downloads the file
 * from Shelby Protocol, and streams it to the client.
 *
 * Checks:
 * - File exists and is not soft-deleted
 * - File has not expired (returns 410 Gone if expired)
 * - Password is correct if file is password-protected
 *
 * Architecture note: The short_id → shelbyAddress resolution happens in
 * Supabase (metadata layer). The actual file bytes come from Shelby Protocol.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdapter } from '@/lib/storage';
import { createServerClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params;
    const supabase = createServerClient();

    // Resolve short_id → file record from Supabase metadata index
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('short_id', shortId)
      .is('deleted_at', null)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check expiry
    if (file.expires_at && new Date(file.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 }
      );
    }

    // Check password if protected
    if (file.password_hash) {
      const passwordParam = request.nextUrl.searchParams.get('password');
      if (!passwordParam) {
        return NextResponse.json(
          { error: 'Password required' },
          { status: 403 }
        );
      }

      const valid = await bcrypt.compare(passwordParam, file.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: 'Incorrect password' },
          { status: 403 }
        );
      }
    }

    // Download file bytes from Shelby Protocol via storage adapter
    const adapter = getStorageAdapter();
    const buffer = await adapter.download(file.shelby_address);

    // Increment download count in Supabase (non-blocking)
    supabase
      .from('files')
      .update({ download_count: (file.download_count || 0) + 1 })
      .eq('id', file.id)
      .then(() => {});

    // Stream file to client
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': file.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.original_filename)}"`,
        'Content-Length': file.size_bytes.toString(),
      },
    });
  } catch (err) {
    console.error('[download] Error:', err);

    // Handle mock mode gracefully
    if (err instanceof Error && err.message.includes('mock mode')) {
      return NextResponse.json(
        {
          error:
            'Downloads are not available in mock mode. Set SHELBY_MOCK=false to use real Shelby storage.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
