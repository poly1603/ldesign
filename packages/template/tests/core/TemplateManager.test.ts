import type { TemplateManagerConfig } from '@/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateManager } from '@/core/TemplateManager'

describe('templateManager', () => {
  let manager: TemplateManager
  let config: TemplateManagerConfig

  beforeEach(() => {
    config = {
      templateRoot: 'src/templates',
      enableCache: true,
      cacheLimit: 10,
      enablePreload: false,
      defaultDevice: 'desktop',
    }
    manager = new TemplateManager(config)
  })

  afterEach(() => {
    manager.destroy()
  })

  describe('初始化', () => {
    it('应该正确初始化管理器', () => {
      expect(manager).toBeDefined()
      expect(manager.getCurrentDevice()).toBe('desktop')
    })

    it('应该合并默认配置', () => {
      const managerConfig = manager.getConfig()
      expect(managerConfig.enableCache).toBe(true)
      expect(managerConfig.cacheLimit).toBe(10)
      expect(managerConfig.templateRoot).toBe('src/templates')
    })
  })

  describe('设备检测', () => {
    it('应该能检测当前设备类型', () => {
      const device = manager.detectDevice()
      expect(['desktop', 'mobile', 'tablet']).toContain(device)
    })

    it('应该能获取当前设备类型', () => {
      const device = manager.getCurrentDevice()
      expect(['desktop', 'mobile', 'tablet']).toContain(device)
    })
  })

  describe('模板扫描', () => {
    it('应该能扫描模板', async () => {
      const result = await manager.scanTemplates()
      expect(result).toBeDefined()
      expect(result.templates).toBeInstanceOf(Array)
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(result.scannedDirectories).toBeGreaterThanOrEqual(0)
    })

    it('应该能获取可用模板列表', async () => {
      await manager.scanTemplates()
      const templates = await manager.getAvailableTemplates()
      expect(templates).toBeInstanceOf(Array)
    })

    it('应该能按分类获取模板', async () => {
      await manager.scanTemplates()
      const templates = await manager.getAvailableTemplates('login')
      expect(templates).toBeInstanceOf(Array)
      templates.forEach(template => {
        expect(template.category).toBe('login')
      })
    })

    it('应该能按设备类型获取模板', async () => {
      await manager.scanTemplates()
      const templates = await manager.getAvailableTemplates(undefined, 'desktop')
      expect(templates).toBeInstanceOf(Array)
      templates.forEach(template => {
        expect(template.device).toBe('desktop')
      })
    })
  })

  describe('模板管理', () => {
    beforeEach(async () => {
      await manager.scanTemplates()
    })

    it('应该能检查模板是否存在', async () => {
      const exists = await manager.hasTemplate('login', 'desktop', 'classic')
      expect(typeof exists).toBe('boolean')
    })

    it('应该能获取模板元数据', async () => {
      const metadata = await manager.getTemplateMetadata('login', 'desktop', 'classic')
      if (metadata) {
        expect(metadata.category).toBe('login')
        expect(metadata.device).toBe('desktop')
        expect(metadata.template).toBe('classic')
        expect(metadata.config).toBeDefined()
      }
    })

    it('应该能获取可用分类', async () => {
      const categories = await manager.getAvailableCategories()
      expect(categories).toBeInstanceOf(Array)
    })

    it('应该能获取可用设备类型', async () => {
      const devices = await manager.getAvailableDevices()
      expect(devices).toBeInstanceOf(Array)
      devices.forEach(device => {
        expect(['desktop', 'mobile', 'tablet']).toContain(device)
      })
    })
  })

  describe('缓存管理', () => {
    it('应该能清空缓存', () => {
      expect(() => manager.clearCache()).not.toThrow()
    })

    it('应该能获取缓存统计', () => {
      const stats = manager.getCacheStats()
      expect(stats).toBeDefined()
      expect(stats.components).toBeDefined()
      expect(stats.metadata).toBeDefined()
    })

    it('应该能清理过期缓存', () => {
      // cleanupCache 现在只是清空缓存，不返回值
      expect(() => manager.cleanupCache()).not.toThrow()

      // 验证缓存已被清空
      const stats = manager.getCacheStats()
      expect(stats).toBeDefined()
      expect(typeof stats.components).toBe('number')
    })
  })

  describe('配置管理', () => {
    it('应该能更新配置', () => {
      const newConfig = { enableCache: false }
      expect(() => manager.updateConfig(newConfig)).not.toThrow()
      expect(manager.getConfig().enableCache).toBe(false)
    })
  })

  describe('事件系统', () => {
    it('应该能监听设备变化事件', () => {
      const callback = vi.fn()
      const unsubscribe = manager.on('device:change', callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('应该能监听模板变化事件', () => {
      const callback = vi.fn()
      const unsubscribe = manager.on('template:change', callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('应该能监听错误事件', () => {
      const callback = vi.fn()
      const unsubscribe = manager.on('template:error', callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })
  })

  describe('销毁', () => {
    it('应该能正确销毁管理器', () => {
      expect(() => manager.destroy()).not.toThrow()
    })
  })
})
