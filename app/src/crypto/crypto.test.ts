/**
 * Crypto 插件集成测试
 * 
 * 测试 @ldesign/crypto 包在 @ldesign/engine 中的集成效果
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import { cryptoPlugin } from './index'

describe('Crypto Plugin Integration', () => {
  let app: any
  let engine: any

  beforeEach(() => {
    // 创建测试应用和引擎实例
    app = createApp({})
    engine = createEngine({
      config: {
        debug: false,
        appName: 'Test App',
        version: '1.0.0'
      }
    })
    
    // 模拟引擎方法
    engine.getApp = vi.fn(() => app)
    engine.logger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    }
    engine.state = {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn()
    }
    engine.events = {
      emit: vi.fn(),
      once: vi.fn()
    }
    engine.performance = {
      mark: vi.fn()
    }
  })

  describe('Plugin Configuration', () => {
    it('should have correct plugin metadata', () => {
      expect(cryptoPlugin.name).toBe('crypto')
      expect(cryptoPlugin.version).toBe('1.0.0')
      expect(cryptoPlugin.dependencies).toEqual([])
    })

    it('should have install and uninstall methods', () => {
      expect(typeof cryptoPlugin.install).toBe('function')
      expect(typeof cryptoPlugin.uninstall).toBe('function')
    })
  })

  describe('Plugin Installation', () => {
    it('should install successfully with Vue app available', async () => {
      const context = { engine }
      
      await cryptoPlugin.install(context)
      
      // 验证状态管理器调用
      expect(engine.state.set).toHaveBeenCalledWith('crypto:instance', expect.any(Object))
      expect(engine.state.set).toHaveBeenCalledWith('crypto:config', expect.any(Object))
      expect(engine.state.set).toHaveBeenCalledWith('crypto:manager', expect.any(Object))
      
      // 验证事件发送
      expect(engine.events.emit).toHaveBeenCalledWith('plugin:installed', {
        name: 'crypto',
        version: '1.0.0',
        type: 'crypto'
      })
      
      // 验证日志记录
      expect(engine.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('crypto plugin installed successfully')
      )
    })

    it('should handle Vue app not available scenario', async () => {
      // 模拟 Vue 应用不可用
      engine.getApp = vi.fn(() => null)
      
      const context = { engine }
      
      await cryptoPlugin.install(context)
      
      // 验证事件监听器注册
      expect(engine.events.once).toHaveBeenCalledWith('app:created', expect.any(Function))
      
      // 验证日志记录
      expect(engine.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Vue app not found, registering event listener')
      )
    })

    it('should handle installation errors gracefully', async () => {
      // 模拟错误情况
      engine.getApp = vi.fn(() => {
        throw new Error('Test error')
      })
      
      const context = { engine }
      
      await expect(cryptoPlugin.install(context)).rejects.toThrow('Test error')
    })
  })

  describe('Plugin Uninstallation', () => {
    it('should uninstall successfully', async () => {
      const context = { engine }
      
      await cryptoPlugin.uninstall(context)
      
      // 验证状态清理
      expect(engine.state.delete).toHaveBeenCalledWith('crypto:instance')
      expect(engine.state.delete).toHaveBeenCalledWith('crypto:config')
      expect(engine.state.delete).toHaveBeenCalledWith('crypto:manager')
      
      // 验证卸载事件
      expect(engine.events.emit).toHaveBeenCalledWith('plugin:uninstalled', {
        name: 'crypto',
        version: '1.0.0',
        type: 'crypto'
      })
      
      // 验证日志记录
      expect(engine.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('crypto plugin uninstalled successfully')
      )
    })

    it('should handle uninstallation errors gracefully', async () => {
      // 模拟错误情况
      engine.state.delete = vi.fn(() => {
        throw new Error('Uninstall error')
      })
      
      const context = { engine }
      
      await expect(cryptoPlugin.uninstall(context)).rejects.toThrow('Uninstall error')
    })
  })

  describe('Configuration Validation', () => {
    it('should use correct default configuration', () => {
      // 通过插件安装验证配置
      const context = { engine }
      
      cryptoPlugin.install(context)
      
      // 验证配置参数
      const configCall = engine.state.set.mock.calls.find(
        (call: any[]) => call[0] === 'crypto:config'
      )
      
      expect(configCall).toBeDefined()
      const config = configCall[1]
      
      expect(config.defaultAESKeySize).toBe(256)
      expect(config.defaultRSAKeySize).toBe(2048)
      expect(config.defaultHashAlgorithm).toBe('SHA256')
      expect(config.defaultEncoding).toBe('base64')
    })

    it('should handle development environment configuration', () => {
      // 模拟开发环境
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      try {
        // 重新导入插件以获取开发环境配置
        const { cryptoPlugin: devCryptoPlugin } = require('./index')
        
        const context = { engine }
        devCryptoPlugin.install(context)
        
        // 在开发环境下应该有调试日志
        expect(engine.logger.info).toHaveBeenCalled()
      } finally {
        process.env.NODE_ENV = originalEnv
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle missing engine context', async () => {
      const context = {}
      
      await expect(cryptoPlugin.install(context)).rejects.toThrow()
    })

    it('should handle missing logger gracefully', async () => {
      const engineWithoutLogger = {
        ...engine,
        logger: undefined
      }
      
      const context = { engine: engineWithoutLogger }
      
      // 应该不会抛出错误，而是使用 console.log
      await expect(cryptoPlugin.install(context)).resolves.not.toThrow()
    })

    it('should handle missing state manager gracefully', async () => {
      const engineWithoutState = {
        ...engine,
        state: undefined
      }
      
      const context = { engine: engineWithoutState }
      
      // 应该不会抛出错误
      await expect(cryptoPlugin.install(context)).resolves.not.toThrow()
    })
  })

  describe('Performance Monitoring', () => {
    it('should mark performance when enabled', async () => {
      const context = { engine }
      
      await cryptoPlugin.install(context)
      
      // 验证性能标记
      expect(engine.performance.mark).toHaveBeenCalledWith('crypto-plugin-installed')
    })

    it('should handle missing performance manager', async () => {
      const engineWithoutPerformance = {
        ...engine,
        performance: undefined
      }
      
      const context = { engine: engineWithoutPerformance }
      
      // 应该不会抛出错误
      await expect(cryptoPlugin.install(context)).resolves.not.toThrow()
    })
  })
})

describe('Crypto Plugin Configuration Export', () => {
  it('should export crypto configuration', () => {
    const { cryptoConfig } = require('./index')
    
    expect(cryptoConfig).toBeDefined()
    expect(cryptoConfig.name).toBe('crypto')
    expect(cryptoConfig.globalPropertyName).toBe('$crypto')
    expect(cryptoConfig.registerComposables).toBe(true)
    expect(cryptoConfig.config).toBeDefined()
  })

  it('should have correct algorithm configuration', () => {
    const { cryptoConfig } = require('./index')
    
    expect(cryptoConfig.config.defaultAESKeySize).toBe(256)
    expect(cryptoConfig.config.defaultRSAKeySize).toBe(2048)
    expect(cryptoConfig.config.defaultHashAlgorithm).toBe('SHA256')
    expect(cryptoConfig.config.defaultEncoding).toBe('base64')
  })
})
