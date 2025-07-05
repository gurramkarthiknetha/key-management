import { NextRequest, NextResponse } from 'next/server';
import { withHODOrAbove } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import { User, Key, KeyTransaction, KeyRequest, Department } from '@/models';

async function hodDashboardHandler(req: NextRequest) {
  try {
    await connectDB();
    const user = (req as any).user;

    // Get department document
    const department = await Department.findOne({ name: user.department });
    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    // Get department users
    const departmentUsers = await User.countDocuments({
      department: user.department
    });

    // Get active department users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeDepartmentUsers = await User.countDocuments({
      department: user.department,
      lastLoginAt: { $gte: thirtyDaysAgo }
    });

    // Get department keys
    const departmentKeys = await Key.countDocuments({
      department: department._id
    });

    const availableDepartmentKeys = await Key.countDocuments({
      status: 'AVAILABLE',
      department: department._id
    });

    const issuedDepartmentKeys = await Key.countDocuments({
      status: 'ISSUED',
      department: department._id
    });

    // Get overdue department keys
    const now = new Date();
    const departmentKeyIds = await Key.find({ department: department._id }).distinct('_id');

    const overdueDepartmentKeys = await KeyTransaction.countDocuments({
      status: 'CHECKED_OUT',
      dueDate: { $lt: now },
      keyId: { $in: departmentKeyIds }
    });

    // Get monthly activity for department
    const thirtyDaysAgoActivity = new Date();
    thirtyDaysAgoActivity.setDate(thirtyDaysAgoActivity.getDate() - 30);

    const monthlyActivity = await KeyTransaction.countDocuments({
      createdAt: { $gte: thirtyDaysAgoActivity },
      keyId: { $in: departmentKeyIds }
    });

    // Get pending requests for department
    const pendingRequests = await KeyRequest.countDocuments({
      status: 'PENDING',
      keyId: { $in: departmentKeyIds }
    });

    const stats = {
      departmentUsers,
      activeDepartmentUsers,
      departmentKeys,
      availableDepartmentKeys,
      issuedDepartmentKeys,
      overdueDepartmentKeys,
      monthlyActivity,
      pendingRequests
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('HOD dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch HOD dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withHODOrAbove(hodDashboardHandler);
