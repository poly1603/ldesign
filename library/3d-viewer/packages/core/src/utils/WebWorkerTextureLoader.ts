import * as THREE from 'three';

/**
 * WebWorker-based texture loader for non-blocking image loading
 * Significantly improves performance by loading textures in background
 */
export class WebWorkerTextureLoader {
  private worker: Worker | null = null;
  private pendingLoads: Map<string, {
    resolve: (texture: THREE.Texture) => void;
    reject: (error: Error) => void;
  }> = new Map();
  private loadCounter = 0;

  constructor() {
    if (typeof Worker !== 'undefined') {
      try {
        // Create inline worker to avoid external file dependency
        const workerCode = `
          self.onmessage = async (e) => {
            const { type, url, id } = e.data;
            if (type === 'load') {
              try {
                const response = await fetch(url);
                const blob = await response.blob();
                const imageBitmap = await createImageBitmap(blob, {
                  premultiplyAlpha: 'none',
                  colorSpaceConversion: 'none',
                });
                self.postMessage({
                  type: 'loaded',
                  id,
                  imageData: imageBitmap,
                  width: imageBitmap.width,
                  height: imageBitmap.height,
                }, [imageBitmap]);
              } catch (error) {
                self.postMessage({
                  type: 'error',
                  id,
                  error: error.message || String(error),
                });
              }
            }
          };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = this.handleMessage.bind(this);
      } catch (error) {
        console.warn('WebWorker not available, falling back to main thread loading');
      }
    }
  }

  private handleMessage(e: MessageEvent): void {
    const { type, id, imageData, error } = e.data;

    const pending = this.pendingLoads.get(id);
    if (!pending) return;

    this.pendingLoads.delete(id);

    if (type === 'loaded') {
      try {
        const texture = new THREE.Texture(imageData);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        pending.resolve(texture);
      } catch (err) {
        pending.reject(err as Error);
      }
    } else if (type === 'error') {
      pending.reject(new Error(error));
    }
  }

  public async load(url: string): Promise<THREE.Texture> {
    // Fallback to regular loader if worker not available
    if (!this.worker) {
      return this.loadFallback(url);
    }

    return new Promise((resolve, reject) => {
      const id = `texture-${++this.loadCounter}`;
      this.pendingLoads.set(id, { resolve, reject });

      this.worker!.postMessage({
        type: 'load',
        url,
        id,
      });
    });
  }

  private async loadFallback(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  public dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingLoads.clear();
  }
}

