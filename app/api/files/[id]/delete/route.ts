/**
 * POST /api/files/[id]/delete
 *
 * Soft-deletes a file record in Supabase and attempts to unpin from Shelby.
 *
 * NOTE: Unpin is not yet supported by the Shelby SDK. The adapter.unpin()
 * call is a no-op on testnet. Actual blob removal will be implemented
 * once the SDK adds support. This is tracked as a TODO.
 *
 * Auth: reads X-Wallet-Address header set by the Petra wallet client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdapter } from '@/lib/storage';
import { createServerClient } from '@/lib/supabase';
import { verifyWalletAddress, ensureUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate via Petra wallet address
    const auth = verifyWalletAddress(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await ensureUser(auth.walletAddress);
    const { id: fileId } = params;
    const supabase = createServerClient();

    // Verify the file belongs to this user
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('owner_user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Soft delete in Supabase
    const { error: updateError } = await supabase
      .from('files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', fileId);

    if (updateError) {
      console.error('[delete] Supabase update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

    // Attempt to unpin from Shelby Protocol
    // TODO: This is a no-op until the SDK supports unpin/delete
    const adapter = getStorageAdapter();
    await adapter.unpin(file.shelby_address);

    // Decrement storage used (best effort)
    supabase
      .from('users')
      .update({
        storage_used_bytes: Math.max(0, (user.storage_used_bytes || 0) - file.size_bytes),
      })
      .eq('id', user.id)
      .then(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[delete] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
