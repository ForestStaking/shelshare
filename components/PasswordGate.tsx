'use client';

/**
 * PasswordGate — password prompt for protected share links.
 */

import { useState } from 'react';

interface PasswordGateProps {
  shortId: string;
  filename: string;
  sizeFormatted: string;
}

export default function PasswordGate({
  shortId,
  filename,
  sizeFormatted,
}: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleUnlock = async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/download/${shortId}?password=${encodeURIComponent(password)}`,
        { method: 'HEAD' }
      );
      if (res.ok) {
        setUnlocked(true);
      } else if (res.status === 403) {
        setError('Incorrect password');
      } else {
        setError('Something went wrong');
      }
    } catch {
      setError('Network error');
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) {
    return (
      <div className="text-center animate-fadeIn">
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-[6px] h-[6px] rounded-full bg-success shadow-[0_0_6px_#4ade80]" />
          <p className="text-success text-[14px] font-semibold">Access granted</p>
        </div>
        <a
          href={`/api/download/${shortId}?password=${encodeURIComponent(password)}`}
          className="inline-block bg-shelgreen text-[#050505] font-semibold text-[14px] px-6 py-[12px] rounded-[8px] hover:bg-shelgreen-dark active:scale-[0.97] transition-all duration-150"
        >
          Download {filename} ({sizeFormatted})
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-[320px] mx-auto">
      <div className="mb-5 text-center">
        <svg
          className="w-8 h-8 mx-auto text-txt-dim mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <p className="text-txt-primary text-[14px] font-medium">
          This file is password-protected
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          placeholder="Enter password"
          className="flex-1 bg-shl-card border border-[#1a1a1a] rounded-[6px] px-3 py-[10px] text-txt-primary text-[14px] placeholder:text-txt-dim focus:outline-none focus:border-shelgreen transition-all duration-150"
        />
        <button
          onClick={handleUnlock}
          disabled={checking || !password}
          className="bg-shelgreen text-[#050505] font-semibold text-[13px] px-4 py-[10px] rounded-[6px] hover:bg-shelgreen-dark transition-all duration-150 disabled:opacity-40"
        >
          {checking ? '...' : 'Unlock'}
        </button>
      </div>

      {error && (
        <p className="text-error text-[13px] mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
