import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasPermission } from '@/utils/auth';
import { UserRole } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    department: string;
  };
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, error: 'No token provided' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        department: decoded.department
      };

      return await handler(req);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

export function withRoles(roles: UserRole[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
      if (!req.user || !hasPermission(req.user.role, roles)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return await handler(req);
    });
  };
}

export function withAdminOnly(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRoles([UserRole.SECURITY_INCHARGE])(handler);
}

export function withHODOrAdmin(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRoles([UserRole.HOD, UserRole.SECURITY_INCHARGE])(handler);
}

export function withStaffAccess(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRoles([
    UserRole.SECURITY_STAFF,
    UserRole.FACULTY_LAB_STAFF,
    UserRole.HOD,
    UserRole.SECURITY_INCHARGE
  ])(handler);
}

export function withSecurityStaffOrAbove(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRoles([
    UserRole.SECURITY_STAFF,
    UserRole.SECURITY_INCHARGE
  ])(handler);
}

export function withHODOrAbove(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRoles([
    UserRole.HOD,
    UserRole.SECURITY_INCHARGE
  ])(handler);
}
