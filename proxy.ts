import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route guard for /admin/* paths.
 * The session cookie is HTTP-only so we can only check its presence here,
 * not verify it. Full verification happens in the admin layout via Cognito.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the login page through
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for session cookie presence
  const token = request.cookies.get('safiba_admin_token');
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
