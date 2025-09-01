/**
 * 设备模板解析器测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateRouteResolver } from '../../src/device/template'

// Mock @ldesign/template 包
vi.mock('@ldesign/template', () => ({
  TemplateScanner: vi.fn().mockImplementation(() => ({
    scanTemplates: vi.fn().mockResolvedValue({ count: 0, templates: [], duration: 0 }),
    render: vi.fn(),
    hasTemplate: vi.fn(),
    getTemplates: vi.fn(),
    destroy: vi.fn(),
  })),
  createTemplateManager: vi.fn(),
  TemplateManager: vi.fn(),
}))

describe('templateRouteResolver', () => {
  let resolver: TemplateRouteResolver

  beforeEach(() => {
    vi.clearAllMocks()
    resolver = new TemplateRouteResolver({
      defaultCategory: 'pages',
      templateRoot: 'src/templates',
      enableCache: true,
      timeout: 10000,
    })
  })

  describe('构造函数', () => {
    it('应该使用默认配置', () => {
      const defaultResolver = new TemplateRouteResolver()
      expect(defaultResolver).toBeDefined()
    })

    it('应该合并自定义配置', () => {
      const customResolver = new TemplateRouteResolver({
        defaultCategory: 'custom',
        templateRoot: 'custom/templates',
        enableCache: false,
        timeout: 5000,
        autoScan: false,
        enableHMR: true,
        defaultDevice: 'mobile',
        enablePerformanceMonitor: true,
        debug: true,
      })
      expect(customResolver).toBeDefined()
    })
  })

  describe('resolveTemplate', () => {
    it('应该成功解析模板', async () => {
      const mockComponent = { template: '<div>Test Component</div>' }

      // Mock 模板管理器
      const mockManager = {
        render: vi.fn().mockResolvedValue({ component: mockComponent }),
        scanTemplates: vi.fn().mockResolvedValue({ count: 1, templates: [], duration: 0 }),
        destroy: vi.fn(),
      }

      // Mock 动态导入
      vi.doMock('@ldesign/template', () => ({
        TemplateScanner: vi.fn().mockImplementation(() => mockManager),
      }))

      const component = await resolver.resolveTemplate('pages', 'home', 'desktop')
      expect(component).toBe(mockComponent)
    })

    it('应该处理模板加载失败', async () => {
      const mockManager = {
        render: vi.fn().mockRejectedValue(new Error('Template not found')),
        scanTemplates: vi.fn().mockResolvedValue({ count: 0, templates: [], duration: 0 }),
        destroy: vi.fn(),
      }

      vi.doMock('@ldesign/template', () => ({
        TemplateScanner: vi.fn().mockImplementation(() => mockManager),
      }))

      const component = await resolver.resolveTemplate('pages', 'nonexistent', 'desktop')

      // 应该返回错误组件
      expect(component).toBeDefined()
      expect(typeof component).toBe('object')
    })

    it('应该回退到桌面版本', async () => {
      const mockDesktopComponent = { template: '<div>Desktop Component</div>' }

      const mockManager = {
        render: vi.fn()
          .mockRejectedValueOnce(new Error('Mobile template not found'))
          .mockResolvedValueOnce({ component: mockDesktopComponent }),
        scanTemplates: vi.fn().mockResolvedValue({ count: 1, templates: [], duration: 0 }),
        destroy: vi.fn(),
      }

      vi.doMock('@ldesign/template', () => ({
        TemplateScanner: vi.fn().mockImplementation(() => mockManager),
      }))

      const component = await resolver.resolveTemplate('pages', 'home', 'mobile')
      expect(component).toBe(mockDesktopComponent)
    })
  })

  describe('hasTemplate', () => {
    it('应该检查模板是否存在', async () => {
      const mockManager = {
        hasTemplate: vi.fn().mockReturnValue(true),
        scanTemplates: vi.fn().mockResolvedValue({ count: 1, templates: [], duration: 0 }),
        destroy: vi.fn(),
      }

      vi.doMock('@ldesign/template', () => ({
        TemplateScanner: vi.fn().mockImplementation(() => mockManager),
      }))

      const exists = await resolver.hasTemplate('pages', 'home', 'desktop')
      expect(exists).toBe(true)
    })

    it('应该处理检查失败', async () => {
      const mockManager = {
        hasTemplate: vi.fn().mockImplementation(() => {
          throw new Error('Check failed')
        }),
        scanTemplates: vi.fn().mockResolvedValue({ count: 0, templates: [], duration: 0 }),
        destroy: vi.fn(),
      }

      vi.doMock('@ldesign/template', () => ({
        TemplateScanner: vi.fn().mockImplementation(() => mockManager),
      }))

      const exists = await resolver.hasTemplate('pages', 'home', 'desktop')
      expect(exists).toBe(false)
    })
  })

  describe('getAvailableTemplates', () => {
    it('应该返回可用模板列表', async () => {
      const mockTemplates = [
        { name: 'home', category: 'pages', device: 'desktop' },
        { name: 'about', category: 'pages', device: 'desktop' },
      ]

      const mockManager = {
        getTemplates: vi.fn().mockReturnValue(mockTemplates),
        scanTemplates: vi.fn().mockResolvedValue({ count: 2, templates: mockTemplates, duration: 0 }),
        destroy: vi.fn(),
      }

      vi.doMock('@ldesign/template', () => ({
        TemplateScanner: vi.fn().mockImplementation(() => mockManager),
      }))

      const templates = await resolver.getAvailableTemplates('pages', 'desktop')
      expect(templates).toEqual(['home', 'about'])
    })

    it('应该处理获取失败', async () => {
      const mockManager = {
        getTemplates: vi.fn().mockImplementation(() => {
          throw new Error('Get templates failed')
        }),
        scanTemplates: vi.fn().mockResolvedValue({ count: 0, templates: [], duration: 0 }),
        destroy: vi.fn(),
      }

      vi.doMock('@ldesign/template', () => ({
        TemplateScanner: vi.fn().mockImplementation(() => mockManager),
      }))

      const templates = await resolver.getAvailableTemplates('pages', 'desktop')
      expect(templates).toEqual([])
    })
  })

  describe('destroy', () => {
    it('应该清理资源', () => {
      expect(() => resolver.destroy()).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该处理模板管理器初始化失败', async () => {
      // 创建一个新的解析器实例来测试错误情况
      const errorResolver = new TemplateRouteResolver()

      // Mock 动态导入失败
      vi.doMock('@ldesign/template', () => {
        throw new Error('Import failed')
      })

      // 应该抛出错误
      await expect(errorResolver.resolveTemplate('pages', 'home', 'desktop'))
        .rejects
        .toThrow('Template system not available')
    })
  })
})
