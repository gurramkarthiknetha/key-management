import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { comparePassword, generateToken } from '@/utils/auth';
import { LoginCredentials, ApiResponse, AuthUser } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body: LoginCredentials = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Account is deactivated. Please contact administrator.'
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      department: user.department
    });

    // Prepare user data for response
    const authUser: AuthUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    return NextResponse.json<ApiResponse<{ user: AuthUser; token: string }>>({
      success: true,
      data: {
        user: authUser,
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
