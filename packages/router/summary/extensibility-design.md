# LDesign Router 扩展性设计

## 🎯 扩展性设计理念

LDesign Router 采用"开放封闭原则"进行设计，确保系统对扩展开放，对修改封闭。通过插件系统、钩子机制和
模块化架构，为开发者提供了丰富的扩展能力。

## 🔌 插件系统架构

### 1. 插件接口设计

```typescript
interface RouterPlugin {
  name: string
  version?: string
  install: (router: Router, options?: any) => void
  uninstall?: (router: Router) => void
}

// 插件注册
router.use(plugin, options)
```

### 2. 插件生命周期

```typescript
class PluginManager {
  private plugins: Map<string, RouterPlugin> = new Map()
  private hooks: Map<string, Function[]> = new Map()

  install(plugin: RouterPlugin, options?: any): void {
    // 检查插件是否已安装
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already installed`)
      return
    }

    // 安装插件
    plugin.install(this.router, options)
    this.plugins.set(plugin.name, plugin)

    // 触发插件安装钩子
    this.triggerHook('plugin:installed', plugin)
  }

  uninstall(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin && plugin.uninstall) {
      plugin.uninstall(this.router)
      this.plugins.delete(pluginName)
      this.triggerHook('plugin:uninstalled', plugin)
    }
  }
}
```

### 3. 内置钩子系统

```typescript
// 路由钩子
router.beforeEach((to, from, next) => {
  // 插件可以在这里添加逻辑
})

router.afterEach((to, from) => {
  // 插件可以在这里添加逻辑
})

// 自定义钩子
router.addHook('route:preload', route => {
  // 预加载钩子
})

router.addHook('cache:hit', (key, value) => {
  // 缓存命中钩子
})

router.addHook('performance:slow', stats => {
  // 性能告警钩子
})
```

## 🧩 官方插件示例

### 1. 认证插件

```typescript
const AuthPlugin: RouterPlugin = {
  name: 'auth',
  version: '1.0.0',

  install(router: Router, options: AuthOptions = {}) {
    const {
      loginPath = '/login',
      checkAuth = () => !!localStorage.getItem('token'),
      redirectKey = 'redirect',
    } = options

    // 添加全局前置守卫
    router.beforeEach((to, from, next) => {
      if (to.meta.requiresAuth && !checkAuth()) {
        next({
          path: loginPath,
          query: { [redirectKey]: to.fullPath },
        })
      } else {
        next()
      }
    })

    // 添加登录后重定向逻辑
    router.afterEach(to => {
      if (to.path === loginPath && checkAuth()) {
        const redirect = to.query[redirectKey] as string
        if (redirect) {
          router.replace(redirect)
        }
      }
    })
  },
}

