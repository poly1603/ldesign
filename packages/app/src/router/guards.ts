import type { Router } from '@ldesign/router'
import type { Engine } from '@ldesign/engine'

/**
 * 设置路由守卫
 */
export function setupGuards(router: Router, engine: Engine) {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    try {
      engine.logger.debug('Route guard: beforeEach', { to: to.path, from: from.path })
      
      // 检查认证状态
      const requiresAuth = to.meta?.requiresAuth
      const isAuthenticated = await checkAuthentication(engine)
      
      if (requiresAuth && !isAuthenticated) {
        // 需要认证但未登录，重定向到登录页
        engine.logger.warn('Access denied: authentication required', { route: to.path })
        
        engine.notifications.show({
          type: 'warning',
          title: '需要登录',
          message: '请先登录后再访问该页面'
        })
        
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
      
      // 检查权限
      const requiredRoles = to.meta?.roles
      const requiredPermissions = to.meta?.permissions
      
      if (isAuthenticated && (requiredRoles || requiredPermissions)) {
        const hasPermission = await checkPermissions(engine, requiredRoles, requiredPermissions)
        
        if (!hasPermission) {
          engine.logger.warn('Access denied: insufficient permissions', { 
            route: to.path,
            requiredRoles,
            requiredPermissions
          })
          
          engine.notifications.show({
            type: 'error',
            title: '权限不足',
            message: '您没有访问该页面的权限'
          })
          
          next('/dashboard')
          return
        }
      }
      
      // 如果已登录且访问登录页，重定向到仪表板
      if (isAuthenticated && to.path === '/login') {
        next('/dashboard')
        return
      }
      
      // 发送路由守卫事件
      engine.events.emit('route:guard:before', { to, from })
      
      next()
    } catch (error) {
      engine.logger.error('Route guard error:', error)
      
      engine.notifications.show({
        type: 'error',
        title: '路由错误',
        message: '页面访问时发生错误'
      })
      
      next('/500')
    }
  })
  
  // 全局解析守卫
  router.beforeResolve(async (to, from, next) => {
    try {
      engine.logger.debug('Route guard: beforeResolve', { to: to.path })
      
      // 设置页面加载状态
      const globalState = engine.state.get('global')
      if (globalState) {
        globalState.setLoading(true)
      }
      
      // 预加载页面数据
      if (to.meta?.preload) {
        await preloadPageData(engine, to)
      }
      
      // 发送路由解析事件
      engine.events.emit('route:guard:resolve', { to, from })
      
      next()
    } catch (error) {
      engine.logger.error('Route resolve error:', error)
      next(false) // 取消导航
    }
  })
  
  // 全局后置钩子
  router.afterEach((to, from, failure) => {
    // 清除页面加载状态
    const globalState = engine.state.get('global')
    if (globalState) {
      globalState.setLoading(false)
    }
    
    if (failure) {
      engine.logger.error('Route navigation failed:', failure)
    } else {
      engine.logger.debug('Route guard: afterEach', { to: to.path, from: from.path })
      
      // 发送路由完成事件
      engine.events.emit('route:guard:after', { to, from })
      
      // 记录页面访问
      recordPageVisit(engine, to)
    }
  })
  
  engine.logger.info('Route guards setup completed')
}

/**
 * 检查用户认证状态
 */
async function checkAuthentication(engine: Engine): Promise<boolean> {
  try {
    const globalState = engine.state.get('global')
    if (globalState?.isLoggedIn) {
      return true
    }
    
    // 检查本地存储的token
    const token = localStorage.getItem('auth-token')
    if (!token) {
      return false
    }
    
    // 验证token有效性
    const http = engine.state.get('http')
    if (http) {
      const response = await http.get('/auth/verify')
      if (response.data?.valid) {
        // 更新用户状态
        globalState?.setUser(response.data.user)
        return true
      }
    }
    
    return false
  } catch (error) {
    engine.logger.error('Authentication check failed:', error)
    return false
  }
}

/**
 * 检查用户权限
 */
async function checkPermissions(
  engine: Engine,
  requiredRoles?: string[],
  requiredPermissions?: string[]
): Promise<boolean> {
  try {
    const globalState = engine.state.get('global')
    const user = globalState?.user
    
    if (!user) {
      return false
    }
    
    // 检查角色
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = user.roles || []
      const hasRole = requiredRoles.some(role => userRoles.includes(role))
      if (!hasRole) {
        return false
      }
    }
    
    // 检查权限
    if (requiredPermissions && requiredPermissions.length > 0) {
      // 这里可以实现更复杂的权限检查逻辑
      // 比如从服务器获取用户权限列表
      const http = engine.state.get('http')
      if (http) {
        const response = await http.get('/auth/permissions')
        const userPermissions = response.data?.permissions || []
        const hasPermission = requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        )
        return hasPermission
      }
    }
    
    return true
  } catch (error) {
    engine.logger.error('Permission check failed:', error)
    return false
  }
}

/**
 * 预加载页面数据
 */
async function preloadPageData(engine: Engine, route: any): Promise<void> {
  try {
    const preloadFunctions = route.meta?.preload
    if (Array.isArray(preloadFunctions)) {
      await Promise.all(preloadFunctions.map((fn: Function) => fn(engine, route)))
    } else if (typeof preloadFunctions === 'function') {
      await preloadFunctions(engine, route)
    }
  } catch (error) {
    engine.logger.error('Page data preload failed:', error)
  }
}

/**
 * 记录页面访问
 */
function recordPageVisit(engine: Engine, route: any): void {
  try {
    const visitData = {
      path: route.path,
      name: route.name,
      title: route.meta?.title,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    }
    
    // 发送页面访问事件
    engine.events.emit('analytics:page-view', visitData)
    
    // 记录到本地存储（可选）
    const visits = JSON.parse(localStorage.getItem('page-visits') || '[]')
    visits.push(visitData)
    
    // 只保留最近100条记录
    if (visits.length > 100) {
      visits.splice(0, visits.length - 100)
    }
    
    localStorage.setItem('page-visits', JSON.stringify(visits))
  } catch (error) {
    engine.logger.error('Failed to record page visit:', error)
  }
}
