import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Key } from '@/models/Key';
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

    // Check if user has permission to send overdue alerts
    if (!['Security Incharge', 'HOD'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { minDaysOverdue = 1, maxDaysOverdue = null } = body;

    // Find all overdue keys
    const overdueKeys = await Key.find({
      status: 'checked_out',
      dueDate: { $lt: new Date() }
    })
    .populate('currentHolder', 'name email')
    .lean();

    // Filter by days overdue and prepare email data
    const emailData = overdueKeys
      .map((key: any) => {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(key.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Apply filters
        if (daysOverdue < minDaysOverdue) return null;
        if (maxDaysOverdue && daysOverdue > maxDaysOverdue) return null;

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
      .filter(Boolean) // Remove null entries
      .filter((item: any) => item.userEmail); // Only include items with valid email

    if (emailData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No overdue keys found matching criteria',
        data: { sent: 0, failed: 0, total: 0 }
      });
    }

    // Send bulk overdue alerts
    const result = await emailService.sendBulkOverdueAlerts(emailData);

    const response: ApiResponse = {
      success: true,
      message: `Overdue alerts processed: ${result.sent} sent, ${result.failed} failed`,
      data: {
        ...result,
        total: emailData.length,
        overdueKeys: emailData.map(item => ({
          keyName: item.keyName,
          userName: item.userName,
          daysOverdue: item.daysOverdue
        }))
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Bulk overdue alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get overdue keys summary
    const overdueKeys = await Key.find({
      status: 'checked_out',
      dueDate: { $lt: new Date() }
    })
    .populate('currentHolder', 'name email')
    .lean();

    const summary = overdueKeys.map((key: any) => {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(key.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        keyId: key._id.toString(),
        keyName: key.name,
        userName: key.currentHolder?.name || 'Unknown User',
        userEmail: key.currentHolder?.email || 'No email',
        dueDate: new Date(key.dueDate).toLocaleDateString(),
        daysOverdue,
        location: key.location || 'Unknown Location'
      };
    });

    const response: ApiResponse = {
      success: true,
      data: {
        total: summary.length,
        overdueKeys: summary
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get overdue keys error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
