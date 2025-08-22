/**
 * 路由器配置
 * 展示 LDesign Router 的所有功能特性
 */

import { 
  createRouter as createLDesignRouter, 
  createWebHistory,
  createAnimationPlugin,
  createCachePlugin,
  createPerformancePlugin,
  createPreloadPlugin,
  type RouteRecordRaw 
} from '@ldesign/router'
import { routes } from './routes'

/**
 * 创建路由器实例
 */
export function createRouter() {
  const router = createLDesignRouter({
    // 历史模式
    history: createWebHistory(import.meta.env.BASE_URL),
    
    // 路由配置
    routes,
    
    // 全局路由配置
    linkActiveClass: 'router-link-active',
    linkExactActiveClass: 'router-link-exact-active',
    
    // 滚动行为
    scrollBehavior(to, from, savedPosition) {
      // 如果有保存的位置（浏览器前进/后退）
      if (savedPosition) {
        return savedPosition
      }
      
      // 如果有锚点
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth'
        }
      }
      
      // 默认滚动到顶部
      return { top: 0, behavior: 'smooth' }
    },
    
    // 插件配置
    plugins: [
      // 动画插件
      createAnimationPlugin({
        defaultAnimation: 'fade',
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        customAnimations: {
          'slide-up': {
            name: 'slide-up',
            duration: 400,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          },
          'zoom-in': {
            name: 'zoom-in', 
            duration: 250,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          }
        }
      }),
      
      // 缓存插件
      createCachePlugin({
        strategy: 'lru',
        maxSize: 20,
        ttl: 5 * 60 * 1000, // 5分钟
        keyGenerator: (route) => `${route.name}-${JSON.stringify(route.params)}`,
        shouldCache: (route) => {
          // 只缓存特定路由
          const cacheableRoutes = [
            'Dashboard',
            'UserList', 
            'ProductList',
            'Settings'
          ]
          return cacheableRoutes.includes(route.name as string)
        }
      }),
      
      // 性能监控插件
      createPerformancePlugin({
        warningThreshold: 100,
        errorThreshold: 500,
        onWarning: (metrics) => {
          console.warn('⚠️ 路由性能警告:', metrics)
        },
        onError: (metrics) => {
          console.error('❌ 路由性能错误:', metrics)
        },
        trackMemoryUsage: true,
        trackComponentLoadTime: true
      }),
      
      // 预加载插件
      createPreloadPlugin({
        strategy: 'hover',
        delay: 200,
        maxConcurrent: 3,
        priority: {
          '/dashboard': 'high',
          '/users': 'medium',
          '/products': 'medium',
          '/settings': 'low'
        },
        onPreloadStart: (route) => {
          console.log('🔄 开始预加载:', route.path)
        },
        onPreloadComplete: (route) => {
          console.log('✅ 预加载完成:', route.path)
        },
        onPreloadError: (route, error) => {
          console.error('❌ 预加载失败:', route.path, error)
        }
      })
    ],
    
    // 开发模式配置
    development: import.meta.env.DEV ? {
      logLevel: 'debug',
      showPerformanceWarnings: true,
      logRouteChanges: true,
      trackComponentLoadTime: true
    } : undefined
  })
  
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - LDesign Router 示例`
    }
    
    // 权限检查
    if (to.meta.requiresAuth) {
      const isAuthenticated = localStorage.getItem('auth-token')
      if (!isAuthenticated) {
        next('/login')
        return
      }
    }
    
    // 角色权限检查
    if (to.meta.roles) {
      const userRole = localStorage.getItem('user-role')
      if (!userRole || !to.meta.roles.includes(userRole)) {
        next('/unauthorized')
        return
      }
    }
    
    next()
  })
  
  // 全局后置钩子
  router.afterEach((to, from) => {
    // 页面访问统计
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: to.path
      })
    }
    
    // 用户行为追踪
    console.log(`📊 页面访问: ${from.path} -> ${to.path}`)
  })
  
  // 错误处理
  router.onError((error, to, from) => {
    console.error('🚨 路由错误:', error)
    console.error('目标路由:', to)
    console.error('来源路由:', from)
    
    // 错误上报
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          section: 'router'
        },
        extra: {
          to: to.path,
          from: from.path
        }
      })
    }
  })
  
  return router
}

// 导出路由器类型
export type Router = ReturnType<typeof createRouter>
