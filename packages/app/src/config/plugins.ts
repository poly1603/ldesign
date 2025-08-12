/**
 * 插件配置
 *
 * 定义应用中所有插件的加载配置和优化策略
 */

import { createRouterEnginePlugin } from '@ldesign/router'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createTemplateEnginePlugin } from '@ldesign/template'
import {
  pluginLoader,
  createPluginConfig,
  withPerformanceMonitoring,
  withCache,
} from '../utils/plugin-loader'
import { appRouterConfig } from '../router'
import { appI18nConfig, createAppI18n } from '../i18n'
import { appTemplateConfig } from '../templates'

/**
 * 插件加载策略
 */
export enum LoadStrategy {
  /** 立即加载 - 应用启动时立即加载 */
  IMMEDIATE = 'immediate',
  /** 延迟加载 - 应用启动后延迟加载 */
  LAZY = 'lazy',
  /** 按需加载 - 使用时才加载 */
  ON_DEMAND = 'on_demand',
  /** 预加载 - 后台预加载但不阻塞启动 */
  PRELOAD = 'preload',
}

/**
 * 核心插件配置 - 立即加载
 */
export const corePluginConfigs = [
  createPluginConfig({
    name: 'router',
    version: '1.0.0',
    immediate: true,
    factory: withPerformanceMonitoring(async () => {
      console.log('🛣️ 创建路由插件...')
      return createRouterEnginePlugin({
        ...appRouterConfig,
        name: 'router',
        version: '1.0.0',
      })
    }),
  }),

  createPluginConfig({
    name: 'i18n',
    version: '1.0.0',
    immediate: true,
    dependencies: [], // 不依赖其他插件
    factory: withPerformanceMonitoring(async () => {
      console.log('🌐 创建 i18n 插件...')
      return createI18nEnginePlugin({
        ...appI18nConfig,
        name: 'i18n',
        version: '1.0.0',
        createI18n: createAppI18n,
      })
    }),
  }),

  createPluginConfig({
    name: 'template',
    version: '1.0.0',
    immediate: true,
    dependencies: ['router'], // 依赖路由插件
    factory: withPerformanceMonitoring(async () => {
      console.log('🎨 创建模板插件...')
      return createTemplateEnginePlugin({
        ...appTemplateConfig,
        name: 'template',
        version: '1.0.0',
      })
    }),
  }),
]

/**
 * 功能插件配置 - 延迟加载
 */
export const featurePluginConfigs = [
  createPluginConfig({
    name: 'analytics',
    version: '1.0.0',
    delay: 2000, // 2秒后加载
    condition: () => {
      // 只在生产环境加载分析插件
      return process.env.NODE_ENV === 'production'
    },
    factory: withCache(async () => {
      console.log('📊 创建分析插件...')
      // 这里可以动态导入分析插件
      return {
        name: 'analytics',
        version: '1.0.0',
        install: async () => {
          console.log('📊 分析插件安装完成')
        },
        uninstall: async () => {
          console.log('📊 分析插件卸载完成')
        },
      }
    }),
  }),

  createPluginConfig({
    name: 'notification',
    version: '1.0.0',
    delay: 1000, // 1秒后加载
    factory: withCache(async () => {
      console.log('🔔 创建通知插件...')
      return {
        name: 'notification',
        version: '1.0.0',
        install: async () => {
          console.log('🔔 通知插件安装完成')
        },
        uninstall: async () => {
          console.log('🔔 通知插件卸载完成')
        },
      }
    }),
  }),

  createPluginConfig({
    name: 'theme',
    version: '1.0.0',
    delay: 500, // 0.5秒后加载
    dependencies: ['template'], // 依赖模板插件
    factory: withCache(async () => {
      console.log('🎨 创建主题插件...')
      return {
        name: 'theme',
        version: '1.0.0',
        install: async () => {
          console.log('🎨 主题插件安装完成')
        },
        uninstall: async () => {
          console.log('🎨 主题插件卸载完成')
        },
      }
    }),
  }),
]

/**
 * 开发工具插件配置 - 仅开发环境
 */
export const devToolPluginConfigs = [
  createPluginConfig({
    name: 'devtools',
    version: '1.0.0',
    condition: () => process.env.NODE_ENV === 'development',
    factory: async () => {
      console.log('🛠️ 创建开发工具插件...')
      return {
        name: 'devtools',
        version: '1.0.0',
        install: async () => {
          console.log('🛠️ 开发工具插件安装完成')
          // 可以在这里添加开发工具的初始化逻辑
        },
        uninstall: async () => {
          console.log('🛠️ 开发工具插件卸载完成')
        },
      }
    },
  }),
]

/**
 * 初始化插件加载器
 */
export function initializePluginLoader(): void {
  console.log('🔧 初始化插件加载器...')

  // 注册所有插件配置
  pluginLoader.registerAll([
    ...corePluginConfigs,
    ...featurePluginConfigs,
    ...devToolPluginConfigs,
  ])

  console.log('✅ 插件加载器初始化完成')
  console.log('📊 插件统计:', pluginLoader.getStats())
}

/**
 * 获取核心插件列表
 */
export function getCorePlugins(): string[] {
  return corePluginConfigs.map(config => config.name)
}

/**
 * 获取功能插件列表
 */
export function getFeaturePlugins(): string[] {
  return featurePluginConfigs.map(config => config.name)
}

/**
 * 获取开发工具插件列表
 */
export function getDevToolPlugins(): string[] {
  return devToolPluginConfigs.map(config => config.name)
}

/**
 * 预加载功能插件
 */
export function preloadFeaturePlugins(): void {
  console.log('🔄 开始预加载功能插件...')

  featurePluginConfigs.forEach(config => {
    pluginLoader.preload(config.name)
  })

  // 预加载开发工具插件
  if (process.env.NODE_ENV === 'development') {
    devToolPluginConfigs.forEach(config => {
      pluginLoader.preload(config.name)
    })
  }
}

/**
 * 获取插件加载性能报告
 */
export function getPerformanceReport(): {
  totalPlugins: number
  loadedPlugins: number
  loadingPlugins: number
  loadTime: number
} {
  const stats = pluginLoader.getStats()

  return {
    totalPlugins: stats.registered,
    loadedPlugins: stats.loaded,
    loadingPlugins: stats.loading,
    loadTime: performance.now(), // 这里可以记录实际的加载时间
  }
}
