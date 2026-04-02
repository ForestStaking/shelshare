'use client';

/**
 * Petra Wallet Helpers
 *
 * Thin wrapper around @aptos-labs/wallet-adapter-react (AIP-62 standard).
 * Adds cookie management so Next.js middleware can protect /dashboard server-side.
 *
 * Usage:
 *   - Wrap app with <AptosWalletAdapterProvider> (done in AppShell)
 *   - Call usePetra() anywhere inside it
 */

import { useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

const COOKIE_NAME = 'petra-wallet';

function setWalletCookie(address: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${address}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearWalletCookie() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

/** Truncate an Aptos address for display: 0x1234…abcd */
export function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * usePetra — wraps useWallet() and syncs the connected address to a cookie
 * so Next.js middleware can protect /dashboard without a client-side check.
 */
export function usePetra() {
  const wallet = useWallet();

  const address = wallet.account?.address?.toString() ?? null;

  // Sync address → cookie whenever connection state changes
  useEffect(() => {
    if (address) {
      setWalletCookie(address);
    } else {
      clearWalletCookie();
    }
  }, [address]);

  const connect = () => {
    wallet.connect('Petra');
  };

  const disconnect = () => {
    wallet.disconnect();
  };

  return {
    address,
    connected: wallet.connected,
    connecting: wallet.isLoading,
    connect,
    disconnect,
  };
}
