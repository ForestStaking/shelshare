'use client';

/**
 * Upload page — /upload
 * Requires Petra wallet connection. Shows connect prompt if not connected.
 */

import UploadZone from '@/components/UploadZone';
import { usePetra } from '@/lib/petra';

export default function UploadPage() {
  const { connected, connecting, connect } = usePetra();

  if (!connected) {
    return (
      <div className="mx-auto max-w-[480px] px-8 py-[120px] text-center">
        <div className="mb-6">
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <h1 className="text-txt-primary font-bold text-[24px] tracking-[-0.5px] mb-2">
            Connect to upload
          </h1>
          <p className="text-txt-muted text-[15px]">
            Connect your Petra wallet to upload files to Shelby Protocol.
          </p>
        </div>

        <button
          onClick={connect}
          disabled={connecting}
          className="bg-shelgreen text-[#050505] font-semibold text-[15px] px-6 py-[14px] rounded-[8px] hover:bg-shelgreen-dark hover:shadow-[0_0_0_4px_rgba(139,197,63,0.3)] transition-all duration-150 disabled:opacity-60"
        >
          {connecting ? 'Connecting…' : 'Connect Petra'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(139, 197, 63, 0.06) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-[1100px] px-8 pt-[80px] pb-[80px]">
        <div className="text-center mb-10">
          <h1 className="text-[36px] font-bold text-txt-primary tracking-[-1px] mb-2">
            Upload a file
          </h1>
          <p className="text-txt-muted text-[15px]">
            Stored permanently on Shelby Protocol. Share with anyone.
          </p>
        </div>
        <UploadZone />
      </div>
    </div>
  );
}
