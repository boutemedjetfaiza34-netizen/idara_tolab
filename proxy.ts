import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('boutimjit_admin_session');

  // Allow if valid admin session cookie exists
  if (sessionCookie && sessionCookie.value.startsWith('admin_authenticated_')) {
    return NextResponse.next({ request });
  }

  // No valid session → redirect to login
  const loginUrl = new URL('/secure-admin-login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
