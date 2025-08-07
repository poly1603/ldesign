/**
 * LDesign 统一应用启动器
 * 
 * 提供统一的集成启动机制，自动集成所有 LDesign 模块
 */

import type { App as VueApp } from 'vue'
import type { ColorMode } from '@ldesign/color'
import { createApp, presets } from '@ldesign/engine'
import { ThemePlugin } from '@ldesign/color/vue'
import { generateColorConfig, generateColorScales, injectThemeVariables } from '@ldesign/color'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import { DevicePlugin } from '@ldesign/device/vue'
import { HttpPlugin } from '@ldesign/http/vue'
import { createI18n } from '@ldesign/i18n/vue'
import { createRouter, createWebHistory, createWebHashHistory, RouterView, RouterLink } from '@ldesign/router/vue'
import { createStoreProviderPlugin } from '@ldesign/store/vue'
import { TemplatePlugin } from '@ldesign/template/vue'

/**
 * LDesign 应用配置选项
 */
export interface LDesignAppOptions {
  /** 应用名称 */
  appName?: string
  /** 应用版本 */
  version?: string
  /** 应用描述 */
  description?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 要启用的模块列表 */
  modules?: {
    engine?: boolean
    color?: boolean
    crypto?: boolean
    device?: boolean
    http?: boolean
    i18n?: boolean
    router?: boolean
    store?: boolean
    template?: boolean
  }
  /** 模块配置 */
  moduleConfig?: {
    color?: {
      defaultTheme?: string
      defaultMode?: ColorMode
      autoDetect?: boolean
    }
    crypto?: {
      defaultAlgorithm?: string
      keySize?: number
    }
    device?: {
      enableBattery?: boolean
      enableGeolocation?: boolean
      enableNetwork?: boolean
    }
    http?: {
      baseURL?: string
      timeout?: number
    }
    i18n?: {
      defaultLocale?: string
      fallbackLocale?: string
    }
    router?: {
      mode?: 'history' | 'hash' | 'memory'
      base?: string
      routes?: any[]
    }
    store?: {
      enableDevtools?: boolean
      enablePersist?: boolean
    }
    template?: {
      enableLazyLoading?: boolean
      enablePerformanceMonitor?: boolean
      defaultTemplate?: string
    }
  }
  /** 事件回调 */
  onModuleIntegrated?: (moduleName: string) => void
  onError?: (moduleName: string, error: Error) => void
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<LDesignAppOptions> = {
  appName: 'LDesign Application',
  version: '1.0.0',
  description: 'A comprehensive LDesign application',
  debug: true,
  modules: {
    engine: true,
    color: true,
    crypto: true,
    device: true,
    http: true,
    i18n: true,
    router: false,
    store: false,
    template: false
  },
  moduleConfig: {
    color: {
      defaultTheme: 'default',
      defaultMode: 'light',
      autoDetect: true
    },
    crypto: {
      defaultAlgorithm: 'aes',
      keySize: 256
    },
    device: {
      enableBattery: true,
      enableGeolocation: true,
      enableNetwork: true
    },
    http: {
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 10000
    },
    i18n: {
      defaultLocale: 'zh-CN',
      fallbackLocale: 'en-US'
    },
    router: {
      mode: 'history',
      base: '/',
      routes: []
    },
    store: {
      enableDevtools: true,
      enablePersist: true
    },
    template: {
      enableLazyLoading: true,
      enablePerformanceMonitor: true,
      defaultTemplate: 'default'
    }
  },
  onModuleIntegrated: (moduleName: string) => {
    console.log(`✅ 模块已集成: ${moduleName}`)
  },
  onError: (moduleName: string, error: Error) => {
    console.error(`❌ 模块集成失败: ${moduleName}`, error)
  }
}

/**
 * LDesign 应用实例
 */
export interface LDesignApp {
  /** 引擎实例 */
  engine: any
  /** Vue 应用实例 */
  vueApp: VueApp
  /** 挂载应用到指定元素 */
  mount: (selector: string) => void
  /** 卸载应用 */
  unmount: () => void
  /** 获取模块状态 */
  getModuleStatus: () => Record<string, boolean>
}

/**
 * 创建 LDesign 应用
 */
export function createLDesignApp(
  rootComponent: any,
  options: Partial<LDesignAppOptions> = {}
): LDesignApp {
  // 合并配置
  const config = { ...DEFAULT_OPTIONS, ...options }

  // 深度合并模块配置
  const moduleConfig = {
    color: { ...DEFAULT_OPTIONS.moduleConfig.color, ...options.moduleConfig?.color },
    crypto: { ...DEFAULT_OPTIONS.moduleConfig.crypto, ...options.moduleConfig?.crypto },
    device: { ...DEFAULT_OPTIONS.moduleConfig.device, ...options.moduleConfig?.device },
    http: { ...DEFAULT_OPTIONS.moduleConfig.http, ...options.moduleConfig?.http },
    i18n: { ...DEFAULT_OPTIONS.moduleConfig.i18n, ...options.moduleConfig?.i18n },
    router: { ...DEFAULT_OPTIONS.moduleConfig.router, ...options.moduleConfig?.router },
    store: { ...DEFAULT_OPTIONS.moduleConfig.store, ...options.moduleConfig?.store },
    template: { ...DEFAULT_OPTIONS.moduleConfig.template, ...options.moduleConfig?.template }
  }

  const modules = { ...DEFAULT_OPTIONS.modules, ...options.modules }

  console.log('🚀 创建 LDesign 应用...')
  console.log('📋 配置:', { config, modules })

  // 创建引擎应用
  const engine = createApp(rootComponent, {
    ...presets.development(),
    config: {
      debug: config.debug,
      appName: config.appName,
      version: config.version,
      description: config.description
    }
  })

  // 获取 Vue 应用实例
  const vueApp = engine.getApp()
  if (!vueApp) {
    throw new Error('无法获取 Vue 应用实例')
  }

  // 模块状态跟踪
  const moduleStatus: Record<string, boolean> = {}

  // 安装模块的辅助函数
  const installModule = async (
    moduleName: string,
    installer: () => Promise<void> | void
  ): Promise<void> => {
    if (!modules[moduleName as keyof typeof modules]) {
      console.log(`⏭️ 跳过模块: ${moduleName}`)
      return
    }

    try {
      console.log(`🔧 安装模块: ${moduleName}`)
      await installer()
      moduleStatus[moduleName] = true
      config.onModuleIntegrated(moduleName)

      // 触发引擎事件
      setTimeout(() => {
        engine.events.emit('module:integrated', moduleName)
      }, 100)
    } catch (error) {
      moduleStatus[moduleName] = false
      config.onError(moduleName, error as Error)
    }
  }

  // 安装所有模块
  const installAllModules = async (): Promise<void> => {
    console.log('📦 开始安装模块...')

    // 1. 安装主题模块
    await installModule('color', () => {
      vueApp.use(ThemePlugin, {
        defaultTheme: moduleConfig.color?.defaultTheme,
        defaultMode: moduleConfig.color?.defaultMode,
        autoDetect: moduleConfig.color?.autoDetect,
        onThemeChanged: async (theme: string, mode: ColorMode) => {
          console.log(`🎨 主题已切换: ${theme} - ${mode}`)

          try {
            const primaryColor = mode === 'light' ? '#1677ff' : '#4096ff'
            const colorConfig = generateColorConfig(primaryColor)
            const validColors = Object.fromEntries(
              Object.entries(colorConfig).filter(([_, value]) => value !== undefined)
            ) as Record<string, string>
            const scales = generateColorScales(validColors, mode)
            injectThemeVariables(colorConfig, scales, undefined, mode)
          } catch (error) {
            console.warn('CSS变量注入失败:', error)
          }
        },
        onError: (error: Error) => {
          console.error('🚨 主题错误:', error)
        }
      })
    })

    // 2. 安装加密模块
    await installModule('crypto', () => {
      vueApp.use(CryptoPlugin, {
        defaultAlgorithm: moduleConfig.crypto?.defaultAlgorithm,
        keySize: moduleConfig.crypto?.keySize,
        enablePerformanceMonitoring: true,
        onCryptoOperation: (operation: string, algorithm: string, duration: number) => {
          console.log(`🔐 加密操作: ${operation} (${algorithm}) - ${duration}ms`)
        },
        onError: (error: Error) => {
          console.error('🚨 加密错误:', error)
        }
      })
    })

    // 3. 安装设备检测模块
    await installModule('device', () => {
      vueApp.use(DevicePlugin, {
        enableBattery: moduleConfig.device?.enableBattery,
        enableGeolocation: moduleConfig.device?.enableGeolocation,
        enableNetwork: moduleConfig.device?.enableNetwork,
        enableOrientation: true,
        enableResize: true,
        onDeviceChange: (deviceInfo: any) => {
          console.log('📱 设备信息变化:', deviceInfo)
        },
        onOrientationChange: (orientation: string) => {
          console.log('🔄 屏幕方向变化:', orientation)
        },
        onNetworkChange: (networkInfo: any) => {
          console.log('🌐 网络状态变化:', networkInfo)
        },
        onError: (error: Error) => {
          console.error('🚨 设备检测错误:', error)
        }
      })
    })

    // 4. 安装 HTTP 模块
    await installModule('http', () => {
      vueApp.use(HttpPlugin, {
        globalConfig: {
          baseURL: moduleConfig.http?.baseURL,
          timeout: moduleConfig.http?.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        },
        enableCache: true,
        enableRetry: true,
        retryCount: 3,
        retryDelay: 1000,
        onRequest: (config: any) => {
          console.log('🌐 HTTP 请求:', config.url)
          return config
        },
        onResponse: (response: any) => {
          console.log('📡 HTTP 响应:', response.status)
          return response
        },
        onError: (error: Error) => {
          console.error('🚨 HTTP 错误:', error)
          return Promise.reject(error)
        }
      })
    })

    // 5. 安装国际化模块
    await installModule('i18n', () => {
      const i18nPlugin = createI18n()
      vueApp.use(i18nPlugin, {
        globalInjection: true,
        globalPropertyName: '$t'
      })
    })

    // 6. 安装路由模块
    await installModule('router', () => {
      const router = createRouter({
        history: moduleConfig.router?.mode === 'hash'
          ? createWebHashHistory()
          : createWebHistory(moduleConfig.router?.base),
        routes: moduleConfig.router?.routes || [
          {
            path: '/',
            name: 'home',
            component: { template: '<div>首页</div>' }
          },
          {
            path: '/about',
            name: 'about',
            component: { template: '<div>关于</div>' }
          }
        ]
      })

      vueApp.use(router)

      // 注册路由组件
      vueApp.component('RouterView', RouterView)
      vueApp.component('RouterLink', RouterLink)
    })

    // 7. 安装状态管理模块
    await installModule('store', () => {
      const storePlugin = createStoreProviderPlugin({
        enableDevtools: moduleConfig.store?.enableDevtools,
        enablePersist: moduleConfig.store?.enablePersist,
        onStoreCreated: (storeName: string) => {
          console.log(`📦 Store 已创建: ${storeName}`)
        },
        onError: (error: Error) => {
          console.error('🚨 Store 错误:', error)
        }
      })
      vueApp.use(storePlugin)
    })

    // 8. 安装模板渲染模块
    await installModule('template', () => {
      vueApp.use(TemplatePlugin, {
        enableLazyLoading: moduleConfig.template?.enableLazyLoading,
        enablePerformanceMonitor: moduleConfig.template?.enablePerformanceMonitor,
        defaultTemplate: moduleConfig.template?.defaultTemplate,
        onTemplateLoaded: (templateName: string) => {
          console.log(`📄 模板已加载: ${templateName}`)
        },
        onError: (error: Error) => {
          console.error('🚨 模板错误:', error)
        }
      })
    })

    console.log('🎉 所有模块安装完成')
  }

  // 立即安装模块
  installAllModules().catch((error) => {
    console.error('❌ 模块安装过程中发生错误:', error)
  })

  // 返回应用实例
  return {
    engine,
    vueApp,
    mount: (selector: string) => {
      console.log(`🎯 挂载应用到: ${selector}`)
      engine.mount(selector)
    },
    unmount: () => {
      console.log('🔌 卸载应用')
      engine.unmount()
    },
    getModuleStatus: () => ({ ...moduleStatus })
  }
}

/**
 * 快速创建 LDesign 应用的便利函数
 */
export function quickCreateLDesignApp(rootComponent: any): LDesignApp {
  return createLDesignApp(rootComponent, {
    debug: true,
    modules: {
      engine: true,
      color: true,
      crypto: true,
      device: true,
      http: true,
      i18n: true,
      router: false,
      store: false,
      template: false
    }
  })
}
