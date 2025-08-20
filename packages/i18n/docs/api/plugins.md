# 插件系统 API

## 概述

@ldesign/i18n 提供了强大的插件系统，支持功能扩展和自定义。插件系统包括：

- **核心插件系统** - 基础的插件管理功能
- **Engine 插件** - 与 @ldesign/engine 框架的集成
- **Vue 插件** - Vue 3 原生插件支持

## 核心插件系统

### PluginManager

插件管理器负责插件的注册、安装、卸载和生命周期管理。

#### 方法

##### `register<T>(plugin: Plugin<T>, options?: T): Promise<void>`

注册并安装插件。

**参数：**
- `plugin` - 插件实例
- `options` - 插件配置选项

**示例：**
```typescript
import { cachePlugin, performancePlugin } from '@ldesign/i18n'

const i18n = new I18n()

// 注册缓存插件
await i18n.plugins.register(cachePlugin, {
  maxSize: 500,
  ttl: 5 * 60 * 1000, // 5分钟
  lru: true
})

// 注册性能监控插件
await i18n.plugins.register(performancePlugin, {
  enabled: true,
  slowThreshold: 10,
  maxRecords: 1000
})
```

##### `unregister(pluginId: string): Promise<void>`

卸载插件。

```typescript
await i18n.plugins.unregister('cache-plugin')
```

##### `isRegistered(pluginId: string): boolean`

检查插件是否已注册。

```typescript
const isRegistered = i18n.plugins.isRegistered('cache-plugin')
```

##### `getPlugin<T>(pluginId: string): Plugin<T> | undefined`

获取插件实例。

```typescript
const cachePlugin = i18n.plugins.getPlugin('cache-plugin')
```

##### `getStats(): PluginStats`

获取插件统计信息。

```typescript
const stats = i18n.plugins.getStats()
console.log(stats.totalPlugins) // 总插件数
console.log(stats.activePlugins) // 活跃插件数
console.log(stats.pluginList) // 插件列表
```

### Plugin 接口

```typescript
interface Plugin<T = any> {
  /** 插件唯一标识 */
  id: string
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description?: string
  /** 插件依赖 */
  dependencies?: string[]
  
  /** 安装方法 */
  install(context: PluginContext, options?: T): Promise<void> | void
  /** 卸载方法 */
  uninstall?(context: PluginContext): Promise<void> | void
  
  /** 生命周期钩子 */
  beforeInstall?(context: PluginContext): Promise<void> | void
  afterInstall?(context: PluginContext): Promise<void> | void
  beforeUninstall?(context: PluginContext): Promise<void> | void
  afterUninstall?(context: PluginContext): Promise<void> | void
}
```

### PluginContext

```typescript
interface PluginContext {
  /** I18n 实例 */
  i18n: I18n
  /** 事件发射器 */
  events: EventEmitter
  /** 日志记录器 */
  logger: Logger
  /** 插件管理器 */
  plugins: PluginManager
}
```

## 内置插件

### 缓存插件 (cachePlugin)

提供高级缓存功能，包括 LRU 缓存、TTL 支持、内存管理等。

#### 配置选项

```typescript
interface CachePluginOptions {
  /** 最大缓存大小 */
  maxSize?: number
  /** 最大内存使用量（字节） */
  maxMemory?: number
  /** 默认TTL（毫秒） */
  ttl?: number
  /** 是否启用LRU */
  lru?: boolean
  /** 预加载键列表 */
  preloadKeys?: string[]
  /** 是否启用指标收集 */
  enableMetrics?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
}
```

#### 示例

```typescript
await i18n.plugins.register(cachePlugin, {
  maxSize: 1000,
  maxMemory: 10 * 1024 * 1024, // 10MB
  ttl: 30 * 60 * 1000, // 30分钟
  lru: true,
  preloadKeys: ['common.save', 'common.cancel'],
  enableMetrics: true,
  cleanupInterval: 5 * 60 * 1000 // 5分钟
})
```

