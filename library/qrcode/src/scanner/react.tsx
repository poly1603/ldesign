import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeScanner, QRCodeScanResult, QRCodeScannerOptions } from './index';

export interface UseQRCodeScannerOptions extends Omit<QRCodeScannerOptions, 'onSuccess' | 'onError'> {
 onScan?: (result: QRCodeScanResult) => void;
 onError?: (error: Error) => void;
 autoStart?: boolean;
}

export interface UseQRCodeScannerReturn {
 videoRef: React.RefObject<HTMLVideoElement>;
 result: QRCodeScanResult | null;
 error: Error | null;
 isScanning: boolean;
 startScan: () => Promise<void>;
 stopScan: () => void;
 scanImage: (imageSource: string | File | Blob) => Promise<QRCodeScanResult>;
}

/**
 * React hook for QR code scanning
 */
export function useQRCodeScanner(
 options: UseQRCodeScannerOptions = {}
): UseQRCodeScannerReturn {
 const { onScan, onError, autoStart = false, ...scannerOptions } = options;

 const videoRef = useRef<HTMLVideoElement>(null);
 const scannerRef = useRef<QRCodeScanner | null>(null);

 const [result, setResult] = useState<QRCodeScanResult | null>(null);
 const [error, setError] = useState<Error | null>(null);
 const [isScanning, setIsScanning] = useState(false);

 // Initialize scanner
 useEffect(() => {
  scannerRef.current = new QRCodeScanner({
   ...scannerOptions,
   videoElement: videoRef.current || undefined,
   onSuccess: (scanResult) => {
    setResult(scanResult);
    setError(null);
    if (onScan) {
     onScan(scanResult);
    }
   },
   onError: (err) => {
    setError(err);
    if (onError) {
     onError(err);
    }
   },
  });

  return () => {
   if (scannerRef.current) {
    scannerRef.current.stop();
   }
  };
 }, []);

 // Auto start
 useEffect(() => {
  if (autoStart) {
   startScan();
  }
 }, [autoStart]);

 const startScan = useCallback(async () => {
  if (!scannerRef.current || isScanning) {
   return;
  }

  try {
   setError(null);
   setIsScanning(true);
   await scannerRef.current.start();
  } catch (err) {
   setError(err as Error);
   setIsScanning(false);
   throw err;
  }
 }, [isScanning]);

 const stopScan = useCallback(() => {
  if (scannerRef.current) {
   scannerRef.current.stop();
   setIsScanning(false);
  }
 }, []);

 const scanImage = useCallback(
  async (imageSource: string | File | Blob): Promise<QRCodeScanResult> => {
   if (!scannerRef.current) {
    throw new Error('Scanner not initialized');
   }

   try {
    setError(null);
    const scanResult = await scannerRef.current.scanImage(imageSource);
    setResult(scanResult);
    if (onScan) {
     onScan(scanResult);
    }
    return scanResult;
   } catch (err) {
    const error = err as Error;
    setError(error);
    if (onError) {
     onError(error);
    }
    throw error;
   }
  },
  [onScan, onError]
 );

 return {
  videoRef,
  result,
  error,
  isScanning,
  startScan,
  stopScan,
  scanImage,
 };
}

/**
 * QR Code Scanner React Component
 */
export interface QRCodeScannerComponentProps extends UseQRCodeScannerOptions {
 className?: string;
 style?: React.CSSProperties;
 showVideo?: boolean;
}

export function QRCodeScannerComponent({
 className,
 style,
 showVideo = true,
 ...options
}: QRCodeScannerComponentProps) {
 const { videoRef, result, error, isScanning, startScan, stopScan } = useQRCodeScanner(options);

 return (
  <div className={className} style={style}>
   {showVideo && (
    <video
     ref={videoRef}
     style={{
      width: '100%',
      height: 'auto',
      display: isScanning ? 'block' : 'none',
     }}
    />
   )}

   {!isScanning && (
    <button onClick={startScan}>Start Scanning</button>
   )}

   {isScanning && (
    <button onClick={stopScan}>Stop Scanning</button>
   )}

   {result && (
    <div style={{ marginTop: '1rem' }}>
     <strong>Scanned Result:</strong>
     <p>{result.data}</p>
    </div>
   )}

   {error && (
    <div style={{ marginTop: '1rem', color: 'red' }}>
     <strong>Error:</strong>
     <p>{error.message}</p>
    </div>
   )}
  </div>
 );
}
