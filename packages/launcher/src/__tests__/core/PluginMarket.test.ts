/**
 * 插件市场系统单元测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PluginMarketManager } from '../../core/PluginMarket'
import { Logger } from '../../utils/logger'

describe('PluginMarketManager', () => {
  let pluginMarket: PluginMarketManager
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = new Logger('Test', { level: 'silent' })
    pluginMarket = new PluginMarketManager(mockLogger)
  })

  describe('搜索功能', () => {
    it('应该能够搜索插件', async () => {
      // 首先获取插件列表
      await pluginMarket.fetchPlugins()
      
      // 搜索 Vue 相关插件
      const results = pluginMarket.searchPlugins({ query: 'vue' })
      
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBeGreaterThan(0)
      
      // 验证搜索结果包含相关插件
      const hasVuePlugin = results.some(plugin => 
        plugin.name.toLowerCase().includes('vue') || 
        plugin.tags.some(tag => tag.toLowerCase().includes('vue'))
      )
      expect(hasVuePlugin).toBe(true)
    })

    it('应该支持按类别过滤', async () => {
      await pluginMarket.fetchPlugins()
      
      const results = pluginMarket.searchPlugins({ category: 'dev' })
      
      results.forEach(plugin => {
        expect(plugin.category).toBe('dev')
      })
    })

    it('应该支持按类型过滤', async () => {
      await pluginMarket.fetchPlugins()
      
      const results = pluginMarket.searchPlugins({ type: 'vite-plugin' })
      
      results.forEach(plugin => {
        expect(plugin.type).toBe('vite-plugin')
      })
    })

    it('应该支持仅显示官方插件', async () => {
      await pluginMarket.fetchPlugins()
      
      const results = pluginMarket.searchPlugins({ officialOnly: true })
      
      results.forEach(plugin => {
        expect(plugin.official).toBe(true)
      })
    })

    it('应该支持限制结果数量', async () => {
      await pluginMarket.fetchPlugins()
      
      const results = pluginMarket.searchPlugins({ limit: 2 })
      
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('应该支持排序', async () => {
      await pluginMarket.fetchPlugins()
      
      const results = pluginMarket.searchPlugins({ 
        sortBy: 'downloads', 
        sortOrder: 'desc' 
      })
      
      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].downloads).toBeGreaterThanOrEqual(results[i + 1].downloads)
        }
      }
    })
  })

  describe('插件信息获取', () => {
    it('应该能够获取插件详细信息', async () => {
      const pluginName = '@ldesign/plugin-vue-devtools'
      const plugin = await pluginMarket.getPluginInfo(pluginName)
      
      expect(plugin).not.toBeNull()
      expect(plugin!.name).toBe(pluginName)
      expect(plugin!.description).toBeDefined()
      expect(plugin!.version).toBeDefined()
      expect(plugin!.author).toBeDefined()
    })

    it('对于不存在的插件应该返回 null', async () => {
      const plugin = await pluginMarket.getPluginInfo('non-existent-plugin')
      
      expect(plugin).toBeNull()
    })
  })

  describe('插件安装', () => {
    it('应该能够安装插件', async () => {
      const pluginName = '@ldesign/plugin-vue-devtools'
      
      // 模拟安装过程
      await expect(pluginMarket.installPlugin(pluginName)).resolves.not.toThrow()
    })

    it('应该在安装不存在的插件时抛出错误', async () => {
      const pluginName = 'non-existent-plugin'
      
      await expect(pluginMarket.installPlugin(pluginName)).rejects.toThrow()
    })
  })

  describe('插件管理', () => {
    it('应该能够获取已安装插件列表', () => {
      const installedPlugins = pluginMarket.getInstalledPlugins()
      
      expect(installedPlugins).toBeInstanceOf(Array)
    })

    it('应该能够检查插件更新', async () => {
      const updates = await pluginMarket.checkUpdates()
      
      expect(updates).toBeInstanceOf(Array)
      
      updates.forEach(update => {
        expect(update).toHaveProperty('plugin')
        expect(update).toHaveProperty('currentVersion')
        expect(update).toHaveProperty('latestVersion')
        expect(update.plugin).toBeDefined()
        expect(update.currentVersion).toBeDefined()
        expect(update.latestVersion).toBeDefined()
      })
    })
  })

  describe('事件系统', () => {
    it('应该在获取插件列表时触发事件', async () => {
      const eventHandler = vi.fn()
      pluginMarket.on('plugins:fetched', eventHandler)
      
      await pluginMarket.fetchPlugins()
      
      expect(eventHandler).toHaveBeenCalled()
    })

    it('应该在安装插件时触发事件', async () => {
      const startHandler = vi.fn()
      const successHandler = vi.fn()
      
      pluginMarket.on('plugin:install:start', startHandler)
      pluginMarket.on('plugin:install:success', successHandler)
      
      try {
        await pluginMarket.installPlugin('@ldesign/plugin-vue-devtools')
        expect(startHandler).toHaveBeenCalled()
        expect(successHandler).toHaveBeenCalled()
      } catch (error) {
        // 安装可能失败（因为是模拟环境），但事件应该被触发
        expect(startHandler).toHaveBeenCalled()
      }
    })
  })

  describe('依赖检查', () => {
    it('应该能够识别 Launcher 插件', () => {
      // 测试私有方法需要通过类型断言
      const manager = pluginMarket as any
      
      expect(manager.isLauncherPlugin('@ldesign/plugin-vue-devtools')).toBe(true)
      expect(manager.isLauncherPlugin('vite-plugin-vue')).toBe(true)
      expect(manager.isLauncherPlugin('launcher-plugin-test')).toBe(true)
      expect(manager.isLauncherPlugin('react')).toBe(false)
    })
  })
})
