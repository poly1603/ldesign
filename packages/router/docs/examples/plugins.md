# 插件系统示例

展示 LDesign Router 的插件系统，通过插件扩展路由功能。

## 🎯 示例概述

构建一个插件生态系统，展示：

- 插件开发和注册
- 生命周期钩子
- 插件间通信
- 常用插件示例

## 🔌 插件系统架构

```typescript
// types/plugin.ts
export interface RouterPlugin {
  name: string
  version?: string
  install: (router: Router, options?: any) => void
  uninstall?: (router: Router) => void
}

export interface PluginContext {
  router: Router
  emit: (event: string, ...args: any[]) => void
  on: (event: string, handler: Function) => void
  off: (event: string, handler: Function) => void
}
```

## 🎨 插件开发示例

### 分析插件

```typescript
// plugins/analytics.ts
import { PluginContext, RouterPlugin } from '../types/plugin'

interface AnalyticsOptions {
  trackingId: string
  enablePageViews?: boolean
  enableTiming?: boolean
  customDimensions?: Record<string, string>
}

export const AnalyticsPlugin: RouterPlugin = {
  name: 'analytics',
  version: '1.0.0',

  install(router, options: AnalyticsOptions) {
    const { trackingId, enablePageViews = true, enableTiming = true } = options

    // 初始化分析服务
    if (typeof gtag !== 'undefined') {
      gtag('config', trackingId)
    }

    // 页面浏览追踪
    if (enablePageViews) {
      router.afterEach((to, from) => {
        // 发送页面浏览事件
        gtag('event', 'page_view', {
          page_title: to.meta.title || to.name,
          page_location: window.location.href,
          page_path: to.fullPath,
        })

        // 自定义维度
        if (options.customDimensions) {
          Object.entries(options.customDimensions).forEach(([key, value]) => {
            gtag('config', trackingId, {
              [key]: value,
            })
          })
        }
      })
    }

    // 性能追踪
    if (enableTiming) {
      let navigationStart = 0

      router.beforeEach((to, from, next) => {
        navigationStart = performance.now()
        next()
      })

      router.afterEach((to, from) => {
        const navigationEnd = performance.now()
        const duration = navigationEnd - navigationStart

        // 发送时间事件
        gtag('event', 'timing_complete', {
          name: 'navigation',
          value: Math.round(duration),
          event_category: 'performance',
          event_label: to.path,
        })
      })
    }

    // 错误追踪
    router.onError((error, to, from) => {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          to_path: to.path,
          from_path: from.path,
        },
      })
    })
  },
}
```

### 权限插件

```typescript
// plugins/permission.ts
export const PermissionPlugin: RouterPlugin = {
  name: 'permission',
  version: '1.0.0',

  install(router, options) {
    const {
      getUser,
      loginPath = '/login',
      forbiddenPath = '/403',
      roles = {},
      permissions = {},
    } = options

    // 权限检查守卫
    router.beforeEach(async (to, from, next) => {
      const user = await getUser()

      // 检查是否需要登录
      if (to.meta.requiresAuth && !user) {
        return next({
          path: loginPath,
          query: { redirect: to.fullPath },
        })
      }

      // 检查角色权限
      if (to.meta.roles && user) {
        const userRoles = user.roles || []
        const requiredRoles = to.meta.roles
        const hasRole = requiredRoles.some(role => userRoles.includes(role))

        if (!hasRole) {
          return next(forbiddenPath)
        }
      }

      // 检查具体权限
      if (to.meta.permissions && user) {
        const userPermissions = user.permissions || []
        const requiredPermissions = to.meta.permissions
        const hasPermission = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        )

        if (!hasPermission) {
          return next(forbiddenPath)
        }
      }

      next()
    })

    // 添加权限检查方法到路由器
    router.hasPermission = permission => {
      const user = getUser()
      return user?.permissions?.includes(permission) || false
    }

    router.hasRole = role => {
      const user = getUser()
      return user?.roles?.includes(role) || false
    }
  },
}
```

### 缓存插件

