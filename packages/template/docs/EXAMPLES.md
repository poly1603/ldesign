# 使用示例集合

本文档提供了 `@ldesign/template` 在实际项目中的完整使用示例。

## 📑 目录

- [基础使用](#基础使用)
- [高级场景](#高级场景)
- [性能优化](#性能优化)
- [企业级应用](#企业级应用)
- [框架集成](#框架集成)
- [最佳实践](#最佳实践)

---

## 基础使用

### 示例 1: 简单的响应式模板加载

```typescript path=null start=null
// src/App.vue
import { defineComponent } from 'vue'
import { useTemplate, useDeviceDetection } from '@ldesign/template'

export default defineComponent({
  setup() {
    const { deviceType } = useDeviceDetection()
    const { loadTemplate, currentTemplate } = useTemplate()

    // 根据设备类型加载模板
    const handleLoadTemplate = async () => {
      await loadTemplate('home', deviceType.value)
    }

    return {
      deviceType,
      currentTemplate,
      handleLoadTemplate,
    }
  },
})
```

```vue path=null start=null
<template>
  <div>
    <p>当前设备: {{ deviceType }}</p>
    <button @click="handleLoadTemplate">加载模板</button>
    <component :is="currentTemplate" v-if="currentTemplate" />
  </div>
</template>
```

---

### 示例 2: 带缓存的模板加载

```typescript path=null start=null
// src/composables/useTemplateWithCache.ts
import { ref } from 'vue'
import { EnhancedCache, useTemplate } from '@ldesign/template'

export function useTemplateWithCache() {
  const cache = new EnhancedCache({
    strategy: 'lru',
    maxSize: 50,
    ttl: 3600,
  })

  const { loadTemplate } = useTemplate()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const loadWithCache = async (name: string, device: string) => {
    loading.value = true
    error.value = null

    try {
      const cacheKey = `${name}-${device}`
      
      // 尝试从缓存获取
      const cached = cache.get(cacheKey)
      if (cached) {
        return cached
      }

      // 加载模板
      const template = await loadTemplate(name, device)
      
      // 存入缓存
      cache.set(cacheKey, template)
      
      return template
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loadWithCache,
    loading,
    error,
    cache,
  }
}
```

---

## 高级场景

### 示例 3: 多页面应用的预加载策略

```typescript path=null start=null
// src/router/preload.ts
import { EnhancedCache } from '@ldesign/template'
import type { Router } from 'vue-router'

export function setupPreload(router: Router) {
  const cache = new EnhancedCache({
    strategy: 'lru',
    maxSize: 100,
  })

  // 定义预加载规则
  const preloadRules = {
    home: ['login', 'about'],
    login: ['register', 'forgot-password'],
    dashboard: ['profile', 'settings'],
  }

  // 路由守卫：预加载相关页面
  router.afterEach((to) => {
    const currentRoute = to.name as string
    const relatedRoutes = preloadRules[currentRoute] || []

    // 异步预加载
    relatedRoutes.forEach((route) => {
      cache.warmup([route], async (name) => {
        const module = await import(`../views/${name}.vue`)
        return module.default
      })
    })
  })
}
```

```typescript path=null start=null
// src/main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { setupPreload } from './router/preload'

const router = createRouter({
  history: createWebHistory(),
  routes: [/* 路由配置 */],
})

// 设置预加载
setupPreload(router)

const app = createApp(App)
app.use(router)
app.mount('#app')
```

---

### 示例 4: 错误边界和降级处理

```typescript path=null start=null
// src/components/TemplateErrorBoundary.vue
import { defineComponent, ref, onErrorCaptured } from 'vue'
import { ErrorHandler } from '@ldesign/template'

export default defineComponent({
  name: 'TemplateErrorBoundary',
  setup(_, { slots }) {
    const hasError = ref(false)
    const errorInfo = ref<string>('')
    const errorHandler = new ErrorHandler({
      maxHistory: 50,
      logErrors: true,
    })

    onErrorCaptured((error, instance, info) => {
      hasError.value = true
      errorInfo.value = info

      // 使用 ErrorHandler 处理错误
      errorHandler.handle(error as Error, {
        component: instance?.$options.name || 'Unknown',
        info,
      })

      // 记录到监控系统
      console.error('Template Error:', {
        error,
        component: instance?.$options.name,
        info,
        stats: errorHandler.getStats(),
      })

      return false // 阻止错误继续传播
    })

    return () => {
      if (hasError.value) {
        return (
          <div class="error-boundary">
            <h2>模板加载失败</h2>
            <p>{errorInfo.value}</p>
            <button onClick={() => {
              hasError.value = false
              location.reload()
            }}>
              重新加载
            </button>
          </div>
        )
      }

      return slots.default?.()
    }
  },
})
```

---

### 示例 5: SSR 预渲染完整示例

```typescript path=null start=null
// server/prerender.ts
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { usePrerender } from '@ldesign/template'
import App from '../src/App.vue'

export async function prerenderPage(url: string, device: string) {
  // 创建 SSR 应用实例
  const app = createSSRApp(App)

  // 配置预渲染
  const { prerenderTemplate } = usePrerender({
    mode: 'ssr',
    cache: true,
    timeout: 10000,
    seo: {
      enabled: true,
      generateMeta: true,
      defaultTitle: '我的应用',
    },
  })

  try {
    // 预渲染模板
    const result = await prerenderTemplate(url, device, {
      priority: 'high',
    })

    // 渲染 HTML
    const html = await renderToString(app)

    // 返回完整的 HTML
    return `
<!DOCTYPE html>
<html>
  <head>
    ${result.seo?.meta || ''}
    ${result.criticalCSS || ''}
    ${result.preloadLinks || ''}
  </head>
  <body>
    <div id="app">${html}</div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
    `
  } catch (error) {
    console.error('Prerender failed:', error)
    throw error
  }
}
```

```typescript path=null start=null
// server/index.ts
import express from 'express'
import { prerenderPage } from './prerender'

const app = express()

// SSR 路由
app.get('*', async (req, res) => {
  const device = detectDevice(req.headers['user-agent'] || '')
  
  try {
    const html = await prerenderPage(req.url, device)
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    console.error(e)
    res.status(500).end('Internal Server Error')
  }
})

app.listen(3000, () => {
  console.log('SSR server running on http://localhost:3000')
})
```

---

## 性能优化

### 示例 6: 智能预加载和优先级管理

```typescript path=null start=null
// src/utils/smartPreload.ts
import { EnhancedCache, usePrerender } from '@ldesign/template'

interface PreloadConfig {
  immediate: string[]    // 立即加载
  high: string[]         // 高优先级
  medium: string[]       // 中优先级
  low: string[]          // 低优先级
  idle: string[]         // 空闲时加载
}

export class SmartPreloader {
  private cache: EnhancedCache
  private prerender: ReturnType<typeof usePrerender>

  constructor() {
    this.cache = new EnhancedCache({
      strategy: 'lfu',
      maxSize: 150,
      ttl: 7200,
    })

    this.prerender = usePrerender({
      mode: 'hybrid',
      cache: true,
    })
  }

  async preload(config: PreloadConfig) {
    // 1. 立即加载关键资源
    await Promise.all(
      config.immediate.map((path) =>
        this.prerender.prerenderTemplate(path, 'mobile', {
          priority: 'critical',
        })
      )
    )

    // 2. 高优先级资源
    setTimeout(() => {
      config.high.forEach((path) => {
        this.prerender.prerenderTemplate(path, 'mobile', {
          priority: 'high',
        })
      })
    }, 100)

    // 3. 中优先级资源
    setTimeout(() => {
      config.medium.forEach((path) => {
        this.prerender.prerenderTemplate(path, 'mobile', {
          priority: 'medium',
        })
      })
    }, 500)

    // 4. 低优先级资源
    setTimeout(() => {
      config.low.forEach((path) => {
        this.prerender.prerenderTemplate(path, 'mobile', {
          priority: 'low',
        })
      })
    }, 2000)

    // 5. 空闲时加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        config.idle.forEach((path) => {
          this.prerender.prerenderTemplate(path, 'mobile', {
            priority: 'low',
          })
        })
      })
    }
  }

  getCacheStats() {
    return this.cache.getEnhancedStats()
  }
}
```

使用示例：

```typescript path=null start=null
// src/main.ts
import { SmartPreloader } from './utils/smartPreload'

const preloader = new SmartPreloader()

// 应用启动时预加载
preloader.preload({
  immediate: ['/home'],
  high: ['/login', '/register'],
  medium: ['/about', '/products'],
  low: ['/faq', '/contact'],
  idle: ['/terms', '/privacy'],
})

// 监控缓存性能
setInterval(() => {
  const stats = preloader.getCacheStats()
  console.log('Cache Performance:', {
    hitRate: stats.hitRate,
    size: stats.size,
    evictions: stats.evictionCount,
  })
}, 30000)
```

---

### 示例 7: 性能监控面板

```vue path=null start=null
<!-- src/components/PerformanceMonitor.vue -->
<template>
  <div class="performance-monitor" v-if="visible">
    <div class="header">
      <h3>性能监控</h3>
      <button @click="visible = false">×</button>
    </div>
    
    <div class="metrics">
      <div class="metric">
        <span class="label">缓存命中率</span>
        <span class="value">{{ cacheStats.hitRate }}%</span>
      </div>
      
      <div class="metric">
        <span class="label">缓存大小</span>
        <span class="value">{{ cacheStats.size }}/{{ cacheStats.maxSize }}</span>
      </div>
      
      <div class="metric">
        <span class="label">平均加载时间</span>
        <span class="value">{{ avgLoadTime }}ms</span>
      </div>
      
      <div class="metric">
        <span class="label">错误数</span>
        <span class="value" :class="{ error: errorStats.count > 0 }">
          {{ errorStats.count }}
        </span>
      </div>
    </div>
    
    <div class="charts">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EnhancedCache, ErrorHandler } from '@ldesign/template'

const visible = ref(true)
const chartRef = ref<HTMLCanvasElement>()
const cache = new EnhancedCache()
const errorHandler = new ErrorHandler()

const cacheStats = ref({
  hitRate: 0,
  size: 0,
  maxSize: 0,
})

const errorStats = ref({
  count: 0,
})

const avgLoadTime = ref(0)

let intervalId: number

onMounted(() => {
  // 每秒更新统计
  intervalId = setInterval(() => {
    const stats = cache.getEnhancedStats()
    cacheStats.value = {
      hitRate: Math.round(stats.hitRate * 100) / 100,
      size: stats.size,
      maxSize: stats.maxSize || 0,
    }

    const errors = errorHandler.getStats()
    errorStats.value = {
      count: errors.totalErrors,
    }

    // 计算平均加载时间
    avgLoadTime.value = Math.round(
      performance.getEntriesByType('measure')
        .reduce((sum, entry) => sum + entry.duration, 0) /
      performance.getEntriesByType('measure').length || 0
    )
  }, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 9999;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.value.error {
  color: #ff4444;
  font-weight: bold;
}
</style>
```

---

## 企业级应用

### 示例 8: 多租户模板系统

```typescript path=null start=null
// src/services/TenantTemplateService.ts
import { EnhancedCache, useTemplate } from '@ldesign/template'

interface TenantConfig {
  id: string
  name: string
  templatePrefix: string
  theme: Record<string, any>
  features: string[]
}

export class TenantTemplateService {
  private cache: EnhancedCache
  private tenantConfigs: Map<string, TenantConfig>

  constructor() {
    this.cache = new EnhancedCache({
      strategy: 'lru',
      maxSize: 200,
      ttl: 7200,
    })
    this.tenantConfigs = new Map()
  }

  // 注册租户
  registerTenant(config: TenantConfig) {
    this.tenantConfigs.set(config.id, config)
  }

  // 加载租户模板
  async loadTenantTemplate(
    tenantId: string,
    templateName: string,
    device: string
  ) {
    const config = this.tenantConfigs.get(tenantId)
    if (!config) {
      throw new Error(`Tenant ${tenantId} not found`)
    }

    const cacheKey = `${tenantId}-${templateName}-${device}`
    
    // 尝试从缓存获取
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    // 构建模板路径
    const templatePath = `${config.templatePrefix}/${templateName}/${device}`

    // 加载模板
    const { loadTemplate } = useTemplate()
    const template = await loadTemplate(templatePath, device)

    // 应用租户主题
    const themedTemplate = this.applyTheme(template, config.theme)

    // 缓存
    this.cache.set(cacheKey, themedTemplate)

    return themedTemplate
  }

  // 应用主题
  private applyTheme(template: any, theme: Record<string, any>) {
    // 深度合并主题配置
    return {
      ...template,
      styles: {
        ...template.styles,
        ...theme,
      },
    }
  }

  // 预热租户模板
  async warmupTenant(tenantId: string, templates: string[]) {
    const config = this.tenantConfigs.get(tenantId)
    if (!config) return

    await this.cache.warmup(
      templates,
      async (name) => {
        return this.loadTenantTemplate(tenantId, name, 'mobile')
      },
      { type: 'immediate' }
    )
  }

  // 获取租户统计
  getTenantStats(tenantId: string) {
    const prefix = `${tenantId}-`
    const stats = this.cache.getEnhancedStats()
    
    // 过滤该租户的缓存项
    // 这里简化处理，实际应该有更精确的统计
    return {
      ...stats,
      tenantId,
    }
  }
}
```

使用示例：

```typescript path=null start=null
// src/main.ts
import { TenantTemplateService } from './services/TenantTemplateService'

const tenantService = new TenantTemplateService()

// 注册租户
tenantService.registerTenant({
  id: 'tenant-001',
  name: 'Company A',
  templatePrefix: '/templates/tenant-001',
  theme: {
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
  },
  features: ['advanced-analytics', 'custom-branding'],
})

tenantService.registerTenant({
  id: 'tenant-002',
  name: 'Company B',
  templatePrefix: '/templates/tenant-002',
  theme: {
    primaryColor: '#722ed1',
    secondaryColor: '#fa8c16',
  },
  features: ['basic-analytics'],
})

// 预热租户模板
await tenantService.warmupTenant('tenant-001', [
  'dashboard',
  'reports',
  'settings',
])

// 加载租户模板
const template = await tenantService.loadTenantTemplate(
  'tenant-001',
  'dashboard',
  'desktop'
)
```

---

### 示例 9: A/B 测试系统

```typescript path=null start=null
// src/services/ABTestService.ts
import { EnhancedCache } from '@ldesign/template'

interface ABTestConfig {
  id: string
  name: string
  variants: {
    id: string
    name: string
    template: string
    weight: number
  }[]
  startDate: Date
  endDate: Date
}

export class ABTestService {
  private tests: Map<string, ABTestConfig>
  private userAssignments: Map<string, string> // userId -> variantId
  private cache: EnhancedCache

  constructor() {
    this.tests = new Map()
    this.userAssignments = new Map()
    this.cache = new EnhancedCache({
      strategy: 'lru',
      maxSize: 100,
    })
  }

  // 创建 A/B 测试
  createTest(config: ABTestConfig) {
    this.tests.set(config.id, config)
  }

  // 为用户分配变体
  assignVariant(userId: string, testId: string): string {
    // 检查是否已分配
    const cacheKey = `${userId}-${testId}`
    const existing = this.userAssignments.get(cacheKey)
    if (existing) {
      return existing
    }

    // 获取测试配置
    const test = this.tests.get(testId)
    if (!test) {
      throw new Error(`Test ${testId} not found`)
    }

    // 基于权重随机分配
    const random = Math.random()
    let cumulative = 0
    let selectedVariant = test.variants[0].id

    for (const variant of test.variants) {
      cumulative += variant.weight
      if (random <= cumulative) {
        selectedVariant = variant.id
        break
      }
    }

    // 保存分配
    this.userAssignments.set(cacheKey, selectedVariant)

    // 记录事件
    this.trackEvent(userId, testId, selectedVariant, 'assigned')

    return selectedVariant
  }

  // 获取用户应该看到的模板
  getTemplateForUser(userId: string, testId: string, defaultTemplate: string): string {
    const test = this.tests.get(testId)
    if (!test) {
      return defaultTemplate
    }

    // 检查测试是否有效
    const now = new Date()
    if (now < test.startDate || now > test.endDate) {
      return defaultTemplate
    }

    // 获取用户的变体
    const variantId = this.assignVariant(userId, testId)
    const variant = test.variants.find((v) => v.id === variantId)

    return variant?.template || defaultTemplate
  }

  // 记录事件（转化、点击等）
  trackEvent(userId: string, testId: string, variantId: string, event: string) {
    // 发送到分析系统
    console.log('AB Test Event:', {
      userId,
      testId,
      variantId,
      event,
      timestamp: new Date().toISOString(),
    })

    // 实际项目中应该发送到分析服务
    // analytics.track({ ... })
  }

  // 获取测试结果
  getTestResults(testId: string) {
    // 从分析系统获取结果
    // 这里返回模拟数据
    return {
      testId,
      variants: [
        { id: 'A', conversions: 120, views: 1000, rate: 12.0 },
        { id: 'B', conversions: 150, views: 1000, rate: 15.0 },
      ],
    }
  }
}
```

使用示例：

```typescript path=null start=null
// src/App.vue
import { useDeviceDetection, useTemplate } from '@ldesign/template'
import { ABTestService } from './services/ABTestService'

const abTest = new ABTestService()

// 创建 A/B 测试
abTest.createTest({
  id: 'homepage-redesign',
  name: '首页重设计测试',
  variants: [
    {
      id: 'control',
      name: '原始版本',
      template: 'home-original',
      weight: 0.5,
    },
    {
      id: 'variant',
      name: '新设计',
      template: 'home-redesign',
      weight: 0.5,
    },
  ],
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-02-01'),
})

// 在组件中使用
export default {
  setup() {
    const { deviceType } = useDeviceDetection()
    const { loadTemplate } = useTemplate()

    const userId = getCurrentUserId() // 获取当前用户 ID

    // 获取应该展示的模板
    const templateName = abTest.getTemplateForUser(
      userId,
      'homepage-redesign',
      'home-original' // 默认模板
    )

    // 加载模板
    loadTemplate(templateName, deviceType.value)

    // 记录转化
    const handleConversion = () => {
      abTest.trackEvent(userId, 'homepage-redesign', templateName, 'conversion')
    }

    return {
      handleConversion,
    }
  },
}
```

---

## 框架集成

### 示例 10: Nuxt 3 集成

```typescript path=null start=null
// plugins/template.client.ts
import TemplatePlugin from '@ldesign/template'
import type { TemplateConfig } from '@ldesign/template'

export default defineNuxtPlugin((nuxtApp) => {
  const config: TemplateConfig = {
    device: {
      defaultDevice: 'mobile',
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: Infinity,
      },
    },
    cache: {
      enabled: true,
      strategy: 'lru',
      maxSize: 100,
    },
    devtools: {
      enabled: process.env.NODE_ENV === 'development',
      hotReload: true,
    },
  }

  nuxtApp.vueApp.use(TemplatePlugin, config)
})
```

```typescript path=null start=null
// composables/useNuxtTemplate.ts
export function useNuxtTemplate() {
  const { loadTemplate } = useTemplate()
  const { deviceType } = useDeviceDetection()
  const route = useRoute()

  // 自动根据路由加载模板
  watch(
    () => route.name,
    async (routeName) => {
      if (routeName) {
        await loadTemplate(String(routeName), deviceType.value)
      }
    },
    { immediate: true }
  )

  return {
    loadTemplate,
    deviceType,
  }
}
```

---

### 示例 11: React 项目集成

```typescript path=null start=null
// src/hooks/useTemplateAdapter.ts
import { useEffect, useState } from 'react'
import { EnhancedCache } from '@ldesign/template'

export function useTemplateAdapter() {
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [cache] = useState(() => new EnhancedCache({
    strategy: 'lru',
    maxSize: 50,
  }))

  const loadTemplate = async (name: string, device: string) => {
    setLoading(true)

    try {
      const cacheKey = `${name}-${device}`
      const cached = cache.get(cacheKey)
      
      if (cached) {
        setTemplate(cached)
        return cached
      }

      // 加载模板逻辑
      const loaded = await import(`./templates/${name}/${device}`)
      cache.set(cacheKey, loaded.default)
      setTemplate(loaded.default)
      
      return loaded.default
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      cache.clear()
    }
  }, [])

  return {
    template,
    loading,
    loadTemplate,
  }
}
```

---

## 最佳实践

### 示例 12: 完整的生产环境配置

```typescript path=null start=null
// src/config/template.config.ts
import type { TemplateConfig } from '@ldesign/template'

export const productionConfig: TemplateConfig = {
  // 设备检测
  device: {
    defaultDevice: 'mobile',
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: Infinity,
    },
    debounceDelay: 300,
  },

  // 缓存策略
  cache: {
    enabled: true,
    strategy: 'lfu', // 生产环境使用 LFU
    maxSize: 200,
    ttl: 7200,
    weakCache: {
      enabled: true,
      maxRefs: 1000,
    },
  },

  // 错误处理
  errorHandling: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
    fallbackTemplate: 'error',
    logErrors: true,
    maxHistory: 100,
  },

  // 性能优化
  performance: {
    enableMetrics: true,
    metricsInterval: 60000,
    enableLazyLoad: true,
    prefetchOnIdle: true,
  },

  // 预渲染
  prerender: {
    enabled: true,
    mode: 'hybrid',
    cache: true,
    timeout: 10000,
    maxConcurrent: 5,
    seo: {
      enabled: true,
      generateMeta: true,
      generateStructuredData: true,
      defaultTitle: '我的应用',
      defaultDescription: '应用描述',
    },
  },

  // 安全
  security: {
    enableCSP: true,
    sanitizeInput: true,
    validatePaths: true,
  },

  // 开发工具（生产环境禁用）
  devtools: {
    enabled: false,
    hotReload: false,
    debug: false,
  },
}
```

---

## 📚 更多资源

- [快速开始](./QUICK_START.md)
- [FAQ](./FAQ.md)
- [优化指南](./OPTIMIZATION_GUIDE.md)
- [API 文档](./API.md)

---

**最后更新**: 2025-10-10  
**版本**: v2.0.0
