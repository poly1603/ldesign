/**
 * 工厂函数测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createTemplateScanner,
  createSimpleTemplateScanner,
  createCacheConfig,
  createDeviceConfig,
} from '../../src/utils/factory'
import type { TemplateSystemConfig } from '../../src/types/config'

describe('Factory Functions', () => {
  describe('createTemplateScanner', () => {
    it('should create template scanner with default config', () => {
      const config: TemplateSystemConfig = {
        templatesDir: 'src/templates',
        autoScan: true,
        enableHMR: false,
        defaultDevice: 'desktop',
        debug: false,
        enablePerformanceMonitor: false,
        scanner: {
          enableCache: true,
          maxDepth: 5,
          includeExtensions: ['.vue'],
          excludePatterns: ['node_modules'],
          watchMode: false,
          debounceDelay: 300,
          batchSize: 10,
        },
        cache: {
          enabled: true,
          strategy: 'lru',
          maxSize: 50,
          ttl: 0,
          checkPeriod: 60000,
        },
        deviceDetection: {
          breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200,
          },
          debounceDelay: 100,
          enableResize: true,
          enableOrientation: true,
        },
        preload: {
          enabled: true,
          mode: 'lazy',
          maxConcurrent: 3,
          delayMs: 100,
          priority: [],
        },
        performance: {
          enableLazyLoading: true,
          enableVirtualScroll: false,
          chunkSize: 20,
          enableMetrics: false,
          metricsInterval: 5000,
        },
        errorHandling: {
          enableGlobalHandler: true,
          enableReporting: false,
          maxRetries: 3,
          retryDelay: 1000,
        },
        devtools: {
          enabled: false,
          enableInspector: false,
          enableLogger: false,
          logLevel: 'info',
          enableTimeline: false,
        },
      }

      const scanner = createTemplateScanner(config)
      expect(scanner).toBeDefined()
      expect(scanner.constructor.name).toBe('TemplateScanner')
    })

    it('should create template scanner with custom callbacks', () => {
      const config: TemplateSystemConfig = {
        templatesDir: 'src/templates',
        autoScan: true,
        enableHMR: false,
        defaultDevice: 'desktop',
        debug: true,
        enablePerformanceMonitor: true,
        scanner: {
          enableCache: true,
          maxDepth: 5,
          includeExtensions: ['.vue'],
          excludePatterns: ['node_modules'],
          watchMode: false,
          debounceDelay: 300,
          batchSize: 10,
        },
        cache: {
          enabled: true,
          strategy: 'lru',
          maxSize: 50,
          ttl: 0,
          checkPeriod: 60000,
        },
        deviceDetection: {
          breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200,
          },
          debounceDelay: 100,
          enableResize: true,
          enableOrientation: true,
        },
        preload: {
          enabled: true,
          mode: 'lazy',
          maxConcurrent: 3,
          delayMs: 100,
          priority: [],
        },
        performance: {
          enableLazyLoading: true,
          enableVirtualScroll: false,
          chunkSize: 20,
          enableMetrics: false,
          metricsInterval: 5000,
        },
        errorHandling: {
          enableGlobalHandler: true,
          enableReporting: false,
          maxRetries: 3,
          retryDelay: 1000,
        },
        devtools: {
          enabled: true,
          enableInspector: false,
          enableLogger: true,
          logLevel: 'info',
          enableTimeline: false,
        },
      }

      const onScanComplete = vi.fn()
      const onScanError = vi.fn()

      const scanner = createTemplateScanner(config, {
        onScanComplete,
        onScanError,
      })

      expect(scanner).toBeDefined()
      expect(onScanComplete).not.toHaveBeenCalled()
      expect(onScanError).not.toHaveBeenCalled()
    })
  })

  describe('createSimpleTemplateScanner', () => {
    it('should create simple template scanner with defaults', () => {
      const scanner = createSimpleTemplateScanner('src/templates')
      expect(scanner).toBeDefined()
      expect(scanner.constructor.name).toBe('TemplateScanner')
    })

    it('should create simple template scanner with custom options', () => {
      const scanner = createSimpleTemplateScanner(
        'custom/templates',
        false,
        false,
      )
      expect(scanner).toBeDefined()
    })
  })

  describe('createCacheConfig', () => {
    it('should create cache config with defaults', () => {
      const config = createCacheConfig()
      expect(config).toEqual({
        enabled: true,
        strategy: 'lru',
        maxSize: 50,
        ttl: 0,
        checkPeriod: 5 * 60 * 1000,
      })
    })

    it('should create cache config with custom values', () => {
      const config = createCacheConfig(false, 'fifo', 100, 60000, 120000)
      expect(config).toEqual({
        enabled: false,
        strategy: 'fifo',
        maxSize: 100,
        ttl: 60000,
        checkPeriod: 120000,
      })
    })
  })

  describe('createDeviceConfig', () => {
    it('should create device config with defaults', () => {
      const config = createDeviceConfig()
      expect(config).toEqual({
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1200,
        },
      })
    })

    it('should create device config with custom breakpoints', () => {
      const config = createDeviceConfig(480, 768, 1024)
      expect(config).toEqual({
        breakpoints: {
          mobile: 480,
          tablet: 768,
          desktop: 1024,
        },
      })
    })
  })
})
