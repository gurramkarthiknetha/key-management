'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, Key } from 'lucide-react';
import RegisterForm from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the Key Management System
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {/* Back to Login Link */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>

          {/* Role Information */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Available Roles
            </h3>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex items-start">
                <Shield className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Security Staff:</span> Key check-in/out operations
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Faculty/Lab Staff:</span> View and request keys
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">HOD:</span> Department oversight and reporting
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Security Incharge:</span> Full administrative access
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <RegisterForm />

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <Shield className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p>
                  Your account will be subject to approval and verification. 
                  Please ensure all information is accurate and contact your 
                  system administrator if you need immediate access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Key Management System © 2024. All rights reserved.
        </p>
      </div>
    </div>
  );
}
