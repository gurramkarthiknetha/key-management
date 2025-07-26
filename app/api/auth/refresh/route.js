import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This endpoint is used to trigger a session refresh
    // The actual refresh happens in the JWT callback when trigger === 'update'
    console.log(`🔄 Session refresh requested for ${session.user.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Session refresh triggered',
      user: session.user
    });

  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