### 性能监控插件 (performancePlugin)

提供详细的性能监控和分析功能。

#### 配置选项

```typescript
interface PerformancePluginOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 慢查询阈值（毫秒） */
  slowThreshold?: number
  /** 最大记录数 */
  maxRecords?: number
  /** 采样率 (0-1) */
  sampleRate?: number
  /** 是否收集堆栈跟踪 */
  collectStackTrace?: boolean
  /** 报告间隔（毫秒） */
  reportInterval?: number
  /** 是否启用智能采样 */
  enableSmartSampling?: boolean
}
```

#### 示例

```typescript
await i18n.plugins.register(performancePlugin, {
  enabled: true,
  slowThreshold: 5,
  maxRecords: 1000,
  sampleRate: 0.1, // 10% 采样
  collectStackTrace: true,
  reportInterval: 60000, // 1分钟
  enableSmartSampling: true
})
```

### 错误报告插件 (errorReportingPlugin)

提供错误收集和报告功能。

#### 配置选项

```typescript
interface ErrorReportingPluginOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 报告端点 */
  endpoint?: string
  /** API 密钥 */
  apiKey?: string
  /** 最大错误数 */
  maxErrors?: number
  /** 报告间隔（毫秒） */
  reportInterval?: number
  /** 错误过滤器 */
  errorFilter?: (error: I18nError) => boolean
}
```

## Engine 插件

### createI18nEnginePlugin

创建与 @ldesign/engine 框架集成的插件。

```typescript
function createI18nEnginePlugin(options?: EnginePluginOptions): EnginePlugin
```

#### 配置选项

```typescript
interface EnginePluginOptions {
  /** 默认语言 */
  defaultLanguage?: string
  /** 降级语言 */
  fallbackLanguage?: string
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 是否启用错误报告 */
  enableErrorReporting?: boolean
  /** 预加载语言列表 */
  preloadLanguages?: string[]
  /** 是否使用内置语言包 */
  useBuiltinLocales?: boolean
  /** 自定义 I18n 工厂函数 */
  createI18nInstance?: () => Promise<I18n>
}
```

#### 示例

```typescript
import { createEngine } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'

const engine = createEngine()

const i18nPlugin = createI18nEnginePlugin({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en',
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  preloadLanguages: ['zh-CN', 'en'],
  useBuiltinLocales: true
})

await engine.use(i18nPlugin)

// 使用 Engine 中的 I18n 功能
const i18n = engine.i18n
console.log(i18n.t('common.welcome'))
```

#### Engine 事件

Engine 插件会发出以下事件：

```typescript
// 插件安装完成
engine.events.on('plugin:i18n:installed', (data) => {
  console.log('I18n plugin installed:', data)
})

// 语言切换
engine.events.on('i18n:languageChanged', ({ locale, previous }) => {
  console.log(`Language changed from ${previous} to ${locale}`)
})

// 性能报告
engine.events.on('i18n:performanceReport', ({ metrics }) => {
  console.log('Performance metrics:', metrics)
})

// 错误报告
engine.events.on('i18n:error', ({ error, context }) => {
  console.error('I18n error:', error, context)
})
```

## 自定义插件开发

### 基础插件

```typescript
import { Plugin, PluginContext } from '@ldesign/i18n'

const myPlugin: Plugin = {
  id: 'my-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',
  description: 'A custom plugin example',
  
  async install(context: PluginContext) {
    const { i18n, events, logger } = context
    
    logger.info('Installing my plugin...')
    
    // 监听翻译事件
    events.on('translation:before', (data) => {
      console.log('Before translation:', data.key)
    })
    
    events.on('translation:after', (data) => {
      console.log('After translation:', data.key, data.result)
    })
    
    // 扩展 I18n 实例
    i18n.myCustomMethod = () => {
      return 'Hello from my plugin!'
    }
    
    logger.info('My plugin installed successfully')
  },
  
  async uninstall(context: PluginContext) {
    const { i18n, logger } = context
    
    logger.info('Uninstalling my plugin...')
    
    // 清理扩展方法
    delete i18n.myCustomMethod
    
    logger.info('My plugin uninstalled successfully')
  }
}

// 注册插件
await i18n.plugins.register(myPlugin)
```

