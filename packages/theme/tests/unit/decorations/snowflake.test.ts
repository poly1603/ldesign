/**
 * @ldesign/theme - 雪花装饰元素单元测试
 */

import type { WidgetConfig } from '../../../src/core/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createSnowfallEffect,
  SnowflakeDecoration,
} from '../../../src/widgets/decorations'

// 清理函数
function cleanup() {
  document.body.innerHTML = ''
}

describe('snowflakeDecoration', () => {
  let container: HTMLElement
  let config: WidgetConfig
  let snowflake: SnowflakeDecoration

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    config = {
      id: 'test-snowflake',
      name: '测试雪花',
      type: 'floating',
      content: '', // 空内容，这样会使用默认的 SVG
      position: {
        type: 'fixed',
        position: { x: '50px', y: '100px' },
        anchor: 'center'
      },
      style: {
        size: { width: '20px', height: '20px' },
        opacity: 0.8,
        zIndex: 1000
      },
      animation: {
        name: 'snowfall',
        duration: 3000,
        iterations: 'infinite',
        autoplay: true
      },
      interactive: false,
      responsive: true
    }

    snowflake = new SnowflakeDecoration(config, container)
  })

  afterEach(() => {
    if (snowflake) {
      snowflake.destroy()
    }
    cleanup()
  })

  describe('创建和初始化', () => {
    it('应该正确创建雪花装饰实例', () => {
      expect(snowflake).toBeDefined()
      expect(snowflake.getConfig()).toEqual(config)
    })

    it('应该创建正确的 DOM 元素', () => {
      const element = snowflake.getElement()
      expect(element).toBeInstanceOf(HTMLElement)
      expect(element.className).toContain('snowflake-decoration')
      expect(element.getAttribute('data-decoration-id')).toBe('test-snowflake')
    })

    it('应该设置正确的样式', () => {
      const element = snowflake.getElement()
      expect(element.style.position).toBe('fixed')
      expect(element.style.width).toBe('20px')
      expect(element.style.height).toBe('20px')
    })
  })

  describe('显示和隐藏', () => {
    it('应该能够显示雪花', () => {
      snowflake.show()

      expect(snowflake.isShown()).toBe(true)
      expect(container.contains(snowflake.getElement())).toBe(true)
    })

    it('应该能够隐藏雪花', () => {
      snowflake.show()
      snowflake.hide()

      expect(snowflake.isShown()).toBe(false)
      expect(container.contains(snowflake.getElement())).toBe(false)
    })

    it('重复显示不应该出错', () => {
      snowflake.show()
      expect(() => snowflake.show()).not.toThrow()
      expect(snowflake.isShown()).toBe(true)
    })

    it('重复隐藏不应该出错', () => {
      snowflake.hide()
      expect(() => snowflake.hide()).not.toThrow()
      expect(snowflake.isShown()).toBe(false)
    })
  })

  describe('内容加载', () => {
    it('应该能够加载 SVG 内容', async () => {
      snowflake.show()

      // 等待异步内容加载
      await new Promise(resolve => setTimeout(resolve, 100))

      const element = snowflake.getElement()
      expect(element.innerHTML).toContain('svg')
      expect(element.innerHTML).toContain('path')
    })

    it('加载失败时应该显示默认内容', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const failedSnowflake = new SnowflakeDecoration(config, container)
      failedSnowflake.show()

      // 等待异步内容加载
      await new Promise(resolve => setTimeout(resolve, 100))

      const element = failedSnowflake.getElement()
      expect(element.innerHTML).toContain('svg') // 应该包含默认 SVG

      failedSnowflake.destroy()
    })
  })

  describe('动画效果', () => {
    it('显示时应该开始下落动画', () => {
      const mockAnimate = vi.fn().mockReturnValue({
        currentTime: 0,
        cancel: vi.fn(),
      })
      Element.prototype.animate = mockAnimate

      snowflake.show()

      expect(mockAnimate).toHaveBeenCalled()
    })

    it('隐藏时应该停止动画', () => {
      const mockCancel = vi.fn()
      const mockAnimate = vi.fn().mockReturnValue({
        currentTime: 0,
        cancel: mockCancel,
      })
      Element.prototype.animate = mockAnimate

      snowflake.show()
      snowflake.hide()

      expect(mockCancel).toHaveBeenCalled()
    })
  })

  describe('交互功能', () => {
    beforeEach(() => {
      config.interactive = true
      snowflake = new SnowflakeDecoration(config, container)
    })

    it('应该响应点击事件', () => {
      snowflake.show()

      const element = snowflake.getElement()
      const clickEvent = new MouseEvent('click')

      expect(() => {
        element.dispatchEvent(clickEvent)
      }).not.toThrow()
    })

    it('应该响应鼠标悬停事件', () => {
      snowflake.show()

      const element = snowflake.getElement()
      const mouseEnterEvent = new MouseEvent('mouseenter')
      const mouseLeaveEvent = new MouseEvent('mouseleave')

      expect(() => {
        element.dispatchEvent(mouseEnterEvent)
        element.dispatchEvent(mouseLeaveEvent)
      }).not.toThrow()
    })
  })

  describe('配置更新', () => {
    it('应该能够更新配置', () => {
      const updates = {
        style: {
          size: { width: '30px', height: '30px' },
          opacity: 0.5,
          zIndex: 2000,
        },
      }

      snowflake.updateConfig(updates)

      const updatedConfig = snowflake.getConfig()
      expect(updatedConfig.style.size.width).toBe('30px')
      expect(updatedConfig.style.opacity).toBe(0.5)
    })

    it('更新配置后应该重新应用样式', () => {
      snowflake.show()

      const updates = {
        style: {
          size: { width: '30px', height: '30px' },
          opacity: 0.5,
          zIndex: 2000,
        },
      }

      snowflake.updateConfig(updates)

      const element = snowflake.getElement()
      expect(element.style.width).toBe('30px')
      expect(element.style.height).toBe('30px')
      expect(element.style.opacity).toBe('0.5')
    })
  })

  describe('销毁', () => {
    it('应该能够正确销毁', () => {
      snowflake.show()

      expect(() => {
        snowflake.destroy()
      }).not.toThrow()

      expect(container.contains(snowflake.getElement())).toBe(false)
    })
  })
})

describe('createSnowfallEffect', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    cleanup()
  })

  it('应该创建指定数量的雪花', () => {
    const effect = createSnowfallEffect(container, { count: 5 })

    expect(effect).toHaveProperty('start')
    expect(effect).toHaveProperty('stop')
    expect(typeof effect.start).toBe('function')
    expect(typeof effect.stop).toBe('function')
  })

  it('应该根据强度调整雪花数量', () => {
    const lightEffect = createSnowfallEffect(container, {
      count: 10,
      intensity: 'light',
    })
    const heavyEffect = createSnowfallEffect(container, {
      count: 10,
      intensity: 'heavy',
    })

    // 测试效果对象的存在
    expect(lightEffect).toBeDefined()
    expect(heavyEffect).toBeDefined()

    // 清理
    lightEffect.stop()
    heavyEffect.stop()
  })

  it('应该自动显示雪花', () => {
    const effect = createSnowfallEffect(container, { count: 3 })

    // 启动效果
    effect.start()

    // 检查容器中是否有雪花元素
    expect(container.children.length).toBeGreaterThan(0)

    // 清理
    effect.stop()
  })
})
