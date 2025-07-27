# 路由管理

LDesign Router 是一个功能强大的企业级路由管理器，基于 Vue Router 构建，提供了丰富的企业级功能。

## 特性

- 🧭 **智能路由** - 基于设备类型的自适应路由
- 🔐 **权限管理** - 细粒度的路由权限控制
- 🎨 **主题集成** - 内置主题管理系统
- 🌍 **国际化** - 完整的多语言支持
- 📱 **设备适配** - 自动检测设备类型并适配路由
- 🗂️ **标签页管理** - 支持多标签页导航
- 🍞 **面包屑导航** - 自动生成面包屑导航
- 💾 **缓存策略** - 智能的页面缓存管理
- 🎬 **路由动画** - 丰富的页面切换动画

## 基础用法

### 创建路由器

```typescript
import { createLDesignRouter } from '@ldesign/router'
import type { RouteConfig } from '@ldesign/router'

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      description: '应用首页',
      requiresAuth: false,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true,
      permissions: ['dashboard:view'],
    },
  },
]

const router = createLDesignRouter({
  history: 'history',
  routes,

  // 设备路由器配置
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
    },
  },

  // 权限管理配置
  permissionManager: {
    enabled: true,
    strict: true,
    redirectPath: '/login',
  },

  // 主题管理配置
  themeManager: {
    enabled: true,
    defaultTheme: 'light',
    persistent: true,
  },
})
```

### 在 Vue 应用中使用

```typescript
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 设备路由器

设备路由器可以根据用户的设备类型自动适配不同的路由配置：

```typescript
const router = createLDesignRouter({
  routes: [
    {
      path: '/product/:id',
      name: 'Product',
      // 桌面端组件
      component: () => import('@/views/ProductDesktop.vue'),
      // 设备特定配置
      deviceRoutes: {
        mobile: {
          // 移动端使用不同的组件
          component: () => import('@/views/ProductMobile.vue'),
        },
        tablet: {
          // 平板端配置
          component: () => import('@/views/ProductTablet.vue'),
        },
      },
    },
  ],
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
    },
  },
})
```

## 权限管理

### 基础权限控制

```typescript
// 路由配置
{
  path: '/admin',
  name: 'Admin',
  component: AdminView,
  meta: {
    requiresAuth: true,
    permissions: ['admin:access'],
    roles: ['admin', 'super-admin']
  }
}

// 权限管理器配置
const router = createLDesignRouter({
  routes,
  permissionManager: {
    enabled: true,
    strict: true, // 严格模式：必须满足所有权限要求
    redirectPath: '/login',

    // 权限检查函数
    checkPermission: (permissions: string[]) => {
      const userPermissions = getUserPermissions()
      return permissions.every(p => userPermissions.includes(p))
    },

    // 角色检查函数
    checkRole: (roles: string[]) => {
      const userRoles = getUserRoles()
      return roles.some(r => userRoles.includes(r))
    }
  }
})
```

### 动态权限控制

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 动态添加权限路由
router.addRoute({
  path: '/secret',
  name: 'Secret',
  component: SecretView,
  meta: {
    permissions: ['secret:view'],
  },
})

// 检查当前用户是否有权限访问某个路由
const hasPermission = router.permissionManager.hasPermission(['admin:access'])
```

## 主题管理

路由器内置了主题管理功能：

```typescript
// 在组件中使用
import { useTheme } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  themeManager: {
    enabled: true,
    defaultTheme: 'light',
    persistent: true, // 持久化主题设置
    systemTheme: true, // 跟随系统主题

    // 自定义主题
    themes: {
      light: {
        primary: '#1890ff',
        background: '#ffffff',
        text: '#000000',
      },
      dark: {
        primary: '#177ddc',
        background: '#1a1a1a',
        text: '#ffffff',
      },
      custom: {
        primary: '#722ed1',
        background: '#f6f6f6',
        text: '#333333',
      },
    },
  },
})

const { currentTheme, setTheme, toggleTheme } = useTheme()

// 切换主题
toggleTheme()

// 设置特定主题
setTheme('dark')
```

## 国际化

```typescript
// 在组件中使用
import { useI18n } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  i18nManager: {
    enabled: true,
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
    persistent: true,
    detectBrowserLanguage: true,

    // 语言包
    messages: {
      'zh-CN': {
        'route.home': '首页',
        'route.dashboard': '仪表板',
      },
      'en-US': {
        'route.home': 'Home',
        'route.dashboard': 'Dashboard',
      },
    },
  },
})

const { locale, setLocale, t } = useI18n()

// 切换语言
setLocale('en-US')

// 翻译文本
const title = t('route.home')
```

## 缓存管理

智能的页面缓存可以提升用户体验：

```typescript
const router = createLDesignRouter({
  routes: [
    {
      path: '/list',
      name: 'List',
      component: ListView,
      meta: {
        // 启用缓存
        keepAlive: true,
        // 缓存策略
        cacheStrategy: 'lru',
        // 缓存时间（毫秒）
        cacheTTL: 300000,
      },
    },
  ],
  cacheManager: {
    enabled: true,
    strategy: 'lru', // lru, lfu, fifo
    maxSize: 10,
    persistent: false,
  },
})
```

## 面包屑导航

自动生成面包屑导航：

```typescript
// 在组件中使用
import { useBreadcrumb } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  breadcrumbManager: {
    enabled: true,
    separator: '/',
    showHome: true,
    homeText: '首页',
    homePath: '/',
  },
})

const { breadcrumbs } = useBreadcrumb()
// breadcrumbs: [{ text: '首页', path: '/' }, { text: '用户管理', path: '/users' }]
```

## API 参考

### createLDesignRouter

创建路由器实例的主要函数。

```typescript
function createLDesignRouter(options: RouterOptions): LDesignRouter
```

### RouterOptions

```typescript
interface RouterOptions {
  history: 'hash' | 'history' | 'memory'
  routes: RouteConfig[]
  deviceRouter?: DeviceRouterConfig
  permissionManager?: PermissionConfig
  themeManager?: ThemeConfig
  i18nManager?: I18nConfig
  cacheManager?: CacheConfig
  breadcrumbManager?: BreadcrumbConfig
  animationManager?: AnimationConfig
}
```

### 组合式函数

- `useRouter()` - 获取路由器实例
- `useRoute()` - 获取当前路由信息
- `useTheme()` - 主题管理
- `useI18n()` - 国际化
- `useBreadcrumb()` - 面包屑导航
- `usePermission()` - 权限管理

## 最佳实践

### 1. 路由组织

```typescript
// 按功能模块组织路由
const userRoutes = [
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/users/Index.vue'),
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/users/List.vue'),
      },
      {
        path: 'create',
        name: 'UserCreate',
        component: () => import('@/views/users/Create.vue'),
      },
    ],
  },
]
```

### 2. 权限设计

```typescript
// 使用层级权限设计
const permissions = {
  'user:view': '查看用户',
  'user:create': '创建用户',
  'user:edit': '编辑用户',
  'user:delete': '删除用户',
  'admin:*': '管理员权限',
}
```

### 3. 性能优化

```typescript
// 使用路由懒加载
const routes = [
  {
    path: '/heavy-page',
    name: 'HeavyPage',
    component: () =>
      import(
        /* webpackChunkName: "heavy-page" */
        '@/views/HeavyPage.vue'
      ),
  },
]
```
