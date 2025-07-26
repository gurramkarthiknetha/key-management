import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import KeyAssignment from '../../../../models/KeyAssignment';
import KeyTransaction from '../../../../models/KeyTransaction';
import Key from '../../../../models/Key';
import User from '../../../../models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['hod', 'security_head', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview'; // overview, usage, faculty, reports
    const department = session.user.role === 'hod' ? session.user.department : searchParams.get('department');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let result = {};

    switch (type) {
      case 'overview':
        // Get department overview statistics
        const totalKeys = await Key.countDocuments({ 
          department, 
          isActive: true 
        });

        const keysInUse = await KeyAssignment.countDocuments({
          status: { $in: ['active', 'overdue'] }
        });

        const overdueKeys = await KeyAssignment.countDocuments({
          status: 'overdue'
        });

        const totalUsers = await User.countDocuments({
          department,
          role: 'faculty',
          isActive: true
        });

        // Get today's transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTransactions = await KeyTransaction.countDocuments({
          timestamp: { $gte: today, $lt: tomorrow }
        });

        // Get this week's transactions
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const weeklyTransactions = await KeyTransaction.countDocuments({
          timestamp: { $gte: weekStart }
        });

        result = {
          totalKeys,
          keysInUse,
          overdueKeys,
          availableKeys: totalKeys - keysInUse,
          totalUsers,
          todayTransactions,
          weeklyTransactions
        };
        break;

      case 'usage':
        // Get key usage patterns
        const dateFilter = {};
        if (startDate && endDate) {
          dateFilter.timestamp = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        } else {
          // Default to last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          dateFilter.timestamp = { $gte: thirtyDaysAgo };
        }

        const usageStats = await KeyTransaction.aggregate([
          { $match: dateFilter },
          {
            $lookup: {
              from: 'keys',
              localField: 'keyId',
              foreignField: '_id',
              as: 'key'
            }
          },
          {
            $match: {
              'key.department': department
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                type: "$type"
              },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: "$_id.date",
              activities: {
                $push: {
                  type: "$_id.type",
                  count: "$count"
                }
              },
              totalCount: { $sum: "$count" }
            }
          },
          { $sort: { _id: 1 } }
        ]);

        // Get most used keys
        const mostUsedKeys = await KeyTransaction.aggregate([
          { $match: dateFilter },
          {
            $lookup: {
              from: 'keys',
              localField: 'keyId',
              foreignField: '_id',
              as: 'key'
            }
          },
          {
            $match: {
              'key.department': department
            }
          },
          {
            $group: {
              _id: "$keyId",
              keyName: { $first: "$key.name" },
              labName: { $first: "$key.labName" },
              usageCount: { $sum: 1 }
            }
          },
          { $sort: { usageCount: -1 } },
          { $limit: 10 }
        ]);

        result = {
          usageStats,
          mostUsedKeys
        };
        break;

      case 'faculty':
        // Get faculty usage statistics
        const facultyStats = await KeyTransaction.aggregate([
          {
            $lookup: {
              from: 'keys',
              localField: 'keyId',
              foreignField: '_id',
              as: 'key'
            }
          },
          {
            $match: {
              'key.department': department
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'facultyId',
              foreignField: '_id',
              as: 'faculty'
            }
          },
          {
            $group: {
              _id: "$facultyId",
              facultyName: { $first: "$faculty.name" },
              facultyEmail: { $first: "$faculty.email" },
              totalTransactions: { $sum: 1 },
              keysUsed: { $addToSet: "$keyId" },
              lastActivity: { $max: "$timestamp" }
            }
          },
          {
            $project: {
              facultyName: 1,
              facultyEmail: 1,
              totalTransactions: 1,
              uniqueKeysUsed: { $size: "$keysUsed" },
              lastActivity: 1
            }
          },
          { $sort: { totalTransactions: -1 } }
        ]);

        // Get current key assignments by faculty
        const currentAssignments = await KeyAssignment.find({
          status: { $in: ['active', 'overdue'] }
        })
        .populate('keyId', 'name labName department')
        .populate('facultyId', 'name email')
        .sort({ assignedDate: -1 });

        const assignmentsByFaculty = currentAssignments
          .filter(assignment => assignment.keyId.department === department)
          .reduce((acc, assignment) => {
            const facultyId = assignment.facultyId._id.toString();
            if (!acc[facultyId]) {
              acc[facultyId] = {
                facultyName: assignment.facultyId.name,
                facultyEmail: assignment.facultyId.email,
                assignments: []
              };
            }
            acc[facultyId].assignments.push({
              keyName: assignment.keyId.name,
              labName: assignment.keyId.labName,
              assignedDate: assignment.assignedDate,
              dueDate: assignment.dueDate,
              status: assignment.status,
              isOverdue: assignment.status === 'overdue'
            });
            return acc;
          }, {});

        result = {
          facultyStats,
          currentAssignments: Object.values(assignmentsByFaculty)
        };
        break;

      case 'reports':
        // Generate report data
        const reportPeriod = {
          start: startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: endDate ? new Date(endDate) : new Date()
        };

        const reportData = await KeyTransaction.aggregate([
          {
            $match: {
              timestamp: {
                $gte: reportPeriod.start,
                $lte: reportPeriod.end
              }
            }
          },
          {
            $lookup: {
              from: 'keys',
              localField: 'keyId',
              foreignField: '_id',
              as: 'key'
            }
          },
          {
            $match: {
              'key.department': department
            }
          },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
              uniqueKeys: { $addToSet: "$keyId" },
              uniqueFaculty: { $addToSet: "$facultyId" }
            }
          },
          {
            $project: {
              type: "$_id",
              count: 1,
              uniqueKeysCount: { $size: "$uniqueKeys" },
              uniqueFacultyCount: { $size: "$uniqueFaculty" }
            }
          }
        ]);

        result = {
          reportPeriod,
          summary: reportData,
          totalTransactions: reportData.reduce((sum, item) => sum + item.count, 0)
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching HOD analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
