'use client';

import { SecurityRoute } from '../../../components/ProtectedRoute';
import SecurityQRScannerPage from '../../../components/Security/SecurityQRScannerPage';

export default function SecurityScanPage() {
  return (
    <SecurityRoute>
      <SecurityQRScannerPage />
    </SecurityRoute>
  );
}
