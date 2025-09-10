/**
 * PerformanceOptimizer 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PerformanceOptimizer, createPerformanceOptimizer } from '../../core/PerformanceOptimizer'
import type { ResolvedConfig } from 'vite'

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer

  beforeEach(() => {
    optimizer = createPerformanceOptimizer()
  })

  describe('初始化', () => {
    it('应该使用默认选项创建实例', () => {
      expect(optimizer).toBeInstanceOf(PerformanceOptimizer)
      const metrics = optimizer.getMetrics()
      expect(metrics).toEqual({})
    })

    it('应该接受自定义选项', () => {
      const customOptimizer = createPerformanceOptimizer({
        enableAutoSplitting: false,
        enableCompression: false,
        inlineLimit: 8192
      })
      expect(customOptimizer).toBeInstanceOf(PerformanceOptimizer)
    })
  })

  describe('Vite 插件', () => {
    it('应该创建有效的 Vite 插件', () => {
      const plugin = optimizer.createVitePlugin()
      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('launcher:performance-optimizer')
      expect(plugin.configResolved).toBeInstanceOf(Function)
      expect(plugin.buildStart).toBeInstanceOf(Function)
      expect(plugin.buildEnd).toBeInstanceOf(Function)
    })

    it('应该在构建开始时收集初始指标', async () => {
      const plugin = optimizer.createVitePlugin()
      
      // Mock process.memoryUsage
      const originalMemoryUsage = process.memoryUsage
      process.memoryUsage = vi.fn().mockReturnValue({
        heapUsed: 100 * 1024 * 1024,
        heapTotal: 200 * 1024 * 1024,
        external: 50 * 1024 * 1024,
        rss: 300 * 1024 * 1024,
        arrayBuffers: 10 * 1024 * 1024
      })

      plugin.buildStart!()
      
      const metrics = optimizer.getMetrics()
      expect(metrics.memoryUsage).toBeDefined()
      expect(metrics.memoryUsage?.heapUsed).toBe(100 * 1024 * 1024)

      // Restore
      process.memoryUsage = originalMemoryUsage
    })

    it('应该记录构建时间', () => {
      const plugin = optimizer.createVitePlugin()
      
      // 模拟构建流程
      const config = {} as ResolvedConfig
      plugin.configResolved!(config)
      
      // 等待一小段时间
      const startTime = Date.now()
      plugin.buildEnd!()
      
      const metrics = optimizer.getMetrics()
      expect(metrics.buildTime).toBeDefined()
      expect(metrics.buildTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('代码分割', () => {
    it('应该正确应用 vendor 分割策略', () => {
      const vendorOptimizer = createPerformanceOptimizer({
        enableAutoSplitting: true,
        splitStrategy: 'vendor'
      })
      
      const plugin = vendorOptimizer.createVitePlugin()
      const mockConfig: any = {
        build: {
          rollupOptions: {}
        },
        server: {}
      }
      
      plugin.configResolved!(mockConfig as ResolvedConfig)
      
      // 验证 manualChunks 函数
      const { manualChunks } = mockConfig.build.rollupOptions.output
      expect(manualChunks).toBeInstanceOf(Function)
      
      // 测试分割逻辑
      expect(manualChunks('/node_modules/lodash/index.js')).toBe('lodash')
      expect(manualChunks('/node_modules/react/index.js')).toBe('react-vendor')
      expect(manualChunks('/node_modules/vue/index.js')).toBe('vue-vendor')
      expect(manualChunks('/node_modules/other/index.js')).toBe('vendor')
      expect(manualChunks('/src/components/Button.tsx')).toBeUndefined()
    })

    it('应该正确应用 modules 分割策略', () => {
      const modulesOptimizer = createPerformanceOptimizer({
        enableAutoSplitting: true,
        splitStrategy: 'modules'
      })
      
      const plugin = modulesOptimizer.createVitePlugin()
      const mockConfig: any = {
        build: {
          rollupOptions: {}
        },
        server: {}
      }
      
      plugin.configResolved!(mockConfig as ResolvedConfig)
      
      const { manualChunks } = mockConfig.build.rollupOptions.output
      
      // 测试模块分割
      expect(manualChunks('/src/components/Button.tsx')).toBe('components')
      expect(manualChunks('/src/utils/format.ts')).toBe('utils')
      expect(manualChunks('/src/stores/user.ts')).toBe('stores')
      expect(manualChunks('/src/services/api.ts')).toBe('services')
    })

    it('应该应用自定义分割规则', () => {
      const customOptimizer = createPerformanceOptimizer({
        enableAutoSplitting: true,
        splitStrategy: 'custom',
        customSplitRules: {
          'my-chunk': (id) => id.includes('my-special-module'),
          'vendor-react': (id) => id.includes('react') || id.includes('react-dom')
        }
      })
      
      const plugin = customOptimizer.createVitePlugin()
      const mockConfig: any = {
        build: {
          rollupOptions: {}
        },
        server: {}
      }
      
      plugin.configResolved!(mockConfig as ResolvedConfig)
      
      const { manualChunks } = mockConfig.build.rollupOptions.output
      
      expect(manualChunks('/node_modules/my-special-module/index.js')).toBe('my-chunk')
      expect(manualChunks('/node_modules/react/index.js')).toBe('vendor-react')
    })
  })

  describe('压缩优化', () => {
    it('应该配置压缩选项', () => {
      const plugin = optimizer.createVitePlugin()
      const mockConfig: any = {
        build: {},
        server: {}
      }
      
      plugin.configResolved!(mockConfig as ResolvedConfig)
      
      expect(mockConfig.build.minify).toBe('esbuild')
      expect(mockConfig.build.target).toBe('es2020')
      expect(mockConfig.build.cssMinify).toBe(true)
      expect(mockConfig.build.reportCompressedSize).toBe(true)
    })
  })

  describe('性能指标', () => {
    it('应该生成优化建议', async () => {
      const plugin = optimizer.createVitePlugin()
      
      // 模拟高内存使用
      const originalMemoryUsage = process.memoryUsage
      process.memoryUsage = vi.fn().mockReturnValue({
        heapUsed: 600 * 1024 * 1024,
        heapTotal: 800 * 1024 * 1024,
        external: 100 * 1024 * 1024,
        rss: 900 * 1024 * 1024,
        arrayBuffers: 50 * 1024 * 1024
      })

      plugin.buildStart!()
      await plugin.closeBundle!()
      
      const metrics = optimizer.getMetrics()
      expect(metrics.suggestions).toBeDefined()
      expect(metrics.suggestions).toContain('内存使用较高，建议优化依赖导入')

      // Restore
      process.memoryUsage = originalMemoryUsage
    })

    it('应该重置指标', () => {
      // 先设置一些指标
      const plugin = optimizer.createVitePlugin()
      plugin.buildStart!()
      plugin.buildEnd!()
      
      let metrics = optimizer.getMetrics()
      expect(metrics.buildTime).toBeDefined()
      
      // 重置
      optimizer.resetMetrics()
      metrics = optimizer.getMetrics()
      expect(metrics).toEqual({})
    })
  })

  describe('事件系统', () => {
    it('应该触发 report 事件', async () => {
      const reportHandler = vi.fn()
      optimizer.on('report', reportHandler)
      
      const plugin = optimizer.createVitePlugin()
      await plugin.closeBundle!()
      
      expect(reportHandler).toHaveBeenCalledWith(expect.objectContaining({
        suggestions: expect.any(Array)
      }))
    })
  })
})
