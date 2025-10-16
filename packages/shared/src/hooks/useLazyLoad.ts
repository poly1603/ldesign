/**
 * 懒加载 Hook
 * 
 * @description
 * 提供懒加载功能，支持图片懒加载、组件懒加载等场景。
 * 基于 Intersection Observer API 实现高性能的可视区域检测。
 */

import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

/**
 * 懒加载配置
 */
export interface LazyLoadConfig {
  /** 根元素边距，用于提前触发加载 */
  rootMargin?: string
  /** 触发阈值 */
  threshold?: number | number[]
  /** 根元素 */
  root?: Element | null
  /** 是否只触发一次 */
  once?: boolean
  /** 是否立即检查 */
  immediate?: boolean
  /** 进入可视区域回调 */
  onEnter?: (entry: IntersectionObserverEntry) => void
  /** 离开可视区域回调 */
  onLeave?: (entry: IntersectionObserverEntry) => void
  /** 可见性变化回调 */
  onChange?: (isVisible: boolean, entry: IntersectionObserverEntry) => void
}

/**
 * 懒加载状态
 */
export interface LazyLoadState {
  /** 是否可见 */
  isVisible: boolean
  /** 是否已进入过 */
  hasEntered: boolean
  /** 是否支持 Intersection Observer */
  isSupported: boolean
  /** 最后一次 IntersectionObserverEntry */
  entry: IntersectionObserverEntry | null
}

/**
 * 懒加载 Hook
 * 
 * @param target - 目标元素
 * @param config - 配置选项
 * @returns 懒加载状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const imageRef = ref<HTMLImageElement>()
 *     const imageSrc = ref('')
 *     
 *     const { state } = useLazyLoad(imageRef, {
 *       rootMargin: '50px',
 *       once: true,
 *       onEnter: () => {
 *         imageSrc.value = 'https://example.com/image.jpg'
 *       }
 *     })
 *     
 *     return {
 *       imageRef,
 *       imageSrc,
 *       state
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 图片懒加载 -->
 *     <img 
 *       ref="imageRef"
 *       :src="state.hasEntered ? imageSrc : placeholderSrc"
 *       alt="Lazy loaded image"
 *     />
 *     
 *     <!-- 组件懒加载 -->
 *     <div ref="componentRef">
 *       <ExpensiveComponent v-if="componentState.isVisible" />
 *       <div v-else class="placeholder">Loading...</div>
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export function useLazyLoad(
  target: Ref<Element | null>,
  config: LazyLoadConfig = {}
) {
  const {
    rootMargin = '0px',
    threshold = 0,
    root = null,
    once = true,
    immediate = true,
    onEnter,
    onLeave,
    onChange,
  } = config

  // 状态
  const isVisible = ref(false)
  const hasEntered = ref(false)
  const entry = ref<IntersectionObserverEntry | null>(null)

  // 检查是否支持 Intersection Observer
  const isSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window

  // Observer 实例
  let observer: IntersectionObserver | null = null

  /**
   * 处理可见性变化
   */
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const currentEntry = entries[0]
    entry.value = currentEntry
    
    const visible = currentEntry.isIntersecting
    isVisible.value = visible

    if (visible && !hasEntered.value) {
      hasEntered.value = true
      onEnter?.(currentEntry)
      
      // 如果只触发一次，停止观察
      if (once && observer && target.value) {
        observer.unobserve(target.value)
      }
    }

    if (!visible && hasEntered.value) {
      onLeave?.(currentEntry)
    }

    onChange?.(visible, currentEntry)
  }

  /**
   * 开始观察
   */
  const startObserving = () => {
    if (!isSupported || !target.value) return

    // 创建 Observer
    observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    })

    observer.observe(target.value)
  }

  /**
   * 停止观察
   */
  const stopObserving = () => {
    if (observer && target.value) {
      observer.unobserve(target.value)
    }
    observer = null
  }

  /**
   * 重新开始观察
   */
  const restart = () => {
    stopObserving()
    isVisible.value = false
    hasEntered.value = false
    entry.value = null
    
    nextTick(() => {
      startObserving()
    })
  }

  // 监听目标元素变化
  watch(
    target,
    (newTarget, oldTarget) => {
      if (oldTarget && observer) {
        observer.unobserve(oldTarget)
      }
      
      if (newTarget) {
        nextTick(() => {
          startObserving()
        })
      }
    }
  )

  onMounted(() => {
    if (immediate) {
      startObserving()
    }
  })

  onUnmounted(() => {
    stopObserving()
  })

  // 计算状态
  const state = computed<LazyLoadState>(() => ({
    isVisible: isVisible.value,
    hasEntered: hasEntered.value,
    isSupported,
    entry: entry.value,
  }))

  return {
    state,
    restart,
    startObserving,
    stopObserving,
  }
}

