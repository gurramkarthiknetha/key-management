'use client';

import { FacultyRoute } from '../../../components/ProtectedRoute';
import QRScannerPage from '../../../components/Faculty/QRScannerPage';

export default function Page() {
  return (
    <FacultyRoute>
      <QRScannerPage />
    </FacultyRoute>
  );
}