### 带配置的插件

```typescript
interface MyPluginOptions {
  prefix?: string
  enabled?: boolean
  maxItems?: number
}

const createMyPlugin = (options: MyPluginOptions = {}): Plugin<MyPluginOptions> => ({
  id: 'my-configurable-plugin',
  name: 'My Configurable Plugin',
  version: '1.0.0',
  
  async install(context: PluginContext, pluginOptions?: MyPluginOptions) {
    const config = { ...options, ...pluginOptions }
    const { i18n, events, logger } = context
    
    if (!config.enabled) {
      logger.info('Plugin is disabled, skipping installation')
      return
    }
    
    // 使用配置
    const prefix = config.prefix || 'default'
    const maxItems = config.maxItems || 100
    
    // 插件逻辑...
    logger.info(`Plugin installed with prefix: ${prefix}, maxItems: ${maxItems}`)
  }
})

// 使用插件
const myPlugin = createMyPlugin({
  prefix: 'custom',
  enabled: true,
  maxItems: 200
})

await i18n.plugins.register(myPlugin, {
  maxItems: 300 // 覆盖默认配置
})
```

### 插件生命周期

```typescript
const lifecyclePlugin: Plugin = {
  id: 'lifecycle-plugin',
  name: 'Lifecycle Plugin',
  version: '1.0.0',
  
  async beforeInstall(context) {
    console.log('Before install: preparing...')
    // 预安装检查
  },
  
  async install(context) {
    console.log('Installing: main logic...')
    // 主要安装逻辑
  },
  
  async afterInstall(context) {
    console.log('After install: finalizing...')
    // 后安装清理
  },
  
  async beforeUninstall(context) {
    console.log('Before uninstall: preparing...')
    // 预卸载准备
  },
  
  async uninstall(context) {
    console.log('Uninstalling: cleanup...')
    // 主要卸载逻辑
  },
  
  async afterUninstall(context) {
    console.log('After uninstall: finalized')
    // 后卸载清理
  }
}
```

## 插件最佳实践

### 1. 错误处理

```typescript
const robustPlugin: Plugin = {
  id: 'robust-plugin',
  name: 'Robust Plugin',
  version: '1.0.0',
  
  async install(context) {
    try {
      // 插件逻辑
    } catch (error) {
      context.logger.error('Plugin installation failed:', error)
      throw error // 重新抛出以便插件管理器处理
    }
  }
}
```

### 2. 依赖检查

```typescript
const dependentPlugin: Plugin = {
  id: 'dependent-plugin',
  name: 'Dependent Plugin',
  version: '1.0.0',
  dependencies: ['cache-plugin'],
  
  async install(context) {
    // 检查依赖
    if (!context.plugins.isRegistered('cache-plugin')) {
      throw new Error('Cache plugin is required')
    }
    
    // 获取依赖插件
    const cachePlugin = context.plugins.getPlugin('cache-plugin')
    
    // 使用依赖插件的功能
  }
}
```

### 3. 配置验证

```typescript
const validatedPlugin: Plugin<{ apiKey: string; timeout: number }> = {
  id: 'validated-plugin',
  name: 'Validated Plugin',
  version: '1.0.0',
  
  async install(context, options) {
    // 验证配置
    if (!options?.apiKey) {
      throw new Error('API key is required')
    }
    
    if (options.timeout && options.timeout < 1000) {
      throw new Error('Timeout must be at least 1000ms')
    }
    
    // 使用验证后的配置
  }
}
```
