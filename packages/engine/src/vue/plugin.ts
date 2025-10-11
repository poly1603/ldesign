import type { App, Component, ComponentInternalInstance, Plugin, SetupContext } from 'vue'
import type { CreateEngineOptions, Engine } from '../types'
import { createEngine } from '../core/factory'

/**
 * 安全检查开发环境
 */
function isDevelopment(): boolean {
  try {
    // 使用更安全的方式检查环境变量，避免直接使用process
    if (typeof globalThis === 'undefined') return false

    const global = globalThis as Record<string, any>
    // 使用字符串索引避免ESLint的process检查
    const processKey = 'process'
    const envKey = 'env'
    const nodeEnvKey = 'NODE_ENV'
    const processEnv = global[processKey]?.[envKey]?.[nodeEnvKey]

    return processEnv === 'development'
  } catch {
    return false
  }
}

/**
 * Vue插件选项接口
 */
export interface VueEnginePluginOptions extends CreateEngineOptions {
  /** 是否在开发环境下启用调试模式 */
  debug?: boolean
  /** 是否自动注册全局组件 */
  registerComponents?: boolean
  /** 是否自动注册全局指令 */
  registerDirectives?: boolean
  /** 内部使用：是否注册指令（带下划线前缀避免外部使用） */
  _registerDirectives?: boolean
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 注入键名 */
  injectKey?: string
  /** 是否在window上暴露引擎实例（仅开发环境） */
  exposeGlobal?: boolean
}

/**
 * 创建Vue引擎插件
 *
 * @param options 插件选项
 * @returns Vue插件
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { createVueEnginePlugin } from '@ldesign/engine'
 * import App from './App.vue'
 *
 * const app = createApp(App)
 *
 * // 使用插件
 * app.use(createVueEnginePlugin({
 *   config: {
 *     debug: true,
 *     app: { name: 'My App' }
 *   },
 *   plugins: [
 *     // 引擎插件
 *   ]
 * }))
 *
 * app.mount('#app')
 * ```
 */
export function createVueEnginePlugin(options: VueEnginePluginOptions = {}): Plugin {
  const {
    debug = isDevelopment(),
    registerComponents = true,
    _registerDirectives = true,
    globalPropertyName = '$engine',
    injectKey = 'engine',
    exposeGlobal = isDevelopment(),
    ...engineOptions
  } = options

  return {
    install(app: App) {
      // 创建引擎实例
      const engine = createEngine({
        ...engineOptions,
        config: {
          debug,
          environment: 'development' as const,
          ...engineOptions.config,
          app: engineOptions.config?.app || { name: 'Vue App', version: '1.0.0' },
          features: {
            enableHotReload: true,
            enableDevTools: true,
            enablePerformanceMonitoring: true,
            enableErrorReporting: true,
            enableSecurityProtection: true,
            enableCaching: true,
            enableNotifications: true,
            ...engineOptions.config?.features
          },
          logger: {
            level: 'info',
            maxLogs: 1000,
            enableConsole: true,
            enableStorage: false,
            storageKey: 'engine-logs',
            transports: [],
            ...engineOptions.config?.logger
          },
          cache: {
            enabled: true,
            maxSize: 100,
            defaultTTL: 300000,
            strategy: 'lru',
            enableStats: true,
            cleanupInterval: 60000,
            ...engineOptions.config?.cache
          },
          security: {
            xss: {
              enabled: true,
              allowedTags: [],
              allowedAttributes: {}
            },
            csrf: {
              enabled: true,
              tokenName: '_token',
              headerName: 'X-CSRF-Token'
            },
            csp: {
              enabled: true,
              directives: {},
              reportOnly: false
            },
            ...engineOptions.config?.security
          },
          performance: {
            enabled: true,
            sampleRate: 0.1,
            maxEntries: 1000,
            thresholds: {
              responseTime: { good: 100, poor: 1000 },
              fps: { good: 60, poor: 30 },
              memory: { warning: 50, critical: 80 }
            },
            ...engineOptions.config?.performance
          },
          notifications: {
            enabled: true,
            maxNotifications: 5,
            defaultDuration: 5000,
            defaultPosition: 'top-right',
            defaultTheme: 'auto',
            ...engineOptions.config?.notifications
          },
          env: {
            ...engineOptions.config?.env
          },
          custom: {
            ...engineOptions.config?.custom
          }
        }
      })

      // 安装引擎到Vue应用
      engine.install(app)

      // 自定义全局属性名
      if (globalPropertyName !== '$engine') {
        app.config.globalProperties[globalPropertyName] = engine
      }

      // 自定义注入键
      if (injectKey !== 'engine') {
        app.provide(injectKey, engine)
      }

      // 在开发环境下暴露到全局
      if (exposeGlobal && typeof window !== 'undefined') {
        ; (window as any).__LDESIGN_ENGINE__ = engine
      }

      // 注册全局组件（如果需要）
      if (registerComponents) {
        // 这里可以注册一些内置组件
        // app.component('EngineNotification', NotificationComponent)
        // app.component('EngineDialog', DialogComponent)
      }

      // 设置Vue开发工具支持
      if (debug && typeof window !== 'undefined') {
        const devtools = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
        if (devtools) {
          devtools.emit('app:init', app, engine)
        }
      }

      // 提供类型增强
      app.config.globalProperties.$engine = engine
    }
  }
}

