import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Key, User, KeyLog } from '@/models';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { parseQRCode } from '@/utils/qr';
import { sendKeyAccessGrantedEmail } from '@/utils/email';
import { ApiResponse, KeyStatus, LogAction } from '@/types';

interface CheckoutRequest {
  keyQR: string;
  userQR: string;
  location?: string;
  notes?: string;
  duration?: number; // in hours
}

async function checkoutKeyHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body: CheckoutRequest = await req.json();
    const { keyQR, userQR, location, notes, duration } = body;
    const currentUser = req.user!;

    // Validate input
    if (!keyQR || !userQR) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Key QR and User QR are required'
      }, { status: 400 });
    }

    // Parse QR codes
    const keyQRData = parseQRCode(keyQR);
    const userQRData = parseQRCode(userQR);

    if (!keyQRData || keyQRData.type !== 'key') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid key QR code'
      }, { status: 400 });
    }

    if (!userQRData || userQRData.type !== 'user') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid user QR code'
      }, { status: 400 });
    }

    // Find key and user
    const [key, user] = await Promise.all([
      Key.findById(keyQRData.id),
      User.findById(userQRData.id)
    ]);

    if (!key || !key.isActive) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Key not found or inactive'
      }, { status: 404 });
    }

    if (!user || !user.isActive) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found or inactive'
      }, { status: 404 });
    }

    // Check if key is available
    if (key.status !== KeyStatus.AVAILABLE) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Key is currently ${key.status.toLowerCase()}`
      }, { status: 400 });
    }

    // Check if user has permission to access this key (same department or admin)
    if (user.department !== key.department && currentUser.role !== 'security_incharge') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User does not have permission to access this key'
      }, { status: 403 });
    }

    // Calculate due date
    const loanDuration = duration || key.maxLoanDuration || 24; // hours
    const dueDate = new Date(Date.now() + loanDuration * 60 * 60 * 1000);

    // Update key status
    key.status = KeyStatus.ISSUED;
    key.currentHolder = user._id;
    key.issuedAt = new Date();
    key.dueDate = dueDate;

    // Create log entry
    const logEntry = new KeyLog({
      keyId: key._id,
      userId: user._id,
      action: LogAction.CHECK_OUT,
      timestamp: new Date(),
      location: location || 'Security Desk',
      notes,
      createdBy: currentUser.userId,
      isOffline: false
    });

    // Save both key and log
    await Promise.all([
      key.save(),
      logEntry.save()
    ]);

    // Send email notification (don't wait for it)
    sendKeyAccessGrantedEmail(user, key).catch(error => {
      console.error('Failed to send email notification:', error);
    });

    // Populate the response data
    await key.populate('currentHolder', 'name employeeId email');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        key,
        log: logEntry,
        dueDate: dueDate.toISOString()
      },
      message: `Key checked out successfully. Due back by ${dueDate.toLocaleString()}`
    });

  } catch (error) {
    console.error('Checkout key error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const POST = withAuth(checkoutKeyHandler);