// 使用插件
router.use(AuthPlugin, {
  loginPath: '/auth/login',
  checkAuth: () => store.getters.isAuthenticated,
})
```

### 2. 分析插件

```typescript
const AnalyticsPlugin: RouterPlugin = {
  name: 'analytics',
  version: '1.0.0',

  install(router: Router, options: AnalyticsOptions = {}) {
    const { trackPageView = true, trackPerformance = true, provider = 'gtag' } = options

    if (trackPageView) {
      router.afterEach((to, from) => {
        // 发送页面浏览事件
        this.trackPageView(to, from, provider)
      })
    }

    if (trackPerformance) {
      router.addHook('performance:navigation', stats => {
        // 发送性能数据
        this.trackPerformance(stats, provider)
      })
    }
  },

  trackPageView(to: RouteLocation, from: RouteLocation, provider: string) {
    switch (provider) {
      case 'gtag':
        gtag('event', 'page_view', {
          page_title: to.meta.title,
          page_location: window.location.href,
          page_path: to.path,
        })
        break
      case 'mixpanel':
        mixpanel.track('Page View', {
          page: to.path,
          title: to.meta.title,
        })
        break
    }
  },
}
```

### 3. 过渡动画插件

```typescript
const TransitionPlugin: RouterPlugin = {
  name: 'transition',
  version: '1.0.0',

  install(router: Router, options: TransitionOptions = {}) {
    const { defaultTransition = 'fade', transitionMap = {}, duration = 300 } = options

    // 扩展路由元信息
    router.beforeEach((to, from, next) => {
      // 自动设置过渡动画
      if (!to.meta.transition) {
        to.meta.transition = this.getTransition(to, from, transitionMap, defaultTransition)
      }
      next()
    })

    // 注册全局过渡组件
    router.app.component('RouterTransition', {
      props: ['name', 'mode'],
      template: `
        <transition :name="name" :mode="mode">
          <slot />
        </transition>
      `,
    })
  },

  getTransition(to: RouteLocation, from: RouteLocation, map: any, defaultTransition: string) {
    // 根据路由路径确定过渡动画
    const key = `${from.path}->${to.path}`
    return map[key] || defaultTransition
  },
}
```

## 🔧 自定义组件扩展

### 1. 自定义 RouterView

```typescript
// 扩展 RouterView 功能
const CustomRouterView = defineComponent({
  name: 'CustomRouterView',
  props: {
    name: String,
    keepAlive: Boolean,
    transition: String,
  },

  setup(props, { slots }) {
    const route = useRoute()
    const Component = computed(() => {
      const matched = route.matched[route.matched.length - 1]
      return matched?.components?.[props.name || 'default']
    })

    return () => {
      if (!Component.value) return null

      let vnode = h(Component.value, { key: route.path })

      // 添加 keep-alive 支持
      if (props.keepAlive) {
        vnode = h(
          KeepAlive,
          {
            include: route.meta.keepAlive,
          },
          () => vnode
        )
      }

      // 添加过渡动画
      if (props.transition) {
        vnode = h(
          Transition,
          {
            name: props.transition,
            mode: 'out-in',
          },
          () => vnode
        )
      }

      return vnode
    }
  },
})
```

### 2. 自定义 RouterLink

```typescript
// 扩展 RouterLink 功能
const SmartRouterLink = defineComponent({
  name: 'SmartRouterLink',
  props: {
    ...RouterLink.props,
    analytics: Boolean,
    preloadDelay: Number,
    external: Boolean,
  },

  setup(props, { slots }) {
    const { href, navigate, isActive } = useLink(props)
    const router = useRouter()

    // 智能预加载
    const handleMouseEnter = () => {
      if (props.preload && !props.external) {
        setTimeout(() => {
          router.preloadRoute(props.to)
        }, props.preloadDelay || 100)
      }
    }

    // 分析追踪
    const handleClick = (e: Event) => {
      if (props.analytics) {
        gtag('event', 'click', {
          event_category: 'navigation',
          event_label: href.value,
        })
      }

      if (!props.external) {
        navigate(e)
      }
    }

    return () =>
      h(
        'a',
        {
          href: href.value,
          class: { 'router-link-active': isActive.value },
          onMouseenter: handleMouseEnter,
          onClick: handleClick,
          target: props.external ? '_blank' : undefined,
        },
        slots.default?.()
      )
  },
})
```

## 🎨 主题和样式扩展

### 1. CSS 变量系统

```css
/* 路由组件的 CSS 变量 */
:root {
  --router-link-color: #1890ff;
  --router-link-active-color: #40a9ff;
  --router-link-hover-color: #096dd9;
  --router-transition-duration: 0.3s;
  --router-transition-timing: ease-in-out;
}

/* 可定制的过渡动画 */
.router-fade-enter-active,
.router-fade-leave-active {
  transition: opacity var(--router-transition-duration) var(--router-transition-timing);
}

