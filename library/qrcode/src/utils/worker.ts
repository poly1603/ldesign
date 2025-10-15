/**
 * Web Worker Pool for batch QR code generation
 */

import type { QRCodeConfig } from '../types';

export interface BatchQRCodeItem {
 id: string;
 config: QRCodeConfig;
}

export interface BatchQRCodeResult {
 id: string;
 dataURL: string;
 error?: string;
}

/**
 * Web Worker Pool Manager
 */
export class QRCodeWorkerPool {
 private workers: Worker[] = [];
 private workerQueue: Worker[] = [];
 private taskQueue: Array<{
  item: BatchQRCodeItem;
  resolve: (result: BatchQRCodeResult) => void;
  reject: (error: Error) => void;
 }> = [];
 private maxWorkers: number;

 constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
  this.maxWorkers = maxWorkers;
 }

 /**
  * Initialize worker pool
  */
 private initializeWorkers(): void {
  if (this.workers.length > 0) {
   return; // Already initialized
  }

  // Note: In production, you would create actual Worker instances
  // pointing to a compiled worker script
  // This is a placeholder implementation

  for (let i = 0; i < this.maxWorkers; i++) {
   // const worker = new Worker(new URL('./qrcode.worker.ts', import.meta.url));
   // this.workers.push(worker);
   // this.workerQueue.push(worker);
  }

  console.warn('Worker pool initialized (placeholder - actual workers not created)');
 }

 /**
  * Process single item
  */
 private async processItem(item: BatchQRCodeItem): Promise<BatchQRCodeResult> {
  return new Promise((resolve, reject) => {
   const worker = this.workerQueue.shift();

   if (!worker) {
    // No available workers, queue the task
    this.taskQueue.push({ item, resolve, reject });
    return;
   }

   const messageHandler = (e: MessageEvent) => {
    const result: BatchQRCodeResult = e.data;

    // Clean up
    worker.removeEventListener('message', messageHandler);
    worker.removeEventListener('error', errorHandler);

    // Return worker to queue
    this.workerQueue.push(worker);

    // Process next queued task
    if (this.taskQueue.length > 0) {
     const nextTask = this.taskQueue.shift()!;
     this.processItem(nextTask.item).then(nextTask.resolve).catch(nextTask.reject);
    }

    resolve(result);
   };

   const errorHandler = (error: ErrorEvent) => {
    worker.removeEventListener('message', messageHandler);
    worker.removeEventListener('error', errorHandler);
    this.workerQueue.push(worker);
    reject(new Error(error.message));
   };

   worker.addEventListener('message', messageHandler);
   worker.addEventListener('error', errorHandler);

   // Send task to worker
   worker.postMessage(item);
  });
 }

 /**
  * Generate multiple QR codes in parallel
  */
 async generateBatch(
  items: BatchQRCodeItem[],
  onProgress?: (current: number, total: number) => void
 ): Promise<BatchQRCodeResult[]> {
  this.initializeWorkers();

  const results: BatchQRCodeResult[] = [];
  let completed = 0;

  // Process all items with concurrency control
  const promises = items.map(async (item) => {
   const result = await this.processItem(item);
   completed++;

   if (onProgress) {
    onProgress(completed, items.length);
   }

   return result;
  });

  return Promise.all(promises);
 }

 /**
  * Terminate all workers
  */
 destroy(): void {
  this.workers.forEach(worker => worker.terminate());
  this.workers = [];
  this.workerQueue = [];
  this.taskQueue = [];
 }
}

/**
 * Batch download utility
 */
export interface BatchDownloadOptions {
 items: Array<{ content: string; fileName: string; config?: Partial<QRCodeConfig> }>;
 format?: 'png' | 'jpeg' | 'svg';
 quality?: number;
 zipFileName?: string;
 style?: Partial<QRCodeConfig['style']>;
 onProgress?: (current: number, total: number) => void;
}

export async function batchDownload(options: BatchDownloadOptions): Promise<void> {
 const { items, format = 'png', zipFileName = 'qrcodes.zip', onProgress } = options;

 // Note: In production, you would use a library like JSZip for creating ZIP files
 console.warn('Batch download not fully implemented. Would generate ZIP with', items.length, 'items');

 // Simulate progress
 for (let i = 0; i < items.length; i++) {
  if (onProgress) {
   onProgress(i + 1, items.length);
  }
  await new Promise(resolve => setTimeout(resolve, 100));
 }
}

export default QRCodeWorkerPool;
