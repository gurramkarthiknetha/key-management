'use client';

import { useState } from 'react';
import { authAPI } from '../../lib/api';

export default function TestOTPPage() {
  const [formData, setFormData] = useState({
    employeeId: 'TESTSEC004',
    otp: '',
    email: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const testDirectBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          otp: formData.otp,
          ...(formData.email && { email: formData.email })
        }),
      });
      
      const data = await response.json();
      setResult({
        type: 'Direct Backend',
        status: response.status,
        data
      });
    } catch (error) {
      setResult({
        type: 'Direct Backend',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testNextJSAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          otp: formData.otp,
          ...(formData.email && { email: formData.email })
        }),
      });
      
      const data = await response.json();
      setResult({
        type: 'Next.js API',
        status: response.status,
        data
      });
    } catch (error) {
      setResult({
        type: 'Next.js API',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuthAPI = async () => {
    setLoading(true);
    try {
      const response = await authAPI.verifyOTP({
        employeeId: formData.employeeId,
        otp: formData.otp,
        ...(formData.email && { email: formData.email })
      });
      
      setResult({
        type: 'Auth API',
        data: response.data
      });
    } catch (error) {
      setResult({
        type: 'Auth API',
        error: error.message || error.error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OTP Verification Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Data</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter OTP"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email (optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter email (optional)"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={testDirectBackend}
            disabled={loading}
            className="w-full bg-primary-500 text-white p-3 rounded hover:bg-primary-600 disabled:opacity-50"
          >
            Test Direct Backend
          </button>
          
          <button
            onClick={testNextJSAPI}
            disabled={loading}
            className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Next.js API
          </button>
          
          <button
            onClick={testAuthAPI}
            disabled={loading}
            className="w-full bg-purple-500 text-white p-3 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Auth API
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Result: {result.type}</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
