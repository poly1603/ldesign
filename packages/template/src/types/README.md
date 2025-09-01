# 类型定义模块 (Types)

## 📋 概述

类型定义模块提供了Vue3模板管理系统的完整TypeScript类型定义，确保类型安全和良好的开发体验。所有类型都经过精心设计，支持严格的类型检查和智能代码提示。

## ✨ 主要特性

- **🔒 类型安全**：完整的TypeScript类型覆盖
- **📝 智能提示**：丰富的JSDoc注释和类型推导
- **🧩 模块化设计**：按功能模块组织类型定义
- **🔄 向后兼容**：保持API稳定性
- **📚 文档完整**：每个类型都有详细说明

## 📁 模块结构

```
types/
├── template.ts          # 模板相关类型
├── config.ts           # 配置相关类型
├── scanner.ts          # 扫描器相关类型
├── cache.ts            # 缓存相关类型
├── device.ts           # 设备相关类型
├── events.ts           # 事件相关类型
├── utils.ts            # 工具类型
└── index.ts            # 统一导出
```

## 🚀 快速开始

### 导入类型

```typescript
// 导入所有类型
import type * as TemplateTypes from '@ldesign/template/types'

// 导入特定类型
import type {
  DeviceType,
  ScanResult,
  TemplateConfig,
  TemplateMetadata
} from '@ldesign/template/types'

import type { TemplateSystemConfig } from '@ldesign/template/types/config'
// 按模块导入
import type { TemplateMetadata } from '@ldesign/template/types/template'
```

### 使用类型

```typescript
// 定义模板变量
const template: TemplateMetadata = {
  name: 'login-modern',
  displayName: '现代登录页面',
  category: 'login',
  device: 'desktop',
  // ... 其他属性
}

// 定义配置
const config: TemplateSystemConfig = {
  templatesDir: 'src/templates',
  autoScan: true,
  // ... 其他配置
}
```

## 📚 核心类型定义

### 1. 模板类型 (Template Types)

#### TemplateMetadata

模板元数据的完整类型定义：

```typescript
interface TemplateMetadata {
  /** 模板唯一标识符 */
  name: string

  /** 模板显示名称 */
  displayName: string

  /** 模板描述 */
  description: string

  /** 模板版本 */
  version: string

  /** 模板作者 */
  author: string

  /** 模板分类 */
  category: TemplateCategory

  /** 目标设备类型 */
  device: DeviceType

  /** 组件文件路径 */
  componentPath: string

  /** 组件加载器函数 */
  componentLoader?: () => Promise<Component>

  /** 配置文件路径 */
  configPath?: string

  /** 样式文件路径 */
  stylePath?: string

  /** 预览图片路径 */
  previewPath?: string

  /** 最后修改时间 */
  lastModified: number

  /** 是否为内置模板 */
  isBuiltIn: boolean

  /** 模板标签 */
  tags?: string[]

  /** 自定义元数据 */
  metadata?: Record<string, any>
}
```

#### TemplateConfig

模板配置类型：

```typescript
interface TemplateConfig {
  /** 模板名称 */
  name: string

  /** 显示名称 */
  displayName: string

  /** 描述信息 */
  description: string

  /** 版本号 */
  version: string

  /** 作者信息 */
  author: string

  /** 分类 */
  category: TemplateCategory

  /** 设备类型 */
  device: DeviceType

  /** 标签列表 */
  tags?: string[]

  /** 预览图片 */
  preview?: string

  /** 支持的属性 */
  props?: Record<string, PropDefinition>

  /** 插槽定义 */
  slots?: SlotDefinition[]

  /** 事件定义 */
  events?: EventDefinition[]

  /** 依赖项 */
  dependencies?: string[]

  /** 最小Vue版本 */
  minVueVersion?: string

  /** 功能特性 */
  features?: string[]

  /** 使用场景 */
  useCases?: string[]

  /** 自定义配置 */
  customConfig?: Record<string, any>
}
```

#### TemplateCategory

模板分类枚举：

```typescript
type TemplateCategory =
  | 'auth' // 认证相关
  | 'login' // 登录
  | 'register' // 注册
  | 'reset-password' // 重置密码
  | 'verify' // 验证
  | 'dashboard' // 仪表板
  | 'overview' // 概览
  | 'analytics' // 分析
  | 'reports' // 报告
  | 'metrics' // 指标
  | 'user' // 用户管理
  | 'profile' // 个人资料
  | 'settings' // 设置
  | 'permissions' // 权限
  | 'account' // 账户
  | 'form' // 表单
  | 'contact' // 联系
  | 'survey' // 调查
  | 'feedback' // 反馈
  | 'wizard' // 向导
  | 'content' // 内容
  | 'article' // 文章
  | 'blog' // 博客
  | 'news' // 新闻
  | 'gallery' // 画廊
  | 'ecommerce' // 电商
  | 'product' // 产品
  | 'cart' // 购物车
  | 'checkout' // 结账
  | 'order' // 订单
  | 'common' // 通用
  | 'header' // 头部
  | 'footer' // 底部
  | 'navigation' // 导航
  | 'error' // 错误页面
  | 'not-found' // 404页面
  | 'maintenance' // 维护页面
```

