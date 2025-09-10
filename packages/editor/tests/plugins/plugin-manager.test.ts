/**
 * 插件管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PluginManager } from '@/core/plugin-manager'
import { BasePlugin } from '@/plugins/base-plugin'
import { LDesignEditor } from '@/core/editor'
import { createMockElement } from '../setup'
import type { IPlugin, Command } from '@/types'

// 测试插件类
class TestPlugin extends BasePlugin {
  public readonly name = 'test'
  public readonly version = '1.0.0'
  public readonly description = 'Test plugin'

  getCommands(): Command[] {
    return [
      {
        name: 'testCommand',
        execute: () => true,
        canExecute: () => true,
        isActive: () => false
      }
    ]
  }

  protected onInit(): void {
    this.log('info', 'Test plugin initialized')
  }

  protected onDestroy(): void {
    this.log('info', 'Test plugin destroyed')
  }
}

// 另一个测试插件
class AnotherTestPlugin extends BasePlugin {
  public readonly name = 'another'
  public readonly version = '1.0.0'
  public readonly description = 'Another test plugin'
  public readonly dependencies = ['test']

  getCommands(): Command[] {
    return []
  }

  protected onInit(): void { }
  protected onDestroy(): void { }
}

describe('PluginManager', () => {
  let editor: LDesignEditor
  let pluginManager: PluginManager
  let container: HTMLElement

  beforeEach(() => {
    container = createMockElement('div')
    document.body.appendChild(container)

    editor = new LDesignEditor({
      container: container
    })

    pluginManager = new PluginManager(editor)
  })

  afterEach(() => {
    if (pluginManager) {
      pluginManager.destroy()
    }
    if (editor && !editor.destroyed) {
      editor.destroy()
    }
    document.body.innerHTML = ''
  })

  describe('插件注册', () => {
    it('应该能够注册插件', () => {
      const plugin = new TestPlugin(editor)
      pluginManager.register(plugin)

      expect(pluginManager.isRegistered('test')).toBe(true)
    })

    it('应该能够批量注册插件', () => {
      const plugins = [
        new TestPlugin(editor),
        new AnotherTestPlugin(editor)
      ]

      pluginManager.registerMultiple(plugins)

      expect(pluginManager.isRegistered('test')).toBe(true)
      expect(pluginManager.isRegistered('another')).toBe(true)
    })

    it('重复注册同名插件应该发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const plugin1 = new TestPlugin(editor)
      const plugin2 = new TestPlugin(editor)

      pluginManager.registerPlugin(plugin1)
      pluginManager.registerPlugin(plugin2)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Plugin "test" is already registered')
      )

      consoleSpy.mockRestore()
    })

    it('应该能够注销插件', () => {
      const plugin = new TestPlugin(editor)
      pluginManager.registerPlugin(plugin)
      pluginManager.unregisterPlugin('test')

      expect(pluginManager.isPluginRegistered('test')).toBe(false)
    })
  })

  describe('插件启用/禁用', () => {
    beforeEach(() => {
      const plugin = new TestPlugin(editor)
      pluginManager.registerPlugin(plugin)
    })

    it('应该能够启用插件', () => {
      pluginManager.enablePlugin('test')

      expect(pluginManager.isPluginEnabled('test')).toBe(true)
    })

    it('应该能够禁用插件', () => {
      pluginManager.enablePlugin('test')
      pluginManager.disablePlugin('test')

      expect(pluginManager.isPluginEnabled('test')).toBe(false)
    })

    it('启用未注册的插件应该返回 false', () => {
      const result = pluginManager.enablePlugin('nonexistent')

      expect(result).toBe(false)
    })

    it('禁用未启用的插件应该返回 false', () => {
      const result = pluginManager.disablePlugin('test')

      expect(result).toBe(false)
    })
  })

  describe('插件依赖', () => {
    it('应该能够解析插件依赖', () => {
      const testPlugin = new TestPlugin(editor)
      const anotherPlugin = new AnotherTestPlugin(editor)

      pluginManager.registerPlugin(testPlugin)
      pluginManager.registerPlugin(anotherPlugin)

      // 启用有依赖的插件应该自动启用依赖
      pluginManager.enablePlugin('another')

      expect(pluginManager.isPluginEnabled('test')).toBe(true)
      expect(pluginManager.isPluginEnabled('another')).toBe(true)
    })

    it('缺少依赖时应该启用失败', () => {
      const anotherPlugin = new AnotherTestPlugin(editor)
      pluginManager.registerPlugin(anotherPlugin)

      const result = pluginManager.enablePlugin('another')

      expect(result).toBe(false)
      expect(pluginManager.isPluginEnabled('another')).toBe(false)
    })
  })

  describe('插件查询', () => {
    beforeEach(() => {
      const testPlugin = new TestPlugin(editor)
      const anotherPlugin = new AnotherTestPlugin(editor)

      pluginManager.registerPlugin(testPlugin)
      pluginManager.registerPlugin(anotherPlugin)
      pluginManager.enablePlugin('test')
    })

    it('应该能够获取插件实例', () => {
      const plugin = pluginManager.getPlugin('test')

      expect(plugin).toBeInstanceOf(TestPlugin)
      expect(plugin?.name).toBe('test')
    })

    it('应该能够获取所有插件', () => {
      const plugins = pluginManager.getPlugins()

      expect(plugins).toHaveLength(2)
      expect(plugins.map(p => p.name)).toContain('test')
      expect(plugins.map(p => p.name)).toContain('another')
    })

    it('应该能够获取已启用的插件', () => {
      const enabledPlugins = pluginManager.getEnabledPlugins()

      expect(enabledPlugins).toHaveLength(1)
      expect(enabledPlugins[0].name).toBe('test')
    })

    it('应该能够获取已禁用的插件', () => {
      const disabledPlugins = pluginManager.getDisabledPlugins()

      expect(disabledPlugins).toHaveLength(1)
      expect(disabledPlugins[0].name).toBe('another')
    })
  })

  describe('插件生命周期', () => {
    it('启用插件时应该调用 onInit', () => {
      const plugin = new TestPlugin(editor)
      const initSpy = vi.spyOn(plugin as any, 'onInit')

      pluginManager.registerPlugin(plugin)
      pluginManager.enablePlugin('test')

      expect(initSpy).toHaveBeenCalled()
      initSpy.mockRestore()
    })

    it('禁用插件时应该调用 onDestroy', () => {
      const plugin = new TestPlugin(editor)
      const destroySpy = vi.spyOn(plugin as any, 'onDestroy')

      pluginManager.registerPlugin(plugin)
      pluginManager.enablePlugin('test')
      pluginManager.disablePlugin('test')

      expect(destroySpy).toHaveBeenCalled()
      destroySpy.mockRestore()
    })
  })

  describe('命令集成', () => {
    beforeEach(() => {
      const plugin = new TestPlugin(editor)
      pluginManager.registerPlugin(plugin)
      pluginManager.enablePlugin('test')
    })

    it('启用插件时应该注册命令', () => {
      const commands = editor.commands.getCommands()
      const commandNames = commands.map(cmd => cmd.name)

      expect(commandNames).toContain('testCommand')
    })

    it('禁用插件时应该注销命令', () => {
      pluginManager.disablePlugin('test')

      const commands = editor.commands.getCommands()
      const commandNames = commands.map(cmd => cmd.name)

      expect(commandNames).not.toContain('testCommand')
    })
  })

  describe('插件状态同步', () => {
    it('应该能够同步插件状态', () => {
      const plugin = new TestPlugin(editor)
      pluginManager.registerPlugin(plugin)
      pluginManager.enablePlugin('test')

      // 模拟状态变更
      editor.state.readonly = true
      pluginManager.syncPluginStates()

      // 验证插件状态已同步
      expect(plugin.getState().readonly).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('插件初始化错误应该被捕获', () => {
      class ErrorPlugin extends BasePlugin {
        public readonly name = 'error'
        public readonly version = '1.0.0'
        public readonly description = 'Error plugin'

        getCommands(): Command[] {
          return []
        }

        protected onInit(): void {
          throw new Error('Init error')
        }

        protected onDestroy(): void { }
      }

      const errorPlugin = new ErrorPlugin(editor)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      pluginManager.registerPlugin(errorPlugin)
      const result = pluginManager.enablePlugin('error')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('调试信息', () => {
    it('应该能够获取调试信息', () => {
      const plugin = new TestPlugin(editor)
      pluginManager.registerPlugin(plugin)
      pluginManager.enablePlugin('test')

      const debugInfo = pluginManager.getDebugInfo()

      expect(debugInfo).toHaveProperty('totalPlugins')
      expect(debugInfo).toHaveProperty('enabledPlugins')
      expect(debugInfo).toHaveProperty('disabledPlugins')
      expect(debugInfo).toHaveProperty('registeredPlugins')

      expect(debugInfo.totalPlugins).toBe(1)
      expect(debugInfo.enabledPlugins).toBe(1)
      expect(debugInfo.disabledPlugins).toBe(0)
    })
  })

  describe('销毁', () => {
    it('应该能够销毁插件管理器', () => {
      const plugin = new TestPlugin(editor)
      pluginManager.registerPlugin(plugin)
      pluginManager.enablePlugin('test')

      pluginManager.destroy()

      expect(pluginManager.getPlugins()).toHaveLength(0)
    })

    it('销毁时应该禁用所有插件', () => {
      const plugin = new TestPlugin(editor)
      const destroySpy = vi.spyOn(plugin as any, 'onDestroy')

      pluginManager.registerPlugin(plugin)
      pluginManager.enablePlugin('test')
      pluginManager.destroy()

      expect(destroySpy).toHaveBeenCalled()
      destroySpy.mockRestore()
    })
  })
})
