/**
 * 性能基准测试工具
 * 用于测量播放器各个组件的性能指标
 */

export interface BenchmarkResult {
  name: string;
  duration: number;
  memory?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
}

export class PerformanceBenchmark {
  private results: Map<string, BenchmarkResult[]> = new Map();
  private activeTimers: Map<string, number> = new Map();
  private memoryBaseline: number = 0;

  constructor() {
    this.memoryBaseline = this.getMemoryUsage();
  }

  /**
   * 开始性能测试
   */
  public start(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.activeTimers.set(name, startTime);
    
    // 记录开始时的内存使用
    if (metadata) {
      metadata.startMemory = this.getMemoryUsage();
    }
  }

  /**
   * 结束性能测试
   */
  public end(name: string, metadata?: Record<string, any>): BenchmarkResult {
    const endTime = performance.now();
    const startTime = this.activeTimers.get(name);
    
    if (!startTime) {
      throw new Error(`No active timer found for: ${name}`);
    }
    
    this.activeTimers.delete(name);
    
    const duration = endTime - startTime;
    const memory = this.getMemoryUsage();
    
    const result: BenchmarkResult = {
      name,
      duration,
      memory,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        endMemory: memory,
        memoryDelta: memory - this.memoryBaseline
      }
    };
    
    // 存储结果
    if (!this.results.has(name)) {
      this.results.set(name, []);
    }
    this.results.get(name)!.push(result);
    
    return result;
  }

  /**
   * 测量函数执行时间
   */
  public async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; benchmark: BenchmarkResult }> {
    this.start(name, metadata);
    
    try {
      const result = await fn();
      const benchmark = this.end(name, metadata);
      return { result, benchmark };
    } catch (error) {
      this.activeTimers.delete(name);
      throw error;
    }
  }

  /**
   * 批量测试
   */
  public async measureBatch(
    tests: Array<{
      name: string;
      fn: () => any | Promise<any>;
      metadata?: Record<string, any>;
    }>
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    
    for (const test of tests) {
      const { benchmark } = await this.measure(test.name, test.fn, test.metadata);
      results.push(benchmark);
    }
    
    return results;
  }

  /**
   * 获取测试套件结果
   */
  public getSuite(name: string): BenchmarkSuite | null {
    const results = this.results.get(name);
    if (!results || results.length === 0) {
      return null;
    }
    
    const durations = results.map(r => r.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    
    return {
      name,
      results: [...results],
      totalDuration,
      averageDuration: totalDuration / results.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations)
    };
  }

  /**
   * 获取所有结果
   */
  public getAllResults(): Map<string, BenchmarkResult[]> {
    return new Map(this.results);
  }

  /**
   * 清除结果
   */
  public clear(name?: string): void {
    if (name) {
      this.results.delete(name);
    } else {
      this.results.clear();
    }
  }

  /**
   * 导出结果为JSON
   */
  public export(): string {
    const data = {
      timestamp: Date.now(),
      memoryBaseline: this.memoryBaseline,
      results: Object.fromEntries(this.results)
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * 生成性能报告
   */
  public generateReport(): string {
    let report = '# 性能基准测试报告\n\n';
    report += `生成时间: ${new Date().toLocaleString()}\n`;
    report += `内存基线: ${this.formatMemory(this.memoryBaseline)}\n\n`;
    
    for (const [name, results] of this.results) {
      const suite = this.getSuite(name)!;
      report += `## ${name}\n`;
      report += `- 测试次数: ${results.length}\n`;
      report += `- 总耗时: ${suite.totalDuration.toFixed(2)}ms\n`;
      report += `- 平均耗时: ${suite.averageDuration.toFixed(2)}ms\n`;
      report += `- 最小耗时: ${suite.minDuration.toFixed(2)}ms\n`;
      report += `- 最大耗时: ${suite.maxDuration.toFixed(2)}ms\n`;
      
      if (results.length > 0 && results[0].memory) {
        const avgMemory = results.reduce((sum, r) => sum + (r.memory || 0), 0) / results.length;
        report += `- 平均内存: ${this.formatMemory(avgMemory)}\n`;
      }
      
      report += '\n';
    }
    
    return report;
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * 格式化内存大小
   */
  private formatMemory(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * 播放器专用基准测试
 */
export class PlayerBenchmark extends PerformanceBenchmark {
  /**
   * 测试播放器初始化性能
   */
  public async measurePlayerInit(initFn: () => Promise<any>): Promise<BenchmarkResult> {
    return (await this.measure('player-init', initFn, {
      type: 'initialization',
      component: 'player'
    })).benchmark;
  }

  /**
   * 测试插件加载性能
   */
  public async measurePluginLoad(
    pluginName: string,
    loadFn: () => Promise<any>
  ): Promise<BenchmarkResult> {
    return (await this.measure(`plugin-load-${pluginName}`, loadFn, {
      type: 'plugin-load',
      component: 'plugin',
      pluginName
    })).benchmark;
  }

  /**
   * 测试视频加载性能
   */
  public async measureVideoLoad(
    videoUrl: string,
    loadFn: () => Promise<any>
  ): Promise<BenchmarkResult> {
    return (await this.measure('video-load', loadFn, {
      type: 'video-load',
      component: 'media',
      videoUrl,
      videoSize: await this.getVideoSize(videoUrl)
    })).benchmark;
  }

  /**
   * 测试渲染性能
   */
  public measureRenderPerformance(
    componentName: string,
    renderFn: () => void
  ): BenchmarkResult {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    
    const result: BenchmarkResult = {
      name: `render-${componentName}`,
      duration: endTime - startTime,
      memory: this.getMemoryUsage(),
      timestamp: Date.now(),
      metadata: {
        type: 'render',
        component: componentName
      }
    };
    
    if (!this.results.has(result.name)) {
      this.results.set(result.name, []);
    }
    this.results.get(result.name)!.push(result);
    
    return result;
  }

  /**
   * 获取视频文件大小
   */
  private async getVideoSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch {
      return 0;
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}

// 全局基准测试实例
export const globalBenchmark = new PlayerBenchmark();

// 装饰器：自动测量方法性能
export function benchmark(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const benchmarkName = name || `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = async function (...args: any[]) {
      return globalBenchmark.measure(benchmarkName, () => originalMethod.apply(this, args));
    };
    
    return descriptor;
  };
}
