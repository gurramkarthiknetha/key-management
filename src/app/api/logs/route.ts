import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { KeyLog, Key, User } from '@/models';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { canAccessDepartmentData } from '@/utils/auth';
import { ApiResponse, UserRole, LogAction } from '@/types';

// GET /api/logs - Get key logs with filtering
async function getLogsHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const department = searchParams.get('department');
    const userId = searchParams.get('userId');
    const keyId = searchParams.get('keyId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const currentUser = req.user!;

    // Build query
    const query: any = {};

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Action filter
    if (action && Object.values(LogAction).includes(action as LogAction)) {
      query.action = action;
    }

    // User filter
    if (userId) {
      query.userId = userId;
    }

    // Key filter
    if (keyId) {
      query.keyId = keyId;
    }

    // Department filter based on permissions
    if (currentUser.role === UserRole.SECURITY_INCHARGE) {
      // Admin can see all logs, optionally filtered by department
      if (department) {
        // Need to filter by keys from specific department
        const departmentKeys = await Key.find({ department }).select('_id');
        const keyIds = departmentKeys.map(key => key._id);
        query.keyId = { $in: keyIds };
      }
    } else {
      // Non-admin users can only see logs from their department
      const departmentKeys = await Key.find({ department: currentUser.department }).select('_id');
      const keyIds = departmentKeys.map(key => key._id);
      query.keyId = { $in: keyIds };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get logs with pagination and populate related data
    const [logs, total] = await Promise.all([
      KeyLog.find(query)
        .populate('key', 'name keyId location department')
        .populate('user', 'name employeeId email department')
        .populate('createdBy', 'name employeeId')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      KeyLog.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get logs error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const GET = withAuth(getLogsHandler);
