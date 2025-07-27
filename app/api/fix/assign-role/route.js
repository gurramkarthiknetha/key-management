import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { setUserRole, isValidRole } from '../../../../lib/userRoles';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { role } = await request.json();

    // Validate the role
    if (!role || !isValidRole(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Valid roles are: faculty, hod, security, security_head, admin' 
      }, { status: 400 });
    }

    // Auto-assign role based on email if no role provided
    let assignedRole = role;
    if (!assignedRole) {
      const email = session.user.email;
      
      // Default role assignment logic
      if (email.includes('hod.') && email.endsWith('@vnrvjiet.in')) {
        assignedRole = 'hod';
      } else if (email.includes('security') && email.endsWith('@vnrvjiet.in')) {
        assignedRole = 'security';
      } else if (email.endsWith('@vnrvjiet.in')) {
        assignedRole = 'faculty';
      } else {
        return NextResponse.json({ 
          error: 'Cannot auto-assign role for this email domain' 
        }, { status: 400 });
      }
    }

    // Store the role
    setUserRole(session.user.email, assignedRole, 'self-assignment');

    console.log(`✅ Role assigned for ${session.user.email}: ${assignedRole}`);

    return NextResponse.json({
      success: true,
      message: 'Role assigned successfully',
      data: { 
        email: session.user.email, 
        role: assignedRole 
      }
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
