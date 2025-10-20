/**
 * 性能优化模块
 * Web Workers支持、批量操作优化、懒加载
 */

import type { ColorInput } from '../types';
import { Color } from '../core/Color';

/**
 * 批量操作选项
 */
export interface BatchOptions {
  parallel?: boolean;      // 是否并行处理
  chunkSize?: number;       // 分块大小
  useWorker?: boolean;      // 是否使用Web Worker
  onProgress?: (progress: number) => void;
}

/**
 * Worker消息类型
 */
/**
 * Worker响应类型
 */
interface WorkerResponse {
  id: string;
  result?: any;
  error?: string;
}

/**
 * 性能监控数据
 */
export interface PerformanceMetrics {
  operationCount: number;
  totalTime: number;
  averageTime: number;
  cacheHitRate: number;
  memoryUsage?: number;
}

/**
 * 批量颜色处理�?
 */
export class BatchColorProcessor {
  private worker?: Worker;
  private workerReady = false;
  private pendingTasks = new Map<string, (result: any) => void>();
  private metrics: PerformanceMetrics = {
    operationCount: 0,
    totalTime: 0,
    averageTime: 0,
    cacheHitRate: 0
  };
  
  constructor() {
    if (typeof Worker !== 'undefined') {
      this.initWorker();
    }
  }
  
  /**
   * 初始化Web Worker
   */
  private initWorker(): void {
    // 创建内联Worker
    const workerCode = `
      // Worker内的颜色处理逻辑
      function processColor(operation, color, params) {
        // 简化的颜色处理（实际应该导入完整的Color类）
        switch(operation) {
          case 'lighten':
            return lightenColor(color, params.amount);
          case 'darken':
            return darkenColor(color, params.amount);
          case 'saturate':
            return saturateColor(color, params.amount);
          case 'rotate':
            return rotateHue(color, params.degrees);
          default:
            return color;
        }
      }
      
      function lightenColor(color, amount) {
        // 简化实�?
        return color;
      }
      
      function darkenColor(color, amount) {
        // 简化实�?
        return color;
      }
      
      function saturateColor(color, amount) {
        // 简化实�?
        return color;
      }
      
      function rotateHue(color, degrees) {
        // 简化实�?
        return color;
      }
      
      // 处理批量操作
      function processBatch(colors, operation, params) {
        return colors.map(color => processColor(operation, color, params));
      }
      
      // 监听消息
      self.addEventListener('message', (e) => {
        const { id, type, data } = e.data;
        
        try {
          let result;
          
          switch(type) {
            case 'process':
              result = processColor(data.operation, data.color, data.params);
              break;
            case 'batch':
              result = processBatch(data.colors, data.operation, data.params);
              break;
            default:
              throw new Error('Unknown operation type');
          }
          
          self.postMessage({ id, result });
        } catch (error) {
          self.postMessage({ id, error: error.message });
        }
      });
    `;
    
    // 创建Blob URL
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    this.worker = new Worker(workerUrl);
    
    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, result, error } = e.data;
      const resolver = this.pendingTasks.get(id);
      
      if (resolver) {
        if (error) {
          console.error('Worker error:', error);
          resolver(null);
        } else {
          resolver(result);
        }
        this.pendingTasks.delete(id);
      }
    };
    
    this.workerReady = true;
    
    // 清理URL
    URL.revokeObjectURL(workerUrl);
  }
  
  /**
   * 批量处理颜色
   */
  async batchProcess<T>(
    colors: ColorInput[],
    processor: (color: Color) => T,
    options: BatchOptions = {}
  ): Promise<T[]> {
    const startTime = performance.now();
    const {
      parallel = true,
      chunkSize = 100,
      useWorker = false,
      onProgress
    } = options;
    
    const colorInstances = colors.map(c => new Color(c));
    const results: T[] = [];
    
    if (parallel && !useWorker) {
      // 使用Promise.all并行处理
      const chunks = this.chunkArray(colorInstances, chunkSize);
      let processed = 0;
      
      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map(async color => processor(color))
        );
        results.push(...chunkResults);
        
        processed += chunk.length;
        if (onProgress) {
          onProgress((processed / colors.length) * 100);
        }
      }
    } else if (useWorker && this.workerReady) {
      // 使用Web Worker处理
      const taskId = this.generateTaskId();
      
      return new Promise((resolve) => {
        this.pendingTasks.set(taskId, (result) => {
          resolve(result);
        });
        
        this.worker!.postMessage({
          id: taskId,
          type: 'batch',
          data: {
            colors,
            operation: 'process',
            params: {}
          }
        });
      });
    } else {
      // 串行处理
      for (let i = 0; i < colorInstances.length; i++) {
        results.push(processor(colorInstances[i]));
        
        if (onProgress && i % 10 === 0) {
          onProgress((i / colors.length) * 100);
        }
      }
    }
    
    // 更新性能指标
    const endTime = performance.now();
    this.updateMetrics(colors.length, endTime - startTime);
    
    return results;
  }
  
  /**
   * 批量转换颜色格式
   */
  async batchConvert(
    colors: ColorInput[],
    format: 'hex' | 'rgb' | 'hsl' | 'hsv',
    options: BatchOptions = {}
  ): Promise<string[]> {
    return this.batchProcess(
      colors,
      (color) => {
        switch (format) {
          case 'hex':
            return color.toHex();
          case 'rgb':
            return color.toRGBString();
          case 'hsl':
            return color.toHSLString();
          default:
            return color.toString(format);
        }
      },
      options
    );
  }
  
  /**
   * 批量颜色操作
   */
  async batchManipulate(
    colors: ColorInput[],
    operation: 'lighten' | 'darken' | 'saturate' | 'desaturate' | 'rotate',
    amount: number,
    options: BatchOptions = {}
  ): Promise<Color[]> {
    return this.batchProcess(
      colors,
      (color) => {
        switch (operation) {
          case 'lighten':
            return color.lighten(amount);
          case 'darken':
            return color.darken(amount);
          case 'saturate':
            return color.saturate(amount);
          case 'desaturate':
            return color.desaturate(amount);
          case 'rotate':
            return color.rotate(amount);
          default:
            return color;
        }
      },
      options
    );
  }
  
  /**
   * 批量分析颜色
   */
  async batchAnalyze(
    colors: ColorInput[],
    options: BatchOptions = {}
  ): Promise<Array<{
    luminance: number;
    isLight: boolean;
    hsl: { h: number; s: number; l: number };
  }>> {
    return this.batchProcess(
      colors,
      (color) => ({
        luminance: color.getLuminance(),
        isLight: color.isLight(),
        hsl: color.toHSL()
      }),
      options
    );
  }
  
  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 更新性能指标
   */
  private updateMetrics(count: number, time: number): void {
    this.metrics.operationCount += count;
    this.metrics.totalTime += time;
    this.metrics.averageTime = this.metrics.totalTime / this.metrics.operationCount;
  }
  
  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  /**
   * 重置性能指标
   */
  resetMetrics(): void {
    this.metrics = {
      operationCount: 0,
      totalTime: 0,
      averageTime: 0,
      cacheHitRate: 0
    };
  }
  
  /**
   * 销毁Worker
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
      this.workerReady = false;
    }
  }
}

/**
 * 懒加载管理器
 */
