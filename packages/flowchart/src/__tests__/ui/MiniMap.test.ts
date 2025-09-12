/**
 * 缩略图组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MiniMap } from '../../ui/native/MiniMap'

// Mock DOM APIs
const mockElement = {
  className: '',
  style: { cssText: '' },
  innerHTML: '',
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  contains: vi.fn(() => true),
  addEventListener: vi.fn(),
  querySelector: vi.fn(() => ({
    textContent: '',
    addEventListener: vi.fn()
  })),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    right: 200,
    bottom: 150,
    width: 200,
    height: 150
  })),
  width: 200,
  height: 150
}

const mockCanvas = {
  ...mockElement,
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    strokeStyle: '',
    lineWidth: 1,
    fillStyle: '',
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn()
  }))
}

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName) => {
    if (tagName === 'canvas') {
      return { ...mockCanvas }
    }
    return { ...mockElement }
  })
})

Object.defineProperty(document, 'addEventListener', {
  value: vi.fn()
})

describe('MiniMap', () => {
  let container: HTMLElement
  let miniMap: MiniMap

  beforeEach(() => {
    vi.clearAllMocks()
    container = { ...mockElement } as any
    miniMap = new MiniMap(container)
  })

  afterEach(() => {
    miniMap.destroy()
  })

  describe('基础功能', () => {
    it('应该能够创建缩略图', () => {
      expect(miniMap).toBeDefined()
    })

    it('应该能够更新视口', () => {
      const viewport = {
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        scale: 1.5
      }

      expect(() => miniMap.updateViewport(viewport)).not.toThrow()
    })

    it('应该能够渲染图形', () => {
      const nodes = [
        { x: 100, y: 100, width: 80, height: 40 },
        { x: 200, y: 200, width: 80, height: 40 }
      ]
      const edges = [
        { startPoint: { x: 100, y: 100 }, endPoint: { x: 200, y: 200 } }
      ]

      expect(() => miniMap.renderGraph(nodes, edges)).not.toThrow()
    })

    it('应该能够缩放', () => {
      expect(() => miniMap.zoom(1.2)).not.toThrow()
      expect(() => miniMap.zoom(0.8)).not.toThrow()
    })

    it('应该能够设置可见性', () => {
      expect(() => miniMap.setVisible(false)).not.toThrow()
      expect(() => miniMap.setVisible(true)).not.toThrow()
    })
  })

  describe('配置选项', () => {
    it('应该支持自定义尺寸', () => {
      const customMiniMap = new MiniMap(container, {
        width: 300,
        height: 200
      })
      expect(customMiniMap).toBeDefined()
      customMiniMap.destroy()
    })

    it('应该支持自定义位置', () => {
      const customMiniMap = new MiniMap(container, {
        position: 'top-left'
      })
      expect(customMiniMap).toBeDefined()
      customMiniMap.destroy()
    })

    it('应该支持禁用缩放控制', () => {
      const customMiniMap = new MiniMap(container, {
        showZoomControls: false
      })
      expect(customMiniMap).toBeDefined()
      customMiniMap.destroy()
    })

    it('应该支持禁用视口显示', () => {
      const customMiniMap = new MiniMap(container, {
        showViewport: false
      })
      expect(customMiniMap).toBeDefined()
      customMiniMap.destroy()
    })
  })

  describe('回调函数', () => {
    it('应该能够设置视口变化回调', () => {
      const callback = vi.fn()
      miniMap.onViewportChanged(callback)

      miniMap.updateViewport({
        x: 50,
        y: 50,
        width: 400,
        height: 300,
        scale: 1
      })

      expect(callback).toHaveBeenCalled()
    })

    it('应该能够设置缩放变化回调', () => {
      const callback = vi.fn()
      miniMap.onZoomChanged(callback)

      miniMap.zoom(1.5)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('边界情况', () => {
    it('应该处理空节点数组', () => {
      expect(() => miniMap.renderGraph([], [])).not.toThrow()
    })

    it('应该处理无效的缩放值', () => {
      expect(() => miniMap.zoom(0)).not.toThrow()
      expect(() => miniMap.zoom(10)).not.toThrow()
    })

    it('应该处理销毁后的操作', () => {
      miniMap.destroy()
      expect(() => miniMap.setVisible(true)).not.toThrow()
      expect(() => miniMap.zoom(1.2)).not.toThrow()
    })
  })
})
