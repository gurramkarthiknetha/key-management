'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRData } from '@/utils/qr';

interface QRCodeGeneratorProps {
  data: QRData;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
}

export default function QRCodeGenerator({
  data,
  size = 200,
  level = 'M',
  includeMargin = true,
  className = ''
}: QRCodeGeneratorProps) {
  const qrString = JSON.stringify(data);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCodeSVG
          value={qrString}
          size={size}
          level={level}
          includeMargin={includeMargin}
          className="border border-gray-200"
        />
      </div>
      <div className="mt-2 text-sm text-gray-600 text-center">
        <p className="font-medium">
          {data.type === 'key' ? 'Key QR Code' : 'User QR Code'}
        </p>
        <p className="text-xs">ID: {data.id}</p>
        <p className="text-xs">
          Generated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Component for displaying QR code from data URL
interface QRCodeDisplayProps {
  dataURL: string;
  title?: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({
  dataURL,
  title,
  size = 200,
  className = ''
}: QRCodeDisplayProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <img
          src={dataURL}
          alt={title || 'QR Code'}
          width={size}
          height={size}
          className="border border-gray-200"
        />
      </div>
      {title && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          <p className="font-medium">{title}</p>
        </div>
      )}
    </div>
  );
}

// Component for printable QR codes
interface PrintableQRCodeProps {
  data: QRData;
  title: string;
  subtitle?: string;
  size?: number;
}

export function PrintableQRCode({
  data,
  title,
  subtitle,
  size = 150
}: PrintableQRCodeProps) {
  const qrString = JSON.stringify(data);

  return (
    <div className="bg-white border-2 border-gray-300 p-4 rounded-lg print:border-black print:shadow-none">
      <div className="text-center mb-3">
        <h3 className="font-bold text-lg">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      
      <div className="flex justify-center mb-3">
        <QRCodeSVG
          value={qrString}
          size={size}
          level="M"
          includeMargin={true}
        />
      </div>
      
      <div className="text-center text-xs text-gray-500">
        <p>ID: {data.id}</p>
        <p>Type: {data.type.toUpperCase()}</p>
        <p>Generated: {new Date(data.timestamp).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
