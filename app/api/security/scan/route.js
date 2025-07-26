import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import KeyAssignment from '../../../../models/KeyAssignment';
import KeyTransaction from '../../../../models/KeyTransaction';
import Key from '../../../../models/Key';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security', 'security_head'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { qrData, action } = await request.json();
    await connectDB();

    // Parse QR code data
    let parsedQRData;
    try {
      parsedQRData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid QR code format' }, { status: 400 });
    }

    const { assignmentId, keyId, facultyId, expiresAt } = parsedQRData;

    // Check if QR code is expired
    if (expiresAt && Date.now() > expiresAt) {
      return NextResponse.json({ error: 'QR code has expired' }, { status: 400 });
    }

    // Find the key assignment
    const assignment = await KeyAssignment.findById(assignmentId)
      .populate('keyId', 'name labName labNumber')
      .populate('facultyId', 'name email');

    if (!assignment) {
      return NextResponse.json({ error: 'Key assignment not found' }, { status: 404 });
    }

    // Verify the QR data matches the assignment
    if (assignment.keyId._id.toString() !== keyId || 
        assignment.facultyId._id.toString() !== facultyId) {
      return NextResponse.json({ error: 'QR code data mismatch' }, { status: 400 });
    }

    let result = {};

    switch (action) {
      case 'collection':
        // Handle key collection
        if (assignment.status !== 'pending') {
          return NextResponse.json({ 
            error: `Key cannot be collected. Current status: ${assignment.status}` 
          }, { status: 400 });
        }

        // Mark as collected
        await assignment.markAsCollected(session.user.id);

        // Log the transaction
        await KeyTransaction.create({
          type: 'collected',
          keyId: assignment.keyId._id,
          facultyId: assignment.facultyId._id,
          securityPersonnelId: session.user.id,
          assignmentId: assignment._id,
          details: `Key collected by ${assignment.facultyId.name}`,
          qrCodeData: JSON.stringify(parsedQRData)
        });

        result = {
          success: true,
          message: 'Key collected successfully',
          keyName: assignment.keyId.name,
          facultyName: assignment.facultyId.name,
          collectedAt: new Date()
        };
        break;

      case 'deposit':
        // Handle key deposit/return
        if (!['active', 'overdue'].includes(assignment.status)) {
          return NextResponse.json({ 
            error: `Key cannot be returned. Current status: ${assignment.status}` 
          }, { status: 400 });
        }

        // Mark as returned
        await assignment.markAsReturned(session.user.id, 'Returned via QR scan');

        // Log the transaction
        await KeyTransaction.create({
          type: 'returned',
          keyId: assignment.keyId._id,
          facultyId: assignment.facultyId._id,
          securityPersonnelId: session.user.id,
          assignmentId: assignment._id,
          details: `Key returned by ${assignment.facultyId.name}`,
          qrCodeData: JSON.stringify(parsedQRData)
        });

        result = {
          success: true,
          message: 'Key returned successfully',
          keyName: assignment.keyId.name,
          facultyName: assignment.facultyId.name,
          returnedAt: new Date(),
          wasOverdue: assignment.status === 'overdue'
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing QR scan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get scan history for security personnel
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security', 'security_head'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const date = searchParams.get('date'); // YYYY-MM-DD format

    // Build query
    let query = { securityPersonnelId: session.user.id };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.timestamp = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Fetch scan history
    const transactions = await KeyTransaction.find(query)
      .populate('keyId', 'name labName labNumber')
      .populate('facultyId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit);

    const scanHistory = transactions.map(transaction => ({
      id: transaction._id,
      type: transaction.type,
      keyName: transaction.keyId?.name || 'Unknown Key',
      labName: transaction.keyId?.labName || 'Unknown Lab',
      facultyName: transaction.facultyId?.name || 'Unknown Faculty',
      timestamp: transaction.timestamp,
      details: transaction.details,
      status: transaction.status
    }));

    return NextResponse.json({ scanHistory });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
