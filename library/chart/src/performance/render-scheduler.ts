/**
 * RAF 渲染调度器 - 批量处理更新，避免频繁重绘
 */

/**
 * 渲染任务
 */
interface RenderTask {
  id: string;
  callback: () => void;
  priority: number; // 0-10，数字越大优先级越高
  timestamp: number;
}

/**
 * 调度器统计
 */
interface SchedulerStats {
  pending: number;
  completed: number;
  dropped: number;
  avgFrameTime: number;
  fps: number;
}

/**
 * RAF 渲染调度器
 */
export class RenderScheduler {
  private tasks = new Map<string, RenderTask>();
  private isScheduled = false;
  private rafId?: number;

  // 统计信息
  private completedCount = 0;
  private droppedCount = 0;
  private frameTimes: number[] = [];
  private lastFrameTime = 0;

  // 配置
  private maxTasksPerFrame = 10;
  private maxFrameTime = 16; // 目标 60 FPS

  /**
   * 添加渲染任务
   */
  schedule(id: string, callback: () => void, priority = 5): void {
    // 如果任务已存在，更新它
    if (this.tasks.has(id)) {
      const task = this.tasks.get(id)!;
      task.callback = callback;
      task.priority = priority;
      task.timestamp = Date.now();
    } else {
      this.tasks.set(id, {
        id,
        callback,
        priority,
        timestamp: Date.now(),
      });
    }

    // 请求调度
    this.requestSchedule();
  }

  /**
   * 取消任务
   */
  cancel(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * 立即执行任务（跳过调度）
   */
  immediate(callback: () => void): void {
    try {
      callback();
      this.completedCount++;
    } catch (error) {
      console.error('Immediate task failed:', error);
    }
  }

  /**
   * 请求调度
   */
  private requestSchedule(): void {
    if (this.isScheduled || this.tasks.size === 0) return;

    this.isScheduled = true;
    this.rafId = requestAnimationFrame((timestamp) => {
      this.executeTasks(timestamp);
    });
  }

  /**
   * 执行任务
   */
  private executeTasks(timestamp: number): void {
    this.isScheduled = false;

    if (this.tasks.size === 0) return;

    const frameStartTime = performance.now();
    const tasks = this.getSortedTasks();

    let executedCount = 0;

    for (const task of tasks) {
      // 检查是否超过帧时间预算
      const elapsed = performance.now() - frameStartTime;
      if (elapsed > this.maxFrameTime && executedCount > 0) {
        // 超时，剩余任务推迟到下一帧
        break;
      }

      // 检查单帧任务数限制
      if (executedCount >= this.maxTasksPerFrame) {
        break;
      }

      try {
        task.callback();
        this.tasks.delete(task.id);
        this.completedCount++;
        executedCount++;
      } catch (error) {
        console.error(`Render task ${task.id} failed:`, error);
        this.tasks.delete(task.id);
        this.droppedCount++;
      }
    }

    // 记录帧时间
    const frameTime = performance.now() - frameStartTime;
    this.recordFrameTime(frameTime);

    // 如果还有待处理任务，继续调度
    if (this.tasks.size > 0) {
      this.requestSchedule();
    }
  }

  /**
   * 获取排序后的任务
   */
  private getSortedTasks(): RenderTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => {
      // 首先按优先级排序
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // 优先级相同，按时间排序（先进先出）
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * 记录帧时间
   */
  private recordFrameTime(time: number): void {
    this.frameTimes.push(time);

    // 只保留最近 60 帧的数据
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }

    this.lastFrameTime = time;
  }

  /**
   * 清空所有任务
   */
  clear(): void {
    this.tasks.clear();

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }

    this.isScheduled = false;
  }

  /**
   * 获取统计信息
   */
  stats(): SchedulerStats {
    const avgFrameTime = this.frameTimes.length > 0
      ? this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length
      : 0;

    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

    return {
      pending: this.tasks.size,
      completed: this.completedCount,
      dropped: this.droppedCount,
      avgFrameTime,
      fps,
    };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.completedCount = 0;
    this.droppedCount = 0;
    this.frameTimes = [];
  }

  /**
   * 设置每帧最大任务数
   */
  setMaxTasksPerFrame(max: number): void {
    this.maxTasksPerFrame = Math.max(1, max);
  }

  /**
   * 设置最大帧时间（ms）
   */
  setMaxFrameTime(time: number): void {
    this.maxFrameTime = Math.max(1, time);
  }

  /**
   * 获取待处理任务数
   */
  getPendingCount(): number {
    return this.tasks.size;
  }

  /**
   * 检查是否有待处理任务
   */
  hasPending(): boolean {
    return this.tasks.size > 0;
  }

  /**
   * 销毁调度器
   */
  destroy(): void {
    this.clear();
  }
}

/**
 * 渲染队列 - 增量更新
 */
export class RenderQueue {
  private queue: Array<() => void> = [];
  private processing = false;

  /**
   * 添加到队列
   */
  enqueue(task: () => void): void {
    this.queue.push(task);
    this.process();
  }

  /**
   * 批量添加
   */
  enqueueBatch(tasks: Array<() => void>): void {
    this.queue.push(...tasks);
    this.process();
  }

  /**
   * 处理队列
   */
  private async process(): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 10); // 每批处理 10 个

      for (const task of batch) {
        try {
          task();
        } catch (error) {
          console.error('Queue task failed:', error);
        }
      }

      // 让出主线程
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.processing = false;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.queue.length;
  }
}

// 全局调度器实例
export const renderScheduler = new RenderScheduler();
export const renderQueue = new RenderQueue();

