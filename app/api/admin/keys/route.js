import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import Key from '../../../../models/Key';
import KeyAssignment from '../../../../models/KeyAssignment';
import KeyTransaction from '../../../../models/KeyTransaction';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security_head', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status'); // available, assigned, maintenance, lost
    const includeStats = searchParams.get('includeStats') === 'true';

    // Build query
    let query = { isActive: true };
    if (department) query.department = department;
    if (status) query.currentStatus = status;

    // Fetch keys
    const keys = await Key.find(query).sort({ createdAt: -1 });

    // Get current assignments for each key
    const keyIds = keys.map(k => k._id);
    const assignments = await KeyAssignment.find({
      keyId: { $in: keyIds },
      status: { $in: ['active', 'overdue', 'pending'] }
    }).populate('facultyId', 'name email');

    // Get usage statistics if requested
    let usageStats = {};
    if (includeStats) {
      const stats = await KeyTransaction.aggregate([
        {
          $match: {
            keyId: { $in: keyIds },
            timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
          }
        },
        {
          $group: {
            _id: '$keyId',
            totalTransactions: { $sum: 1 },
            lastUsed: { $max: '$timestamp' }
          }
        }
      ]);

      usageStats = stats.reduce((acc, stat) => {
        acc[stat._id.toString()] = {
          totalTransactions: stat.totalTransactions,
          lastUsed: stat.lastUsed
        };
        return acc;
      }, {});
    }

    // Combine key data with assignments and stats
    const keysWithDetails = keys.map(key => {
      const assignment = assignments.find(a => a.keyId.toString() === key._id.toString());
      const stats = usageStats[key._id.toString()] || {};

      return {
        id: key._id,
        name: key.name,
        labName: key.labName,
        labNumber: key.labNumber,
        department: key.department,
        keyType: key.keyType,
        location: key.location,
        currentStatus: key.currentStatus,
        requiresApproval: key.requiresApproval,
        maxAssignmentDuration: key.maxAssignmentDuration,
        totalAssignments: key.totalAssignments,
        createdAt: key.createdAt,
        // Assignment details
        currentAssignment: assignment ? {
          facultyName: assignment.facultyId.name,
          facultyEmail: assignment.facultyId.email,
          assignedDate: assignment.assignedDate,
          dueDate: assignment.dueDate,
          status: assignment.status,
          isOverdue: assignment.status === 'overdue'
        } : null,
        // Usage statistics
        ...stats
      };
    });

    return NextResponse.json({ keys: keysWithDetails });
  } catch (error) {
    console.error('Error fetching keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security_head', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, keyId, data } = await request.json();
    await connectDB();

    switch (action) {
      case 'create-key':
        // Create a new key
        const { name, labName, labNumber, department, keyType, location, requiresApproval, maxAssignmentDuration } = data;

        // Check if key already exists
        const existingKey = await Key.findOne({ labNumber, department });
        if (existingKey) {
          return NextResponse.json({ 
            error: 'Key with this lab number already exists in the department' 
          }, { status: 400 });
        }

        // Create key
        const newKey = new Key({
          name,
          labName,
          labNumber,
          department,
          keyType: keyType || 'lab',
          location: location || {},
          requiresApproval: requiresApproval || false,
          maxAssignmentDuration: maxAssignmentDuration || 24,
          createdBy: session.user.id,
          currentStatus: 'available'
        });

        await newKey.save();

        return NextResponse.json({ 
          message: 'Key created successfully',
          keyId: newKey._id 
        });

      case 'update-key':
        // Update key information
        const keyToUpdate = await Key.findById(keyId);
        if (!keyToUpdate) {
          return NextResponse.json({ error: 'Key not found' }, { status: 404 });
        }

        // Update allowed fields
        const allowedUpdates = ['name', 'labName', 'labNumber', 'department', 'keyType', 'location', 'requiresApproval', 'maxAssignmentDuration'];
        allowedUpdates.forEach(field => {
          if (data[field] !== undefined) {
            keyToUpdate[field] = data[field];
          }
        });

        keyToUpdate.updatedAt = new Date();
        await keyToUpdate.save();

        return NextResponse.json({ message: 'Key updated successfully' });

      case 'change-status':
        // Change key status (available, maintenance, lost)
        const keyToChangeStatus = await Key.findById(keyId);
        if (!keyToChangeStatus) {
          return NextResponse.json({ error: 'Key not found' }, { status: 404 });
        }

        // Check if key has active assignments
        if (data.status === 'maintenance' || data.status === 'lost') {
          const activeAssignment = await KeyAssignment.findOne({
            keyId,
            status: { $in: ['active', 'overdue', 'pending'] }
          });

          if (activeAssignment) {
            return NextResponse.json({ 
              error: 'Cannot change status of key with active assignments' 
            }, { status: 400 });
          }
        }

        keyToChangeStatus.currentStatus = data.status;
        await keyToChangeStatus.save();

        // Log the status change
        await KeyTransaction.create({
          type: 'status_change',
          keyId,
          facultyId: session.user.id,
          details: `Key status changed to ${data.status}`,
          metadata: { previousStatus: keyToChangeStatus.currentStatus, reason: data.reason }
        });

        return NextResponse.json({ message: 'Key status updated successfully' });

      case 'force-return':
        // Force return a key (for overdue situations)
        const assignment = await KeyAssignment.findOne({
          keyId,
          status: { $in: ['active', 'overdue'] }
        });

        if (!assignment) {
          return NextResponse.json({ 
            error: 'No active assignment found for this key' 
          }, { status: 404 });
        }

        // Mark as returned
        await assignment.markAsReturned(session.user.id, data.reason || 'Force returned by admin');

        // Log the transaction
        await KeyTransaction.create({
          type: 'force_returned',
          keyId,
          facultyId: assignment.facultyId,
          securityPersonnelId: session.user.id,
          assignmentId: assignment._id,
          details: `Key force returned by admin: ${data.reason || 'No reason provided'}`
        });

        return NextResponse.json({ message: 'Key force returned successfully' });

      case 'bulk-action':
        // Perform bulk actions on multiple keys
        const { keyIds, bulkAction, bulkData } = data;
        const results = [];

        for (const kId of keyIds) {
          try {
            const key = await Key.findById(kId);
            if (!key) {
              results.push({ keyId: kId, success: false, message: 'Key not found' });
              continue;
            }

            switch (bulkAction) {
              case 'change-department':
                key.department = bulkData.department;
                await key.save();
                results.push({ keyId: kId, success: true, message: 'Department updated' });
                break;

              case 'set-maintenance':
                // Check for active assignments
                const activeAssignment = await KeyAssignment.findOne({
                  keyId: kId,
                  status: { $in: ['active', 'overdue', 'pending'] }
                });

                if (activeAssignment) {
                  results.push({ keyId: kId, success: false, message: 'Has active assignment' });
                } else {
                  key.currentStatus = 'maintenance';
                  await key.save();
                  results.push({ keyId: kId, success: true, message: 'Set to maintenance' });
                }
                break;

              case 'set-available':
                key.currentStatus = 'available';
                await key.save();
                results.push({ keyId: kId, success: true, message: 'Set to available' });
                break;

              default:
                results.push({ keyId: kId, success: false, message: 'Unknown bulk action' });
            }
          } catch (error) {
            results.push({ keyId: kId, success: false, message: error.message });
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
    console.error('Error processing key management request:', error);
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
    const keyId = searchParams.get('id');

    await connectDB();

    // Check if key has any assignments (active or historical)
    const assignmentCount = await KeyAssignment.countDocuments({ keyId });
    if (assignmentCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete key with assignment history. Set to inactive instead.' 
      }, { status: 400 });
    }

    // Soft delete - mark as inactive
    const key = await Key.findById(keyId);
    if (!key) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    key.isActive = false;
    key.deletedAt = new Date();
    key.deletedBy = session.user.id;
    await key.save();

    return NextResponse.json({ message: 'Key deleted successfully' });
  } catch (error) {
    console.error('Error deleting key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
