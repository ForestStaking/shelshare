'use client';

/**
 * AppShell — client-side layout wrapper.
 *
 * Wraps the app with AptosWalletAdapterProvider (AIP-62 standard).
 * NavBar and all other components must render inside this provider
 * to have access to Petra wallet context.
 */

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import TestnetBanner from '@/components/TestnetBanner';
import NavBar from '@/components/NavBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      optInWallets={['Petra']}
      autoConnect={true}
      disableTelemetry={true}
      onError={(error) => console.error('[Wallet]', error)}
    >
      <TestnetBanner />
      <NavBar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#1a1a1a] py-8 px-8">
        <div className="mx-auto max-w-[1100px] flex items-center justify-between">
          <p className="text-txt-dim text-[13px]">
            Powered by{' '}
            <a
              href="https://forestinfra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-txt-muted hover:text-shelgreen transition-all duration-150"
            >
              Forest
            </a>
          </p>
          <div className="flex items-center gap-5">
            <a
              href="/docs"
              className="text-txt-dim hover:text-txt-muted text-[12px] transition-all duration-150"
            >
              Docs
            </a>
            <p className="text-txt-dim text-[12px] font-mono">
              Shelby Protocol Testnet
            </p>
          </div>
        </div>
      </footer>
    </AptosWalletAdapterProvider>
  );
}
