import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '../../../lib/mongodb';
import Key from '../../../models/Key';
import KeyAssignment from '../../../models/KeyAssignment';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'my-keys', 'dept-keys', 'all'
    const userId = session.user.id;
    const userRole = session.user.role;
    const userDepartment = session.user.department;

    let keys = [];

    switch (type) {
      case 'my-keys':
        // Get keys assigned to the current user
        if (!userId) {
          return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 });
        }

        // Validate that userId is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          console.error('Invalid user ID format:', userId);
          return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
        }

        const assignments = await KeyAssignment.find({
          facultyId: userId,
          status: { $in: ['active', 'overdue'] }
        }).populate('keyId');
        
        keys = assignments.map(assignment => ({
          id: assignment.keyId._id,
          keyName: assignment.keyId.name,
          labName: assignment.keyId.labName,
          labNumber: assignment.keyId.labNumber,
          accessType: assignment.accessType,
          status: assignment.status,
          assignedDate: assignment.assignedDate,
          dueDate: assignment.dueDate,
          lastUsed: assignment.lastUsed,
          isOverdue: assignment.status === 'overdue',
          qrCode: `QR_${assignment._id}_${Date.now()}`
        }));
        break;

      case 'dept-keys':
        // Get all keys in the user's department
        const deptKeys = await Key.find({ 
          department: userDepartment,
          isActive: true 
        });
        
        // Get current assignments for these keys
        const keyIds = deptKeys.map(key => key._id);
        const currentAssignments = await KeyAssignment.find({
          keyId: { $in: keyIds },
          status: { $in: ['active', 'overdue'] }
        }).populate('facultyId', 'name');

        keys = deptKeys.map(key => {
          const assignment = currentAssignments.find(a => a.keyId.toString() === key._id.toString());
          return {
            id: key._id,
            keyName: key.name,
            labName: key.labName,
            labNumber: key.labNumber,
            status: assignment ? 'with_faculty' : 'available',
            currentHolder: assignment ? assignment.facultyId.name : null,
            department: key.department
          };
        });
        break;

      case 'all':
        // For HOD and Security Head - get all keys
        if (!['hod', 'security_head', 'admin'].includes(userRole)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }
        
        const allKeys = await Key.find({ isActive: true });
        const allAssignments = await KeyAssignment.find({
          status: { $in: ['active', 'overdue'] }
        }).populate('facultyId', 'name');

        keys = allKeys.map(key => {
          const assignment = allAssignments.find(a => a.keyId.toString() === key._id.toString());
          return {
            id: key._id,
            keyName: key.name,
            labName: key.labName,
            labNumber: key.labNumber,
            department: key.department,
            status: assignment ? assignment.status : 'available',
            currentHolder: assignment ? assignment.facultyId.name : null,
            assignedDate: assignment ? assignment.assignedDate : null,
            dueDate: assignment ? assignment.dueDate : null
          };
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, keyId, data } = await request.json();
    await connectDB();

    switch (action) {
      case 'request-key':
        // Create a new key request
        const newAssignment = new KeyAssignment({
          keyId,
          facultyId: session.user.id,
          accessType: data.accessType || 'temporary',
          requestedDate: new Date(),
          status: 'pending',
          requestReason: data.reason
        });
        
        await newAssignment.save();
        return NextResponse.json({ message: 'Key request submitted successfully' });

      case 'generate-qr':
        // Generate QR code for key collection/deposit
        const assignment = await KeyAssignment.findOne({
          keyId,
          facultyId: session.user.id,
          status: { $in: ['active', 'pending'] }
        });

        if (!assignment) {
          return NextResponse.json({ error: 'Key assignment not found' }, { status: 404 });
        }

        const qrData = {
          assignmentId: assignment._id,
          keyId,
          facultyId: session.user.id,
          action: data.action, // 'collection' or 'deposit'
          timestamp: Date.now(),
          expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
        };

        return NextResponse.json({ qrData });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing key request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
