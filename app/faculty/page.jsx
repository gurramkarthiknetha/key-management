'use client';

import { FacultyRoute } from '../../components/ProtectedRoute';
import FacultyDashboard from '../../components/Faculty/FacultyDashboardNew';

export default function FacultyPage() {
  // Temporarily bypass ProtectedRoute to test if it's causing the issue
  return (
    <div>
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <strong>Debug Mode:</strong> ProtectedRoute temporarily disabled for testing
      </div>
      <FacultyDashboard />
    </div>
  );

  // Original code (commented out for debugging)
  // return (
  //   <FacultyRoute>
  //     <FacultyDashboard />
  //   </FacultyRoute>
  // );
}
