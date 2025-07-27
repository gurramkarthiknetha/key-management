import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(request) {
    // Handle CORS for API routes
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

    if (token) {
      // If user has no role, redirect to login with error
      if (!token.role) {
        console.log(`🚫 Middleware: User ${token.email} has no role, redirecting to login`);
        return NextResponse.redirect(new URL('/login?error=no_role', request.url));
      }

      // Role-based route protection
      if (pathname.startsWith('/faculty') && !['faculty', 'hod'].includes(token.role)) {
        console.log(`🚫 Middleware: Access denied to ${pathname} for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/security') && !['security', 'security_head'].includes(token.role)) {
        console.log(`🚫 Middleware: Access denied to ${pathname} for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/securityincharge') && token.role !== 'security_head') {
        console.log(`🚫 Middleware: Access denied to ${pathname} for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/hod') && token.role !== 'hod') {
        console.log(`🚫 Middleware: Access denied to ${pathname} for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/admin') && token.role !== 'admin') {
        console.log(`🚫 Middleware: Access denied to ${pathname} for role ${token.role}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to API routes and public pages
        if (req.nextUrl.pathname.startsWith('/api/') ||
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname === '/login' ||
            req.nextUrl.pathname === '/register') {
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
