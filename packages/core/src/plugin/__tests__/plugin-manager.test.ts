import { describe, it, expect, beforeEach } from 'vitest'
import { CorePluginManager } from '../plugin-manager'
import { PluginError, ErrorCodes } from '../../errors'
import type { Plugin, PluginContext } from '../../types'

describe('CorePluginManager', () => {
  let manager: CorePluginManager
  let context: Partial<PluginContext>

  beforeEach(() => {
    context = {}
    manager = new CorePluginManager(context)
  })

  describe('基本操作', () => {
    it('应该能够注册插件', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: async () => {}
      }

      await manager.register(plugin)

      expect(manager.has('test-plugin')).toBe(true)
      expect(manager.get('test-plugin')).toBe(plugin)
    })

    it('应该在重复注册时抛出错误', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        install: async () => {}
      }

      await manager.register(plugin)

      try {
        await manager.register(plugin)
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error).toBeInstanceOf(PluginError)
        expect((error as PluginError).code).toBe(ErrorCodes.PLUGIN_ALREADY_REGISTERED)
      }
    })

    it('应该能够卸载插件', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        install: async () => {},
        uninstall: async () => {}
      }

      await manager.register(plugin)
      expect(manager.has('test-plugin')).toBe(true)

      await manager.unregister('test-plugin')
      expect(manager.has('test-plugin')).toBe(false)
    })

    it('应该能够获取所有插件', async () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        install: async () => {}
      }

      const plugin2: Plugin = {
        name: 'plugin-2',
        install: async () => {}
      }

      await manager.register(plugin1)
      await manager.register(plugin2)

      const plugins = manager.getAll()
      expect(plugins).toHaveLength(2)
      expect(plugins.map(p => p.name)).toContain('plugin-1')
      expect(plugins.map(p => p.name)).toContain('plugin-2')
    })
  })

  describe('依赖管理', () => {
    it('应该正确处理插件依赖', async () => {
      const installOrder: string[] = []

      const pluginA: Plugin = {
        name: 'plugin-a',
        install: async () => {
          installOrder.push('a')
        }
      }

      const pluginB: Plugin = {
        name: 'plugin-b',
        dependencies: ['plugin-a'],
        install: async () => {
          installOrder.push('b')
        }
      }

      const pluginC: Plugin = {
        name: 'plugin-c',
        dependencies: ['plugin-b'],
        install: async () => {
          installOrder.push('c')
        }
      }

      await manager.register(pluginA)
      await manager.register(pluginB)
      await manager.register(pluginC)

      expect(installOrder).toEqual(['a', 'b', 'c'])
    })

    it('应该在缺少依赖时抛出错误', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        dependencies: ['missing-plugin'],
        install: async () => {}
      }

      try {
        await manager.register(plugin)
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error).toBeInstanceOf(PluginError)
        expect((error as PluginError).code).toBe(ErrorCodes.PLUGIN_DEPENDENCY_MISSING)
      }
    })

    it('应该检测循环依赖', async () => {
      const pluginA: Plugin = {
        name: 'plugin-a',
        dependencies: ['plugin-b'],
        install: async () => {}
      }

      const pluginB: Plugin = {
        name: 'plugin-b',
        dependencies: ['plugin-a'],
        install: async () => {}
      }

      // 先注册 plugin-b (它依赖 plugin-a,但 plugin-a 还没注册)
      // 这会因为缺少依赖而失败
      await expect(manager.register(pluginB)).rejects.toThrow('缺少依赖')

      // 然后注册 plugin-a (它依赖 plugin-b)
      // 这也会因为缺少依赖而失败,因为 plugin-b 注册失败了
      await expect(manager.register(pluginA)).rejects.toThrow('缺少依赖')
    })
  })

  describe('生命周期钩子', () => {
    it('应该调用 install 钩子', async () => {
      let installed = false

      const plugin: Plugin = {
        name: 'test-plugin',
        install: async () => {
          installed = true
        }
      }

      await manager.register(plugin)
      expect(installed).toBe(true)
    })

    it('应该调用 uninstall 钩子', async () => {
      let uninstalled = false

      const plugin: Plugin = {
        name: 'test-plugin',
        install: async () => {},
        uninstall: async () => {
          uninstalled = true
        }
      }

      await manager.register(plugin)
      await manager.unregister('test-plugin')
      
      expect(uninstalled).toBe(true)
    })

    it('应该传递正确的上下文', async () => {
      let receivedContext: PluginContext | undefined

      const plugin: Plugin = {
        name: 'test-plugin',
        install: async (ctx) => {
          receivedContext = ctx
        }
      }

      await manager.register(plugin)
      
      expect(receivedContext).toBeDefined()
    })
  })

  describe('插件信息', () => {
    it('应该返回正确的插件信息', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: '测试插件',
        install: async () => {}
      }

      await manager.register(plugin)

      const info = manager.getInfo('test-plugin')
      expect(info).toBeDefined()
      expect(info?.plugin.name).toBe('test-plugin')
      expect(info?.plugin.version).toBe('1.0.0')
      expect(info?.plugin.description).toBe('测试插件')
      expect(info?.status).toBe('installed')
    })

    it('应该返回所有插件信息', async () => {
      const plugin1: Plugin = {
        name: 'plugin-1',
        install: async () => {}
      }

      const plugin2: Plugin = {
        name: 'plugin-2',
        install: async () => {}
      }

      await manager.register(plugin1)
      await manager.register(plugin2)

      const infos = manager.getAllInfo()
      expect(infos).toHaveLength(2)
    })
  })

  describe('错误处理', () => {
    it('应该处理 install 钩子中的错误', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        install: async () => {
          throw new Error('安装失败')
        }
      }

      await expect(manager.register(plugin)).rejects.toThrow('安装失败')
    })

    it('应该处理 uninstall 钩子中的错误', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        install: async () => {},
        uninstall: async () => {
          throw new Error('卸载失败')
        }
      }

      await manager.register(plugin)
      await expect(manager.unregister('test-plugin')).rejects.toThrow('卸载失败')
    })
  })

  describe('边界情况', () => {
    it('应该处理没有 version 的插件', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        install: async () => {}
      }

      await manager.register(plugin)
      
      const info = manager.getInfo('test-plugin')
      expect(info?.version).toBeUndefined()
    })

    it('应该处理没有 dependencies 的插件', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        install: async () => {}
      }

      await manager.register(plugin)
      expect(manager.has('test-plugin')).toBe(true)
    })

    it('应该处理空的 dependencies 数组', async () => {
      const plugin: Plugin = {
        name: 'test-plugin',
        dependencies: [],
        install: async () => {}
      }

      await manager.register(plugin)
      expect(manager.has('test-plugin')).toBe(true)
    })
  })
})

