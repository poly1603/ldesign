# API 参考

LDesign Template 提供了丰富的 API 来满足各种使用场景。本节将详细介绍所有可用的 API。

## 核心 API

### TemplateManager

模板管理器是系统的核心，负责模板的加载、缓存和渲染。

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager(options)
```

[查看详细文档 →](./template-manager.md)

### useTemplate

Vue 3 Composition API，提供响应式的模板管理功能。

```typescript
import { useTemplate } from '@ldesign/template'

const {
  currentTemplate,
  loading,
  error,
  render
} = useTemplate(options)
```

[查看详细文档 →](./use-template.md)

## 组件 API

### TemplateRenderer

模板渲染器组件，用于在模板中渲染指定的模板。

```vue
<LTemplateRenderer
  category="login"
  device="desktop"
  template="classic"
  :template-props="props"
  @load="onLoad"
  @error="onError"
/>
```

[查看详细文档 →](./template-renderer.md)

## 指令 API

### v-template

模板指令，提供声明式的模板渲染方式。

```vue
<div v-template="{ category: 'login', template: 'classic' }" />
```

[查看详细文档 →](./directives.md)

## 工具函数

### 设备检测

```typescript
import {
  createDeviceWatcher,
  detectDevice,
  detectDeviceByUserAgent,
  detectDeviceByViewport
} from '@ldesign/template'
```

### 缓存管理

```typescript
import {
  LRUCache,
  TemplateCache
} from '@ldesign/template'
```

[查看详细文档 →](./utilities.md)

## 类型定义

### 核心类型

```typescript
// 设备类型
type DeviceType = 'desktop' | 'mobile' | 'tablet'

// 模板配置
interface TemplateConfig {
  name: string
  title: string
  description?: string
  version: string
  author?: string
  category: string
  device: DeviceType
  tags?: string[]
  preview?: string
  props?: Record<string, PropConfig>
  dependencies?: string[]
  compatibility?: CompatibilityConfig
}

// 模板元数据
interface TemplateMetadata {
  category: string
  device: DeviceType
  template: string
  config: TemplateConfig
  path: string
  lastModified?: number
}

// 模板组件
type TemplateComponent = Component | AsyncComponentLoader
```

### 配置类型

```typescript
// 模板管理器配置
interface TemplateManagerConfig {
  defaultDevice?: DeviceType
  autoScan?: boolean
  autoDetectDevice?: boolean
  cacheEnabled?: boolean
  cacheSize?: number
  cacheTTL?: number
  preloadEnabled?: boolean
  scanPaths?: string[]
  deviceBreakpoints?: DeviceBreakpoints
}

// 设备断点配置
interface DeviceBreakpoints {
  mobile: number
  tablet: number
}

// 插件配置
interface TemplatePluginOptions extends TemplateManagerConfig {
  globalComponents?: boolean
  globalDirectives?: boolean
}
```

### 事件类型

```typescript
// 模板变化事件
interface TemplateChangeEvent {
  type: 'load' | 'error' | 'switch'
  category: string
  device: DeviceType
  template: string
  component?: TemplateComponent
  error?: Error
  timestamp: number
}

// 设备变化事件
interface DeviceChangeEvent {
  oldDevice: DeviceType
  newDevice: DeviceType
  viewport: {
    width: number
    height: number
  }
  timestamp: number
}
```

## 插件 API

### TemplatePlugin

Vue 插件，提供全局注册功能。

```typescript
import { TemplatePlugin } from '@ldesign/template'

app.use(TemplatePlugin, {
  defaultDevice: 'desktop',
  autoScan: true,
  autoDetectDevice: true
})
```

### 全局方法

插件注册后，可以通过以下方式访问全局模板管理器：

```typescript
import { getGlobalTemplateManager } from '@ldesign/template'

const manager = getGlobalTemplateManager()
```

## 错误处理

### 错误类型

```typescript
// 模板未找到错误
class TemplateNotFoundError extends Error {
  category: string
  device: DeviceType
  template: string
}

// 模板加载错误
class TemplateLoadError extends Error {
  category: string
  device: DeviceType
  template: string
  cause?: Error
}

// 配置错误
class ConfigurationError extends Error {
  field: string
  value: any
}
```

### 错误处理最佳实践

```typescript
try {
  const component = await manager.loadTemplate('login', 'desktop', 'classic')
}
catch (error) {
  if (error instanceof TemplateNotFoundError) {
    // 处理模板未找到
    console.warn('模板未找到，使用默认模板')
  }
  else if (error instanceof TemplateLoadError) {
    // 处理加载错误
    console.error('模板加载失败:', error.cause)
  }
  else {
    // 处理其他错误
    console.error('未知错误:', error)
  }
}
```

## 性能优化

### 预加载

```typescript
// 预加载常用模板
manager.preload([
  { category: 'login', device: 'desktop', template: 'classic' },
  { category: 'login', device: 'mobile', template: 'simple' }
])
```

### 缓存配置

```typescript
const manager = new TemplateManager({
  cacheEnabled: true,
  cacheSize: 100,
  cacheTTL: 5 * 60 * 1000 // 5分钟
})
```

### 懒加载

```typescript
// 使用动态导入实现懒加载
const LazyTemplate = defineAsyncComponent(() =>
  import('./templates/login/desktop/classic/index.vue')
)
```

## 调试工具

### 开发模式

```typescript
const manager = new TemplateManager({
  debug: process.env.NODE_ENV === 'development'
})
```

### 日志记录

```typescript
// 启用详细日志
manager.setLogLevel('debug')

// 监听事件
manager.on('template:load', (event) => {
  console.log('模板加载:', event)
})
```

## 🆕 性能优化 API

### LazyTemplate 组件

懒加载模板组件，支持 Intersection Observer API 进行可视区域检测。

```vue
<LazyTemplate
  category="login"
  device="desktop"
  template="default"
  :lazy="true"
  :placeholder-height="300"
  @load="handleLoad"
  @visible="handleVisible"
>
  <template #loading>
    <div class="loading">加载中...</div>
  </template>
</LazyTemplate>
```

[查看详细文档 →](./vue-components.md#lazytemplate)

### PerformanceMonitor 组件

性能监控组件，提供实时性能指标显示。

```vue
<PerformanceMonitor
  :detailed="true"
  :update-interval="1000"
  @update="handlePerformanceUpdate"
/>
```

[查看详细文档 →](./vue-components.md#performancemonitor)

### useVirtualScroll Composable

虚拟滚动 Composable，用于优化大量数据的渲染性能。

```typescript
const {
  containerRef,
  visibleItems,
  totalHeight,
  handleScroll,
} = useVirtualScroll(items, {
  containerHeight: 400,
  itemHeight: 60,
})
```

[查看详细文档 →](./vue-composables.md#usevirtualscroll)

## 下一步

- 查看具体的 [TemplateManager API](./template-manager.md)
- 了解 [useTemplate Composable](./use-template.md)
- 学习 [组件使用方法](./template-renderer.md)
- 探索 [工具函数](./utilities.md)
- 🆕 体验 [Vue 组件 API](./vue-components.md)
- 🆕 使用 [Vue Composables API](./vue-composables.md)
