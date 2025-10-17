/**
 * Template 插件配置
 */

export const templateConfig = {
  // 基础配置
  autoInit: true,
  autoDetect: true,
  defaultDevice: 'desktop',

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 600000, // 10分钟
    maxSize: 100
  },

  // 用户偏好持久化
  rememberPreferences: true,
  preferencesKey: 'app-template-prefs',

  // 预加载策略
  preload: false,
  preloadStrategy: 'lazy',

  // UI 配置
  ui: {
    defaultStyle: 'cards',
    display: {
      preview: true,
      description: true,
      metadata: true,
      aspectRatio: '3/2'
    },
    styleByCategory: {
      'login': 'cards',
      'dashboard': 'grid',
      'profile': 'list',
      'settings': 'compact'
    },
    features: {
      search: false,
      filter: false,
      groupBy: 'none'
    }
  },

  // 动画配置
  animation: {
    defaultAnimation: 'fade-slide',
    transitionMode: 'out-in',
    duration: 300,
    customAnimations: {
      'login/default->login/split': 'flip',
      'login/split->login/default': 'flip',
      'dashboard/default->dashboard/sidebar': 'slide',
      'dashboard/sidebar->dashboard/tabs': 'fade'
    },
    animationByCategory: {
      'login': 'scale',
      'dashboard': 'slide',
      'profile': 'fade',
      'settings': 'none'
    },
    animationByDevice: {
      'mobile': 'slide',
      'tablet': 'fade-slide',
      'desktop': 'fade'
    }
  },

  // 钩子函数
  hooks: {
    beforeLoad: async (templatePath: string) => {
      if (import.meta.env.DEV) {
        console.log(`[Template] Loading: ${templatePath}`)
      }
    },
    afterLoad: async (templatePath: string, component: any) => {
      if (import.meta.env.DEV) {
        console.log(`[Template] Loaded: ${templatePath}`, component)
      }
    },
    beforeTransition: (from: string, to: string) => {
      if (import.meta.env.DEV) {
        console.log(`[Template] Transition: ${from} -> ${to}`)
      }
    },
    afterTransition: (from: string, to: string) => {
      if (import.meta.env.DEV) {
        console.log(`[Template] Transitioned: ${from} -> ${to}`)
      }
    },
    onError: (error: Error) => {
      console.error('[Template] Error:', error)
    }
  },

  // 性能监控
  performance: import.meta.env.DEV
}