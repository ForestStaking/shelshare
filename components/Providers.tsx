'use client';

/**
 * Providers — legacy wrapper, no longer needed.
 * AppShell now handles all provider setup directly.
 * Kept as a passthrough to avoid any accidental import errors.
 */

import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
