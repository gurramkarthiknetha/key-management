import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import KeySharing from '../../../../models/KeySharing';
import KeyAssignment from '../../../../models/KeyAssignment';
import KeyTransaction from '../../../../models/KeyTransaction';
import User from '../../../../models/User';
import emailService from '../../../../lib/emailService';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'faculty-list', 'my-shares', 'received-shares'
    const userId = session.user.id;

    switch (type) {
      case 'faculty-list':
        // Get list of faculty members for sharing
        const faculty = await User.find({
          role: 'faculty',
          department: session.user.department,
          _id: { $ne: userId }, // Exclude current user
          isActive: true
        }).select('name email department');

        const facultyList = faculty.map(f => ({
          id: f._id,
          name: f.name,
          email: f.email,
          department: f.department
        }));

        return NextResponse.json({ faculty: facultyList });

      case 'my-shares':
        // Get keys shared by current user
        const myShares = await KeySharing.find({
          sharedBy: userId,
          status: 'active'
        })
        .populate('keyId', 'name labName labNumber')
        .populate('sharedWith', 'name email');

        const shares = myShares.map(share => ({
          id: share._id,
          keyName: share.keyId.name,
          labName: share.keyId.labName,
          recipient: share.sharedWith.name,
          recipientEmail: share.sharedWith.email,
          sharedDate: share.sharedDate,
          expiresAt: share.expiresAt,
          duration: share.duration,
          message: share.message
        }));

        return NextResponse.json({ shares });

      case 'received-shares':
        // Get keys shared with current user
        const receivedShares = await KeySharing.find({
          sharedWith: userId,
          status: 'active'
        })
        .populate('keyId', 'name labName labNumber')
        .populate('sharedBy', 'name email');

        const received = receivedShares.map(share => ({
          id: share._id,
          keyName: share.keyId.name,
          labName: share.keyId.labName,
          sharedBy: share.sharedBy.name,
          sharedByEmail: share.sharedBy.email,
          sharedDate: share.sharedDate,
          expiresAt: share.expiresAt,
          duration: share.duration,
          message: share.message
        }));

        return NextResponse.json({ received });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching sharing data:', error);
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
      case 'share-key':
        // Verify the user has access to the key
        const assignment = await KeyAssignment.findOne({
          keyId: data.keyId,
          facultyId: session.user.id,
          status: 'active'
        });

        if (!assignment) {
          return NextResponse.json({ error: 'You do not have access to this key' }, { status: 403 });
        }

        // Resolve recipient ID - if it's an employee ID, find the actual user
        let recipientUserId = data.recipientId;

        // Check if recipientId is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(data.recipientId)) {
          // It's likely an employee ID, find the user by employeeId
          const recipientUser = await User.findOne({ employeeId: data.recipientId });
          if (!recipientUser) {
            return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
          }
          recipientUserId = recipientUser._id;
        }

        // Check if key is already shared with this person
        const existingShare = await KeySharing.findOne({
          keyId: data.keyId,
          sharedBy: session.user.id,
          sharedWith: recipientUserId,
          status: 'active'
        });

        if (existingShare) {
          return NextResponse.json({ error: 'Key is already shared with this person' }, { status: 400 });
        }

        // Create sharing record
        const durationHours = parseInt(data.duration);
        const expiresAt = new Date(Date.now() + (durationHours * 60 * 60 * 1000));

        const sharing = new KeySharing({
          keyId: data.keyId,
          sharedBy: session.user.id,
          sharedWith: recipientUserId,
          sharedDate: new Date(),
          expiresAt,
          duration: `${durationHours} hours`,
          message: data.message,
          status: 'active'
        });

        await sharing.save();

        // Log the transaction
        const transaction = new KeyTransaction({
          type: 'shared',
          keyId: data.keyId,
          facultyId: session.user.id,
          timestamp: new Date(),
          details: `Key shared with ${data.recipientName} for ${durationHours} hours`,
          status: 'completed',
          sharedWith: recipientUserId,
          sharedDuration: `${durationHours} hours`
        });

        await transaction.save();

        // Send notification email to recipient
        const recipient = await User.findById(recipientUserId);
        if (recipient) {
          await emailService.sendKeyAssignmentNotification(recipient.email, {
            facultyName: recipient.name,
            keyName: data.keyName,
            labName: data.labName,
            accessType: 'shared',
            assignedDate: new Date().toLocaleDateString()
          });
        }

        return NextResponse.json({ 
          message: 'Key shared successfully',
          sharingId: sharing._id 
        });

      case 'revoke-share':
        // Revoke a key sharing
        const shareToRevoke = await KeySharing.findOne({
          _id: data.sharingId,
          sharedBy: session.user.id,
          status: 'active'
        });

        if (!shareToRevoke) {
          return NextResponse.json({ error: 'Sharing record not found' }, { status: 404 });
        }

        shareToRevoke.status = 'revoked';
        shareToRevoke.revokedAt = new Date();
        await shareToRevoke.save();

        // Log the revocation
        const revokeTransaction = new KeyTransaction({
          type: 'share_revoked',
          keyId: shareToRevoke.keyId,
          facultyId: session.user.id,
          timestamp: new Date(),
          details: 'Key sharing access revoked',
          status: 'completed'
        });

        await revokeTransaction.save();

        return NextResponse.json({ message: 'Key sharing revoked successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing sharing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sharingId = searchParams.get('id');

    await connectDB();

    // Find and delete the sharing record
    const sharing = await KeySharing.findOne({
      _id: sharingId,
      $or: [
        { sharedBy: session.user.id },
        { sharedWith: session.user.id }
      ]
    });

    if (!sharing) {
      return NextResponse.json({ error: 'Sharing record not found' }, { status: 404 });
    }

    sharing.status = 'cancelled';
    sharing.cancelledAt = new Date();
    await sharing.save();

    return NextResponse.json({ message: 'Sharing cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling sharing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
