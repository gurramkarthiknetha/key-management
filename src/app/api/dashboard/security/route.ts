import { NextRequest, NextResponse } from 'next/server';
import { withSecurityStaffOrAbove } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import { Key, KeyTransaction } from '@/models';

async function securityDashboardHandler(req: NextRequest) {
  try {
    await connectDB();

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

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCheckouts = await KeyTransaction.countDocuments({
      type: 'CHECK_OUT',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayCheckins = await KeyTransaction.countDocuments({
      type: 'CHECK_IN',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get current shift activity (last 8 hours)
    const eightHoursAgo = new Date();
    eightHoursAgo.setHours(eightHoursAgo.getHours() - 8);

    const myShiftActivity = await KeyTransaction.countDocuments({
      createdAt: { $gte: eightHoursAgo }
    });

    const stats = {
      totalKeys,
      availableKeys,
      issuedKeys,
      overdueKeys,
      todayCheckouts,
      todayCheckins,
      myShiftActivity
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Security dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch security dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withSecurityStaffOrAbove(securityDashboardHandler);
