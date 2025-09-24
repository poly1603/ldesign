/**
 * Device Engine 插件测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DeviceDetector } from '../../src/core/DeviceDetector'
import { createDeviceEnginePlugin, type DeviceEnginePluginOptions } from '../../src/engine/plugin'

// Mock Vue app
const mockVueApp = {
  use: vi.fn(),
  config: {
    globalProperties: {} as Record<string, any>,
  },
}

// Mock Engine context
const mockEngine = {
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  state: {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
  events: {
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
  },
  getApp: vi.fn(() => mockVueApp),
}

const mockContext = {
  engine: mockEngine,
  logger: mockEngine.logger,
  config: {},
  events: mockEngine.events,
}

describe('device Engine Plugin', () => {
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    // 清空全局属性
    mockVueApp.config.globalProperties = {}
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createDeviceEnginePlugin', () => {
    it('应该创建一个有效的插件实例', () => {
      const plugin = createDeviceEnginePlugin()

      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('device')
      expect(plugin.version).toBe('1.0.0')
      expect(plugin.dependencies).toEqual([])
      expect(typeof plugin.install).toBe('function')
      expect(typeof plugin.uninstall).toBe('function')
    })

    it('应该接受自定义配置选项', () => {
      const options: DeviceEnginePluginOptions = {
        name: 'custom-device',
        version: '2.0.0',
        description: 'Custom Device Plugin',
        dependencies: ['engine'],
        enablePerformanceMonitoring: true,
        debug: true,
        globalPropertyName: '$customDevice',
      }

      const plugin = createDeviceEnginePlugin(options)

      expect(plugin.name).toBe('custom-device')
      expect(plugin.version).toBe('2.0.0')
      expect(plugin.dependencies).toEqual(['engine'])
    })

    it('应该使用默认配置', () => {
      const plugin = createDeviceEnginePlugin()

      expect(plugin.name).toBe('device')
      expect(plugin.version).toBe('1.0.0')
      expect(plugin.dependencies).toEqual([])
    })
  })

  describe('插件安装', () => {
    it('应该成功安装插件到 Engine', async () => {
      const plugin = createDeviceEnginePlugin()

      await plugin.install!(mockContext)

      // 验证日志记录
      expect(mockEngine.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('performInstall called'),
      )
      expect(mockEngine.logger.info).toHaveBeenCalledWith(
        'Installing device plugin...',
        expect.any(Object),
      )

      // 验证状态管理注册
      expect(mockEngine.state.set).toHaveBeenCalledWith('device', expect.any(DeviceDetector))

      // 验证 Vue 插件安装
      expect(mockVueApp.use).toHaveBeenCalled()

      // 验证全局属性添加
      expect(mockVueApp.config.globalProperties.$device).toBeInstanceOf(DeviceDetector)

      // 验证事件监听器注册
      expect(mockEngine.events.on).toHaveBeenCalledWith('app:beforeUnmount', expect.any(Function))
    })

    it('应该在 Vue 应用不存在时等待 app:created 事件', async () => {
      const plugin = createDeviceEnginePlugin()
      const contextWithoutApp = {
        ...mockContext,
        engine: {
          ...mockEngine,
          getApp: vi.fn(() => null),
        },
      }

      // 调用安装方法不应该抛出错误，而是等待事件
      await expect(plugin.install!(contextWithoutApp)).resolves.not.toThrow()

      // 验证监听了 app:created 事件
      expect(mockEngine.events.once).toHaveBeenCalledWith('app:created', expect.any(Function))
    })

    it('应该支持延迟安装（等待 app:created 事件）', async () => {
      const plugin = createDeviceEnginePlugin()
      const contextWithoutApp = {
        ...mockContext,
        engine: {
          ...mockEngine,
          getApp: vi.fn(() => null),
        },
      }

      // 调用安装方法
      await plugin.install!(contextWithoutApp)

      // 验证监听了 app:created 事件
      expect(mockEngine.events.once).toHaveBeenCalledWith('app:created', expect.any(Function))
    })

    it('应该支持自定义全局属性名', async () => {
      const plugin = createDeviceEnginePlugin({
        globalPropertyName: '$myDevice',
      })

      await plugin.install!(mockContext)

      expect(mockVueApp.config.globalProperties.$myDevice).toBeInstanceOf(DeviceDetector)
      expect(mockVueApp.config.globalProperties.$device).toBeUndefined()
    })

    it('应该支持禁用自动安装', async () => {
      const plugin = createDeviceEnginePlugin({
        autoInstall: false,
      })

      await plugin.install!(mockContext)

      // 验证没有调用 Vue 插件安装
      expect(mockVueApp.use).not.toHaveBeenCalled()
      // 但仍然应该设置全局属性
      expect(mockVueApp.config.globalProperties.$device).toBeInstanceOf(DeviceDetector)
    })

    it('应该支持性能监控', async () => {
      const plugin = createDeviceEnginePlugin({
        enablePerformanceMonitoring: true,
      })

      await plugin.install!(mockContext)

      expect(mockEngine.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Performance monitoring enabled'),
      )
    })

    it('应该处理安装错误', async () => {
      const plugin = createDeviceEnginePlugin()
      const contextWithError = {
        ...mockContext,
        engine: {
          ...mockEngine,
          getApp: vi.fn(() => {
            throw new Error('Test error')
          }),
        },
      }

      await expect(plugin.install!(contextWithError)).rejects.toThrow(
        'Failed to install device plugin: Test error',
      )

      expect(mockEngine.logger.error).toHaveBeenCalled()
    })
  })

  describe('插件卸载', () => {
    it('应该成功卸载插件', async () => {
      const plugin = createDeviceEnginePlugin()

      // 先安装插件
      await plugin.install!(mockContext)

      // 模拟状态中的设备实例
      const mockDeviceInstance = {
        destroy: vi.fn(),
      }
      mockEngine.state.get.mockReturnValue(mockDeviceInstance)

      // 卸载插件
      await plugin.uninstall!(mockContext)

      // 验证设备实例被销毁
      expect(mockDeviceInstance.destroy).toHaveBeenCalled()

      // 验证从状态管理中移除
      expect(mockEngine.state.delete).toHaveBeenCalledWith('device')

      // 验证全局属性被移除
      expect(mockVueApp.config.globalProperties.$device).toBeUndefined()

      // 验证日志记录
      expect(mockEngine.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('device plugin uninstalled successfully'),
      )
    })

    it('应该处理卸载错误', async () => {
      const plugin = createDeviceEnginePlugin()
      const contextWithError = {
        ...mockContext,
        engine: {
          ...mockEngine,
          state: {
            ...mockEngine.state,
            delete: vi.fn(() => {
              throw new Error('Test uninstall error')
            }),
          },
        },
      }

      await expect(plugin.uninstall!(contextWithError)).rejects.toThrow(
        'Failed to uninstall device plugin: Test uninstall error',
      )

      expect(mockEngine.logger.error).toHaveBeenCalled()
    })

    it('应该处理没有设备实例的情况', async () => {
      const plugin = createDeviceEnginePlugin()

      // 模拟状态中没有设备实例
      mockEngine.state.get.mockReturnValue(null)

      // 卸载插件不应该抛出错误
      await expect(plugin.uninstall!(mockContext)).resolves.not.toThrow()

      expect(mockEngine.state.delete).toHaveBeenCalledWith('device')
    })
  })

  describe('调试模式', () => {
    it('应该在调试模式下输出日志', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

      const plugin = createDeviceEnginePlugin({
        debug: true,
      })

      await plugin.install!(mockContext)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Device Plugin] createDeviceEnginePlugin called with options:'),
        expect.any(Object),
      )

      consoleSpy.mockRestore()
    })
  })
})
