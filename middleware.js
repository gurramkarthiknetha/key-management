import { NextResponse } from 'next/server';

export default async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Handle API routes with CORS
  if (pathname.startsWith('/api/')) {
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

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/health'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token
  const authToken = request.cookies.get('authToken')?.value;

  if (!authToken) {
    console.log(`🔍 Middleware: No auth token found for ${pathname}, redirecting to login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Validate token with backend (simplified check)
  try {
    // In a real implementation, you might want to validate the token with the backend
    // For now, we'll just check if the token exists and is not expired
    const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (tokenPayload.exp && tokenPayload.exp < currentTime) {
      console.log(`🔍 Middleware: Token expired for ${pathname}, redirecting to login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userRole = tokenPayload.role;
    console.log(`🔍 Middleware: User ${tokenPayload.email} with role ${userRole} accessing ${pathname}`);

    // Role-based route protection (relaxed for development/demo)
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!isDevelopment) {
      // Strict role checking for production
      if (pathname.startsWith('/faculty')) {
        if (!['faculty', 'hod'].includes(userRole)) {
          console.log(`🚫 Middleware: Faculty access denied for role ${userRole}`);
          return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
        }
      }

      if (pathname.startsWith('/security') && !['security', 'security_incharge'].includes(userRole)) {
        console.log(`🚫 Middleware: Security access denied for role ${userRole}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/securityincharge') && userRole !== 'security_incharge') {
        console.log(`🚫 Middleware: Security incharge access denied for role ${userRole}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }

      if (pathname.startsWith('/hod') && userRole !== 'hod') {
        console.log(`🚫 Middleware: HOD access denied for role ${userRole}`);
        return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
      }


    } else {
      // Development mode: Allow role switching for demo purposes
      console.log(`🔓 Middleware: Development mode - allowing access to ${pathname} for role ${userRole}`);
    }

    console.log(`✅ Middleware: Access granted to ${pathname} for role ${userRole}`);
    return NextResponse.next();

  } catch (error) {
    console.error('🔍 Middleware: Token validation error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/api/:path*',
    '/faculty/:path*',
    '/security/:path*',
    '/securityincharge/:path*',
    '/hod/:path*',
    '/profile/:path*',
    '/test-auth'
  ]
};
