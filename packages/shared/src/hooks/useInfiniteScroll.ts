/**
 * 无限滚动 Hook
 * 
 * @description
 * 提供无限滚动功能，支持自动加载更多数据、滚动到底部检测、
 * 加载状态管理等功能。
 */

import { ref, computed, watch, onMounted, onUnmounted, nextTick, unref, type Ref } from 'vue'
import { useAsyncData } from './useAsyncData'

/**
 * 无限滚动数据获取函数
 */
export type InfiniteScrollFetcher<T> = (page: number, pageSize: number) => Promise<{
  data: T[]
  hasMore: boolean
  total?: number
}>

/**
 * 无限滚动配置
 */
export interface InfiniteScrollConfig<T> {
  /** 每页大小 */
  pageSize?: number
  /** 触发加载的距离阈值（像素） */
  threshold?: number
  /** 目标容器选择器或元素 */
  target?: string | HTMLElement | Ref<HTMLElement | null>
  /** 是否立即加载第一页 */
  immediate?: boolean
  /** 是否启用 */
  enabled?: boolean
  /** 数据转换函数 */
  transform?: (item: T, index: number, allData: T[]) => T
  /** 错误处理函数 */
  onError?: (error: Error) => void
  /** 加载成功回调 */
  onLoad?: (data: T[], page: number, hasMore: boolean) => void
  /** 到达底部回调 */
  onReachBottom?: () => void
}

/**
 * 无限滚动状态
 */
export interface InfiniteScrollState<T> {
  /** 所有数据 */
  data: T[]
  /** 当前页码 */
  page: number
  /** 是否正在加载 */
  loading: boolean
  /** 是否还有更多数据 */
  hasMore: boolean
  /** 错误信息 */
  error: Error | null
  /** 是否已完成初始加载 */
  initialized: boolean
  /** 总数据量（如果提供） */
  total: number | null
}

/**
 * 无限滚动操作方法
 */
export interface InfiniteScrollActions {
  /** 加载下一页 */
  loadMore: () => Promise<void>
  /** 刷新数据（重新从第一页开始） */
  refresh: () => Promise<void>
  /** 重置状态 */
  reset: () => void
  /** 滚动到顶部 */
  scrollToTop: () => void
  /** 滚动到底部 */
  scrollToBottom: () => void
  /** 滚动到指定位置 */
  scrollTo: (top: number) => void
}

/**
 * 无限滚动 Hook
 * 
 * @param fetcher - 数据获取函数
 * @param config - 配置选项
 * @returns 无限滚动状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const containerRef = ref<HTMLElement>()
 *     
 *     const { state, actions } = useInfiniteScroll(
 *       async (page, pageSize) => {
 *         const response = await fetch(`/api/posts?page=${page}&size=${pageSize}`)
 *         const result = await response.json()
 *         return {
 *           data: result.data,
 *           hasMore: result.hasMore,
 *           total: result.total
 *         }
 *       },
 *       {
 *         target: containerRef,
 *         pageSize: 20,
 *         threshold: 100,
 *         immediate: true,
 *         onLoad: (data, page, hasMore) => {
 *            *         }
 *       }
 *     )
 *     
 *     return {
 *       containerRef,
 *       state,
 *       actions
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div ref="containerRef" class="infinite-scroll-container">
 *     <div v-for="item in state.data" :key="item.id" class="item">
 *       {{ item.title }}
 *     </div>
 *     
 *     <div v-if="state.loading" class="loading">
 *       加载中...
 *     </div>
 *     
 *     <div v-if="!state.hasMore && state.initialized" class="no-more">
 *       没有更多数据了
 *     </div>
 *     
 *     <div v-if="state.error" class="error">
 *       加载失败: {{ state.error.message }}
 *       <button @click="actions.loadMore()">重试</button>
 *     </div>
 *     
 *     <button @click="actions.refresh()">刷新</button>
 *     <button @click="actions.scrollToTop()">回到顶部</button>
 *   </div>
 * </template>
 * 
 * <style>
 * .infinite-scroll-container {
 *   height: 400px;
 *   overflow-y: auto;
 * }
 * </style>
 * ```
 */
