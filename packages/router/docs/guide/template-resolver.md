# 模板解析器

模板解析器（TemplateRouteResolver）是 LDesign Router 中负责模板加载和管理的核心组件。它提供了强大的模板解析功能，支持设备特定的模板加载、缓存管理和错误处理。

## 概述

模板解析器的主要功能：

- 🔍 **智能解析** - 根据设备类型自动选择合适的模板
- 💾 **缓存管理** - 内置 LRU 缓存，提高加载性能
- 🔄 **自动回退** - 当特定模板不存在时自动回退到默认版本
- 🛡️ **错误处理** - 完善的错误处理和恢复机制
- 📊 **性能监控** - 可选的性能监控和调试功能

## 基础用法

### 创建解析器实例

```typescript
import { TemplateRouteResolver } from '@ldesign/router'

// 使用默认配置
const resolver = new TemplateRouteResolver()

// 使用自定义配置
const resolver = new TemplateRouteResolver({
  defaultCategory: 'pages',
  templateRoot: 'src/templates',
  enableCache: true,
  timeout: 10000,
  autoScan: true,
  enableHMR: false,
  defaultDevice: 'desktop',
  enablePerformanceMonitor: false,
  debug: false,
})
```

### 解析模板

```typescript
// 解析指定模板
const component = await resolver.resolveTemplate(
  'pages',        // 模板分类
  'home-page',    // 模板名称
  'mobile'        // 设备类型
)

// 在 Vue 组件中使用
export default defineComponent({
  async setup() {
    const resolver = new TemplateRouteResolver()
    const HomeComponent = await resolver.resolveTemplate('pages', 'home-page', 'mobile')
    
    return {
      HomeComponent,
    }
  },
})
```

### 检查模板存在性

```typescript
// 检查模板是否存在
const hasTemplate = await resolver.hasTemplate('pages', 'home-page', 'mobile')

if (hasTemplate) {
  const component = await resolver.resolveTemplate('pages', 'home-page', 'mobile')
} else {
  console.log('模板不存在，将使用回退方案')
}
```

### 获取可用模板

```typescript
// 获取指定分类和设备的所有可用模板
const templates = await resolver.getAvailableTemplates('pages', 'mobile')
console.log('可用模板:', templates) // ['home-page', 'about-page', 'contact-page']

// 获取所有分类的模板
const allTemplates = await resolver.getAllTemplates()
console.log('所有模板:', allTemplates)
```

## 配置选项

### 完整配置接口

```typescript
interface TemplateRouteConfig {
  /** 默认模板分类 */
  defaultCategory?: string
  /** 模板根目录 */
  templateRoot?: string
  /** 是否启用模板缓存 */
  enableCache?: boolean
  /** 模板加载超时时间（毫秒） */
  timeout?: number
  /** 是否自动扫描模板 */
  autoScan?: boolean
  /** 是否启用热更新 */
  enableHMR?: boolean
  /** 默认设备类型 */
  defaultDevice?: 'mobile' | 'tablet' | 'desktop'
  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
}
```

### 缓存配置

```typescript
const resolver = new TemplateRouteResolver({
  enableCache: true,
  // 缓存会自动管理，无需额外配置
  // 内部使用 LRU 策略，最大缓存 50 个模板
})
```

### 性能监控配置

```typescript
const resolver = new TemplateRouteResolver({
  enablePerformanceMonitor: true,
  debug: true, // 启用调试日志
})

// 性能信息会在控制台输出
// 包括：加载时间、缓存命中率、错误统计等
```

## 高级功能

### 批量预加载

```typescript
// 预加载多个模板
const templates = [
  { category: 'pages', name: 'home-page', device: 'mobile' },
  { category: 'pages', name: 'about-page', device: 'mobile' },
  { category: 'products', name: 'product-list', device: 'mobile' },
]

const preloadPromises = templates.map(({ category, name, device }) =>
  resolver.resolveTemplate(category, name, device)
)

const components = await Promise.all(preloadPromises)
console.log('预加载完成:', components.length, '个模板')
```

### 动态模板加载

```typescript
// 根据运行时条件动态加载模板
async function loadDynamicTemplate(userType: string, device: string) {
  const templateName = `${userType}-dashboard`
  
  try {
    const component = await resolver.resolveTemplate('dashboards', templateName, device)
    return component
  } catch (error) {
    console.error('动态模板加载失败:', error)
    // 回退到默认模板
    return await resolver.resolveTemplate('dashboards', 'default-dashboard', device)
  }
}
```

