# 最佳实践

欢迎来到 LDesign Router 最佳实践指南！这里汇集了我们在企业级应用开发中积累的宝贵经验。

## 🎯 路由设计原则

### 1. 语义化路由设计

```typescript
// ✅ 好的路由设计
const routes = [
  { path: '/users', name: 'UserList', component: UserList },
  { path: '/users/:id', name: 'UserDetail', component: UserDetail },
  { path: '/users/:id/edit', name: 'UserEdit', component: UserEdit },
  { path: '/users/create', name: 'UserCreate', component: UserCreate },
]

// ❌ 避免的路由设计
const routes = [
  { path: '/u', component: UserList },
  { path: '/u/:id', component: UserDetail },
  { path: '/edit-user/:id', component: UserEdit },
]
```

### 2. 合理的路由层级

```typescript
// ✅ 清晰的层级结构
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'users',
        component: UserManagement,
        children: [
          { path: '', name: 'UserList', component: UserList },
          { path: ':id', name: 'UserDetail', component: UserDetail }
        ]
      }
    ]
  }
]
```

## 🚀 性能优化策略

### 1. 智能代码分割

```typescript
// ✅ 按路由分割代码
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(
      /* webpackChunkName: "dashboard" */ 
      './views/Dashboard.vue'
    )
  },
  {
    path: '/reports',
    name: 'Reports', 
    component: () => import(
      /* webpackChunkName: "reports" */
      './views/Reports.vue'
    )
  }
]

// ✅ 按功能模块分割
const routes = [
  {
    path: '/user',
    component: () => import(
      /* webpackChunkName: "user-module" */
      './modules/user/UserModule.vue'
    ),
    children: [
      // 用户模块的子路由
    ]
  }
]
```

### 2. 预加载策略配置

```typescript
import { createPreloadPlugin } from '@ldesign/router'

const router = createRouter({
  routes,
  plugins: [
    createPreloadPlugin({
      // 鼠标悬停时预加载
      strategy: 'hover',
      // 预加载延迟
      delay: 200,
      // 最大并发预加载数
      maxConcurrent: 3,
      // 预加载优先级
      priority: {
        '/dashboard': 'high',
        '/reports': 'medium',
        '/settings': 'low'
      }
    })
  ]
})
```

### 3. 缓存策略优化

```typescript
import { createCachePlugin } from '@ldesign/router'

const router = createRouter({
  routes,
  plugins: [
    createCachePlugin({
      // LRU 缓存策略
      strategy: 'lru',
      // 最大缓存数量
      maxSize: 20,
      // 缓存过期时间（毫秒）
      ttl: 5 * 60 * 1000, // 5分钟
      // 自定义缓存键生成
      keyGenerator: (route) => `${route.name}-${route.params.id}`,
      // 缓存条件
      shouldCache: (route) => {
        // 只缓存特定路由
        return ['Dashboard', 'UserList', 'Reports'].includes(route.name)
      }
    })
  ]
})
```

## 📱 设备适配最佳实践

### 1. 响应式组件设计

```typescript
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    // 默认组件（桌面端）
    component: () => import('./views/Dashboard.vue'),
    // 设备特定组件
    deviceComponents: {
      mobile: () => import('./views/mobile/Dashboard.vue'),
      tablet: () => import('./views/tablet/Dashboard.vue')
    },
    // 支持的设备类型
    supportedDevices: ['mobile', 'tablet', 'desktop']
  }
]
```

### 2. 设备特定路由守卫

```typescript
import { createDeviceGuard } from '@ldesign/router'

router.beforeEach(createDeviceGuard({
  // 移动端访问限制
  mobileRestrictions: {
    '/admin': '/mobile-not-supported',
    '/complex-charts': '/simple-charts'
  },
  // 桌面端重定向
  desktopRedirects: {
    '/mobile-app': '/web-app'
  }
}))
```

## 🛡️ 安全最佳实践

### 1. 路由权限控制

```typescript
// 权限检查守卫
const authGuard = (to, from, next) => {
  const requiredPermissions = to.meta.permissions || []
  const userPermissions = getUserPermissions()
  
  const hasPermission = requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  )
  
  if (hasPermission) {
    next()
  } else {
    next('/unauthorized')
  }
}

// 路由配置
const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    meta: {
      permissions: ['admin:read', 'admin:write']
    },
    beforeEnter: authGuard
  }
]
```

