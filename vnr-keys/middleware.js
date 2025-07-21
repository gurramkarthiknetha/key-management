import { NextResponse } from 'next/server';

export function middleware(request) {
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
  
  // Handle protected routes
  const protectedRoutes = ['/faculty', '/security', '/securityincharge', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token')?.value;
    const user = request.cookies.get('user_data')?.value;

    if (!token || !user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const userData = JSON.parse(user);
      const pathname = request.nextUrl.pathname;
      
      // Role-based route protection
      if (pathname.startsWith('/faculty') && !['faculty_lab_staff', 'hod'].includes(userData.role)) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (pathname.startsWith('/security') && !['security_staff', 'security_incharge'].includes(userData.role)) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (pathname.startsWith('/securityincharge') && userData.role !== 'security_incharge') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      // Invalid user data, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/faculty/:path*',
    '/security/:path*',
    '/securityincharge/:path*',
    '/profile/:path*'
  ]
};
