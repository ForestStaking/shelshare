'use client';

/**
 * Login page — Petra wallet connect.
 * Redirects to /dashboard on successful connection.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePetra } from '@/lib/petra';

export default function LoginPage() {
  const { connected, connecting, connect } = usePetra();
  const router = useRouter();

  // Redirect to dashboard once connected
  useEffect(() => {
    if (connected) {
      router.push('/dashboard');
    }
  }, [connected, router]);

  return (
    <div className="mx-auto max-w-[420px] px-8 py-[100px]">
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-txt-primary tracking-[-0.8px] mb-2">
          Connect to <span className="text-shelgreen">ShelShare</span>
        </h1>
        <p className="text-txt-muted text-[15px]">
          Use your Petra wallet to upload files and manage your dashboard.
        </p>
      </div>

      <div className="bg-shl-card border border-[#1a1a1a] rounded-[12px] p-8">
        {/* Petra logo mark */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-[10px] bg-[#F5821F] flex items-center justify-center">
            <span className="text-white font-bold text-[18px]">P</span>
          </div>
          <div>
            <p className="text-txt-primary font-semibold text-[15px]">Petra Wallet</p>
            <p className="text-txt-dim text-[12px]">Aptos native wallet</p>
          </div>
        </div>

        <button
          onClick={connect}
          disabled={connecting}
          className="w-full bg-shelgreen text-[#050505] font-semibold text-[15px] px-6 py-[14px] rounded-[8px] hover:bg-shelgreen-dark hover:-translate-y-[1px] hover:shadow-[0_0_0_4px_rgba(139,197,63,0.3)] transition-all duration-150 disabled:opacity-60"
        >
          {connecting ? 'Connecting…' : 'Connect Petra'}
        </button>
      </div>

      <p className="mt-6 text-center text-txt-dim text-[13px] leading-relaxed">
        Only your wallet address is stored — no email, no personal data.
      </p>
    </div>
  );
}
