import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyToken } from '@/utils/auth';
import { UserRole } from '@/types';

// Define protected routes and their required roles
const roleBasedRoutes = {
  '/faculty': [UserRole.FACULTY, UserRole.HOD, UserRole.SECURITY_INCHARGE],
  '/security': [UserRole.SECURITY, UserRole.SECURITY_INCHARGE],
  '/hod': [UserRole.HOD, UserRole.SECURITY_INCHARGE],
  '/admin': [UserRole.SECURITY_INCHARGE]
};

// Public routes that don't require authentication
const publicRoutes = ['/', '/api/auth', '/api/auth/register', '/api/auth/login'];

// API routes that require authentication
const protectedApiRoutes = ['/api/auth/me', '/api/auth/logout'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Handle NextAuth.js routes
  if (pathname.startsWith('/api/auth/') && !protectedApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for authentication token (NextAuth JWT or custom JWT)
  let userRole: UserRole | null = null;
  let isAuthenticated = false;

  // Try NextAuth token first
  const nextAuthToken = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (nextAuthToken) {
    userRole = nextAuthToken.role as UserRole;
    isAuthenticated = true;
  } else {
    // Try custom JWT token from cookie
    const customToken = request.cookies.get('auth-token')?.value;
    if (customToken) {
      const payload = verifyToken(customToken);
      if (payload) {
        userRole = payload.role;
        isAuthenticated = true;
      }
    }
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for protected routes
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on user role
        const redirectUrl = getRoleBasedRedirectUrl(userRole);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

function getRoleBasedRedirectUrl(role: UserRole | null): string {
  switch (role) {
    case UserRole.FACULTY:
      return '/faculty';
    case UserRole.SECURITY:
      return '/security';
    case UserRole.SECURITY_INCHARGE:
      return '/security';
    case UserRole.HOD:
      return '/hod';
    default:
      return '/faculty';
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|icons).*)',
  ],
};
