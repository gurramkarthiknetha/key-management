'use client';

import { FacultyRoute } from '../../../components/ProtectedRoute';
import HistoryPage from '../../../components/Faculty/HistoryPage';

export default function Page() {
  return (
    <FacultyRoute>
      <HistoryPage />
    </FacultyRoute>
  );
}
