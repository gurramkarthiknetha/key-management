'use client';

import { SecurityRoute } from '../../components/ProtectedRoute';
import SecurityDashboard from '../../components/Security/SecurityDashboardNew';

export default function SecurityPage() {
  return (
    <SecurityRoute>
      <SecurityDashboard />
    </SecurityRoute>
  );
}
