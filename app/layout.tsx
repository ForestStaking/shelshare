import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';

// AppShell wraps AptosWalletAdapterProvider which uses browser APIs —
// load client-side only to avoid SSR errors.
const AppShell = dynamic(() => import('@/components/AppShell'), { ssr: false });

export const metadata: Metadata = {
  title: 'ShelShare — Decentralised File Sharing',
  description:
    'Store it. Share it. No one can take it down. Powered by Shelby Protocol and Forest Infra nodes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
