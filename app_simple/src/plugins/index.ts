/**
 * 插件配置和注册
 */

import { createI18nEnginePlugin } from '@/i18n'
import { createColorPlugin } from '@ldesign/color/plugin'
import { createSizePlugin } from '@ldesign/size/plugin'
import { createTemplatePlugin } from '@ldesign/template'
import { createRouterEnginePlugin } from '@ldesign/router'
import { i18nConfig } from '@/config/i18n.config'
import { createColorConfig } from '@/config/color.config'
import { createSizeConfig } from '@/config/size.config'
import { templateConfig } from '@/config/template.config'
import { routerConfig } from '@/config/router.config'
import routes from '@/router/routes'
import { ref } from 'vue'
import type { ManagedPlugin } from '@/core/plugin-manager'

/**
 * 创建 i18n 插件适配器
 */
function createI18nPluginAdapter(config: any): ManagedPlugin {
  const enginePlugin = createI18nEnginePlugin(config)
  
  return {
    name: 'i18n',
    version: '1.0.0',
    description: 'Internationalization plugin',
    priority: 100,
    
    install(app) {
      if (enginePlugin.setupVueApp) {
        enginePlugin.setupVueApp(app)
      }
      // 提供全局 locale
      app.provide('locale', enginePlugin.localeRef)
      app.provide('app-locale', enginePlugin.localeRef)
    }
  }
}

/**
 * 创建路由插件适配器
 */
function createRouterPluginAdapter(): ManagedPlugin {
  const routerPlugin = createRouterEnginePlugin({
    routes,
    ...routerConfig,
    scrollBehavior: (to: any, from: any, savedPosition: any) => {
      if (savedPosition) {
        return savedPosition
      }
      if (to.hash) {
        return { el: to.hash, behavior: 'smooth' }
      }
      return { top: 0, behavior: 'smooth' }
    }
  })
  
  return {
    name: 'router',
    version: '1.0.0',
    description: 'Router plugin',
    priority: 90,
    dependencies: ['i18n'],
    
    async install(app) {
      // Router plugin 会自动安装
      await routerPlugin.install?.(app, {})
    }
  }
}

/**
 * 创建颜色插件适配器
 */
function createColorPluginAdapter(localeRef: any): ManagedPlugin {
  const colorPlugin = createColorPlugin({
    ...createColorConfig(localeRef),
    locale: localeRef
  })
  
  return {
    name: 'color',
    version: '1.0.0',
    description: 'Color theme plugin',
    priority: 80,
    
    install(app) {
      app.use(colorPlugin)
    }
  }
}

/**
 * 创建尺寸插件适配器
 */
function createSizePluginAdapter(localeRef: any): ManagedPlugin {
  const sizePlugin = createSizePlugin({
    ...createSizeConfig(localeRef),
    locale: localeRef
  })
  
  return {
    name: 'size',
    version: '1.0.0',
    description: 'Size scaling plugin',
    priority: 70,
    
    install(app) {
      app.use(sizePlugin)
    }
  }
}

/**
 * 创建模板插件适配器
 */
function createTemplatePluginAdapter(): ManagedPlugin {
  const templatePlugin = createTemplatePlugin(templateConfig)
  
  return {
    name: 'template',
    version: '1.0.0',
    description: 'Template management plugin',
    priority: 60,
    
    install(app) {
      app.use(templatePlugin)
    }
  }
}

/**
 * 设置插件
 */
export function setupPlugins() {
  // 创建共享的 locale ref
  const i18nPlugin = createI18nEnginePlugin(i18nConfig)
  const localeRef = i18nPlugin.localeRef
  
  const plugins = [
    {
      plugin: createI18nPluginAdapter(i18nConfig),
      options: {}
    },
    {
      plugin: createRouterPluginAdapter(),
      options: {}
    },
    {
      plugin: createColorPluginAdapter(localeRef),
      options: {}
    },
    {
      plugin: createSizePluginAdapter(localeRef),
      options: {}
    },
    {
      plugin: createTemplatePluginAdapter(),
      options: {}
    }
  ]
  
  return plugins
}