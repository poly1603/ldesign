/**
 * @ldesign/i18n - Memory Optimizer
 * 内存优化系统，减少内存占用并提升性能
 */

import type { Messages, Locale } from '../types';

/**
 * 内存优化配置
 */
export interface MemoryOptimizerConfig {
  // 压缩选项
  enableCompression?: boolean;
  compressionThreshold?: number; // 触发压缩的大小阈值（字节）
  compressionLevel?: 'fast' | 'balanced' | 'max';
  
  // 缓存策略
  cacheStrategy?: 'weak' | 'lru' | 'adaptive';
  maxCacheSize?: number; // 最大缓存大小（字节）
  ttl?: number; // 缓存过期时间（毫秒）
  
  // 清理策略
  gcInterval?: number; // 垃圾回收间隔
  gcThreshold?: number; // 触发垃圾回收的内存使用率
  keepAlive?: string[]; // 始终保持的键
  
  // 监控选项
  enableMonitoring?: boolean;
  reportInterval?: number;
}

/**
 * 内存统计
 */
export interface MemoryStats {
  totalSize: number;
  compressedSize: number;
  cacheHits: number;
  cacheMisses: number;
  compressionRatio: number;
  gcRuns: number;
  lastGC: Date | null;
  memoryUsage: {
    used: number;
    limit: number;
    available: number;
  };
}

/**
 * 压缩的消息
 */
interface CompressedMessage {
  compressed: boolean;
  data: string | Messages;
  originalSize: number;
  compressedSize?: number;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

/**
 * 内存优化器
 */
export class MemoryOptimizer {
  private config: MemoryOptimizerConfig;
  private cache: Map<string, CompressedMessage> = new Map();
  private weakCache: WeakMap<object, Messages> = new WeakMap();
  private stats: MemoryStats;
  private gcTimer?: NodeJS.Timer;
  private monitorTimer?: NodeJS.Timer;
  private compressionWorker?: Worker;
  private referenceMap: Map<string, WeakRef<Messages>> = new Map();

  constructor(config: MemoryOptimizerConfig = {}) {
    this.config = {
      enableCompression: true,
      compressionThreshold: 1024, // 1KB
      compressionLevel: 'balanced',
      cacheStrategy: 'adaptive',
      maxCacheSize: 10 * 1024 * 1024, // 10MB
      ttl: 3600000, // 1 hour
      gcInterval: 60000, // 1 minute
      gcThreshold: 0.8, // 80% memory usage
      keepAlive: [],
      enableMonitoring: true,
      reportInterval: 30000, // 30 seconds
      ...config
    };

    this.stats = this.initStats();
    this.initializeGarbageCollection();
    this.initializeMonitoring();
    this.initializeCompressionWorker();
  }

  /**
   * 存储消息
   */
  async store(key: string, messages: Messages): Promise<void> {
    const size = this.estimateSize(messages);
    
    // 决定是否压缩
    if (this.shouldCompress(size)) {
      const compressed = await this.compress(messages);
      this.cache.set(key, {
        compressed: true,
        data: compressed,
        originalSize: size,
        compressedSize: compressed.length,
        timestamp: Date.now(),
        accessCount: 0,
        lastAccess: Date.now()
      });
      
      this.stats.compressedSize += compressed.length;
    } else {
      this.cache.set(key, {
        compressed: false,
        data: messages,
        originalSize: size,
        timestamp: Date.now(),
        accessCount: 0,
        lastAccess: Date.now()
      });
      
      this.stats.totalSize += size;
    }

    // 使用WeakRef存储引用
    this.referenceMap.set(key, new WeakRef(messages));

    // 检查内存限制
    await this.checkMemoryLimit();
  }

  /**
   * 获取消息
   */
  async get(key: string): Promise<Messages | null> {
    // 先检查WeakRef
    const weakRef = this.referenceMap.get(key);
    if (weakRef) {
      const deref = weakRef.deref();
      if (deref) {
        this.stats.cacheHits++;
        return deref;
      }
    }

    // 检查主缓存
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.cacheMisses++;
      return null;
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.cacheMisses++;
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccess = Date.now();
    this.stats.cacheHits++;

    // 解压缩
    if (entry.compressed) {
      const messages = await this.decompress(entry.data as string);
      
      // 如果频繁访问，考虑解压存储
      if (entry.accessCount > 10) {
        entry.compressed = false;
        entry.data = messages;
        delete entry.compressedSize;
      }
      
      return messages;
    }

    return entry.data as Messages;
  }

  /**
   * 删除消息
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      if (entry.compressed) {
        this.stats.compressedSize -= entry.compressedSize!;
      } else {
        this.stats.totalSize -= entry.originalSize;
      }
    }
    
    this.referenceMap.delete(key);
    return this.cache.delete(key);
  }

  /**
   * 清理缓存
   */
  clear(): void {
    this.cache.clear();
    this.referenceMap.clear();
    this.stats = this.initStats();
  }

