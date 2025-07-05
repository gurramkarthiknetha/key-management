import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types';

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

    // Check if user has permission to view email config
    if (!['Security Incharge', 'HOD'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const config = emailService.getConfigStatus();
    const connectionTest = await emailService.testConnection();

    const response: ApiResponse = {
      success: true,
      data: {
        ...config,
        connectionWorking: connectionTest,
        environmentVariables: {
          SMTP_HOST: !!process.env.SMTP_HOST,
          SMTP_PORT: !!process.env.SMTP_PORT,
          SMTP_USER: !!process.env.SMTP_USER,
          SMTP_PASS: !!process.env.SMTP_PASS,
          SMTP_FROM: !!process.env.SMTP_FROM,
          SECURITY_EMAIL: !!process.env.SECURITY_EMAIL,
          HOD_EMAIL: !!process.env.HOD_EMAIL,
          ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Email config check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
