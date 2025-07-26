import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken, isValidEmail, getRoleBasedRedirect } from '@/utils/auth';
import { LoginCredentials, ApiResponse, AuthUser } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please provide a valid email address'
      }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check if user has a password (not a Google OAuth user)
    if (!user.password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This account was created with Google. Please sign in with Google.'
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

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
      department: user.department,
      profileImage: user.profileImage
    };

    // Get role-based redirect URL
    const redirectUrl = getRoleBasedRedirect(user.role);

    // Create response with token in httpOnly cookie
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: authUser,
        redirectUrl
      },
      message: 'Login successful'
    }, { status: 200 });

    // Set JWT token as httpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
