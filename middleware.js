import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(request) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const response = NextResponse.next();

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: response.headers });
      }

      return response;
    }

    // Get user info from NextAuth token
    const token = request.nextauth.token;
    const pathname = request.nextUrl.pathname;

    console.log(`🔍 Middleware: ALWAYS RUNS - Processing ${pathname}, token exists: ${!!token}, email: ${token?.email}, role: ${token?.role}`);

    // Allow debug and redirect routes before role check to prevent loops
    if (pathname.startsWith('/redirect-dashboard') || pathname.startsWith('/debug-nav')) {
      console.log(`🔍 Middleware: Allowing access to debug/redirect page: ${pathname}`);
      return NextResponse.next();
    }

    if (token) {
      console.log(`🔍 Middleware: Checking access for ${token.email} with role ${token.role} to ${pathname}`);

      // If user has no role, redirect to redirect-dashboard for role assignment (not login to avoid loops)
      if (!token.role) {
        console.log(`� Middleware: User ${token.email} has no role, redirecting to redirect-dashboard for role assignment`);
        return NextResponse.redirect(new URL('/redirect-dashboard', request.url));
      }

      // Role-based route protection with more specific logging
      if (pathname.startsWith('/faculty')) {
        console.log(`🔍 Middleware: Faculty page access check - User: ${token.email}, Role: ${token.role}, Allowed roles: ['faculty', 'hod']`);
        if (!['faculty', 'hod'].includes(token.role)) {
          console.log(`🚫 Middleware: Faculty access denied for role ${token.role}`);
          return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
        } else {
          console.log(`✅ Middleware: Faculty access granted for role ${token.role}`);
        }
      }

      if (pathname.startsWith('/security') && !['security', 'security_head'].includes(token.role)) {
        console.log(`🚫 Middleware: Security access denied for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/securityincharge') && token.role !== 'security_head') {
        console.log(`🚫 Middleware: Security head access denied for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/hod') && token.role !== 'hod') {
        console.log(`🚫 Middleware: HOD access denied for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/admin') && token.role !== 'admin') {
        console.log(`🚫 Middleware: Admin access denied for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      console.log(`✅ Middleware: Access granted to ${pathname} for role ${token.role}`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/api/') ||
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname === '/login' ||
            req.nextUrl.pathname === '/register' ||
            req.nextUrl.pathname === '/debug-nav' ||
            req.nextUrl.pathname === '/redirect-dashboard') {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/api/:path*',
    '/faculty/:path*',
    '/security/:path*',
    '/securityincharge/:path*',
    '/hod/:path*',
    '/admin/:path*',
    '/profile/:path*'
  ]
};
