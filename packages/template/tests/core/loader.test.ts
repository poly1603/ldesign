/**
 * TemplateLoader 测试用例
 */

import type { TemplateMetadata } from '../../src/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { TemplateLoader } from '../../src/core/loader'

describe('templateLoader', () => {
  let loader: TemplateLoader

  beforeEach(() => {
    loader = new TemplateLoader()
  })

  const mockMetadata: TemplateMetadata = {
    category: 'login',
    device: 'desktop',
    template: 'classic',
    name: 'Classic Login',
    description: 'A classic login template',
    path: '../templates/login/desktop/classic/index.tsx',
    componentPath: '../templates/login/desktop/classic/index.tsx',
    tags: ['login', 'desktop'],
    recommended: true,
  }

  describe('loadTemplate', () => {
    it('应该能够加载模板', async () => {
      const result = await loader.loadTemplate(mockMetadata)

      expect(result).toBeDefined()
      expect(result.component).toBeDefined()
      expect(result.metadata).toEqual(mockMetadata)
      expect(typeof result.loadTime).toBe('number')
      expect(typeof result.fromCache).toBe('boolean')
    })

    it('应该返回回退组件当模板不存在时', async () => {
      const nonExistentMetadata: TemplateMetadata = {
        ...mockMetadata,
        template: 'nonexistent',
        path: '../templates/login/desktop/nonexistent/index.tsx',
        componentPath: '../templates/login/desktop/nonexistent/index.tsx',
      }

      const result = await loader.loadTemplate(nonExistentMetadata)

      expect(result).toBeDefined()
      expect(result.component).toBeDefined()
      expect(result.metadata).toEqual(nonExistentMetadata)
    })

    it('应该缓存加载的组件', async () => {
      const result1 = await loader.loadTemplate(mockMetadata)
      const result2 = await loader.loadTemplate(mockMetadata)

      expect(result1.fromCache).toBe(false)
      expect(result2.fromCache).toBe(true)
      expect(result2.loadTime).toBeLessThanOrEqual(result1.loadTime)
    })
  })

  describe('preloadTemplate', () => {
    it('应该能够预加载模板', async () => {
      await expect(loader.preloadTemplate(mockMetadata)).resolves.not.toThrow()

      // 预加载后应该在缓存中
      expect(loader.isCached(mockMetadata)).toBe(true)
    })

    it('应该静默处理预加载失败', async () => {
      const nonExistentMetadata: TemplateMetadata = {
        ...mockMetadata,
        template: 'nonexistent',
        path: '../templates/login/desktop/nonexistent/index.tsx',
        componentPath: '../templates/login/desktop/nonexistent/index.tsx',
      }

      await expect(loader.preloadTemplate(nonExistentMetadata)).resolves.not.toThrow()
    })
  })

  describe('preloadTemplates', () => {
    it('应该能够批量预加载模板', async () => {
      const templates = [mockMetadata]

      await expect(loader.preloadTemplates(templates)).resolves.not.toThrow()
    })

    it('应该处理空模板列表', async () => {
      await expect(loader.preloadTemplates([])).resolves.not.toThrow()
    })
  })

  describe('isCached', () => {
    it('应该正确检查模板是否已缓存', async () => {
      expect(loader.isCached(mockMetadata)).toBe(false)

      await loader.loadTemplate(mockMetadata)

      expect(loader.isCached(mockMetadata)).toBe(true)
    })
  })

  describe('clearCache', () => {
    it('应该能够清空所有缓存', async () => {
      await loader.loadTemplate(mockMetadata)
      expect(loader.isCached(mockMetadata)).toBe(true)

      loader.clearCache()

      expect(loader.isCached(mockMetadata)).toBe(false)
    })
  })

  describe('clearTemplateCache', () => {
    it('应该能够清空特定模板的缓存', async () => {
      await loader.loadTemplate(mockMetadata)
      expect(loader.isCached(mockMetadata)).toBe(true)

      loader.clearTemplateCache(mockMetadata)

      expect(loader.isCached(mockMetadata)).toBe(false)
    })
  })

  describe('getCacheStats', () => {
    it('应该返回缓存统计信息', () => {
      const stats = loader.getCacheStats()

      expect(stats).toBeDefined()
      expect(typeof stats.size).toBe('number')
      expect(typeof stats.maxSize).toBe('number')
      expect(typeof stats.hitRate).toBe('number')
    })

    it('应该反映缓存变化', async () => {
      const statsBefore = loader.getCacheStats()

      await loader.loadTemplate(mockMetadata)

      const statsAfter = loader.getCacheStats()
      expect(statsAfter.size).toBeGreaterThan(statsBefore.size)
    })
  })

  describe('getCachedTemplates', () => {
    it('应该返回缓存的模板列表', async () => {
      const templatesBefore = loader.getCachedTemplates()
      expect(templatesBefore).toBeInstanceOf(Array)

      await loader.loadTemplate(mockMetadata)

      const templatesAfter = loader.getCachedTemplates()
      expect(templatesAfter.length).toBeGreaterThan(templatesBefore.length)
    })
  })

  describe('generateCacheKey', () => {
    it('应该为相同的元数据生成相同的缓存键', async () => {
      const metadata1 = { ...mockMetadata }
      const metadata2 = { ...mockMetadata }

      await loader.loadTemplate(metadata1)

      // 相同的元数据应该命中缓存
      expect(loader.isCached(metadata2)).toBe(true)
    })

    it('应该为不同的元数据生成不同的缓存键', async () => {
      const metadata1 = { ...mockMetadata }
      const metadata2 = { ...mockMetadata, template: 'modern' }

      await loader.loadTemplate(metadata1)

      // 不同的元数据不应该命中缓存
      expect(loader.isCached(metadata2)).toBe(false)
    })
  })
})
