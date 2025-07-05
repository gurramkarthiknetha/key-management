import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { ApiResponse, AuthUser } from '@/types';

async function meHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const userId = req.user!.userId;

    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check if user is still active
    if (!user.isActive) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Account is deactivated'
      }, { status: 401 });
    }

    // Prepare user data for response
    const authUser: AuthUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    return NextResponse.json<ApiResponse<AuthUser>>({
      success: true,
      data: authUser
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const GET = withAuth(meHandler);
