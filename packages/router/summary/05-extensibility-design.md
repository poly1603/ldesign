# 扩展性设计

## 插件系统架构

### 插件接口设计

@ldesign/router 采用灵活的插件系统，允许开发者扩展路由器的功能。

```typescript
// 插件基础接口
interface RouterPlugin {
  name: string
  version?: string
  install: (router: Router, options?: any) => void
  uninstall?: (router: Router) => void
}

// 高级插件接口
interface AdvancedRouterPlugin extends RouterPlugin {
  // 生命周期钩子
  beforeInstall?: (router: Router) => void
  afterInstall?: (router: Router) => void
  beforeUninstall?: (router: Router) => void
  afterUninstall?: (router: Router) => void

  // 导航钩子
  beforeEach?: (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) => void
  beforeResolve?: (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) => void
  afterEach?: (to: RouteLocation, from: RouteLocation) => void

  // 错误处理
  onError?: (error: Error, to: RouteLocation, from: RouteLocation) => void

  // 自定义方法
  [key: string]: any
}
```

### 插件管理器实现

```typescript
class PluginManager {
  private plugins = new Map<string, RouterPlugin>()
  private router: Router

  constructor(router: Router) {
    this.router = router
  }

  install(plugin: RouterPlugin, options?: any): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already installed`)
      return
    }

    // 执行安装前钩子
    if ('beforeInstall' in plugin && plugin.beforeInstall) {
      plugin.beforeInstall(this.router)
    }

    // 安装插件
    plugin.install(this.router, options)

    // 注册导航钩子
    this.registerNavigationHooks(plugin)

    // 存储插件实例
    this.plugins.set(plugin.name, plugin)

    // 执行安装后钩子
    if ('afterInstall' in plugin && plugin.afterInstall) {
      plugin.afterInstall(this.router)
    }

    console.log(`Plugin ${plugin.name} installed successfully`)
  }

  uninstall(name: string): void {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      console.warn(`Plugin ${name} is not installed`)
      return
    }

    // 执行卸载前钩子
    if ('beforeUninstall' in plugin && plugin.beforeUninstall) {
      plugin.beforeUninstall(this.router)
    }

    // 卸载插件
    if (plugin.uninstall) {
      plugin.uninstall(this.router)
    }

    // 移除导航钩子
    this.unregisterNavigationHooks(plugin)

    // 移除插件实例
    this.plugins.delete(name)

    // 执行卸载后钩子
    if ('afterUninstall' in plugin && plugin.afterUninstall) {
      plugin.afterUninstall(this.router)
    }

    console.log(`Plugin ${name} uninstalled successfully`)
  }

  private registerNavigationHooks(plugin: RouterPlugin): void {
    const advancedPlugin = plugin as AdvancedRouterPlugin

    if (advancedPlugin.beforeEach) {
      this.router.beforeEach(advancedPlugin.beforeEach)
    }

    if (advancedPlugin.beforeResolve) {
      this.router.beforeResolve(advancedPlugin.beforeResolve)
    }

    if (advancedPlugin.afterEach) {
      this.router.afterEach(advancedPlugin.afterEach)
    }

    if (advancedPlugin.onError) {
      this.router.onError(advancedPlugin.onError)
    }
  }
}
```

## 内置插件示例

### 1. 页面标题插件

```typescript
interface TitlePluginOptions {
  defaultTitle?: string
  titleTemplate?: string
  separator?: string
}

const TitlePlugin: RouterPlugin = {
  name: 'title',
  version: '1.0.0',

  install(router: Router, options: TitlePluginOptions = {}) {
    const { defaultTitle = 'My App', titleTemplate = '%s', separator = ' | ' } = options

    router.afterEach(to => {
      let title = to.meta.title || defaultTitle

      // 处理嵌套路由标题
      if (to.matched.length > 1) {
        const titles = to.matched.map(route => route.meta.title).filter(Boolean)

        if (titles.length > 0) {
          title = titles.join(separator)
        }
      }

      // 应用标题模板
      document.title = titleTemplate.replace('%s', title)
    })
  },
}

// 使用插件
router.use(TitlePlugin, {
  defaultTitle: 'LDesign App',
  titleTemplate: '%s - LDesign',
  separator: ' > ',
})
```

### 2. 页面访问统计插件

```typescript
interface AnalyticsPluginOptions {
  trackingId: string
  enablePageView?: boolean
  enableTiming?: boolean
  customDimensions?: Record<string, string>
}

