import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ 
  value, 
  size = 200, 
  className = "",
  errorCorrectionLevel = 'M',
  margin = 4,
  color = {
    dark: '#000000',
    light: '#FFFFFF'
  }
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (value && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: margin,
        color: color,
        errorCorrectionLevel: errorCorrectionLevel,
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error);
        }
      });
    }
  }, [value, size, margin, color, errorCorrectionLevel]);

  if (!value) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm">No QR Code</span>
      </div>
    );
  }

  return (
    <div className={`inline-block ${className}`}>
      <canvas 
        ref={canvasRef}
        className="rounded-lg"
      />
    </div>
  );
};

export default QRCodeDisplay;
