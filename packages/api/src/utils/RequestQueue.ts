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
    if (!this.config.enabled) return fn()

    if (this.config.maxQueue > 0 && this.queue.length >= this.config.maxQueue) {
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
      this.queue.push(task as unknown as Task<unknown>)
      // 按优先级排序（降序），同优先级按先入先出
      this.queue.sort((a, b) => b.priority - a.priority || a.id - b.id)
      this.pump()
    })
  }

  private pump() {
    while (this.running < this.config.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!
      this.running++
      task.run()
        .then((v) => task.resolve(v as unknown))
        .catch((e) => task.reject(e))
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
      concurrency: this.config.concurrency,
    }
  }

  clear() {
    this.queue = []
  }
}
