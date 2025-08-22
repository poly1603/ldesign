/**
 * 虚拟滚动 Composable
 *
 * 提供虚拟滚动功能，优化大量数据的渲染性能
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  scrollElement?: HTMLElement | null
}

export interface VirtualScrollItem<T = any> {
  index: number
  data: T
  top: number
  height: number
}

export function useVirtualScroll<T = any>(items: T[], options: VirtualScrollOptions) {
  const { itemHeight, containerHeight, overscan = 5 } = options

  const scrollTop = ref(0)
  const scrollElement = ref<HTMLElement | null>(options.scrollElement || null)

  // 计算可见范围
  const visibleRange = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + overscan, items.length)

    return {
      start: Math.max(0, start - overscan),
      end,
    }
  })

  // 计算可见项目
  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    const result: VirtualScrollItem<T>[] = []

    for (let i = start; i < end; i++) {
      if (items[i] !== undefined) {
        result.push({
          index: i,
          data: items[i],
          top: i * itemHeight,
          height: itemHeight,
        })
      }
    }

    return result
  })

  // 计算总高度
  const totalHeight = computed(() => items.length * itemHeight)

  // 计算偏移量
  const offsetY = computed(() => visibleRange.value.start * itemHeight)

  // 处理滚动事件
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  // 滚动到指定索引
  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!scrollElement.value)
      return

    const targetScrollTop = index * itemHeight
    scrollElement.value.scrollTo({
      top: targetScrollTop,
      behavior,
    })
  }

  // 滚动到指定项目
  const scrollToItem = (item: T, behavior: ScrollBehavior = 'smooth') => {
    const index = items.indexOf(item)
    if (index !== -1) {
      scrollToIndex(index, behavior)
    }
  }

  // 监听滚动元素变化
  watch(
    () => options.scrollElement,
    (newElement) => {
      scrollElement.value = newElement || null
    },
  )

  onMounted(() => {
    if (scrollElement.value) {
      scrollElement.value.addEventListener('scroll', handleScroll, { passive: true })
    }
  })

  onUnmounted(() => {
    if (scrollElement.value) {
      scrollElement.value.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop,
    scrollToIndex,
    scrollToItem,
    visibleRange,
  }
}

/**
 * 简化版虚拟滚动 Composable
 */
export function useSimpleVirtualScroll<T = any>(items: T[], itemHeight: number, containerHeight: number) {
  return useVirtualScroll(items, {
    itemHeight,
    containerHeight,
    overscan: 3,
  })
}

/**
 * 动态高度虚拟滚动 Composable
 */
export function useDynamicVirtualScroll<T = any>(
  items: T[],
  getItemHeight: (item: T, index: number) => number,
  containerHeight: number,
) {
  const scrollTop = ref(0)
  const itemHeights = ref<number[]>([])
  const itemPositions = ref<number[]>([])

  // 计算项目位置
  const calculatePositions = () => {
    let totalHeight = 0
    const positions: number[] = []
    const heights: number[] = []

    items.forEach((item, index) => {
      positions[index] = totalHeight
      const height = getItemHeight(item, index)
      heights[index] = height
      totalHeight += height
    })

    itemPositions.value = positions
    itemHeights.value = heights
  }

  // 计算可见范围
  const visibleRange = computed(() => {
    if (itemPositions.value.length === 0) {
      return { start: 0, end: 0 }
    }

    let start = 0
    let end = items.length

    // 找到开始位置
    for (let i = 0; i < itemPositions.value.length; i++) {
      if (itemPositions.value[i] + itemHeights.value[i] > scrollTop.value) {
        start = Math.max(0, i - 1)
        break
      }
    }

    // 找到结束位置
    const viewportBottom = scrollTop.value + containerHeight
    for (let i = start; i < itemPositions.value.length; i++) {
      if (itemPositions.value[i] > viewportBottom) {
        end = i + 1
        break
      }
    }

    return { start, end }
  })

  // 计算可见项目
  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    const result: VirtualScrollItem<T>[] = []

    for (let i = start; i < end; i++) {
      if (items[i] !== undefined) {
        result.push({
          index: i,
          data: items[i],
          top: itemPositions.value[i] || 0,
          height: itemHeights.value[i] || 0,
        })
      }
    }

    return result
  })

  // 计算总高度
  const totalHeight = computed(() => {
    return itemPositions.value.length > 0
      ? itemPositions.value[itemPositions.value.length - 1] + itemHeights.value[itemHeights.value.length - 1]
      : 0
  })

  // 重新计算位置
  watch(() => items, calculatePositions, { immediate: true })

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    visibleRange,
    calculatePositions,
  }
}
