/**
 * 数据分片加载
 */

/**
 * 数据分片器
 */
export class DataChunker {
  /**
   * 渐进式加载数据
   */
  async *loadInChunks(
    dataSource: any[] | (() => Promise<any[]>),
    chunkSize = 5000
  ): AsyncGenerator<any[], void, unknown> {
    const data =
      typeof dataSource === 'function' ? await dataSource() : dataSource;

    for (let i = 0; i < data.length; i += chunkSize) {
      yield data.slice(i, i + chunkSize);
      // 让出主线程，避免阻塞
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  /**
   * 批量处理数据
   */
  async processBatch<T, R>(
    data: T[],
    processor: (chunk: T[], startIndex: number) => R | Promise<R>,
    options: {
      chunkSize?: number;
      onProgress?: (progress: number) => void;
      delay?: number;
    } = {}
  ): Promise<R[]> {
    const { chunkSize = 1000, onProgress, delay = 0 } = options;
    const results: R[] = [];
    const totalChunks = Math.ceil(data.length / chunkSize);

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const result = await processor(chunk, i);
      results.push(result);

      // 报告进度
      if (onProgress) {
        const progress = Math.min(
          ((i + chunkSize) / data.length) * 100,
          100
        );
        onProgress(progress);
      }

      // 延迟
      if (delay > 0 && i + chunkSize < data.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  /**
   * 并行处理数据
   */
  async processParallel<T, R>(
    data: T[],
    processor: (item: T, index: number) => R | Promise<R>,
    options: {
      concurrency?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<R[]> {
    const { concurrency = 4, onProgress } = options;
    const results: R[] = new Array(data.length);
    let completed = 0;

    const queue = data.map((item, index) => ({ item, index }));

    const worker = async () => {
      while (queue.length > 0) {
        const task = queue.shift();
        if (!task) break;

        const { item, index } = task;
        results[index] = await processor(item, index);
        completed++;

        if (onProgress) {
          onProgress((completed / data.length) * 100);
        }
      }
    };

    // 创建并发工作者
    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    return results;
  }

  /**
   * 流式处理数据
   */
  async *streamProcess<T, R>(
    data: T[],
    processor: (item: T, index: number) => R | Promise<R>,
    chunkSize = 100
  ): AsyncGenerator<R[], void, unknown> {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const results = await Promise.all(
        chunk.map((item, idx) => processor(item, i + idx))
      );
      yield results;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  /**
   * 自适应分片
   */
  adaptiveChunk<T>(
    data: T[],
    options: {
      minChunkSize?: number;
      maxChunkSize?: number;
      targetTime?: number;
    } = {}
  ): T[][] {
    const {
      minChunkSize = 100,
      maxChunkSize = 10000,
      targetTime = 16, // 16ms per frame
    } = options;

    const chunks: T[][] = [];
    let currentChunkSize = minChunkSize;

    for (let i = 0; i < data.length; i += currentChunkSize) {
      const startTime = performance.now();
      const chunk = data.slice(i, i + currentChunkSize);
      chunks.push(chunk);
      const duration = performance.now() - startTime;

      // 自适应调整分片大小
      if (duration < targetTime * 0.5 && currentChunkSize < maxChunkSize) {
        currentChunkSize = Math.min(currentChunkSize * 2, maxChunkSize);
      } else if (duration > targetTime && currentChunkSize > minChunkSize) {
        currentChunkSize = Math.max(currentChunkSize / 2, minChunkSize);
      }
    }

    return chunks;
  }
}

/**
 * 数据流管道
 */
export class DataPipeline<T> {
  private processors: Array<(data: T[]) => T[] | Promise<T[]>> = [];

  /**
   * 添加处理器
   */
  pipe(processor: (data: T[]) => T[] | Promise<T[]>): this {
    this.processors.push(processor);
    return this;
  }

  /**
   * 执行管道
   */
  async execute(data: T[]): Promise<T[]> {
    let result = data;

    for (const processor of this.processors) {
      result = await processor(result);
    }

    return result;
  }

  /**
   * 流式执行
   */
  async *stream(data: T[], chunkSize = 1000): AsyncGenerator<T[], void, unknown> {
    for (let i = 0; i < data.length; i += chunkSize) {
      let chunk = data.slice(i, i + chunkSize);

      for (const processor of this.processors) {
        chunk = await processor(chunk);
      }

      yield chunk;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

