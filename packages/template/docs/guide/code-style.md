# 代码风格指南

本指南定义了 LDesign Template 项目的代码风格和最佳实践，确保代码的一致性和可维护性。

## 📝 注释规范

### JSDoc 注释

所有公共 API 都必须有完整的 JSDoc 注释：

````typescript
/**
 * 模板管理器
 *
 * 负责模板的加载、缓存、切换等核心功能，提供：
 * - 🎨 多设备响应式模板支持
 * - 🚀 智能缓存和性能优化
 * - 📱 自动设备检测和适配
 *
 * @example
 * ```typescript
 * const manager = new TemplateManager({
 *   templateRoot: 'src/templates',
 *   enableCache: true
 * })
 *
 * await manager.loadTemplate('login', 'desktop', 'modern')
 * ```
 *
 * @param config - 模板管理器配置
 */
export class TemplateManager {
  // ...
}
````

### 内联注释

使用中文注释，保持简洁明了：

```typescript
// ============ 性能优化系统 ============
// 使用 shallowRef 优化性能，避免深度响应式监听

/** 渲染开始时间戳 */
const renderStartTime = ref<number>(0)

/** 加载状态标识 */
const isLoading = ref(false)
```

## 🏷️ 命名规范

### 变量和函数

- 使用 camelCase
- 名称要有描述性
- 避免缩写和简写

```typescript
// ✅ 好的命名
const templateMetadata = getTemplateMetadata()
const isDeviceSupported = checkDeviceSupport()

// ❌ 避免的命名
const tmpl = getTmpl()
const isSupp = checkSupp()
```

### 类和接口

- 类使用 PascalCase
- 接口使用 PascalCase，可以加 I 前缀（可选）

```typescript
// ✅ 类命名
export class TemplateManager {}
export class DeviceDetector {}

// ✅ 接口命名
export interface TemplateConfig {}
export interface ITemplateLoader {} // 可选的 I 前缀
```

### 常量

- 使用 SCREAMING_SNAKE_CASE
- 分组相关常量

```typescript
// ✅ 常量命名
export const DEFAULT_CACHE_SIZE = 100
export const MAX_RETRY_COUNT = 3

export const DEVICE_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 992,
  DESKTOP: 1200,
} as const
```

## 📁 文件组织

### 导入顺序

1. Node.js 内置模块
2. 第三方库
3. 项目内部模块（按层级排序）
4. 类型导入

```typescript
// 4. 类型导入
import type { DeviceType, TemplateConfig } from '../types'
// 1. Node.js 内置模块
import { readFileSync } from 'node:fs'

import { resolve } from 'node:path'

// 2. 第三方库
import { defineComponent, ref } from 'vue'
// 3. 项目内部模块
import { TemplateManager } from '../core/TemplateManager'

import { detectDeviceType } from '../utils/device'
```

### 导出组织

使用分组注释组织导出：

```typescript
// ============ 设备检测 ============
export { detectDeviceType, getDeviceInfo } from './core/device'

// ============ 核心功能 ============
export { TemplateManager } from './core/TemplateManager'

// ============ 类型定义 ============
export type * from './types'
```

## 🎯 代码结构

### 函数结构

保持函数简洁，单一职责：

```typescript
/**
 * 检测设备类型
 *
 * @param config - 检测配置
 * @returns 设备类型
 */
export function detectDeviceType(config: DeviceConfig = {}): DeviceType {
  // 1. 参数验证
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // 2. 核心逻辑
  const viewport = getViewportSize()

  // 3. 返回结果
  return determineDeviceType(viewport, finalConfig)
}
```

### 类结构

按功能分组类成员：

```typescript
export class TemplateManager {
  // ============ 私有属性 ============
  private config: TemplateConfig
  private cache: Map<string, Template>

  // ============ 构造函数 ============
  constructor(config: TemplateConfig) {
    this.config = config
    this.cache = new Map()
  }

  // ============ 公共方法 ============
  async loadTemplate(id: string): Promise<Template> {
    // 实现
  }

  // ============ 私有方法 ============
  private validateConfig(config: TemplateConfig): void {
    // 实现
  }
}
```

## 🚀 性能最佳实践

### 响应式优化

```typescript
// ✅ 使用 shallowRef 优化性能
const performanceData = shallowRef({
  renderTime: 0,
  memoryUsage: 0,
})

// ✅ 使用 markRaw 避免不必要的响应式
const component = markRaw(defineAsyncComponent(() => import('./Component.vue')))
```

### 缓存策略

```typescript
// ✅ 实现智能缓存
const componentCache = new Map<string, Component>()

function getComponent(key: string) {
  if (componentCache.has(key)) {
    return componentCache.get(key)
  }

  const component = createComponent(key)
  componentCache.set(key, component)
  return component
}
```

## 🧪 测试规范

### 测试文件命名

- 单元测试：`*.test.ts`
- 集成测试：`*.spec.ts`
- E2E 测试：`*.e2e.ts`

### 测试结构

```typescript
describe('TemplateManager', () => {
  describe('loadTemplate', () => {
    it('should load template successfully', async () => {
      // Arrange
      const manager = new TemplateManager(config)

      // Act
      const result = await manager.loadTemplate('test')

      // Assert
      expect(result).toBeDefined()
    })
  })
})
```

## 📚 文档规范

### README 结构

1. 项目简介
2. 功能特性
3. 安装说明
4. 快速开始
5. API 文档
6. 示例代码
7. 贡献指南

### 代码示例

所有示例代码都要：

- 完整可运行
- 包含必要的导入
- 有清晰的注释
- 展示最佳实践

```typescript
// ✅ 完整的示例
import { TemplateManager } from '@ldesign/template'

// 创建模板管理器
const manager = new TemplateManager({
  templateRoot: 'src/templates',
  enableCache: true,
})

// 加载模板
const template = await manager.loadTemplate('login', 'desktop', 'modern')
```

## 🔧 工具配置

### ESLint 规则

项目使用 `@antfu/eslint-config` 作为基础配置，额外规则：

```javascript
{
  rules: {
    'no-console': 'warn',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
}
```

### Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false
}
```

## 📋 检查清单

提交代码前请确保：

- [ ] 所有公共 API 都有 JSDoc 注释
- [ ] 变量和函数命名清晰有意义
- [ ] 导入顺序正确
- [ ] 代码格式化正确
- [ ] 通过 ESLint 检查
- [ ] 通过 TypeScript 类型检查
- [ ] 包含必要的测试
- [ ] 更新相关文档

遵循这些规范将帮助我们维护高质量、一致的代码库。
