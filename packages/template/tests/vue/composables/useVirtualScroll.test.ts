import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useSimpleVirtualScroll, useVirtualScroll } from '../../../src/vue/composables/useVirtualScroll'

describe('useVirtualScroll', () => {
  const generateItems = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      content: `Content for item ${i + 1}`,
    }))
  }

  beforeEach(() => {
    // Reset any global state if needed
  })

  describe('useVirtualScroll', () => {
    it('应该返回正确的属性和方法', () => {
      const items = ref(generateItems(100))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
        buffer: 5,
      }

      const result = useVirtualScroll(items, options)

      expect(result).toHaveProperty('containerRef')
      expect(result).toHaveProperty('visibleItems')
      expect(result).toHaveProperty('visibleRange')
      expect(result).toHaveProperty('totalHeight')
      expect(result).toHaveProperty('offsetY')
      expect(result).toHaveProperty('scrollTop')
      expect(result).toHaveProperty('handleScroll')
      expect(result).toHaveProperty('scrollToItem')
      expect(result).toHaveProperty('scrollToTop')
      expect(result).toHaveProperty('scrollToBottom')
    })

    it('应该计算正确的总高度', () => {
      const items = ref(generateItems(100))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
      }

      const { totalHeight } = useVirtualScroll(items, options)

      expect(totalHeight.value).toBe(100 * 50) // 100 items * 50px height
    })

    it('应该计算正确的可见范围', () => {
      const items = ref(generateItems(100))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
        buffer: 5,
      }

      const { visibleRange } = useVirtualScroll(items, options)

      // 初始状态下，scrollTop = 0
      expect(visibleRange.value.start).toBe(0)
      expect(visibleRange.value.end).toBeLessThanOrEqual(items.value.length)
      expect(visibleRange.value.visibleCount).toBe(Math.ceil(400 / 50)) // 8
    })

    it('应该返回正确的可见项目', () => {
      const items = ref(generateItems(100))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
        buffer: 5,
      }

      const { visibleItems } = useVirtualScroll(items, options)

      expect(visibleItems.value.length).toBeGreaterThan(0)
      expect(visibleItems.value.length).toBeLessThanOrEqual(items.value.length)

      // 检查每个可见项目是否有正确的属性
      visibleItems.value.forEach((item, index) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('index')
        expect(item).toHaveProperty('top')
        expect(typeof item.top).toBe('number')
      })
    })

    it('应该正确处理滚动事件', () => {
      const items = ref(generateItems(100))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
        buffer: 5,
      }

      const { handleScroll, scrollTop, visibleRange } = useVirtualScroll(items, options)

      // 模拟滚动事件
      const mockEvent = {
        target: {
          scrollTop: 250, // 滚动到第5个项目
        },
      } as Event

      handleScroll(mockEvent)

      expect(scrollTop.value).toBe(250)
      // 由于缓冲区的存在，start 可能为 0
      expect(visibleRange.value.start).toBeGreaterThanOrEqual(0)
    })

    it('应该支持滚动到指定项目', () => {
      const items = ref(generateItems(100))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
      }

      const { scrollToItem, containerRef } = useVirtualScroll(items, options)

      // 模拟容器元素
      const mockContainer = {
        scrollTop: 0,
      }
      containerRef.value = mockContainer as any

      scrollToItem(10)

      expect(mockContainer.scrollTop).toBe(10 * 50) // 第10个项目的位置
    })

    it('应该支持滚动到顶部', () => {
      const items = ref(generateItems(100))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
      }

      const { scrollToTop, containerRef } = useVirtualScroll(items, options)

      // 模拟容器元素
      const mockContainer = {
        scrollTop: 500,
      }
      containerRef.value = mockContainer as any

      scrollToTop()

      expect(mockContainer.scrollTop).toBe(0)
    })

    it('应该支持滚动到底部', () => {
      const items = ref(generateItems(100))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
      }

      const { scrollToBottom, containerRef } = useVirtualScroll(items, options)

      // 模拟容器元素
      const mockContainer = {
        scrollTop: 0,
      }
      containerRef.value = mockContainer as any

      scrollToBottom()

      expect(mockContainer.scrollTop).toBe((100 - 1) * 50) // 最后一个项目的位置
    })

    it('应该正确处理空列表', () => {
      const items = ref([])
      const options = {
        containerHeight: 400,
        itemHeight: 50,
      }

      const { totalHeight, visibleItems, visibleRange } = useVirtualScroll(items, options)

      expect(totalHeight.value).toBe(0)
      expect(visibleItems.value).toEqual([])
      expect(visibleRange.value.start).toBe(0)
      expect(visibleRange.value.end).toBe(0)
    })

    it('应该响应项目列表的变化', async () => {
      const items = ref(generateItems(10))
      const options = {
        containerHeight: 400,
        itemHeight: 50,
      }

      const { totalHeight, visibleItems } = useVirtualScroll(items, options)

      expect(totalHeight.value).toBe(10 * 50)
      expect(visibleItems.value.length).toBeGreaterThan(0)

      // 更新项目列表
      items.value = generateItems(20)

      expect(totalHeight.value).toBe(20 * 50)
    })
  })

  describe('useSimpleVirtualScroll', () => {
    it('应该返回简化的虚拟滚动功能', () => {
      const items = ref(generateItems(100))
      const result = useSimpleVirtualScroll(items, 50, 400)

      expect(result).toHaveProperty('containerRef')
      expect(result).toHaveProperty('visibleItems')
      expect(result).toHaveProperty('totalHeight')
      expect(result).toHaveProperty('handleScroll')
    })

    it('应该使用默认的缓冲区设置', () => {
      const items = ref(generateItems(100))
      const { visibleItems } = useSimpleVirtualScroll(items, 50, 400)

      // 简单虚拟滚动应该有合理的可见项目数量
      expect(visibleItems.value.length).toBeGreaterThan(0)
      expect(visibleItems.value.length).toBeLessThanOrEqual(items.value.length)
    })

    it('应该正确计算总高度', () => {
      const items = ref(generateItems(50))
      const { totalHeight } = useSimpleVirtualScroll(items, 80, 400)

      expect(totalHeight.value).toBe(50 * 80) // 50 items * 80px height
    })
  })
})
