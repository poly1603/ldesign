/**
 * 插件管理器测试
 */

import type { RouterPlugin } from '../../src/plugins/types'
import type { Router } from '../../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PluginManager } from '../../src/plugins/manager'

// 模拟路由器
const mockRouter = {
  beforeEach: vi.fn(),
  afterEach: vi.fn(),
  onError: vi.fn(),
} as unknown as Router

// 测试插件
const testPlugin: RouterPlugin = {
  name: 'test-plugin',
  version: '1.0.0',
  description: 'Test plugin',
  install: vi.fn(),
  uninstall: vi.fn(),
}

const dependentPlugin: RouterPlugin = {
  name: 'dependent-plugin',
  version: '1.0.0',
  description: 'Plugin with dependencies',
  dependencies: ['test-plugin'],
  install: vi.fn(),
  uninstall: vi.fn(),
}

describe('pluginManager', () => {
  let pluginManager: PluginManager

  beforeEach(() => {
    pluginManager = new PluginManager(mockRouter)
    vi.clearAllMocks()
  })

  describe('插件注册', () => {
    it('应该能够注册插件', () => {
      pluginManager.register(testPlugin)
      expect(pluginManager.has(testPlugin.name)).toBe(true)
    })

    it('不应该重复注册同名插件', () => {
      pluginManager.register(testPlugin)
      expect(() => pluginManager.register(testPlugin)).toThrow()
    })

    it('应该能够获取已注册的插件', () => {
      pluginManager.register(testPlugin)
      expect(pluginManager.get(testPlugin.name)).toBe(testPlugin)
    })
  })

  describe('插件安装', () => {
    beforeEach(() => {
      pluginManager.register(testPlugin)
    })

    it('应该能够安装插件', async () => {
      await pluginManager.install(testPlugin.name)
      expect(testPlugin.install).toHaveBeenCalledWith(
        expect.objectContaining({ router: mockRouter }),
        undefined
      )
    })

    it('应该能够传递选项给插件', async () => {
      const options = { test: true }
      await pluginManager.install(testPlugin.name, options)
      expect(testPlugin.install).toHaveBeenCalledWith(
        expect.objectContaining({ router: mockRouter }),
        options
      )
    })

    it('不应该重复安装已安装的插件', async () => {
      await pluginManager.install(testPlugin.name)
      await pluginManager.install(testPlugin.name)
      expect(testPlugin.install).toHaveBeenCalledTimes(1)
    })

    it('应该能够强制重新安装插件', async () => {
      await pluginManager.install(testPlugin.name)
      await pluginManager.install(testPlugin.name, undefined, { force: true })
      expect(testPlugin.install).toHaveBeenCalledTimes(2)
    })

    it('应该处理安装错误', async () => {
      const errorPlugin: RouterPlugin = {
        name: 'error-plugin',
        install: vi.fn().mockRejectedValue(new Error('Install failed')),
      }

      pluginManager.register(errorPlugin)
      await expect(pluginManager.install(errorPlugin.name)).rejects.toThrow(
        'Install failed'
      )
    })
  })

  describe('插件卸载', () => {
    beforeEach(async () => {
      pluginManager.register(testPlugin)
      await pluginManager.install(testPlugin.name)
    })

    it('应该能够卸载插件', async () => {
      await pluginManager.uninstall(testPlugin.name)
      expect(testPlugin.uninstall).toHaveBeenCalledWith(
        expect.objectContaining({ router: mockRouter })
      )
    })

    it('不应该卸载未安装的插件', async () => {
      const uninstalledPlugin: RouterPlugin = {
        name: 'uninstalled-plugin',
        install: vi.fn(),
        uninstall: vi.fn(),
      }

      pluginManager.register(uninstalledPlugin)
      await pluginManager.uninstall(uninstalledPlugin.name)
      expect(uninstalledPlugin.uninstall).not.toHaveBeenCalled()
    })
  })

  describe('依赖管理', () => {
    beforeEach(() => {
      pluginManager.register(testPlugin)
      pluginManager.register(dependentPlugin)
    })

    it('应该检查缺失的依赖', () => {
      const missingDeps = pluginManager.checkDependencies(dependentPlugin.name)
      expect(missingDeps).toEqual([])
    })

    it('应该自动安装依赖', async () => {
      await pluginManager.install(dependentPlugin.name)
      expect(testPlugin.install).toHaveBeenCalled()
      expect(dependentPlugin.install).toHaveBeenCalled()
    })

    it('应该防止卸载有依赖的插件', async () => {
      await pluginManager.install(dependentPlugin.name)
      await expect(pluginManager.uninstall(testPlugin.name)).rejects.toThrow()
    })

    it('应该能够级联卸载依赖插件', async () => {
      await pluginManager.install(dependentPlugin.name)
      await pluginManager.uninstall(testPlugin.name, { cascade: true })
      expect(dependentPlugin.uninstall).toHaveBeenCalled()
      expect(testPlugin.uninstall).toHaveBeenCalled()
    })
  })

  describe('事件系统', () => {
    it('应该触发安装事件', async () => {
      const installHandler = vi.fn()
      pluginManager.on('plugin:after-install', installHandler)

      pluginManager.register(testPlugin)
      await pluginManager.install(testPlugin.name)

      expect(installHandler).toHaveBeenCalledWith(testPlugin.name, undefined)
    })

    it('应该触发卸载事件', async () => {
      const uninstallHandler = vi.fn()
      pluginManager.on('plugin:after-uninstall', uninstallHandler)

      pluginManager.register(testPlugin)
      await pluginManager.install(testPlugin.name)
      await pluginManager.uninstall(testPlugin.name)

      expect(uninstallHandler).toHaveBeenCalledWith(testPlugin.name)
    })

    it('应该能够移除事件监听器', async () => {
      const handler = vi.fn()
      pluginManager.on('plugin:after-install', handler)
      pluginManager.off('plugin:after-install', handler)

      pluginManager.register(testPlugin)
      await pluginManager.install(testPlugin.name)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('插件查询', () => {
    beforeEach(async () => {
      pluginManager.register(testPlugin)
      await pluginManager.install(testPlugin.name)
    })

    it('应该返回所有已安装的插件', () => {
      const installed = pluginManager.getInstalled()
      expect(installed).toHaveLength(1)
      expect(installed[0]).toBe(testPlugin)
    })

    it('应该返回所有可用的插件', () => {
      const available = pluginManager.getAll()
      expect(available).toHaveLength(1)
      expect(available[0]).toBe(testPlugin)
    })

    it('应该返回插件信息', () => {
      const info = pluginManager.getInfo(testPlugin.name)
      expect(info).toBeDefined()
      expect(info?.plugin).toBe(testPlugin)
    })
  })

  describe('清理和销毁', () => {
    it('应该能够清除所有插件', () => {
      pluginManager.register(testPlugin)
      pluginManager.clear()
      expect(pluginManager.has(testPlugin.name)).toBe(false)
    })

    it('应该能够销毁管理器', async () => {
      pluginManager.register(testPlugin)
      await pluginManager.install(testPlugin.name)

      pluginManager.destroy()
      expect(testPlugin.uninstall).toHaveBeenCalled()
      expect(pluginManager.has(testPlugin.name)).toBe(false)
    })
  })
})
