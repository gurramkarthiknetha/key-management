'use client';

import { useState } from 'react';
import { authAPI } from '../../lib/api';

export default function TestLoginPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Starting test login...');
      const response = await authAPI.login({
        userId: 'faculty001',
        password: 'password123'
      });
      
      console.log('✅ Test login successful:', response);
      setResult({ success: true, data: response });
    } catch (error) {
      console.error('❌ Test login failed:', error);
      setResult({ success: false, error: error.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">API Test</h1>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Login (faculty001)'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 rounded-lg">
            {result.success ? (
              <div className="bg-green-50 border border-green-200 text-green-800">
                <h3 className="font-semibold">✅ Success!</h3>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-800">
                <h3 className="font-semibold">❌ Failed!</h3>
                <p className="text-sm mt-1">{result.error}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <a href="/login" className="text-primary-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
