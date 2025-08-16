/**
 * i18n 插件集成测试
 *
 * 测试 i18n 插件在 Engine 中的集成和功能
 */

import { createEngine } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'

describe('i18n Engine Plugin Integration', () => {
  let engine: any
  let app: any

  beforeEach(async () => {
    // 创建 Engine 实例
    engine = createEngine({
      name: 'test-app',
      version: '1.0.0',
    })

    // 创建 Vue 应用
    app = createApp({
      template: '<div>Test App</div>',
    })

    // 安装 Engine 到 Vue 应用
    engine.install(app)
  })

  it('should install i18n plugin successfully', async () => {
    // 创建 i18n 插件
    const i18nPlugin = createI18nEnginePlugin({
      name: 'i18n',
      version: '1.0.0',
      defaultLocale: 'zh-CN',
      globalInjection: true,
      globalPropertyName: '$t',
    })

    // 安装插件
    await engine.use(i18nPlugin)

    // 验证插件已安装
    expect(engine.getPlugin('i18n')).toBeDefined()
  })

  it('should provide global properties after installation', async () => {
    // 创建 i18n 插件
    const i18nPlugin = createI18nEnginePlugin({
      name: 'i18n',
      version: '1.0.0',
      defaultLocale: 'zh-CN',
      globalInjection: true,
      globalPropertyName: '$t',
    })

    // 安装插件
    await engine.use(i18nPlugin)

    // 验证全局属性
    const vueApp = engine.getApp()
    expect(vueApp.config.globalProperties.$t).toBeDefined()
    expect(vueApp.config.globalProperties.$i18n).toBeDefined()
  })

  it('should handle plugin options correctly', async () => {
    // 创建带有自定义选项的 i18n 插件
    const i18nPlugin = createI18nEnginePlugin({
      name: 'custom-i18n',
      version: '2.0.0',
      defaultLocale: 'en',
      fallbackLocale: 'zh-CN',
      globalInjection: true,
      globalPropertyName: '$translate',
    })

    // 安装插件
    await engine.use(i18nPlugin)

    // 验证插件信息
    const plugin = engine.getPlugin('custom-i18n')
    expect(plugin.name).toBe('custom-i18n')
    expect(plugin.version).toBe('2.0.0')

    // 验证全局属性使用自定义名称
    const vueApp = engine.getApp()
    expect(vueApp.config.globalProperties.$translate).toBeDefined()
  })

  it('should integrate with engine events system', async () => {
    const eventSpy = vi.fn()

    // 监听插件安装事件
    engine.events.on('plugin:i18n:installed', eventSpy)

    // 创建并安装 i18n 插件
    const i18nPlugin = createI18nEnginePlugin({
      name: 'i18n',
      version: '1.0.0',
    })

    await engine.use(i18nPlugin)

    // 验证事件被触发
    expect(eventSpy).toHaveBeenCalled()
  })

  it('should handle language change events', async () => {
    const languageChangeSpy = vi.fn()

    // 监听语言变更事件
    engine.events.on('i18n:languageChanged', languageChangeSpy)

    // 创建并安装 i18n 插件
    const i18nPlugin = createI18nEnginePlugin({
      name: 'i18n',
      version: '1.0.0',
      defaultLocale: 'zh-CN',
    })

    await engine.use(i18nPlugin)

    // 获取 i18n 实例并切换语言
    const i18nInstance = engine.i18nInstance
    if (i18nInstance && i18nInstance.changeLanguage) {
      await i18nInstance.changeLanguage('en')

      // 验证语言变更事件被触发
      expect(languageChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          newLanguage: 'en',
          oldLanguage: 'zh-CN',
        })
      )
    }
  })

  it('should uninstall plugin correctly', async () => {
    // 创建并安装 i18n 插件
    const i18nPlugin = createI18nEnginePlugin({
      name: 'i18n',
      version: '1.0.0',
    })

    await engine.use(i18nPlugin)

    // 验证插件已安装
    expect(engine.getPlugin('i18n')).toBeDefined()

    // 卸载插件
    await engine.unuse('i18n')

    // 验证插件已卸载
    expect(engine.getPlugin('i18n')).toBeUndefined()
  })

  it('should handle installation errors gracefully', async () => {
    // 创建一个会导致错误的插件配置
    const i18nPlugin = createI18nEnginePlugin({
      name: 'i18n',
      version: '1.0.0',
      // 传入无效的配置来触发错误
      defaultLocale: null as any,
    })

    // 验证错误处理
    await expect(engine.use(i18nPlugin)).rejects.toThrow()
  })
})
