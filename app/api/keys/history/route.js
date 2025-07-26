import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import KeyTransaction from '../../../../models/KeyTransaction';
import KeyAssignment from '../../../../models/KeyAssignment';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = session.user.id;
    const userRole = session.user.role;
    const filterType = searchParams.get('filter') || 'all'; // all, collected, returned, shared
    const dateRange = searchParams.get('dateRange') || 'all'; // week, month, all

    // Build date filter
    let dateFilter = {};
    if (dateRange !== 'all') {
      const now = new Date();
      const daysBack = dateRange === 'week' ? 7 : 30;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      dateFilter.timestamp = { $gte: startDate };
    }

    // Build query based on user role
    let query = { ...dateFilter };
    
    if (userRole === 'faculty') {
      query.facultyId = userId;
    } else if (userRole === 'security') {
      query.securityPersonnelId = userId;
    } else if (['hod', 'security_head', 'admin'].includes(userRole)) {
      // Can view all transactions, optionally filtered by department
      if (userRole === 'hod') {
        // HOD can see their department's transactions
        query.department = session.user.department;
      }
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Add type filter
    if (filterType !== 'all') {
      query.type = filterType;
    }

    // Fetch transactions
    const transactions = await KeyTransaction.find(query)
      .populate('keyId', 'name labName labNumber')
      .populate('facultyId', 'name email')
      .populate('securityPersonnelId', 'name')
      .sort({ timestamp: -1 })
      .limit(100);

    // Format response
    const history = transactions.map(transaction => ({
      id: transaction._id,
      type: transaction.type,
      keyName: transaction.keyId?.name || 'Unknown Key',
      labName: transaction.keyId?.labName || 'Unknown Lab',
      labNumber: transaction.keyId?.labNumber || 'N/A',
      facultyName: transaction.facultyId?.name || 'Unknown Faculty',
      securityPersonnel: transaction.securityPersonnelId?.name || 'Unknown Security',
      timestamp: transaction.timestamp,
      details: transaction.details || getDefaultDetails(transaction.type),
      status: transaction.status,
      // Additional fields for specific transaction types
      ...(transaction.type === 'shared' && {
        recipient: transaction.sharedWith?.name,
        duration: transaction.sharedDuration
      })
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching key history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();
    await connectDB();

    switch (action) {
      case 'log-transaction':
        // Create a new transaction log
        const transaction = new KeyTransaction({
          type: data.type, // 'collected', 'returned', 'shared', 'requested'
          keyId: data.keyId,
          facultyId: data.facultyId || session.user.id,
          securityPersonnelId: data.securityPersonnelId,
          timestamp: new Date(),
          details: data.details,
          status: data.status || 'completed',
          qrCodeData: data.qrCodeData,
          // Additional fields for sharing
          ...(data.type === 'shared' && {
            sharedWith: data.sharedWith,
            sharedDuration: data.sharedDuration
          })
        });

        await transaction.save();
        return NextResponse.json({ message: 'Transaction logged successfully' });

      case 'export-history':
        // Generate export data (CSV format)
        const exportQuery = {
          facultyId: session.user.id,
          timestamp: {
            $gte: new Date(data.startDate),
            $lte: new Date(data.endDate)
          }
        };

        const exportTransactions = await KeyTransaction.find(exportQuery)
          .populate('keyId', 'name labName labNumber')
          .populate('securityPersonnelId', 'name')
          .sort({ timestamp: -1 });

        const csvData = exportTransactions.map(t => ({
          Date: t.timestamp.toLocaleDateString(),
          Time: t.timestamp.toLocaleTimeString(),
          Type: t.type,
          Key: t.keyId?.name || 'Unknown',
          Lab: t.keyId?.labName || 'Unknown',
          Security: t.securityPersonnelId?.name || 'Unknown',
          Details: t.details || '',
          Status: t.status
        }));

        return NextResponse.json({ csvData });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing history request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDefaultDetails(type) {
  switch (type) {
    case 'collected':
      return 'Key collected from security desk';
    case 'returned':
      return 'Key returned to security desk';
    case 'shared':
      return 'Key access shared with another faculty';
    case 'requested':
      return 'Key access requested';
    default:
      return 'Key transaction';
  }
}
