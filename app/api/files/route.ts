/**
 * GET /api/files
 *
 * Returns the authenticated user's files from Supabase.
 * Auth: reads X-Wallet-Address header set by the Petra wallet client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyWalletAddress, ensureUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyWalletAddress(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await ensureUser(auth.walletAddress);
    const supabase = createServerClient();

    const { data: files, error } = await supabase
      .from('files')
      .select(
        'id, short_id, original_filename, size_bytes, mime_type, shelby_address, expires_at, download_count, created_at'
      )
      .eq('owner_user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[files] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    return NextResponse.json({
      files: files || [],
      storageUsedBytes: user.storage_used_bytes || 0,
    });
  } catch (err) {
    console.error('[files] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
