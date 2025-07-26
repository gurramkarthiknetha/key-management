import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import KeyAssignment from '../../../../models/KeyAssignment';
import emailService from '../../../../lib/emailService';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['hod', 'security_head', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const department = session.user.role === 'hod' ? session.user.department : searchParams.get('department');

    // Get all faculty in the department
    const faculty = await User.find({
      role: 'faculty',
      department,
      isActive: true
    }).select('name email employeeId createdAt lastLogin');

    // Get current key assignments for each faculty
    const facultyIds = faculty.map(f => f._id);
    const assignments = await KeyAssignment.find({
      facultyId: { $in: facultyIds },
      status: { $in: ['active', 'overdue', 'pending'] }
    }).populate('keyId', 'name labName');

    // Combine faculty data with their assignments
    const facultyWithAssignments = faculty.map(f => {
      const facultyAssignments = assignments.filter(a => 
        a.facultyId.toString() === f._id.toString()
      );

      return {
        id: f._id,
        name: f.name,
        email: f.email,
        employeeId: f.employeeId,
        department: f.department,
        createdAt: f.createdAt,
        lastLogin: f.lastLogin,
        assignedKeys: facultyAssignments.map(a => ({
          keyId: a.keyId._id,
          keyName: a.keyId.name,
          labName: a.keyId.labName,
          status: a.status,
          assignedDate: a.assignedDate,
          dueDate: a.dueDate,
          isOverdue: a.status === 'overdue'
        })),
        totalAssignments: facultyAssignments.length,
        overdueCount: facultyAssignments.filter(a => a.status === 'overdue').length
      };
    });

    return NextResponse.json({ faculty: facultyWithAssignments });
  } catch (error) {
    console.error('Error fetching faculty data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['hod', 'security_head', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, facultyId, data } = await request.json();
    await connectDB();

    switch (action) {
      case 'assign-key':
        // Assign a key to faculty member
        const { keyId, accessType, dueDate, reason } = data;

        // Check if key is available
        const existingAssignment = await KeyAssignment.findOne({
          keyId,
          status: { $in: ['active', 'overdue', 'pending'] }
        });

        if (existingAssignment) {
          return NextResponse.json({ 
            error: 'Key is already assigned to another faculty member' 
          }, { status: 400 });
        }

        // Create new assignment
        const assignment = new KeyAssignment({
          keyId,
          facultyId,
          assignedBy: session.user.id,
          accessType: accessType || 'temporary',
          dueDate: new Date(dueDate),
          requestReason: reason,
          status: 'pending'
        });

        await assignment.save();

        // Send notification email to faculty
        const faculty = await User.findById(facultyId);
        const key = await Key.findById(keyId);
        
        if (faculty && key) {
          await emailService.sendKeyAssignmentNotification(faculty.email, {
            facultyName: faculty.name,
            keyName: key.name,
            labName: key.labName,
            accessType,
            assignedDate: new Date().toLocaleDateString()
          });
        }

        return NextResponse.json({ 
          message: 'Key assigned successfully',
          assignmentId: assignment._id 
        });

      case 'revoke-access':
        // Revoke key access from faculty
        const assignmentToRevoke = await KeyAssignment.findOne({
          facultyId,
          keyId: data.keyId,
          status: { $in: ['active', 'overdue', 'pending'] }
        });

        if (!assignmentToRevoke) {
          return NextResponse.json({ 
            error: 'No active assignment found for this faculty and key' 
          }, { status: 404 });
        }

        assignmentToRevoke.status = 'cancelled';
        assignmentToRevoke.returnReason = data.reason || 'Access revoked by HOD';
        await assignmentToRevoke.save();

        return NextResponse.json({ message: 'Key access revoked successfully' });

      case 'extend-deadline':
        // Extend deadline for a key assignment
        const assignmentToExtend = await KeyAssignment.findOne({
          facultyId,
          keyId: data.keyId,
          status: { $in: ['active', 'overdue'] }
        });

        if (!assignmentToExtend) {
          return NextResponse.json({ 
            error: 'No active assignment found' 
          }, { status: 404 });
        }

        const extensionHours = parseInt(data.extensionHours) || 24;
        const newDueDate = new Date(assignmentToExtend.dueDate.getTime() + (extensionHours * 60 * 60 * 1000));
        
        assignmentToExtend.dueDate = newDueDate;
        if (assignmentToExtend.status === 'overdue') {
          assignmentToExtend.status = 'active';
        }
        
        await assignmentToExtend.save();

        return NextResponse.json({ 
          message: `Deadline extended by ${extensionHours} hours`,
          newDueDate 
        });

      case 'send-reminder':
        // Send reminder to faculty about overdue keys
        const overdueAssignments = await KeyAssignment.find({
          facultyId,
          status: 'overdue'
        }).populate('keyId', 'name labName');

        if (overdueAssignments.length === 0) {
          return NextResponse.json({ 
            message: 'No overdue keys found for this faculty' 
          });
        }

        const facultyMember = await User.findById(facultyId);
        
        for (const assignment of overdueAssignments) {
          await emailService.sendOverdueReminder(facultyMember.email, {
            facultyName: facultyMember.name,
            keyName: assignment.keyId.name,
            labName: assignment.keyId.labName,
            daysOverdue: Math.ceil((new Date() - assignment.dueDate) / (1000 * 60 * 60 * 24)),
            dueDate: assignment.dueDate.toLocaleDateString()
          });

          // Update reminder count
          await assignment.sendReminder();
        }

        return NextResponse.json({ 
          message: `Reminder sent for ${overdueAssignments.length} overdue keys` 
        });

      case 'update-access-level':
        // Update faculty access level (if needed for future features)
        const facultyToUpdate = await User.findById(facultyId);
        
        if (!facultyToUpdate) {
          return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
        }

        // For now, just log the action
        console.log(`Access level update requested for ${facultyToUpdate.name}: ${data.accessLevel}`);
        
        return NextResponse.json({ 
          message: 'Access level update logged (feature coming soon)' 
        });

      case 'bulk-action':
        // Perform bulk actions on multiple faculty members
        const { facultyIds, bulkAction, bulkData } = data;
        const results = [];

        for (const fId of facultyIds) {
          try {
            switch (bulkAction) {
              case 'send-reminder':
                const overdueForFaculty = await KeyAssignment.find({
                  facultyId: fId,
                  status: 'overdue'
                }).populate('keyId', 'name labName');

                if (overdueForFaculty.length > 0) {
                  const faculty = await User.findById(fId);
                  
                  for (const assignment of overdueForFaculty) {
                    await emailService.sendOverdueReminder(faculty.email, {
                      facultyName: faculty.name,
                      keyName: assignment.keyId.name,
                      labName: assignment.keyId.labName,
                      daysOverdue: Math.ceil((new Date() - assignment.dueDate) / (1000 * 60 * 60 * 24)),
                      dueDate: assignment.dueDate.toLocaleDateString()
                    });
                  }
                }

                results.push({
                  facultyId: fId,
                  success: true,
                  message: `Reminders sent for ${overdueForFaculty.length} keys`
                });
                break;

              default:
                results.push({
                  facultyId: fId,
                  success: false,
                  message: 'Unknown bulk action'
                });
            }
          } catch (error) {
            results.push({
              facultyId: fId,
              success: false,
              message: error.message
            });
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
    console.error('Error processing faculty management request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
