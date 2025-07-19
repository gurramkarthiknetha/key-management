'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/useAuth';

export default function DebugLoginPage() {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Attempting login...');
    
    console.log('Form data:', formData);
    
    try {
      const result = await login(formData);
      console.log('Login result:', result);
      
      if (result.success) {
        setMessage(`✅ Login successful! Role: ${result.user.role}`);
      } else {
        setMessage(`❌ Login failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Debug Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user ID (e.g., faculty001)"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
        
        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm">{message}</p>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">Test Credentials:</h3>
          <ul className="space-y-1">
            <li>• faculty001 / password123</li>
            <li>• security001 / password123</li>
            <li>• sechead001 / password123</li>
          </ul>
        </div>
        
        <div className="mt-4">
          <a href="/login" className="text-blue-600 hover:underline text-sm">
            ← Back to regular login
          </a>
        </div>
      </div>
    </div>
  );
}