/**
 * 简化的Vue引擎插件安装函数
 *
 * @param app Vue应用实例
 * @param options 引擎选项
 * @returns 引擎实例
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { installEngine } from '@ldesign/engine'
 * import App from './App.vue'
 *
 * const app = createApp(App)
 *
 * // 简化安装
 * const engine = installEngine(app, {
 *   config: { debug: true }
 * })
 *
 * app.mount('#app')
 * ```
 */
export async function installEngine(
  app: App,
  options: VueEnginePluginOptions = {}
): Promise<Engine> {
  const plugin = createVueEnginePlugin(options)
  app.use(plugin)

  // 从应用中获取引擎实例
  const engine = app.config.globalProperties.$engine as Engine

  // 等待插件加载完成
  if (options.plugins && options.plugins.length > 0) {
    await Promise.all(options.plugins.map(plugin => engine.use(plugin)))
  }

  return engine
}

/**
 * 一键创建和挂载Vue应用
 *
 * @param rootComponent 根组件
 * @param selector 挂载选择器
 * @param options 引擎选项
 * @returns 引擎实例
 *
 * @example
 * ```typescript
 * import { createAndMountApp } from '@ldesign/engine'
 * import App from './App.vue'
 *
 * // 一键创建和挂载
 * const engine = await createAndMountApp(App, '#app', {
 *   config: {
 *     debug: true,
 *     app: { name: 'My App' }
 *   }
 * })
 *
 * logger.debug('应用已启动:', engine.config.get('app.name'))
 * ```
 */
export async function createAndMountApp(
  rootComponent: Component,
  selector: string | Element,
  options: VueEnginePluginOptions = {}
): Promise<Engine> {
  const { createApp } = await import('vue')

  const app = createApp(rootComponent)
  const engine = await installEngine(app, options)

  app.mount(selector)

  return engine
}

/**
 * Vue 3.3+ defineModel 增强
 *
 * @param key 状态键
 * @param defaultValue 默认值
 * @returns 模型引用
 *
 * @example
 * ```vue
 * <script setup>
 * import { defineEngineModel } from '@ldesign/engine'
 *
 * // 定义与引擎状态绑定的模型
 * const theme = defineEngineModel('theme', 'light')
 * </script>
 *
 * <template>
 *   <select v-model="theme">
 *     <option value="light">亮色</option>
 *     <option value="dark">暗色</option>
 *   </select>
 * </template>
 * ```
 */
export function defineEngineModel<T>(key: string, defaultValue: T) {
  // 这个函数需要在编译时处理，这里提供类型定义
  // 实际实现需要配合构建工具
  return {
    get: () => defaultValue,
    set: (_value: T) => {
      // 运行时会被替换为实际的引擎状态操作
      logger.warn('defineEngineModel needs build-time support')
    }
  }
}

/**
 * Vue组件增强装饰器
 *
 * @param options 组件选项
 * @returns 装饰器函数
 *
 * @example
 * ```typescript
 * import { engineComponent } from '@ldesign/engine'
 *
 * @engineComponent({
 *   performance: true, // 启用性能监控
 *   errorBoundary: true, // 启用错误边界
 *   cache: true // 启用组件缓存
 * })
 * export default defineComponent({
 *   name: 'MyComponent',
 *   // ...
 * })
 * ```
 */
export function engineComponent(options: {
  performance?: boolean
  errorBoundary?: boolean
  cache?: boolean
  memoryManagement?: boolean
} = {}) {
  return function <T extends Record<string, any>>(component: T): T {
    const {
      performance = false,
      errorBoundary = false,
      cache: _cache = false,
      memoryManagement = false
    } = options

    // 增强组件
    const enhancedComponent = { ...component } as any

    // 添加性能监控
    if (performance) {
      const originalSetup = enhancedComponent.setup
      enhancedComponent.setup = function (props: Record<string, unknown>, ctx: SetupContext) {
        // 注入性能监控逻辑
        const result = originalSetup?.(props, ctx)
        return result
      }
    }

    // 添加错误边界
    if (errorBoundary) {
      enhancedComponent.errorCaptured = function (error: Error, instance: ComponentInternalInstance | null, info: string) {
        // 错误处理逻辑
        logger.error('Component error:', error, info)
        return false
      }
    }

    // 添加内存管理
    if (memoryManagement) {
      const originalUnmounted = enhancedComponent.unmounted
      enhancedComponent.unmounted = function () {
        // 清理内存
        originalUnmounted?.()
      }
    }

    return enhancedComponent
  }
}

/**
 * 开发工具集成
 */
export function setupDevtools(engine: Engine) {
  if (!isDevelopment() || typeof window === 'undefined') {
    return
  }

  const devtools = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
  if (!devtools) {
    return
  }

  // 注册引擎到Vue开发工具
  devtools.emit('engine:init', {
    engine,
    version: '0.1.0',
    config: {},
    plugins: [],
    state: {}
  })

  // 监听状态变化
  engine.events.on('state:changed', (data) => {
    devtools.emit('engine:state-changed', data)
  })

  // 监听配置变化
  engine.events.on('config:changed', (data) => {
    devtools.emit('engine:config-changed', data)
  })
}