export class LazyColorLoader {
  private loadedModules = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();
  
  /**
   * 懒加载高级功能模�?
   */
  async loadModule(moduleName: string): Promise<any> {
    if (this.loadedModules.has(moduleName)) {
      return true;
    }
    
    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName);
    }
    
    const loadPromise = this.dynamicImport(moduleName);
    this.loadingPromises.set(moduleName, loadPromise);
    
    try {
      const module = await loadPromise;
      this.loadedModules.add(moduleName);
      this.loadingPromises.delete(moduleName);
      return module;
    } catch (error) {
      this.loadingPromises.delete(moduleName);
      throw error;
    }
  }
  
  /**
   * 动态导入模�?
   */
  private async dynamicImport(moduleName: string): Promise<any> {
    switch (moduleName) {
      case 'gradient':
        return import('../gradient');
      case 'analyzer':
        return import('../analyzer');
      case 'brand':
        return import('../brand');
      case 'ai':
        return import('../ai/colorAI');
      case 'accessibility':
        return import('../accessibility');
      case 'schemes':
        return import('../schemes');
      default:
        throw new Error(`Unknown module: ${moduleName}`);
    }
  }
  
  /**
   * 预加载关键模�?
   */
  async preloadCriticalModules(): Promise<void> {
    const criticalModules = ['gradient', 'schemes', 'accessibility'];
    await Promise.all(criticalModules.map(m => this.loadModule(m)));
  }
  
  /**
   * 检查模块是否已加载
   */
  isModuleLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }
  
  /**
   * 获取已加载的模块列表
   */
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules);
  }
}

/**
 * 性能优化工具�?
 */
export class ColorPerformance {
  private static batchProcessor = new BatchColorProcessor();
  private static lazyLoader = new LazyColorLoader();
  
  /**
   * 批量处理
   */
  static batch = {
    process: this.batchProcessor.batchProcess.bind(this.batchProcessor),
    convert: this.batchProcessor.batchConvert.bind(this.batchProcessor),
    manipulate: this.batchProcessor.batchManipulate.bind(this.batchProcessor),
    analyze: this.batchProcessor.batchAnalyze.bind(this.batchProcessor)
  };
  
  /**
   * 懒加�?
   */
  static lazy = {
    load: this.lazyLoader.loadModule.bind(this.lazyLoader),
    preload: this.lazyLoader.preloadCriticalModules.bind(this.lazyLoader),
    isLoaded: this.lazyLoader.isModuleLoaded.bind(this.lazyLoader),
    getLoaded: this.lazyLoader.getLoadedModules.bind(this.lazyLoader)
  };
  
  /**
   * 性能监控
   */
  static monitor = {
    getMetrics: () => this.batchProcessor.getMetrics(),
    resetMetrics: () => this.batchProcessor.resetMetrics()
  };
  
  /**
   * 优化建议
   */
  static getOptimizationSuggestions(): string[] {
    const metrics = this.batchProcessor.getMetrics();
    const suggestions: string[] = [];
    
    if (metrics.averageTime > 10) {
      suggestions.push('考虑使用Web Worker进行批量处理');
    }
    
    if (metrics.operationCount > 1000) {
      suggestions.push('建议增加缓存大小以提高性能');
    }
    
    if (metrics.cacheHitRate < 0.5) {
      suggestions.push('缓存命中率较低，考虑预热常用颜色');
    }
    
    return suggestions;
  }
}

// 导出便捷函数
export const batchProcess = ColorPerformance.batch.process;
export const batchConvert = ColorPerformance.batch.convert;
export const batchManipulate = ColorPerformance.batch.manipulate;
export const batchAnalyze = ColorPerformance.batch.analyze;
export const lazyLoad = ColorPerformance.lazy.load;
export const preloadModules = ColorPerformance.lazy.preload;