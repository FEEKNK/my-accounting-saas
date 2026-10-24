import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/token';

const PUBLIC_PATHS = ['/login', '/register', '/landing'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal Next.js paths, and public auth endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Check session cookie
  const sessionCookie =
    request.cookies.get('my_accounting_session')?.value ||
    request.cookies.get('kanta_session')?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
  const isAuthenticated = !!session;

  // 3. Handle public auth pages (/login, /register)
  if (PUBLIC_PATHS.includes(pathname)) {
    if (isAuthenticated) {
      // If already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 4. Handle protected routes
  if (!isAuthenticated) {
    // If API route, return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: กรุณาเข้าสู่ระบบก่อนใช้งาน' },
        { status: 401 }
      );
    }

    // If page route, redirect to login page with return url
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 5. Authenticated: Forward user and tenant headers
  const requestHeaders = new Headers(request.headers);
  if (session) {
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-company-id', session.companyId);
    requestHeaders.set('x-user-role', session.role);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
