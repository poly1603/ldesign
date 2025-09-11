/**
 * PluginManager 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PluginManager } from '../../plugins/PluginManager'
import { BasePlugin } from '../../plugins/BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'

// Mock 编辑器
const mockEditor = {
  getLogicFlow: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    register: vi.fn()
  }))
} as unknown as FlowchartEditor

// 测试插件类
class TestPlugin extends BasePlugin {
  readonly name = 'test-plugin'
  readonly version = '1.0.0'
  readonly description = '测试插件'

  private installCalled = false
  private uninstallCalled = false

  protected onInstall(): void {
    this.installCalled = true
  }

  protected onUninstall(): void {
    this.uninstallCalled = true
  }

  public isInstallCalled(): boolean {
    return this.installCalled
  }

  public isUninstallCalled(): boolean {
    return this.uninstallCalled
  }
}

describe('PluginManager', () => {
  let pluginManager: PluginManager
  let testPlugin: TestPlugin

  beforeEach(() => {
    pluginManager = new PluginManager(mockEditor)
    testPlugin = new TestPlugin()
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('应该能够注册插件', () => {
      pluginManager.register(testPlugin)

      const registeredPlugins = pluginManager.getRegisteredPlugins()
      expect(registeredPlugins).toContain('test-plugin')
    })

    it('应该在重复注册时显示警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      pluginManager.register(testPlugin)
      pluginManager.register(testPlugin) // 重复注册

      expect(consoleSpy).toHaveBeenCalledWith('插件 "test-plugin" 已存在，将被覆盖')
      consoleSpy.mockRestore()
    })
  })

  describe('install', () => {
    it('应该能够安装已注册的插件', () => {
      pluginManager.register(testPlugin)
      pluginManager.install('test-plugin')

      expect(testPlugin.isInstallCalled()).toBe(true)
      expect(pluginManager.isInstalled('test-plugin')).toBe(true)
    })

    it('应该能够直接安装插件实例', () => {
      pluginManager.install(testPlugin)

      expect(testPlugin.isInstallCalled()).toBe(true)
      expect(pluginManager.isInstalled('test-plugin')).toBe(true)
      expect(pluginManager.getRegisteredPlugins()).toContain('test-plugin')
    })

    it('应该在安装未注册的插件时抛出错误', () => {
      expect(() => {
        pluginManager.install('non-existent-plugin')
      }).toThrow('插件 "non-existent-plugin" 未注册')
    })

    it('应该在重复安装时显示警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      pluginManager.install(testPlugin)
      pluginManager.install(testPlugin) // 重复安装

      expect(consoleSpy).toHaveBeenCalledWith('插件 "test-plugin" 已安装')
      consoleSpy.mockRestore()
    })

    it('应该在安装失败时抛出错误', () => {
      class FailingPlugin extends BasePlugin {
        readonly name = 'failing-plugin'

        protected onInstall(): void {
          throw new Error('安装失败')
        }

        protected onUninstall(): void { }
      }

      const failingPlugin = new FailingPlugin()

      expect(() => {
        pluginManager.install(failingPlugin)
      }).toThrow('安装失败')
    })
  })

  describe('uninstall', () => {
    it('应该能够卸载已安装的插件', () => {
      pluginManager.install(testPlugin)
      pluginManager.uninstall('test-plugin')

      expect(testPlugin.isUninstallCalled()).toBe(true)
      expect(pluginManager.isInstalled('test-plugin')).toBe(false)
    })

    it('应该在卸载未安装的插件时显示警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      pluginManager.uninstall('test-plugin')

      expect(consoleSpy).toHaveBeenCalledWith('插件 "test-plugin" 未安装')
      consoleSpy.mockRestore()
    })

    it('应该在卸载未注册的插件时显示警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      pluginManager.uninstall('non-existent-plugin')

      expect(consoleSpy).toHaveBeenCalledWith('插件 "non-existent-plugin" 未安装')
      consoleSpy.mockRestore()
    })
  })

  describe('uninstallAll', () => {
    it('应该能够卸载所有插件', () => {
      const plugin1 = new TestPlugin()
      const plugin2 = new class extends BasePlugin {
        readonly name = 'plugin2'
        protected onInstall(): void { }
        protected onUninstall(): void { }
      }()

      pluginManager.install(plugin1)
      pluginManager.install(plugin2)

      expect(pluginManager.getInstalledPlugins()).toHaveLength(2)

      pluginManager.uninstallAll()

      expect(pluginManager.getInstalledPlugins()).toHaveLength(0)
    })

    it('应该处理卸载过程中的错误', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      class FailingUninstallPlugin extends BasePlugin {
        readonly name = 'failing-uninstall'

        protected onInstall(): void { }

        protected onUninstall(): void {
          throw new Error('卸载失败')
        }
      }

      const failingPlugin = new FailingUninstallPlugin()
      pluginManager.install(failingPlugin)

      pluginManager.uninstallAll()

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('isInstalled', () => {
    it('应该正确检查插件安装状态', () => {
      expect(pluginManager.isInstalled('test-plugin')).toBe(false)

      pluginManager.install(testPlugin)
      expect(pluginManager.isInstalled('test-plugin')).toBe(true)

      pluginManager.uninstall('test-plugin')
      expect(pluginManager.isInstalled('test-plugin')).toBe(false)
    })
  })

  describe('getRegisteredPlugins', () => {
    it('应该返回已注册的插件列表', () => {
      expect(pluginManager.getRegisteredPlugins()).toHaveLength(0)

      pluginManager.register(testPlugin)
      expect(pluginManager.getRegisteredPlugins()).toContain('test-plugin')
    })
  })

  describe('getInstalledPlugins', () => {
    it('应该返回已安装的插件列表', () => {
      expect(pluginManager.getInstalledPlugins()).toHaveLength(0)

      pluginManager.install(testPlugin)
      expect(pluginManager.getInstalledPlugins()).toContain('test-plugin')
    })
  })

  describe('getPlugin', () => {
    it('应该能够获取插件实例', () => {
      pluginManager.register(testPlugin)

      const plugin = pluginManager.getPlugin('test-plugin')
      expect(plugin).toBe(testPlugin)
    })

    it('应该在插件不存在时返回 undefined', () => {
      const plugin = pluginManager.getPlugin('non-existent')
      expect(plugin).toBeUndefined()
    })
  })

  describe('installBatch', () => {
    it('应该能够批量安装插件', () => {
      const plugin1 = new TestPlugin()
      const plugin2 = new class extends BasePlugin {
        readonly name = 'plugin2'
        protected onInstall(): void { }
        protected onUninstall(): void { }
      }()

      pluginManager.installBatch([plugin1, plugin2])

      expect(pluginManager.getInstalledPlugins()).toHaveLength(2)
      expect(pluginManager.isInstalled('test-plugin')).toBe(true)
      expect(pluginManager.isInstalled('plugin2')).toBe(true)
    })

    it('应该处理批量安装中的错误', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      const validPlugin = new TestPlugin()
      const invalidPlugin = 'invalid-plugin' as any

      pluginManager.installBatch([validPlugin, invalidPlugin])

      expect(pluginManager.isInstalled('test-plugin')).toBe(true)
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('uninstallBatch', () => {
    it('应该能够批量卸载插件', () => {
      const plugin1 = new TestPlugin()
      const plugin2 = new class extends BasePlugin {
        readonly name = 'plugin2'
        protected onInstall(): void { }
        protected onUninstall(): void { }
      }()

      pluginManager.install(plugin1)
      pluginManager.install(plugin2)

      pluginManager.uninstallBatch(['test-plugin', 'plugin2'])

      expect(pluginManager.getInstalledPlugins()).toHaveLength(0)
    })

    it('应该处理批量卸载中的错误', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      pluginManager.uninstallBatch(['non-existent-plugin'])

      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })
})
