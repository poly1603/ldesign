/**
 * 交叉观察器 Hook
 * 
 * @description
 * 提供 Intersection Observer API 的封装，用于检测元素与视口或其他元素的交叉状态。
 * 支持多个元素观察、自定义配置、性能优化等功能。
 */

import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

/**
 * 交叉观察器配置
 */
export interface IntersectionObserverConfig {
  /** 根元素 */
  root?: Element | null
  /** 根元素边距 */
  rootMargin?: string
  /** 触发阈值 */
  threshold?: number | number[]
  /** 是否立即开始观察 */
  immediate?: boolean
}

/**
 * 交叉观察器状态
 */
export interface IntersectionObserverState {
  /** 是否支持 Intersection Observer */
  isSupported: boolean
  /** 是否正在观察 */
  isObserving: boolean
  /** 观察的元素数量 */
  observedCount: number
}

/**
 * 元素交叉状态
 */
export interface ElementIntersectionState {
  /** 是否可见 */
  isIntersecting: boolean
  /** 交叉比例 */
  intersectionRatio: number
  /** 交叉矩形 */
  intersectionRect: DOMRectReadOnly | null
  /** 边界矩形 */
  boundingClientRect: DOMRectReadOnly | null
  /** 根边界矩形 */
  rootBounds: DOMRectReadOnly | null
  /** 时间戳 */
  time: number
  /** 目标元素 */
  target: Element | null
}

/**
 * 交叉观察器 Hook
 * 
 * @param config - 配置选项
 * @returns 观察器状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const elementRef = ref<HTMLElement>()
 *     
 *     const { state, observe, unobserve, disconnect } = useIntersectionObserver({
 *       threshold: [0, 0.25, 0.5, 0.75, 1],
 *       rootMargin: '10px'
 *     })
 *     
 *     const elementState = ref<ElementIntersectionState | null>(null)
 *     
 *     onMounted(() => {
 *       if (elementRef.value) {
 *         observe(elementRef.value, (entry) => {
 *           elementState.value = {
 *             isIntersecting: entry.isIntersecting,
 *             intersectionRatio: entry.intersectionRatio,
 *             intersectionRect: entry.intersectionRect,
 *             boundingClientRect: entry.boundingClientRect,
 *             rootBounds: entry.rootBounds,
 *             time: entry.time,
 *             target: entry.target
 *           }
 *         })
 *       }
 *     })
 *     
 *     return {
 *       elementRef,
 *       state,
 *       elementState,
 *       observe,
 *       unobserve,
 *       disconnect
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <div ref="elementRef" class="observed-element">
 *       <p v-if="elementState">
 *         可见: {{ elementState.isIntersecting }}
 *         <br>
 *         交叉比例: {{ (elementState.intersectionRatio * 100).toFixed(1) }}%
 *       </p>
 *     </div>
 *     
 *     <div class="status">
 *       观察器状态: {{ state.isObserving ? '运行中' : '已停止' }}
 *       <br>
 *       观察元素数: {{ state.observedCount }}
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export function useIntersectionObserver(config: IntersectionObserverConfig = {}) {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    immediate = true,
  } = config

  // 检查是否支持 Intersection Observer
  const isSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window

  // 状态
  const isObserving = ref(false)
  const observedElements = ref(new Set<Element>())

  // Observer 实例
  let observer: IntersectionObserver | null = null
  
  // 回调函数映射
  const callbackMap = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>()

  /**
   * 处理交叉变化
   */
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const callback = callbackMap.get(entry.target)
      if (callback) {
        callback(entry)
      }
    })
  }

  /**
   * 创建观察器
   */
  const createObserver = () => {
    if (!isSupported || observer) return

    observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    })

    isObserving.value = true
  }

  /**
   * 观察元素
   */
  const observe = (
    element: Element,
    callback: (entry: IntersectionObserverEntry) => void
  ) => {
    if (!isSupported || !element) return

    // 创建观察器（如果还没有）
    if (!observer) {
      createObserver()
    }

    if (observer) {
      // 保存回调函数
      callbackMap.set(element, callback)
      
      // 开始观察
      observer.observe(element)
      observedElements.value.add(element)
    }
  }

  /**
   * 停止观察元素
   */
  const unobserve = (element: Element) => {
    if (!observer || !element) return

    observer.unobserve(element)
    observedElements.value.delete(element)
    callbackMap.delete(element)
  }

  /**
   * 断开所有观察
   */
  const disconnect = () => {
    if (observer) {
      observer.disconnect()
      observedElements.value.clear()
      isObserving.value = false
    }
  }

  /**
   * 重新连接观察器
   */
  const reconnect = () => {
    disconnect()
    createObserver()
  }

  onMounted(() => {
    if (immediate) {
      createObserver()
    }
  })

  onUnmounted(() => {
    disconnect()
    observer = null
  })

  // 计算状态
  const state = computed<IntersectionObserverState>(() => ({
    isSupported,
    isObserving: isObserving.value,
    observedCount: observedElements.value.size,
  }))

  return {
    state,
    observe,
    unobserve,
    disconnect,
    reconnect,
  }
}

