# 配置选项

本指南详细介绍了 **@ldesign/size** 的所有配置选项，帮助你根据项目需求进行定制。

## 🔧 基础配置

### SizeManagerOptions

```typescript
interface SizeManagerOptions {
  // 默认尺寸模式
  defaultMode?: SizeMode

  // 是否启用本地存储
  enableStorage?: boolean

  // 存储类型
  storageType?: 'localStorage' | 'sessionStorage' | 'memory'

  // 是否自动注入CSS
  autoInject?: boolean

  // CSS变量前缀
  cssPrefix?: string

  // 目标选择器
  targetSelector?: string

  // 是否启用过渡动画
  enableTransition?: boolean

  // 过渡持续时间
  transitionDuration?: string

  // 过渡缓动函数
  transitionEasing?: string

  // 自定义预设
  customPresets?: Partial<Record<SizeMode, SizeConfig>>

  // 是否启用响应式检测
  enableResponsive?: boolean

  // 响应式断点
  breakpoints?: ResponsiveBreakpoints
}
```

### 默认配置

```typescript
const defaultOptions: SizeManagerOptions = {
  defaultMode: 'medium',
  enableStorage: true,
  storageType: 'localStorage',
  autoInject: true,
  cssPrefix: 'ls',
  targetSelector: ':root',
  enableTransition: true,
  transitionDuration: '0.3s',
  transitionEasing: 'ease-in-out',
  enableResponsive: false
}
```

## 🎯 详细配置说明

### defaultMode

设置默认的尺寸模式。

```typescript
// 可选值
type SizeMode = 'small' | 'medium' | 'large'

// 示例
const manager = createSizeManager({
  defaultMode: 'large' // 默认使用大尺寸
})
```

### enableStorage

是否启用本地存储来保存用户的尺寸偏好。

```typescript
const manager = createSizeManager({
  enableStorage: true // 启用存储
})

// 用户选择会被记住
manager.setMode('large') // 下次访问时自动恢复
```

### storageType

指定存储类型。

```typescript
const manager = createSizeManager({
  storageType: 'localStorage' // 持久存储
  // storageType: 'sessionStorage' // 会话存储
  // storageType: 'memory'         // 内存存储（不持久）
})
```

### autoInject

是否自动注入CSS变量到页面。

```typescript
const manager = createSizeManager({
  autoInject: true // 自动注入CSS变量
})

// 手动控制注入
const manager2 = createSizeManager({
  autoInject: false
})

// 手动注入
manager2.injectCSS()
```

### cssPrefix

自定义CSS变量前缀，避免命名冲突。

```typescript
const manager = createSizeManager({
  cssPrefix: 'my-app' // 自定义前缀
})

// 生成的CSS变量：
// --my-app-font-size
// --my-app-spacing
// --my-app-border-radius
```

### targetSelector

指定CSS变量注入的目标选择器。

```typescript
const manager = createSizeManager({
  targetSelector: '.my-app' // 注入到特定元素
})

// CSS变量会注入到 .my-app 元素而不是 :root
```

### 过渡动画配置

```typescript
const manager = createSizeManager({
  enableTransition: true,
  transitionDuration: '0.5s',
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)'
})
```

## 🎨 自定义预设

### 基础自定义

```typescript
const manager = createSizeManager({
  customPresets: {
    small: {
      fontSize: '11px',
      spacing: '4px',
      borderRadius: '2px'
    },
    medium: {
      fontSize: '15px',
      spacing: '10px',
      borderRadius: '5px'
    },
    large: {
      fontSize: '18px',
      spacing: '16px',
      borderRadius: '8px'
    }
  }
})
```

### 完整配置示例

```typescript
const customConfig: SizeConfig = {
  // 字体相关
  fontSize: '16px',
  fontSizeSmall: '14px',
  fontSizeLarge: '18px',
  lineHeight: '1.5',

  // 间距相关
  spacing: '12px',
  spacingSmall: '6px',
  spacingLarge: '24px',

  // 边框相关
  borderRadius: '6px',
  borderWidth: '1px',

  // 按钮相关
  buttonHeight: '40px',
  buttonPadding: '12px 16px',
  buttonFontSize: '14px',

  // 输入框相关
  inputHeight: '36px',
  inputPadding: '8px 12px',

  // 阴影相关
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',

  // 过渡相关
  transitionDuration: '0.3s',
  transitionEasing: 'ease-in-out'
}
```

## 📱 响应式配置

### 启用响应式

```typescript
const manager = createSizeManager({
  enableResponsive: true,
  breakpoints: {
    small: { maxWidth: 768 },
    medium: { minWidth: 769, maxWidth: 1199 },
    large: { minWidth: 1200 }
  }
})
```

### 自定义断点

```typescript
interface ResponsiveBreakpoints {
  small?: {
    minWidth?: number
    maxWidth?: number
    orientation?: 'portrait' | 'landscape'
  }
  medium?: {
    minWidth?: number
    maxWidth?: number
    orientation?: 'portrait' | 'landscape'
  }
  large?: {
    minWidth?: number
    maxWidth?: number
    orientation?: 'portrait' | 'landscape'
  }
}
```

