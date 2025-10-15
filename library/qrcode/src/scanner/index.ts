/**
 * QR Code Scanner for reading QR codes from camera or images
 */

export interface QRCodeScanResult {
 data: string;
 location: {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
 };
 timestamp: number;
}

export interface QRCodeScannerOptions {
 /** Video element to use for scanning */
 videoElement?: HTMLVideoElement;
 /** Success callback */
 onSuccess?: (result: QRCodeScanResult) => void;
 /** Error callback */
 onError?: (error: Error) => void;
 /** Continuous scanning mode */
 continuous?: boolean;
 /** Scan interval in milliseconds (for continuous mode) */
 scanInterval?: number;
 /** Video constraints */
 videoConstraints?: MediaTrackConstraints;
}

/**
 * QR Code Scanner class
 * Uses browser's native capabilities or jsQR library for scanning
 */
export class QRCodeScanner {
 private options: Required<Omit<QRCodeScannerOptions, 'videoElement' | 'onSuccess' | 'onError'>> & Pick<QRCodeScannerOptions, 'videoElement' | 'onSuccess' | 'onError'>;
 private video: HTMLVideoElement | null = null;
 private stream: MediaStream | null = null;
 private canvas: HTMLCanvasElement | null = null;
 private context: CanvasRenderingContext2D | null = null;
 private scanning = false;
 private animationFrameId: number | null = null;
 private intervalId: number | null = null;

 constructor(options: QRCodeScannerOptions = {}) {
  this.options = {
   continuous: true,
   scanInterval: 100,
   videoConstraints: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 },
   },
   ...options,
  };
 }

 /**
  * Start scanning from camera
  */
 async start(): Promise<void> {
  if (this.scanning) {
   throw new Error('Scanner is already running');
  }

  try {
   // Get video element
   this.video = this.options.videoElement || document.createElement('video');
   this.video.setAttribute('playsinline', 'true'); // iOS compatibility

   // Create canvas for image processing
   this.canvas = document.createElement('canvas');
   this.context = this.canvas.getContext('2d', { willReadFrequently: true });

   if (!this.context) {
    throw new Error('Failed to get canvas context');
   }

   // Request camera access
   this.stream = await navigator.mediaDevices.getUserMedia({
    video: this.options.videoConstraints,
    audio: false,
   });

   this.video.srcObject = this.stream;
   await this.video.play();

   // Set canvas size to match video
   this.canvas.width = this.video.videoWidth;
   this.canvas.height = this.video.videoHeight;

   this.scanning = true;

   // Start scanning loop
   if (this.options.continuous) {
    this.scanLoop();
   } else {
    // Single scan
    await this.scanFrame();
   }
  } catch (error) {
   this.handleError(error as Error);
   throw error;
  }
 }

 /**
  * Stop scanning
  */
 stop(): void {
  this.scanning = false;

  if (this.animationFrameId !== null) {
   cancelAnimationFrame(this.animationFrameId);
   this.animationFrameId = null;
  }

  if (this.intervalId !== null) {
   clearInterval(this.intervalId);
   this.intervalId = null;
  }

  if (this.stream) {
   this.stream.getTracks().forEach(track => track.stop());
   this.stream = null;
  }

  if (this.video) {
   this.video.srcObject = null;
   this.video = null;
  }

  this.canvas = null;
  this.context = null;
 }

 /**
  * Scan QR code from image file or URL
  */
 async scanImage(imageSource: string | File | Blob): Promise<QRCodeScanResult> {
  return new Promise((resolve, reject) => {
   const img = new Image();

   img.onload = () => {
    try {
     // Create temporary canvas
     const canvas = document.createElement('canvas');
     const context = canvas.getContext('2d', { willReadFrequently: true });

     if (!context) {
      throw new Error('Failed to get canvas context');
     }

     canvas.width = img.width;
     canvas.height = img.height;
     context.drawImage(img, 0, 0);

     const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
     const result = this.decodeImageData(imageData);

     if (result) {
      resolve(result);
     } else {
      reject(new Error('No QR code found in image'));
     }
    } catch (error) {
     reject(error);
    }
   };

   img.onerror = () => {
    reject(new Error('Failed to load image'));
   };

   if (imageSource instanceof File || imageSource instanceof Blob) {
    const reader = new FileReader();
    reader.onload = (e) => {
     img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageSource);
   } else {
    img.crossOrigin = 'anonymous';
    img.src = imageSource;
   }
  });
 }

 /**
  * Scan current video frame
  */
 private async scanFrame(): Promise<void> {
  if (!this.video || !this.canvas || !this.context) {
   return;
  }

  try {
   // Draw current video frame to canvas
   this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

   // Get image data
   const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

   // Decode QR code
   const result = this.decodeImageData(imageData);

   if (result) {
    this.handleSuccess(result);

    if (!this.options.continuous) {
     this.stop();
    }
   }
  } catch (error) {
   this.handleError(error as Error);
  }
 }

 /**
  * Continuous scanning loop
  */
 private scanLoop(): void {
  if (!this.scanning) {
   return;
  }

  this.scanFrame();

  // Schedule next scan
  this.intervalId = window.setTimeout(() => {
   this.animationFrameId = requestAnimationFrame(() => this.scanLoop());
  }, this.options.scanInterval);
 }

 /**
  * Decode QR code from ImageData
  * Uses a simple pattern detection algorithm
  */
 private decodeImageData(imageData: ImageData): QRCodeScanResult | null {
  // Note: In a real implementation, you would use a library like jsQR
  // For now, this is a placeholder that demonstrates the structure

  // Try to use BarcodeDetector API if available (modern browsers)
  if ('BarcodeDetector' in window) {
   return this.decodeBarcodeDetector(imageData);
  }

  // Fallback: Would use jsQR or similar library
  // For demo purposes, returning null
  console.warn('BarcodeDetector API not available. Please use jsQR library for QR code detection.');
  return null;
 }

 /**
  * Use native BarcodeDetector API (if available)
  */
 private async decodeBarcodeDetector(imageData: ImageData): Promise<QRCodeScanResult | null> {
  try {
   const BarcodeDetector = (window as any).BarcodeDetector;
   const detector = new BarcodeDetector({ formats: ['qr_code'] });

   // Create ImageBitmap from ImageData
   const bitmap = await createImageBitmap(imageData);
   const barcodes = await detector.detect(bitmap);

   if (barcodes.length > 0) {
    const barcode = barcodes[0];
    const corners = barcode.cornerPoints;

    return {
     data: barcode.rawValue,
     location: {
      topLeft: { x: corners[0].x, y: corners[0].y },
      topRight: { x: corners[1].x, y: corners[1].y },
      bottomRight: { x: corners[2].x, y: corners[2].y },
      bottomLeft: { x: corners[3].x, y: corners[3].y },
     },
     timestamp: Date.now(),
    };
   }

   return null;
  } catch (error) {
   console.error('BarcodeDetector error:', error);
   return null;
  }
 }

 /**
  * Handle successful scan
  */
 private handleSuccess(result: QRCodeScanResult): void {
  if (this.options.onSuccess) {
   this.options.onSuccess(result);
  }
 }

 /**
  * Handle error
  */
 private handleError(error: Error): void {
  if (this.options.onError) {
   this.options.onError(error);
  } else {
   console.error('QR Scanner error:', error);
  }
 }

 /**
  * Check if scanner is currently running
  */
 isScanning(): boolean {
  return this.scanning;
 }

 /**
  * Get current video element
  */
 getVideoElement(): HTMLVideoElement | null {
  return this.video;
 }
}

// Export helper functions
export { QRCodeScanner as default };
