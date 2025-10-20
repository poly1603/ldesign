import * as THREE from 'three';

/**
 * Texture cache for better performance
 */
export class TextureCache {
  private static instance: TextureCache;
  private cache: Map<string, THREE.Texture> = new Map();
  private loader: THREE.TextureLoader = new THREE.TextureLoader();

  private constructor() {}

  public static getInstance(): TextureCache {
    if (!TextureCache.instance) {
      TextureCache.instance = new TextureCache();
    }
    return TextureCache.instance;
  }

  public async load(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<THREE.Texture> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          this.cache.set(url, texture);
          resolve(texture);
        },
        (event) => {
          if (onProgress && event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        },
        (error) => {
          reject(new Error(`Failed to load texture: ${error}`));
        }
      );
    });
  }

  public get(url: string): THREE.Texture | undefined {
    return this.cache.get(url);
  }

  public has(url: string): boolean {
    return this.cache.has(url);
  }

  public remove(url: string): void {
    const texture = this.cache.get(url);
    if (texture) {
      texture.dispose();
      this.cache.delete(url);
    }
  }

  public clear(): void {
    this.cache.forEach((texture) => {
      texture.dispose();
    });
    this.cache.clear();
  }

  public getSize(): number {
    return this.cache.size;
  }
}


