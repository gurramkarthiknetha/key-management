import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Department from '@/models/Department';
import { hashPassword, isValidEmail, isValidPassword } from '@/utils/auth';
import { UserRole, RegisterData, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: RegisterData = await request.json();
    const { name, email, employeeId, password, role, department } = body;

    // Validation
    if (!name || !email || !password || !role || !department) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'All required fields must be provided'
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please provide a valid email address'
      }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid user role'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    // Check if employeeId is provided and unique
    if (employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId });
      if (existingEmployeeId) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Employee ID already exists'
        }, { status: 409 });
      }
    }

    // Verify department exists or create it if it doesn't exist
    let departmentExists = await Department.findOne({
      $or: [
        { name: department },
        { code: department }
      ],
      isActive: true
    });

    // If department doesn't exist, create it (for development/testing)
    if (!departmentExists) {
      try {
        departmentExists = new Department({
          name: department,
          code: department.toUpperCase().replace(/\s+/g, '_'),
          isActive: true
        });
        await departmentExists.save();
      } catch (error) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Invalid department'
        }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      employeeId: employeeId?.trim(),
      password: hashedPassword,
      role,
      department: departmentExists.name,
      isActive: true
    });

    await newUser.save();

    // Return success response (don't include password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      employeeId: newUser.employeeId,
      role: newUser.role,
      department: newUser.department,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: userResponse,
      message: 'User registered successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
