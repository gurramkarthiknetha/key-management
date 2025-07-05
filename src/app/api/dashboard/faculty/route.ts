import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import { Key, KeyTransaction, KeyRequest, Department } from '@/models';
import { UserRole } from '@/types';

async function facultyDashboardHandler(req: NextRequest) {
  try {
    await connectDB();
    const user = (req as any).user;

    // Get department document
    const department = await Department.findOne({ name: user.department });

    // Get available keys (either department-specific or all if admin)
    let availableKeysQuery: any = { status: 'AVAILABLE' };
    if (user.role !== UserRole.SECURITY_INCHARGE && department) {
      availableKeysQuery.department = department._id;
    }
    const availableKeys = await Key.countDocuments(availableKeysQuery);

    // Get user's current keys
    const myCurrentKeys = await KeyTransaction.countDocuments({
      userId: user.userId,
      status: 'CHECKED_OUT'
    });

    // Get user's overdue keys
    const now = new Date();
    const myOverdueKeys = await KeyTransaction.countDocuments({
      userId: user.userId,
      status: 'CHECKED_OUT',
      dueDate: { $lt: now }
    });

    // Get department keys count
    let departmentKeys = 0;
    if (department) {
      departmentKeys = await Key.countDocuments({
        department: department._id
      });
    }

    // Get recent requests count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRequests = await KeyRequest.countDocuments({
      userId: user.userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const stats = {
      availableKeys,
      myCurrentKeys,
      myOverdueKeys,
      departmentKeys,
      recentRequests
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Faculty dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch faculty dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(facultyDashboardHandler);
