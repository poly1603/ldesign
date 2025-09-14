/**
 * 虚拟滚动功能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VirtualScrollManager } from '../src/features/virtual-scroll'
import { TreeNodeImpl } from '../src/core/tree-node'
import { DEFAULT_TREE_OPTIONS } from '../src/types/tree-options'
import type { TreeNode } from '../src/types/tree-node'

// Mock DOM elements
class MockElement {
  scrollTop = 0
  scrollHeight = 1000
  clientHeight = 400

  addEventListener = vi.fn()
  removeEventListener = vi.fn()
}

describe('VirtualScrollManager', () => {
  let virtualScroll: VirtualScrollManager
  let nodes: TreeNode[]
  let mockContainer: MockElement
  let mockScrollElement: MockElement

  beforeEach(() => {
    // 创建大量测试节点
    nodes = []
    for (let i = 0; i < 100; i++) {
      const node = new TreeNodeImpl({
        id: `node-${i}`,
        label: `节点 ${i}`,
      })

      // 为前10个节点添加子节点并展开
      if (i < 10) {
        for (let j = 0; j < 5; j++) {
          node.addChild({
            id: `node-${i}-${j}`,
            label: `子节点 ${i}-${j}`,
          })
        }
        node.expanded = true // 添加子节点后再展开
      }

      nodes.push(node)
    }

    virtualScroll = new VirtualScrollManager({
      ...DEFAULT_TREE_OPTIONS,
      virtualScroll: {
        enabled: true,
        itemHeight: 32,
        containerHeight: 400,
        overscan: 5,
        threshold: 100,
      },
    })

    mockContainer = new MockElement()
    mockScrollElement = new MockElement()
  })

  describe('基础功能', () => {
    it('应该能够设置容器元素', () => {
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)

      expect(mockScrollElement.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('应该能够更新扁平化节点列表', () => {
      virtualScroll.updateFlattenedNodes(nodes)

      const allItems = virtualScroll.getAllItems()
      // 100个根节点 + 10个展开节点的50个子节点 = 150个项目
      expect(allItems.length).toBe(150)
    })

    it('应该能够获取总高度', () => {
      virtualScroll.updateFlattenedNodes(nodes)

      const totalHeight = virtualScroll.getTotalHeight()
      // 150个项目 * 32px = 4800px
      expect(totalHeight).toBe(4800)
    })

    it('应该能够获取滚动统计信息', () => {
      virtualScroll.updateFlattenedNodes(nodes)

      const stats = virtualScroll.getScrollStats()
      expect(stats.totalItems).toBe(150)
      expect(stats.totalHeight).toBe(4800)
      expect(stats.containerHeight).toBe(400)
      expect(stats.scrollTop).toBe(0)
    })
  })

  describe('虚拟滚动计算', () => {
    beforeEach(() => {
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)
      virtualScroll.updateFlattenedNodes(nodes)
    })

    it('应该能够计算可见范围', () => {
      const range = virtualScroll.getCurrentRange()

      // 容器高度400px，项目高度32px，可见约12-13个项目
      // 加上overscan(5)，应该渲染更多项目
      expect(range.start).toBe(0)
      expect(range.end).toBeGreaterThan(12)
      expect(range.visibleStart).toBe(0)
      expect(range.visibleEnd).toBeGreaterThan(10)
    })

    it('应该能够获取可见项目', () => {
      const visibleItems = virtualScroll.getVisibleItems()

      // 初始状态下应该有可见项目
      expect(visibleItems.length).toBeGreaterThan(0)
      expect(visibleItems.length).toBeLessThanOrEqual(virtualScroll.getAllItems().length)
    })

    it('滚动后应该更新可见范围', () => {
      // 模拟滚动
      mockScrollElement.scrollTop = 320 // 滚动10个项目的高度

      // 手动触发滚动事件
      const scrollHandler = mockScrollElement.addEventListener.mock.calls[0][1]
      scrollHandler({ target: mockScrollElement })

      const range = virtualScroll.getCurrentRange()
      expect(range.visibleStart).toBeGreaterThan(0)
    })
  })

  describe('滚动控制', () => {
    beforeEach(() => {
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)
      virtualScroll.updateFlattenedNodes(nodes)
    })

    it('应该能够滚动到指定节点', () => {
      virtualScroll.scrollToNode('node-20')

      // node-20在扁平化列表中的实际位置：10个展开节点(每个6项) + 10个普通节点 = 70
      // 位置应该是 70 * 32 = 2240px
      expect(mockScrollElement.scrollTop).toBe(2240)
    })

    it('应该能够滚动到指定索引', () => {
      virtualScroll.scrollToIndex(15)

      // 索引15应该在位置 15 * 32 = 480px
      expect(mockScrollElement.scrollTop).toBe(480)
    })

    it('应该能够居中滚动到节点', () => {
      virtualScroll.scrollToNode('node-20', 'center')

      // 居中位置应该是 2240 - 400/2 = 2040px
      expect(mockScrollElement.scrollTop).toBe(2040)
    })

    it('应该能够滚动到节点末尾', () => {
      virtualScroll.scrollToNode('node-20', 'end')

      // 末尾位置应该是 2240 - 400 + 32 = 1872px
      expect(mockScrollElement.scrollTop).toBe(1872)
    })

    it('滚动位置应该在有效范围内', () => {
      // 尝试滚动到超出范围的位置
      virtualScroll.scrollToNode('node-0', 'center')

      // 应该被限制在0
      expect(mockScrollElement.scrollTop).toBe(0)
    })
  })

  describe('节点位置计算', () => {
    beforeEach(() => {
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)
      virtualScroll.updateFlattenedNodes(nodes)
    })

    it('应该能够获取节点在视口中的位置', () => {
      const position = virtualScroll.getNodePosition('node-5')

      expect(position).not.toBeNull()
      // node-5在扁平化列表中的位置：5个展开节点(每个6项) = 30
      // 位置应该是 30 * 32 = 960px
      expect(position!.top).toBe(960)
      expect(position!.visible).toBe(false) // 超出视口范围
    })

    it('应该能够检测节点是否可见', () => {
      // 滚动到使某些节点不可见
      mockScrollElement.scrollTop = 500
      const scrollHandler = mockScrollElement.addEventListener.mock.calls[0][1]
      scrollHandler({ target: mockScrollElement })

      const position1 = virtualScroll.getNodePosition('node-0')
      const position2 = virtualScroll.getNodePosition('node-1') // 使用更靠近的节点

      expect(position1!.visible).toBe(false) // 在视口上方
      expect(position2!.visible).toBe(false) // node-1在位置192px，滚动500px后相对位置-308px，不可见
    })

    it('不存在的节点应该返回null', () => {
      const position = virtualScroll.getNodePosition('non-existent')
      expect(position).toBeNull()
    })
  })

  describe('高度管理', () => {
    beforeEach(() => {
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)
      virtualScroll.updateFlattenedNodes(nodes)
    })

    it('应该能够更新项目高度', () => {
      const originalHeight = virtualScroll.getTotalHeight()

      // 更新第一个节点的高度
      virtualScroll.updateItemHeight('node-0', 64)

      const newHeight = virtualScroll.getTotalHeight()
      expect(newHeight).toBe(originalHeight + 32) // 增加了32px
    })

    it('应该能够清除高度缓存', () => {
      // 更新一个节点的高度
      virtualScroll.updateItemHeight('node-0', 64)

      // 清除缓存
      virtualScroll.clearHeightCache()

      // 高度应该恢复到默认值
      const totalHeight = virtualScroll.getTotalHeight()
      expect(totalHeight).toBe(150 * 32) // 所有项目都是默认高度
    })
  })

  describe('配置更新', () => {
    beforeEach(() => {
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)
      virtualScroll.updateFlattenedNodes(nodes)
    })

    it('应该能够更新配置', () => {
      const originalHeight = virtualScroll.getTotalHeight()

      // 更新项目高度配置
      virtualScroll.updateConfig({ itemHeight: 48 })

      const newHeight = virtualScroll.getTotalHeight()
      expect(newHeight).toBe(150 * 48) // 新的高度
    })

    it('更新配置应该清除缓存', () => {
      // 更新一个节点的高度
      virtualScroll.updateItemHeight('node-0', 64)

      // 更新配置
      virtualScroll.updateConfig({ itemHeight: 40 })

      // 所有项目应该使用新的默认高度
      const totalHeight = virtualScroll.getTotalHeight()
      expect(totalHeight).toBe(150 * 40)
    })
  })

  describe('回调函数', () => {
    it('应该能够设置和触发滚动回调', () => {
      const onScroll = vi.fn()
      const onRangeChange = vi.fn()

      virtualScroll.setCallbacks({ onScroll, onRangeChange })
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)
      virtualScroll.updateFlattenedNodes(nodes)

      // 模拟滚动
      mockScrollElement.scrollTop = 100
      const scrollHandler = mockScrollElement.addEventListener.mock.calls[0][1]
      scrollHandler({ target: mockScrollElement })

      expect(onScroll).toHaveBeenCalledWith(100, expect.any(Object))
      expect(onRangeChange).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('边界情况', () => {
    it('应该能够处理空节点列表', () => {
      virtualScroll.updateFlattenedNodes([])

      const allItems = virtualScroll.getAllItems()
      const totalHeight = virtualScroll.getTotalHeight()

      expect(allItems.length).toBe(0)
      expect(totalHeight).toBe(0)
    })

    it('应该能够处理无效的滚动位置', () => {
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)
      virtualScroll.updateFlattenedNodes(nodes)

      // 尝试滚动到无效索引
      virtualScroll.scrollToIndex(-1)
      virtualScroll.scrollToIndex(1000)

      // 不应该抛出错误
      expect(mockScrollElement.scrollTop).toBeDefined()
    })
  })

  describe('销毁功能', () => {
    it('应该能够正确销毁管理器', () => {
      virtualScroll.setContainer(mockContainer as any, mockScrollElement as any)
      virtualScroll.updateFlattenedNodes(nodes)

      virtualScroll.destroy()

      expect(mockScrollElement.removeEventListener).toHaveBeenCalled()
      expect(virtualScroll.getAllItems().length).toBe(0)
      expect(virtualScroll.getTotalHeight()).toBe(0)
    })
  })
})
