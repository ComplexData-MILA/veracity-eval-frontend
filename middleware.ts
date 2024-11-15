import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  // Skip auth check for these paths
  if (
    request.nextUrl.pathname.startsWith('/api/auth/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // For protected routes, use the middleware wrapper
  const authMiddleware = withMiddlewareAuthRequired();
  return authMiddleware(request, event);
}

export const config = {
  matcher: [
    '/((?!api/auth/|_next/static|_next/image|favicon.ico).*)',
  ],
};