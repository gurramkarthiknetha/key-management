import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getUserRole } from '../../../../lib/userRoles';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get stored role
    const storedRole = getUserRole(session.user.email);

    // Debug information
    const debugInfo = {
      session: {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        department: session.user.department,
        employeeId: session.user.employeeId,
        id: session.user.id
      },
      storedRole,
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Debug user info:', debugInfo);

    return NextResponse.json({
      success: true,
      data: debugInfo
    });

  } catch (error) {
    console.error('Error getting user debug info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