/**
 * 单元素交叉观察器 Hook
 * 
 * @param target - 目标元素
 * @param config - 配置选项
 * @returns 元素交叉状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const elementRef = ref<HTMLElement>()
 *     
 *     const { state, start, stop } = useElementIntersectionObserver(elementRef, {
 *       threshold: [0, 0.5, 1],
 *       onIntersect: (entry) => {
 *          *       }
 *     })
 *     
 *     return {
 *       elementRef,
 *       state,
 *       start,
 *       stop
 *     }
 *   }
 * })
 * ```
 */
export function useElementIntersectionObserver(
  target: Ref<Element | null>,
  config: IntersectionObserverConfig & {
    onIntersect?: (entry: IntersectionObserverEntry) => void
    onEnter?: (entry: IntersectionObserverEntry) => void
    onLeave?: (entry: IntersectionObserverEntry) => void
  } = {}
) {
  const { onIntersect, onEnter, onLeave, ...observerConfig } = config

  const { observe, unobserve, state: observerState } = useIntersectionObserver(observerConfig)

  // 元素状态
  const isIntersecting = ref(false)
  const intersectionRatio = ref(0)
  const intersectionRect = ref<DOMRectReadOnly | null>(null)
  const boundingClientRect = ref<DOMRectReadOnly | null>(null)
  const rootBounds = ref<DOMRectReadOnly | null>(null)
  const time = ref(0)

  /**
   * 处理交叉变化
   */
  const handleIntersection = (entry: IntersectionObserverEntry) => {
    const wasIntersecting = isIntersecting.value
    
    // 更新状态
    isIntersecting.value = entry.isIntersecting
    intersectionRatio.value = entry.intersectionRatio
    intersectionRect.value = entry.intersectionRect
    boundingClientRect.value = entry.boundingClientRect
    rootBounds.value = entry.rootBounds
    time.value = entry.time

    // 执行回调
    onIntersect?.(entry)

    // 进入/离开回调
    if (entry.isIntersecting && !wasIntersecting) {
      onEnter?.(entry)
    } else if (!entry.isIntersecting && wasIntersecting) {
      onLeave?.(entry)
    }
  }

  /**
   * 开始观察
   */
  const start = () => {
    if (target.value) {
      observe(target.value, handleIntersection)
    }
  }

  /**
   * 停止观察
   */
  const stop = () => {
    if (target.value) {
      unobserve(target.value)
    }
  }

  // 监听目标元素变化
  watch(
    target,
    (newTarget, oldTarget) => {
      if (oldTarget) {
        unobserve(oldTarget)
      }
      
      if (newTarget) {
        nextTick(() => {
          observe(newTarget, handleIntersection)
        })
      }
    }
  )

  onMounted(() => {
    if (observerConfig.immediate !== false) {
      start()
    }
  })

  // 计算状态
  const state = computed<ElementIntersectionState>(() => ({
    isIntersecting: isIntersecting.value,
    intersectionRatio: intersectionRatio.value,
    intersectionRect: intersectionRect.value,
    boundingClientRect: boundingClientRect.value,
    rootBounds: rootBounds.value,
    time: time.value,
    target: target.value,
  }))

  return {
    state,
    start,
    stop,
    observerState,
  }
}

/**
 * 可见性检测 Hook
 * 
 * @param target - 目标元素
 * @param config - 配置选项
 * @returns 可见性状态
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const elementRef = ref<HTMLElement>()
 *     
 *     const { isVisible, visibilityRatio } = useVisibility(elementRef, {
 *       threshold: 0.5 // 50% 可见时才算可见
 *     })
 *     
 *     return {
 *       elementRef,
 *       isVisible,
 *       visibilityRatio
 *     }
 *   }
 * })
 * ```
 */
export function useVisibility(
  target: Ref<Element | null>,
  config: IntersectionObserverConfig & {
    visibilityThreshold?: number
  } = {}
) {
  const { visibilityThreshold = 0, ...observerConfig } = config

  const { state } = useElementIntersectionObserver(target, observerConfig)

  const isVisible = computed(() => {
    return state.value.isIntersecting && state.value.intersectionRatio >= visibilityThreshold
  })

  const visibilityRatio = computed(() => state.value.intersectionRatio)

  return {
    isVisible,
    visibilityRatio,
    state,
  }
}
