/**
 * @ldesign/i18n - Lazy Loading System
 * 智能懒加载系统，支持按需加载和代码分割
 */

import type { Locale, Messages, I18nInstance } from '../types';

/**
 * 懒加载配置
 */
export interface LazyLoadConfig {
  // 基础URL或加载函数
  baseUrl?: string;
  loader?: (locale: Locale, namespace?: string) => Promise<Messages>;
  
  // 预加载策略
  preloadStrategy?: 'none' | 'idle' | 'prefetch' | 'viewport';
  preloadDelay?: number;
  
  // 缓存策略
  cacheStrategy?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  cacheExpiry?: number;
  
  // 分块策略
  chunkStrategy?: 'namespace' | 'route' | 'component' | 'feature';
  chunkSize?: number;
  
  // 性能优化
  concurrent?: number;
  timeout?: number;
  retry?: number;
  
  // 压缩选项
  compression?: boolean;
  compressionAlgorithm?: 'gzip' | 'brotli' | 'lz-string';
}

/**
 * 加载状态
 */
interface LoadState {
  locale: Locale;
  namespace?: string;
  status: 'idle' | 'loading' | 'loaded' | 'error';
  promise?: Promise<Messages>;
  error?: Error;
  timestamp?: number;
  size?: number;
}

/**
 * 懒加载管理器
 */
export class LazyLoader {
  private config: LazyLoadConfig;
  private loadStates: Map<string, LoadState> = new Map();
  private cache: Map<string, Messages> = new Map();
  private preloadQueue: Set<string> = new Set();
  private loadingPool: Map<string, Promise<Messages>> = new Map();
  private observer?: IntersectionObserver;
  private idleCallback?: number;

  constructor(config: LazyLoadConfig = {}) {
    this.config = {
      preloadStrategy: 'idle',
      preloadDelay: 2000,
      cacheStrategy: 'memory',
      chunkStrategy: 'namespace',
      concurrent: 3,
      timeout: 30000,
      retry: 3,
      compression: true,
      compressionAlgorithm: 'lz-string',
      ...config
    };

    this.initializePreloadStrategy();
  }

  /**
   * 加载语言包
   */
  async load(locale: Locale, namespace?: string): Promise<Messages> {
    const key = this.getCacheKey(locale, namespace);
    
    // 检查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // 检查是否正在加载
    if (this.loadingPool.has(key)) {
      return this.loadingPool.get(key)!;
    }

    // 开始加载
    const loadPromise = this.performLoad(locale, namespace);
    this.loadingPool.set(key, loadPromise);

    try {
      const messages = await loadPromise;
      this.cache.set(key, messages);
      this.updateLoadState(key, 'loaded', undefined, messages);
      return messages;
    } catch (error) {
      this.updateLoadState(key, 'error', error as Error);
      throw error;
    } finally {
      this.loadingPool.delete(key);
    }
  }

  /**
   * 预加载语言包
   */
  async preload(locales: Locale[], namespaces?: string[]): Promise<void> {
    const tasks: Array<Promise<Messages>> = [];

    for (const locale of locales) {
      if (namespaces) {
        for (const namespace of namespaces) {
          tasks.push(this.load(locale, namespace));
        }
      } else {
        tasks.push(this.load(locale));
      }
    }

    // 限制并发数
    await this.executeWithConcurrency(tasks, this.config?.concurrent!);
  }

  /**
   * 智能预加载
   */
  smartPreload(patterns: string[]): void {
    if (this.config?.preloadStrategy === 'none') return;

    patterns.forEach(pattern => {
      this.preloadQueue.add(pattern);
    });

    switch (this.config?.preloadStrategy) {
      case 'idle':
        this.preloadOnIdle();
        break;
      case 'prefetch':
        this.preloadWithPrefetch();
        break;
      case 'viewport':
        this.preloadOnViewport();
        break;
    }
  }

  /**
   * 加载路由级语言包
   */
  async loadForRoute(route: string, locale: Locale): Promise<Messages> {
    const namespace = this.getNamespaceForRoute(route);
    return this.load(locale, namespace);
  }

  /**
   * 加载组件级语言包
   */
  async loadForComponent(component: string, locale: Locale): Promise<Messages> {
    const namespace = `components.${component}`;
    return this.load(locale, namespace);
  }

  /**
   * 清理缓存
   */
  clearCache(locale?: Locale, namespace?: string): void {
    if (locale) {
      const key = this.getCacheKey(locale, namespace);
      this.cache.delete(key);
      this.loadStates.delete(key);
    } else {
      this.cache.clear();
      this.loadStates.clear();
    }
  }

  /**
   * 获取加载统计
   */
  getStats(): {
    loaded: number;
    cached: number;
    totalSize: number;
    states: Map<string, LoadState>;
  } {
    let totalSize = 0;
    let loaded = 0;

    this.loadStates.forEach(state => {
      if (state.status === 'loaded') {
        loaded++;
        totalSize += state.size || 0;
      }
    });

    return {
      loaded,
      cached: this.cache.size,
      totalSize,
      states: this.loadStates
    };
  }

