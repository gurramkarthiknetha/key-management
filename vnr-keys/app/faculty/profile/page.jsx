'use client';

import { FacultyRoute } from '../../../components/ProtectedRoute';
import FacultyProfilePage from '../../../components/Faculty/FacultyProfilePage';

export default function Page() {
  return (
    <FacultyRoute>
      <FacultyProfilePage />
    </FacultyRoute>
  );
}