const AnalyticsPlugin: RouterPlugin = {
  name: 'analytics',
  version: '1.0.0',

  install(router: Router, options: AnalyticsPluginOptions) {
    const {
      trackingId,
      enablePageView = true,
      enableTiming = true,
      customDimensions = {},
    } = options

    // 初始化分析工具
    this.initAnalytics(trackingId)

    if (enablePageView) {
      router.afterEach((to, from) => {
        // 发送页面浏览事件
        this.trackPageView(to, customDimensions)
      })
    }

    if (enableTiming) {
      let navigationStart: number

      router.beforeEach((to, from, next) => {
        navigationStart = performance.now()
        next()
      })

      router.afterEach(to => {
        const navigationTime = performance.now() - navigationStart
        this.trackTiming('navigation', navigationTime, to.path)
      })
    }
  },

  initAnalytics(trackingId: string) {
    // 初始化 Google Analytics 或其他分析工具
    if (typeof gtag !== 'undefined') {
      gtag('config', trackingId)
    }
  },

  trackPageView(route: RouteLocation, customDimensions: Record<string, string>) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: route.meta.title,
        page_location: window.location.href,
        page_path: route.path,
        ...customDimensions,
      })
    }
  },

  trackTiming(category: string, value: number, label: string) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'timing_complete', {
        name: category,
        value: Math.round(value),
        event_label: label,
      })
    }
  },
}
```

### 3. 权限控制插件

```typescript
interface PermissionPluginOptions {
  roles: string[]
  permissions: string[]
  redirectTo?: string
  onUnauthorized?: (to: RouteLocation, from: RouteLocation) => void
}

const PermissionPlugin: RouterPlugin = {
  name: 'permission',
  version: '1.0.0',

  install(router: Router, options: PermissionPluginOptions) {
    const { roles = [], permissions = [], redirectTo = '/403', onUnauthorized } = options

    router.beforeEach((to, from, next) => {
      // 检查路由是否需要权限验证
      const requiredRoles = to.meta.roles as string[]
      const requiredPermissions = to.meta.permissions as string[]

      if (!requiredRoles && !requiredPermissions) {
        next()
        return
      }

      // 检查角色权限
      if (requiredRoles && !this.hasAnyRole(roles, requiredRoles)) {
        this.handleUnauthorized(to, from, next, onUnauthorized, redirectTo)
        return
      }

      // 检查具体权限
      if (requiredPermissions && !this.hasAnyPermission(permissions, requiredPermissions)) {
        this.handleUnauthorized(to, from, next, onUnauthorized, redirectTo)
        return
      }

      next()
    })
  },

  hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role))
  },

  hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => userPermissions.includes(permission))
  },

  handleUnauthorized(
    to: RouteLocation,
    from: RouteLocation,
    next: NavigationGuardNext,
    onUnauthorized?: Function,
    redirectTo?: string
  ) {
    if (onUnauthorized) {
      onUnauthorized(to, from)
    }

    if (redirectTo) {
      next(redirectTo)
    } else {
      next(false)
    }
  },
}
```

## 自定义插件开发

### 插件开发模板

```typescript
interface MyPluginOptions {
  // 定义插件选项
  option1?: string
  option2?: number
  option3?: boolean
}

const MyPlugin: AdvancedRouterPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  // 安装前钩子
  beforeInstall(router: Router) {
    console.log('准备安装插件...')
  },

  // 主安装方法
  install(router: Router, options: MyPluginOptions = {}) {
    const { option1 = 'default', option2 = 0, option3 = true } = options

    // 扩展路由器功能
    router.myCustomMethod = () => {
      console.log('自定义方法被调用')
    }

    // 添加响应式数据
    const pluginState = reactive({
      data: [],
      loading: false,
    })

    router.getPluginState = () => pluginState

    // 监听路由变化
    router.afterEach((to, from) => {
      // 插件逻辑
      this.handleRouteChange(to, from, pluginState)
    })
  },

  // 安装后钩子
  afterInstall(router: Router) {
    console.log('插件安装完成')
  },

  // 导航前钩子
  beforeEach(to, from, next) {
    // 在每次导航前执行
    console.log(`导航: ${from.path} -> ${to.path}`)
    next()
  },

  // 导航后钩子
  afterEach(to, from) {
    // 在每次导航后执行
    console.log(`导航完成: ${to.path}`)
  },

  // 错误处理
  onError(error, to, from) {
    console.error('插件捕获到错误:', error)
  },

  // 卸载方法
  uninstall(router: Router) {
    // 清理插件添加的功能
    delete router.myCustomMethod
    delete router.getPluginState
  },

  // 自定义方法
  handleRouteChange(to: RouteLocation, from: RouteLocation, state: any) {
    // 处理路由变化的逻辑
    state.loading = true

    setTimeout(() => {
      state.loading = false
    }, 1000)
  },
}

