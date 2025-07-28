"use client";

import { useState, useEffect } from 'react';

export default function ConnectionTest() {
  const [status, setStatus] = useState('testing');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setStatus('testing');
    setError(null);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://localhost:5000/api';
      console.log('🧪 Testing connection to:', apiUrl);

      const response = await fetch(`${apiUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors'
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 Response data:', data);

      setResult(data);
      setStatus('success');
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'testing': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Backend Connection Test</h3>
        <button
          onClick={testConnection}
          disabled={status === 'testing'}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'testing' ? 'Testing...' : 'Retry'}
        </button>
      </div>

      <div className={`flex items-center space-x-2 mb-4 ${getStatusColor()}`}>
        <span className="text-xl">{getStatusIcon()}</span>
        <span className="font-medium">
          {status === 'testing' && 'Testing connection...'}
          {status === 'success' && 'Connection successful!'}
          {status === 'error' && 'Connection failed'}
        </span>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
          <h4 className="font-medium text-green-900 mb-2">Success Response:</h4>
          <pre className="text-sm text-green-800 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h4 className="font-medium text-red-900 mb-2">Error Details:</h4>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://localhost:5000/api'}</p>
        <p><strong>Frontend URL:</strong> {process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}</p>
        <p><strong>Organization:</strong> {process.env.NEXT_PUBLIC_ORGANIZATION_NAME || 'VNR VJIET'}</p>
        <p><strong>Email Domain:</strong> {process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || 'vnrvjiet.in'}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Connection Checklist:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Backend server running on port 5000</li>
          <li>• CORS configured for localhost:3000</li>
          <li>• Environment variables loaded</li>
          <li>• Database connection established</li>
          <li>• Email service configured</li>
        </ul>
      </div>
    </div>
  );
}
