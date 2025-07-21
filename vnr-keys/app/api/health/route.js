import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    // Check backend health
    const backendResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });
    
    const backendData = await backendResponse.json();
    
    // Return combined health status
    return NextResponse.json({
      success: true,
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      },
      backend: {
        status: backendResponse.ok ? 'healthy' : 'unhealthy',
        response: backendData,
        responseTime: backendResponse.headers.get('x-response-time'),
      },
      overall: backendResponse.ok ? 'healthy' : 'degraded',
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      success: false,
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      },
      backend: {
        status: 'unhealthy',
        error: error.message,
      },
      overall: 'degraded',
    }, { status: 503 });
  }
}
