/**
 * Vue 智能轮询 Composable
 *
 * 自动轮询请求，支持条件停止、错误处理、网络感知等
 */

import type { Ref } from 'vue'
import type { HttpClient, RequestConfig } from '../types'
import { onUnmounted, ref } from 'vue'
import { createHttpClient } from '../factory'

/**
 * 轮询配置
 */
export interface PollingConfig {
 /** 轮询间隔(ms) */
 interval: number
 /** 是否立即执行第一次请求 */
 immediate?: boolean
 /** 是否在页面不可见时暂停 */
 pauseWhenHidden?: boolean
 /** 是否在离线时暂停 */
 pauseWhenOffline?: boolean
 /** 最大轮询次数 */
 maxPolls?: number
 /** 停止条件 */
 stopWhen?: (data: any) => boolean
 /** 错误时是否停止 */
 stopOnError?: boolean
 /** 成功回调 */
 onSuccess?: (data: any) => void
 /** 错误回调 */
 onError?: (error: Error) => void
 /** 使用自定义客户端 */
 client?: HttpClient
}

/**
 * 轮询返回值
 */
export interface UsePollingReturn<T> {
 /** 数据 */
 data: Ref<T | null>
 /** 加载状态 */
 loading: Ref<boolean>
 /** 错误 */
 error: Ref<Error | null>
 /** 是否正在轮询 */
 isPolling: Ref<boolean>
 /** 已轮询次数 */
 pollCount: Ref<number>
 /** 开始轮询 */
 start: () => void
 /** 停止轮询 */
 stop: () => void
 /** 重启轮询 */
 restart: () => void
 /** 手动执行一次 */
 execute: () => Promise<T | null>
}

/**
 * 智能轮询 Hook
 *
 * 自动轮询请求，支持丰富的配置选项
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePolling } from '@ldesign/http'
 *
 * // 每5秒轮询任务状态，直到任务完成
 * const { data: task, isPolling, stop } = usePolling(
 *  { url: '/api/tasks/123' },
 *  {
 *   interval: 5000,
 *   stopWhen: (task) => task.status === 'completed',
 *   onSuccess: (task) => {
 *    if (task.status === 'completed') {
 *     
 *    }
 *   },
 *  }
 * )
 * </script>
 *
 * <template>
 *  <div>
 *   <div v-if="task">状态: {{ task.status }}</div>
 *   <button v-if="isPolling" @click="stop">停止轮询</button>
 *  </div>
 * </template>
 * ```
 */
export function usePolling<T = any>(
 requestConfig: RequestConfig,
 config: PollingConfig,
): UsePollingReturn<T> {
 const client = config.client || createHttpClient()

 const data = ref<T | null>(null)
 const loading = ref(false)
 const error = ref<Error | null>(null)
 const isPolling = ref(false)
 const pollCount = ref(0)

 let timerId: ReturnType<typeof setTimeout> | null = null
 let isPageVisible = true
 let isOnline = true

  /**
   * 安排下一次轮询
   */
  function scheduleNext() {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(pollLoop, config.interval)
  }

  /**
   * 停止轮询
   */
  const stop = () => {
    isPolling.value = false

    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  /**
   * 执行单次请求
   */
  async function execute(): Promise<T | null> {
  try {
   loading.value = true
   error.value = null

   const response = await client.request<T>(requestConfig)
   data.value = response.data
   pollCount.value++

   // 触发成功回调
   config.onSuccess?.(response.data)

   // 检查停止条件
   if (config.stopWhen?.(response.data)) {
    stop()
   }

   // 检查最大轮询次数
   if (config.maxPolls && pollCount.value >= config.maxPolls) {
    stop()
   }

   return response.data
  }
  catch (err) {
   const errorObj = err as Error
   error.value = errorObj

   // 触发错误回调
   config.onError?.(errorObj)

   // 错误时是否停止
   if (config.stopOnError) {
    stop()
   }

   return null
  }
  finally {
   loading.value = false
  }
 }

 /**
  * 轮询循环
  */
 async function pollLoop() {
  if (!isPolling.value) return

  // 检查暂停条件
  if (config.pauseWhenHidden && !isPageVisible) {
   // 页面不可见，延迟后继续
   scheduleNext()
   return
  }

  if (config.pauseWhenOffline && !isOnline) {
   // 离线，延迟后继续
   scheduleNext()
   return
  }

  // 执行请求
  await execute()

  // 如果还在轮询，安排下一次
  if (isPolling.value) {
   scheduleNext()
  }
 }

  /**
   * 开始轮询
   */
  function start() {
    if (isPolling.value) return

    isPolling.value = true
    pollCount.value = 0

    // 立即执行
    if (config.immediate !== false) {
      pollLoop()
    }
    else {
      scheduleNext()
    }
  }

 /**
  * 重启轮询
  */
 function restart() {
  stop()
  start()
 }

 // 监听页面可见性
 if (config.pauseWhenHidden && typeof document !== 'undefined') {
  const handleVisibilityChange = () => {
   isPageVisible = !document.hidden
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  onUnmounted(() => {
   document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
 }

 // 监听网络状态
 if (config.pauseWhenOffline && typeof window !== 'undefined') {
  const handleOnline = () => {
   isOnline = true
  }
  const handleOffline = () => {
   isOnline = false
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  onUnmounted(() => {
   window.removeEventListener('online', handleOnline)
   window.removeEventListener('offline', handleOffline)
  })
 }

 // 组件卸载时停止轮询
 onUnmounted(() => {
  stop()
 })

 // 自动开始
 if (config.immediate !== false) {
  start()
 }

 return {
  data: data as Ref<T | null>,
  loading,
  error,
  isPolling,
  pollCount,
  start,
  stop,
  restart,
  execute,
 }
}

/**
 * 轮询直到条件满足
 *
 * 简化版本，只需要提供停止条件
 */
export function usePollingUntil<T = any>(
 requestConfig: RequestConfig,
 stopWhen: (data: T) => boolean,
 interval = 3000,
): UsePollingReturn<T> {
 return usePolling<T>(requestConfig, {
  interval,
  stopWhen,
  immediate: true,
 })
}

/**
 * 轮询N次
 *
 * 简化版本，轮询固定次数后自动停止
 */
export function usePollingTimes<T = any>(
 requestConfig: RequestConfig,
 maxPolls: number,
 interval = 3000,
): UsePollingReturn<T> {
 return usePolling<T>(requestConfig, {
  interval,
  maxPolls,
  immediate: true,
 })
}
