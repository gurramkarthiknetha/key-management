import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Key, User, KeyLog } from '@/models';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { parseQRCode } from '@/utils/qr';
import { ApiResponse, KeyStatus, LogAction } from '@/types';

interface CheckinRequest {
  keyQR: string;
  location?: string;
  notes?: string;
  returnCondition?: 'good' | 'damaged' | 'lost';
}

async function checkinKeyHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body: CheckinRequest = await req.json();
    const { keyQR, location, notes, returnCondition } = body;
    const currentUser = req.user!;

    // Validate input
    if (!keyQR) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Key QR is required'
      }, { status: 400 });
    }

    // Parse QR code
    const keyQRData = parseQRCode(keyQR);

    if (!keyQRData || keyQRData.type !== 'key') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid key QR code'
      }, { status: 400 });
    }

    // Find key
    const key = await Key.findById(keyQRData.id).populate('currentHolder', 'name employeeId email');

    if (!key || !key.isActive) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Key not found or inactive'
      }, { status: 404 });
    }

    // Check if key is currently issued
    if (key.status !== KeyStatus.ISSUED && key.status !== KeyStatus.OVERDUE) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Key is not currently checked out (status: ${key.status})`
      }, { status: 400 });
    }

    if (!key.currentHolder) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Key has no current holder'
      }, { status: 400 });
    }

    // Calculate duration
    const issuedAt = key.issuedAt || new Date();
    const returnedAt = new Date();
    const durationMinutes = Math.round((returnedAt.getTime() - issuedAt.getTime()) / (1000 * 60));

    // Determine if key was overdue
    const wasOverdue = key.dueDate && returnedAt > key.dueDate;

    // Update key status
    const previousHolder = key.currentHolder;
    key.status = KeyStatus.AVAILABLE;
    key.currentHolder = null;
    key.issuedAt = null;
    key.dueDate = null;

    // Create log entry
    const logEntry = new KeyLog({
      keyId: key._id,
      userId: previousHolder._id,
      action: LogAction.CHECK_IN,
      timestamp: returnedAt,
      location: location || 'Security Desk',
      notes: wasOverdue ? `${notes || ''} [RETURNED OVERDUE]`.trim() : notes,
      duration: durationMinutes,
      returnCondition: returnCondition || 'good',
      createdBy: currentUser.userId,
      isOffline: false
    });

    // Save both key and log
    await Promise.all([
      key.save(),
      logEntry.save()
    ]);

    // Prepare response message
    let message = 'Key checked in successfully';
    if (wasOverdue) {
      const overdueDays = Math.ceil((returnedAt.getTime() - key.dueDate!.getTime()) / (1000 * 60 * 60 * 24));
      message += ` (was ${overdueDays} day(s) overdue)`;
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        key,
        log: logEntry,
        duration: {
          minutes: durationMinutes,
          formatted: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
        },
        wasOverdue,
        previousHolder
      },
      message
    });

  } catch (error) {
    console.error('Checkin key error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const POST = withAuth(checkinKeyHandler);
