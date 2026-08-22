import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const sessionCookie = request.cookies.get('boutimjit_admin_session');

  // If valid admin session cookie exists, allow through
  if (sessionCookie && sessionCookie.value.startsWith('admin_authenticated_')) {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isAdminRoute && (!url || !anonKey)) {
    const loginUrl = new URL('/secure-admin-login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      url,
      anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (isAdminRoute && !user) {
      const loginUrl = new URL('/secure-admin-login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    if (isAdminRoute) {
      const loginUrl = new URL('/secure-admin-login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
