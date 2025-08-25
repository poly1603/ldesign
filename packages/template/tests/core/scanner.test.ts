/**
 * TemplateScanner 测试用例
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { TemplateScanner } from '../../src/core/scanner'

describe('templateScanner', () => {
  let scanner: TemplateScanner

  beforeEach(() => {
    scanner = new TemplateScanner({ debug: false })
  })

  describe('scanTemplates', () => {
    it('应该能够扫描模板', async () => {
      const result = await scanner.scanTemplates()

      expect(result).toBeDefined()
      expect(result.count).toBeGreaterThanOrEqual(0)
      expect(result.templates).toBeInstanceOf(Array)
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(result.scannedDirectories).toBeGreaterThanOrEqual(0)
      expect(result.scanMode).toBeDefined()
    })

    it('应该返回回退模板当没有找到模板时', async () => {
      const result = await scanner.scanTemplates()

      // 即使没有找到真实模板，也应该有回退模板
      expect(result.count).toBeGreaterThan(0)
      expect(result.templates.length).toBeGreaterThan(0)
    })

    it('应该缓存扫描结果', async () => {
      const result1 = await scanner.scanTemplates()
      const result2 = await scanner.scanTemplates()

      // 第二次调用应该更快（来自缓存）
      expect(result2.duration).toBeLessThanOrEqual(result1.duration)
    })
  })

  describe('getTemplates', () => {
    beforeEach(async () => {
      await scanner.scanTemplates()
    })

    it('应该返回所有模板', () => {
      const templates = scanner.getTemplates()
      expect(templates).toBeInstanceOf(Array)
      expect(templates.length).toBeGreaterThan(0)
    })

    it('应该能够按分类过滤模板', () => {
      const loginTemplates = scanner.getTemplates('login')
      expect(loginTemplates).toBeInstanceOf(Array)

      if (loginTemplates.length > 0) {
        loginTemplates.forEach((template) => {
          expect(template.category).toBe('login')
        })
      }
    })

    it('应该能够按设备类型过滤模板', () => {
      const desktopTemplates = scanner.getTemplates(undefined, 'desktop')
      expect(desktopTemplates).toBeInstanceOf(Array)

      if (desktopTemplates.length > 0) {
        desktopTemplates.forEach((template) => {
          expect(template.device).toBe('desktop')
        })
      }
    })

    it('应该能够按分类和设备类型过滤模板', () => {
      const loginDesktopTemplates = scanner.getTemplates('login', 'desktop')
      expect(loginDesktopTemplates).toBeInstanceOf(Array)

      if (loginDesktopTemplates.length > 0) {
        loginDesktopTemplates.forEach((template) => {
          expect(template.category).toBe('login')
          expect(template.device).toBe('desktop')
        })
      }
    })
  })

  describe('findTemplate', () => {
    beforeEach(async () => {
      await scanner.scanTemplates()
    })

    it('应该能够找到存在的模板', () => {
      const templates = scanner.getAllTemplates()
      if (templates.length > 0) {
        const firstTemplate = templates[0]
        const found = scanner.findTemplate(
          firstTemplate.category,
          firstTemplate.device,
          firstTemplate.template,
        )

        expect(found).toBeDefined()
        expect(found?.category).toBe(firstTemplate.category)
        expect(found?.device).toBe(firstTemplate.device)
        expect(found?.template).toBe(firstTemplate.template)
      }
    })

    it('应该返回null当模板不存在时', () => {
      const found = scanner.findTemplate('nonexistent', 'desktop', 'nonexistent')
      expect(found).toBeNull()
    })
  })

  describe('hasTemplate', () => {
    beforeEach(async () => {
      await scanner.scanTemplates()
    })

    it('应该正确检查模板是否存在', () => {
      const templates = scanner.getAllTemplates()
      if (templates.length > 0) {
        const firstTemplate = templates[0]
        const exists = scanner.hasTemplate(
          firstTemplate.category,
          firstTemplate.device,
          firstTemplate.template,
        )

        expect(exists).toBe(true)
      }
    })

    it('应该返回false当模板不存在时', () => {
      const exists = scanner.hasTemplate('nonexistent', 'desktop', 'nonexistent')
      expect(exists).toBe(false)
    })
  })

  describe('getAvailableCategories', () => {
    beforeEach(async () => {
      await scanner.scanTemplates()
    })

    it('应该返回可用分类列表', () => {
      const categories = scanner.getAvailableCategories()
      expect(categories).toBeInstanceOf(Array)
      expect(categories.length).toBeGreaterThan(0)

      // 应该包含基本分类
      expect(categories).toContain('login')
      expect(categories).toContain('dashboard')
    })

    it('应该返回唯一的分类', () => {
      const categories = scanner.getAvailableCategories()
      const uniqueCategories = [...new Set(categories)]
      expect(categories).toEqual(uniqueCategories)
    })
  })

  describe('getAvailableDevices', () => {
    beforeEach(async () => {
      await scanner.scanTemplates()
    })

    it('应该返回可用设备类型列表', () => {
      const devices = scanner.getAvailableDevices()
      expect(devices).toBeInstanceOf(Array)
      expect(devices.length).toBeGreaterThan(0)

      // 应该包含基本设备类型
      expect(devices).toContain('desktop')
      expect(devices).toContain('mobile')
      expect(devices).toContain('tablet')
    })

    it('应该能够按分类过滤设备类型', () => {
      const loginDevices = scanner.getAvailableDevices('login')
      expect(loginDevices).toBeInstanceOf(Array)
    })
  })

  describe('clearCache', () => {
    it('应该能够清空缓存', async () => {
      await scanner.scanTemplates()

      scanner.clearCache()

      const stats = scanner.getCacheStats()
      expect(stats.size).toBe(0)
      expect(stats.lastScanTime).toBe(0)
    })
  })

  describe('getCacheStats', () => {
    it('应该返回缓存统计信息', () => {
      const stats = scanner.getCacheStats()

      expect(stats).toBeDefined()
      expect(typeof stats.size).toBe('number')
      expect(typeof stats.lastScanTime).toBe('number')
      expect(typeof stats.templates).toBe('number')
    })
  })

  describe('getStats', () => {
    beforeEach(async () => {
      await scanner.scanTemplates()
    })

    it('应该返回扫描统计信息', () => {
      const stats = scanner.getStats()

      expect(stats).toBeDefined()
      expect(typeof stats.totalTemplates).toBe('number')
      expect(stats.categories).toBeInstanceOf(Array)
      expect(stats.devices).toBeInstanceOf(Array)
      expect(stats.cacheStats).toBeDefined()
    })
  })
})
