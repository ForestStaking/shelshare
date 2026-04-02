/**
 * POST /api/upload
 *
 * Receives a file as multipart form data, uploads it to Shelby Protocol
 * via the storage adapter, then writes metadata to Supabase.
 *
 * Architecture note: Shelby Protocol stores the actual file bytes.
 * Supabase stores metadata (short_id, shelbyAddress, etc.) to power
 * shareable links, password protection, expiry, and download counts.
 *
 * Auth: reads X-Wallet-Address header set by the Petra wallet client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdapter } from '@/lib/storage';
import { createServerClient } from '@/lib/supabase';
import { verifyWalletAddress, ensureUser } from '@/lib/auth';
import { generateShortId, buildShareUrl, getMimeType } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Authenticate via Petra wallet address
    const auth = verifyWalletAddress(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in Supabase
    const user = await ensureUser(auth.walletAddress);

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const passwordRaw = formData.get('password') as string | null;
    const expiryDaysRaw = formData.get('expiryDays') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file into buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const sizeBytes = buffer.length;
    const mimeType = file.type || getMimeType(filename);

    // Upload to Shelby Protocol via storage adapter
    const adapter = getStorageAdapter();
    const { shelbyAddress, shelbyProof } = await adapter.upload(buffer, filename);

    // Generate short_id for shareable link
    const shortId = generateShortId();

    // Hash password if provided
    let passwordHash: string | null = null;
    if (passwordRaw && passwordRaw.trim()) {
      passwordHash = await bcrypt.hash(passwordRaw.trim(), 10);
    }

    // Calculate expiry date if provided
    let expiresAt: string | null = null;
    if (expiryDaysRaw) {
      const days = parseInt(expiryDaysRaw, 10);
      if (days > 0) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        expiresAt = expiry.toISOString();
      }
    }

    // Write metadata to Supabase
    // NOTE: File bytes are on Shelby. This record is the metadata index only.
    const supabase = createServerClient();
    const { error: insertError } = await supabase.from('files').insert({
      short_id: shortId,
      owner_user_id: user.id,
      original_filename: filename,
      size_bytes: sizeBytes,
      mime_type: mimeType,
      shelby_address: shelbyAddress,
      shelby_proof: shelbyProof,
      password_hash: passwordHash,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('[upload] Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      );
    }

    // Update user's storage used (informational only, no limits on testnet)
    supabase
      .from('users')
      .update({ storage_used_bytes: (user.storage_used_bytes || 0) + sizeBytes })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) console.warn('[upload] Failed to update storage_used_bytes:', error);
      });

    return NextResponse.json({
      shortId,
      shareUrl: buildShareUrl(shortId),
      filename,
      size: sizeBytes,
    });
  } catch (err) {
    console.error('[upload] Error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
