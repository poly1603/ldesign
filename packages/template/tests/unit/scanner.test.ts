/**
 * 模板扫描器单元测试
 */

import type { TemplateConfig } from '@/types/template'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateScanner } from '@/scanner'

// Mock import.meta.glob
const mockGlob = vi.fn()
vi.stubGlobal('import', {
  meta: {
    glob: mockGlob,
  },
})

describe('templateScanner', () => {
  let scanner: TemplateScanner

  beforeEach(() => {
    vi.clearAllMocks()
    scanner = new TemplateScanner({
      templatesDir: 'src/templates',
      enableCache: true,
      enableHMR: false,
    })
  })

  describe('构造函数', () => {
    it('应该使用默认配置创建扫描器', () => {
      const defaultScanner = new TemplateScanner({
        templatesDir: 'src/templates',
      })
      expect(defaultScanner).toBeDefined()
    })

    it('应该使用自定义配置创建扫描器', () => {
      const customScanner = new TemplateScanner({
        templatesDir: 'custom/templates',
        enableCache: false,
        enableHMR: true,
        maxDepth: 10,
      })
      expect(customScanner).toBeDefined()
    })
  })

  describe('scan', () => {
    it('应该成功扫描模板配置', async () => {
      // Mock 配置文件
      const mockConfig: TemplateConfig = {
        name: 'test-template',
        displayName: '测试模板',
        description: '这是一个测试模板',
        version: '1.0.0',
        isDefault: true,
        author: 'Test Author',
        tags: ['test', 'demo'],
      }

      mockGlob.mockReturnValue({
        '/src/templates/login/desktop/default/config.js': () => Promise.resolve({ default: mockConfig }),
      })

      const result = await scanner.scan()

      expect(result.templates).toBeDefined()
      expect(result.stats.totalTemplates).toBe(1)
      expect(result.errors).toHaveLength(0)
    })

    it('应该处理配置文件解析错误', async () => {
      mockGlob.mockReturnValue({
        '/src/templates/login/desktop/default/config.js': () => Promise.reject(new Error('Parse error')),
      })

      const result = await scanner.scan()

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('CONFIG_PARSE_ERROR')
    })

    it('应该验证模板配置的必需字段', async () => {
      const invalidConfig = {
        name: 'test-template',
        // 缺少必需字段
      }

      mockGlob.mockReturnValue({
        '/src/templates/login/desktop/default/config.js': () => Promise.resolve({ default: invalidConfig }),
      })

      const result = await scanner.scan()

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('CONFIG_PARSE_ERROR')
    })

    it('应该正确解析路径结构', async () => {
      const mockConfig: TemplateConfig = {
        name: 'modern-template',
        displayName: '现代模板',
        description: '现代风格的模板',
        version: '2.0.0',
      }

      mockGlob.mockReturnValue({
        '/src/templates/dashboard/tablet/modern/config.js': () => Promise.resolve({ default: mockConfig }),
      })

      const result = await scanner.scan()

      expect(result.templates.has('dashboard')).toBe(true)
      expect(result.templates.get('dashboard')?.has('tablet')).toBe(true)
      expect(result.templates.get('dashboard')?.get('tablet')?.has('modern-template')).toBe(true)
    })

    it('应该计算正确的统计信息', async () => {
      const mockConfigs = [
        {
          path: '/src/templates/login/desktop/default/config.js',
          config: {
            name: 'default-login',
            displayName: '默认登录',
            description: '默认登录模板',
            version: '1.0.0',
          },
        },
        {
          path: '/src/templates/login/mobile/default/config.js',
          config: {
            name: 'mobile-login',
            displayName: '移动登录',
            description: '移动端登录模板',
            version: '1.0.0',
          },
        },
        {
          path: '/src/templates/dashboard/desktop/admin/config.js',
          config: {
            name: 'admin-dashboard',
            displayName: '管理面板',
            description: '管理员面板模板',
            version: '1.0.0',
          },
        },
      ]

      const mockGlobResult: Record<string, () => Promise<any>> = {}
      mockConfigs.forEach(({ path, config }) => {
        mockGlobResult[path] = () => Promise.resolve({ default: config })
      })

      mockGlob.mockReturnValue(mockGlobResult)

      const result = await scanner.scan()

      expect(result.stats.totalTemplates).toBe(3)
      expect(result.stats.byCategory.login).toBe(2)
      expect(result.stats.byCategory.dashboard).toBe(1)
      expect(result.stats.byDevice.desktop).toBe(2)
      expect(result.stats.byDevice.mobile).toBe(1)
    })
  })

  describe('getTemplates', () => {
    beforeEach(async () => {
      const mockConfig: TemplateConfig = {
        name: 'test-template',
        displayName: '测试模板',
        description: '这是一个测试模板',
        version: '1.0.0',
      }

      mockGlob.mockReturnValue({
        '/src/templates/login/desktop/test/config.js': () => Promise.resolve({ default: mockConfig }),
      })

      await scanner.scan()
    })

    it('应该返回指定分类和设备的模板列表', () => {
      const templates = scanner.getTemplates('login', 'desktop')
      expect(templates).toHaveLength(1)
      expect(templates[0].name).toBe('test-template')
    })

    it('应该返回空数组当分类不存在时', () => {
      const templates = scanner.getTemplates('nonexistent', 'desktop')
      expect(templates).toHaveLength(0)
    })

    it('应该返回空数组当设备类型不存在时', () => {
      const templates = scanner.getTemplates('login', 'tablet')
      expect(templates).toHaveLength(0)
    })
  })

  describe('getTemplate', () => {
    beforeEach(async () => {
      const mockConfig: TemplateConfig = {
        name: 'specific-template',
        displayName: '特定模板',
        description: '特定的测试模板',
        version: '1.0.0',
      }

      mockGlob.mockReturnValue({
        '/src/templates/profile/mobile/specific/config.js': () => Promise.resolve({ default: mockConfig }),
      })

      await scanner.scan()
    })

    it('应该返回指定的模板', () => {
      const template = scanner.getTemplate('profile', 'mobile', 'specific-template')
      expect(template).toBeDefined()
      expect(template?.name).toBe('specific-template')
    })

    it('应该返回null当模板不存在时', () => {
      const template = scanner.getTemplate('profile', 'mobile', 'nonexistent')
      expect(template).toBeNull()
    })
  })

  describe('clearCache', () => {
    it('应该清除扫描缓存', () => {
      scanner.clearCache()
      // 由于缓存是私有的，我们只能确保方法不抛出错误
      expect(true).toBe(true)
    })
  })
})
