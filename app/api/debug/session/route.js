import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import KeyAssignment from '../../../../models/KeyAssignment';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    await connectDB();

    // Get user from database
    const dbUser = await User.findOne({ email: session.user.email });
    
    // Get assignments for this user
    const assignments = await KeyAssignment.find({ 
      facultyId: dbUser?._id 
    }).populate('keyId');

    return NextResponse.json({
      session: {
        user: session.user,
        sessionUserId: session.user.id,
        sessionUserEmail: session.user.email
      },
      database: {
        user: dbUser ? {
          _id: dbUser._id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          department: dbUser.department
        } : null,
        assignmentsCount: assignments.length,
        assignments: assignments.map(a => ({
          id: a._id,
          keyName: a.keyId?.name || 'Unknown',
          status: a.status,
          facultyId: a.facultyId
        }))
      },
      debug: {
        sessionUserIdType: typeof session.user.id,
        dbUserIdType: dbUser ? typeof dbUser._id : 'null',
        idsMatch: session.user.id === dbUser?._id?.toString()
      }
    });

  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
