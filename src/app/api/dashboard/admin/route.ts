import { NextRequest, NextResponse } from 'next/server';
import { withAdminOnly } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import { User, Key, KeyTransaction, Department } from '@/models';

async function adminDashboardHandler(req: NextRequest) {
  try {
    await connectDB();

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active users (users who have logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo }
    });

    // Get key statistics
    const totalKeys = await Key.countDocuments();
    const availableKeys = await Key.countDocuments({ status: 'AVAILABLE' });
    const issuedKeys = await Key.countDocuments({ status: 'ISSUED' });

    // Get overdue keys
    const now = new Date();
    const overdueKeys = await KeyTransaction.countDocuments({
      status: 'CHECKED_OUT',
      dueDate: { $lt: now }
    });

    // Get total departments
    const totalDepartments = await Department.countDocuments();

    // Get recent activity count (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentActivity = await KeyTransaction.countDocuments({
      createdAt: { $gte: twentyFourHoursAgo }
    });

    const stats = {
      totalUsers,
      activeUsers,
      totalKeys,
      availableKeys,
      issuedKeys,
      overdueKeys,
      totalDepartments,
      recentActivity
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withAdminOnly(adminDashboardHandler);
