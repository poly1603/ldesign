/**
 * VirtualScrollManager单元测试
 * 
 * 测试虚拟滚动管理器功能
 * 确保大数据量下的高性能渲染
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VirtualScrollManager } from '@/managers/VirtualScrollManager'
import { createTestData } from '../setup'

describe('VirtualScrollManager', () => {
  let virtualScrollManager: VirtualScrollManager
  let testData: any[]
  let mockContainer: HTMLElement

  beforeEach(() => {
    testData = createTestData(10000) // 大数据量测试

    // 模拟容器元素
    mockContainer = {
      clientHeight: 400,
      scrollTop: 0,
      scrollHeight: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as any

    virtualScrollManager = new VirtualScrollManager({
      container: mockContainer,
      itemHeight: 40,
      bufferSize: 5
    })
  })

  describe('基础配置', () => {
    it('应该正确初始化', () => {
      expect(virtualScrollManager.getItemHeight()).toBe(40)
      expect(virtualScrollManager.getBufferSize()).toBe(5)
      expect(virtualScrollManager.getVisibleRange()).toEqual({
        start: 0,
        end: 0,
        visibleCount: 0,
        totalHeight: 0,
        offsetY: 0
      })
    })

    it('应该正确设置容器高度', () => {
      virtualScrollManager.setContainerHeight(500)
      expect(virtualScrollManager.getContainerHeight()).toBe(500)
    })

    it('应该正确设置项目高度', () => {
      virtualScrollManager.setItemHeight(50)
      expect(virtualScrollManager.getItemHeight()).toBe(50)
    })

    it('应该正确设置缓冲区大小', () => {
      virtualScrollManager.setBufferSize(10)
      expect(virtualScrollManager.getBufferSize()).toBe(10)
    })

    it('应该正确设置总项目数', () => {
      virtualScrollManager.setTotalItems(1000)
      expect(virtualScrollManager.getTotalItems()).toBe(1000)
      expect(virtualScrollManager.getTotalHeight()).toBe(40000) // 1000 * 40
    })
  })

  describe('可见范围计算', () => {
    beforeEach(() => {
      virtualScrollManager.setTotalItems(1000)
      virtualScrollManager.setContainerHeight(400)
    })

    it('应该正确计算初始可见范围', () => {
      const range = virtualScrollManager.calculateVisibleRange(0)
      expect(range.start).toBe(0)
      expect(range.end).toBe(14) // Math.ceil(400/40) + 5 - 1 = 14
    })

    it('应该正确计算滚动后的可见范围', () => {
      const range = virtualScrollManager.calculateVisibleRange(200) // 滚动到200px
      expect(range.start).toBe(0) // Math.max(0, Math.floor(200/40) - 5) = 0
      expect(range.end).toBe(19) // Math.min(999, Math.floor(200/40) + Math.ceil(400/40) + 5) = 19
    })

    it('应该正确计算中间位置的可见范围', () => {
      const range = virtualScrollManager.calculateVisibleRange(2000) // 滚动到2000px
      expect(range.start).toBe(45) // Math.max(0, Math.floor(2000/40) - 5) = 45
      expect(range.end).toBe(69) // Math.min(999, 50 + 10 + 5 + 5 - 1) = 69
    })

    it('应该正确处理滚动到底部的情况', () => {
      const range = virtualScrollManager.calculateVisibleRange(39000) // 接近底部
      expect(range.start).toBe(970) // Math.max(0, Math.floor(39000/40) - 5) = 970
      expect(range.end).toBe(999) // 不超过总数-1
    })
  })

  describe('动态高度支持', () => {
    beforeEach(() => {
      virtualScrollManager = new VirtualScrollManager({
        container: mockContainer,
        itemHeight: 40,
        bufferSize: 5,
        dynamicHeight: true
      })
      virtualScrollManager.setTotalItems(100)
    })

    it('应该支持设置单个项目高度', () => {
      virtualScrollManager.setItemHeightByIndex(0, 60)
      virtualScrollManager.setItemHeightByIndex(1, 80)

      expect(virtualScrollManager.getItemHeightByIndex(0)).toBe(60)
      expect(virtualScrollManager.getItemHeightByIndex(1)).toBe(80)
      expect(virtualScrollManager.getItemHeightByIndex(2)).toBe(40) // 默认高度
    })

    it('应该正确计算动态高度的总高度', () => {
      virtualScrollManager.setItemHeightByIndex(0, 60)
      virtualScrollManager.setItemHeightByIndex(1, 80)

      // 总高度 = 60 + 80 + 98*40 = 4060
      expect(virtualScrollManager.getTotalHeight()).toBe(4060)
    })

    it('应该正确计算动态高度的项目偏移', () => {
      virtualScrollManager.setItemHeightByIndex(0, 60)
      virtualScrollManager.setItemHeightByIndex(1, 80)

      expect(virtualScrollManager.getItemOffset(0)).toBe(0)
      expect(virtualScrollManager.getItemOffset(1)).toBe(60)
      expect(virtualScrollManager.getItemOffset(2)).toBe(140) // 60 + 80
      expect(virtualScrollManager.getItemOffset(3)).toBe(180) // 60 + 80 + 40
    })

    it('应该正确计算动态高度的可见范围', () => {
      // 设置前几个项目为不同高度
      for (let i = 0; i < 10; i++) {
        virtualScrollManager.setItemHeightByIndex(i, 60 + i * 5)
      }

      const range = virtualScrollManager.calculateVisibleRange(200)
      expect(range.start).toBeGreaterThanOrEqual(0)
      expect(range.end).toBeLessThan(100)
      expect(range.end).toBeGreaterThan(range.start)
    })
  })

  describe('滚动事件处理', () => {
    beforeEach(() => {
      virtualScrollManager.setTotalItems(1000)
      virtualScrollManager.setContainerHeight(400)
    })

    it('应该正确处理滚动事件', () => {
      const onRangeChange = vi.fn()
      virtualScrollManager.on('range-change', onRangeChange)

      virtualScrollManager.handleScroll(200)

      expect(onRangeChange).toHaveBeenCalledWith({
        start: 0,
        end: 19,
        scrollTop: 200
      })
    })

    it('应该在范围变化时触发事件', () => {
      const onRangeChange = vi.fn()
      virtualScrollManager.on('range-change', onRangeChange)

      // 第一次滚动
      virtualScrollManager.handleScroll(0)
      expect(onRangeChange).toHaveBeenCalledTimes(1)

      // 相同位置不应该触发
      virtualScrollManager.handleScroll(0)
      expect(onRangeChange).toHaveBeenCalledTimes(1)

      // 不同位置应该触发
      virtualScrollManager.handleScroll(400)
      expect(onRangeChange).toHaveBeenCalledTimes(2)
    })

    it('应该正确处理快速滚动', () => {
      const onRangeChange = vi.fn()
      virtualScrollManager.on('range-change', onRangeChange)

      // 快速滚动到中间
      virtualScrollManager.handleScroll(20000)

      const lastCall = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0]
      expect(lastCall.start).toBeGreaterThan(400)
      expect(lastCall.end).toBeLessThan(1000)
      expect(lastCall.scrollTop).toBe(20000)
    })
  })

  describe('性能优化', () => {
    it('应该支持节流滚动事件', () => {
      const virtualScrollManagerWithThrottle = new VirtualScrollManager({
        container: mockContainer,
        itemHeight: 40,
        bufferSize: 5,
        throttleMs: 16
      })

      const onRangeChange = vi.fn()
      virtualScrollManagerWithThrottle.on('range-change', onRangeChange)
      virtualScrollManagerWithThrottle.setTotalItems(1000)

      // 快速连续滚动
      virtualScrollManagerWithThrottle.handleScroll(100)
      virtualScrollManagerWithThrottle.handleScroll(200)
      virtualScrollManagerWithThrottle.handleScroll(300)

      // 由于节流，应该只触发一次或少数几次
      expect(onRangeChange.mock.calls.length).toBeLessThanOrEqual(3)
    })

    it('应该能处理大数据量', () => {
      virtualScrollManager.setTotalItems(100000)

      const startTime = performance.now()
      const range = virtualScrollManager.calculateVisibleRange(50000)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(10) // 应该在10ms内完成
      expect(range.start).toBeGreaterThanOrEqual(0)
      expect(range.end).toBeLessThan(100000)
    })

    it('应该能高效处理频繁的滚动', () => {
      virtualScrollManager.setTotalItems(10000)

      const startTime = performance.now()

      // 模拟频繁滚动
      for (let i = 0; i < 1000; i++) {
        virtualScrollManager.calculateVisibleRange(i * 10)
      }

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
    })
  })

  describe('工具方法', () => {
    beforeEach(() => {
      virtualScrollManager.setTotalItems(1000)
    })

    it('应该正确滚动到指定项目', () => {
      const scrollTop = virtualScrollManager.scrollToItem(100)
      expect(scrollTop).toBe(4000) // 100 * 40
    })

    it('应该正确滚动到指定项目（动态高度）', () => {
      virtualScrollManager = new VirtualScrollManager({
        container: mockContainer,
        itemHeight: 40,
        bufferSize: 5,
        dynamicHeight: true
      })
      virtualScrollManager.setTotalItems(100)

      virtualScrollManager.setItemHeightByIndex(0, 60)
      virtualScrollManager.setItemHeightByIndex(1, 80)

      const scrollTop = virtualScrollManager.scrollToItem(2)
      expect(scrollTop).toBe(140) // 60 + 80
    })

    it('应该正确获取指定位置的项目索引', () => {
      const index = virtualScrollManager.getItemIndexAtPosition(4000)
      expect(index).toBe(100) // Math.floor(4000 / 40)
    })

    it('应该正确检查项目是否可见', () => {
      virtualScrollManager.handleScroll(2000) // 滚动到中间
      const currentRange = virtualScrollManager.getVisibleRange()

      expect(virtualScrollManager.isItemVisible(currentRange.start)).toBe(true)
      expect(virtualScrollManager.isItemVisible(currentRange.end)).toBe(true)
      expect(virtualScrollManager.isItemVisible(0)).toBe(false)
      expect(virtualScrollManager.isItemVisible(999)).toBe(false)
    })

    it('应该正确获取虚拟滚动状态', () => {
      virtualScrollManager.handleScroll(1000)

      const state = virtualScrollManager.getScrollState()
      expect(state).toEqual({
        scrollTop: 1000,
        visibleRange: virtualScrollManager.getVisibleRange(),
        totalHeight: virtualScrollManager.getTotalHeight(),
        containerHeight: virtualScrollManager.getContainerHeight()
      })
    })
  })

  describe('销毁和清理', () => {
    it('应该正确销毁管理器', () => {
      const onRangeChange = vi.fn()
      virtualScrollManager.on('range-change', onRangeChange)

      virtualScrollManager.destroy()

      // 销毁后不应该触发事件
      virtualScrollManager.handleScroll(1000)
      expect(onRangeChange).not.toHaveBeenCalled()
    })

    it('应该清理事件监听器', () => {
      virtualScrollManager.destroy()

      expect(mockContainer.removeEventListener).toHaveBeenCalled()
    })
  })
})
