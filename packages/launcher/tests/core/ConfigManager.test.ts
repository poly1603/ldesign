/**
 * ConfigManager 配置管理器测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ConfigManager } from '../../src/core/ConfigManager'
import type { ViteLauncherConfig } from '../../src/types'

// Mock @ldesign/kit 模块
vi.mock('@ldesign/kit', () => ({
  ConfigManager: vi.fn().mockImplementation(() => ({
    load: vi.fn(),
    save: vi.fn(),
    getAll: vi.fn().mockReturnValue({}),
    removeAllListeners: vi.fn(),
    on: vi.fn(),
    emit: vi.fn()
  })),
  Logger: vi.fn().mockImplementation(() => ({
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  })),
  FileSystem: {
    exists: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    stat: vi.fn()
  },
  PathUtils: {
    resolve: vi.fn((path) => path),
    join: vi.fn((...paths) => paths.join('/')),
    extname: vi.fn((path) => path.split('.').pop() || '')
  },
  FileWatcher: vi.fn().mockImplementation(() => ({
    watch: vi.fn(),
    close: vi.fn()
  }))
}))

describe('ConfigManager', () => {
  let configManager: ConfigManager
  
  beforeEach(() => {
    vi.clearAllMocks()
    configManager = new ConfigManager({
      cwd: '/test/project'
    })
  })
  
  afterEach(async () => {
    if (configManager) {
      await configManager.destroy()
    }
  })
  
  describe('构造函数', () => {
    it('应该正确初始化 ConfigManager 实例', () => {
      expect(configManager).toBeInstanceOf(ConfigManager)
    })
    
    it('应该接受配置选项', () => {
      const manager = new ConfigManager({
        cwd: '/custom/path',
        watch: true
      })
      
      expect(manager).toBeInstanceOf(ConfigManager)
    })
  })
  
  describe('配置加载', () => {
    it('应该正确加载配置文件', async () => {
      const mockConfig: ViteLauncherConfig = {
        server: {
          port: 3000,
          host: 'localhost'
        }
      }
      
      // Mock 文件存在
      const { FileSystem } = await import('@ldesign/kit')
      vi.mocked(FileSystem.exists).mockResolvedValue(true)
      
      // Mock 配置管理器返回配置
      const kitConfigManager = configManager['kitConfigManager']
      vi.mocked(kitConfigManager.getAll).mockReturnValue(mockConfig)
      
      const result = await configManager.load({
        configFile: '/test/config.js'
      })
      
      expect(result).toEqual(expect.objectContaining(mockConfig))
    })
    
    it('应该处理配置文件不存在的情况', async () => {
      const { FileSystem } = await import('@ldesign/kit')
      vi.mocked(FileSystem.exists).mockResolvedValue(false)
      
      await expect(configManager.load({
        configFile: '/nonexistent/config.js'
      })).rejects.toThrow('配置文件不存在')
    })
    
    it('应该在没有配置文件时使用默认配置', async () => {
      // Mock 找不到配置文件
      vi.spyOn(configManager as any, 'findConfigFile').mockResolvedValue(null)
      
      const result = await configManager.load()
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })
  
  describe('配置保存', () => {
    it('应该正确保存配置文件', async () => {
      const mockConfig: ViteLauncherConfig = {
        server: {
          port: 8080,
          host: '0.0.0.0'
        }
      }
      
      const kitConfigManager = configManager['kitConfigManager']
      vi.mocked(kitConfigManager.save).mockResolvedValue(undefined)
      
      await configManager.save('/test/config.js', mockConfig)
      
      expect(kitConfigManager.save).toHaveBeenCalledWith('/test/config.js', mockConfig)
    })
    
    it('应该在没有指定文件路径时抛出错误', async () => {
      const mockConfig: ViteLauncherConfig = {}
      
      await expect(configManager.save(undefined, mockConfig)).rejects.toThrow('未指定配置文件路径')
    })
  })
  
  describe('配置验证', () => {
    it('应该验证有效配置', async () => {
      const validConfig: ViteLauncherConfig = {
        server: {
          port: 3000,
          host: 'localhost'
        },
        build: {
          outDir: 'dist',
          minify: true
        }
      }
      
      const result = await configManager.validate(validConfig)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    it('应该检测无效配置', async () => {
      const invalidConfig: ViteLauncherConfig = {
        server: {
          port: 99999, // 无效端口
          host: 123 as any // 无效主机类型
        }
      }
      
      const result = await configManager.validate(invalidConfig)
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
    
    it('应该生成警告信息', async () => {
      const configWithWarnings: ViteLauncherConfig = {
        build: {
          outDir: 'relative/path' // 相对路径会产生警告
        }
      }
      
      const result = await configManager.validate(configWithWarnings)
      
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })
  
  describe('配置合并', () => {
    it('应该正确合并配置对象', () => {
      const baseConfig: ViteLauncherConfig = {
        server: {
          port: 3000,
          host: 'localhost'
        }
      }
      
      const overrideConfig: ViteLauncherConfig = {
        server: {
          port: 8080
        },
        build: {
          outDir: 'dist'
        }
      }
      
      const result = configManager.mergeConfigs(baseConfig, overrideConfig)
      
      expect(result.server?.port).toBe(8080)
      expect(result.server?.host).toBe('localhost')
      expect(result.build?.outDir).toBe('dist')
    })
    
    it('应该支持自定义合并策略', () => {
      const baseConfig: ViteLauncherConfig = { server: { port: 3000 } }
      const overrideConfig: ViteLauncherConfig = { server: { host: 'localhost' } }
      
      const result = configManager.mergeConfigs(baseConfig, overrideConfig, {
        strategy: 'override'
      })
      
      expect(result).toEqual(expect.objectContaining(overrideConfig))
    })
  })
  
  describe('配置更新', () => {
    it('应该正确更新配置', () => {
      const updates = {
        server: {
          port: 8080
        }
      }
      
      const oldConfig = configManager.getConfig()
      configManager.updateConfig(updates)
      const newConfig = configManager.getConfig()
      
      expect(newConfig.server?.port).toBe(8080)
      expect(newConfig).not.toEqual(oldConfig)
    })
    
    it('应该触发配置变更事件', () => {
      const changeListener = vi.fn()
      configManager.on('changed', changeListener)
      
      const updates = { server: { port: 9000 } }
      configManager.updateConfig(updates)
      
      expect(changeListener).toHaveBeenCalledWith(
        expect.objectContaining({
          updates
        })
      )
    })
  })
  
  describe('配置重置', () => {
    it('应该正确重置配置为默认值', () => {
      // 先更新配置
      configManager.updateConfig({ server: { port: 8080 } })
      
      // 然后重置
      configManager.reset()
      
      const config = configManager.getConfig()
      expect(config.server?.port).not.toBe(8080)
    })
    
    it('应该触发重置事件', () => {
      const resetListener = vi.fn()
      configManager.on('reset', resetListener)
      
      configManager.reset()
      
      expect(resetListener).toHaveBeenCalled()
    })
  })
  
  describe('验证规则', () => {
    it('应该正确添加验证规则', () => {
      const customRule = {
        name: 'custom-rule',
        validate: vi.fn().mockReturnValue({ valid: true, errors: [], warnings: [] })
      }
      
      configManager.addValidationRule(customRule)
      
      // 验证时应该调用自定义规则
      configManager.validate({})
      
      expect(customRule.validate).toHaveBeenCalled()
    })
    
    it('应该正确移除验证规则', () => {
      const customRule = {
        name: 'custom-rule',
        validate: vi.fn().mockReturnValue({ valid: true, errors: [], warnings: [] })
      }
      
      configManager.addValidationRule(customRule)
      configManager.removeValidationRule('custom-rule')
      
      // 移除后验证时不应该调用该规则
      configManager.validate({})
      
      expect(customRule.validate).not.toHaveBeenCalled()
    })
  })
  
  describe('销毁', () => {
    it('应该正确清理资源', async () => {
      await configManager.destroy()
      
      // 检查是否清理了文件监听器和事件监听器
      expect(configManager.listenerCount('loaded')).toBe(0)
      expect(configManager.listenerCount('changed')).toBe(0)
    })
  })
})
