/**
 * 简易请求队列管理器
 * - 支持并发上限
 * - 支持优先级（数值越大优先级越高）
 * - 支持最大排队长度
 */
export interface RequestQueueConfig {
  enabled?: boolean
  concurrency?: number
  maxQueue?: number
}

interface Task<T> {
  id: number
  run: () => Promise<T>
  resolve: (v: T) => void
  reject: (e: unknown) => void
  priority: number
}

export class RequestQueueManager {
  private running = 0
  private queue: Task<unknown>[] = []
  private idSeq = 0

  constructor(private config: Required<RequestQueueConfig>) {}

  updateConfig(config: Partial<RequestQueueConfig>) {
    this.config = { ...this.config, ...config } as Required<RequestQueueConfig>
  }

  enqueue<T>(fn: () => Promise<T>, priority = 0): Promise<T> {
    if (!this.config?.enabled)
      return fn()

    if (this.config?.maxQueue > 0 && this.queue.length >= this.config?.maxQueue) {
      return Promise.reject(new Error('Request queue overflow'))
    }

    return new Promise<T>((resolve, reject) => {
      const task: Task<T> = {
        id: ++this.idSeq,
        run: fn,
        resolve,
        reject,
        priority,
      }
      
      // 优化：使用二分查找插入位置，避免每次都排序整个数组
      // 时间复杂度从 O(n log n) 降为 O(n)
      const insertIndex = this.findInsertIndex(task as unknown as Task<unknown>)
      this.queue.splice(insertIndex, 0, task as unknown as Task<unknown>)
      
      this.pump()
    })
  }
  
  /**
   * 二分查找插入位置（优化版）
   * 按优先级降序，同优先级按 ID 升序（FIFO）
   */
  private findInsertIndex(task: Task<unknown>): number {
    let left = 0
    let right = this.queue.length
    
    while (left < right) {
      const mid = (left + right) >>> 1 // 使用位运算优化除法
      const comparison = this.queue[mid].priority - task.priority
      
      if (comparison > 0 || (comparison === 0 && this.queue[mid].id < task.id)) {
        left = mid + 1
      } else {
        right = mid
      }
    }
    
    return left
  }

  private pump() {
    while (this.running < this.config?.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!
      this.running++
      task.run()
        .then(v => task.resolve(v as unknown))
        .catch(e => task.reject(e))
        .finally(() => {
          this.running--
          this.pump()
        })
    }
  }

  size() {
    return {
      running: this.running,
      queued: this.queue.length,
      concurrency: this.config?.concurrency,
    }
  }

  /**
   * 清空队列（优化版：拒绝所有待处理任务，防止内存泄漏）
   */
  clear() {
    // 拒绝所有待处理的任务
    for (const task of this.queue) {
      task.reject(new Error('Queue cleared'))
    }
    this.queue = []
  }
  
  /**
   * 销毁队列管理器
   */
  destroy() {
    this.clear()
  }
}
