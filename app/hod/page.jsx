'use client';

import { HODRoute } from '../../components/ProtectedRoute';
import HODDashboard from '../../components/HOD/HODDashboardNew';

export default function HODPage() {
  return (
    <HODRoute>
      <HODDashboard />
    </HODRoute>
  );
}
