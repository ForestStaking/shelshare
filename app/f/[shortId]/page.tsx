/**
 * Public share page — /f/[shortId]
 * Server component: resolves metadata from Supabase at request time.
 * File bytes stream from Shelby Protocol via /api/download when user clicks download.
 */

import { createServerClient } from '@/lib/supabase';
import { formatBytes } from '@/lib/utils';
import PasswordGate from '@/components/PasswordGate';
import { notFound } from 'next/navigation';

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

  const isExpired = file.expires_at && new Date(file.expires_at) < new Date();
  const isProtected = !!file.password_hash;
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
                Shared via ShelShare
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

            {/* Password Gate or Direct Download */}
            {isProtected ? (
              <PasswordGate
                shortId={shortId}
                filename={file.original_filename}
                sizeFormatted={sizeFormatted}
              />
            ) : (
              <div className="text-center">
                <a
                  href={`/api/download/${shortId}`}
                  className="inline-block bg-shelgreen text-[#050505] font-semibold text-[15px] px-6 py-[14px] rounded-[8px] hover:bg-shelgreen-dark hover:-translate-y-[1px] hover:shadow-[0_0_0_4px_rgba(139,197,63,0.3)] transition-all duration-150"
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

      <p className="mt-5 text-center text-txt-dim text-[12px]">
        Stored on Shelby Protocol &middot; Powered by Forest
      </p>
    </div>
  );
}