.router-fade-enter-from,
.router-fade-leave-to {
  opacity: 0;
}
```

### 2. 主题插件

```typescript
const ThemePlugin: RouterPlugin = {
  name: 'theme',
  version: '1.0.0',

  install(router: Router, options: ThemeOptions = {}) {
    const { theme = 'default', customCSS = '', transitions = {} } = options

    // 动态加载主题样式
    this.loadTheme(theme)

    // 注入自定义样式
    if (customCSS) {
      this.injectCSS(customCSS)
    }

    // 注册过渡动画
    Object.entries(transitions).forEach(([name, config]) => {
      this.registerTransition(name, config)
    })
  },

  loadTheme(theme: string) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `/themes/${theme}.css`
    document.head.appendChild(link)
  },
}
```

## 🔍 调试和开发工具扩展

### 1. 开发者工具插件

```typescript
const DevToolsPlugin: RouterPlugin = {
  name: 'devtools',
  version: '1.0.0',

  install(router: Router, options: DevToolsOptions = {}) {
    if (process.env.NODE_ENV !== 'development') return

    // 路由变化日志
    router.afterEach((to, from) => {
      console.group(`🧭 Route Navigation`)
      console.log('From:', from.path)
      console.log('To:', to.path)
      console.log('Params:', to.params)
      console.log('Query:', to.query)
      console.log('Meta:', to.meta)
      console.groupEnd()
    })

    // 性能监控
    router.addHook('performance:navigation', stats => {
      if (stats.duration > 1000) {
        console.warn(`⚠️ Slow navigation: ${stats.duration}ms`)
      }
    })

    // 全局错误处理
    router.onError((error, to, from) => {
      console.error('🚨 Router Error:', error)
      console.log('Context:', { to: to.path, from: from.path })
    })

    // 添加到 window 对象供调试使用
    if (typeof window !== 'undefined') {
      window.__LDESIGN_ROUTER__ = router
    }
  },
}
```

### 2. 路由可视化工具

```typescript
const RouteVisualizerPlugin: RouterPlugin = {
  name: 'route-visualizer',
  version: '1.0.0',

  install(router: Router) {
    if (process.env.NODE_ENV !== 'development') return

    // 创建路由树可视化
    const visualizer = this.createVisualizer(router.getRoutes())

    // 添加到页面
    document.body.appendChild(visualizer)
  },

  createVisualizer(routes: RouteRecord[]) {
    const container = document.createElement('div')
    container.id = 'route-visualizer'
    container.innerHTML = this.generateRouteTree(routes)

    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      #route-visualizer {
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        max-height: 300px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
      }
    `
    document.head.appendChild(style)

    return container
  },
}
```

## 🌐 国际化扩展

### 1. i18n 插件

```typescript
const I18nPlugin: RouterPlugin = {
  name: 'i18n',
  version: '1.0.0',

  install(router: Router, options: I18nOptions = {}) {
    const { defaultLocale = 'en', locales = ['en'], messages = {} } = options

    // 添加语言前缀路由
    const originalRoutes = router.getRoutes()
    locales.forEach(locale => {
      originalRoutes.forEach(route => {
        router.addRoute({
          ...route,
          path: `/${locale}${route.path}`,
          name: `${locale}-${route.name}`,
          meta: {
            ...route.meta,
            locale,
          },
        })
      })
    })

    // 语言切换逻辑
    router.beforeEach((to, from, next) => {
      const locale = this.extractLocale(to.path, locales, defaultLocale)
      this.setCurrentLocale(locale)
      next()
    })
  },

  extractLocale(path: string, locales: string[], defaultLocale: string) {
    const segments = path.split('/')
    const firstSegment = segments[1]
    return locales.includes(firstSegment) ? firstSegment : defaultLocale
  },
}
```

## 🚀 未来扩展规划

### 1. 微前端支持

```typescript
// 微前端路由插件
const MicroFrontendPlugin: RouterPlugin = {
  name: 'micro-frontend',
  install(router: Router, options: MicroFrontendOptions) {
    // 动态加载微应用路由
    // 路由隔离和通信
    // 状态共享机制
  },
}
```

### 2. SSR 支持

```typescript
// 服务端渲染插件
const SSRPlugin: RouterPlugin = {
  name: 'ssr',
  install(router: Router, options: SSROptions) {
    // 服务端路由匹配
    // 数据预取
    // 状态序列化
  },
}
```

### 3. 移动端优化

```typescript
// 移动端优化插件
const MobilePlugin: RouterPlugin = {
  name: 'mobile',
  install(router: Router, options: MobileOptions) {
    // 手势导航
    // 页面缓存优化
    // 性能监控
  },
}
```

## 📊 扩展性评估

### 1. 插件生态指标

- **官方插件**: 8 个核心插件
- **社区插件**: 预期 20+ 个插件
- **API 稳定性**: 向后兼容保证
- **文档完整度**: 100% API 文档覆盖

### 2. 扩展能力

- **钩子系统**: 15+ 个扩展点
- **组件扩展**: 完全可定制
- **样式扩展**: CSS 变量 + 主题系统
- **功能扩展**: 插件系统 + 模块化架构

LDesign Router 的扩展性设计确保了系统的长期可维护性和适应性，为开发者提供了丰富的定制和扩展能力。