### 模板热更新

```typescript
// 开发环境启用热更新
const resolver = new TemplateRouteResolver({
  enableHMR: process.env.NODE_ENV === 'development',
})

// 热更新会自动清除缓存并重新加载模板
// 无需手动处理
```

## 错误处理

### 错误类型

```typescript
// 模板解析可能遇到的错误类型
enum TemplateError {
  NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  LOAD_FAILED = 'TEMPLATE_LOAD_FAILED',
  TIMEOUT = 'TEMPLATE_TIMEOUT',
  INVALID_CONFIG = 'INVALID_CONFIG',
}
```

### 错误处理策略

```typescript
try {
  const component = await resolver.resolveTemplate('pages', 'complex-page', 'mobile')
} catch (error) {
  if (error.code === 'TEMPLATE_NOT_FOUND') {
    console.log('模板不存在，使用默认模板')
    // 自动回退机制会处理这种情况
  } else if (error.code === 'TEMPLATE_TIMEOUT') {
    console.log('模板加载超时')
    // 可以重试或使用缓存版本
  } else {
    console.error('未知错误:', error)
  }
}
```

### 自定义错误组件

```typescript
// 解析器会在错误时返回错误组件
// 错误组件包含错误信息和重试功能
const errorComponent = await resolver.resolveTemplate('pages', 'non-existent', 'mobile')
// 返回的是一个显示错误信息的 Vue 组件
```

## 性能优化

### 缓存策略

```typescript
// 缓存会自动管理，但您可以手动控制
const resolver = new TemplateRouteResolver({
  enableCache: true,
})

// 清除特定模板的缓存
resolver.clearCache('pages', 'home-page', 'mobile')

// 清除所有缓存
resolver.clearAllCache()
```

### 内存管理

```typescript
// 在组件销毁时清理资源
export default defineComponent({
  setup() {
    const resolver = new TemplateRouteResolver()
    
    onUnmounted(() => {
      // 清理解析器资源
      resolver.destroy()
    })
    
    return { resolver }
  },
})
```

### 性能监控

```typescript
// 获取性能统计信息
const stats = resolver.getPerformanceStats()
console.log('性能统计:', {
  totalRequests: stats.totalRequests,
  cacheHitRate: stats.cacheHitRate,
  averageLoadTime: stats.averageLoadTime,
  errorRate: stats.errorRate,
})
```

## 调试和开发

### 调试模式

```typescript
const resolver = new TemplateRouteResolver({
  debug: true,
})

// 调试模式下会输出详细日志：
// - 模板查找路径
// - 缓存命中情况
// - 加载时间统计
// - 错误详细信息
```

### 开发工具集成

```typescript
// 在 Vue DevTools 中查看模板信息
if (process.env.NODE_ENV === 'development') {
  window.__TEMPLATE_RESOLVER__ = resolver
  // 可以在控制台中使用 __TEMPLATE_RESOLVER__ 进行调试
}
```

## API 参考

### 主要方法

```typescript
class TemplateRouteResolver {
  // 解析模板
  resolveTemplate(category: string, name: string, device: string): Promise<Component>
  
  // 检查模板是否存在
  hasTemplate(category: string, name: string, device: string): Promise<boolean>
  
  // 获取可用模板列表
  getAvailableTemplates(category: string, device: string): Promise<string[]>
  
  // 清理资源
  destroy(): void
  
  // 缓存管理
  clearCache(category?: string, name?: string, device?: string): void
  clearAllCache(): void
  
  // 性能统计
  getPerformanceStats(): PerformanceStats
}
```

## 最佳实践

1. **合理使用缓存** - 在生产环境启用缓存，开发环境可以禁用
2. **错误处理** - 始终处理模板加载可能的错误
3. **资源清理** - 在组件销毁时调用 `destroy()` 方法
4. **性能监控** - 在开发环境启用性能监控
5. **预加载策略** - 对关键模板进行预加载
6. **内存管理** - 避免创建过多解析器实例

## 下一步

- [设备模板](./device-templates.md) - 了解设备特定模板的最佳实践
- [模板路由](./template-routing.md) - 回到模板路由概述
