/**
 * PluginManager 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PluginManager } from '../../src/core/plugin-manager'
import { BasePlugin } from '../../src/core/base-plugin'
import { VideoPlayer } from '../../src/core/player'
import { createMockContainer, cleanup } from '../setup'

// 测试插件类
class TestPlugin extends BasePlugin {
  constructor(options = {}) {
    super({
      name: 'test',
      version: '1.0.0',
      description: 'Test plugin'
    }, options)
  }

  async onInstall(context: any) {
    this.context = context
  }

  async onUninstall() {
    this.context = null
  }

  async onEnable() {
    this.enabled = true
  }

  async onDisable() {
    this.enabled = false
  }
}

class AnotherTestPlugin extends BasePlugin {
  constructor(options = {}) {
    super({
      name: 'another',
      version: '1.0.0',
      description: 'Another test plugin'
    }, options)
  }

  async onInstall(context: any) {
    this.context = context
  }

  async onUninstall() {
    this.context = null
  }

  async onEnable() {
    this.enabled = true
  }

  async onDisable() {
    this.enabled = false
  }
}

describe('PluginManager', () => {
  let container: HTMLElement
  let player: VideoPlayer
  let pluginManager: PluginManager

  beforeEach(async () => {
    container = createMockContainer()
    player = new VideoPlayer({
      container,
      src: 'test-video.mp4'
    })
    await player.initialize()
    pluginManager = new PluginManager(player)
  })

  afterEach(() => {
    if (player) {
      player.destroy()
    }
    cleanup()
  })

  describe('构造函数', () => {
    it('应该正确创建插件管理器实例', () => {
      expect(pluginManager).toBeInstanceOf(PluginManager)
      expect(pluginManager.player).toBe(player)
    })
  })

  describe('插件注册', () => {
    it('应该能够注册插件', async () => {
      const plugin = new TestPlugin()

      await pluginManager.register(plugin)

      expect(pluginManager.has('test')).toBe(true)
      expect(pluginManager.get('test')).toBe(plugin)
    })

    it('应该在注册时调用插件的onInstall方法', async () => {
      const plugin = new TestPlugin()
      const installSpy = vi.spyOn(plugin, 'onInstall')

      await pluginManager.register(plugin)

      expect(installSpy).toHaveBeenCalledWith({
        player,
        pluginManager
      })
    })

    it('应该抛出错误当插件名称重复时', async () => {
      const plugin1 = new TestPlugin()
      const plugin2 = new TestPlugin()

      await pluginManager.register(plugin1)

      await expect(pluginManager.register(plugin2)).rejects.toThrow(
        'Plugin "test" is already registered'
      )
    })

    it('应该能够注册多个插件', async () => {
      const plugin1 = new TestPlugin()
      const plugin2 = new AnotherTestPlugin()

      await pluginManager.register(plugin1)
      await pluginManager.register(plugin2)

      expect(pluginManager.has('test')).toBe(true)
      expect(pluginManager.has('another')).toBe(true)
    })
  })

  describe('插件卸载', () => {
    it('应该能够卸载插件', async () => {
      const plugin = new TestPlugin()

      await pluginManager.register(plugin)
      await pluginManager.unregister('test')

      expect(pluginManager.has('test')).toBe(false)
    })

    it('应该在卸载时调用插件的onUninstall方法', async () => {
      const plugin = new TestPlugin()
      const uninstallSpy = vi.spyOn(plugin, 'onUninstall')

      await pluginManager.register(plugin)
      await pluginManager.unregister('test')

      expect(uninstallSpy).toHaveBeenCalled()
    })

    it('应该在卸载前禁用插件', async () => {
      const plugin = new TestPlugin()

      await pluginManager.register(plugin)
      await pluginManager.enable('test')
      await pluginManager.unregister('test')

      expect(plugin.enabled).toBe(false)
    })

    it('应该抛出错误当插件不存在时', async () => {
      await expect(pluginManager.unregister('nonexistent')).rejects.toThrow(
        'Plugin "nonexistent" is not registered'
      )
    })
  })

  describe('插件启用/禁用', () => {
    let plugin: TestPlugin

    beforeEach(async () => {
      plugin = new TestPlugin()
      await pluginManager.register(plugin, { enabled: false })
    })

    it('应该能够启用插件', async () => {
      const enableSpy = vi.spyOn(plugin, 'onEnable')

      await pluginManager.enable('test')

      expect(plugin.enabled).toBe(true)
      expect(enableSpy).toHaveBeenCalled()
    })

    it('应该能够禁用插件', async () => {
      const disableSpy = vi.spyOn(plugin, 'onDisable')

      await pluginManager.enable('test')
      await pluginManager.disable('test')

      expect(plugin.enabled).toBe(false)
      expect(disableSpy).toHaveBeenCalled()
    })

    it('应该抛出错误当插件不存在时', async () => {
      await expect(pluginManager.enable('nonexistent')).rejects.toThrow(
        'Plugin "nonexistent" is not registered'
      )

      await expect(pluginManager.disable('nonexistent')).rejects.toThrow(
        'Plugin "nonexistent" is not registered'
      )
    })

    it('应该忽略重复的启用/禁用操作', async () => {
      const enableSpy = vi.spyOn(plugin, 'onEnable')
      const disableSpy = vi.spyOn(plugin, 'onDisable')

      // 重复启用
      await pluginManager.enable('test')
      await pluginManager.enable('test')
      expect(enableSpy).toHaveBeenCalledTimes(1)

      // 重复禁用
      await pluginManager.disable('test')
      await pluginManager.disable('test')
      expect(disableSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('插件查询', () => {
    beforeEach(async () => {
      const plugin1 = new TestPlugin()
      const plugin2 = new AnotherTestPlugin()

      await pluginManager.register(plugin1)
      await pluginManager.register(plugin2, { enabled: false })
    })

    it('应该能够检查插件是否存在', () => {
      expect(pluginManager.has('test')).toBe(true)
      expect(pluginManager.has('another')).toBe(true)
      expect(pluginManager.has('nonexistent')).toBe(false)
    })

    it('应该能够获取插件实例', () => {
      const plugin = pluginManager.get('test')
      expect(plugin).toBeInstanceOf(TestPlugin)
      expect(plugin?.name).toBe('test')
    })

    it('应该返回undefined当插件不存在时', () => {
      const plugin = pluginManager.get('nonexistent')
      expect(plugin).toBeUndefined()
    })

    it('应该能够获取所有插件', () => {
      const plugins = pluginManager.getAll()
      expect(plugins).toHaveLength(2)
      expect(plugins.map(p => p.name)).toEqual(['test', 'another'])
    })

    it('应该能够获取已启用的插件', async () => {
      await pluginManager.enable('test')

      const enabledPlugins = pluginManager.getEnabled()
      expect(enabledPlugins).toHaveLength(1)
      expect(enabledPlugins[0].name).toBe('test')
    })

    it('应该能够获取已禁用的插件', async () => {
      await pluginManager.enable('test')

      const disabledPlugins = pluginManager.getDisabled()
      expect(disabledPlugins).toHaveLength(1)
      expect(disabledPlugins[0].name).toBe('another')
    })
  })

  describe('批量操作', () => {
    beforeEach(async () => {
      const plugin1 = new TestPlugin()
      const plugin2 = new AnotherTestPlugin()

      await pluginManager.register(plugin1)
      await pluginManager.register(plugin2)
    })

    it('应该能够启用所有插件', async () => {
      await pluginManager.enableAll()

      const enabledPlugins = pluginManager.getEnabled()
      expect(enabledPlugins).toHaveLength(2)
    })

    it('应该能够禁用所有插件', async () => {
      await pluginManager.enableAll()
      await pluginManager.disableAll()

      const enabledPlugins = pluginManager.getEnabled()
      expect(enabledPlugins).toHaveLength(0)
    })

    it('应该能够卸载所有插件', async () => {
      await pluginManager.unregisterAll()

      const plugins = pluginManager.getAll()
      expect(plugins).toHaveLength(0)
    })
  })

  describe('事件系统', () => {
    it('应该触发插件注册事件', async () => {
      const handler = vi.fn()
      pluginManager.on('plugin:registered', handler)

      const plugin = new TestPlugin()
      await pluginManager.register(plugin)

      expect(handler).toHaveBeenCalledWith({
        plugin,
        name: 'test'
      })
    })

    it('应该触发插件卸载事件', async () => {
      const handler = vi.fn()
      pluginManager.on('plugin:unregistered', handler)

      const plugin = new TestPlugin()
      await pluginManager.register(plugin)
      await pluginManager.unregister('test')

      expect(handler).toHaveBeenCalledWith({
        plugin,
        name: 'test'
      })
    })

    it('应该触发插件启用事件', async () => {
      const handler = vi.fn()
      pluginManager.on('plugin:enabled', handler)

      const plugin = new TestPlugin()
      await pluginManager.register(plugin)
      await pluginManager.enable('test')

      expect(handler).toHaveBeenCalledWith({
        plugin,
        name: 'test'
      })
    })

    it('应该触发插件禁用事件', async () => {
      const handler = vi.fn()
      pluginManager.on('plugin:disabled', handler)

      const plugin = new TestPlugin()
      await pluginManager.register(plugin)
      await pluginManager.enable('test')
      await pluginManager.disable('test')

      expect(handler).toHaveBeenCalledWith({
        plugin,
        name: 'test'
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理插件安装错误', async () => {
      const plugin = new TestPlugin()
      const error = new Error('Install failed')

      vi.spyOn(plugin, 'onInstall').mockRejectedValue(error)

      await expect(pluginManager.register(plugin)).rejects.toThrow('Install failed')
    })

    it('应该处理插件卸载错误', async () => {
      const plugin = new TestPlugin()
      const error = new Error('Uninstall failed')

      await pluginManager.register(plugin)
      vi.spyOn(plugin, 'onUninstall').mockRejectedValue(error)

      await expect(pluginManager.unregister('test')).rejects.toThrow('Uninstall failed')
    })

    it('应该处理插件启用错误', async () => {
      const plugin = new TestPlugin()
      const error = new Error('Enable failed')

      await pluginManager.register(plugin, { enabled: false })
      vi.spyOn(plugin, 'onEnable').mockRejectedValue(error)

      await expect(pluginManager.enable('test')).rejects.toThrow('Enable failed')
    })

    it('应该处理插件禁用错误', async () => {
      const plugin = new TestPlugin()
      const error = new Error('Disable failed')

      await pluginManager.register(plugin)
      await pluginManager.enable('test')
      vi.spyOn(plugin, 'onDisable').mockRejectedValue(error)

      await expect(pluginManager.disable('test')).rejects.toThrow('Disable failed')
    })
  })
})
