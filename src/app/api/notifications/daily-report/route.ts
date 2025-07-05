import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { KeyLog } from '@/models/KeyLog';
import { Key } from '@/models/Key';
import { User } from '@/models/User';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to send daily reports
    if (!['Security Incharge', 'HOD'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { date, recipients } = body;

    // Default to today if no date provided
    const reportDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get daily statistics
    const [
      totalTransactions,
      checkouts,
      checkins,
      recentActivity,
      overdueKeys,
      availableKeys
    ] = await Promise.all([
      // Total transactions for the day
      KeyLog.countDocuments({
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }),

      // Checkouts for the day
      KeyLog.countDocuments({
        action: 'check_out',
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }),

      // Checkins for the day
      KeyLog.countDocuments({
        action: 'check_in',
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }),

      // Recent activity (last 10 transactions of the day)
      KeyLog.find({
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      })
      .populate('keyId', 'name')
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(),

      // Overdue keys
      Key.find({
        status: 'checked_out',
        dueDate: { $lt: new Date() }
      })
      .populate('currentHolder', 'name')
      .lean(),

      // Available keys
      Key.countDocuments({ status: 'available' })
    ]);

    // Format recent activity
    const formattedActivity = recentActivity.map((log: any) => ({
      action: log.action === 'check_out' ? 'Check Out' : 'Check In',
      keyName: log.keyId?.name || 'Unknown Key',
      userName: log.userId?.name || 'Unknown User',
      timestamp: log.timestamp.toLocaleString()
    }));

    // Format overdue list
    const overdueList = overdueKeys.map((key: any) => {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(key.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        keyName: key.name,
        userName: key.currentHolder?.name || 'Unknown User',
        daysOverdue
      };
    });

    // Prepare report data
    const reportData = {
      date: reportDate.toLocaleDateString(),
      totalTransactions,
      checkouts,
      checkins,
      overdueKeys: overdueKeys.length,
      availableKeys,
      recentActivity: formattedActivity,
      overdueList
    };

    // Default recipients if not provided
    const defaultRecipients = [
      process.env.SECURITY_EMAIL,
      process.env.HOD_EMAIL,
      process.env.ADMIN_EMAIL
    ].filter(Boolean) as string[];

    const emailRecipients = recipients && recipients.length > 0 ? recipients : defaultRecipients;

    if (emailRecipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients specified and no default recipients configured' },
        { status: 400 }
      );
    }

    // Send daily report
    const result = await emailService.sendDailyReport(emailRecipients, reportData);

    const response: ApiResponse = {
      success: result,
      message: result ? 'Daily report sent successfully' : 'Failed to send daily report',
      data: {
        reportData,
        recipients: emailRecipients
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Daily report error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
