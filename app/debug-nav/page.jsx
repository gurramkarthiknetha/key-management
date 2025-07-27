'use client';

import { useSession } from 'next-auth/react';
import { useAuth } from '../../lib/useAuth';
import { useRouter } from 'next/navigation';

export default function DebugNavPage() {
  const { data: session, status } = useSession();
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleDirectNavigation = (path) => {
    console.log(`🎯 Direct navigation to: ${path}`);
    window.location.href = path;
  };

  const handleRouterNavigation = (path) => {
    console.log(`🎯 Router navigation to: ${path}`);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Navigation Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Session Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>Role:</strong> {user?.role || 'Not assigned'}</p>
            <p><strong>Department:</strong> {user?.department || 'Not assigned'}</p>
            <p><strong>Session ID:</strong> {session?.user?.id || 'Not available'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Direct Navigation (window.location)</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleDirectNavigation('/faculty')}
              className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Faculty Dashboard (Direct)
            </button>
            <button
              onClick={() => handleDirectNavigation('/hod')}
              className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to HOD Dashboard (Direct)
            </button>
            <button
              onClick={() => handleDirectNavigation('/security')}
              className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Go to Security Dashboard (Direct)
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Router Navigation (Next.js router)</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleRouterNavigation('/faculty')}
              className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Faculty Dashboard (Router)
            </button>
            <button
              onClick={() => handleRouterNavigation('/hod')}
              className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Go to HOD Dashboard (Router)
            </button>
            <button
              onClick={() => handleRouterNavigation('/security')}
              className="w-full p-3 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Go to Security Dashboard (Router)
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full p-3 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