// 使用插件
router.use(MyPlugin, {
  option1: 'custom value',
  option2: 42,
  option3: false,
})
```

### 插件最佳实践

#### 1. 命名规范

```typescript
// 好的命名
const AuthPlugin = { name: 'auth' }
const AnalyticsPlugin = { name: 'analytics' }
const PermissionPlugin = { name: 'permission' }

// 避免的命名
const Plugin1 = { name: 'plugin1' }
const MyAwesomePlugin = { name: 'awesome' }
```

#### 2. 选项验证

```typescript
const MyPlugin: RouterPlugin = {
  name: 'my-plugin',

  install(router: Router, options: any = {}) {
    // 验证必需选项
    if (!options.apiKey) {
      throw new Error('MyPlugin: apiKey is required')
    }

    // 验证选项类型
    if (typeof options.timeout !== 'number') {
      console.warn('MyPlugin: timeout should be a number, using default value')
      options.timeout = 5000
    }

    // 设置默认值
    const config = {
      timeout: 5000,
      retries: 3,
      debug: false,
      ...options,
    }

    // 插件逻辑
  },
}
```

#### 3. 错误处理

```typescript
const RobustPlugin: RouterPlugin = {
  name: 'robust-plugin',

  install(router: Router, options: any = {}) {
    try {
      // 插件初始化逻辑
      this.initialize(router, options)
    } catch (error) {
      console.error(`Failed to initialize ${this.name}:`, error)

      // 提供降级功能
      this.initializeFallback(router, options)
    }
  },

  initialize(router: Router, options: any) {
    // 主要初始化逻辑
  },

  initializeFallback(router: Router, options: any) {
    // 降级初始化逻辑
    console.warn(`${this.name} is running in fallback mode`)
  },
}
```

#### 4. 性能优化

```typescript
const OptimizedPlugin: RouterPlugin = {
  name: 'optimized-plugin',

  install(router: Router, options: any = {}) {
    // 使用防抖避免频繁调用
    const debouncedHandler = debounce((to, from) => {
      this.handleRouteChange(to, from)
    }, 100)

    router.afterEach(debouncedHandler)

    // 使用 WeakMap 避免内存泄漏
    const routeData = new WeakMap()

    router.beforeEach((to, from, next) => {
      // 存储路由相关数据
      routeData.set(to, { timestamp: Date.now() })
      next()
    })
  },

  handleRouteChange(to: RouteLocation, from: RouteLocation) {
    // 处理路由变化
  },
}
```

## 插件生态系统

### 官方插件

1. **@ldesign/router-analytics** - 页面访问统计
2. **@ldesign/router-auth** - 认证和授权
3. **@ldesign/router-cache** - 高级缓存策略
4. **@ldesign/router-devtools** - 开发者工具
5. **@ldesign/router-ssr** - 服务端渲染支持

### 社区插件

1. **router-breadcrumb** - 面包屑导航
2. **router-progress** - 导航进度条
3. **router-meta** - 元信息管理
4. **router-scroll** - 滚动行为控制
5. **router-transition** - 页面过渡动画

### 插件发布指南

```typescript
// package.json
{
  "name": "@your-org/router-plugin-name",
  "version": "1.0.0",
  "description": "Description of your router plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["ldesign", "router", "plugin", "vue"],
  "peerDependencies": {
    "@ldesign/router": "^1.0.0",
    "vue": "^3.0.0"
  }
}

// README.md 模板
# @your-org/router-plugin-name

## Installation
npm install @your-org/router-plugin-name

## Usage
import { createRouter } from '@ldesign/router'
import YourPlugin from '@your-org/router-plugin-name'

const router = createRouter({ ... })
router.use(YourPlugin, { ... })

## Options
- option1: Description
- option2: Description

## API
- method1(): Description
- method2(): Description
```

通过这种扩展性设计，@ldesign/router 可以满足各种复杂的业务需求，同时保持核心的简洁性和性能。
