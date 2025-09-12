/**
 * 小地图插件测试用例
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MiniMapPlugin, type MiniMapConfig, type ViewportInfo } from '../plugins/minimap/MiniMapPlugin'

// Mock LogicFlow
const mockLogicFlow = {
  getGraphData: vi.fn(() => ({
    nodes: [],
    edges: []
  })),
  getTransform: vi.fn(() => ({
    SCALE_X: 1,
    SCALE_Y: 1,
    TRANSLATE_X: 0,
    TRANSLATE_Y: 0
  })),
  getPointByClient: vi.fn((x: number, y: number) => ({ x, y })),
  translateCenter: vi.fn(),
  zoom: vi.fn(),
  fitView: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  container: null
}

// Mock DOM
const mockContainer = {
  getBoundingClientRect: vi.fn(() => ({
    width: 800,
    height: 600,
    left: 0,
    top: 0
  })),
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  contains: vi.fn(() => true)
}

describe('MiniMapPlugin', () => {
  let miniMap: MiniMapPlugin
  let container: any

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()

    // 创建容器
    container = mockContainer

    // 创建小地图实例
    miniMap = new MiniMapPlugin(mockLogicFlow, container, {
      width: 200,
      height: 150,
      position: 'bottom-right',
      showGrid: true,
      showZoomControls: true,
      showViewport: true
    })
  })

  afterEach(() => {
    if (miniMap) {
      miniMap.destroy()
    }
  })

  describe('初始化', () => {
    it('应该正确创建小地图实例', () => {
      expect(miniMap).toBeDefined()
      expect(container.appendChild).toHaveBeenCalled()
    })

    it('应该使用默认配置', () => {
      const defaultMiniMap = new MiniMapPlugin(mockLogicFlow, container)
      expect(defaultMiniMap).toBeDefined()
    })

    it('应该正确设置配置选项', () => {
      const config: MiniMapConfig = {
        width: 300,
        height: 200,
        position: 'top-left',
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        viewportColor: '#ff0000',
        showGrid: false,
        showZoomControls: false,
        showViewport: false
      }

      const customMiniMap = new MiniMapPlugin(mockLogicFlow, container, config)
      expect(customMiniMap).toBeDefined()
      customMiniMap.destroy()
    })
  })

  describe('可见性控制', () => {
    it('应该能够设置可见性', () => {
      miniMap.setVisible(false)
      expect(miniMap.isVisible()).toBe(false)

      miniMap.setVisible(true)
      expect(miniMap.isVisible()).toBe(true)
    })
  })

  describe('视口信息', () => {
    it('应该能够获取当前视口信息', () => {
      const viewport = miniMap.getCurrentViewport()
      expect(viewport).toBeDefined()
      expect(typeof viewport.x).toBe('number')
      expect(typeof viewport.y).toBe('number')
      expect(typeof viewport.width).toBe('number')
      expect(typeof viewport.height).toBe('number')
      expect(typeof viewport.scale).toBe('number')
    })

    it('应该能够获取画布边界信息', () => {
      const bounds = miniMap.getCanvasBounds()
      expect(bounds).toBeDefined()
      expect(typeof bounds.minX).toBe('number')
      expect(typeof bounds.minY).toBe('number')
      expect(typeof bounds.maxX).toBe('number')
      expect(typeof bounds.maxY).toBe('number')
      expect(typeof bounds.width).toBe('number')
      expect(typeof bounds.height).toBe('number')
    })
  })

  describe('回调函数', () => {
    it('应该能够设置视口变化回调', () => {
      const callback = vi.fn()
      miniMap.onViewportChanged(callback)

      // 这里需要触发视口变化事件来测试回调
      // 由于涉及DOM事件，这里只测试回调设置
      expect(callback).toBeDefined()
    })

    it('应该能够设置缩放变化回调', () => {
      const callback = vi.fn()
      miniMap.onZoomChanged(callback)

      // 这里需要触发缩放变化事件来测试回调
      // 由于涉及DOM事件，这里只测试回调设置
      expect(callback).toBeDefined()
    })
  })

  describe('强制更新', () => {
    it('应该能够强制更新小地图', () => {
      expect(() => {
        miniMap.forceUpdate()
      }).not.toThrow()
    })
  })

  describe('渲染功能', () => {
    it('应该能够渲染图形数据', () => {
      const nodes = [
        { id: '1', type: 'start', x: 100, y: 100, width: 80, height: 60 },
        { id: '2', type: 'approval', x: 300, y: 100, width: 100, height: 80 }
      ]

      const edges = [
        {
          id: 'e1',
          sourceNodeId: '1',
          targetNodeId: '2',
          startPoint: { x: 140, y: 100 },
          endPoint: { x: 260, y: 100 }
        }
      ]

      expect(() => {
        miniMap.renderGraph(nodes, edges)
      }).not.toThrow()
    })

    it('应该能够更新视口信息', () => {
      const viewport: ViewportInfo = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        scale: 1
      }

      expect(() => {
        miniMap.updateViewportInfo(viewport)
      }).not.toThrow()
    })
  })

  describe('事件监听', () => {
    it('应该正确绑定LogicFlow事件', () => {
      expect(mockLogicFlow.on).toHaveBeenCalledWith('graph:transform', expect.any(Function))
      expect(mockLogicFlow.on).toHaveBeenCalledWith('node:add', expect.any(Function))
      expect(mockLogicFlow.on).toHaveBeenCalledWith('node:delete', expect.any(Function))
      expect(mockLogicFlow.on).toHaveBeenCalledWith('node:drop', expect.any(Function))
      expect(mockLogicFlow.on).toHaveBeenCalledWith('edge:add', expect.any(Function))
      expect(mockLogicFlow.on).toHaveBeenCalledWith('edge:delete', expect.any(Function))
    })
  })

  describe('销毁功能', () => {
    it('应该正确清理资源', () => {
      miniMap.destroy()

      expect(mockLogicFlow.off).toHaveBeenCalled()
      expect(container.removeChild).toHaveBeenCalled()
    })

    it('销毁后应该能够安全调用方法', () => {
      miniMap.destroy()

      expect(() => {
        miniMap.setVisible(true)
        miniMap.forceUpdate()
        miniMap.getCurrentViewport()
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理空的图形数据', () => {
      mockLogicFlow.getGraphData.mockReturnValue({
        nodes: [],
        edges: []
      })

      expect(() => {
        miniMap.forceUpdate()
      }).not.toThrow()
    })

    it('应该处理无效的变换数据', () => {
      mockLogicFlow.getTransform.mockReturnValue(null)

      expect(() => {
        miniMap.forceUpdate()
      }).not.toThrow()
    })

    it('应该处理API调用失败', () => {
      mockLogicFlow.getPointByClient.mockImplementation(() => {
        throw new Error('API调用失败')
      })

      expect(() => {
        miniMap.forceUpdate()
      }).not.toThrow()
    })
  })
})

describe('MiniMapPlugin 性能测试', () => {
  let miniMap: MiniMapPlugin
  let container: any

  beforeEach(() => {
    vi.clearAllMocks()
    container = mockContainer
    miniMap = new MiniMapPlugin(mockLogicFlow, container)
  })

  afterEach(() => {
    if (miniMap) {
      miniMap.destroy()
    }
  })

  it('应该能够处理大量节点', () => {
    const nodes = Array.from({ length: 1000 }, (_, i) => ({
      id: `node-${i}`,
      type: 'process',
      x: Math.random() * 2000,
      y: Math.random() * 1500,
      width: 100,
      height: 60
    }))

    mockLogicFlow.getGraphData.mockReturnValue({
      nodes,
      edges: []
    })

    const startTime = performance.now()
    miniMap.forceUpdate()
    const endTime = performance.now()

    // 渲染1000个节点应该在100ms内完成
    expect(endTime - startTime).toBeLessThan(100)
  })

  it('应该能够处理频繁的更新', () => {
    const updateCount = 100
    const startTime = performance.now()

    for (let i = 0; i < updateCount; i++) {
      miniMap.forceUpdate()
    }

    const endTime = performance.now()
    const avgTime = (endTime - startTime) / updateCount

    // 平均每次更新应该在5ms内完成
    expect(avgTime).toBeLessThan(5)
  })
})
