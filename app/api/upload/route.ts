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
import { inspectFile, checkRateLimit } from '@/lib/safety';
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
    const file           = formData.get('file')           as File   | null;
    const passwordRaw    = formData.get('password')       as string | null;
    const expiryDaysRaw  = formData.get('expiryDays')     as string | null;
    const isSealedRaw    = formData.get('isSealed')       as string | null;
    const condTypeRaw    = formData.get('conditionType')  as string | null;
    const priceOctasRaw  = formData.get('priceOctas')     as string | null;
    const unlockTsRaw    = formData.get('unlockTimestamp') as string | null;

    const isSealed       = isSealedRaw === 'true';
    const conditionType  = condTypeRaw  ? parseInt(condTypeRaw,  10) : null;
    const priceOctas     = priceOctasRaw  ? BigInt(priceOctasRaw)  : null;
    const unlockTimestamp = unlockTsRaw ? BigInt(unlockTsRaw)   : null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file into buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const sizeBytes = buffer.length;
    const mimeType = file.type || getMimeType(filename);

    // -----------------------------------------------------------------------
    // Safety checks — run before anything touches Shelby
    // Sealed files are inspected as-is (extension + size); their plaintext
    // was validated client-side before encryption.
    // -----------------------------------------------------------------------
    const safetyResult = inspectFile(buffer, filename);
    if (!safetyResult.safe) {
      console.warn(`[upload] Safety block for ${auth.walletAddress}: ${safetyResult.reason}`);
      return NextResponse.json({ error: safetyResult.reason }, { status: 422 });
    }

    // Rate limiting — check recent upload count & bytes for this wallet
    const supabase = createServerClient();
    const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentUploads } = await supabase
      .from('files')
      .select('size_bytes')
      .eq('owner_user_id', user.id)
      .gte('created_at', windowStart)
      .is('deleted_at', null);

    const uploadCount = recentUploads?.length ?? 0;
    const totalBytes  = recentUploads?.reduce((s, f) => s + (f.size_bytes || 0), 0) ?? 0;
    const rateCheck   = checkRateLimit(uploadCount, totalBytes, sizeBytes);
    if (!rateCheck.ok) {
      return NextResponse.json({ error: rateCheck.reason }, { status: 429 });
    }

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
    const { error: insertError } = await supabase.from('files').insert({
      short_id:          shortId,
      owner_user_id:     user.id,
      original_filename: filename,
      size_bytes:        sizeBytes,
      mime_type:         mimeType,
      shelby_address:    shelbyAddress,
      shelby_proof:      shelbyProof,
      password_hash:     passwordHash,
      expires_at:        expiresAt,
      file_sha256:       safetyResult.sha256,
      // Sealed fields (null for normal uploads)
      is_sealed:         isSealed,
      condition_type:    isSealed ? conditionType            : null,
      price_octas:       isSealed ? priceOctas?.toString()   : null,
      unlock_timestamp:  isSealed ? unlockTimestamp?.toString() : null,
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
      shareUrl:      buildShareUrl(shortId),
      shelbyAddress, // needed by client to call create_seal
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
