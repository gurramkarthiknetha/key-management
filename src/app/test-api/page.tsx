/**
 * API Testing Page
 * Test the integration between Next.js frontend and Express backend
 */

'use client';

import React from 'react';
import ApiIntegrationExample from '@/components/examples/ApiIntegrationExample';

export default function TestApiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            API Integration Test
          </h1>
          <p className="text-gray-600 mb-4">
            This page demonstrates the integration between the Next.js frontend and Express.js backend.
            Make sure the Express server is running on port 5000.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              🚀 Getting Started
            </h2>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Start the Express server: <code className="bg-blue-100 px-2 py-1 rounded">cd server && npm run dev</code></li>
              <li>Ensure the server is running on <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:5000</code></li>
              <li>Login with test credentials: <code className="bg-blue-100 px-2 py-1 rounded">test@example.com / password123</code></li>
              <li>Test the API endpoints using the interface below</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Available Test Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-700">
              <div>
                <strong>Mock Test User:</strong><br />
                Email: <code className="bg-green-100 px-2 py-1 rounded">test@example.com</code><br />
                Password: <code className="bg-green-100 px-2 py-1 rounded">password123</code>
              </div>
              <div>
                <strong>Admin User (from seed data):</strong><br />
                Email: <code className="bg-green-100 px-2 py-1 rounded">admin@university.edu</code><br />
                Password: <code className="bg-green-100 px-2 py-1 rounded">admin123</code>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              🔧 API Endpoints Being Tested
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-700 text-sm">
              <div>
                <strong>Authentication:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>POST /api/auth/login</li>
                  <li>POST /api/auth/register</li>
                  <li>GET /api/auth/me</li>
                </ul>
              </div>
              <div>
                <strong>Data Management:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>GET /api/keys</li>
                  <li>GET /api/users</li>
                  <li>GET /api/departments</li>
                  <li>GET /api/notifications</li>
                </ul>
              </div>
              <div>
                <strong>Key Operations:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>POST /api/keys (create)</li>
                  <li>POST /api/keys/checkout</li>
                  <li>POST /api/keys/checkin</li>
                </ul>
              </div>
              <div>
                <strong>Dashboard:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>GET /api/dashboard/stats</li>
                  <li>GET /health</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API Integration Example Component */}
        <ApiIntegrationExample />

        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📚 Migration Information
          </h2>
          <p className="text-gray-600 mb-4">
            This page demonstrates how to migrate from Next.js API routes to the Express.js backend.
            See the <code className="bg-gray-100 px-2 py-1 rounded">MIGRATION_GUIDE.md</code> for detailed instructions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">API Client</h3>
              <p className="text-blue-700 text-sm">
                Direct communication with Express backend using <code>@/lib/api-client</code>
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">React Hooks</h3>
              <p className="text-green-700 text-sm">
                Easy React integration with loading states using <code>@/hooks/useApi</code>
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Service Layer</h3>
              <p className="text-purple-700 text-sm">
                Organized service functions with caching using <code>@/lib/api-service</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
