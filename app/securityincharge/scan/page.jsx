'use client';

import { SecurityHeadRoute } from '../../../components/ProtectedRoute';
import SecurityQRScannerPage from '../../../components/Security/SecurityQRScannerPage';

export default function SecurityInchargeScanPage() {
  return (
    <SecurityHeadRoute>
      <SecurityQRScannerPage />
    </SecurityHeadRoute>
  );
}