```typescript
// plugins/cache.ts
export const CachePlugin: RouterPlugin = {
  name: 'cache',
  version: '1.0.0',

  install(router, options) {
    const {
      maxSize = 20,
      ttl = 5 * 60 * 1000,
      storage = 'memory',
      include = [],
      exclude = [],
    } = options

    const cache = new Map()

    // 缓存键生成
    const getCacheKey = route => {
      return `${route.path}?${JSON.stringify(route.query)}`
    }

    // 检查是否应该缓存
    const shouldCache = route => {
      // 检查排除规则
      if (
        exclude.some(pattern => {
          if (typeof pattern === 'string') return route.path === pattern
          if (pattern instanceof RegExp) return pattern.test(route.path)
          return false
        })
      ) {
        return false
      }

      // 检查包含规则
      if (include.length > 0) {
        return include.some(pattern => {
          if (typeof pattern === 'string') return route.path === pattern
          if (pattern instanceof RegExp) return pattern.test(route.path)
          return false
        })
      }

      return route.meta.cache !== false
    }

    // 缓存组件
    router.beforeResolve((to, from, next) => {
      if (shouldCache(to)) {
        const cacheKey = getCacheKey(to)
        const cached = cache.get(cacheKey)

        if (cached && Date.now() - cached.timestamp < ttl) {
          // 使用缓存的组件
          to.meta.cachedComponent = cached.component
          console.log('使用缓存组件:', to.path)
        }
      }
      next()
    })

    // 保存组件到缓存
    router.afterEach((to, from) => {
      if (shouldCache(to) && to.matched.length > 0) {
        const cacheKey = getCacheKey(to)
        const component = to.matched[to.matched.length - 1].components?.default

        if (component) {
          // 检查缓存大小
          if (cache.size >= maxSize) {
            // 删除最旧的缓存项
            const oldestKey = cache.keys().next().value
            cache.delete(oldestKey)
          }

          cache.set(cacheKey, {
            component,
            timestamp: Date.now(),
            route: to.path,
          })

          console.log('缓存组件:', to.path)
        }
      }
    })

    // 添加缓存管理方法
    router.clearCache = pattern => {
      if (!pattern) {
        cache.clear()
        return
      }

      for (const [key, value] of cache.entries()) {
        if (typeof pattern === 'string' && value.route === pattern) {
          cache.delete(key)
        } else if (pattern instanceof RegExp && pattern.test(value.route)) {
          cache.delete(key)
        }
      }
    }

    router.getCacheStats = () => {
      return {
        size: cache.size,
        maxSize,
        entries: Array.from(cache.entries()).map(([key, value]) => ({
          key,
          route: value.route,
          timestamp: value.timestamp,
          age: Date.now() - value.timestamp,
        })),
      }
    }
  },
}
```

### 面包屑插件

```typescript
// plugins/breadcrumb.ts
export const BreadcrumbPlugin: RouterPlugin = {
  name: 'breadcrumb',
  version: '1.0.0',

  install(router, options) {
    const { separator = '/', homeText = '首页', homePath = '/' } = options

    // 生成面包屑数据
    const generateBreadcrumbs = route => {
      const breadcrumbs = []

      // 添加首页
      if (route.path !== homePath) {
        breadcrumbs.push({
          text: homeText,
          path: homePath,
          name: 'Home',
        })
      }

      // 添加路由层级
      route.matched.forEach((record, index) => {
        if (record.meta?.breadcrumb !== false && record.meta?.title) {
          breadcrumbs.push({
            text: record.meta.title,
            path: record.path,
            name: record.name,
            isLast: index === route.matched.length - 1,
          })
        }
      })

      return breadcrumbs
    }

    // 更新面包屑
    router.afterEach(to => {
      const breadcrumbs = generateBreadcrumbs(to)

      // 触发面包屑更新事件
      window.dispatchEvent(
        new CustomEvent('breadcrumb-update', {
          detail: { breadcrumbs, route: to },
        })
      )

      // 存储到路由元信息
      to.meta.breadcrumbs = breadcrumbs
    })

    // 添加面包屑方法到路由器
    router.getBreadcrumbs = route => {
      return route ? generateBreadcrumbs(route) : []
    }
  },
}
```

## 🎛️ 插件管理器

