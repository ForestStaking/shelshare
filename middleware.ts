/**
 * Next.js Middleware — Route Protection
 *
 * Protects /dashboard routes by checking for the petra-wallet cookie.
 * Set client-side by PetraWalletProvider on connect.
 * Unauthenticated users are redirected to /login.
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/upload')) {
    const walletAddress = request.cookies.get('petra-wallet')?.value;

    if (!walletAddress) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*'],
};
