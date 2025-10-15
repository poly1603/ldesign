import { ref, onMounted, onUnmounted, Ref } from 'vue';
import { QRCodeScanner, QRCodeScanResult, QRCodeScannerOptions } from './index';

export interface UseQRCodeScannerOptions extends Omit<QRCodeScannerOptions, 'onSuccess' | 'onError'> {
 onScan?: (result: QRCodeScanResult) => void;
 onError?: (error: Error) => void;
 autoStart?: boolean;
}

export interface UseQRCodeScannerReturn {
 videoRef: Ref<HTMLVideoElement | null>;
 result: Ref<QRCodeScanResult | null>;
 error: Ref<Error | null>;
 isScanning: Ref<boolean>;
 startScan: () => Promise<void>;
 stopScan: () => void;
 scanImage: (imageSource: string | File | Blob) => Promise<QRCodeScanResult>;
}

/**
 * Vue composable for QR code scanning
 */
export function useQRCodeScanner(
 options: UseQRCodeScannerOptions = {}
): UseQRCodeScannerReturn {
 const { onScan, onError, autoStart = false, ...scannerOptions } = options;

 const videoRef = ref<HTMLVideoElement | null>(null);
 const result = ref<QRCodeScanResult | null>(null);
 const error = ref<Error | null>(null);
 const isScanning = ref(false);

 let scanner: QRCodeScanner | null = null;

 onMounted(() => {
  scanner = new QRCodeScanner({
   ...scannerOptions,
   videoElement: videoRef.value || undefined,
   onSuccess: (scanResult) => {
    result.value = scanResult;
    error.value = null;
    if (onScan) {
     onScan(scanResult);
    }
   },
   onError: (err) => {
    error.value = err;
    if (onError) {
     onError(err);
    }
   },
  });

  if (autoStart) {
   startScan();
  }
 });

 onUnmounted(() => {
  if (scanner) {
   scanner.stop();
  }
 });

 const startScan = async () => {
  if (!scanner || isScanning.value) {
   return;
  }

  try {
   error.value = null;
   isScanning.value = true;
   await scanner.start();
  } catch (err) {
   error.value = err as Error;
   isScanning.value = false;
   throw err;
  }
 };

 const stopScan = () => {
  if (scanner) {
   scanner.stop();
   isScanning.value = false;
  }
 };

 const scanImage = async (imageSource: string | File | Blob): Promise<QRCodeScanResult> => {
  if (!scanner) {
   throw new Error('Scanner not initialized');
  }

  try {
   error.value = null;
   const scanResult = await scanner.scanImage(imageSource);
   result.value = scanResult;
   if (onScan) {
    onScan(scanResult);
   }
   return scanResult;
  } catch (err) {
   const scanError = err as Error;
   error.value = scanError;
   if (onError) {
    onError(scanError);
   }
   throw scanError;
  }
 };

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
