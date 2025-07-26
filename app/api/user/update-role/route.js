import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { userRoles, setUserRole, getUserRole, isValidRole } from '../../../../lib/userRoles';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await request.json();

    // Validate the role
    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Ensure user can only update their own role (or admin can update any)
    if (session.user.email !== email && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Store the role using shared function
    setUserRole(email, role, session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      data: { email, role }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Get the stored role using shared function
    const role = getUserRole(email);

    if (!role) {
      return NextResponse.json({ error: 'User role not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { email, role }
    });

  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
