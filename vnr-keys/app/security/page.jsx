'use client';

import { SecurityRoute } from '../../components/ProtectedRoute';
import SecurityDashboard from '../../components/Security/SecurityDashboard';

export default function SecurityPage() {
  return (
    <SecurityRoute>
      <SecurityDashboard />
    </SecurityRoute>
  );
}
