# 插件系统

> 🔌 强大的插件架构，让模板系统无限扩展！

## 🎯 概述

插件系统是 `@ldesign/template` 的核心扩展机制，允许开发者通过插件的方式扩展模板系统的功能，实现高度的可定制性和可扩展性。

## 🏗️ 插件架构

### 插件生命周期

```
┌─────────────┐
│   注册插件   │
├─────────────┤
│   初始化     │
├─────────────┤
│   钩子执行   │
├─────────────┤
│   销毁清理   │
└─────────────┘
```

### 插件接口

```typescript
interface Plugin {
  name: string // 插件名称
  version: string // 插件版本
  description?: string // 插件描述
  dependencies?: string[] // 依赖的其他插件

  // 生命周期钩子
  install?: (manager: TemplateManager) => void
  uninstall?: (manager: TemplateManager) => void

  // 功能钩子
  hooks?: {
    beforeTemplateLoad?: HookFunction
    afterTemplateLoad?: HookFunction
    beforeTemplateRender?: HookFunction
    afterTemplateRender?: HookFunction
    onTemplateError?: HookFunction
  }
}
```

## 🚀 基础用法

### 创建插件

```typescript
// 简单插件示例
const loggerPlugin: Plugin = {
  name: 'logger',
  version: '1.0.0',
  description: '模板加载日志插件',

  install(manager) {
    console.log('Logger 插件已安装')
  },

  hooks: {
    beforeTemplateLoad: (context) => {
      console.log(`开始加载模板: ${context.templateId}`)
    },

    afterTemplateLoad: (context) => {
      console.log(`模板加载完成: ${context.templateId}, 耗时: ${context.loadTime}ms`)
    },

    onTemplateError: (context) => {
      console.error(`模板加载失败: ${context.templateId}`, context.error)
    }
  }
}
```

### 注册插件

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager()

// 注册单个插件
manager.use(loggerPlugin)

// 批量注册插件
manager.use([
  loggerPlugin,
  cachePlugin,
  analyticsPlugin
])

// 带配置的插件注册
manager.use(cachePlugin, {
  maxSize: 100,
  ttl: 30 * 60 * 1000
})
```

## 🎨 内置插件

### 缓存插件

```typescript
import { CachePlugin } from '@ldesign/template/plugins'

const cachePlugin = new CachePlugin({
  // 内存缓存配置
  memory: {
    maxSize: 50,
    ttl: 30 * 60 * 1000
  },

  // 持久化缓存配置
  persistent: {
    enabled: true,
    storage: 'indexedDB',
    maxSize: 100 * 1024 * 1024
  }
})

manager.use(cachePlugin)
```

### 分析插件

```typescript
import { AnalyticsPlugin } from '@ldesign/template/plugins'

const analyticsPlugin = new AnalyticsPlugin({
  // 数据收集配置
  collect: {
    loadTime: true,
    renderTime: true,
    errorRate: true,
    userInteractions: true
  },

  // 报告配置
  reporting: {
    interval: 60 * 1000, // 1分钟报告一次
    endpoint: '/api/analytics',
    batchSize: 100
  },

  // 回调函数
  onReport: (data) => {
    console.log('分析数据:', data)
  }
})

manager.use(analyticsPlugin)
```

### 主题插件

```typescript
import { ThemePlugin } from '@ldesign/template/plugins'

const themePlugin = new ThemePlugin({
  // 主题配置
  themes: {
    light: {
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff'
    },
    dark: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      background: '#212529'
    }
  },

  // 默认主题
  defaultTheme: 'light',

  // 自动切换
  autoSwitch: {
    enabled: true,
    schedule: {
      light: '06:00',
      dark: '18:00'
    }
  }
})

manager.use(themePlugin)
```

## 🔧 高级插件开发

### 复杂插件示例

```typescript
class PerformancePlugin implements Plugin {
  name = 'performance'
  version = '1.0.0'
  description = '性能监控插件'

  private metrics: Map<string, any> = new Map()
  private observer?: PerformanceObserver

  install(manager: TemplateManager) {
    // 初始化性能监控
    this.initPerformanceObserver()

    // 注册全局错误处理
    window.addEventListener('error', this.handleError.bind(this))
  }

  uninstall(manager: TemplateManager) {
    // 清理资源
    this.observer?.disconnect()
    window.removeEventListener('error', this.handleError)
  }