```typescript
// core/plugin-manager.ts
export class PluginManager {
  private plugins = new Map<string, RouterPlugin>()
  private installedPlugins = new Set<string>()
  private router: Router

  constructor(router: Router) {
    this.router = router
  }

  // 注册插件
  register(plugin: RouterPlugin) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`插件 ${plugin.name} 已存在`)
      return
    }

    this.plugins.set(plugin.name, plugin)
    console.log(`插件 ${plugin.name} 注册成功`)
  }

  // 安装插件
  install(pluginName: string, options?: any) {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 ${pluginName} 未找到`)
    }

    if (this.installedPlugins.has(pluginName)) {
      console.warn(`插件 ${pluginName} 已安装`)
      return
    }

    try {
      plugin.install(this.router, options)
      this.installedPlugins.add(pluginName)
      console.log(`插件 ${pluginName} 安装成功`)
    } catch (error) {
      console.error(`插件 ${pluginName} 安装失败:`, error)
      throw error
    }
  }

  // 卸载插件
  uninstall(pluginName: string) {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 ${pluginName} 未找到`)
    }

    if (!this.installedPlugins.has(pluginName)) {
      console.warn(`插件 ${pluginName} 未安装`)
      return
    }

    try {
      if (plugin.uninstall) {
        plugin.uninstall(this.router)
      }
      this.installedPlugins.delete(pluginName)
      console.log(`插件 ${pluginName} 卸载成功`)
    } catch (error) {
      console.error(`插件 ${pluginName} 卸载失败:`, error)
      throw error
    }
  }

  // 获取已安装插件列表
  getInstalledPlugins() {
    return Array.from(this.installedPlugins)
  }

  // 获取所有可用插件
  getAvailablePlugins() {
    return Array.from(this.plugins.keys())
  }

  // 检查插件是否已安装
  isInstalled(pluginName: string) {
    return this.installedPlugins.has(pluginName)
  }
}
```

## 🎯 插件使用示例

```typescript
// main.ts
import { createRouter, createWebHistory } from '@ldesign/router'
import { PluginManager } from './core/plugin-manager'
import { AnalyticsPlugin } from './plugins/analytics'
import { BreadcrumbPlugin } from './plugins/breadcrumb'
import { CachePlugin } from './plugins/cache'
import { PermissionPlugin } from './plugins/permission'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 创建插件管理器
const pluginManager = new PluginManager(router)

// 注册插件
pluginManager.register(AnalyticsPlugin)
pluginManager.register(PermissionPlugin)
pluginManager.register(CachePlugin)
pluginManager.register(BreadcrumbPlugin)

// 安装插件
pluginManager.install('analytics', {
  trackingId: 'GA_TRACKING_ID',
  enablePageViews: true,
  enableTiming: true,
  customDimensions: {
    user_type: 'premium',
  },
})

pluginManager.install('permission', {
  getUser: () => authStore.user,
  loginPath: '/login',
  forbiddenPath: '/403',
})

pluginManager.install('cache', {
  maxSize: 30,
  ttl: 10 * 60 * 1000,
  include: [/^\/product/, '/user/profile'],
  exclude: ['/admin', '/payment'],
})

pluginManager.install('breadcrumb', {
  separator: ' > ',
  homeText: '首页',
  homePath: '/',
})

// 导出配置好的路由器
export { pluginManager, router }
```

## 🎨 插件管理界面

```vue
<!-- components/PluginManager.vue -->
<script setup>
import { onMounted, ref } from 'vue'
import { pluginManager } from '@/router'

const availablePlugins = ref([])
const installedPlugins = ref([])

function loadPlugins() {
  availablePlugins.value = pluginManager.getAvailablePlugins().map(name => ({
    name,
    version: '1.0.0',
    description: `${name} 插件`,
  }))

  installedPlugins.value = pluginManager.getInstalledPlugins()
}

function isInstalled(pluginName) {
  return installedPlugins.value.includes(pluginName)
}

function installPlugin(pluginName) {
  try {
    pluginManager.install(pluginName)
    loadPlugins()
  } catch (error) {
    alert(`安装失败: ${error.message}`)
  }
}

function uninstallPlugin(pluginName) {
  try {
    pluginManager.uninstall(pluginName)
    loadPlugins()
  } catch (error) {
    alert(`卸载失败: ${error.message}`)
  }
}

onMounted(() => {
  loadPlugins()
})
</script>

<template>
  <div class="plugin-manager">
    <h3>插件管理</h3>

    <div class="plugin-list">
      <div
        v-for="plugin in availablePlugins"
        :key="plugin.name"
        class="plugin-item"
        :class="{ installed: isInstalled(plugin.name) }"
      >
        <div class="plugin-info">
          <div class="plugin-name">
            {{ plugin.name }}
          </div>
          <div class="plugin-version">v{{ plugin.version }}</div>
          <div class="plugin-description">
            {{ plugin.description }}
          </div>
        </div>

        <div class="plugin-actions">
          <button
            v-if="!isInstalled(plugin.name)"
            class="install-btn"
            @click="installPlugin(plugin.name)"
          >
            安装
          </button>
          <button v-else class="uninstall-btn" @click="uninstallPlugin(plugin.name)">卸载</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plugin-manager {
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

.plugin-list {
  display: grid;
  gap: 1rem;
}

.plugin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.plugin-item.installed {
  border-color: #52c41a;
  background: #f6ffed;
}

.plugin-info {
  flex: 1;
}

.plugin-name {
  font-weight: 600;
  color: #333;
}

.plugin-version {
  font-size: 0.8rem;
  color: #666;
}

.plugin-description {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.install-btn,
.uninstall-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.install-btn {
  background: #1890ff;
  color: white;
}

.uninstall-btn {
  background: #f5222d;
  color: white;
}
</style>
```

## 🎯 关键特性

### 1. 插件生命周期

- 注册、安装、卸载流程
- 错误处理和回滚
- 依赖管理

### 2. 功能扩展

- 分析追踪
- 权限控制
- 缓存管理
- 面包屑导航

### 3. 插件通信

- 事件系统
- 共享状态
- 插件间协作

### 4. 管理界面

- 可视化插件管理
- 动态安装卸载
- 状态监控

这个示例展示了 LDesign Router 插件系统的强大扩展能力，通过插件可以轻松添加各种功能。
