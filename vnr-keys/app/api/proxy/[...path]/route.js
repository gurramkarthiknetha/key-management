import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Generic proxy handler for all backend API routes
async function handleRequest(request, { params }) {
  try {
    const { path } = params;
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    // Construct the backend URL
    const backendPath = Array.isArray(path) ? path.join('/') : path;
    const url = `${BACKEND_URL}/api/${backendPath}`;
    
    // Get request body if present
    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (error) {
        // Body might be empty or invalid
        body = null;
      }
    }
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Forward request to backend
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
    });
    
    const data = await response.json();
    
    // Handle token expiration
    if (response.status === 401 && token) {
      cookieStore.delete('token');
      cookieStore.delete('user');
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export handlers for all HTTP methods
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
