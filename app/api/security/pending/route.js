import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import KeyAssignment from '../../../../models/KeyAssignment';
import emailService from '../../../../lib/emailService';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security', 'security_head'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, overdue, pending

    let query = {};
    
    switch (type) {
      case 'overdue':
        query = {
          status: 'overdue'
        };
        break;
      case 'pending':
        query = {
          status: 'pending'
        };
        break;
      case 'active':
        query = {
          status: 'active',
          dueDate: { $gte: new Date() }
        };
        break;
      default:
        query = {
          status: { $in: ['pending', 'active', 'overdue'] }
        };
    }

    // Fetch pending handovers
    const assignments = await KeyAssignment.find(query)
      .populate('keyId', 'name labName labNumber')
      .populate('facultyId', 'name email')
      .sort({ dueDate: 1 });

    const pendingHandovers = assignments.map(assignment => {
      const now = new Date();
      const isOverdue = assignment.dueDate < now;
      const daysOverdue = isOverdue ? 
        Math.ceil((now - assignment.dueDate) / (1000 * 60 * 60 * 24)) : 0;

      return {
        id: assignment._id,
        keyName: assignment.keyId.name,
        labName: assignment.keyId.labName,
        labNumber: assignment.keyId.labNumber,
        facultyName: assignment.facultyId.name,
        facultyEmail: assignment.facultyId.email,
        assignedDate: assignment.assignedDate,
        dueDate: assignment.dueDate,
        status: assignment.status,
        isOverdue,
        daysOverdue,
        accessType: assignment.accessType,
        lastReminderSent: assignment.lastReminderSent,
        remindersSent: assignment.remindersSent
      };
    });

    return NextResponse.json({ pendingHandovers });
  } catch (error) {
    console.error('Error fetching pending handovers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['security', 'security_head'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, assignmentId, data } = await request.json();
    await connectDB();

    switch (action) {
      case 'send-reminder':
        const assignment = await KeyAssignment.findById(assignmentId)
          .populate('keyId', 'name labName labNumber')
          .populate('facultyId', 'name email');

        if (!assignment) {
          return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        }

        // Send email reminder
        const emailSent = await emailService.sendOverdueReminder(
          assignment.facultyId.email,
          {
            facultyName: assignment.facultyId.name,
            keyName: assignment.keyId.name,
            labName: assignment.keyId.labName,
            daysOverdue: Math.ceil((new Date() - assignment.dueDate) / (1000 * 60 * 60 * 24)),
            dueDate: assignment.dueDate.toLocaleDateString()
          }
        );

        if (emailSent) {
          // Update reminder count
          await assignment.sendReminder();
          
          return NextResponse.json({ 
            message: 'Reminder sent successfully',
            emailSent: true
          });
        } else {
          return NextResponse.json({ 
            error: 'Failed to send email reminder',
            emailSent: false
          }, { status: 500 });
        }

      case 'mark-collected':
        const collectedAssignment = await KeyAssignment.findById(assignmentId);
        
        if (!collectedAssignment) {
          return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        }

        if (collectedAssignment.status !== 'pending') {
          return NextResponse.json({ 
            error: 'Key is not in pending status' 
          }, { status: 400 });
        }

        // Mark as collected
        await collectedAssignment.markAsCollected(session.user.id);

        return NextResponse.json({ 
          message: 'Key marked as collected successfully' 
        });

      case 'extend-deadline':
        const extendAssignment = await KeyAssignment.findById(assignmentId);
        
        if (!extendAssignment) {
          return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        }

        const extensionHours = parseInt(data.extensionHours) || 24;
        const newDueDate = new Date(extendAssignment.dueDate.getTime() + (extensionHours * 60 * 60 * 1000));
        
        extendAssignment.dueDate = newDueDate;
        if (extendAssignment.status === 'overdue') {
          extendAssignment.status = 'active';
        }
        
        await extendAssignment.save();

        return NextResponse.json({ 
          message: `Deadline extended by ${extensionHours} hours`,
          newDueDate
        });

      case 'bulk-reminder':
        // Send reminders to all overdue keys
        const overdueAssignments = await KeyAssignment.find({
          status: 'overdue'
        })
        .populate('keyId', 'name labName labNumber')
        .populate('facultyId', 'name email');

        const reminderResults = [];
        
        for (const assignment of overdueAssignments) {
          const emailSent = await emailService.sendOverdueReminder(
            assignment.facultyId.email,
            {
              facultyName: assignment.facultyId.name,
              keyName: assignment.keyId.name,
              labName: assignment.keyId.labName,
              daysOverdue: Math.ceil((new Date() - assignment.dueDate) / (1000 * 60 * 60 * 24)),
              dueDate: assignment.dueDate.toLocaleDateString()
            }
          );

          if (emailSent) {
            await assignment.sendReminder();
          }

          reminderResults.push({
            assignmentId: assignment._id,
            facultyName: assignment.facultyId.name,
            keyName: assignment.keyId.name,
            emailSent
          });
        }

        const successCount = reminderResults.filter(r => r.emailSent).length;
        
        return NextResponse.json({ 
          message: `Sent ${successCount} out of ${reminderResults.length} reminders`,
          results: reminderResults
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing pending handover action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
