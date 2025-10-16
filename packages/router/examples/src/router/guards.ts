/**
 * 路由守卫配置
 * 
 * 本文件展示了 @ldesign/router 的路由守卫功能：
 * 1. 全局前置守卫
 * 2. 全局后置钩子
 * 3. 权限检查
 * 4. 页面标题设置
 * 5. 加载状态管理
 */

import type { Router } from '@ldesign/router'

/**
 * 模拟用户认证状态
 */
let isAuthenticated = false

/**
 * 模拟用户权限
 */
const userPermissions = ['read', 'write']

/**
 * 设置路由守卫
 * @param router 路由器实例
 */
export function setupGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    
    // 显示加载状态
    setLoading(true)

    try {
      // 1. 检查路由是否需要认证
      if (to.meta?.requiresAuth && !isAuthenticated) {
                next('/login')
        return
      }

      // 2. 检查用户权限
      if (to.meta?.requiredPermissions) {
        const requiredPermissions = to.meta.requiredPermissions as string[]
        const hasPermission = requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        )

        if (!hasPermission) {
                    next('/error/403')
          return
        }
      }

      // 3. 检查设备支持（如果启用了设备适配）
      if (to.meta?.supportedDevices) {
        const supportedDevices = to.meta.supportedDevices as string[]
        const currentDevice = getCurrentDevice()
        
        if (!supportedDevices.includes(currentDevice)) {
                    const message = to.meta.unsupportedMessage || '当前设备不支持此功能'
          next({
            path: '/device-unsupported',
            query: {
              device: currentDevice,
              from: to.path,
              message
            }
          })
          return
        }
      }

      // 4. 模拟异步权限检查
      if (to.meta?.asyncCheck) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // 5. 允许导航
      next()

    } catch (error) {
      console.error('❌ 路由守卫错误:', error)
      next('/error/500')
    }
  })

  // 全局解析守卫
  router.beforeResolve(async (to, from, next) => {
    // 在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后调用
        
    // 可以在这里进行最后的检查
    next()
  })

  // 全局后置钩子
  router.afterEach((to, from, failure) => {
    // 隐藏加载状态
    setLoading(false)

    if (failure) {
      console.error('❌ 路由导航失败:', failure)
      return
    }

    
    // 设置页面标题
    updatePageTitle(to)

    // 发送页面浏览统计
    trackPageView(to)

    // 更新面包屑
    updateBreadcrumb(to)
  })

  // 路由错误处理
  router.onError((error, to, from) => {
    console.error('💥 路由错误:', error)
    
    // 隐藏加载状态
    setLoading(false)

    // 根据错误类型进行处理
    if (error.message.includes('Loading chunk')) {
      // 代码分割加载失败，通常是网络问题
            window.location.reload()
    } else if (error.message.includes('Failed to fetch')) {
      // 网络错误
            router.push('/error/offline')
    } else {
      // 其他错误
      router.push('/error/500')
    }
  })
}

/**
 * 获取当前设备类型
 */
function getCurrentDevice(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  const width = window.innerWidth

  if (width < 768) {
    return 'mobile'
  } else if (width < 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * 设置加载状态
 */
function setLoading(loading: boolean) {
  // 这里可以更新全局加载状态
  const event = new CustomEvent('router:loading', { detail: { loading } })
  window.dispatchEvent(event)
}

/**
 * 更新页面标题
 */
function updatePageTitle(to: any) {
  const title = to.meta?.title
  if (title) {
    document.title = `${title} - @ldesign/router Examples`
  } else {
    document.title = '@ldesign/router Examples'
  }
}

/**
 * 发送页面浏览统计
 */
function trackPageView(to: any) {
  // 模拟发送统计数据
  if (import.meta.env?.PROD) {
    // 这里可以发送统计数据
    console.log('Page viewed:', {
      path: to.path,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * 更新面包屑
 */
function updateBreadcrumb(to: any) {
  // 生成面包屑数据
  const breadcrumb = generateBreadcrumb(to)
  
  // 发送面包屑更新事件
  const event = new CustomEvent('router:breadcrumb', { detail: { breadcrumb } })
  window.dispatchEvent(event)
}

/**
 * 生成面包屑数据
 */
function generateBreadcrumb(route: any) {
  const matched = route.matched
  const breadcrumb = []

  for (const record of matched) {
    if (record.meta?.title) {
      breadcrumb.push({
        name: record.name,
        path: record.path,
        title: record.meta.title
      })
    }
  }

  return breadcrumb
}

/**
 * 模拟登录功能
 */
export function login(username: string, password: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        isAuthenticated = true
        resolve(true)
      } else {
        resolve(false)
      }
    }, 1000)
  })
}

/**
 * 模拟登出功能
 */
export function logout(): void {
  isAuthenticated = false
}

/**
 * 获取认证状态
 */
export function getAuthStatus(): boolean {
  return isAuthenticated
}
