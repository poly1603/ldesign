/**
 * 虚拟滚动 Composable
 * 用于优化大量模板列表的渲染性能
 */

import { computed, onUnmounted, ref, type Ref } from 'vue'

export interface VirtualScrollOptions {
  /** 容器高度 */
  containerHeight: number
  /** 每项高度 */
  itemHeight: number
  /** 缓冲区大小 */
  buffer?: number
}

export interface VirtualScrollItem {
  id: string | number
  [key: string]: unknown
}

/**
 * 虚拟滚动 Hook
 */
export function useVirtualScroll<T extends VirtualScrollItem>(
  items: Ref<T[]>,
  options: VirtualScrollOptions
) {
  const { containerHeight, itemHeight, buffer = 5 } = options

  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement>()

  // 计算可见区域
  const visibleRange = computed(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.floor(scrollTop.value / itemHeight)
    const endIndex = Math.min(
      startIndex + visibleCount + buffer * 2,
      items.value.length
    )

    return {
      start: Math.max(0, startIndex - buffer),
      end: endIndex,
      visibleCount,
    }
  })

  // 可见项目
  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end).map((item, index) => ({
      ...item,
      index: start + index,
      top: (start + index) * itemHeight,
    }))
  })

  // 总高度
  const totalHeight = computed(() => items.value.length * itemHeight)

  // 偏移量
  const offsetY = computed(() => visibleRange.value.start * itemHeight)

  // 滚动处理
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  // 滚动到指定项目
  const scrollToItem = (index: number) => {
    if (containerRef.value) {
      const targetScrollTop = index * itemHeight
      containerRef.value.scrollTop = targetScrollTop
      scrollTop.value = targetScrollTop
    }
  }

  // 滚动到顶部
  const scrollToTop = () => {
    scrollToItem(0)
  }

  // 滚动到底部
  const scrollToBottom = () => {
    scrollToItem(items.value.length - 1)
  }

  // 清理函数
  const cleanup = () => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
  }

  // 组件卸载时清理
  onUnmounted(cleanup)

  return {
    containerRef,
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    scrollTop,
    handleScroll,
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    cleanup, // 暴露清理方法
  }
}

/**
 * 简化版虚拟滚动 Hook
 * 适用于简单的列表场景
 */
export function useSimpleVirtualScroll<T>(
  items: Ref<T[]>,
  itemHeight: number,
  containerHeight: number
) {
  return useVirtualScroll(items as Ref<VirtualScrollItem[]>, {
    containerHeight,
    itemHeight,
    buffer: 3,
  })
}
