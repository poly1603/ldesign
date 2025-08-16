/**
 * 完整插件集成测试
 *
 * 测试 Router、i18n、Template 三个插件的完整集成
 */

import { createEngine } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createRouterEnginePlugin } from '@ldesign/router'
import { createTemplateEnginePlugin } from '@ldesign/template'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'

describe('complete Plugin Integration', () => {
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
      template: '<router-view />',
    })

    // 安装 Engine 到 Vue 应用
    engine.install(app)
  })

  it('should install all plugins in correct order', async () => {
    // 1. 安装 Router 插件
    const routerPlugin = createRouterEnginePlugin({
      name: 'router',
      version: '1.0.0',
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } },
      ],
    })

    await engine.use(routerPlugin)
    expect(engine.getPlugin('router')).toBeDefined()

    // 2. 安装 i18n 插件
    const i18nPlugin = createI18nEnginePlugin({
      name: 'i18n',
      version: '1.0.0',
      defaultLocale: 'zh-CN',
      globalInjection: true,
    })

    await engine.use(i18nPlugin)
    expect(engine.getPlugin('i18n')).toBeDefined()

    // 3. 安装 Template 插件
    const templatePlugin = createTemplateEnginePlugin({
      name: 'template',
      version: '1.0.0',
      defaultDevice: 'desktop',
      enableCache: true,
    })

    await engine.use(templatePlugin)
    expect(engine.getPlugin('template')).toBeDefined()

    // 验证所有插件都已安装
    const installedPlugins = engine.getInstalledPlugins()
    expect(installedPlugins).toHaveLength(3)
    expect(installedPlugins.map((p: any) => p.name)).toEqual([
      'router',
      'i18n',
      'template',
    ])
  })

  it('should provide all global properties', async () => {
    // 安装所有插件
    await engine.use(
      createRouterEnginePlugin({
        name: 'router',
        version: '1.0.0',
        routes: [],
      })
    )

    await engine.use(
      createI18nEnginePlugin({
        name: 'i18n',
        version: '1.0.0',
        globalInjection: true,
      })
    )

    await engine.use(
      createTemplateEnginePlugin({
        name: 'template',
        version: '1.0.0',
      })
    )

    // 验证全局属性
    const vueApp = engine.getApp()
    expect(vueApp.config.globalProperties.$router).toBeDefined()
    expect(vueApp.config.globalProperties.$route).toBeDefined()
    expect(vueApp.config.globalProperties.$t).toBeDefined()
    expect(vueApp.config.globalProperties.$i18n).toBeDefined()
    expect(vueApp.config.globalProperties.$engine).toBeDefined()
  })

  it('should handle plugin dependencies correctly', async () => {
    // Template 插件可能依赖于设备检测，但不依赖其他插件
    const templatePlugin = createTemplateEnginePlugin({
      name: 'template',
      version: '1.0.0',
      dependencies: [], // 无依赖
    })

    await engine.use(templatePlugin)
    expect(engine.getPlugin('template')).toBeDefined()

    // i18n 插件独立工作
    const i18nPlugin = createI18nEnginePlugin({
      name: 'i18n',
      version: '1.0.0',
      dependencies: [], // 无依赖
    })

    await engine.use(i18nPlugin)
    expect(engine.getPlugin('i18n')).toBeDefined()
  })

  it('should integrate with engine state management', async () => {
    // 安装所有插件
    await engine.use(
      createRouterEnginePlugin({
        name: 'router',
        version: '1.0.0',
        routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
      })
    )

    await engine.use(
      createI18nEnginePlugin({
        name: 'i18n',
        version: '1.0.0',
        defaultLocale: 'zh-CN',
      })
    )

    await engine.use(
      createTemplateEnginePlugin({
        name: 'template',
        version: '1.0.0',
        defaultDevice: 'mobile',
      })
    )

    // 验证状态管理集成
    expect(engine.state.get('router:currentRoute')).toBeDefined()
    expect(engine.state.get('i18n:currentLanguage')).toBe('zh-CN')
    expect(engine.state.get('template:currentDevice')).toBe('mobile')
  })

  it('should handle plugin events correctly', async () => {
    const events: string[] = []

    // 监听所有插件事件
    engine.events.on('plugin:router:installed', () =>
      events.push('router:installed')
    )
    engine.events.on('plugin:i18n:installed', () =>
      events.push('i18n:installed')
    )
    engine.events.on('plugin:template:installed', () =>
      events.push('template:installed')
    )

    // 安装插件
    await engine.use(
      createRouterEnginePlugin({ name: 'router', version: '1.0.0', routes: [] })
    )
    await engine.use(createI18nEnginePlugin({ name: 'i18n', version: '1.0.0' }))
    await engine.use(
      createTemplateEnginePlugin({ name: 'template', version: '1.0.0' })
    )

    // 验证事件顺序
    expect(events).toEqual([
      'router:installed',
      'i18n:installed',
      'template:installed',
    ])
  })

  it('should uninstall all plugins correctly', async () => {
    // 安装所有插件
    await engine.use(
      createRouterEnginePlugin({ name: 'router', version: '1.0.0', routes: [] })
    )
    await engine.use(createI18nEnginePlugin({ name: 'i18n', version: '1.0.0' }))
    await engine.use(
      createTemplateEnginePlugin({ name: 'template', version: '1.0.0' })
    )

    // 验证插件已安装
    expect(engine.getInstalledPlugins()).toHaveLength(3)

    // 卸载所有插件
    await engine.unuse('template')
    await engine.unuse('i18n')
    await engine.unuse('router')

    // 验证插件已卸载
    expect(engine.getInstalledPlugins()).toHaveLength(0)
  })

  it('should handle plugin installation errors gracefully', async () => {
    // 安装正常插件
    await engine.use(
      createRouterEnginePlugin({ name: 'router', version: '1.0.0', routes: [] })
    )

    // 尝试安装有问题的插件
    const problematicPlugin = {
      name: 'problematic',
      version: '1.0.0',
      dependencies: [],
      async install() {
        throw new Error('Installation failed')
      },
    }

    // 验证错误处理
    await expect(engine.use(problematicPlugin)).rejects.toThrow(
      'Installation failed'
    )

    // 验证其他插件仍然正常工作
    expect(engine.getPlugin('router')).toBeDefined()
  })
})
