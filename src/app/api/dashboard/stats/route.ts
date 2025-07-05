import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Key, User, KeyLog } from '@/models';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { ApiResponse, KeyStatus, UserRole, DashboardStats } from '@/types';

async function getDashboardStatsHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const currentUser = req.user!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build department filter based on user role
    const departmentFilter = currentUser.role === UserRole.SECURITY_INCHARGE 
      ? {} 
      : { department: currentUser.department };

    // Get key statistics
    const [
      totalKeys,
      availableKeys,
      issuedKeys,
      overdueKeys,
      totalUsers,
      activeUsers,
      todayLogs
    ] = await Promise.all([
      Key.countDocuments({ ...departmentFilter, isActive: true }),
      Key.countDocuments({ ...departmentFilter, status: KeyStatus.AVAILABLE, isActive: true }),
      Key.countDocuments({ ...departmentFilter, status: KeyStatus.ISSUED, isActive: true }),
      Key.countDocuments({ ...departmentFilter, status: KeyStatus.OVERDUE, isActive: true }),
      currentUser.role === UserRole.SECURITY_INCHARGE 
        ? User.countDocuments({ isActive: true })
        : User.countDocuments({ department: currentUser.department, isActive: true }),
      currentUser.role === UserRole.SECURITY_INCHARGE
        ? User.countDocuments({ isActive: true, lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
        : User.countDocuments({ 
            department: currentUser.department, 
            isActive: true, 
            lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
          }),
      currentUser.role === UserRole.SECURITY_INCHARGE
        ? KeyLog.countDocuments({ timestamp: { $gte: today, $lt: tomorrow } })
        : (() => {
            // For non-admin users, count logs for keys in their department
            return Key.find({ department: currentUser.department }).select('_id')
              .then(keys => {
                const keyIds = keys.map(key => key._id);
                return KeyLog.countDocuments({ 
                  keyId: { $in: keyIds }, 
                  timestamp: { $gte: today, $lt: tomorrow } 
                });
              });
          })()
    ]);

    const stats: DashboardStats = {
      totalKeys,
      availableKeys,
      issuedKeys,
      overdueKeys,
      totalUsers,
      activeUsers,
      todayTransactions: todayLogs
    };

    // Get recent activity (last 10 logs)
    let recentActivityQuery: any = { timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    
    if (currentUser.role !== UserRole.SECURITY_INCHARGE) {
      const departmentKeys = await Key.find({ department: currentUser.department }).select('_id');
      const keyIds = departmentKeys.map(key => key._id);
      recentActivityQuery.keyId = { $in: keyIds };
    }

    const recentActivity = await KeyLog.find(recentActivityQuery)
      .populate('key', 'name keyId')
      .populate('user', 'name employeeId')
      .sort({ timestamp: -1 })
      .limit(10);

    // Get keys due soon (next 24 hours)
    const soonDueKeys = await Key.find({
      ...departmentFilter,
      status: KeyStatus.ISSUED,
      dueDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })
    .populate('currentHolder', 'name employeeId')
    .sort({ dueDate: 1 })
    .limit(5);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        stats,
        recentActivity,
        soonDueKeys
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const GET = withAuth(getDashboardStatsHandler);
