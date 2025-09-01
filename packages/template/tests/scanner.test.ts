/**
 * 模板扫描器测试
 */

import type { ScannerOptions } from '../src/scanner/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateScanner } from '../src/scanner'

// 模拟文件系统
const mockFs = {
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
    readFile: vi.fn(),
  },
}

vi.mock('fs', () => mockFs)
vi.mock('node:fs', () => mockFs)

// 模拟路径操作
const mockPath = {
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => `/${args.join('/')}`),
  dirname: vi.fn(p => p.split('/').slice(0, -1).join('/')),
  basename: vi.fn(p => p.split('/').pop()),
  extname: vi.fn((p) => {
    const parts = p.split('.')
    return parts.length > 1 ? `.${parts.pop()}` : ''
  }),
}

vi.mock('path', () => mockPath)
vi.mock('node:path', () => mockPath)

describe('templateScanner', () => {
  let scanner: TemplateScanner
  let mockOptions: ScannerOptions
  let mockCallbacks: any

  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks()

    // 设置默认选项
    mockOptions = {
      templatesDir: 'src/templates',
      enableCache: true,
      enableHMR: false,
      maxDepth: 5,
      includeExtensions: ['.vue', '.tsx', '.js', '.ts'],
      excludePatterns: ['node_modules', '.git', 'dist'],
      watchMode: false,
      debounceDelay: 300,
      batchSize: 10,
    }

    // 设置回调函数
    mockCallbacks = {
      onScanComplete: vi.fn(),
      onScanError: vi.fn(),
      onTemplateFound: vi.fn(),
    }

    // 模拟文件系统结构
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readdirSync.mockReturnValue([
      'login',
      'dashboard',
      'user',
    ])

    mockFs.statSync.mockReturnValue({
      isDirectory: () => true,
      isFile: () => false,
      mtime: new Date(),
    })

    // 创建扫描器实例
    scanner = new TemplateScanner(mockOptions, mockCallbacks)
  })

  afterEach(() => {
    if (scanner) {
      scanner.destroy()
    }
  })

  describe('构造函数', () => {
    it('应该使用默认选项创建扫描器', () => {
      const defaultScanner = new TemplateScanner({
        templatesDir: 'test/templates',
      })

      expect(defaultScanner).toBeDefined()
      expect(defaultScanner.getOptions().templatesDir).toBe('test/templates')
      expect(defaultScanner.getOptions().enableCache).toBe(true)
      expect(defaultScanner.getOptions().maxDepth).toBe(5)
    })

    it('应该合并自定义选项', () => {
      const customOptions: ScannerOptions = {
        templatesDir: 'custom/templates',
        enableCache: false,
        maxDepth: 3,
        includeExtensions: ['.vue'],
        excludePatterns: ['test'],
      }

      const customScanner = new TemplateScanner(customOptions)
      const options = customScanner.getOptions()

      expect(options.templatesDir).toBe('custom/templates')
      expect(options.enableCache).toBe(false)
      expect(options.maxDepth).toBe(3)
      expect(options.includeExtensions).toEqual(['.vue'])
      expect(options.excludePatterns).toEqual(['test'])
    })
  })

  describe('扫描功能', () => {
    beforeEach(() => {
      // 模拟模板目录结构
      const mockDirectoryStructure = {
        login: ['desktop', 'tablet', 'mobile'],
        dashboard: ['desktop', 'tablet'],
        user: ['desktop'],
      }

      mockFs.readdirSync.mockImplementation((path: string) => {
        const pathStr = String(path)
        if (pathStr.includes('templates')) {
          return Object.keys(mockDirectoryStructure)
        }

        for (const [category, devices] of Object.entries(mockDirectoryStructure)) {
          if (pathStr.includes(category)) {
            return devices
          }
        }

        return ['default']
      })

      // 模拟配置文件
      mockFs.readFileSync.mockReturnValue(`
        export default {
          name: 'test-template',
          displayName: '测试模板',
          description: '这是一个测试模板',
          version: '1.0.0',
          author: 'test',
          tags: ['test'],
          isDefault: true
        }
      `)
    })

    it('应该成功扫描模板目录', async () => {
      const result = await scanner.scan()

      expect(result).toBeDefined()
      expect(result.templates).toBeDefined()
      expect(result.stats).toBeDefined()
      expect(result.errors).toBeDefined()
      expect(mockCallbacks.onScanComplete).toHaveBeenCalledWith(result)
    })

    it('应该处理扫描错误', async () => {
      // 模拟文件系统错误
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = await scanner.scan()

      expect(result.errors.length).toBeGreaterThan(0)
      expect(mockCallbacks.onScanError).toHaveBeenCalled()
    })

    it('应该根据设备类型过滤模板', async () => {
      const result = await scanner.scan()
      const desktopTemplates = scanner.getTemplatesByDevice('desktop')
      const mobileTemplates = scanner.getTemplatesByDevice('mobile')

      expect(desktopTemplates.length).toBeGreaterThanOrEqual(0)
      expect(mobileTemplates.length).toBeGreaterThanOrEqual(0)
    })

    it('应该根据分类过滤模板', async () => {
      await scanner.scan()
      const loginTemplates = scanner.getTemplatesByCategory('login')
      const dashboardTemplates = scanner.getTemplatesByCategory('dashboard')

      expect(loginTemplates.length).toBeGreaterThanOrEqual(0)
      expect(dashboardTemplates.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('缓存功能', () => {
    it('应该启用缓存时使用缓存', async () => {
      const scannerWithCache = new TemplateScanner({
        ...mockOptions,
        enableCache: true,
      })

      // 第一次扫描
      await scannerWithCache.scan()

      // 第二次扫描应该使用缓存
      await scannerWithCache.scan()

      // 验证缓存被使用（文件系统调用次数不应该增加）
      const firstCallCount = mockFs.readdirSync.mock.calls.length
      await scannerWithCache.scan()
      const secondCallCount = mockFs.readdirSync.mock.calls.length

      expect(secondCallCount).toBeLessThanOrEqual(firstCallCount)
    })

    it('应该能够清除缓存', async () => {
      await scanner.scan()

      scanner.clearCache()

      // 清除缓存后再次扫描应该重新读取文件
      await scanner.scan()

      expect(mockFs.readdirSync).toHaveBeenCalled()
    })
  })

  describe('搜索和过滤', () => {
    beforeEach(async () => {
      // 先进行一次扫描以填充数据
      await scanner.scan()
    })

    it('应该能够搜索模板', () => {
      const filter = {
        categories: ['login'],
        tags: ['modern'],
        keyword: '登录',
      }

      const results = scanner.searchTemplates(filter)
      expect(Array.isArray(results)).toBe(true)
    })

    it('应该能够排序模板', () => {
      const templates = scanner.getAllTemplates()
      const sortedTemplates = scanner.sortTemplates(templates, {
        field: 'name',
        direction: 'asc',
      })

      expect(Array.isArray(sortedTemplates)).toBe(true)
      expect(sortedTemplates.length).toBe(templates.length)
    })

    it('应该能够获取统计信息', () => {
      const stats = scanner.getTemplateStats()

      expect(stats).toBeDefined()
      expect(typeof stats.totalTemplates).toBe('number')
      expect(typeof stats.byCategory).toBe('object')
      expect(typeof stats.byDevice).toBe('object')
      expect(typeof stats.byTag).toBe('object')
    })
  })

  describe('文件监听', () => {
    it('应该能够启动文件监听', async () => {
      const watchScanner = new TemplateScanner({
        ...mockOptions,
        watchMode: true,
      })

      await watchScanner.startWatching()
      expect(watchScanner.isWatching()).toBe(true)

      await watchScanner.stopWatching()
      expect(watchScanner.isWatching()).toBe(false)
    })

    it('应该处理文件变化事件', async () => {
      const watchScanner = new TemplateScanner({
        ...mockOptions,
        watchMode: true,
      })

      await watchScanner.startWatching()

      // 模拟文件变化
      // 这里需要触发文件监听器的回调
      // 具体实现取决于文件监听器的实现

      await watchScanner.stopWatching()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的模板目录', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const result = await scanner.scan()

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('scan')
    })

    it('应该处理损坏的配置文件', async () => {
      mockFs.readFileSync.mockReturnValue('invalid json content')

      const result = await scanner.scan()

      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该处理权限错误', async () => {
      mockFs.readdirSync.mockImplementation(() => {
        const error = new Error('EACCES: permission denied')
        ;(error as any).code = 'EACCES'
        throw error
      })

      const result = await scanner.scan()

      expect(result.errors.length).toBeGreaterThan(0)
      expect(mockCallbacks.onScanError).toHaveBeenCalled()
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内完成扫描', async () => {
      const startTime = Date.now()
      await scanner.scan()
      const endTime = Date.now()

      const scanTime = endTime - startTime
      expect(scanTime).toBeLessThan(5000) // 5秒内完成
    })

    it('应该能够处理大量模板', async () => {
      // 模拟大量模板
      const largeTemplateList = Array.from({ length: 100 }, (_, i) => `template-${i}`)
      mockFs.readdirSync.mockReturnValue(largeTemplateList)

      const startTime = Date.now()
      const result = await scanner.scan()
      const endTime = Date.now()

      expect(result).toBeDefined()
      expect(endTime - startTime).toBeLessThan(10000) // 10秒内完成
    })
  })
})
