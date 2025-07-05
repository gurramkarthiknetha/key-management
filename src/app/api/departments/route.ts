import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Department, User } from '@/models';
import { withAuth, withAdminOnly, AuthenticatedRequest } from '@/middleware/auth';
import { ApiResponse, UserRole } from '@/types';

// GET /api/departments - Get all departments (public for registration, authenticated for admin features)
async function getDepartmentsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    const authHeader = req.headers.get('authorization');

    // If no auth header, return basic department list for registration
    if (!authHeader) {
      const departments = await Department.find({ isActive: true })
        .select('name code description')
        .sort({ name: 1 });

      return NextResponse.json<ApiResponse>({
        success: true,
        data: departments
      });
    }

    // If authenticated, return full department data
    let departments;

    if (includeStats) {
      // Get departments with virtual counts
      departments = await Department.find({ isActive: true })
        .populate('hod', 'name email employeeId')
        .populate('keysCount')
        .populate('usersCount')
        .sort({ name: 1 });
    } else {
      departments = await Department.find({ isActive: true })
        .populate('hod', 'name email employeeId')
        .sort({ name: 1 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/departments - Create new department (Admin only)
async function createDepartmentHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = await req.json();
    const { name, code, hodId, description, location, contactEmail, contactPhone } = body;

    // Validate input
    if (!name || !code || !hodId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, code, and HOD are required'
      }, { status: 400 });
    }

    // Check if department code already exists
    const existingDepartment = await Department.findOne({ code: code.toUpperCase() });
    if (existingDepartment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Department with this code already exists'
      }, { status: 409 });
    }

    // Verify HOD exists and has correct role
    const hod = await User.findById(hodId);
    if (!hod) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'HOD user not found'
      }, { status: 404 });
    }

    if (hod.role !== UserRole.HOD) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Selected user is not a HOD'
      }, { status: 400 });
    }

    // Check if HOD is already assigned to another department
    const existingHODDepartment = await Department.findOne({ hodId, isActive: true });
    if (existingHODDepartment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This HOD is already assigned to another department'
      }, { status: 409 });
    }

    // Create new department
    const newDepartment = new Department({
      name,
      code: code.toUpperCase(),
      hodId,
      description,
      location,
      contactEmail: contactEmail?.toLowerCase(),
      contactPhone
    });

    await newDepartment.save();

    // Update user's department
    hod.department = name;
    await hod.save();

    // Populate HOD details for response
    await newDepartment.populate('hod', 'name email employeeId');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: newDepartment,
      message: 'Department created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create department error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const GET = getDepartmentsHandler;
export const POST = withAdminOnly(createDepartmentHandler);
