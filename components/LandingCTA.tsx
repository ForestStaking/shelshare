'use client';

/**
 * LandingCTA — hero call-to-action button.
 * If connected: links to /upload.
 * If not: triggers Petra connect then redirects.
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePetra } from '@/lib/petra';

export default function LandingCTA() {
  const { connected, connecting, connect } = usePetra();
  const router = useRouter();
  const wasConnected = useRef(connected);

  useEffect(() => {
    // Only redirect if user just connected on this page (not already connected on load)
    if (connected && !wasConnected.current) {
      router.push('/upload');
    }
    wasConnected.current = connected;
  }, [connected, router]);

  if (connected) {
    return (
      <Link
        href="/upload"
        className="inline-flex items-center gap-2 bg-shelgreen text-[#050505] font-semibold text-[16px] px-8 py-[16px] rounded-[8px] hover:bg-shelgreen-dark hover:-translate-y-[1px] hover:shadow-[0_0_0_4px_rgba(139,197,63,0.3)] transition-all duration-150"
      >
        Start Sharing
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={connect}
        disabled={connecting}
        className="inline-flex items-center gap-2 bg-shelgreen text-[#050505] font-semibold text-[16px] px-8 py-[16px] rounded-[8px] hover:bg-shelgreen-dark hover:-translate-y-[1px] hover:shadow-[0_0_0_4px_rgba(139,197,63,0.3)] transition-all duration-150 disabled:opacity-60"
      >
        {connecting ? 'Connecting…' : 'Connect Petra to Start'}
        {!connecting && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        )}
      </button>
      <p className="text-txt-dim text-[12px]">
        Aptos wallet · No email required
      </p>
    </div>
  );
}
