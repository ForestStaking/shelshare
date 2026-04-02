/**
 * Layout for public share pages (/f/[shortId]).
 * Minimal header — no wallet connection required to download a file.
 */

import Link from 'next/link';

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-shl-bg flex flex-col">
      {/* Minimal header — just the logo */}
      <header className="w-full border-b border-[#1a1a1a] bg-[#050505]/85 backdrop-blur-[12px]">
        <div className="mx-auto max-w-[1100px] flex items-center px-8 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-shelgreen font-semibold text-[15px]">S/</span>
            <span className="text-txt-primary font-semibold text-[15px] group-hover:text-shelgreen transition-all duration-150">
              ShelShare
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-6 text-center text-txt-dim text-[12px] border-t border-[#1a1a1a]">
        Powered by{' '}
        <a
          href="https://shelby.network"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-txt-muted transition-colors duration-150"
        >
          Shelby Protocol
        </a>{' '}
        &middot; Built by{' '}
        <a
          href="https://forestinfra.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-txt-muted transition-colors duration-150"
        >
          Forest Infra
        </a>
      </footer>
    </div>
  );
}
