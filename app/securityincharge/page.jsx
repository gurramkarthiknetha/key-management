'use client';

import { SecurityHeadRoute } from '../../components/ProtectedRoute';
import SecurityHeadDashboard from '../../components/SecurityIncharge/SecurityHeadDashboard';

export default function SecurityInchargePage() {
  return (
    <SecurityHeadRoute>
      <SecurityHeadDashboard />
    </SecurityHeadRoute>
  );
}
