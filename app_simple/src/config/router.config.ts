/**
 * 路由器配置
 */

export const routerConfig = {
  // 路由模式
  mode: 'history' as const, // hash | history
  base: '/',

  // 预设配置
  preset: 'spa' as const, // spa | mpa | ssr

  // 预加载配置
  preload: {
    enabled: true,
    strategy: 'hover' as const, // hover | idle | visible
    delay: 200,
    threshold: 0.5
  },

  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 20,
    strategy: 'memory' as const, // memory | session | local
    ttl: 10 * 60 * 1000 // 10分钟
  },

  // 动画配置
  animation: {
    enabled: true,
    type: 'fade' as const, // fade | slide | zoom
    duration: 300,
    easing: 'ease-in-out'
  },

  // 性能优化
  performance: {
    prefetch: true,
    prerender: false,
    lazyLoad: true
  },

  // 错误处理
  errorHandling: {
    redirect404: '/404',
    redirect403: '/403',
    redirect500: '/500'
  }
}