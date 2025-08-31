/**
 * 虚拟列表 Hook
 * 
 * @description
 * 提供虚拟列表功能，用于渲染大量数据时的性能优化。
 * 只渲染可视区域内的元素，大幅提升渲染性能。
 */

import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

/**
 * 虚拟列表配置
 */
export interface VirtualListConfig {
  /** 每个项目的高度（固定高度模式） */
  itemHeight?: number
  /** 容器高度 */
  containerHeight: number
  /** 预渲染的项目数量（上下各多渲染几个） */
  overscan?: number
  /** 是否启用动态高度 */
  dynamic?: boolean
  /** 获取项目高度的函数（动态高度模式） */
  getItemHeight?: (index: number) => number
  /** 滚动防抖延迟（毫秒） */
  scrollDebounce?: number
}

/**
 * 虚拟列表项目
 */
export interface VirtualListItem<T = any> {
  /** 项目数据 */
  data: T
  /** 项目索引 */
  index: number
  /** 项目高度 */
  height: number
  /** 项目顶部偏移 */
  top: number
  /** 项目底部偏移 */
  bottom: number
}

/**
 * 虚拟列表状态
 */
export interface VirtualListState<T = any> {
  /** 可见的项目列表 */
  visibleItems: VirtualListItem<T>[]
  /** 开始索引 */
  startIndex: number
  /** 结束索引 */
  endIndex: number
  /** 总高度 */
  totalHeight: number
  /** 偏移高度 */
  offsetY: number
  /** 滚动位置 */
  scrollTop: number
}

/**
 * 虚拟列表操作方法
 */
export interface VirtualListActions {
  /** 滚动到指定索引 */
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void
  /** 滚动到指定位置 */
  scrollToOffset: (offset: number) => void
  /** 更新项目高度（动态高度模式） */
  updateItemHeight: (index: number, height: number) => void
  /** 刷新计算 */
  refresh: () => void
}

/**
 * 虚拟列表 Hook
 * 
 * @param data - 数据列表
 * @param config - 配置选项
 * @returns 虚拟列表状态和操作方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const containerRef = ref<HTMLElement>()
 *     const data = ref(Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })))
 *     
 *     const { state, actions, containerProps, wrapperProps } = useVirtualList(data, {
 *       containerHeight: 400,
 *       itemHeight: 50,
 *       overscan: 5
 *     })
 *     
 *     const scrollToItem = (index: number) => {
 *       actions.scrollToIndex(index, 'center')
 *     }
 *     
 *     return {
 *       containerRef,
 *       state,
 *       actions,
 *       containerProps,
 *       wrapperProps,
 *       scrollToItem
 *     }
 *   }
 * })
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="scrollToItem(5000)">滚动到第5000项</button>
 *     
 *     <div 
 *       ref="containerRef"
 *       v-bind="containerProps"
 *       class="virtual-list-container"
 *     >
 *       <div v-bind="wrapperProps" class="virtual-list-wrapper">
 *         <div
 *           v-for="item in state.visibleItems"
 *           :key="item.index"
 *           :style="{
 *             position: 'absolute',
 *             top: item.top + 'px',
 *             height: item.height + 'px',
 *             width: '100%'
 *           }"
 *           class="virtual-list-item"
 *         >
 *           {{ item.data.name }}
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </template>
 * 
 * <style>
 * .virtual-list-container {
 *   overflow: auto;
 * }
 * 
 * .virtual-list-wrapper {
 *   position: relative;
 * }
 * 
 * .virtual-list-item {
 *   display: flex;
 *   align-items: center;
 *   padding: 0 16px;
 *   border-bottom: 1px solid #eee;
 * }
 * </style>
 * ```
 */
