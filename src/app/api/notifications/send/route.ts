import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { verifyToken } from '@/lib/auth';
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

    // Check if user has permission to send notifications
    if (!['Security Incharge', 'HOD'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    let result = false;

    switch (type) {
      case 'key_access_granted':
        result = await emailService.sendKeyAccessGranted(data.userEmail, {
          userName: data.userName,
          keyName: data.keyName,
          keyId: data.keyId,
          location: data.location,
          dueDate: data.dueDate,
          issuedBy: data.issuedBy,
          notes: data.notes,
        });
        break;

      case 'overdue_alert':
        result = await emailService.sendOverdueAlert(data.userEmail, {
          userName: data.userName,
          userEmail: data.userEmail,
          keyName: data.keyName,
          keyId: data.keyId,
          dueDate: data.dueDate,
          daysOverdue: data.daysOverdue,
          location: data.location,
        });
        break;

      case 'test_email':
        result = await emailService.sendTestEmail(data.email);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    const response: ApiResponse = {
      success: result,
      message: result ? 'Notification sent successfully' : 'Failed to send notification',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