  /**
   * 执行实际加载
   */
  private async performLoad(locale: Locale, namespace?: string): Promise<Messages> {
    const startTime = Date.now();
    this.updateLoadState(this.getCacheKey(locale, namespace), 'loading');

    try {
      let messages: Messages;

      if (this.config?.loader) {
        messages = await this.withRetry(
          () => this.config?.loader!(locale, namespace),
          this.config?.retry!
        );
      } else if (this.config?.baseUrl) {
        messages = await this.loadFromUrl(locale, namespace);
      } else {
        throw new Error('No loader configured');
      }

      // 解压缩
      if (this.config?.compression) {
        messages = await this.decompress(messages);
      }

      // 记录大小
      const size = this.estimateSize(messages);
      const loadTime = Date.now() - startTime;

      this.updateLoadState(this.getCacheKey(locale, namespace), 'loaded', {
        size,
        loadTime
      });

      return messages;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 从URL加载
   */
  private async loadFromUrl(locale: Locale, namespace?: string): Promise<Messages> {
    const url = this.buildUrl(locale, namespace);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      signal: AbortSignal.timeout(this.config?.timeout!)
    });

    if (!response.ok) {
      throw new Error(`Failed to load: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 构建URL
   */
  private buildUrl(locale: Locale, namespace?: string): string {
    const base = this.config?.baseUrl!.replace(/\/$/, '');
    if (namespace) {
      return `${base}/${locale}/${namespace}.json`;
    }
    return `${base}/${locale}.json`;
  }

  /**
   * 带重试的执行
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < retries) {
          await this.delay(Math.pow(2, i) * 1000); // 指数退避
        }
      }
    }

    throw lastError;
  }

  /**
   * 并发控制执行
   */
  private async executeWithConcurrency<T>(
    tasks: Array<Promise<T>>,
    concurrent: number
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Array<Promise<void>> = [];

    for (const task of tasks) {
      const promise = task.then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrent) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * 空闲时预加载
   */
  private preloadOnIdle(): void {
    if ('requestIdleCallback' in window) {
      this.idleCallback = window.requestIdleCallback(
        () => this.processPreloadQueue(),
        { timeout: this.config?.preloadDelay }
      );
    } else {
      setTimeout(() => this.processPreloadQueue(), this.config?.preloadDelay);
    }
  }

  /**
   * 使用Prefetch预加载
   */
  private preloadWithPrefetch(): void {
    this.preloadQueue.forEach(pattern => {
      const [locale, namespace] = pattern.split(':');
      const url = this.buildUrl(locale, namespace);
      
      // 创建link标签进行prefetch
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'fetch';
      document.head.appendChild(link);
    });
  }

  /**
   * 视口内预加载
   */
  private preloadOnViewport(): void {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              const locale = element.dataset.i18nLocale;
              const namespace = element.dataset.i18nNamespace;
              
              if (locale) {
                this.load(locale, namespace).catch(console.error);
              }
            }
          });
        },
        { rootMargin: '50px' }
      );
    }

    // 监听带有data-i18n-preload属性的元素
    document.querySelectorAll('[data-i18n-preload]').forEach(element => {
      this.observer!.observe(element);
    });
  }

  /**
   * 处理预加载队列
   */
  private async processPreloadQueue(): Promise<void> {
    const tasks = Array.from(this.preloadQueue).map(pattern => {
      const [locale, namespace] = pattern.split(':');
      return this.load(locale, namespace);
    });

    await this.executeWithConcurrency(tasks, this.config?.concurrent!);
    this.preloadQueue.clear();
  }

  /**
   * 解压缩
   */
  private async decompress(data: any): Promise<Messages> {
    if (this.config?.compressionAlgorithm === 'lz-string' && typeof data === 'string') {
      // 使用LZ-string解压
      return JSON.parse(this.lzDecompress(data));
    }
    return data;
  }

  /**
   * LZ-string解压缩
   */
  private lzDecompress(compressed: string): string {
    // 简化的LZ解压实现
    // 实际应用中应使用lz-string库
    return compressed; // Placeholder
  }

  /**
   * 更新加载状态
   */
  private updateLoadState(
    key: string,
    status: LoadState['status'],
    error?: Error,
    messages?: Messages
  ): void {
    const [locale, namespace] = key.split(':');
    this.loadStates.set(key, {
      locale,
      namespace,
      status,
      error,
      timestamp: Date.now(),
      size: messages ? this.estimateSize(messages) : undefined
    });
  }

  /**
   * 估算大小
   */
  private estimateSize(obj: any): number {
    return JSON.stringify(obj).length;
  }

  /**
   * 格式化大小
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * 获取路由对应的命名空间
   */
  private getNamespaceForRoute(route: string): string {
    // 将路由转换为命名空间
    return `routes.${route.replace(/\//g, '.').replace(/^\./, '')}`;
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(locale: Locale, namespace?: string): string {
    return namespace ? `${locale}:${namespace}` : locale;
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 初始化预加载策略
   */
  private initializePreloadStrategy(): void {
    // 监听路由变化
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        const locale = this.getCurrentLocale();
        const route = window.location.pathname;
        this.loadForRoute(route, locale).catch(console.error);
      });
    }
  }

  /**
   * 获取当前语言
   */
  private getCurrentLocale(): Locale {
    return document.documentElement.lang || 'en';
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.idleCallback) {
      window.cancelIdleCallback(this.idleCallback);
    }
    this.cache.clear();
    this.loadStates.clear();
    this.loadingPool.clear();
  }
}

/**
 * 创建懒加载器
 */
export function createLazyLoader(config?: LazyLoadConfig): LazyLoader {
  return new LazyLoader(config);
}