### 2. 设备类型 (Device Types)

```typescript
/** 设备类型 */
type DeviceType = 'desktop' | 'tablet' | 'mobile'

/** 设备信息 */
interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  userAgent: string
  isTouchDevice: boolean
}

/** 设备检测结果 */
interface DeviceDetectionResult {
  device: DeviceType
  confidence: number
  features: string[]
}
```

### 3. 配置类型 (Config Types)

#### TemplateSystemConfig

系统配置的完整类型：

```typescript
interface TemplateSystemConfig {
  /** 模板根目录 */
  templatesDir: string

  /** 是否自动扫描 */
  autoScan: boolean

  /** 是否启用热更新 */
  enableHMR: boolean

  /** 默认设备类型 */
  defaultDevice: DeviceType

  /** 调试模式 */
  debug: boolean

  /** 扫描器配置 */
  scanner: ScannerConfig

  /** 缓存配置 */
  cache: CacheConfig

  /** 错误处理配置 */
  errorHandling: ErrorHandlingConfig
}
```

#### ScannerConfig

扫描器配置类型：

```typescript
interface ScannerConfig {
  /** 最大扫描深度 */
  maxDepth: number

  /** 包含的文件扩展名 */
  includeExtensions: string[]

  /** 排除的路径模式 */
  excludePatterns: string[]

  /** 是否启用缓存 */
  enableCache: boolean

  /** 是否启用监听模式 */
  watchMode: boolean

  /** 防抖延迟时间 */
  debounceDelay: number

  /** 批处理大小 */
  batchSize: number
}
```

### 4. 扫描器类型 (Scanner Types)

#### ScanResult

扫描结果类型：

```typescript
interface ScanResult {
  /** 扫描到的模板 */
  templates: Map<string, TemplateMetadata>

  /** 扫描统计信息 */
  stats: ScanStats

  /** 扫描错误 */
  errors: ScanError[]

  /** 扫描时间戳 */
  timestamp: number
}
```

#### ScanStats

扫描统计信息：

```typescript
interface ScanStats {
  /** 总模板数 */
  totalTemplates: number

  /** 总文件数 */
  totalFiles: number

  /** 扫描耗时 */
  scanDuration: number

  /** 缓存命中次数 */
  cacheHits: number

  /** 按分类统计 */
  byCategory: Record<string, number>

  /** 按设备统计 */
  byDevice: Record<string, number>

  /** 按文件类型统计 */
  byFileType: Record<string, number>
}
```

### 5. 缓存类型 (Cache Types)

```typescript
/** 缓存策略 */
type CacheStrategy = 'lru' | 'fifo' | 'lfu'

/** 缓存配置 */
interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean

  /** 缓存策略 */
  strategy: CacheStrategy

  /** 最大缓存大小 */
  maxSize: number

  /** 缓存过期时间 */
  ttl: number
}

/** 缓存项 */
interface CacheItem<T> {
  /** 缓存值 */
  value: T

  /** 创建时间 */
  createdAt: number

  /** 最后访问时间 */
  lastAccessed: number

  /** 访问次数 */
  accessCount: number

  /** 过期时间 */
  expiresAt?: number
}
```

### 6. 事件类型 (Event Types)

```typescript
/** 模板事件类型 */
type TemplateEventType =
  | 'template-found'
  | 'template-updated'
  | 'template-removed'
  | 'scan-started'
  | 'scan-completed'
  | 'scan-error'

/** 模板事件 */
interface TemplateEvent {
  type: TemplateEventType
  template?: TemplateMetadata
  error?: Error
  timestamp: number
  data?: any
}

/** 事件监听器 */
type TemplateEventListener = (event: TemplateEvent) => void

/** 配置更新事件 */
interface ConfigUpdateEvent {
  path: string
  oldValue: any
  newValue: any
  timestamp: number
}
```

### 7. 工具类型 (Utility Types)

