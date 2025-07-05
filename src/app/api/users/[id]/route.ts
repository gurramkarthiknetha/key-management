import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import { withAuth, withAdminOnly, AuthenticatedRequest } from '@/middleware/auth';
import { ApiResponse, UserRole } from '@/types';
import { hashPassword } from '@/utils/auth';

interface RouteParams {
  params: { id: string };
}

// GET /api/users/[id] - Get user by ID
async function getUserHandler(req: AuthenticatedRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = params;
    const currentUser = req.user!;

    // Admin can view any user, others can only view themselves
    if (currentUser.role !== UserRole.SECURITY_INCHARGE && currentUser.userId !== id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 });
    }

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user (Admin only)
async function updateUserHandler(req: AuthenticatedRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = params;
    const body = await req.json();
    const { name, email, employeeId, role, department, isActive, password } = body;

    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check for duplicate email or employeeId
    if (email || employeeId) {
      const duplicateQuery: any = { _id: { $ne: id } };
      
      if (email) {
        duplicateQuery.$or = [{ email: email.toLowerCase() }];
      }
      
      if (employeeId) {
        if (duplicateQuery.$or) {
          duplicateQuery.$or.push({ employeeId });
        } else {
          duplicateQuery.$or = [{ employeeId }];
        }
      }

      const existingUser = await User.findOne(duplicateQuery);
      
      if (existingUser) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'User with this email or employee ID already exists'
        }, { status: 409 });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (employeeId) user.employeeId = employeeId;
    if (role) user.role = role;
    if (department) user.department = department;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    
    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Password must be at least 6 characters long'
        }, { status: 400 });
      }
      user.password = await hashPassword(password);
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(id).select('-password');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
async function deleteUserHandler(req: AuthenticatedRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = params;
    const currentUser = req.user!;

    // Prevent admin from deleting themselves
    if (currentUser.userId === id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cannot delete your own account'
      }, { status: 400 });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const GET = withAuth(getUserHandler);
export const PUT = withAdminOnly(updateUserHandler);
export const DELETE = withAdminOnly(deleteUserHandler);
