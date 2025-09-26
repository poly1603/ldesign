/**
 * @ldesign/cropper 性能优化工具函数
 * 
 * 提供性能监控、内存管理、渲染优化等工具函数
 */

// ============================================================================
// 性能监控
// ============================================================================

/**
 * 性能计时器类
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;
  private marks: Map<string, number> = new Map();

  /**
   * 开始计时
   */
  start(): void {
    this.startTime = performance.now();
  }

  /**
   * 结束计时
   * @returns 耗时（毫秒）
   */
  end(): number {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  }

  /**
   * 添加标记
   * @param name 标记名称
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * 获取标记间的耗时
   * @param startMark 开始标记
   * @param endMark 结束标记
   * @returns 耗时（毫秒）
   */
  measure(startMark: string, endMark: string): number {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    
    if (start === undefined || end === undefined) {
      throw new Error(`Mark not found: ${startMark} or ${endMark}`);
    }
    
    return end - start;
  }

  /**
   * 获取从开始到标记的耗时
   * @param markName 标记名称
   * @returns 耗时（毫秒）
   */
  measureFromStart(markName: string): number {
    const mark = this.marks.get(markName);
    if (mark === undefined) {
      throw new Error(`Mark not found: ${markName}`);
    }
    return mark - this.startTime;
  }

  /**
   * 清除所有标记
   */
  clear(): void {
    this.marks.clear();
    this.startTime = 0;
    this.endTime = 0;
  }
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private enabled: boolean = true;

  /**
   * 启用性能监控
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用性能监控
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * 记录性能指标
   * @param name 指标名称
   * @param value 指标值
   */
  record(name: string, value: number): void {
    if (!this.enabled) return;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // 保持最近100个值
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * 获取性能统计
   * @param name 指标名称
   * @returns 统计信息
   */
  getStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    latest: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latest = values[values.length - 1];

    return {
      count: values.length,
      min,
      max,
      avg,
      latest
    };
  }

  /**
   * 获取所有指标名称
   * @returns 指标名称数组
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear();
  }
}

// ============================================================================
// 帧率监控
// ============================================================================

/**
 * 帧率监控器类
 */
export class FPSMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private callback?: (fps: number) => void;
  private animationId?: number;

  /**
   * 开始监控
   * @param callback 帧率回调函数
   */
  start(callback?: (fps: number) => void): void {
    this.callback = callback;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.update();
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  /**
   * 获取当前帧率
   * @returns 帧率
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * 更新帧率计算
   */
  private update = (): void => {
    const now = performance.now();
    this.frameCount++;

    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
      
      if (this.callback) {
        this.callback(this.fps);
      }
    }

    this.animationId = requestAnimationFrame(this.update);
  };
}

// ============================================================================
// 内存监控
// ============================================================================

/**
 * 获取内存使用信息
 * @returns 内存信息
 */
export function getMemoryInfo(): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
} {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }
  return {};
}

/**
 * 内存监控器类
 */
export class MemoryMonitor {
  private interval?: number;
  private callback?: (info: any) => void;

  /**
   * 开始监控
   * @param callback 内存信息回调函数
   * @param intervalMs 监控间隔（毫秒）
   */
  start(callback: (info: any) => void, intervalMs: number = 1000): void {
    this.callback = callback;
    this.interval = window.setInterval(() => {
      const memoryInfo = getMemoryInfo();
      if (this.callback) {
        this.callback(memoryInfo);
      }
    }, intervalMs);
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}

// ============================================================================
// 渲染优化
// ============================================================================

/**
 * 请求动画帧的Promise版本
 * @returns Promise<number>
 */
export function requestAnimationFramePromise(): Promise<number> {
  return new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
}

/**
 * 延迟执行函数
 * @param ms 延迟时间（毫秒）
 * @returns Promise<void>
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * 空闲时执行函数
 * @param callback 回调函数
 * @param options 选项
 */
export function requestIdleCallback(
  callback: (deadline: IdleDeadline) => void,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // 降级到setTimeout
    return window.setTimeout(() => {
      const start = performance.now();
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (performance.now() - start))
      } as IdleDeadline);
    }, 1);
  }
}

/**
 * 取消空闲回调
 * @param id 回调ID
 */
export function cancelIdleCallback(id: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

// ============================================================================
// 批处理和队列
// ============================================================================

/**
 * 批处理执行器类
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processing: boolean = false;
  private batchSize: number;
  private processor: (items: T[]) => Promise<void> | void;

  constructor(processor: (items: T[]) => Promise<void> | void, batchSize: number = 10) {
    this.processor = processor;
    this.batchSize = batchSize;
  }

  /**
   * 添加项目到队列
   * @param item 项目
   */
  add(item: T): void {
    this.queue.push(item);
    this.scheduleProcess();
  }

  /**
   * 添加多个项目到队列
   * @param items 项目数组
   */
  addBatch(items: T[]): void {
    this.queue.push(...items);
    this.scheduleProcess();
  }

  /**
   * 调度处理
   */
  private scheduleProcess(): void {
    if (this.processing) return;

    requestIdleCallback(() => {
      this.process();
    });
  }

  /**
   * 处理队列
   */
  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processor(batch);
      
      // 让出控制权
      await requestAnimationFramePromise();
    }

    this.processing = false;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue.length = 0;
  }

  /**
   * 获取队列长度
   * @returns 队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

// ============================================================================
// 缓存管理
// ============================================================================

/**
 * LRU缓存类
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /**
   * 获取值
   * @param key 键
   * @returns 值
   */
  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // 移动到最后（最近使用）
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  /**
   * 设置值
   * @param key 键
   * @param value 值
   */
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // 更新现有值
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  /**
   * 检查是否存在
   * @param key 键
   * @returns 是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除值
   * @param key 键
   * @returns 是否删除成功
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   * @returns 缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有键
   * @returns 键数组
   */
  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取所有值
   * @returns 值数组
   */
  values(): V[] {
    return Array.from(this.cache.values());
  }
}

// ============================================================================
// 资源管理
// ============================================================================

/**
 * 资源管理器类
 */
export class ResourceManager {
  private resources: Set<() => void> = new Set();

  /**
   * 注册资源清理函数
   * @param cleanup 清理函数
   */
  register(cleanup: () => void): void {
    this.resources.add(cleanup);
  }

  /**
   * 注销资源清理函数
   * @param cleanup 清理函数
   */
  unregister(cleanup: () => void): void {
    this.resources.delete(cleanup);
  }

  /**
   * 清理所有资源
   */
  cleanup(): void {
    this.resources.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during resource cleanup:', error);
      }
    });
    this.resources.clear();
  }

  /**
   * 获取资源数量
   * @returns 资源数量
   */
  getResourceCount(): number {
    return this.resources.size;
  }
}

// ============================================================================
// 全局性能监控实例
// ============================================================================

export const globalPerformanceMonitor = new PerformanceMonitor();
export const globalResourceManager = new ResourceManager();