  hooks = {
    beforeTemplateLoad: (context: any) => {
      // 记录开始时间
      this.metrics.set(`${context.templateId}_start`, performance.now())
    },

    afterTemplateLoad: (context: any) => {
      // 计算加载时间
      const startTime = this.metrics.get(`${context.templateId}_start`)
      const loadTime = performance.now() - startTime

      // 记录性能指标
      this.recordMetric('templateLoad', {
        templateId: context.templateId,
        loadTime,
        timestamp: Date.now()
      })
    },

    beforeTemplateRender: (context: any) => {
      // 记录渲染开始时间
      this.metrics.set(`${context.templateId}_render_start`, performance.now())
    },

    afterTemplateRender: (context: any) => {
      // 计算渲染时间
      const startTime = this.metrics.get(`${context.templateId}_render_start`)
      const renderTime = performance.now() - startTime

      // 记录渲染指标
      this.recordMetric('templateRender', {
        templateId: context.templateId,
        renderTime,
        timestamp: Date.now()
      })
    }
  }

  private initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('webVitals', {
            name: entry.name,
            value: entry.startTime,
            timestamp: Date.now()
          })
        }
      })

      this.observer.observe({ entryTypes: ['measure', 'navigation'] })
    }
  }

  private handleError(event: ErrorEvent) {
    this.recordMetric('error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      timestamp: Date.now()
    })
  }

  private recordMetric(type: string, data: any) {
    // 发送到分析服务
    console.log(`[Performance] ${type}:`, data)
  }

  // 公共 API
  getMetrics() {
    return Array.from(this.metrics.entries())
  }

  clearMetrics() {
    this.metrics.clear()
  }
}
```

### 插件配置系统

```typescript
class ConfigurablePlugin implements Plugin {
  name = 'configurable'
  version = '1.0.0'

  private config: any

  constructor(config: any = {}) {
    this.config = this.mergeConfig(this.getDefaultConfig(), config)
  }

  private getDefaultConfig() {
    return {
      enabled: true,
      debug: false,
      features: {
        caching: true,
        analytics: false,
        theming: true
      }
    }
  }

  private mergeConfig(defaultConfig: any, userConfig: any) {
    return {
      ...defaultConfig,
      ...userConfig,
      features: {
        ...defaultConfig.features,
        ...userConfig.features
      }
    }
  }

  install(manager: TemplateManager) {
    if (!this.config.enabled)
      return

    // 根据配置启用功能
    if (this.config.features.caching) {
      this.enableCaching(manager)
    }

    if (this.config.features.analytics) {
      this.enableAnalytics(manager)
    }

    if (this.config.features.theming) {
      this.enableTheming(manager)
    }
  }

  private enableCaching(manager: TemplateManager) {
    // 启用缓存功能
  }

  private enableAnalytics(manager: TemplateManager) {
    // 启用分析功能
  }

  private enableTheming(manager: TemplateManager) {
    // 启用主题功能
  }
}
```

## 🔌 插件通信

### 事件系统

```typescript
class EventPlugin implements Plugin {
  name = 'event'
  version = '1.0.0'

  private eventBus = new EventTarget()

  install(manager: TemplateManager) {
    // 将事件总线注入到管理器
    (manager as any).eventBus = this.eventBus
  }

  // 发送事件
  emit(eventName: string, data: any) {
    this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }))
  }

  // 监听事件
  on(eventName: string, handler: (event: CustomEvent) => void) {
    this.eventBus.addEventListener(eventName, handler)
  }

  // 移除监听
  off(eventName: string, handler: (event: CustomEvent) => void) {
    this.eventBus.removeEventListener(eventName, handler)
  }
}

// 使用事件系统
const eventPlugin = new EventPlugin()
manager.use(eventPlugin)

// 插件间通信
eventPlugin.on('template:loaded', (event) => {
  console.log('模板已加载:', event.detail)
})

eventPlugin.emit('template:loaded', { templateId: 'login-desktop-modern' })
```

### 插件依赖管理

```typescript
class DependencyPlugin implements Plugin {
  name = 'dependency'
  version = '1.0.0'
  dependencies = ['event', 'cache'] // 依赖其他插件

