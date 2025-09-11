/**
 * DOM 渲染器测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DOMRendererImpl } from '../../src/renderers/dom-renderer'
import { createTestContainer, cleanupTestContainer, createDefaultConfig, mockDOMRect } from '../utils/test-helpers'
import type { RenderContext } from '../../src/types'

describe('DOMRendererImpl', () => {
  let renderer: DOMRendererImpl
  let container: HTMLElement
  let renderContext: RenderContext

  beforeEach(() => {
    container = createTestContainer()
    renderer = new DOMRendererImpl()
    
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
    renderer.cleanup()
    cleanupTestContainer(container)
  })

  describe('基础功能', () => {
    it('应该正确识别渲染器类型', () => {
      expect(renderer.type).toBe('dom')
      expect(renderer.getType()).toBe('dom')
    })

    it('应该正确检查浏览器支持', () => {
      expect(renderer.isSupported()).toBe(true)
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

      expect(elements.length).toBeGreaterThan(0)
      elements.forEach(element => {
        expect(element).toBeInstanceOf(HTMLElement)
        expect(element.textContent).toContain('测试水印')
      })
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
      const element = elements[0]

      expect(element.style.fontSize).toBe('24px')
      expect(element.style.fontFamily).toContain('Arial')
      expect(element.style.color).toBe('red')
      expect(element.style.opacity).toBe('0.8')
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

    it('应该正确设置元素位置', () => {
      const element = document.createElement('div')
      renderer.setElementPosition(element, 100, 50)

      expect(element.style.left).toBe('100px')
      expect(element.style.top).toBe('50px')
    })

    it('应该正确设置元素内容', () => {
      const element = document.createElement('div')
      
      // 测试字符串内容
      renderer.setElementContent(element, '单行内容')
      expect(element.textContent).toBe('单行内容')

      // 测试数组内容
      renderer.setElementContent(element, ['第一行', '第二行'])
      expect(element.innerHTML).toContain('第一行')
      expect(element.innerHTML).toContain('第二行')
    })
  })

  describe('元素创建', () => {
    it('应该创建正确的水印元素', () => {
      const config = createDefaultConfig({
        content: '元素测试',
      })

      const element = renderer.createElement(config, 0, 0)

      expect(element).toBeInstanceOf(HTMLElement)
      expect(element.tagName.toLowerCase()).toBe('div')
      expect(element.classList.contains('watermark-item')).toBe(true)
    })

    it('应该为元素设置正确的基础样式', () => {
      const config = createDefaultConfig()
      const element = renderer.createElement(config, 0, 0)

      expect(element.style.position).toBe('absolute')
      expect(element.style.pointerEvents).toBe('none')
      expect(element.style.userSelect).toBe('none')
    })
  })

  describe('更新功能', () => {
    it('应该成功更新现有元素', async () => {
      const config = createDefaultConfig({ content: '原始内容' })
      const elements = await renderer.render(config, renderContext)

      const updatedConfig = createDefaultConfig({ content: '更新内容' })
      await renderer.update(elements, updatedConfig, renderContext)

      expect(elements[0].textContent).toContain('更新内容')
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
      expect(container.children.length).toBeGreaterThan(0)

      await renderer.destroy(elements)
      expect(container.children.length).toBe(0)
    })
  })

  describe('样式应用', () => {
    it('应该正确应用基础样式', () => {
      const element = document.createElement('div')
      const config = createDefaultConfig({
        style: {
          fontSize: 18,
          color: 'blue',
          opacity: 0.7,
        },
      })

      renderer.applyStyles(element, config)

      expect(element.style.fontSize).toBe('18px')
      expect(element.style.color).toBe('blue')
      expect(element.style.opacity).toBe('0.7')
    })

    it('应该正确应用旋转样式', () => {
      const element = document.createElement('div')
      const config = createDefaultConfig({
        style: {
          rotate: 30,
        },
      })

      renderer.applyStyles(element, config)

      expect(element.style.transform).toContain('rotate(30deg)')
    })

    it('应该正确应用背景样式', () => {
      const element = document.createElement('div')
      const config = createDefaultConfig({
        style: {
          backgroundColor: 'yellow',
          border: '1px solid black',
          padding: 10,
          borderRadius: 5,
        },
      })

      renderer.applyStyles(element, config)

      expect(element.style.backgroundColor).toBe('yellow')
      expect(element.style.border).toBe('1px solid black')
      expect(element.style.padding).toBe('10px')
      expect(element.style.borderRadius).toBe('5px')
    })
  })

  describe('动画应用', () => {
    it('应该正确应用动画', async () => {
      const element = document.createElement('div')
      const animation = {
        type: 'fade' as const,
        duration: 2000,
        delay: 0,
        iteration: 'infinite' as const,
        easing: 'ease-in-out',
      }

      await renderer.applyAnimation(element, animation)

      // 验证动画相关的样式或类名
      expect(element.style.animationDuration).toBe('2000ms')
    })
  })

  describe('错误处理', () => {
    it('应该处理无效配置', async () => {
      const invalidConfig = {
        content: null as any,
      }

      // DOM 渲染器会处理 null 内容而不抛出错误，它会创建空的元素
      const elements = await renderer.render(invalidConfig, renderContext)
      expect(elements).toBeDefined()
      expect(elements.length).toBeGreaterThan(0)
    })

    it('应该处理空元素数组', async () => {
      const config = createDefaultConfig()
      await expect(renderer.destroy([])).resolves.not.toThrow()
    })
  })

  describe('性能优化', () => {
    it('应该高效处理大量元素', async () => {
      const config = createDefaultConfig({
        layout: {
          rows: 10,
          cols: 10,
          autoCalculate: false,
        },
      })

      const start = Date.now()
      const elements = await renderer.render(config, renderContext)
      const end = Date.now()

      expect(elements.length).toBe(100) // 10x10
      expect(end - start).toBeLessThan(1000) // 应该在 1 秒内完成
    })
  })

  describe('响应式支持', () => {
    it('应该适应不同的容器尺寸', async () => {
      const smallContext = {
        ...renderContext,
        containerRect: mockDOMRect({ width: 400, height: 300 }),
      }

      const largeContext = {
        ...renderContext,
        containerRect: mockDOMRect({ width: 1200, height: 800 }),
      }

      const config = createDefaultConfig()
      
      const smallElements = await renderer.render(config, smallContext)
      const largeElements = await renderer.render(config, largeContext)

      // 大容器应该有更多的水印元素
      expect(largeElements.length).toBeGreaterThan(smallElements.length)
    })
  })
})
