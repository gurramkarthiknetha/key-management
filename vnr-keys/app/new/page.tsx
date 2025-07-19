'use client';

import React from 'react';
import { useState } from 'react';
import QRCode from 'qrcode';

export default function QRGeneratorPage() {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  const generateQR = async () => {
    if (!text.trim()) {
      setError('Please enter text to generate QR code.');
      setQrUrl('');
      return;
    }
    try {
      const url = await QRCode.toDataURL(text);
      setQrUrl(url);
      setError('');
    } catch (err) {
      setError('Failed to generate QR code.');
      setQrUrl('');
      console.error(err);
    }
  };

  return (
    <>
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">QR Code Generator</h1>
      
      <input
        type="text"
        placeholder="Enter text to encode"
        className="p-2 border border-gray-300 rounded w-full max-w-md mb-4"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setQrUrl('');
          setError('');
        }}
      />

      <button
        onClick={generateQR}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate QR
      </button>

      {error && (
        <div className="text-red-600 mt-4">{error}</div>
      )}

      {qrUrl && (
        <img
          src={qrUrl}
          alt="Generated QR Code"
          className="mt-6 border rounded"
        />
      )}
    </main>
    </>
  );
}
