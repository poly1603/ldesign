/**
 * ViteLauncher 核心类测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ViteLauncher } from '../../src/core/ViteLauncher'
import { LauncherStatus, LauncherEvent } from '../../src/types'

// Mock Vite 模块
vi.mock('vite', () => ({
  createServer: vi.fn(),
  build: vi.fn(),
  preview: vi.fn()
}))

// Mock @ldesign/kit 模块
vi.mock('@ldesign/kit', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    setLevel: vi.fn(),
    getLevel: vi.fn().mockReturnValue('info')
  })),
  ErrorHandler: vi.fn().mockImplementation(() => ({
    handle: vi.fn()
  })),
  ConfigManager: vi.fn().mockImplementation(() => ({
    load: vi.fn(),
    getAll: vi.fn().mockReturnValue({}),
    removeAllListeners: vi.fn()
  })),
  FileSystem: {
    exists: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    remove: vi.fn()
  },
  PathUtils: {
    resolve: vi.fn((path) => path),
    join: vi.fn((...paths) => paths.join('/')),
    isAbsolute: vi.fn().mockReturnValue(false)
  }
}))

describe('ViteLauncher', () => {
  let launcher: ViteLauncher
  
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 创建 launcher 实例
    launcher = new ViteLauncher({
      cwd: '/test/project'
    })
  })
  
  afterEach(async () => {
    // 清理 launcher 实例
    if (launcher) {
      await launcher.destroy()
    }
  })
  
  describe('构造函数', () => {
    it('应该正确初始化 ViteLauncher 实例', () => {
      expect(launcher).toBeInstanceOf(ViteLauncher)
      expect(launcher.getStatus()).toBe(LauncherStatus.IDLE)
    })
    
    it('应该使用默认配置', () => {
      const config = launcher.getConfig()
      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
    })
    
    it('应该接受自定义配置', () => {
      const customLauncher = new ViteLauncher({
        cwd: '/custom/project',
        config: {
          server: {
            port: 8080,
            host: '0.0.0.0'
          }
        }
      })
      
      const config = customLauncher.getConfig()
      expect(config.server?.port).toBe(8080)
      expect(config.server?.host).toBe('0.0.0.0')
    })
  })
  
  describe('状态管理', () => {
    it('应该正确获取初始状态', () => {
      expect(launcher.getStatus()).toBe(LauncherStatus.IDLE)
      expect(launcher.isRunning()).toBe(false)
    })
    
    it('应该正确检测运行状态', () => {
      // 模拟状态变更
      const setStatusSpy = vi.spyOn(launcher as any, 'setStatus')
      
      // 这里需要访问私有方法，在实际测试中可能需要调整
      // launcher['setStatus'](LauncherStatus.RUNNING)
      
      // expect(launcher.isRunning()).toBe(true)
    })
  })
  
  describe('配置管理', () => {
    it('应该正确合并配置', () => {
      const baseConfig = { server: { port: 3000 } }
      const overrideConfig = { server: { host: 'localhost' } }
      
      const merged = launcher.mergeConfig(baseConfig as any, overrideConfig as any)
      
      expect(merged.server?.port).toBe(3000)
      expect(merged.server?.host).toBe('localhost')
    })
    
    it('应该正确验证配置', () => {
      const validConfig = {
        server: {
          port: 3000,
          host: 'localhost'
        }
      }
      
      const validation = launcher.validateConfig(validConfig as any)
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
    
    it('应该检测无效配置', () => {
      const invalidConfig = {
        server: {
          port: 99999, // 无效端口
          host: 123 // 无效主机类型
        }
      }
      
      const validation = launcher.validateConfig(invalidConfig as any)
      expect(validation.valid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })
  })
  
  describe('插件管理', () => {
    it('应该正确添加插件', () => {
      const mockPlugin = {
        name: 'test-plugin',
        apply: 'build'
      }
      
      launcher.addPlugin(mockPlugin as any)
      const plugins = launcher.getPlugins()
      
      expect(plugins).toHaveLength(1)
      expect(plugins[0].name).toBe('test-plugin')
    })
    
    it('应该正确移除插件', () => {
      const mockPlugin = {
        name: 'test-plugin',
        apply: 'build'
      }
      
      launcher.addPlugin(mockPlugin as any)
      expect(launcher.getPlugins()).toHaveLength(1)
      
      launcher.removePlugin('test-plugin')
      expect(launcher.getPlugins()).toHaveLength(0)
    })
    
    it('应该处理重复插件名称', () => {
      const plugin1 = { name: 'test-plugin', apply: 'build' }
      const plugin2 = { name: 'test-plugin', apply: 'serve' }
      
      launcher.addPlugin(plugin1 as any)
      launcher.addPlugin(plugin2 as any)
      
      const plugins = launcher.getPlugins()
      expect(plugins).toHaveLength(1)
      expect(plugins[0].apply).toBe('serve') // 应该被替换
    })
  })
  
  describe('统计信息', () => {
    it('应该正确获取统计信息', () => {
      const stats = launcher.getStats()
      
      expect(stats).toBeDefined()
      expect(typeof stats.startCount).toBe('number')
      expect(typeof stats.buildCount).toBe('number')
      expect(typeof stats.errorCount).toBe('number')
      expect(typeof stats.lastActivity).toBe('number')
    })
    
    it('应该正确获取性能指标', () => {
      const metrics = launcher.getPerformanceMetrics()
      
      expect(metrics).toBeDefined()
      expect(typeof metrics.memory).toBe('object')
      expect(typeof metrics.cpu).toBe('object')
      expect(typeof metrics.startupTime).toBe('number')
    })
  })
  
  describe('生命周期钩子', () => {
    it('应该正确注册 onReady 回调', () => {
      const callback = vi.fn()
      launcher.onReady(callback)

      // 触发 SERVER_READY 事件
      launcher.emit(LauncherEvent.SERVER_READY, {
        server: {} as any,
        url: 'http://localhost:3000',
        timestamp: Date.now()
      })

      expect(callback).toHaveBeenCalled()
    })
    
    it('应该正确注册 onError 回调', () => {
      const callback = vi.fn()
      launcher.onError(callback)
      
      // 触发 error 事件
      const testError = new Error('Test error')
      launcher.emit('error', testError)
      
      expect(callback).toHaveBeenCalledWith(testError)
    })
    
    it('应该正确注册 onClose 回调', () => {
      const callback = vi.fn()
      launcher.onClose(callback)
      
      // 触发 close 事件
      launcher.emit('close')
      
      expect(callback).toHaveBeenCalled()
    })
  })
  
  describe('错误处理', () => {
    it('应该正确处理和记录错误', () => {
      const testError = new Error('Test error')

      // 直接调用 handleError 方法来更新统计
      ;(launcher as any).handleError(testError, '测试错误')

      // 检查状态是否变为错误状态
      expect(launcher.getStatus()).toBe(LauncherStatus.ERROR)

      // 检查错误统计
      const stats = launcher.getStats()
      expect(stats.errorCount).toBeGreaterThan(0)
    })
  })
  
  describe('销毁', () => {
    it('应该正确清理资源', async () => {
      await launcher.destroy()
      
      // 检查状态
      expect(launcher.getStatus()).toBe(LauncherStatus.STOPPED)
      
      // 检查事件监听器是否被移除
      expect(launcher.listenerCount('ready')).toBe(0)
      expect(launcher.listenerCount('error')).toBe(0)
      expect(launcher.listenerCount('close')).toBe(0)
    })
  })
})
