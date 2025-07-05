import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { connectDB } from '@/lib/mongodb';
import { KeyLog } from '@/models/KeyLog';
import { Key } from '@/models/Key';
import { ApiResponse } from '@/types';

// This endpoint should be called by a cron service (like Vercel Cron or external cron)
// Add authentication via API key for security
export async function POST(request: NextRequest) {
  try {
    // Verify cron API key
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.CRON_API_KEY;
    
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
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
      KeyLog.countDocuments({
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }),

      KeyLog.countDocuments({
        action: 'check_out',
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }),

      KeyLog.countDocuments({
        action: 'check_in',
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      }),

      KeyLog.find({
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      })
      .populate('keyId', 'name')
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(),

      Key.find({
        status: 'checked_out',
        dueDate: { $lt: new Date() }
      })
      .populate('currentHolder', 'name email')
      .lean(),

      Key.countDocuments({ status: 'available' })
    ]);

    const results = {
      dailyReport: false,
      overdueAlerts: false,
      errors: [] as string[]
    };

    // Send daily report
    try {
      const formattedActivity = recentActivity.map((log: any) => ({
        action: log.action === 'check_out' ? 'Check Out' : 'Check In',
        keyName: log.keyId?.name || 'Unknown Key',
        userName: log.userId?.name || 'Unknown User',
        timestamp: log.timestamp.toLocaleString()
      }));

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

      const reportData = {
        date: today.toLocaleDateString(),
        totalTransactions,
        checkouts,
        checkins,
        overdueKeys: overdueKeys.length,
        availableKeys,
        recentActivity: formattedActivity,
        overdueList
      };

      const recipients = [
        process.env.SECURITY_EMAIL,
        process.env.HOD_EMAIL,
        process.env.ADMIN_EMAIL
      ].filter(Boolean) as string[];

      if (recipients.length > 0) {
        results.dailyReport = await emailService.sendDailyReport(recipients, reportData);
      } else {
        results.errors.push('No recipients configured for daily report');
      }
    } catch (error) {
      console.error('Daily report error:', error);
      results.errors.push(`Daily report failed: ${error}`);
    }

    // Send overdue alerts
    try {
      const overdueEmailData = overdueKeys
        .map((key: any) => {
          const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(key.dueDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          // Only send alerts for keys that are 1+ days overdue
          if (daysOverdue < 1) return null;

          return {
            userEmail: key.currentHolder?.email,
            userName: key.currentHolder?.name || 'Unknown User',
            keyName: key.name,
            keyId: key._id.toString(),
            dueDate: new Date(key.dueDate).toLocaleDateString(),
            daysOverdue,
            location: key.location || 'Unknown Location'
          };
        })
        .filter(Boolean)
        .filter((item: any) => item.userEmail);

      if (overdueEmailData.length > 0) {
        const alertResult = await emailService.sendBulkOverdueAlerts(overdueEmailData);
        results.overdueAlerts = alertResult.sent > 0;
        
        if (alertResult.failed > 0) {
          results.errors.push(`${alertResult.failed} overdue alerts failed to send`);
        }
      } else {
        results.overdueAlerts = true; // No overdue keys is a success
      }
    } catch (error) {
      console.error('Overdue alerts error:', error);
      results.errors.push(`Overdue alerts failed: ${error}`);
    }

    const response: ApiResponse = {
      success: results.dailyReport && results.overdueAlerts,
      message: 'Daily tasks completed',
      data: {
        ...results,
        statistics: {
          totalTransactions,
          checkouts,
          checkins,
          overdueKeys: overdueKeys.length,
          availableKeys
        },
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Daily tasks cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
