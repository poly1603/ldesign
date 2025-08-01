import type { Plugin, PluginManager } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPluginManager } from '../src/plugins/plugin-manager'

describe('pluginManager', () => {
  let pluginManager: PluginManager

  beforeEach(() => {
    pluginManager = createPluginManager()
  })

  describe('插件注册', () => {
    it('应该注册插件', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
      }

      pluginManager.register(plugin)

      expect(pluginManager.has('test-plugin')).toBe(true)
      expect(pluginManager.get('test-plugin')).toBe(plugin)
    })

    it('应该拒绝重复注册同名插件', () => {
      const plugin1: Plugin = {
        name: 'duplicate-plugin',
        version: '1.0.0',
        install: vi.fn(),
      }

      const plugin2: Plugin = {
        name: 'duplicate-plugin',
        version: '2.0.0',
        install: vi.fn(),
      }

      pluginManager.register(plugin1)

      expect(() => pluginManager.register(plugin2)).toThrow()
    })

    it('应该验证插件格式', () => {
      const invalidPlugin = {
        // 缺少 name
        version: '1.0.0',
        install: vi.fn(),
      } as Plugin

      expect(() => pluginManager.register(invalidPlugin)).toThrow()
    })
  })

  describe('插件依赖', () => {
    it('应该检查依赖是否满足', () => {
      const pluginA: Plugin = {
        name: 'plugin-a',
        version: '1.0.0',
        install: vi.fn(),
      }

      const pluginB: Plugin = {
        name: 'plugin-b',
        version: '1.0.0',
        dependencies: ['plugin-a'],
        install: vi.fn(),
      }

      pluginManager.register(pluginA)

      expect(pluginManager.checkDependencies(pluginB)).toBe(true)
    })

    it('应该检测缺失的依赖', () => {
      const plugin: Plugin = {
        name: 'plugin-with-deps',
        version: '1.0.0',
        dependencies: ['missing-plugin'],
        install: vi.fn(),
      }

      expect(pluginManager.checkDependencies(plugin)).toBe(false)
    })

    it('应该生成正确的加载顺序', () => {
      const pluginA: Plugin = {
        name: 'plugin-a',
        version: '1.0.0',
        install: vi.fn(),
      }

      const pluginB: Plugin = {
        name: 'plugin-b',
        version: '1.0.0',
        dependencies: ['plugin-a'],
        install: vi.fn(),
      }

      const pluginC: Plugin = {
        name: 'plugin-c',
        version: '1.0.0',
        dependencies: ['plugin-b'],
        install: vi.fn(),
      }

      pluginManager.register(pluginA)
      pluginManager.register(pluginB)
      pluginManager.register(pluginC)

      const order = pluginManager.getLoadOrder()
      const names = order.map(p => p.name)

      expect(names.indexOf('plugin-a')).toBeLessThan(names.indexOf('plugin-b'))
      expect(names.indexOf('plugin-b')).toBeLessThan(names.indexOf('plugin-c'))
    })

    it('应该检测循环依赖', () => {
      const pluginA: Plugin = {
        name: 'plugin-a',
        version: '1.0.0',
        dependencies: ['plugin-b'],
        install: vi.fn(),
      }

      const pluginB: Plugin = {
        name: 'plugin-b',
        version: '1.0.0',
        dependencies: ['plugin-a'],
        install: vi.fn(),
      }

      pluginManager.register(pluginA)
      pluginManager.register(pluginB)

      expect(() => pluginManager.getLoadOrder()).toThrow('循环依赖')
    })
  })

  describe('插件管理', () => {
    it('应该注销插件', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: vi.fn(),
        uninstall: vi.fn(),
      }

      pluginManager.register(plugin)
      expect(pluginManager.has('test-plugin')).toBe(true)

      pluginManager.unregister('test-plugin')
      expect(pluginManager.has('test-plugin')).toBe(false)
      expect(plugin.uninstall).toHaveBeenCalled()
    })

    it('应该获取所有插件', () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        version: '1.0.0',
        install: vi.fn(),
      }

      const plugin2: Plugin = {
        name: 'plugin-2',
        version: '1.0.0',
        install: vi.fn(),
      }

      pluginManager.register(plugin1)
      pluginManager.register(plugin2)

      const plugins = pluginManager.getAll()
      expect(plugins).toHaveLength(2)
      expect(plugins).toContain(plugin1)
      expect(plugins).toContain(plugin2)
    })

    it('应该获取插件统计信息', () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        version: '1.0.0',
        install: vi.fn(),
      }

      const plugin2: Plugin = {
        name: 'plugin-2',
        version: '1.0.0',
        dependencies: ['plugin-1'],
        install: vi.fn(),
      }

      pluginManager.register(plugin1)
      pluginManager.register(plugin2)

      const stats = pluginManager.getStats()
      expect(stats.total).toBe(2)
      expect(stats.withDependencies).toBe(1)
      expect(stats.withoutDependencies).toBe(1)
    })
  })

  describe('插件验证', () => {
    it('应该验证插件名称', () => {
      const plugin: Plugin = {
        name: '',
        version: '1.0.0',
        install: vi.fn(),
      }

      expect(() => pluginManager.register(plugin)).toThrow('插件名称不能为空')
    })

    it('应该验证插件版本', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '',
        install: vi.fn(),
      }

      expect(() => pluginManager.register(plugin)).toThrow('插件版本不能为空')
    })

    it('应该验证安装函数', () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        // 缺少 install 函数
      } as Plugin

      expect(() => pluginManager.register(plugin)).toThrow('插件必须提供install函数')
    })
  })

  describe('依赖图', () => {
    it('应该构建依赖图', () => {
      const pluginA: Plugin = {
        name: 'plugin-a',
        version: '1.0.0',
        install: vi.fn(),
      }

      const pluginB: Plugin = {
        name: 'plugin-b',
        version: '1.0.0',
        dependencies: ['plugin-a'],
        install: vi.fn(),
      }

      pluginManager.register(pluginA)
      pluginManager.register(pluginB)

      const graph = pluginManager.getDependencyGraph()

      expect(graph['plugin-a']).toEqual([])
      expect(graph['plugin-b']).toEqual(['plugin-a'])
    })

    it('应该验证依赖图的完整性', () => {
      const plugin: Plugin = {
        name: 'plugin-with-missing-dep',
        version: '1.0.0',
        dependencies: ['missing-plugin'],
        install: vi.fn(),
      }

      pluginManager.register(plugin)

      expect(() => pluginManager.validateDependencies()).toThrow('依赖项不存在')
    })
  })

  describe('插件元数据', () => {
    it('应该存储插件描述', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        install: vi.fn(),
      }

      pluginManager.register(plugin)

      const registered = pluginManager.get('test-plugin')
      expect(registered?.description).toBe('A test plugin')
    })

    it('应该存储插件作者信息', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        author: 'Test Author',
        install: vi.fn(),
      }

      pluginManager.register(plugin)

      const registered = pluginManager.get('test-plugin')
      expect(registered?.author).toBe('Test Author')
    })

    it('应该存储插件关键词', () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        keywords: ['test', 'plugin', 'vue'],
        install: vi.fn(),
      }

      pluginManager.register(plugin)

      const registered = pluginManager.get('test-plugin')
      expect(registered?.keywords).toEqual(['test', 'plugin', 'vue'])
    })
  })
})
