/**
 * Web Worker 处理大数据 - 采样、降采样、二进制传输、数据压缩
 */

/**
 * Worker 任务类型
 */
export type WorkerTask = {
  id: string;
  type: string;
  data: any;
  options?: Record<string, any>;
};

/**
 * Worker 响应类型
 */
export type WorkerResponse = {
  id: string;
  result?: any;
  error?: string;
};

/**
 * Chart Worker 类
 */
export class ChartWorker {
  private worker?: Worker;
  private taskQueue = new Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }>();

  /**
   * 初始化 Worker
   */
  private initWorker(): void {
    if (this.worker) return;

    // 创建内联 Worker（增强版：采样、降采样、压缩）
    const workerCode = `
      self.addEventListener('message', (e) => {
        const { id, type, data, options } = e.data;
        
        try {
          let result;
          let transferable = [];
          
          switch (type) {
            case 'optimize':
              result = optimizeData(data);
              break;
            case 'transform':
              result = transformData(data);
              break;
            case 'aggregate':
              result = aggregateData(data);
              break;
            case 'filter':
              result = filterData(data);
              break;
            case 'sample':
              result = sampleData(data, options);
              break;
            case 'downsample':
              result = downsampleData(data, options);
              break;
            case 'compress':
              result = compressData(data, options);
              break;
            case 'decompress':
              result = decompressData(data, options);
              break;
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          // 检查是否可以使用 Transferable Objects
          if (result instanceof ArrayBuffer || result instanceof TypedArray) {
            transferable = [result];
          }
          
          self.postMessage({ id, result }, transferable);
        } catch (error) {
          self.postMessage({ id, error: error.message });
        }
      });
      
      function optimizeData(data) {
        if (Array.isArray(data)) {
          return data.filter(item => item != null);
        }
        return data;
      }
      
      function transformData(data) {
        return data;
      }
      
      function aggregateData(data) {
        if (Array.isArray(data)) {
          return {
            sum: data.reduce((a, b) => a + b, 0),
            avg: data.reduce((a, b) => a + b, 0) / data.length,
            min: Math.min(...data),
            max: Math.max(...data),
            count: data.length
          };
        }
        return data;
      }
      
      function filterData(data) {
        if (Array.isArray(data)) {
          return data.filter(item => item !== null && item !== undefined);
        }
        return data;
      }
      
      // 采样算法
      function sampleData(data, options = {}) {
        if (!Array.isArray(data)) return data;
        
        const { method = 'uniform', rate = 0.1, count } = options;
        const targetCount = count || Math.max(1, Math.floor(data.length * rate));
        
        if (targetCount >= data.length) return data;
        
        switch (method) {
          case 'uniform':
            return uniformSample(data, targetCount);
          case 'random':
            return randomSample(data, targetCount);
          case 'lttb': // Largest-Triangle-Three-Buckets
            return lttbSample(data, targetCount);
          default:
            return uniformSample(data, targetCount);
        }
      }
      
      function uniformSample(data, count) {
        const step = data.length / count;
        const result = [];
        for (let i = 0; i < count; i++) {
          result.push(data[Math.floor(i * step)]);
        }
        return result;
      }
      
      function randomSample(data, count) {
        const indices = new Set();
        while (indices.size < count) {
          indices.add(Math.floor(Math.random() * data.length));
        }
        return Array.from(indices).sort((a, b) => a - b).map(i => data[i]);
      }
      
      function lttbSample(data, count) {
        if (count <= 2) return [data[0], data[data.length - 1]];
        
        const result = [data[0]];
        const bucketSize = (data.length - 2) / (count - 2);
        
        let a = 0;
        for (let i = 0; i < count - 2; i++) {
          const avgX = (i + 1) * bucketSize + 1;
          const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
          const rangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);
          
          let maxArea = -1;
          let maxAreaIndex = rangeStart;
          
          for (let j = rangeStart; j < rangeEnd; j++) {
            const area = Math.abs(
              (a - avgX) * (getValue(data[j]) - getValue(data[a])) -
              (a - j) * (avgX - getValue(data[a]))
            );
            
            if (area > maxArea) {
              maxArea = area;
              maxAreaIndex = j;
            }
          }
          
          result.push(data[maxAreaIndex]);
          a = maxAreaIndex;
        }
        
        result.push(data[data.length - 1]);
        return result;
      }
      
      function getValue(item) {
        return typeof item === 'number' ? item : (item.value || item.y || item[1] || 0);
      }
      
      // 降采样算法
      function downsampleData(data, options = {}) {
        if (!Array.isArray(data)) return data;
        
        const { window = 10, method = 'average' } = options;
        const result = [];
        
        for (let i = 0; i < data.length; i += window) {
          const chunk = data.slice(i, i + window);
          
          switch (method) {
            case 'average':
              result.push(chunk.reduce((a, b) => a + getValue(b), 0) / chunk.length);
              break;
            case 'max':
              result.push(Math.max(...chunk.map(getValue)));
              break;
            case 'min':
              result.push(Math.min(...chunk.map(getValue)));
              break;
            case 'first':
              result.push(chunk[0]);
              break;
            case 'last':
              result.push(chunk[chunk.length - 1]);
              break;
            default:
              result.push(chunk[0]);
          }
        }
        
        return result;
      }
      
      // 简单的数据压缩（RLE - Run Length Encoding）
      function compressData(data, options = {}) {
        if (!Array.isArray(data)) return data;
        
        const compressed = [];
        let count = 1;
        let current = data[0];
        
        for (let i = 1; i < data.length; i++) {
          if (data[i] === current) {
            count++;
          } else {
            compressed.push({ value: current, count });
            current = data[i];
            count = 1;
          }
        }
        compressed.push({ value: current, count });
        
        return compressed;
      }
      
      function decompressData(compressed, options = {}) {
        if (!Array.isArray(compressed)) return compressed;
        
        const result = [];
        for (const item of compressed) {
          if (item.count && item.value !== undefined) {
            for (let i = 0; i < item.count; i++) {
              result.push(item.value);
            }
          } else {
            result.push(item);
          }
        }
        
        return result;
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);

    try {
      this.worker = new Worker(url);
      this.setupWorker();
    } catch (error) {
      console.warn('Failed to create Worker:', error);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * 设置 Worker 消息处理
   */
  private setupWorker(): void {
    if (!this.worker) return;

    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, result, error } = e.data;
      const task = this.taskQueue.get(id);

      if (task) {
        if (error) {
          task.reject(new Error(error));
        } else {
          task.resolve(result);
        }
        this.taskQueue.delete(id);
      }
    };

    this.worker.onerror = (e) => {
      console.error('Worker error:', e);
      // 拒绝所有待处理的任务
      for (const task of this.taskQueue.values()) {
        task.reject(new Error('Worker error'));
      }
      this.taskQueue.clear();
    };
  }

  /**
   * 在 Worker 中处理数据（支持选项）
   */
  async processData(data: any, processor: string, options?: Record<string, any>): Promise<any> {
    if (!this.worker) {
      this.initWorker();
    }

    if (!this.worker) {
      // 如果 Worker 不可用，回退到主线程处理
      return this.fallbackProcess(data, processor, options);
    }

    const id = this.generateTaskId();

    return new Promise((resolve, reject) => {
      this.taskQueue.set(id, { resolve, reject });

      const task: WorkerTask = {
        id,
        type: processor,
        data,
        options,
      };

      // 尝试使用 Transferable Objects 优化性能
      const transferable: Transferable[] = [];
      if (data instanceof ArrayBuffer) {
        transferable.push(data);
      }

      this.worker!.postMessage(task, transferable);

      // 设置超时
      setTimeout(() => {
        if (this.taskQueue.has(id)) {
          this.taskQueue.delete(id);
          reject(new Error('Worker task timeout'));
        }
      }, 30000); // 30 秒超时
    });
  }

  /**
   * 回退到主线程处理
   */
  private fallbackProcess(data: any, processor: string, options?: Record<string, any>): any {
    switch (processor) {
      case 'optimize':
        return Array.isArray(data) ? data.filter(item => item != null) : data;
      case 'transform':
        return data;
      case 'aggregate':
        if (Array.isArray(data)) {
          return {
            sum: data.reduce((a, b) => a + b, 0),
            avg: data.reduce((a, b) => a + b, 0) / data.length,
            min: Math.min(...data),
            max: Math.max(...data),
            count: data.length,
          };
        }
        return data;
      case 'filter':
        return Array.isArray(data)
          ? data.filter(item => item !== null && item !== undefined)
          : data;
      case 'sample':
        // 简单的采样实现
        if (Array.isArray(data) && options) {
          const rate = options.rate || 0.1;
          const targetCount = options.count || Math.floor(data.length * rate);
          const step = Math.floor(data.length / targetCount);
          return data.filter((_, index) => index % step === 0).slice(0, targetCount);
        }
        return data;
      case 'downsample':
        // 简单的降采样实现
        if (Array.isArray(data) && options) {
          const window = options.window || 10;
          const result = [];
          for (let i = 0; i < data.length; i += window) {
            result.push(data[i]);
          }
          return result;
        }
        return data;
      default:
        return data;
    }
  }

  /**
   * 终止 Worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }

    // 拒绝所有待处理的任务
    for (const task of this.taskQueue.values()) {
      task.reject(new Error('Worker terminated'));
    }
    this.taskQueue.clear();
  }

  /**
   * 生成任务 ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取待处理任务数量
   */
  getPendingCount(): number {
    return this.taskQueue.size;
  }
}

/**
 * Worker 池
 */
export class WorkerPool {
  private workers: ChartWorker[] = [];
  private currentIndex = 0;
  private poolSize: number;

  constructor(poolSize = 4) {
    this.poolSize = poolSize;
    this.initPool();
  }

  /**
   * 初始化 Worker 池
   */
  private initPool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.workers.push(new ChartWorker());
    }
  }

  /**
   * 获取下一个可用的 Worker
   */
  private getNextWorker(): ChartWorker {
    const worker = this.workers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.workers.length;
    return worker;
  }

  /**
   * 处理数据
   */
  async processData(data: any, processor: string): Promise<any> {
    const worker = this.getNextWorker();
    return worker.processData(data, processor);
  }

  /**
   * 并行处理多个任务
   */
  async processParallel(
    tasks: Array<{ data: any; processor: string }>
  ): Promise<any[]> {
    return Promise.all(
      tasks.map((task) => this.processData(task.data, task.processor))
    );
  }

  /**
   * 终止所有 Worker
   */
  terminateAll(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
  }

  /**
   * 获取池统计信息
   */
  stats(): {
    poolSize: number;
    totalPending: number;
  } {
    return {
      poolSize: this.workers.length,
      totalPending: this.workers.reduce(
        (sum, worker) => sum + worker.getPendingCount(),
        0
      ),
    };
  }
}

