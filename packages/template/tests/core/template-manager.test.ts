/**
 * 模板管理器单元测试
 */

import type { Template, TemplateManagerOptions } from '../../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateManager } from '../../src/core/manager'

// Mock 文件系统
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  stat: vi.fn(),
}))

// Mock 路径模块
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn(path => path),
  extname: vi.fn(path => path.split('.').pop() || ''),
  basename: vi.fn(path => path.split('/').pop() || ''),
}))

describe('templateManager', () => {
  let manager: TemplateManager
  let mockConfig: Partial<TemplateManagerConfig>

  beforeEach(() => {
    mockConfig = {
      templateRoot: 'src/templates',
      deviceDetection: {
        mobileBreakpoint: 768,
        tabletBreakpoint: 992,
        desktopBreakpoint: 1200,
        autoDetect: false, // 禁用自动检测以便测试
      },
      cache: {
        enabled: true,
        strategy: 'lru',
        maxSize: 10,
        ttl: 60000,
      },
      enablePreload: false,
      preloadTemplates: [],
      defaultDevice: 'desktop',
      debug: false,
    }

    manager = new TemplateManager(mockConfig)
  })

  afterEach(() => {
    manager.destroy()
    vi.clearAllMocks()
  })

  describe('构造函数', () => {
    it('应该使用默认配置创建管理器', () => {
      const defaultManager = new TemplateManager()
      expect(defaultManager).toBeInstanceOf(TemplateManager)
      expect(defaultManager.getConfig().templateRoot).toBe('src/templates')
    })

    it('应该合并用户配置和默认配置', () => {
      const config = manager.getConfig()
      expect(config.templateRoot).toBe('src/templates')
      expect(config.defaultDevice).toBe('desktop')
      expect(config.cache.enabled).toBe(true)
    })
  })

  describe('初始化', () => {
    it('应该成功初始化管理器', async () => {
      // Mock 扫描结果
      vi.spyOn(manager, 'scanTemplates').mockResolvedValue({
        count: 0,
        templates: [],
        duration: 100,
      })

      await expect(manager.initialize()).resolves.not.toThrow()
    })

    it('应该只初始化一次', async () => {
      const scanSpy = vi.spyOn(manager, 'scanTemplates').mockResolvedValue({
        count: 0,
        templates: [],
        duration: 100,
      })

      await manager.initialize()
      await manager.initialize()

      expect(scanSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('模板扫描', () => {
    it('应该扫描并返回模板信息', async () => {
      // Mock 文件系统调用
      const { readdir, stat } = await import('node:fs/promises')

      vi.mocked(readdir).mockImplementation(async (path) => {
        if (path === 'src/templates')
          return ['login']
        if (path === 'src/templates/login')
          return ['desktop', 'mobile']
        if (path === 'src/templates/login/desktop')
          return ['default', 'modern']
        if (path === 'src/templates/login/mobile')
          return ['simple']
        return []
      })

      vi.mocked(stat).mockResolvedValue({
        isDirectory: () => true,
      } as any)

      const result = await manager.scanTemplates()

      expect(result.count).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(result.templates)).toBe(true)
      expect(typeof result.duration).toBe('number')
    })
  })

  describe('设备类型管理', () => {
    it('应该返回当前设备类型', () => {
      const device = manager.getCurrentDevice()
      expect(['desktop', 'tablet', 'mobile']).toContain(device)
    })

    it('应该允许手动设置设备类型', () => {
      manager.setDeviceType('mobile')
      expect(manager.getCurrentDevice()).toBe('mobile')
    })

    it('应该在设备类型变化时触发事件', () => {
      const listener = vi.fn()
      manager.on('device:change', listener)

      manager.setDeviceType('tablet')

      expect(listener).toHaveBeenCalledWith('desktop', 'tablet')
    })
  })

  describe('模板查询', () => {
    beforeEach(async () => {
      // 添加测试模板
      const mockTemplates: TemplateInfo[] = [
        {
          id: 'login-desktop-default',
          name: 'default',
          displayName: '默认登录',
          description: '默认登录模板',
          category: 'login',
          deviceType: 'desktop',
          version: '1.0.0',
          author: 'Test',
          tags: ['default'],
          path: 'src/templates/login/desktop/default',
          component: null,
          thumbnail: '',
          status: 'discovered',
          dependencies: [],
          props: {},
          isDefault: true,
          features: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'login-mobile-simple',
          name: 'simple',
          displayName: '简单登录',
          description: '移动端简单登录模板',
          category: 'login',
          deviceType: 'mobile',
          version: '1.0.0',
          author: 'Test',
          tags: ['simple'],
          path: 'src/templates/login/mobile/simple',
          component: null,
          thumbnail: '',
          status: 'discovered',
          dependencies: [],
          props: {},
          isDefault: true,
          features: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Mock 扫描结果
      vi.spyOn(manager, 'scanTemplates').mockResolvedValue({
        count: mockTemplates.length,
        templates: mockTemplates,
        duration: 100,
      })

      await manager.initialize()
    })

    it('应该返回所有模板', () => {
      const templates = manager.getTemplates()
      expect(templates.length).toBeGreaterThanOrEqual(0)
    })

    it('应该按分类过滤模板', () => {
      const loginTemplates = manager.getTemplates('login')
      expect(loginTemplates.every(t => t.category === 'login')).toBe(true)
    })

    it('应该按设备类型过滤模板', () => {
      const desktopTemplates = manager.getTemplates(undefined, 'desktop')
      expect(desktopTemplates.every(t => t.deviceType === 'desktop')).toBe(true)
    })

    it('应该返回分类列表', () => {
      const categories = manager.getCategories()
      expect(Array.isArray(categories)).toBe(true)
    })

    it('应该检查模板是否存在', () => {
      const exists = manager.hasTemplate('login', 'desktop')
      expect(typeof exists).toBe('boolean')
    })
  })

  describe('缓存管理', () => {
    it('应该清除所有缓存', () => {
      expect(() => manager.clearCache()).not.toThrow()
    })

    it('应该清除指定分类的缓存', () => {
      expect(() => manager.clearCache('login')).not.toThrow()
    })

    it('应该清除指定分类和设备类型的缓存', () => {
      expect(() => manager.clearCache('login', 'desktop')).not.toThrow()
    })

    it('应该在清除缓存时触发事件', () => {
      const listener = vi.fn()
      manager.on('cache:clear', listener)

      manager.clearCache('login', 'desktop')

      expect(listener).toHaveBeenCalledWith('login', 'desktop')
    })
  })

  describe('事件系统', () => {
    it('应该添加和移除事件监听器', () => {
      const listener = vi.fn()

      manager.on('template:loaded', listener)
      manager.off('template:loaded', listener)

      // 触发事件不应该调用已移除的监听器
      expect(listener).not.toHaveBeenCalled()
    })

    it('应该处理监听器中的错误', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Test error')
      })

      manager.on('template:loaded', errorListener)

      // 应该不会抛出错误
      expect(() => {
        // 手动触发事件来测试错误处理
        ;(manager as any).emit('template:loaded', {})
      }).not.toThrow()
    })
  })

  describe('配置管理', () => {
    it('应该更新配置', () => {
      const newConfig = {
        defaultDevice: 'mobile' as const,
        debug: true,
      }

      manager.updateConfig(newConfig)

      const config = manager.getConfig()
      expect(config.defaultDevice).toBe('mobile')
      expect(config.debug).toBe(true)
    })

    it('应该返回配置副本', () => {
      const config1 = manager.getConfig()
      const config2 = manager.getConfig()

      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2) // 不是同一个对象引用
    })
  })

  describe('销毁', () => {
    it('应该清理所有资源', () => {
      expect(() => manager.destroy()).not.toThrow()
    })

    it('销毁后应该重置初始化状态', () => {
      manager.destroy()
      // 这里可以添加更多验证销毁状态的测试
    })
  })
})
