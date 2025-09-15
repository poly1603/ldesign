/**
 * 配置预设管理器单元测试
 */

import { describe, it, expect } from 'vitest'
import { ConfigPresets } from '../../src/core/config-presets'
import type { ConfigPresetType } from '../../src/core/config-presets'

describe('ConfigPresets', () => {
  describe('预设获取', () => {
    it('应该获取开发环境预设', () => {
      const preset = ConfigPresets.getPreset('development')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('开发环境')
      expect(preset!.config.logLevel).toBe('debug')
      expect(preset!.config.debug).toBe(true)
      expect(preset!.scenarios).toContain('本地开发')
    })

    it('应该获取生产环境预设', () => {
      const preset = ConfigPresets.getPreset('production')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('生产环境')
      expect(preset!.config.logLevel).toBe('warn')
      expect(preset!.config.debug).toBe(false)
      expect(preset!.config.compression).toBe(true)
    })

    it('应该获取高性能预设', () => {
      const preset = ConfigPresets.getPreset('performance')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('高性能')
      expect(preset!.config.messageQueue?.maxSize).toBe(5000)
      expect(preset!.config.maxMessageSize).toBe(5 * 1024 * 1024)
    })

    it('应该获取低延迟预设', () => {
      const preset = ConfigPresets.getPreset('lowLatency')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('低延迟')
      expect(preset!.config.messageQueue?.enabled).toBe(false)
      expect(preset!.config.compression).toBe(false)
      expect(preset!.config.heartbeat?.interval).toBe(5000)
    })

    it('应该获取移动端预设', () => {
      const preset = ConfigPresets.getPreset('mobile')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('移动端')
      expect(preset!.config.connectionTimeout).toBe(20000)
      expect(preset!.config.heartbeat?.interval).toBe(60000)
      expect(preset!.config.reconnect?.maxDelay).toBe(120000)
    })

    it('应该获取调试预设', () => {
      const preset = ConfigPresets.getPreset('debug')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('调试')
      expect(preset!.config.logLevel).toBe('debug')
      expect(preset!.config.debug).toBe(true)
      expect(preset!.config.heartbeat?.message).toBe('debug-ping')
    })

    it('应该获取安全预设', () => {
      const preset = ConfigPresets.getPreset('secure')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('安全')
      expect(preset!.config.messageQueue?.persistent).toBe(false)
      expect(preset!.config.compression).toBe(false)
      expect(preset!.config.maxMessageSize).toBe(512 * 1024)
    })

    it('应该获取最小化预设', () => {
      const preset = ConfigPresets.getPreset('minimal')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('最小化')
      expect(preset!.config.reconnect?.enabled).toBe(false)
      expect(preset!.config.heartbeat?.enabled).toBe(false)
      expect(preset!.config.messageQueue?.enabled).toBe(false)
    })

    it('应该获取健壮性预设', () => {
      const preset = ConfigPresets.getPreset('robust')
      
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('健壮性')
      expect(preset!.config.reconnect?.maxAttempts).toBe(50)
      expect(preset!.config.messageQueue?.maxSize).toBe(10000)
      expect(preset!.config.messageQueue?.messageExpiry).toBe(1800000)
    })

    it('应该返回undefined对于不存在的预设', () => {
      const preset = ConfigPresets.getPreset('nonexistent' as ConfigPresetType)
      expect(preset).toBeUndefined()
    })
  })

  describe('预设配置获取', () => {
    it('应该获取预设的配置部分', () => {
      const config = ConfigPresets.getPresetConfig('development')
      
      expect(config).toBeDefined()
      expect(config!.logLevel).toBe('debug')
      expect(config!.debug).toBe(true)
    })

    it('应该返回undefined对于不存在的预设配置', () => {
      const config = ConfigPresets.getPresetConfig('nonexistent' as ConfigPresetType)
      expect(config).toBeUndefined()
    })
  })

  describe('预设列表', () => {
    it('应该获取所有可用的预设类型', () => {
      const presets = ConfigPresets.getAvailablePresets()
      
      expect(presets).toContain('development')
      expect(presets).toContain('production')
      expect(presets).toContain('performance')
      expect(presets).toContain('lowLatency')
      expect(presets).toContain('mobile')
      expect(presets).toContain('debug')
      expect(presets).toContain('secure')
      expect(presets).toContain('minimal')
      expect(presets).toContain('robust')
      expect(presets.length).toBeGreaterThanOrEqual(9)
    })

    it('应该获取所有预设信息', () => {
      const presets = ConfigPresets.getAllPresets()
      
      expect(presets.length).toBeGreaterThanOrEqual(9)
      expect(presets.every(p => p.name && p.description && p.config)).toBe(true)
    })
  })

  describe('场景推荐', () => {
    it('应该根据场景推荐预设', () => {
      const recommendations = ConfigPresets.recommendPresets('开发')
      expect(recommendations).toContain('development')
      expect(recommendations).toContain('debug')
    })

    it('应该推荐生产环境相关预设', () => {
      const recommendations = ConfigPresets.recommendPresets('生产')
      expect(recommendations).toContain('production')
    })

    it('应该推荐移动端相关预设', () => {
      const recommendations = ConfigPresets.recommendPresets('移动')
      expect(recommendations).toContain('mobile')
    })

    it('应该推荐性能相关预设', () => {
      const recommendations = ConfigPresets.recommendPresets('性能')
      expect(recommendations).toContain('performance')
    })

    it('应该推荐安全相关预设', () => {
      const recommendations = ConfigPresets.recommendPresets('安全')
      expect(recommendations).toContain('secure')
    })

    it('应该返回空数组对于无匹配场景', () => {
      const recommendations = ConfigPresets.recommendPresets('不存在的场景')
      expect(recommendations).toEqual([])
    })
  })

  describe('预设合并', () => {
    it('应该合并单个预设', () => {
      const config = ConfigPresets.mergePresets('development')
      
      expect(config.logLevel).toBe('debug')
      expect(config.debug).toBe(true)
    })

    it('应该合并多个预设', () => {
      const config = ConfigPresets.mergePresets('minimal', 'debug')
      
      // debug预设应该覆盖minimal预设
      expect(config.logLevel).toBe('debug')
      expect(config.debug).toBe(true)
      expect(config.reconnect?.enabled).toBe(true) // 来自debug预设
    })

    it('应该按顺序覆盖配置', () => {
      const config = ConfigPresets.mergePresets('production', 'development')
      
      // development预设应该覆盖production预设
      expect(config.logLevel).toBe('debug')
      expect(config.debug).toBe(true)
    })

    it('应该处理空预设列表', () => {
      const config = ConfigPresets.mergePresets()
      expect(config).toEqual({})
    })

    it('应该忽略不存在的预设', () => {
      const config = ConfigPresets.mergePresets('development', 'nonexistent' as ConfigPresetType)
      
      expect(config.logLevel).toBe('debug')
      expect(config.debug).toBe(true)
    })
  })

  describe('自定义预设', () => {
    it('应该创建自定义预设', () => {
      const customPreset = {
        name: '自定义预设',
        description: '测试用的自定义预设',
        scenarios: ['测试'],
        config: {
          logLevel: 'warn' as const,
          debug: false,
          connectionTimeout: 8000
        }
      }
      
      ConfigPresets.createCustomPreset('custom', customPreset)
      
      const preset = ConfigPresets.getPreset('custom' as ConfigPresetType)
      expect(preset).toEqual(customPreset)
    })

    it('应该删除自定义预设', () => {
      const customPreset = {
        name: '临时预设',
        description: '临时测试预设',
        scenarios: ['临时'],
        config: { logLevel: 'info' as const }
      }
      
      ConfigPresets.createCustomPreset('temp', customPreset)
      expect(ConfigPresets.getPreset('temp' as ConfigPresetType)).toBeDefined()
      
      const removed = ConfigPresets.removeCustomPreset('temp')
      expect(removed).toBe(true)
      expect(ConfigPresets.getPreset('temp' as ConfigPresetType)).toBeUndefined()
    })

    it('应该返回false当删除不存在的预设', () => {
      const removed = ConfigPresets.removeCustomPreset('nonexistent')
      expect(removed).toBe(false)
    })
  })

  describe('预设配置验证', () => {
    it('所有预设都应该有必需的字段', () => {
      const presets = ConfigPresets.getAllPresets()
      
      presets.forEach(preset => {
        expect(preset.name).toBeTruthy()
        expect(preset.description).toBeTruthy()
        expect(preset.config).toBeDefined()
        expect(preset.scenarios).toBeDefined()
        expect(Array.isArray(preset.scenarios)).toBe(true)
        expect(preset.scenarios.length).toBeGreaterThan(0)
      })
    })

    it('所有预设配置都应该有有效的日志级别', () => {
      const presets = ConfigPresets.getAllPresets()
      const validLogLevels = ['debug', 'info', 'warn', 'error']
      
      presets.forEach(preset => {
        if (preset.config.logLevel) {
          expect(validLogLevels).toContain(preset.config.logLevel)
        }
      })
    })

    it('所有预设配置都应该有合理的数值', () => {
      const presets = ConfigPresets.getAllPresets()
      
      presets.forEach(preset => {
        const config = preset.config
        
        if (config.connectionTimeout !== undefined) {
          expect(config.connectionTimeout).toBeGreaterThan(0)
        }
        
        if (config.reconnect?.initialDelay !== undefined) {
          expect(config.reconnect.initialDelay).toBeGreaterThan(0)
        }
        
        if (config.heartbeat?.interval !== undefined) {
          expect(config.heartbeat.interval).toBeGreaterThan(0)
        }
        
        if (config.messageQueue?.maxSize !== undefined) {
          expect(config.messageQueue.maxSize).toBeGreaterThan(0)
        }
      })
    })
  })
})
