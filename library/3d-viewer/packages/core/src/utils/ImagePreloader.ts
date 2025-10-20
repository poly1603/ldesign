/**
 * Intelligent image preloader
 * Preloads next images in the background for seamless transitions
 */
import * as THREE from 'three';
import { WebWorkerTextureLoader } from './WebWorkerTextureLoader';

export class ImagePreloader {
  private cache: Map<string, THREE.Texture> = new Map();
  private loading: Set<string> = new Set();
  private loader: WebWorkerTextureLoader;
  private maxCacheSize: number = 5;
  private loadQueue: string[] = [];

  constructor(maxCacheSize: number = 5) {
    this.maxCacheSize = maxCacheSize;
    this.loader = new WebWorkerTextureLoader();
  }

  /**
   * Preload an image
   */
  public async preload(url: string): Promise<THREE.Texture> {
    // Return from cache if available
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Return if already loading
    if (this.loading.has(url)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.cache.has(url)) {
            clearInterval(checkInterval);
            resolve(this.cache.get(url)!);
          }
        }, 100);
      });
    }

    // Start loading
    this.loading.add(url);

    try {
      const texture = await this.loader.load(url);
      this.loading.delete(url);
      
      // Add to cache
      this.addToCache(url, texture);
      
      return texture;
    } catch (error) {
      this.loading.delete(url);
      throw error;
    }
  }

  /**
   * Preload multiple images
   */
  public async preloadMultiple(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preload(url).catch(e => {
      console.warn(`Failed to preload ${url}:`, e);
      return null;
    }));
    
    await Promise.all(promises);
  }

  /**
   * Get texture from cache
   */
  public get(url: string): THREE.Texture | null {
    return this.cache.get(url) || null;
  }

  /**
   * Check if image is cached
   */
  public has(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Add texture to cache with size management
   */
  private addToCache(url: string, texture: THREE.Texture): void {
    // Remove oldest if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      const oldTexture = this.cache.get(firstKey);
      if (oldTexture) {
        oldTexture.dispose();
      }
      this.cache.delete(firstKey);
    }

    this.cache.set(url, texture);
  }

  /**
   * Clear specific image from cache
   */
  public clear(url: string): void {
    const texture = this.cache.get(url);
    if (texture) {
      texture.dispose();
      this.cache.delete(url);
    }
  }

  /**
   * Clear all cache
   */
  public clearAll(): void {
    this.cache.forEach(texture => texture.dispose());
    this.cache.clear();
    this.loading.clear();
  }

  /**
   * Get cache stats
   */
  public getStats(): { cached: number; loading: number; maxSize: number } {
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      maxSize: this.maxCacheSize,
    };
  }

  /**
   * Dispose preloader
   */
  public dispose(): void {
    this.clearAll();
    this.loader.dispose();
  }
}

