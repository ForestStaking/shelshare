'use client';

/**
 * NavBar — sticky top navigation.
 * Uses usePetra() which wraps @aptos-labs/wallet-adapter-react.
 *
 * On public share pages (/f/*) the wallet connect button is hidden —
 * recipients don't need to connect just to download a file. Sealed files
 * have their own dedicated connect prompt inline on the page.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePetra, truncateAddress } from '@/lib/petra';

export default function NavBar() {
  const { connected, connecting, address, connect, disconnect } = usePetra();
  const pathname = usePathname();

  // On public share pages, suppress the wallet-connect prompt so recipients
  // aren't confused — sealed files show their own connect button inline.
  const isSharePage = pathname?.startsWith('/f/');

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#1a1a1a] bg-[#050505]/85 backdrop-blur-[12px]">
      <div className="mx-auto max-w-[1100px] flex items-center justify-between px-8 py-4">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-shelgreen font-semibold text-[15px]">S/</span>
          <span className="text-txt-primary font-semibold text-[15px] group-hover:text-shelgreen transition-all duration-150">
            ShelShare
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-5">
          <Link
            href="/docs"
            className="text-txt-muted hover:text-txt-primary text-[14px] font-medium transition-all duration-150"
          >
            Docs
          </Link>
          {connected && (
            <>
              <Link
                href="/upload"
                className="text-txt-muted hover:text-txt-primary text-[14px] font-medium transition-all duration-150"
              >
                Upload
              </Link>
              <Link
                href="/dashboard"
                className="text-txt-muted hover:text-txt-primary text-[14px] font-medium transition-all duration-150"
              >
                Dashboard
              </Link>
            </>
          )}

          {connected ? (
            <div className="flex items-center gap-3">
              <span className="bg-shl-surface border border-[#1a1a1a] text-txt-muted font-mono text-[12px] px-3 py-[6px] rounded-full">
                {address ? truncateAddress(address) : ''}
              </span>
              <button
                onClick={disconnect}
                className="text-txt-dim hover:text-txt-muted text-[13px] font-medium transition-all duration-150"
              >
                Disconnect
              </button>
            </div>
          ) : !isSharePage ? (
            <button
              onClick={connect}
              disabled={connecting}
              className="bg-shelgreen text-[#050505] font-semibold text-[14px] px-4 py-[10px] rounded-[6px] hover:bg-shelgreen-dark hover:shadow-[0_0_0_4px_rgba(139,197,63,0.3)] transition-all duration-150 disabled:opacity-60"
            >
              {connecting ? 'Connecting…' : 'Connect Petra'}
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