### 2. 敏感信息保护

```typescript
// ✅ 避免在路由参数中传递敏感信息
router.push({
  name: 'UserDetail',
  params: { id: userId }, // 只传递 ID
  state: { userData } // 敏感数据通过 state 传递
})

// ❌ 避免这样做
router.push({
  name: 'UserDetail',
  query: { 
    token: 'sensitive-token', // 敏感信息暴露在 URL 中
    password: 'user-password'
  }
})
```

## 🎨 用户体验优化

### 1. 路由动画配置

```typescript
import { createAnimationPlugin } from '@ldesign/router'

const router = createRouter({
  routes,
  plugins: [
    createAnimationPlugin({
      // 默认动画
      defaultAnimation: 'fade',
      // 自定义动画映射
      animations: {
        // 前进动画
        forward: 'slide-left',
        // 后退动画
        backward: 'slide-right',
        // 特定路由动画
        routes: {
          '/login': 'zoom-in',
          '/dashboard': 'fade',
          '/settings': 'slide-up'
        }
      },
      // 动画持续时间
      duration: 300,
      // 缓动函数
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    })
  ]
})
```

### 2. 加载状态管理

```typescript
// 全局加载状态
const router = createRouter({
  routes,
  onNavigationStart: () => {
    showGlobalLoading()
  },
  onNavigationEnd: () => {
    hideGlobalLoading()
  },
  onNavigationError: (error) => {
    hideGlobalLoading()
    showErrorMessage(error.message)
  }
})
```

## 🔧 开发和调试

### 1. 开发环境配置

```typescript
const router = createRouter({
  routes,
  // 开发模式配置
  development: process.env.NODE_ENV === 'development' ? {
    // 启用详细日志
    logLevel: 'debug',
    // 显示性能警告
    showPerformanceWarnings: true,
    // 路由变化日志
    logRouteChanges: true,
    // 组件加载时间监控
    trackComponentLoadTime: true
  } : undefined
})
```

### 2. 错误处理和监控

```typescript
// 全局错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)
  
  // 发送错误报告
  sendErrorReport({
    error: error.message,
    route: to.path,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  })
  
  // 用户友好的错误提示
  showNotification({
    type: 'error',
    message: '页面加载失败，请稍后重试'
  })
})
```

## 📊 性能监控

### 1. 关键指标监控

```typescript
import { createPerformancePlugin } from '@ldesign/router'

const router = createRouter({
  routes,
  plugins: [
    createPerformancePlugin({
      // 性能阈值
      thresholds: {
        navigation: 1000, // 导航时间阈值
        componentLoad: 500, // 组件加载时间阈值
        memoryUsage: 50 * 1024 * 1024 // 内存使用阈值 50MB
      },
      // 性能报告
      onPerformanceReport: (metrics) => {
        // 发送性能数据到监控系统
        sendPerformanceMetrics(metrics)
      }
    })
  ]
})
```

### 2. 用户行为分析

```typescript
// 路由访问统计
router.afterEach((to, from) => {
  // 记录页面访问
  analytics.track('page_view', {
    page: to.path,
    title: to.meta.title,
    referrer: from.path,
    timestamp: Date.now()
  })
  
  // 记录用户路径
  userJourney.addStep({
    from: from.path,
    to: to.path,
    duration: Date.now() - navigationStartTime
  })
})
```

## 🧪 测试策略

### 1. 路由测试

```typescript
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from '@ldesign/router'

describe('路由测试', () => {
  let router
  
  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: testRoutes
    })
  })
  
  it('应该正确导航到目标路由', async () => {
    await router.push('/users/123')
    expect(router.currentRoute.value.path).toBe('/users/123')
    expect(router.currentRoute.value.params.id).toBe('123')
  })
})
```

### 2. 组件集成测试

```typescript
it('应该在路由变化时更新组件', async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  
  await router.push('/dashboard')
  await wrapper.vm.$nextTick()
  
  expect(wrapper.findComponent(Dashboard).exists()).toBe(true)
})
```

---

> 💡 **记住**: 最佳实践不是一成不变的规则，而是经过验证的指导原则。根据你的具体需求和场景，灵活应用这些实践，打造出色的用户体验！
