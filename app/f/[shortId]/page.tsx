/**
 * Public share page — /f/[shortId]
 * Server component: resolves metadata from Supabase at request time.
 * File bytes stream from Shelby Protocol via /api/download when user clicks download.
 */

import { createServerClient } from '@/lib/supabase';
import { formatBytes } from '@/lib/utils';
import PasswordGate from '@/components/PasswordGate';
import ReportButton from '@/components/ReportButton';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

// SealedUnlock uses wallet adapter hooks — must be client-side only
const SealedUnlock = dynamic(() => import('@/components/SealedUnlock'), { ssr: false });

interface SharePageProps {
  params: { shortId: string };
}

export default async function SharePage({ params }: SharePageProps) {
  const { shortId } = params;
  const supabase = createServerClient();

  const { data: file } = await supabase
    .from('files')
    .select('*')
    .eq('short_id', shortId)
    .is('deleted_at', null)
    .single();

  if (!file) notFound();

  const isExpired   = file.expires_at && new Date(file.expires_at) < new Date();
  const isProtected = !!file.password_hash;
  const isSealed    = !!file.is_sealed;
  const sizeFormatted = formatBytes(file.size_bytes);

  return (
    <div className="mx-auto max-w-[560px] px-8 py-[80px]">
      <div className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-8">
        {isExpired ? (
          <div className="text-center py-4">
            <svg
              className="w-10 h-10 mx-auto text-txt-dim mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-txt-primary font-semibold text-[18px] mb-2">
              Link Expired
            </h1>
            <p className="text-txt-muted text-[14px]">
              This share link is no longer available.
            </p>
          </div>
        ) : (
          <>
            {/* File Info */}
            <div className="mb-8 text-center">
              <span className="inline-block bg-shl-surface border border-[#1a1a1a] text-txt-dim text-[11px] font-semibold uppercase tracking-[0.5px] px-3 py-[4px] rounded-full mb-4">
                {isSealed ? 'Sealed via ShelShare' : 'Shared via ShelShare'}
              </span>
              <h1 className="text-txt-primary font-semibold text-[18px] mb-1 break-all">
                {file.original_filename}
              </h1>
              <p className="text-txt-muted text-[14px]">{sizeFormatted}</p>
              {file.expires_at && (
                <p className="text-amber-400/70 text-[13px] mt-2 font-mono">
                  Expires {new Date(file.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Sealed / Password / Direct download */}
            {isSealed ? (
              <SealedUnlock
                shortId={shortId}
                filename={file.original_filename}
                mimeType={file.mime_type}
                sizeFormatted={sizeFormatted}
                conditionType={file.condition_type ?? 1}
                priceOctas={String(file.price_octas ?? '0')}
                unlockTimestamp={String(file.unlock_timestamp ?? '0')}
              />
            ) : isProtected ? (
              <PasswordGate
                shortId={shortId}
                filename={file.original_filename}
                sizeFormatted={sizeFormatted}
              />
            ) : (
              <div className="text-center">
                <a
                  href={`/api/download/${shortId}`}
                  className="inline-block bg-shelgreen text-[#050505] font-semibold text-[15px] px-6 py-[14px] rounded-[8px] hover:bg-shelgreen-dark active:scale-[0.97] transition-all duration-150"
                >
                  Download ({sizeFormatted})
                </a>
              </div>
            )}

            {/* Shelby proof */}
            <div className="mt-8 pt-5 border-t border-[#1a1a1a]">
              <p className="text-txt-dim text-[11px] uppercase tracking-[0.4px] font-semibold mb-1">
                Shelby Address
              </p>
              <p className="text-txt-dim font-mono text-[12px] break-all">
                {file.shelby_address.replace(/ /g, '_')}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <p className="text-txt-dim text-[12px]">
          Stored on Shelby Protocol &middot; Powered by Forest
        </p>
        <span className="text-[#1a1a1a]">|</span>
        <ReportButton shortId={shortId} />
      </div>
    </div>
  );
}
