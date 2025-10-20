/**
 * TemplateManager 测试用例
 */

import type { TemplateManagerOptions } from '../../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateManager } from '../../src/core/manager'

describe('templateManager', () => {
  let manager: TemplateManager

  beforeEach(() => {
    const config: TemplateManagerOptions = {
      enableCache: true,
      autoDetectDevice: false,
      defaultDevice: 'desktop',
      debug: false,
    }
    manager = new TemplateManager(config)
  })

  describe('scanTemplates', () => {
    it('应该能够扫描模板', async () => {
      const result = await manager.scanTemplates()

      expect(result).toBeDefined()
      expect(result.count).toBeGreaterThanOrEqual(0)
      expect(result.templates).toBeInstanceOf(Array)
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('应该触发扫描事件', async () => {
      const startListener = vi.fn()
      const completeListener = vi.fn()

      manager.on('template:scan:start', startListener)
      manager.on('template:scan:complete', completeListener)

      await manager.scanTemplates()

      expect(startListener).toHaveBeenCalled()
      expect(completeListener).toHaveBeenCalled()
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      await manager.scanTemplates()
    })

    it('应该能够渲染存在的模板', async () => {
      const templates = manager.getTemplates()
      if (templates.length > 0) {
        const template = templates[0]
        const result = await manager.render({
          category: template.category,
          device: template.device,
          template: template.template,
        })

        expect(result).toBeDefined()
        expect(result.component).toBeDefined()
        expect(result.metadata).toBeDefined()
      }
    })

    it('应该使用回退模板当模板不存在时', async () => {
      const result = await manager.render({
        category: 'login',
        device: 'desktop',
        template: 'nonexistent',
        fallback: true,
      })

      expect(result).toBeDefined()
      expect(result.component).toBeDefined()
    })

    it('应该抛出错误当模板不存在且禁用回退时', async () => {
      await expect(manager.render({
        category: 'nonexistent',
        device: 'desktop',
        template: 'nonexistent',
        fallback: false,
      })).rejects.toThrow()
    })

    it('应该触发渲染事件', async () => {
      const startListener = vi.fn()
      const completeListener = vi.fn()

      manager.on('template:load:start', startListener)
      manager.on('template:load:complete', completeListener)

      const templates = manager.getTemplates()
      if (templates.length > 0) {
        const template = templates[0]
        await manager.render({
          category: template.category,
          device: template.device,
          template: template.template,
        })

        expect(startListener).toHaveBeenCalled()
        expect(completeListener).toHaveBeenCalled()
      }
    })
  })

  describe('switchTemplate', () => {
    beforeEach(async () => {
      await manager.scanTemplates()
    })

    it('应该能够切换模板', async () => {
      const templates = manager.getTemplates()
      if (templates.length > 0) {
        const template = templates[0]

        await expect(manager.switchTemplate(
          template.category,
          template.device,
          template.template,
        )).resolves.not.toThrow()

        const currentTemplate = manager.getCurrentTemplate()
        expect(currentTemplate).toBeDefined()
        expect(currentTemplate?.category).toBe(template.category)
        expect(currentTemplate?.device).toBe(template.device)
        expect(currentTemplate?.template).toBe(template.template)
      }
    })

    it('应该触发切换事件', async () => {
      const startListener = vi.fn()
      const completeListener = vi.fn()

      manager.on('template:switch:start', startListener)
      manager.on('template:switch:complete', completeListener)

      const templates = manager.getTemplates()
      if (templates.length > 0) {
        const template = templates[0]
        await manager.switchTemplate(
          template.category,
          template.device,
          template.template,
        )

        expect(startListener).toHaveBeenCalled()
        expect(completeListener).toHaveBeenCalled()
      }
    })
  })

  describe('getTemplates', () => {
    beforeEach(async () => {
      await manager.scanTemplates()
    })

    it('应该返回所有模板', () => {
      const templates = manager.getTemplates()
      expect(templates).toBeInstanceOf(Array)
    })

    it('应该能够按分类过滤', () => {
      const loginTemplates = manager.getTemplates('login')
      expect(loginTemplates).toBeInstanceOf(Array)

      if (loginTemplates.length > 0) {
        loginTemplates.forEach((template) => {
          expect(template.category).toBe('login')
        })
      }
    })

    it('应该能够按设备过滤', () => {
      const desktopTemplates = manager.getTemplates(undefined, 'desktop')
      expect(desktopTemplates).toBeInstanceOf(Array)

      if (desktopTemplates.length > 0) {
        desktopTemplates.forEach((template) => {
          expect(template.device).toBe('desktop')
        })
      }
    })
  })

  describe('hasTemplate', () => {
    beforeEach(async () => {
      await manager.scanTemplates()
    })

    it('应该正确检查模板是否存在', () => {
      const templates = manager.getTemplates()
      if (templates.length > 0) {
        const template = templates[0]
        const exists = manager.hasTemplate(
          template.category,
          template.device,
          template.template,
        )
        expect(exists).toBe(true)
      }
    })

    it('应该返回false当模板不存在时', () => {
      const exists = manager.hasTemplate('nonexistent', 'desktop', 'nonexistent')
      expect(exists).toBe(false)
    })
  })

  describe('findTemplate', () => {
    beforeEach(async () => {
      await manager.scanTemplates()
    })

    it('应该能够找到存在的模板', () => {
      const templates = manager.getTemplates()
      if (templates.length > 0) {
        const template = templates[0]
        const found = manager.findTemplate(
          template.category,
          template.device,
          template.template,
        )
        expect(found).toEqual(template)
      }
    })

    it('应该返回null当模板不存在时', () => {
      const found = manager.findTemplate('nonexistent', 'desktop', 'nonexistent')
      expect(found).toBeNull()
    })
  })

  describe('getCurrentDevice', () => {
    it('应该返回默认设备类型', () => {
      const device = manager.getCurrentDevice()
      expect(device).toBe('desktop')
    })
  })

  describe('clearCache', () => {
    it('应该能够清空缓存', () => {
      expect(() => manager.clearCache()).not.toThrow()
    })

    it('应该触发缓存清空事件', () => {
      const listener = vi.fn()
      manager.on('cache:clear', listener)

      manager.clearCache()

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('getCacheStats', () => {
    it('应该返回缓存统计信息', () => {
      const stats = manager.getCacheStats()

      expect(stats).toBeDefined()
      expect(typeof stats.components).toBe('number')
      expect(typeof stats.metadata).toBe('number')
      expect(typeof stats.unified).toBe('number')
    })
  })

  describe('getConfig', () => {
    it('应该返回配置副本', () => {
      const config = manager.getConfig()

      expect(config).toBeDefined()
      expect(config.enableCache).toBe(true)
      expect(config.defaultDevice).toBe('desktop')
    })
  })

  describe('updateConfig', () => {
    it('应该能够更新配置', () => {
      const newConfig = { enableCache: false }

      manager.updateConfig(newConfig)

      const config = manager.getConfig()
      expect(config.enableCache).toBe(false)
    })
  })

  describe('refresh', () => {
    it('应该能够刷新模板管理器', async () => {
      await expect(manager.refresh()).resolves.not.toThrow()
    })
  })

  describe('getAvailableCategories', () => {
    beforeEach(async () => {
      await manager.scanTemplates()
    })

    it('应该返回可用分类', () => {
      const categories = manager.getAvailableCategories()
      expect(categories).toBeInstanceOf(Array)
    })
  })

  describe('getAvailableDevices', () => {
    beforeEach(async () => {
      await manager.scanTemplates()
    })

    it('应该返回可用设备类型', () => {
      const devices = manager.getAvailableDevices()
      expect(devices).toBeInstanceOf(Array)
    })
  })

  describe('事件系统', () => {
    it('应该能够监听和取消监听事件', () => {
      const listener = vi.fn()

      const unsubscribe = manager.on('template:scan:start', listener)
      expect(typeof unsubscribe).toBe('function')

      unsubscribe()

      // 取消监听后不应该触发
      manager.emit('template:scan:start')
      expect(listener).not.toHaveBeenCalled()
    })

    it('应该能够监听事件一次', () => {
      const listener = vi.fn()

      manager.once('template:scan:start', listener)

      // 第一次触发应该调用
      manager.emit('template:scan:start')
      expect(listener).toHaveBeenCalledTimes(1)

      // 第二次触发不应该调用
      manager.emit('template:scan:start')
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('destroy', () => {
    it('应该能够销毁管理器', () => {
      expect(() => manager.destroy()).not.toThrow()
    })
  })
})
