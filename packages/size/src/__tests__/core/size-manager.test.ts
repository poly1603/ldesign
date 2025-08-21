/**
 * 尺寸管理器测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createSizeManager,
  getGlobalSizeMode,
  onGlobalSizeChange,
  setGlobalSizeMode,
  SizeManagerImpl,
} from '../../core/size-manager'

// Mock DOM
const mockDocument = {
  createElement: vi.fn(),
  getElementById: vi.fn(),
  head: {
    appendChild: vi.fn(),
  },
}

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
})

describe('sizeManagerImpl', () => {
  let manager: SizeManagerImpl
  let mockStyleElement: any

  beforeEach(() => {
    mockStyleElement = {
      id: '',
      textContent: '',
      remove: vi.fn(),
    }

    mockDocument.createElement.mockReturnValue(mockStyleElement)
    mockDocument.getElementById.mockReturnValue(null)
    mockDocument.head.appendChild.mockClear()

    manager = new SizeManagerImpl({
      autoInject: false, // 禁用自动注入以便测试
    })
  })

  afterEach(() => {
    manager.destroy()
    vi.clearAllMocks()
  })

  describe('构造函数', () => {
    it('应该使用默认选项', () => {
      const defaultManager = new SizeManagerImpl()
      const options = defaultManager.getOptions()

      expect(options.prefix).toBe('--ls')
      expect(options.defaultMode).toBe('medium')
      expect(options.styleId).toBe('ldesign-size-variables')
      expect(options.selector).toBe(':root')
      expect(options.autoInject).toBe(true)

      defaultManager.destroy()
    })

    it('应该使用自定义选项', () => {
      const customManager = new SizeManagerImpl({
        prefix: '--custom',
        defaultMode: 'large',
        styleId: 'custom-id',
        selector: '.custom',
        autoInject: false,
      })

      const options = customManager.getOptions()
      expect(options.prefix).toBe('--custom')
      expect(options.defaultMode).toBe('large')
      expect(options.styleId).toBe('custom-id')
      expect(options.selector).toBe('.custom')
      expect(options.autoInject).toBe(false)

      customManager.destroy()
    })

    it('应该设置初始模式', () => {
      const customManager = new SizeManagerImpl({
        defaultMode: 'large',
        autoInject: false,
      })

      expect(customManager.getCurrentMode()).toBe('large')
      customManager.destroy()
    })
  })

  describe('getCurrentMode', () => {
    it('应该返回当前尺寸模式', () => {
      expect(manager.getCurrentMode()).toBe('medium')
    })
  })

  describe('setMode', () => {
    it('应该设置新的尺寸模式', () => {
      manager.setMode('large')
      expect(manager.getCurrentMode()).toBe('large')
    })

    it('应该触发变化事件', () => {
      const callback = vi.fn()
      manager.onSizeChange(callback)

      manager.setMode('small')

      expect(callback).toHaveBeenCalledWith({
        previousMode: 'medium',
        currentMode: 'small',
        timestamp: expect.any(Number),
      })
    })

    it('相同模式不应该触发变化事件', () => {
      const callback = vi.fn()
      manager.onSizeChange(callback)

      manager.setMode('medium') // 当前已经是medium

      expect(callback).not.toHaveBeenCalled()
    })

    it('应该在autoInject为true时重新注入CSS', () => {
      const autoInjectManager = new SizeManagerImpl({
        autoInject: true,
      })

      autoInjectManager.setMode('large')

      expect(mockDocument.createElement).toHaveBeenCalled()
      autoInjectManager.destroy()
    })
  })

  describe('getConfig', () => {
    it('应该返回当前模式的配置', () => {
      const config = manager.getConfig()
      expect(config).toHaveProperty('fontSize')
      expect(config).toHaveProperty('spacing')
      expect(config).toHaveProperty('component')
      expect(config).toHaveProperty('borderRadius')
      expect(config).toHaveProperty('shadow')
    })

    it('应该返回指定模式的配置', () => {
      const smallConfig = manager.getConfig('small')
      const largeConfig = manager.getConfig('large')

      expect(smallConfig).not.toBe(largeConfig)
      expect(Number.parseFloat(smallConfig.fontSize.base)).toBeLessThan(
        Number.parseFloat(largeConfig.fontSize.base),
      )
    })
  })

  describe('generateCSSVariables', () => {
    it('应该生成当前模式的CSS变量', () => {
      const variables = manager.generateCSSVariables()

      expect(variables).toHaveProperty('--ls-font-size-base')
      expect(variables).toHaveProperty('--ls-spacing-base')
      expect(variables).toHaveProperty('--ls-button-height-medium')
    })

    it('应该生成指定模式的CSS变量', () => {
      const smallVariables = manager.generateCSSVariables('small')
      const largeVariables = manager.generateCSSVariables('large')

      expect(smallVariables['--ls-font-size-base']).not.toBe(
        largeVariables['--ls-font-size-base'],
      )
    })
  })

  describe('injectCSS', () => {
    it('应该注入CSS变量', () => {
      manager.injectCSS()

      expect(mockDocument.createElement).toHaveBeenCalledWith('style')
      expect(mockStyleElement.textContent).toContain('--ls-font-size-base')
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(
        mockStyleElement,
      )
    })

    it('应该注入指定模式的CSS变量', () => {
      manager.injectCSS('small')

      expect(mockStyleElement.textContent).toContain('--ls-font-size-base')
    })
  })

  describe('removeCSS', () => {
    it('应该移除CSS变量', () => {
      const existingElement = { remove: vi.fn() }
      mockDocument.getElementById.mockReturnValue(existingElement)

      manager.removeCSS()

      expect(existingElement.remove).toHaveBeenCalled()
    })
  })

  describe('onSizeChange', () => {
    it('应该添加监听器', () => {
      const callback = vi.fn()
      const unsubscribe = manager.onSizeChange(callback)

      manager.setMode('large')

      expect(callback).toHaveBeenCalled()
      expect(typeof unsubscribe).toBe('function')
    })

    it('应该移除监听器', () => {
      const callback = vi.fn()
      const unsubscribe = manager.onSizeChange(callback)

      unsubscribe()
      manager.setMode('large')

      expect(callback).not.toHaveBeenCalled()
    })

    it('应该处理监听器中的错误', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error')
      })
      const normalCallback = vi.fn()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      manager.onSizeChange(errorCallback)
      manager.onSizeChange(normalCallback)

      manager.setMode('large')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in size change callback:',
        expect.any(Error),
      )
      expect(normalCallback).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('updateOptions', () => {
    it('应该更新选项', () => {
      manager.updateOptions({
        prefix: '--new-prefix',
        styleId: 'new-id',
      })

      const options = manager.getOptions()
      expect(options.prefix).toBe('--new-prefix')
      expect(options.styleId).toBe('new-id')
    })

    it('应该更新CSS生成器前缀', () => {
      manager.updateOptions({ prefix: '--new' })

      const variables = manager.generateCSSVariables()
      expect(variables).toHaveProperty('--new-font-size-base')
      expect(variables).not.toHaveProperty('--ls-font-size-base')
    })

    it('应该在autoInject为true时重新注入CSS', () => {
      manager.updateOptions({ autoInject: true })

      expect(mockDocument.createElement).toHaveBeenCalled()
    })
  })

  describe('isInjected', () => {
    it('应该检查CSS是否已注入', () => {
      mockDocument.getElementById.mockReturnValue(null)
      expect(manager.isInjected()).toBe(false)

      mockDocument.getElementById.mockReturnValue(mockStyleElement)
      expect(manager.isInjected()).toBe(true)
    })
  })

  describe('destroy', () => {
    it('应该清理资源', () => {
      const callback = vi.fn()
      manager.onSizeChange(callback)

      const existingElement = { remove: vi.fn() }
      mockDocument.getElementById.mockReturnValue(existingElement)

      manager.destroy()

      // 检查CSS是否被移除
      expect(existingElement.remove).toHaveBeenCalled()

      // 检查监听器是否被清理
      manager.setMode('large')
      expect(callback).not.toHaveBeenCalled()
    })
  })
})

describe('工厂函数和便捷函数', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSizeManager', () => {
    it('应该创建新的管理器实例', () => {
      const manager = createSizeManager({
        defaultMode: 'large',
        autoInject: false,
      })

      expect(manager.getCurrentMode()).toBe('large')
      manager.destroy()
    })
  })

  describe('全局管理器函数', () => {
    it('setGlobalSizeMode应该设置全局尺寸模式', () => {
      setGlobalSizeMode('large')
      expect(getGlobalSizeMode()).toBe('large')
    })

    it('getGlobalSizeMode应该获取全局尺寸模式', () => {
      const mode = getGlobalSizeMode()
      expect(['small', 'medium', 'large', 'extra-large']).toContain(mode)
    })

    it('onGlobalSizeChange应该监听全局尺寸变化', () => {
      const callback = vi.fn()
      const unsubscribe = onGlobalSizeChange(callback)

      setGlobalSizeMode('small')

      expect(callback).toHaveBeenCalledWith({
        previousMode: expect.any(String),
        currentMode: 'small',
        timestamp: expect.any(Number),
      })

      unsubscribe()
    })
  })
})