```typescript
/** 深度可选 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 深度只读 */
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/** 提取函数参数类型 */
type ExtractFunctionArgs<T> = T extends (...args: infer A) => any ? A : never

/** 提取函数返回类型 */
type ExtractFunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never

/** 模板过滤器 */
interface TemplateFilter {
  categories?: TemplateCategory[]
  devices?: DeviceType[]
  tags?: string[]
  keyword?: string
  author?: string
  isBuiltIn?: boolean
}

/** 排序选项 */
interface SortOptions {
  field: keyof TemplateMetadata
  direction: 'asc' | 'desc'
}
```

## 🔧 类型守卫和验证

### 类型守卫函数

```typescript
/** 检查是否为有效的设备类型 */
function isValidDeviceType(value: any): value is DeviceType {
  return ['desktop', 'tablet', 'mobile'].includes(value)
}

/** 检查是否为有效的模板分类 */
function isValidTemplateCategory(value: any): value is TemplateCategory {
  return [
    'auth',
    'login',
    'register',
    'dashboard',
    'user',
    'form',
    'content',
    'ecommerce',
    'common',
    'error'
  ].includes(value)
}

/** 检查是否为完整的模板元数据 */
function isCompleteTemplateMetadata(value: any): value is TemplateMetadata {
  return (
    typeof value === 'object'
    && typeof value.name === 'string'
    && typeof value.displayName === 'string'
    && isValidTemplateCategory(value.category)
    && isValidDeviceType(value.device)
  )
}
```

### 验证函数

```typescript
/** 验证模板配置 */
function validateTemplateConfig(config: any): config is TemplateConfig {
  try {
    return (
      typeof config.name === 'string'
      && typeof config.displayName === 'string'
      && isValidTemplateCategory(config.category)
      && isValidDeviceType(config.device)
    )
  }
  catch {
    return false
  }
}

/** 验证系统配置 */
function validateSystemConfig(config: any): config is TemplateSystemConfig {
  try {
    return (
      typeof config.templatesDir === 'string'
      && typeof config.autoScan === 'boolean'
      && isValidDeviceType(config.defaultDevice)
    )
  }
  catch {
    return false
  }
}
```

## 🎯 使用示例

### 创建类型安全的模板

```typescript
import type { TemplateConfig, TemplateMetadata } from '@ldesign/template/types'

// 定义模板元数据
const loginTemplate: TemplateMetadata = {
  name: 'login-modern',
  displayName: '现代登录页面',
  description: '简洁现代的登录页面设计',
  version: '1.0.0',
  author: 'LDesign Team',
  category: 'login',
  device: 'desktop',
  componentPath: './login/desktop/modern/index.vue',
  lastModified: Date.now(),
  isBuiltIn: true,
  tags: ['modern', 'responsive']
}

// 定义模板配置
const loginConfig: TemplateConfig = {
  name: 'login-modern',
  displayName: '现代登录页面',
  description: '简洁现代的登录页面设计',
  version: '1.0.0',
  author: 'LDesign Team',
  category: 'login',
  device: 'desktop',
  tags: ['modern', 'responsive'],
  props: {
    title: {
      type: String,
      default: '用户登录',
      description: '登录页面标题'
    }
  }
}
```

### 类型安全的函数定义

```typescript
import type {
  DeviceType,
  SortOptions,
  TemplateFilter,
  TemplateMetadata
} from '@ldesign/template/types'

// 过滤模板函数
function filterTemplates(
  templates: TemplateMetadata[],
  filter: TemplateFilter
): TemplateMetadata[] {
  return templates.filter((template) => {
    if (filter.categories && !filter.categories.includes(template.category)) {
      return false
    }
    if (filter.devices && !filter.devices.includes(template.device)) {
      return false
    }
    if (filter.keyword && !template.displayName.includes(filter.keyword)) {
      return false
    }
    return true
  })
}

// 排序模板函数
function sortTemplates(
  templates: TemplateMetadata[],
  options: SortOptions
): TemplateMetadata[] {
  return [...templates].sort((a, b) => {
    const aValue = a[options.field]
    const bValue = b[options.field]

    if (options.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    }
    else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
}
```

## 📝 最佳实践

1. **使用类型导入**：使用 `import type` 导入类型，避免运行时开销
2. **类型守卫**：使用类型守卫函数确保运行时类型安全
3. **泛型约束**：合理使用泛型约束提高类型安全性
4. **工具类型**：利用工具类型简化复杂类型定义
5. **文档注释**：为类型添加详细的JSDoc注释

## 🔗 相关模块

- [模板扫描器](../scanner/README.md)
- [配置管理器](../config/README.md)
- [组合式函数](../composables/README.md)
- [工具函数](../utils/README.md)

## 📄 许可证

MIT License - 详见 [LICENSE](../../../LICENSE) 文件
