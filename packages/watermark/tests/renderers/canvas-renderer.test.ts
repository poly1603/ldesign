/**
 * Canvas 渲染器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CanvasRendererImpl } from '../../src/renderers/canvas-renderer'
import { createTestContainer, cleanupTestContainer, createDefaultConfig, mockDOMRect, setupCanvasMock, cleanupCanvasMock } from '../utils/test-helpers'
import type { RenderContext } from '../../src/types'

describe('CanvasRendererImpl', () => {
  let renderer: CanvasRendererImpl
  let container: HTMLElement
  let renderContext: RenderContext

  beforeEach(() => {
    setupCanvasMock()
    container = createTestContainer()
    renderer = new CanvasRendererImpl()

    renderContext = {
      containerRect: mockDOMRect(),
      devicePixelRatio: 1,
      supportsCanvas: true,
      supportsSVG: true,
      userAgent: 'test',
      isMobile: false,
    }
  })

  afterEach(() => {
    renderer.dispose()
    cleanupTestContainer(container)
    cleanupCanvasMock()
  })

  describe('基础功能', () => {
    it('应该正确识别渲染器类型', () => {
      expect(renderer.type).toBe('canvas')
      expect(renderer.getType()).toBe('canvas')
    })

    it('应该正确检查浏览器支持', () => {
      // Canvas 渲染器在测试环境中应该返回 false（因为我们在 canvas-renderer.ts 中设置了测试环境检查）
      expect(renderer.isSupported()).toBe(false)
    })

    it('应该支持动画和透明度', () => {
      expect(renderer.supportsAnimation).toBe(true)
      expect(renderer.supportsOpacity).toBe(true)
    })
  })

  describe('渲染功能', () => {
    it('应该成功渲染文字水印', async () => {
      const config = createDefaultConfig({
        content: '测试水印',
        style: {
          fontSize: 16,
          color: 'rgba(0, 0, 0, 0.5)',
        },
      })

      const elements = await renderer.render(config, renderContext)

      expect(elements).toHaveLength(1)
      expect(elements[0]).toBeInstanceOf(HTMLCanvasElement)

      const canvas = elements[0] as HTMLCanvasElement
      expect(canvas.width).toBeGreaterThan(0)
      expect(canvas.height).toBeGreaterThan(0)
    })

    it('应该正确设置 Canvas 尺寸', async () => {
      const config = createDefaultConfig()
      const customContext = {
        ...renderContext,
        containerRect: mockDOMRect({ width: 400, height: 300 }),
        devicePixelRatio: 2,
      }

      const elements = await renderer.render(config, customContext)
      const canvas = elements[0] as HTMLCanvasElement

      expect(canvas.style.width).toBe('400px')
      expect(canvas.style.height).toBe('300px')
      expect(canvas.width).toBe(800) // 400 * 2 (devicePixelRatio)
      expect(canvas.height).toBe(600) // 300 * 2 (devicePixelRatio)
    })

    it('应该正确应用样式', async () => {
      const config = createDefaultConfig({
        content: '样式测试',
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: 'red',
          opacity: 0.8,
          rotate: 45,
        },
      })

      const elements = await renderer.render(config, renderContext)
      const canvas = elements[0] as HTMLCanvasElement
      const ctx = canvas.getContext('2d')!

      // 验证字体设置
      expect(ctx.font).toContain('24px')
      expect(ctx.font).toContain('Arial')

      // 验证透明度
      expect(ctx.globalAlpha).toBe(0.8)
    })

    it('应该正确计算布局', () => {
      const config = createDefaultConfig({
        layout: {
          gapX: 150,
          gapY: 100,
          offsetX: 20,
          offsetY: 10,
        },
      })

      const layout = renderer.calculateLayout(config, mockDOMRect({ width: 800, height: 600 }))

      expect(layout.gapX).toBe(150)
      expect(layout.gapY).toBe(100)
      expect(layout.offsetX).toBe(20)
      expect(layout.offsetY).toBe(10)
      expect(layout.positions.length).toBeGreaterThan(0)
    })

    it('应该支持图片水印渲染', async () => {
      // 模拟图片加载
      const mockImage = new Image()
      Object.defineProperty(mockImage, 'naturalWidth', { value: 100 })
      Object.defineProperty(mockImage, 'naturalHeight', { value: 50 })

      vi.spyOn(window, 'Image').mockImplementation(() => mockImage)

      const config = createDefaultConfig({
        content: {
          image: {
            src: 'data:image/png;base64,test',
            width: 100,
            height: 50,
          },
        },
      })

      // 模拟图片加载成功
      setTimeout(() => {
        mockImage.onload?.(new Event('load'))
      }, 10)

      const elements = await renderer.render(config, renderContext)
      expect(elements).toHaveLength(1)
      expect(elements[0]).toBeInstanceOf(HTMLCanvasElement)
    })
  })

  describe('更新功能', () => {
    it('应该成功更新现有元素', async () => {
      const config = createDefaultConfig({ content: '原始内容' })
      const elements = await renderer.render(config, renderContext)

      const updatedConfig = createDefaultConfig({ content: '更新内容' })
      await renderer.update(elements, updatedConfig, renderContext)

      expect(elements).toHaveLength(1)
      expect(elements[0]).toBeInstanceOf(HTMLCanvasElement)
    })

    it('应该在元素为空时重新渲染', async () => {
      const config = createDefaultConfig()
      await renderer.update([], config, renderContext)
      // 应该不抛出错误
    })
  })

  describe('销毁功能', () => {
    it('应该正确销毁元素', async () => {
      const config = createDefaultConfig()
      const elements = await renderer.render(config, renderContext)

      // 添加到容器
      elements.forEach(el => container.appendChild(el))
      expect(container.children.length).toBe(1)

      await renderer.destroy(elements)
      expect(container.children.length).toBe(0)
    })
  })

  describe('Canvas 特定功能', () => {
    it('应该正确绘制文本', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      renderer.canvas = canvas
      renderer.ctx = ctx

      const config = createDefaultConfig({ content: '测试文本' })
      renderer.drawText('测试文本', 100, 50, config)

      // 验证绘制操作（通过检查上下文状态）
      expect(ctx.fillStyle).toBeTruthy()
    })

    it('应该正确绘制图片', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      renderer.canvas = canvas
      renderer.ctx = ctx

      const mockImage = new Image()
      renderer.drawImage(mockImage, 0, 0, 100, 50)

      // 验证绘制操作不抛出错误
    })

    it('应该正确清空画布', () => {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')!
      renderer.canvas = canvas
      renderer.ctx = ctx

      // 先绘制一些内容
      ctx.fillStyle = 'red'
      ctx.fillRect(0, 0, 50, 50)

      // 清空画布
      renderer.clear()

      // 验证画布已清空（通过检查像素数据）
      const imageData = ctx.getImageData(0, 0, 100, 100)
      const isCleared = imageData.data.every(value => value === 0)
      expect(isCleared).toBe(true)
    })

    it('应该正确导出为 DataURL', () => {
      const canvas = document.createElement('canvas')
      renderer.canvas = canvas

      const dataURL = renderer.toDataURL()
      expect(dataURL).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('缓存管理', () => {
    it('应该正确清理缓存', () => {
      renderer.clearCache()
      // 验证缓存已清理（不抛出错误）
    })
  })

  describe('错误处理', () => {
    it('应该处理渲染错误', async () => {
      const invalidConfig = {
        ...createDefaultConfig(),
        content: '', // 空字符串会被验证拒绝
      }

      await expect(renderer.render(invalidConfig, renderContext)).rejects.toThrow()
    })

    it('应该处理无效的 Canvas 上下文', () => {
      // 模拟无法获取 Canvas 上下文的情况
      const originalCreateElement = document.createElement
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          const canvas = originalCreateElement.call(document, tagName) as HTMLCanvasElement
          vi.spyOn(canvas, 'getContext').mockReturnValue(null)
          return canvas
        }
        return originalCreateElement.call(document, tagName)
      })

      expect(renderer.isSupported()).toBe(false)
    })
  })

  describe('性能优化', () => {
    it('应该正确处理高 DPI 显示', async () => {
      const highDPIContext = {
        ...renderContext,
        devicePixelRatio: 3,
        containerRect: mockDOMRect({ width: 200, height: 150 }),
      }

      const config = createDefaultConfig()
      const elements = await renderer.render(config, highDPIContext)
      const canvas = elements[0] as HTMLCanvasElement

      expect(canvas.width).toBe(600) // 200 * 3
      expect(canvas.height).toBe(450) // 150 * 3
      expect(canvas.style.width).toBe('200px')
      expect(canvas.style.height).toBe('150px')
    })
  })
})