export function useInfiniteScroll<T>(
  fetcher: InfiniteScrollFetcher<T>,
  config: InfiniteScrollConfig<T> = {}
) {
  const {
    pageSize = 20,
    threshold = 100,
    target,
    immediate = false,
    enabled = true,
    transform,
    onError,
    onLoad,
    onReachBottom,
  } = config

  // 状态
  const data = ref<T[]>([])
  const page = ref(0)
  const hasMore = ref(true)
  const initialized = ref(false)
  const total = ref<number | null>(null)

  // 容器元素
  const containerElement = ref<HTMLElement | null>(null)

  // 使用 useAsyncData 管理加载状态
  const { state: asyncState, execute } = useAsyncData(
    async () => {
      const nextPage = page.value + 1
      const result = await fetcher(nextPage, pageSize)
      
      // 更新页码
      page.value = nextPage
      
      // 合并数据
      const newData = result.data
      if (transform) {
        const transformedData = newData.map((item, index) =>
          transform(item, data.value.length + index, [...data.value, ...newData] as T[])
        )
        data.value = [...data.value, ...transformedData] as any
      } else {
        data.value = [...data.value, ...newData] as any
      }
      
      // 更新状态
      hasMore.value = result.hasMore
      if (result.total !== undefined) {
        total.value = result.total
      }
      
      // 标记为已初始化
      if (!initialized.value) {
        initialized.value = true
      }
      
      // 执行回调
      onLoad?.(newData, nextPage, result.hasMore)
      
      return result
    },
    {
      onError,
    }
  )

  /**
   * 获取目标容器元素
   */
  const getTargetElement = (): HTMLElement => {
    if (!target) {
      return window.document.documentElement
    }
    
    if (typeof target === 'string') {
      return document.querySelector(target) || window.document.documentElement
    }
    
    if ('value' in target) {
      return target.value || window.document.documentElement
    }
    
    return target || window.document.documentElement
  }

  /**
   * 检查是否到达底部
   */
  const checkReachBottom = (): boolean => {
    const element = getTargetElement()
    
    if (element === window.document.documentElement) {
      // 窗口滚动
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      
      return scrollHeight - scrollTop - clientHeight <= threshold
    } else {
      // 元素滚动
      const { scrollTop, scrollHeight, clientHeight } = element
      return scrollHeight - scrollTop - clientHeight <= threshold
    }
  }

  /**
   * 滚动事件处理
   */
  const handleScroll = (): void => {
    if (!enabled || asyncState.value.loading || !hasMore.value) {
      return
    }
    
    if (checkReachBottom()) {
      onReachBottom?.()
      loadMore()
    }
  }

  /**
   * 加载更多数据
   */
  const loadMore = async (): Promise<void> => {
    if (!enabled || asyncState.value.loading || !hasMore.value) {
      return
    }
    
    await execute()
  }

  /**
   * 刷新数据
   */
  const refresh = async (): Promise<void> => {
    reset()
    await loadMore()
  }

  /**
   * 重置状态
   */
  const reset = (): void => {
    data.value = []
    page.value = 0
    hasMore.value = true
    initialized.value = false
    total.value = null
  }

  /**
   * 滚动到顶部
   */
  const scrollToTop = (): void => {
    const element = getTargetElement()
    
    if (element === window.document.documentElement) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      element.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /**
   * 滚动到底部
   */
  const scrollToBottom = (): void => {
    const element = getTargetElement()
    
    if (element === window.document.documentElement) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    } else {
      element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
    }
  }

  /**
   * 滚动到指定位置
   */
  const scrollTo = (top: number): void => {
    const element = getTargetElement()
    
    if (element === window.document.documentElement) {
      window.scrollTo({ top, behavior: 'smooth' })
    } else {
      element.scrollTo({ top, behavior: 'smooth' })
    }
  }

  // 监听滚动事件
  let scrollElement: HTMLElement | Window | null = null

  const addScrollListener = (): void => {
    const element = getTargetElement()
    scrollElement = element === window.document.documentElement ? window : element
    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
  }

  const removeScrollListener = (): void => {
    if (scrollElement) {
      scrollElement.removeEventListener('scroll', handleScroll)
      scrollElement = null
    }
  }

  // 监听 target 变化
  watch(
    () => target,
    () => {
      removeScrollListener()
      nextTick(() => {
        addScrollListener()
      })
    },
    { immediate: true }
  )

  // 监听 enabled 状态
  watch(
    () => enabled,
    (newEnabled) => {
      if (newEnabled) {
        addScrollListener()
      } else {
        removeScrollListener()
      }
    }
  )

  onMounted(() => {
    if (enabled) {
      addScrollListener()
    }
    
    if (immediate) {
      loadMore()
    }
  })

  onUnmounted(() => {
    removeScrollListener()
  })

  // 计算状态
  const state = computed<InfiniteScrollState<T>>(() => ({
    data: data.value as T[],
    page: page.value,
    loading: asyncState.value.loading,
    hasMore: hasMore.value,
    error: asyncState.value.error,
    initialized: initialized.value,
    total: total.value,
  }))

  const actions: InfiniteScrollActions = {
    loadMore,
    refresh,
    reset,
    scrollToTop,
    scrollToBottom,
    scrollTo,
  }

  return {
    state: state as Ref<InfiniteScrollState<T>>,
    actions,
  }
}