/**
 * 图片懒加载 Hook
 * 
 * @param config - 配置选项
 * @returns 图片懒加载状态和方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { imageRef, state, setSrc } = useImageLazyLoad({
 *       placeholder: '/placeholder.jpg',
 *       onLoad: () => ,
 *       onError: () =>  *     })
 *     
 *     onMounted(() => {
 *       setSrc('https://example.com/image.jpg')
 *     })
 *     
 *     return {
 *       imageRef,
 *       state
 *     }
 *   }
 * })
 * ```
 */
export function useImageLazyLoad(config: {
  placeholder?: string
  rootMargin?: string
  threshold?: number
  onLoad?: () => void
  onError?: () => void
} = {}) {
  const {
    placeholder = '',
    rootMargin = '50px',
    threshold = 0,
    onLoad,
    onError,
  } = config

  const imageRef = ref<HTMLImageElement | null>(null)
  const src = ref('')
  const currentSrc = ref(placeholder)
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(false)

  const { state: lazyState } = useLazyLoad(imageRef, {
    rootMargin,
    threshold,
    once: true,
    onEnter: () => {
      if (src.value && !loaded.value && !loading.value) {
        loadImage()
      }
    },
  })

  /**
   * 加载图片
   */
  const loadImage = () => {
    if (!src.value || loading.value || loaded.value) return

    loading.value = true
    error.value = false

    const img = new Image()
    
    img.onload = () => {
      currentSrc.value = src.value
      loading.value = false
      loaded.value = true
      onLoad?.()
    }
    
    img.onerror = () => {
      loading.value = false
      error.value = true
      onError?.()
    }
    
    img.src = src.value
  }

  /**
   * 设置图片源
   */
  const setSrc = (newSrc: string) => {
    src.value = newSrc
    loaded.value = false
    error.value = false
    
    if (lazyState.value.hasEntered) {
      loadImage()
    }
  }

  /**
   * 重新加载
   */
  const reload = () => {
    loaded.value = false
    error.value = false
    loadImage()
  }

  const state = computed(() => ({
    ...lazyState.value,
    src: currentSrc.value,
    loading: loading.value,
    loaded: loaded.value,
    error: error.value,
  }))

  return {
    imageRef,
    state,
    setSrc,
    reload,
  }
}

/**
 * 批量懒加载 Hook
 * 
 * @param items - 要懒加载的项目列表
 * @param config - 配置选项
 * @returns 批量懒加载状态和方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const items = ref([
 *       { id: 1, src: 'image1.jpg' },
 *       { id: 2, src: 'image2.jpg' },
 *       { id: 3, src: 'image3.jpg' },
 *     ])
 *     
 *     const { states, getRef } = useBatchLazyLoad(items, {
 *       rootMargin: '100px',
 *       onItemEnter: (item, index) => {
 *          *       }
 *     })
 *     
 *     return {
 *       items,
 *       states,
 *       getRef
 *     }
 *   }
 * })
 * ```
 */
export function useBatchLazyLoad<T>(
  items: Ref<T[]>,
  config: LazyLoadConfig & {
    onItemEnter?: (item: T, index: number) => void
    onItemLeave?: (item: T, index: number) => void
  } = {}
) {
  const { onItemEnter, onItemLeave, ...lazyConfig } = config

  // 为每个项目创建 ref
  const itemRefs = ref<(Element | null)[]>([])
  const itemStates = ref<LazyLoadState[]>([])

  // 监听项目列表变化
  watch(
    items,
    (newItems) => {
      itemRefs.value = new Array(newItems.length).fill(null)
      itemStates.value = new Array(newItems.length).fill({
        isVisible: false,
        hasEntered: false,
        isSupported: typeof window !== 'undefined' && 'IntersectionObserver' in window,
        entry: null,
      })
    },
    { immediate: true }
  )

  /**
   * 获取指定索引的 ref
   */
  const getRef = (index: number) => {
    return (el: Element | null) => {
      itemRefs.value[index] = el
      
      if (el) {
        // 为每个元素创建懒加载
        const { state } = useLazyLoad(ref(el), {
          ...lazyConfig,
          onEnter: (entry) => {
            itemStates.value[index] = {
              ...itemStates.value[index],
              isVisible: true,
              hasEntered: true,
              entry,
            }
            onItemEnter?.(items.value[index], index)
          },
          onLeave: (entry) => {
            itemStates.value[index] = {
              ...itemStates.value[index],
              isVisible: false,
              entry,
            }
            onItemLeave?.(items.value[index], index)
          },
        })
        
        watch(state, (newState) => {
          itemStates.value[index] = newState
        }, { immediate: true })
      }
    }
  }

  const states = computed(() => itemStates.value)

  return {
    states,
    getRef,
  }
}
