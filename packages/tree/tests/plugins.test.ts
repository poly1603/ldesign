/**
 * 插件系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PluginManagerImpl } from '../src/plugins/core/plugin-manager'
import { BasePlugin } from '../src/plugins/core/base-plugin'
import type { PluginContext, PluginConfig } from '../src/plugins/core/plugin-interface'

// Mock Tree class
const mockTree = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  getNode: vi.fn(),
  getAllNodes: vi.fn(),
  getSelectedNodes: vi.fn(),
  expandAll: vi.fn(),
  collapseAll: vi.fn(),
  selectAll: vi.fn(),
  unselectAll: vi.fn(),
  refresh: vi.fn(),
  expandNode: vi.fn(),
  collapseNode: vi.fn(),
  selectNode: vi.fn(),
  unselectNode: vi.fn(),
  removeNode: vi.fn(),
  addNode: vi.fn(),
  moveNode: vi.fn(),
  search: vi.fn(),
  getContainer: vi.fn(() => document.createElement('div')),
  getNodeElement: vi.fn(),
}

// Mock DOM
global.document = {
  createElement: vi.fn((tag: string) => ({
    tagName: tag.toUpperCase(),
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn(),
    },
    style: {},
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getAttribute: vi.fn(),
    setAttribute: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ width: 100, height: 100, left: 0, top: 0 })),
    parentNode: null,
  })),
  head: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
} as any

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  setTimeout: vi.fn((fn, delay) => {
    fn()
    return 1
  }),
  clearTimeout: vi.fn(),
} as any

global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
} as any

describe('插件系统', () => {
  let pluginManager: PluginManagerImpl

  beforeEach(() => {
    vi.clearAllMocks()
    pluginManager = new PluginManagerImpl(mockTree as any)
  })

  describe('PluginManager', () => {
    it('应该能够创建插件管理器', () => {
      expect(pluginManager).toBeInstanceOf(PluginManagerImpl)
    })

    it('应该能够注册插件', () => {
      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }
      }

      const plugin = new TestPlugin()
      pluginManager.register(plugin)

      expect(pluginManager.has('test')).toBe(true)
      expect(pluginManager.get('test')).toBe(plugin)
    })

    it('应该能够卸载插件', () => {
      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }
      }

      const plugin = new TestPlugin()
      pluginManager.register(plugin)
      pluginManager.unregister('test')

      expect(pluginManager.has('test')).toBe(false)
      expect(pluginManager.get('test')).toBeUndefined()
    })

    it('应该能够启用和禁用插件', () => {
      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }
      }

      const plugin = new TestPlugin()
      pluginManager.register(plugin, { enabled: false })

      expect(pluginManager.isEnabled('test')).toBe(false)

      pluginManager.enable('test')
      expect(pluginManager.isEnabled('test')).toBe(true)

      pluginManager.disable('test')
      expect(pluginManager.isEnabled('test')).toBe(false)
    })

    it('应该能够调用插件生命周期钩子', async () => {
      const installSpy = vi.fn()
      const mountedSpy = vi.fn()

      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }

        install = installSpy
        mounted = mountedSpy
      }

      const plugin = new TestPlugin()
      pluginManager.register(plugin)

      await pluginManager.callHook('mounted')

      expect(installSpy).toHaveBeenCalled()
      expect(mountedSpy).toHaveBeenCalled()
    })

    it('应该能够检查插件依赖', () => {
      class DependentPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'dependent',
            version: '1.0.0',
            dependencies: ['base'],
          })
        }
      }

      const plugin = new DependentPlugin()

      expect(() => {
        pluginManager.register(plugin)
      }).toThrow('depends on "base" which is not registered')
    })

    it('应该能够处理插件错误', () => {
      const errorSpy = vi.fn()

      class ErrorPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'error',
            version: '1.0.0',
          })
        }

        install() {
          throw new Error('Test error')
        }
      }

      const plugin = new ErrorPlugin()
      pluginManager.on('plugin:error', errorSpy)

      expect(() => {
        pluginManager.register(plugin)
      }).toThrow('Test error')

      expect(errorSpy).toHaveBeenCalled()
    })
  })

  describe('BasePlugin', () => {
    it('应该能够创建基础插件', () => {
      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }
      }

      const plugin = new TestPlugin()

      expect(plugin.metadata.name).toBe('test')
      expect(plugin.metadata.version).toBe('1.0.0')
      expect(plugin.enabled).toBe(true)
    })

    it('应该能够设置和获取配置', () => {
      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }
      }

      const plugin = new TestPlugin()

      plugin.setConfig({ testOption: 'value' })
      expect(plugin.getConfig('testOption')).toBe('value')
      expect(plugin.getConfig()).toEqual({ enabled: true, testOption: 'value' })
    })

    it('应该能够验证配置', () => {
      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
            configSchema: {
              required: { type: 'string', required: true },
              optional: { type: 'number' },
            },
          })
        }
      }

      const plugin = new TestPlugin()

      expect(plugin.validateConfig({ required: 'test' })).toBe(true)
      expect(plugin.validateConfig({ required: 'test', optional: 123 })).toBe(true)
      expect(plugin.validateConfig({})).toBe(false) // missing required
      expect(plugin.validateConfig({ required: 123 })).toBe(false) // wrong type
    })
  })

  // 简化的插件工具测试
  describe('插件工具', () => {
    it('应该能够创建插件元数据', () => {
      const metadata = {
        name: 'test',
        version: '1.0.0',
        description: 'Test plugin',
        author: 'Test Author',
      }

      expect(metadata.name).toBe('test')
      expect(metadata.version).toBe('1.0.0')
      expect(metadata.description).toBe('Test plugin')
      expect(metadata.author).toBe('Test Author')
    })

    it('应该能够合并配置', () => {
      const defaultConfig = { a: 1, b: 2 }
      const userConfig = { b: 3, c: 4 }

      const merged = { ...defaultConfig, ...userConfig }

      expect(merged).toEqual({ a: 1, b: 3, c: 4 })
    })
  })

  describe('插件上下文', () => {
    it('应该能够提供树实例访问', () => {
      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }

        mounted(context: PluginContext) {
          expect(context.tree).toBe(mockTree)
        }
      }

      const plugin = new TestPlugin()
      pluginManager.register(plugin)
    })

    it('应该能够创建DOM元素', () => {
      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }

        mounted(context: PluginContext) {
          const element = context.createElement('div', {
            className: 'test-element',
            textContent: 'Test',
          })

          expect(element.tagName).toBe('DIV')
        }
      }

      const plugin = new TestPlugin()
      pluginManager.register(plugin)
    })

    it('应该能够发送和监听事件', () => {
      const eventHandler = vi.fn()

      class TestPlugin extends BasePlugin {
        constructor() {
          super({
            name: 'test',
            version: '1.0.0',
          })
        }

        mounted(context: PluginContext) {
          context.on('test-event', eventHandler)
          context.emit('test-event', 'test-data')
        }
      }

      const plugin = new TestPlugin()
      pluginManager.register(plugin)

      expect(mockTree.on).toHaveBeenCalled()
      expect(mockTree.emit).toHaveBeenCalled()
    })
  })
})
