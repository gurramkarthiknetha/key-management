import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'MongoDB connection successful!',
      data: {
        timestamp: new Date().toISOString(),
        database: 'Connected to MongoDB Atlas'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to connect to MongoDB',
      data: {
        timestamp: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}
