'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../lib/AuthContext';
import { ToastProvider } from './ui';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
