/**
 * Web Worker 处理大数据
 */

/**
 * Worker 任务类型
 */
export type WorkerTask = {
  id: string;
  type: string;
  data: any;
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

    // 创建内联 Worker
    const workerCode = `
      self.addEventListener('message', (e) => {
        const { id, type, data } = e.data;
        
        try {
          let result;
          
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
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          self.postMessage({ id, result });
        } catch (error) {
          self.postMessage({ id, error: error.message });
        }
      });
      
      function optimizeData(data) {
        // 数据优化逻辑
        if (Array.isArray(data)) {
          return data.filter(item => item != null);
        }
        return data;
      }
      
      function transformData(data) {
        // 数据转换逻辑
        return data;
      }
      
      function aggregateData(data) {
        // 数据聚合逻辑
        if (Array.isArray(data)) {
          return {
            sum: data.reduce((a, b) => a + b, 0),
            avg: data.reduce((a, b) => a + b, 0) / data.length,
            min: Math.min(...data),
            max: Math.max(...data)
          };
        }
        return data;
      }
      
      function filterData(data) {
        // 数据过滤逻辑
        if (Array.isArray(data)) {
          return data.filter(item => item !== null && item !== undefined);
        }
        return data;
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
   * 在 Worker 中处理数据
   */
  async processData(data: any, processor: string): Promise<any> {
    if (!this.worker) {
      this.initWorker();
    }

    if (!this.worker) {
      // 如果 Worker 不可用，回退到主线程处理
      return this.fallbackProcess(data, processor);
    }

    const id = this.generateTaskId();

    return new Promise((resolve, reject) => {
      this.taskQueue.set(id, { resolve, reject });

      const task: WorkerTask = {
        id,
        type: processor,
        data,
      };

      this.worker!.postMessage(task);

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
  private fallbackProcess(data: any, processor: string): any {
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
          };
        }
        return data;
      case 'filter':
        return Array.isArray(data)
          ? data.filter(item => item !== null && item !== undefined)
          : data;
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