export function useVirtualList<T = any>(
  data: Ref<T[]>,
  config: VirtualListConfig
) {
  const {
    itemHeight = 50,
    containerHeight,
    overscan = 5,
    dynamic = false,
    getItemHeight,
    scrollDebounce = 16,
  } = config

  // 状态
  const scrollTop = ref(0)
  const containerElement = ref<HTMLElement | null>(null)
  
  // 项目高度缓存（动态高度模式）
  const itemHeights = ref<number[]>([])
  const itemOffsets = ref<number[]>([])

  /**
   * 获取项目高度
   */
  const getHeight = (index: number): number => {
    if (dynamic && getItemHeight) {
      return getItemHeight(index)
    }
    if (dynamic && itemHeights.value[index]) {
      return itemHeights.value[index]
    }
    return itemHeight
  }

  /**
   * 计算项目偏移
   */
  const calculateOffsets = (): void => {
    if (!dynamic) return

    const offsets: number[] = [0]
    const heights = itemHeights.value
    
    for (let i = 0; i < data.value.length; i++) {
      const height = heights[i] || itemHeight
      offsets[i + 1] = offsets[i] + height
    }
    
    itemOffsets.value = offsets
  }

  /**
   * 获取项目顶部偏移
   */
  const getItemTop = (index: number): number => {
    if (dynamic) {
      return itemOffsets.value[index] || 0
    }
    return index * itemHeight
  }

  /**
   * 获取项目底部偏移
   */
  const getItemBottom = (index: number): number => {
    return getItemTop(index) + getHeight(index)
  }

  /**
   * 计算总高度
   */
  const totalHeight = computed(() => {
    if (dynamic) {
      const lastOffset = itemOffsets.value[data.value.length] || 0
      return lastOffset
    }
    return data.value.length * itemHeight
  })

  /**
   * 根据滚动位置查找开始索引
   */
  const findStartIndex = (scrollTop: number): number => {
    if (dynamic) {
      // 二分查找
      let left = 0
      let right = data.value.length - 1
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        const midTop = getItemTop(mid)
        const midBottom = getItemBottom(mid)
        
        if (scrollTop >= midTop && scrollTop < midBottom) {
          return mid
        } else if (scrollTop < midTop) {
          right = mid - 1
        } else {
          left = mid + 1
        }
      }
      
      return Math.max(0, right)
    }
    
    return Math.floor(scrollTop / itemHeight)
  }

  /**
   * 计算可见项目
   */
  const visibleItems = computed<VirtualListItem<T>[]>(() => {
    const start = findStartIndex(scrollTop.value)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 1
    
    const startIndex = Math.max(0, start - overscan)
    const endIndex = Math.min(data.value.length - 1, start + visibleCount + overscan)
    
    const items: VirtualListItem<T>[] = []
    
    for (let i = startIndex; i <= endIndex; i++) {
      const itemData = data.value[i]
      if (itemData) {
        items.push({
          data: itemData,
          index: i,
          height: getHeight(i),
          top: getItemTop(i),
          bottom: getItemBottom(i),
        })
      }
    }
    
    return items
  })

  /**
   * 计算偏移量
   */
  const offsetY = computed(() => {
    const firstItem = visibleItems.value[0]
    return firstItem ? firstItem.top : 0
  })

  // 滚动防抖
  let scrollTimer: NodeJS.Timeout | null = null

  /**
   * 处理滚动事件
   */
  const handleScroll = (event: Event): void => {
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }
    
    scrollTimer = setTimeout(() => {
      const target = event.target as HTMLElement
      scrollTop.value = target.scrollTop
    }, scrollDebounce)
  }

  /**
   * 滚动到指定索引
   */
  const scrollToIndex = (index: number, align: 'start' | 'center' | 'end' = 'start'): void => {
    if (!containerElement.value || index < 0 || index >= data.value.length) {
      return
    }
    
    const itemTop = getItemTop(index)
    const itemHeight = getHeight(index)
    
    let scrollTo = itemTop
    
    switch (align) {
      case 'center':
        scrollTo = itemTop - (containerHeight - itemHeight) / 2
        break
      case 'end':
        scrollTo = itemTop - containerHeight + itemHeight
        break
    }
    
    scrollTo = Math.max(0, Math.min(scrollTo, totalHeight.value - containerHeight))
    
    containerElement.value.scrollTop = scrollTo
    scrollTop.value = scrollTo
  }

  /**
   * 滚动到指定位置
   */
  const scrollToOffset = (offset: number): void => {
    if (!containerElement.value) return
    
    const scrollTo = Math.max(0, Math.min(offset, totalHeight.value - containerHeight))
    containerElement.value.scrollTop = scrollTo
    scrollTop.value = scrollTo
  }

  /**
   * 更新项目高度
   */
  const updateItemHeight = (index: number, height: number): void => {
    if (!dynamic) return
    
    itemHeights.value[index] = height
    calculateOffsets()
  }

  /**
   * 刷新计算
   */
  const refresh = (): void => {
    if (dynamic) {
      calculateOffsets()
    }
  }

  // 监听数据变化
  watch(
    data,
    () => {
      if (dynamic) {
        // 重置高度缓存
        itemHeights.value = new Array(data.value.length).fill(itemHeight)
        calculateOffsets()
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (dynamic) {
      calculateOffsets()
    }
  })

  // 计算状态
  const state = computed<VirtualListState<T>>(() => ({
    visibleItems: visibleItems.value,
    startIndex: visibleItems.value[0]?.index || 0,
    endIndex: visibleItems.value[visibleItems.value.length - 1]?.index || 0,
    totalHeight: totalHeight.value,
    offsetY: offsetY.value,
    scrollTop: scrollTop.value,
  }))

  const actions: VirtualListActions = {
    scrollToIndex,
    scrollToOffset,
    updateItemHeight,
    refresh,
  }

  // 容器属性
  const containerProps = computed(() => ({
    ref: containerElement,
    style: {
      height: `${containerHeight}px`,
      overflow: 'auto',
    },
    onScroll: handleScroll,
  }))

  // 包装器属性
  const wrapperProps = computed(() => ({
    style: {
      height: `${totalHeight.value}px`,
      position: 'relative' as const,
    },
  }))

  return {
    state: state as Ref<VirtualListState<T>>,
    actions,
    containerProps,
    wrapperProps,
  }
}
