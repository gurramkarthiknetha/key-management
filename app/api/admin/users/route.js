import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import KeyAssignment from '../../../../models/KeyAssignment';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security_head', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // faculty, security, hod, security_head
    const department = searchParams.get('department');
    const status = searchParams.get('status'); // active, inactive

    // Build query
    let query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.isActive = status === 'active';

    // Fetch users
    const users = await User.find(query)
      .select('name email role department employeeId isActive createdAt lastLogin')
      .sort({ createdAt: -1 });

    // Get key assignment counts for each user
    const userIds = users.map(u => u._id);
    const assignmentCounts = await KeyAssignment.aggregate([
      {
        $match: {
          facultyId: { $in: userIds },
          status: { $in: ['active', 'overdue', 'pending'] }
        }
      },
      {
        $group: {
          _id: '$facultyId',
          totalAssignments: { $sum: 1 },
          overdueCount: {
            $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
          }
        }
      }
    ]);

    // Combine user data with assignment counts
    const usersWithStats = users.map(user => {
      const stats = assignmentCounts.find(s => s._id.toString() === user._id.toString());
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        totalAssignments: stats?.totalAssignments || 0,
        overdueCount: stats?.overdueCount || 0
      };
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security_head', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userId, data } = await request.json();
    await connectDB();

    switch (action) {
      case 'create-user':
        // Create a new user
        const { name, email, role, department, employeeId, password } = data;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return NextResponse.json({ 
            error: 'User with this email already exists' 
          }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = new User({
          name,
          email,
          role,
          department,
          employeeId,
          password: hashedPassword,
          isActive: true,
          createdBy: session.user.id
        });

        await newUser.save();

        return NextResponse.json({ 
          message: 'User created successfully',
          userId: newUser._id 
        });

      case 'update-user':
        // Update user information
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update allowed fields
        const allowedUpdates = ['name', 'role', 'department', 'employeeId', 'isActive'];
        allowedUpdates.forEach(field => {
          if (data[field] !== undefined) {
            userToUpdate[field] = data[field];
          }
        });

        await userToUpdate.save();

        return NextResponse.json({ message: 'User updated successfully' });

      case 'toggle-status':
        // Toggle user active status
        const userToToggle = await User.findById(userId);
        if (!userToToggle) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        userToToggle.isActive = !userToToggle.isActive;
        await userToToggle.save();

        return NextResponse.json({ 
          message: `User ${userToToggle.isActive ? 'activated' : 'deactivated'} successfully`,
          isActive: userToToggle.isActive
        });

      case 'reset-password':
        // Reset user password
        const userToReset = await User.findById(userId);
        if (!userToReset) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const newPassword = data.password || Math.random().toString(36).slice(-8);
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        userToReset.password = hashedNewPassword;
        userToReset.passwordResetRequired = true;
        await userToReset.save();

        return NextResponse.json({ 
          message: 'Password reset successfully',
          newPassword: data.password ? undefined : newPassword // Only return if auto-generated
        });

      case 'bulk-action':
        // Perform bulk actions on multiple users
        const { userIds, bulkAction, bulkData } = data;
        const results = [];

        for (const uId of userIds) {
          try {
            const user = await User.findById(uId);
            if (!user) {
              results.push({ userId: uId, success: false, message: 'User not found' });
              continue;
            }

            switch (bulkAction) {
              case 'activate':
                user.isActive = true;
                await user.save();
                results.push({ userId: uId, success: true, message: 'User activated' });
                break;

              case 'deactivate':
                user.isActive = false;
                await user.save();
                results.push({ userId: uId, success: true, message: 'User deactivated' });
                break;

              case 'update-department':
                user.department = bulkData.department;
                await user.save();
                results.push({ userId: uId, success: true, message: 'Department updated' });
                break;

              default:
                results.push({ userId: uId, success: false, message: 'Unknown bulk action' });
            }
          } catch (error) {
            results.push({ userId: uId, success: false, message: error.message });
          }
        }

        return NextResponse.json({ 
          message: 'Bulk action completed',
          results 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing user management request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security_head', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    await connectDB();

    // Check if user has active key assignments
    const activeAssignments = await KeyAssignment.countDocuments({
      facultyId: userId,
      status: { $in: ['active', 'overdue', 'pending'] }
    });

    if (activeAssignments > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete user with active key assignments' 
      }, { status: 400 });
    }

    // Soft delete - mark as inactive instead of actual deletion
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.isActive = false;
    user.deletedAt = new Date();
    user.deletedBy = session.user.id;
    await user.save();

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