## 🎭 Vue 插件配置

### VueSizePluginOptions

```typescript
interface VueSizePluginOptions extends SizeManagerOptions {
  // 是否全局注册组件
  globalComponents?: boolean

  // 组件名称前缀
  componentPrefix?: string

  // 是否提供全局属性
  globalProperties?: boolean

  // 是否注入到所有组件
  injectToComponents?: boolean
}
```

### Vue 插件使用

```typescript
import { VueSizePlugin } from '@ldesign/size/vue'
// main.ts
import { createApp } from 'vue'

const app = createApp(App)

app.use(VueSizePlugin, {
  // 基础配置
  defaultMode: 'medium',
  enableStorage: true,

  // Vue 特定配置
  globalComponents: true,
  componentPrefix: 'Ls',
  globalProperties: true,

  // 自定义预设
  customPresets: {
    small: { fontSize: '12px' },
    medium: { fontSize: '14px' },
    large: { fontSize: '16px' }
  }
})
```

## 🔍 高级配置

### 存储配置

```typescript
interface StorageConfig {
  // 存储键名
  key?: string

  // 存储版本（用于迁移）
  version?: string

  // 是否加密存储
  encrypt?: boolean

  // 过期时间（毫秒）
  expiry?: number
}

const manager = createSizeManager({
  enableStorage: true,
  storageConfig: {
    key: 'my-app-size-preference',
    version: '1.0',
    expiry: 30 * 24 * 60 * 60 * 1000 // 30天
  }
})
```

### 事件配置

```typescript
interface EventConfig {
  // 是否启用事件
  enabled?: boolean

  // 事件防抖延迟
  debounceDelay?: number

  // 是否冒泡
  bubbles?: boolean
}

const manager = createSizeManager({
  eventConfig: {
    enabled: true,
    debounceDelay: 100,
    bubbles: true
  }
})
```

## 🌍 环境配置

### 开发环境

```typescript
const devConfig: SizeManagerOptions = {
  defaultMode: 'medium',
  enableStorage: false, // 开发时不保存
  autoInject: true,
  enableTransition: false, // 开发时禁用动画
  cssPrefix: 'dev'
}
```

### 生产环境

```typescript
const prodConfig: SizeManagerOptions = {
  defaultMode: 'medium',
  enableStorage: true,
  autoInject: true,
  enableTransition: true,
  transitionDuration: '0.2s', // 生产环境使用更快的动画
  cssPrefix: 'app'
}
```

### 条件配置

```typescript
const config: SizeManagerOptions = {
  defaultMode: 'medium',
  enableStorage: process.env.NODE_ENV === 'production',
  enableTransition: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  cssPrefix: process.env.NODE_ENV === 'development' ? 'dev' : 'app'
}
```

## 📋 配置验证

### 运行时验证

```typescript
import { validateConfig } from '@ldesign/size'

const config = {
  defaultMode: 'invalid-mode', // 无效配置
  cssPrefix: ''
}

try {
  const validatedConfig = validateConfig(config)
  console.log('配置有效:', validatedConfig)
}
catch (error) {
  console.error('配置无效:', error.message)
}
```

### TypeScript 类型检查

```typescript
// 使用 TypeScript 确保配置类型正确
const config: SizeManagerOptions = {
  defaultMode: 'medium', // ✅ 正确
  // defaultMode: 'invalid', // ❌ TypeScript 错误

  enableStorage: true, // ✅ 正确
  // enableStorage: 'yes', // ❌ TypeScript 错误
}
```

## 🎯 最佳实践

### 1. 渐进增强

```typescript
// 从简单配置开始
const basicConfig = {
  defaultMode: 'medium'
}

// 逐步添加功能
const enhancedConfig = {
  ...basicConfig,
  enableStorage: true,
  enableTransition: true
}
```

### 2. 环境区分

```typescript
function getConfig(): SizeManagerOptions {
  const baseConfig = {
    defaultMode: 'medium' as const,
    cssPrefix: 'app'
  }

  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      enableStorage: false,
      enableTransition: false
    }
  }

  return {
    ...baseConfig,
    enableStorage: true,
    enableTransition: true
  }
}
```

### 3. 配置复用

```typescript
// 创建配置工厂
export function createSizeConfig(overrides: Partial<SizeManagerOptions> = {}) {
  return {
    defaultMode: 'medium',
    enableStorage: true,
    enableTransition: true,
    cssPrefix: 'app',
    ...overrides
  } as SizeManagerOptions
}

// 在不同地方使用
const config1 = createSizeConfig({ defaultMode: 'large' })
const config2 = createSizeConfig({ cssPrefix: 'admin' })
```

## 🔗 相关链接

- [基础用法](./basic-usage) - 了解如何使用配置
- [API 参考](../api/core) - 查看完整的 API 文档
- [Vue 集成](../guide/vue-plugin) - Vue 特定配置
- [最佳实践](../guide/best-practices) - 配置最佳实践
