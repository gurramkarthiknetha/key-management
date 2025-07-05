import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { comparePassword, hashPassword } from '@/utils/auth';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { ApiResponse } from '@/types';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

async function changePasswordHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body: ChangePasswordRequest = await req.json();
    const { currentPassword, newPassword } = body;
    const userId = req.user!.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Current password and new password are required'
      }, { status: 400 });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'New password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Current password is incorrect'
      }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const POST = withAuth(changePasswordHandler);
