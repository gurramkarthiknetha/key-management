'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../lib/AuthContext';
import { ToastProvider, ThemeProvider } from './ui';
import { NotificationProvider } from '../lib/NotificationContext';
import { useAuth } from '../lib/useAuth';

// Wrapper component to access user role for NotificationProvider
function NotificationWrapper({ children }) {
  const { user } = useAuth();

  return (
    <NotificationProvider userRole={user?.role || 'faculty'}>
      {children}
    </NotificationProvider>
  );
}

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationWrapper>
            <ToastProvider>
              {children}
            </ToastProvider>
          </NotificationWrapper>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
