/**
 * 虚拟渲染器测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VirtualRenderer, BatchDOMUpdater } from '../../performance/VirtualRenderer'
import type { ApprovalNodeConfig, ApprovalEdgeConfig, ViewportInfo } from '../../types'

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16)
  return 1
})

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true
})

// Mock MessageChannel
const mockMessageChannel = vi.fn(() => ({
  port1: { postMessage: vi.fn() },
  port2: { onmessage: null }
}))

Object.defineProperty(global, 'MessageChannel', {
  value: mockMessageChannel,
  writable: true
})

describe('VirtualRenderer', () => {
  let renderer: VirtualRenderer
  let mockNodes: ApprovalNodeConfig[]
  let mockEdges: ApprovalEdgeConfig[]

  beforeEach(() => {
    vi.clearAllMocks()
    
    renderer = new VirtualRenderer({
      enabled: true,
      bufferSize: 100,
      maxVisibleNodes: 50,
      maxVisibleEdges: 100
    })

    // 创建测试节点
    mockNodes = [
      {
        id: 'node1',
        type: 'start',
        x: 100,
        y: 100,
        text: '开始',
        properties: {}
      },
      {
        id: 'node2',
        type: 'approval',
        x: 300,
        y: 100,
        text: '审批',
        properties: {}
      },
      {
        id: 'node3',
        type: 'end',
        x: 500,
        y: 100,
        text: '结束',
        properties: {}
      },
      {
        id: 'node4',
        type: 'process',
        x: 1000,
        y: 1000,
        text: '远程节点',
        properties: {}
      }
    ]

    // 创建测试边
    mockEdges = [
      {
        id: 'edge1',
        type: 'approval-edge',
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        text: '连接1',
        properties: {}
      },
      {
        id: 'edge2',
        type: 'approval-edge',
        sourceNodeId: 'node2',
        targetNodeId: 'node3',
        text: '连接2',
        properties: {}
      }
    ]
  })

  describe('基础功能', () => {
    it('应该能够创建虚拟渲染器实例', () => {
      expect(renderer).toBeDefined()
      expect(renderer).toBeInstanceOf(VirtualRenderer)
    })

    it('应该能够更新视口信息', () => {
      const viewport: Partial<ViewportInfo> = {
        x: 50,
        y: 50,
        width: 800,
        height: 600,
        scale: 1.5
      }

      expect(() => renderer.updateViewport(viewport)).not.toThrow()
    })

    it('应该能够获取当前渲染级别', () => {
      const renderLevel = renderer.getCurrentRenderLevel()
      
      expect(renderLevel).toBeDefined()
      expect(renderLevel.name).toBeTruthy()
      expect(typeof renderLevel.showText).toBe('boolean')
      expect(typeof renderLevel.showDetails).toBe('boolean')
      expect(typeof renderLevel.simplificationLevel).toBe('number')
    })
  })

  describe('可见性计算', () => {
    it('应该能够计算可见的节点', () => {
      // 设置视口在节点1和节点2附近
      renderer.updateViewport({
        x: 0,
        y: 0,
        width: 400,
        height: 200,
        scale: 1
      })

      const visibleNodes = renderer.getVisibleNodes(mockNodes)
      
      expect(Array.isArray(visibleNodes)).toBe(true)
      expect(visibleNodes.length).toBeGreaterThan(0)
      expect(visibleNodes.length).toBeLessThanOrEqual(mockNodes.length)
      
      // 应该包含在视口内的节点
      const visibleIds = visibleNodes.map(n => n.id)
      expect(visibleIds).toContain('node1')
      expect(visibleIds).toContain('node2')
    })

    it('应该能够计算可见的边', () => {
      // 先计算可见节点
      renderer.updateViewport({
        x: 0,
        y: 0,
        width: 400,
        height: 200,
        scale: 1
      })

      const visibleNodes = renderer.getVisibleNodes(mockNodes)
      const visibleEdges = renderer.getVisibleEdges(mockEdges, visibleNodes)
      
      expect(Array.isArray(visibleEdges)).toBe(true)
      expect(visibleEdges.length).toBeGreaterThanOrEqual(0)
      expect(visibleEdges.length).toBeLessThanOrEqual(mockEdges.length)
    })

    it('应该限制最大可见节点数量', () => {
      const limitedRenderer = new VirtualRenderer({
        enabled: true,
        maxVisibleNodes: 2
      })

      limitedRenderer.updateViewport({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
        scale: 1
      })

      const visibleNodes = limitedRenderer.getVisibleNodes(mockNodes)
      expect(visibleNodes.length).toBeLessThanOrEqual(2)
    })

    it('禁用时应该返回所有节点', () => {
      const disabledRenderer = new VirtualRenderer({
        enabled: false
      })

      const visibleNodes = disabledRenderer.getVisibleNodes(mockNodes)
      expect(visibleNodes.length).toBe(mockNodes.length)
    })
  })

  describe('渲染级别', () => {
    it('应该根据缩放比例选择合适的渲染级别', () => {
      // 高缩放比例 - 详细级别
      renderer.updateViewport({ scale: 1.0 })
      let level = renderer.getCurrentRenderLevel()
      expect(level.name).toBe('detailed')
      expect(level.showDetails).toBe(true)

      // 中等缩放比例 - 普通级别
      renderer.updateViewport({ scale: 0.6 })
      level = renderer.getCurrentRenderLevel()
      expect(level.name).toBe('normal')

      // 低缩放比例 - 简化级别
      renderer.updateViewport({ scale: 0.3 })
      level = renderer.getCurrentRenderLevel()
      expect(level.name).toBe('simplified')

      // 极低缩放比例 - 最小级别
      renderer.updateViewport({ scale: 0.1 })
      level = renderer.getCurrentRenderLevel()
      expect(level.name).toBe('minimal')
      expect(level.showText).toBe(false)
    })
  })

  describe('节点和边简化', () => {
    it('应该能够简化节点', () => {
      const originalNode = mockNodes[0]
      
      // 设置为简化级别
      renderer.updateViewport({ scale: 0.3 })
      
      const simplifiedNode = renderer.getSimplifiedNode(originalNode)
      
      expect(simplifiedNode).toBeDefined()
      expect(simplifiedNode.id).toBe(originalNode.id)
      expect(simplifiedNode.type).toBe(originalNode.type)
    })

    it('应该能够简化边', () => {
      const originalEdge = mockEdges[0]
      
      // 设置为不显示边标签的级别
      renderer.updateViewport({ scale: 0.3 })
      
      const simplifiedEdge = renderer.getSimplifiedEdge(originalEdge)
      
      expect(simplifiedEdge).toBeDefined()
      expect(simplifiedEdge.id).toBe(originalEdge.id)
      expect(simplifiedEdge.type).toBe(originalEdge.type)
    })

    it('在详细级别时不应该简化', () => {
      const originalNode = mockNodes[0]
      
      // 设置为详细级别
      renderer.updateViewport({ scale: 1.0 })
      
      const simplifiedNode = renderer.getSimplifiedNode(originalNode)
      
      expect(simplifiedNode).toEqual(originalNode)
    })
  })

  describe('懒加载和渲染队列', () => {
    it('应该能够添加渲染任务到队列', () => {
      const mockTask = vi.fn()
      
      renderer.addRenderTask(mockTask)
      
      const stats = renderer.getPerformanceStats()
      expect(stats.queueSize).toBeGreaterThan(0)
    })

    it('应该能够清空渲染队列', () => {
      const mockTask = vi.fn()
      
      renderer.addRenderTask(mockTask)
      renderer.clearRenderQueue()
      
      const stats = renderer.getPerformanceStats()
      expect(stats.queueSize).toBe(0)
    })

    it('应该能够启用懒加载', () => {
      expect(() => renderer.enableLazyLoading()).not.toThrow()
    })
  })

  describe('性能统计', () => {
    it('应该能够获取性能统计信息', () => {
      const stats = renderer.getPerformanceStats()
      
      expect(stats).toBeDefined()
      expect(typeof stats.visibleNodeCount).toBe('number')
      expect(typeof stats.visibleEdgeCount).toBe('number')
      expect(typeof stats.renderLevel).toBe('string')
      expect(typeof stats.bufferSize).toBe('number')
      expect(typeof stats.queueSize).toBe('number')
    })

    it('统计信息应该反映实际状态', () => {
      // 计算一些可见节点
      renderer.updateViewport({
        x: 0,
        y: 0,
        width: 400,
        height: 200,
        scale: 1
      })
      
      renderer.getVisibleNodes(mockNodes)
      
      const stats = renderer.getPerformanceStats()
      expect(stats.visibleNodeCount).toBeGreaterThan(0)
    })
  })

  describe('重置功能', () => {
    it('应该能够重置虚拟渲染器', () => {
      // 先添加一些数据
      renderer.getVisibleNodes(mockNodes)
      renderer.addRenderTask(() => {})
      
      // 重置
      renderer.reset()
      
      const stats = renderer.getPerformanceStats()
      expect(stats.visibleNodeCount).toBe(0)
      expect(stats.visibleEdgeCount).toBe(0)
      expect(stats.queueSize).toBe(0)
    })
  })
})

describe('BatchDOMUpdater', () => {
  let updater: BatchDOMUpdater

  beforeEach(() => {
    vi.clearAllMocks()
    updater = new BatchDOMUpdater()
  })

  describe('基础功能', () => {
    it('应该能够创建批量DOM更新器实例', () => {
      expect(updater).toBeDefined()
      expect(updater).toBeInstanceOf(BatchDOMUpdater)
    })

    it('应该能够添加更新操作', () => {
      const mockUpdate = vi.fn()
      
      expect(() => updater.addUpdate(mockUpdate)).not.toThrow()
    })

    it('应该能够立即执行所有更新', () => {
      const mockUpdate1 = vi.fn()
      const mockUpdate2 = vi.fn()
      
      updater.addUpdate(mockUpdate1)
      updater.addUpdate(mockUpdate2)
      
      updater.flush()
      
      // 由于使用了 requestAnimationFrame，需要等待执行
      setTimeout(() => {
        expect(mockUpdate1).toHaveBeenCalled()
        expect(mockUpdate2).toHaveBeenCalled()
      }, 20)
    })

    it('应该能够清空所有待执行的更新', () => {
      const mockUpdate = vi.fn()
      
      updater.addUpdate(mockUpdate)
      updater.clear()
      updater.flush()
      
      // 清空后不应该执行
      setTimeout(() => {
        expect(mockUpdate).not.toHaveBeenCalled()
      }, 20)
    })
  })

  describe('错误处理', () => {
    it('应该能够处理更新操作中的错误', () => {
      const errorUpdate = vi.fn(() => {
        throw new Error('测试错误')
      })
      const normalUpdate = vi.fn()
      
      updater.addUpdate(errorUpdate)
      updater.addUpdate(normalUpdate)
      
      // 不应该抛出错误
      expect(() => updater.flush()).not.toThrow()
    })
  })
})
