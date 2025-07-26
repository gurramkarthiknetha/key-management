import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/utils/auth';
import { ApiResponse, AuthUser } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No authentication token found'
      }, { status: 401 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 401 });
    }

    // Get user from database
    const user = await User.findById(payload.userId).select('-password');
    if (!user || !user.isActive) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found or inactive'
      }, { status: 401 });
    }

    // Prepare user data for response
    const authUser: AuthUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      profileImage: user.profileImage
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: authUser
    }, { status: 200 });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