  /**
   * 获取统计信息
   */
  getStats(): MemoryStats {
    return {
      ...this.stats,
      compressionRatio: this.calculateCompressionRatio(),
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * 优化内存
   */
  async optimize(): Promise<void> {
    console.log('[MemoryOptimizer] Starting optimization...');
    
    // 1. 压缩未压缩的大对象
    await this.compressLargeObjects();
    
    // 2. 清理过期缓存
    this.cleanExpiredCache();
    
    // 3. 清理低频访问的缓存
    this.cleanLowFrequencyCache();
    
    // 4. 整理内存碎片
    await this.defragmentMemory();
    
    // 5. 触发垃圾回收
    this.triggerGC();
    
    console.log('[MemoryOptimizer] Optimization complete');
  }

  /**
   * 压缩大对象
   */
  private async compressLargeObjects(): Promise<void> {
    const tasks: Promise<void>[] = [];
    
    for (const [key, entry] of this.cache) {
      if (!entry.compressed && entry.originalSize > this.config.compressionThreshold!) {
        tasks.push(this.compressEntry(key, entry));
      }
    }
    
    await Promise.all(tasks);
  }

  /**
   * 压缩单个条目
   */
  private async compressEntry(key: string, entry: CompressedMessage): Promise<void> {
    const compressed = await this.compress(entry.data as Messages);
    entry.compressed = true;
    entry.data = compressed;
    entry.compressedSize = compressed.length;
    
    this.stats.totalSize -= entry.originalSize;
    this.stats.compressedSize += compressed.length;
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const expired: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry) && !this.config.keepAlive?.includes(key)) {
        expired.push(key);
      }
    }
    
    expired.forEach(key => this.delete(key));
    
    if (expired.length > 0) {
      console.log(`[MemoryOptimizer] Cleaned ${expired.length} expired entries`);
    }
  }

  /**
   * 清理低频访问缓存
   */
  private cleanLowFrequencyCache(): void {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    // 按访问频率和最后访问时间排序
    entries.sort((a, b) => {
      const scoreA = a[1].accessCount / (now - a[1].lastAccess);
      const scoreB = b[1].accessCount / (now - b[1].lastAccess);
      return scoreA - scoreB;
    });
    
    // 删除得分最低的条目
    let currentSize = this.getCurrentSize();
    const targetSize = this.config.maxCacheSize! * 0.7; // 目标70%容量
    
    for (const [key, entry] of entries) {
      if (currentSize <= targetSize) break;
      if (!this.config.keepAlive?.includes(key)) {
        currentSize -= entry.compressed ? entry.compressedSize! : entry.originalSize;
        this.delete(key);
      }
    }
  }

  /**
   * 整理内存碎片
   */
  private async defragmentMemory(): Promise<void> {
    // 重新构建缓存以减少碎片
    const entries = Array.from(this.cache.entries());
    this.cache = new Map(entries);
    
    // 清理弱引用
    const validRefs: Array<[string, WeakRef<Messages>]> = [];
    for (const [key, ref] of this.referenceMap) {
      if (ref.deref()) {
        validRefs.push([key, ref]);
      }
    }
    this.referenceMap = new Map(validRefs);
  }

  /**
   * 压缩数据
   */
  private async compress(data: Messages): Promise<string> {
    const json = JSON.stringify(data);
    
    if (this.compressionWorker) {
      // 使用Worker线程压缩
      return new Promise((resolve) => {
        this.compressionWorker!.postMessage({ action: 'compress', data: json });
        this.compressionWorker!.onmessage = (e) => resolve(e.data);
      });
    }
    
    // 使用主线程压缩（简化的LZ压缩）
    return this.lzCompress(json);
  }

  /**
   * 解压缩数据
   */
  private async decompress(compressed: string): Promise<Messages> {
    if (this.compressionWorker) {
      return new Promise((resolve) => {
        this.compressionWorker!.postMessage({ action: 'decompress', data: compressed });
        this.compressionWorker!.onmessage = (e) => resolve(JSON.parse(e.data));
      });
    }
    
    return JSON.parse(this.lzDecompress(compressed));
  }

