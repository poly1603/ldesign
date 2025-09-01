/**
 * 热更新管理器测试
 */

import type {
  HotReloadEvent,
  HotReloadManagerOptions,
} from '../src/utils/hot-reload-manager'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createHotReloadManager,
  getHotReloadManager,
  HotReloadManager,
  resetHotReloadManager,
} from '../src/utils/hot-reload-manager'

// 模拟 import.meta.hot
const mockHMR = {
  on: vi.fn(),
  off: vi.fn(),
  send: vi.fn(),
  accept: vi.fn(),
  dispose: vi.fn(),
}

// 模拟 import.meta.env
const mockEnv = {
  DEV: true,
  PROD: false,
  MODE: 'development',
}

describe('hotReloadManager', () => {
  let hotReloadManager: HotReloadManager
  let mockOptions: Partial<HotReloadManagerOptions>

  beforeEach(() => {
    vi.useFakeTimers()

    // 模拟 HMR 环境
    Object.defineProperty(globalThis, 'import', {
      value: {
        meta: {
          hot: mockHMR,
          env: mockEnv,
        },
      },
      configurable: true,
    })

    mockOptions = {
      enabled: true,
      debug: false,
      updateDelay: 100,
      autoRefresh: false,
      preserveState: true,
    }

    hotReloadManager = new HotReloadManager(mockOptions)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    hotReloadManager.destroy()
    delete (globalThis as any).import
    resetHotReloadManager()
  })

  describe('构造函数', () => {
    it('应该使用默认选项创建管理器', () => {
      const defaultManager = new HotReloadManager()
      const options = defaultManager.getOptions()

      expect(options.enabled).toBe(true)
      expect(options.debug).toBe(false)
      expect(options.updateDelay).toBe(100)
      expect(options.autoRefresh).toBe(false)
      expect(options.preserveState).toBe(true)
    })

    it('应该合并自定义选项', () => {
      const customOptions = {
        enabled: false,
        debug: true,
        updateDelay: 200,
        autoRefresh: true,
      }

      const customManager = new HotReloadManager(customOptions)
      const options = customManager.getOptions()

      expect(options.enabled).toBe(false)
      expect(options.debug).toBe(true)
      expect(options.updateDelay).toBe(200)
      expect(options.autoRefresh).toBe(true)
    })

    it('应该在HMR环境中自动启用', () => {
      expect(hotReloadManager.isActive()).toBe(true)
      expect(mockHMR.on).toHaveBeenCalled()
    })

    it('应该在非HMR环境中禁用', () => {
      delete (globalThis as any).import

      const nonHMRManager = new HotReloadManager({ enabled: true })
      expect(nonHMRManager.isActive()).toBe(false)
    })
  })

  describe('事件监听', () => {
    it('应该能够添加监听器', () => {
      const listener = vi.fn()
      const unsubscribe = hotReloadManager.addListener(listener)

      expect(typeof unsubscribe).toBe('function')

      // 触发事件
      const event: HotReloadEvent = {
        type: 'template-updated',
        template: {
          category: 'login',
          device: 'desktop',
          name: 'default',
        },
        filePath: '/path/to/template.vue',
        timestamp: Date.now(),
      }

      hotReloadManager.triggerUpdate(event)
      vi.advanceTimersByTime(100)

      expect(listener).toHaveBeenCalledWith(event)

      // 移除监听器
      unsubscribe()
    })

    it('应该能够移除监听器', () => {
      const listener = vi.fn()
      hotReloadManager.addListener(listener)

      hotReloadManager.removeListener(listener)

      const event: HotReloadEvent = {
        type: 'template-updated',
        template: {
          category: 'login',
          device: 'desktop',
          name: 'default',
        },
        filePath: '/path/to/template.vue',
        timestamp: Date.now(),
      }

      hotReloadManager.triggerUpdate(event)
      vi.advanceTimersByTime(100)

      expect(listener).not.toHaveBeenCalled()
    })

    it('应该处理监听器执行错误', () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      const normalListener = vi.fn()

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      hotReloadManager.addListener(errorListener)
      hotReloadManager.addListener(normalListener)

      const event: HotReloadEvent = {
        type: 'template-updated',
        template: {
          category: 'login',
          device: 'desktop',
          name: 'default',
        },
        filePath: '/path/to/template.vue',
        timestamp: Date.now(),
      }

      hotReloadManager.triggerUpdate(event)
      vi.advanceTimersByTime(100)

      expect(consoleSpy).toHaveBeenCalledWith('热更新监听器执行错误:', expect.any(Error))
      expect(normalListener).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('事件处理', () => {
    it('应该处理模板文件变化事件', () => {
      const listener = vi.fn()
      hotReloadManager.addListener(listener)

      // 模拟 HMR 事件
      const hmrData = {
        category: 'login',
        device: 'desktop',
        templateName: 'default',
        filePath: '/path/to/template.vue',
        changeType: 'changed',
      }

      // 获取注册的 HMR 监听器
      const templateFileHandler = mockHMR.on.mock.calls.find(
        call => call[0] === 'template-file-changed',
      )?.[1]

      expect(templateFileHandler).toBeDefined()

      // 触发 HMR 事件
      templateFileHandler(hmrData)
      vi.advanceTimersByTime(100)

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'template-updated',
          template: {
            category: 'login',
            device: 'desktop',
            name: 'default',
          },
          filePath: '/path/to/template.vue',
        }),
      )
    })

    it('应该处理配置变化事件', () => {
      const listener = vi.fn()
      hotReloadManager.addListener(listener)

      const hmrData = {
        category: 'login',
        device: 'desktop',
        templateName: 'default',
        filePath: '/path/to/config.ts',
      }

      const configHandler = mockHMR.on.mock.calls.find(
        call => call[0] === 'template-config-changed',
      )?.[1]

      expect(configHandler).toBeDefined()

      configHandler(hmrData)
      vi.advanceTimersByTime(100)

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'config-updated',
          template: {
            category: 'login',
            device: 'desktop',
            name: 'default',
          },
        }),
      )
    })

    it('应该处理样式变化事件', () => {
      const listener = vi.fn()
      hotReloadManager.addListener(listener)

      const hmrData = {
        category: 'login',
        device: 'desktop',
        templateName: 'default',
        filePath: '/path/to/style.css',
      }

      const styleHandler = mockHMR.on.mock.calls.find(
        call => call[0] === 'template-style-changed',
      )?.[1]

      expect(styleHandler).toBeDefined()

      styleHandler(hmrData)
      vi.advanceTimersByTime(100)

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'style-updated',
        }),
      )
    })

    it('应该处理组件变化事件', () => {
      const listener = vi.fn()
      hotReloadManager.addListener(listener)

      const hmrData = {
        category: 'login',
        device: 'desktop',
        templateName: 'default',
        filePath: '/path/to/component.vue',
      }

      const componentHandler = mockHMR.on.mock.calls.find(
        call => call[0] === 'template-component-changed',
      )?.[1]

      expect(componentHandler).toBeDefined()

      componentHandler(hmrData)
      vi.advanceTimersByTime(100)

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'component-updated',
        }),
      )
    })
  })

  describe('事件队列和防抖', () => {
    it('应该对事件进行防抖处理', () => {
      const listener = vi.fn()
      hotReloadManager.addListener(listener)

      const event1: HotReloadEvent = {
        type: 'template-updated',
        template: { category: 'login', device: 'desktop', name: 'default' },
        filePath: '/path/to/template.vue',
        timestamp: Date.now(),
      }

      const event2: HotReloadEvent = {
        type: 'template-updated',
        template: { category: 'login', device: 'desktop', name: 'default' },
        filePath: '/path/to/template.vue',
        timestamp: Date.now() + 50,
      }

      // 快速触发两个事件
      hotReloadManager.triggerUpdate(event1)
      hotReloadManager.triggerUpdate(event2)

      // 在防抖时间内，监听器不应该被调用
      vi.advanceTimersByTime(50)
      expect(listener).not.toHaveBeenCalled()

      // 防抖时间过后，应该只调用一次（最新的事件）
      vi.advanceTimersByTime(50)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(event2)
    })

    it('应该处理多个不同模板的事件', () => {
      const listener = vi.fn()
      hotReloadManager.addListener(listener)

      const event1: HotReloadEvent = {
        type: 'template-updated',
        template: { category: 'login', device: 'desktop', name: 'default' },
        filePath: '/path/to/login.vue',
        timestamp: Date.now(),
      }

      const event2: HotReloadEvent = {
        type: 'template-updated',
        template: { category: 'dashboard', device: 'desktop', name: 'default' },
        filePath: '/path/to/dashboard.vue',
        timestamp: Date.now(),
      }

      hotReloadManager.triggerUpdate(event1)
      hotReloadManager.triggerUpdate(event2)

      vi.advanceTimersByTime(100)

      // 应该为两个不同的模板各调用一次
      expect(listener).toHaveBeenCalledTimes(2)
    })
  })

  describe('启用和禁用', () => {
    it('应该能够启用热更新', () => {
      hotReloadManager.disable()
      expect(hotReloadManager.isActive()).toBe(false)

      hotReloadManager.enable()
      expect(hotReloadManager.isActive()).toBe(true)
    })

    it('应该能够禁用热更新', () => {
      expect(hotReloadManager.isActive()).toBe(true)

      hotReloadManager.disable()
      expect(hotReloadManager.isActive()).toBe(false)

      // 禁用后事件不应该被处理
      const listener = vi.fn()
      hotReloadManager.addListener(listener)

      const event: HotReloadEvent = {
        type: 'template-updated',
        template: { category: 'login', device: 'desktop', name: 'default' },
        filePath: '/path/to/template.vue',
        timestamp: Date.now(),
      }

      hotReloadManager.triggerUpdate(event)
      vi.advanceTimersByTime(100)

      expect(listener).not.toHaveBeenCalled()
    })

    it('应该在非HMR环境中无法启用', () => {
      delete (globalThis as any).import

      const nonHMRManager = new HotReloadManager()
      nonHMRManager.enable()

      expect(nonHMRManager.isActive()).toBe(false)
    })
  })

  describe('选项更新', () => {
    it('应该能够更新选项', () => {
      const newOptions = {
        debug: true,
        updateDelay: 200,
        autoRefresh: true,
      }

      hotReloadManager.updateOptions(newOptions)
      const options = hotReloadManager.getOptions()

      expect(options.debug).toBe(true)
      expect(options.updateDelay).toBe(200)
      expect(options.autoRefresh).toBe(true)
    })

    it('应该在更新enabled选项时启用/禁用', () => {
      hotReloadManager.updateOptions({ enabled: false })
      expect(hotReloadManager.isActive()).toBe(false)

      hotReloadManager.updateOptions({ enabled: true })
      expect(hotReloadManager.isActive()).toBe(true)
    })
  })

  describe('调试模式', () => {
    it('应该在调试模式下输出日志', () => {
      const debugManager = new HotReloadManager({ debug: true })
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const listener = vi.fn()
      debugManager.addListener(listener)

      const event: HotReloadEvent = {
        type: 'template-updated',
        template: { category: 'login', device: 'desktop', name: 'default' },
        filePath: '/path/to/template.vue',
        timestamp: Date.now(),
      }

      debugManager.triggerUpdate(event)
      vi.advanceTimersByTime(100)

      expect(consoleSpy).toHaveBeenCalledWith('🔥 处理了 1 个热更新事件')

      consoleSpy.mockRestore()
      debugManager.destroy()
    })
  })
})

describe('全局热更新管理器', () => {
  afterEach(() => {
    resetHotReloadManager()
  })

  it('应该返回单例实例', () => {
    const manager1 = getHotReloadManager()
    const manager2 = getHotReloadManager()

    expect(manager1).toBe(manager2)
  })

  it('应该能够重置全局实例', () => {
    const manager1 = getHotReloadManager()
    resetHotReloadManager()
    const manager2 = getHotReloadManager()

    expect(manager1).not.toBe(manager2)
  })

  it('应该使用工厂函数创建实例', () => {
    const manager = createHotReloadManager({ debug: true })

    expect(manager).toBeDefined()
    expect(manager.getOptions().debug).toBe(true)
  })
})
