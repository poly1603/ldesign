/**
 * 路由配置文件
 * 配置应用的路由规则，包括传统组件路由和模板路由
 */

import type { RouteRecordRaw } from '@ldesign/router'
import Home from '../pages/Home.vue'

/**
 * 路由配置
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: '首页',
      description: 'LDesign Router 首页展示',
    },
  },
  {
    path: '/login',
    name: 'login',
    // 使用模板系统而非传统组件
    meta: {
      title: '登录',
      description: '用户登录页面',
      // 模板路由配置
      template: 'login',
      templateCategory: 'pages',
      templateConfig: {
        enableCache: true,
        autoScan: true,
        defaultDevice: 'desktop',
        enableHMR: process.env.NODE_ENV === 'development',
        debug: process.env.NODE_ENV === 'development',
        enablePerformanceMonitor: process.env.NODE_ENV === 'development',
      },
    },
  },
]

/**
 * 路由器配置选项
 */
export const routerConfig = {
  // 路由模式
  mode: 'hash' as const,

  // 基础路径
  base: '/',

  // 启用模板路由功能
  enableTemplateRoutes: true,

  // 设备适配配置
  deviceConfig: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 992,
    },
    defaultDevice: 'desktop' as const,
  },

  // 性能配置
  performance: {
    enabled: process.env.NODE_ENV === 'development',
    enableDetailedMetrics: true,
    enableMemoryTracking: true,
    enableNavigationTiming: true,
    enableResourceTiming: true,
    enableUserTiming: true,
    enableCustomMetrics: true,
    enableReporting: false,
    reportingInterval: 5000,
    maxMetricsHistory: 100,
    enableConsoleOutput: true,
    enableWarnings: true,
  },

  // 缓存配置
  cache: {
    enabled: true,
    strategy: 'lru' as const,
    maxSize: 50,
    ttl: 30 * 60 * 1000, // 30分钟
  },

  // 预加载配置
  preload: {
    enabled: true,
    strategy: 'hover' as const,
    delay: 100,
    timeout: 10000,
    maxConcurrent: 3,
    enableRetry: true,
    retryAttempts: 2,
    retryDelay: 1000,
  },

  // 动画配置
  animation: {
    enabled: true,
    defaultTransition: 'fade' as const,
    duration: 300,
    easing: 'ease-in-out',
    customTransitions: {
      slide: {
        enterActiveClass: 'slide-enter-active',
        leaveActiveClass: 'slide-leave-active',
        enterFromClass: 'slide-enter-from',
        leaveToClass: 'slide-leave-to',
      },
    },
  },

  // 全局导航守卫
  beforeEach: (to: any, from: any, next: any) => {
    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - LDesign App`
    }

    // 记录导航日志
    console.log(`导航: ${from.path} -> ${to.path}`)

    next()
  },

  afterEach: (to: any, from: any) => {
    // 导航完成后的处理
    console.log(`导航完成: ${to.path}`)
  },
}

/**
 * Engine 插件配置
 */
export const enginePluginConfig = {
  routes,
  ...routerConfig,

  // Engine 特定配置
  enableEngineIntegration: true,

  // 状态管理集成
  stateIntegration: {
    enabled: true,
    syncRoute: true,
    syncQuery: true,
    syncParams: true,
  },

  // 事件系统集成
  eventIntegration: {
    enabled: true,
    emitNavigationEvents: true,
    emitRouteChangeEvents: true,
    emitErrorEvents: true,
  },

  // 生命周期钩子集成
  lifecycleIntegration: {
    enabled: true,
    hookIntoComponentLifecycle: true,
    hookIntoRouteLifecycle: true,
  },
}