  install(manager: TemplateManager) {
    // 检查依赖
    const missingDeps = this.checkDependencies(manager)
    if (missingDeps.length > 0) {
      throw new Error(`缺少依赖插件: ${missingDeps.join(', ')}`)
    }

    // 获取依赖插件的实例
    const eventPlugin = manager.getPlugin('event')
    const cachePlugin = manager.getPlugin('cache')

    // 使用依赖插件的功能
    eventPlugin.on('cache:hit', this.onCacheHit.bind(this))
  }

  private checkDependencies(manager: TemplateManager): string[] {
    return this.dependencies.filter(dep => !manager.hasPlugin(dep))
  }

  private onCacheHit(event: CustomEvent) {
    console.log('缓存命中:', event.detail)
  }
}
```

## 📊 插件管理

### 插件注册表

```typescript
// 获取已注册的插件列表
const plugins = manager.getPlugins()
console.log('已注册插件:', plugins.map(p => p.name))

// 检查插件是否已注册
const hasLogger = manager.hasPlugin('logger')

// 获取特定插件实例
const loggerPlugin = manager.getPlugin('logger')

// 卸载插件
manager.unuse('logger')

// 重新加载插件
manager.reload('logger')
```

### 插件状态监控

```typescript
const manager = new TemplateManager({
  pluginMonitoring: {
    enabled: true,
    onPluginInstall: (plugin) => {
      console.log(`插件已安装: ${plugin.name} v${plugin.version}`)
    },
    onPluginUninstall: (plugin) => {
      console.log(`插件已卸载: ${plugin.name}`)
    },
    onPluginError: (plugin, error) => {
      console.error(`插件错误: ${plugin.name}`, error)
    }
  }
})
```

## 🎯 插件最佳实践

### 1. 插件设计原则

```typescript
// 单一职责原则
class SinglePurposePlugin implements Plugin {
  name = 'single-purpose'
  version = '1.0.0'

  // 只做一件事，并且做好
  install(manager: TemplateManager) {
    // 专注于单一功能
  }
}

// 开放封闭原则
class ExtensiblePlugin implements Plugin {
  name = 'extensible'
  version = '1.0.0'

  protected extensions: Map<string, any> = new Map()

  // 允许扩展，但不修改核心逻辑
  addExtension(name: string, extension: any) {
    this.extensions.set(name, extension)
  }
}
```

### 2. 错误处理

```typescript
class RobustPlugin implements Plugin {
  name = 'robust'
  version = '1.0.0'

  install(manager: TemplateManager) {
    try {
      this.doInstall(manager)
    }
    catch (error) {
      console.error(`插件 ${this.name} 安装失败:`, error)
      // 优雅降级
      this.fallbackInstall(manager)
    }
  }

  private doInstall(manager: TemplateManager) {
    // 主要安装逻辑
  }

  private fallbackInstall(manager: TemplateManager) {
    // 降级安装逻辑
  }

  hooks = {
    onTemplateError: (context) => {
      // 错误恢复逻辑
      try {
        this.recoverFromError(context)
      }
      catch (recoveryError) {
        console.error('错误恢复失败:', recoveryError)
      }
    }
  }

  private recoverFromError(context: any) {
    // 实现错误恢复
  }
}
```

### 3. 性能优化

```typescript
class OptimizedPlugin implements Plugin {
  name = 'optimized'
  version = '1.0.0'

  private cache = new Map()
  private debounceTimers = new Map()

  hooks = {
    beforeTemplateLoad: (context) => {
      // 防抖处理
      this.debounce(`load_${context.templateId}`, () => {
        this.handleTemplateLoad(context)
      }, 100)
    }
  }

  private debounce(key: string, fn: Function, delay: number) {
    const timer = this.debounceTimers.get(key)
    if (timer)
      clearTimeout(timer)

    this.debounceTimers.set(key, setTimeout(() => {
      fn()
      this.debounceTimers.delete(key)
    }, delay))
  }

  private handleTemplateLoad(context: any) {
    // 使用缓存避免重复计算
    const cacheKey = `load_${context.templateId}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const result = this.processTemplateLoad(context)
    this.cache.set(cacheKey, result)
    return result
  }

  private processTemplateLoad(context: any) {
    // 实际处理逻辑
  }
}
```

## 🔗 相关链接

- [模板管理](/guide/template-management)
- [自定义模板](/guide/custom-templates)
- [性能优化](/guide/performance)
- [API 参考](/api/plugin-system)
