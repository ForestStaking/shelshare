'use client';

/**
 * Testnet Banner — persistent warning strip.
 * Matches ShelKit/ShelPin style: subtle, small, monospace.
 */
export default function TestnetBanner() {
  return (
    <div className="w-full bg-[#0d0d0d] border-b border-[#1a1a1a] px-4 py-[6px] text-center">
      <p className="text-txt-dim font-mono text-[11px] tracking-[0.5px] uppercase">
        Shelby Testnet — files may be cleared periodically
      </p>
    </div>
  );
}
