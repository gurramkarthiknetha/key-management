import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { hashPassword } from '@/utils/auth';
import { generateUserQRData, generateQRCode } from '@/utils/qr';
import { withAdminOnly } from '@/middleware/auth';
import { UserRole, ApiResponse } from '@/types';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  role: UserRole;
  department: string;
}

async function registerHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body: RegisterRequest = await req.json();
    const { name, email, password, employeeId, role, department } = body;

    // Validate input
    if (!name || !email || !password || !employeeId || !role || !department) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { employeeId }
      ]
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User with this email or employee ID already exists'
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      employeeId,
      role,
      department,
      qrCode: '' // Will be updated after user is saved
    });

    // Save user to get the ID
    const savedUser = await newUser.save();

    // Generate QR code for the user
    const qrData = generateUserQRData(savedUser._id.toString());
    const qrCodeDataURL = await generateQRCode(qrData);

    // Update user with QR code
    savedUser.qrCode = qrCodeDataURL;
    await savedUser.save();

    // Remove password from response
    const userResponse = savedUser.toJSON();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: userResponse,
      message: 'User registered successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User with this email or employee ID already exists'
      }, { status: 409 });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Allow public registration
export const POST = registerHandler;