  /**
   * LZ压缩算法（简化版）
   */
  private lzCompress(str: string): string {
    // 简单的字典压缩
    const dict: Map<string, number> = new Map();
    let compressed = '';
    let dictIndex = 0;
    
    const words = str.split(/(\s+|[{}":,\[\]])/);
    
    for (const word of words) {
      if (word.length > 3) {
        if (!dict.has(word)) {
          dict.set(word, dictIndex++);
          compressed += word;
        } else {
          compressed += `~${dict.get(word)}~`;
        }
      } else {
        compressed += word;
      }
    }
    
    // 存储字典
    const dictStr = Array.from(dict.entries())
      .map(([k, v]) => `${v}:${k}`)
      .join('|');
    
    return `${dictStr}||${compressed}`;
  }

  /**
   * LZ解压缩算法
   */
  private lzDecompress(compressed: string): string {
    const [dictStr, data] = compressed.split('||');
    const dict: Map<number, string> = new Map();
    
    dictStr.split('|').forEach(item => {
      const [index, word] = item.split(':');
      dict.set(parseInt(index), word);
    });
    
    return data.replace(/~(\d+)~/g, (_, index) => dict.get(parseInt(index)) || '');
  }

  /**
   * 检查是否应该压缩
   */
  private shouldCompress(size: number): boolean {
    return this.config.enableCompression! && size > this.config.compressionThreshold!;
  }

  /**
   * 检查是否过期
   */
  private isExpired(entry: CompressedMessage): boolean {
    return Date.now() - entry.timestamp > this.config.ttl!;
  }

  /**
   * 检查内存限制
   */
  private async checkMemoryLimit(): Promise<void> {
    const currentSize = this.getCurrentSize();
    
    if (currentSize > this.config.maxCacheSize!) {
      await this.optimize();
    }
  }

  /**
   * 获取当前缓存大小
   */
  private getCurrentSize(): number {
    let size = 0;
    
    for (const entry of this.cache.values()) {
      size += entry.compressed ? entry.compressedSize! : entry.originalSize;
    }
    
    return size;
  }

  /**
   * 估算对象大小
   */
  private estimateSize(obj: any): number {
    return JSON.stringify(obj).length * 2; // 假设UTF-16编码
  }

  /**
   * 计算压缩率
   */
  private calculateCompressionRatio(): number {
    if (this.stats.totalSize === 0) return 0;
    return 1 - (this.stats.compressedSize / this.stats.totalSize);
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): MemoryStats['memoryUsage'] {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        used: usage.heapUsed,
        limit: usage.heapTotal,
        available: usage.heapTotal - usage.heapUsed
      };
    }
    
    // 浏览器环境估算
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        available: memory.jsHeapSizeLimit - memory.usedJSHeapSize
      };
    }
    
    return { used: 0, limit: 0, available: 0 };
  }

  /**
   * 初始化统计
   */
  private initStats(): MemoryStats {
    return {
      totalSize: 0,
      compressedSize: 0,
      cacheHits: 0,
      cacheMisses: 0,
      compressionRatio: 0,
      gcRuns: 0,
      lastGC: null,
      memoryUsage: { used: 0, limit: 0, available: 0 }
    };
  }

  /**
   * 初始化垃圾回收
   */
  private initializeGarbageCollection(): void {
    if (this.config.gcInterval) {
      this.gcTimer = setInterval(() => {
        const usage = this.getMemoryUsage();
        const usageRatio = usage.used / usage.limit;
        
        if (usageRatio > this.config.gcThreshold!) {
          this.triggerGC();
        }
      }, this.config.gcInterval);
    }
  }

  /**
   * 触发垃圾回收
   */
  private triggerGC(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc();
      this.stats.gcRuns++;
      this.stats.lastGC = new Date();
      console.log('[MemoryOptimizer] Garbage collection triggered');
    }
  }

  /**
   * 初始化监控
   */
  private initializeMonitoring(): void {
    if (this.config.enableMonitoring) {
      this.monitorTimer = setInterval(() => {
        this.reportStats();
      }, this.config.reportInterval!);
    }
  }

  /**
   * 报告统计信息
   */
  private reportStats(): void {
    const stats = this.getStats();
    console.log('[MemoryOptimizer] Stats:', {
      cacheSize: `${(this.getCurrentSize() / 1024).toFixed(2)} KB`,
      compressionRatio: `${(stats.compressionRatio * 100).toFixed(2)}%`,
      hitRate: `${((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(2)}%`,
      memoryUsage: `${(stats.memoryUsage.used / 1024 / 1024).toFixed(2)} MB / ${(stats.memoryUsage.limit / 1024 / 1024).toFixed(2)} MB`
    });
  }

  /**
   * 初始化压缩Worker
   */
  private initializeCompressionWorker(): void {
    if (typeof Worker !== 'undefined') {
      try {
        // Worker代码
        const workerCode = `
          self.onmessage = function(e) {
            const { action, data } = e.data;
            if (action === 'compress') {
              // 压缩逻辑
              self.postMessage(data); // 简化示例
            } else if (action === 'decompress') {
              // 解压逻辑
              self.postMessage(data); // 简化示例
            }
          };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        this.compressionWorker = new Worker(workerUrl);
      } catch (error) {
        console.warn('[MemoryOptimizer] Failed to create compression worker:', error);
      }
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
    }
    this.clear();
  }
}

/**
 * 创建内存优化器
 */
export function createMemoryOptimizer(config?: MemoryOptimizerConfig): MemoryOptimizer {
  return new MemoryOptimizer(config);
}