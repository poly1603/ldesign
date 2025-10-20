import type { Ref } from 'vue'
import type { HttpClient, RequestConfig } from '../types'
import { computed, ref } from 'vue'

/**
 * 请求队列项
 */
interface QueueItem<T> {
  id: string
  config: RequestConfig
  priority: number
  resolve: (value: T) => void
  reject: (error: any) => void
  createdAt: number
}

/**
 * 请求队列配置
 */
export interface RequestQueueConfig {
  /** 最大并发数 */
  concurrency?: number
  /** 是否自动开始 */
  autoStart?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
}

/**
 * 请求队列 Hook
 *
 * 管理请求队列,控制并发,支持优先级
 *
 * @example
 * ```typescript
 * const queue = useRequestQueue(client, { concurrency: 3 })
 *
 * // 添加请求到队列
 * const result1 = await queue.enqueue({ url: '/api/data1' }, 1)
 * const result2 = await queue.enqueue({ url: '/api/data2' }, 2) // 高优先级
 *
 * // 查看队列状态
 *  // 2
 *  // 3
 * ```
 */
export function useRequestQueue<T = any>(
  client: HttpClient,
  config: RequestQueueConfig = {},
) {
  const { concurrency = 6, autoStart = true, timeout = 30000 } = config

  const queue = ref<QueueItem<T>[]>([])
  const activeRequests = ref<Set<string>>(new Set())
  const completedCount = ref(0)
  const failedCount = ref(0)
  const isPaused = ref(!autoStart)

  // 计算属性
  const pending = computed(() => queue.value.length)
  const active = computed(() => activeRequests.value.size)
  const total = computed(() => completedCount.value + failedCount.value + pending.value + active.value)

  /**
   * 添加请求到队列
   */
  const enqueue = (requestConfig: RequestConfig, priority = 0): Promise<T> => {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}-${Math.random()}`
      const item: QueueItem<T> = {
        id,
        config: requestConfig,
        priority,
        resolve,
        reject,
        createdAt: Date.now(),
      }

      // 按优先级插入队列
      const insertIndex = queue.value.findIndex(q => q.priority < priority)
      if (insertIndex === -1) {
        queue.value.push(item)
      }
      else {
        queue.value.splice(insertIndex, 0, item)
      }

      if (!isPaused.value) {
        setTimeout(() => processQueue(), 0)
      }
    })
  }

  /**
   * 执行单个请求
   */
  const executeRequest = async (item: QueueItem<T>) => {
    try {
      // 检查超时
      const elapsed = Date.now() - item.createdAt
      if (elapsed > timeout) {
        throw new Error('Request timeout in queue')
      }

      const response = await client.request<T>(item.config)
      item.resolve(response.data)
      completedCount.value++
    }
    catch (error) {
      item.reject(error)
      failedCount.value++
    }
    finally {
      activeRequests.value.delete(item.id)
      if (!isPaused.value) {
        processQueue()
      }
    }
  }

  /**
   * 处理队列
   */
  async function processQueue() {
    while (
      !isPaused.value
      && queue.value.length > 0
      && activeRequests.value.size < concurrency
    ) {
      const item = queue.value.shift()
      if (!item)
        break

      activeRequests.value.add(item.id)

      // 执行请求
      executeRequest(item).catch(() => {
        // 错误已在executeRequest内部处理
      })
    }
  }


  /**
   * 暂停队列处理
   */
  const pause = () => {
    isPaused.value = true
  }

  /**
   * 恢复队列处理
   */
  const resume = () => {
    isPaused.value = false
    processQueue()
  }

  /**
   * 清空队列
   */
  const clear = () => {
    queue.value.forEach((item) => {
      item.reject(new Error('Queue cleared'))
    })
    queue.value = []
  }

  /**
   * 取消所有活动请求
   */
  const cancelAll = () => {
    client.cancelAll('Queue cancelled')
    activeRequests.value.clear()
  }

  /**
   * 重置统计
   */
  const reset = () => {
    completedCount.value = 0
    failedCount.value = 0
  }

  return {
    // 队列操作
    enqueue,
    pause,
    resume,
    clear,
    cancelAll,
    reset,

    // 状态
    pending,
    active,
    total,
    completed: completedCount,
    failed: failedCount,
    isPaused,

    // 原始数据
    queue: queue as Ref<QueueItem<T>[]>,
    activeRequests,
  }
}
