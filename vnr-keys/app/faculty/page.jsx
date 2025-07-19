'use client';

import { FacultyRoute } from '../../components/ProtectedRoute';
import FacultyDashboard from '../../components/Faculty/FacultyDashboard';

export default function FacultyPage() {
  return (
    <FacultyRoute>
      <FacultyDashboard />
    </FacultyRoute>
  );
}
