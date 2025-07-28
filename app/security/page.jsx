'use client';

import { SecurityRoute } from '../../components/ProtectedRoute';
import SecurityDashboard from '../../components/Security/SecurityDashboardNew';

export default function SecurityPage() {
  // Temporarily bypass SecurityRoute for development
  if (process.env.NODE_ENV === 'development') {
    return <SecurityDashboard />;
  }

  return (
    <SecurityRoute>
      <SecurityDashboard />
    </SecurityRoute>
  );
}
