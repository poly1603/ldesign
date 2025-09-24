/**
 * Vue 插件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp } from 'vue'
import { createColorEnginePlugin } from '../../src/vue/plugin'
import type { ColorPluginOptions } from '../../src/vue/plugin'

describe('createColorEnginePlugin', () => {
  let app: any
  let mockEngine: any

  beforeEach(() => {
    app = createApp({})
    mockEngine = {
      getApp: () => app,
      config: {},
    }

    // 模拟 DOM 环境
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('应该正确创建插件', () => {
    const plugin = createColorEnginePlugin()

    expect(plugin).toBeDefined()
    expect(plugin.name).toBe('color')
    expect(plugin.version).toBe('1.0.0')
    expect(typeof plugin.install).toBe('function')
  })

  it('应该使用默认配置', () => {
    const plugin = createColorEnginePlugin()

    expect(plugin).toBeDefined()
  })

  it('应该支持自定义配置', () => {
    const customConfig: ColorPluginOptions = {
      cssVariablePrefix: 'custom',
      enableCache: false,
      backgroundStrategy: 'primary-based',
      generateBackgroundFromPrimary: true,
      customThemes: [
        {
          name: 'custom-theme',
          displayName: '自定义主题',
          description: '这是一个自定义主题',
          light: { primary: '#ff0000' },
          dark: { primary: '#cc0000' },
        },
      ],
      disabledBuiltinThemes: ['green'],
    }

    const plugin = createColorEnginePlugin(customConfig)

    expect(plugin).toBeDefined()
  })

  it('应该正确安装插件', async () => {
    const plugin = createColorEnginePlugin({
      debug: true,
    })

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await plugin.install(mockEngine)

    expect(mockEngine.config.color).toBeDefined()
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('应该正确处理错误情况', async () => {
    const plugin = createColorEnginePlugin()
    const invalidEngine = null

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(plugin.install(invalidEngine)).rejects.toThrow()

    consoleErrorSpy.mockRestore()
  })

  it('应该支持回调函数', async () => {
    const onReadyMock = vi.fn()
    const onThemeChangedMock = vi.fn()
    const onErrorMock = vi.fn()

    const plugin = createColorEnginePlugin({
      onReady: onReadyMock,
      onThemeChanged: onThemeChangedMock,
      onError: onErrorMock,
    })

    await plugin.install(mockEngine)

    expect(onReadyMock).toHaveBeenCalled()
  })

  it('应该正确处理缓存配置', async () => {
    const plugin = createColorEnginePlugin({
      enableCache: true,
      cacheStorage: 'sessionStorage',
    })

    await plugin.install(mockEngine)

    expect(mockEngine.config.color.enableCache).toBe(true)
    expect(mockEngine.config.color.cacheStorage).toBe('sessionStorage')
  })

  it('应该正确处理背景色生成配置', async () => {
    const plugin = createColorEnginePlugin({
      backgroundStrategy: 'primary-based',
      generateBackgroundFromPrimary: true,
    })

    await plugin.install(mockEngine)

    expect(mockEngine.config.color.backgroundStrategy).toBe('primary-based')
    expect(mockEngine.config.color.generateBackgroundFromPrimary).toBe(true)
  })

  it('应该正确处理自定义主题', async () => {
    const customThemes = [
      {
        name: 'theme1',
        displayName: '主题1',
        light: { primary: '#ff0000' },
        dark: { primary: '#cc0000' },
      },
      {
        name: 'theme2',
        displayName: '主题2',
        colors: { primary: '#00ff00' },
      },
    ]

    const plugin = createColorEnginePlugin({
      customThemes,
    })

    await plugin.install(mockEngine)

    expect(mockEngine.config.color.customThemes).toEqual(customThemes)
  })

  it('应该正确处理禁用的内置主题', async () => {
    const disabledThemes = ['green', 'red']

    const plugin = createColorEnginePlugin({
      disabledBuiltinThemes: disabledThemes,
    })

    await plugin.install(mockEngine)

    expect(mockEngine.config.color.disabledBuiltinThemes).toEqual(disabledThemes)
  })

  it('应该正确处理 CSS 变量前缀', async () => {
    const customPrefix = 'my-design'

    const plugin = createColorEnginePlugin({
      cssVariablePrefix: customPrefix,
    })

    await plugin.install(mockEngine)

    expect(mockEngine.config.color.cssVariablePrefix).toBe(customPrefix)
  })

  it('应该在错误时调用错误回调', async () => {
    const onErrorMock = vi.fn()

    const plugin = createColorEnginePlugin({
      onError: onErrorMock,
      onReady: () => {
        throw new Error('测试错误')
      },
    })

    await plugin.install(mockEngine)

    expect(onErrorMock).toHaveBeenCalled()
  })

  it('应该正确设置调试模式', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const plugin = createColorEnginePlugin({
      debug: true,
    })

    await plugin.install(mockEngine)

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🎨 [ColorEngine] 开始安装插件')
    )

    consoleSpy.mockRestore()
  })
})
