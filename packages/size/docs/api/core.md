# 核心 API 文档

本文档详细介绍了 @ldesign/size 的核心 API。

## 📚 导入方式

```typescript
import {
  // 管理器
  createSizeManager,
  CSSInjector,

  // CSS相关
  CSSVariableGenerator,
  getAvailableModes,
  getNextSizeMode,

  getPreviousSizeMode,
  // 预设配置
  getSizeConfig,

  globalSizeManager,
  // 工具函数
  isValidSizeMode,
  type SizeConfig,

  sizeConfigs,
  type SizeManager,
  // 类型
  type SizeMode,
} from '@ldesign/size'
```

## 🎯 核心接口

### SizeManager

尺寸管理器是核心接口，提供了所有尺寸管理功能。

```typescript
interface SizeManager {
  // 基础操作
  getCurrentMode: () => SizeMode
  setMode: (mode: SizeMode) => void
  getConfig: (mode?: SizeMode) => SizeConfig

  // CSS操作
  generateCSSVariables: (mode?: SizeMode) => Record<string, string>
  injectCSS: (mode?: SizeMode) => void
  removeCSS: () => void

  // 事件监听
  onSizeChange: (callback: (event: SizeChangeEvent) => void) => () => void

  // 生命周期
  destroy: () => void
}
```

## 🏭 工厂函数

### createSizeManager

创建一个新的尺寸管理器实例。

```typescript
function createSizeManager(options?: SizeManagerOptions): SizeManager

interface SizeManagerOptions {
  prefix?: string // CSS变量前缀，默认 '--ls'
  defaultMode?: SizeMode // 默认尺寸模式，默认 'medium'
  styleId?: string // 样式标签ID，默认 'ldesign-size-variables'
  selector?: string // CSS选择器，默认 ':root'
  autoInject?: boolean // 是否自动注入CSS，默认 true
}
```

**示例：**

```typescript
// 使用默认配置
const manager = createSizeManager()

// 自定义配置
const customManager = createSizeManager({
  prefix: '--my-app',
  defaultMode: 'large',
  styleId: 'my-size-vars',
  selector: '.app-container',
  autoInject: false,
})
```

### globalSizeManager

全局单例尺寸管理器，开箱即用。

```typescript
const globalSizeManager: SizeManager
```

**示例：**

```typescript
import { globalSizeManager } from '@ldesign/size'

// 直接使用
globalSizeManager.setMode('large')
console.log(globalSizeManager.getCurrentMode()) // 'large'
```

## 📐 尺寸模式

### SizeMode

支持的尺寸模式类型。

```typescript
type SizeMode = 'small' | 'medium' | 'large' | 'extra-large'
```

### 模式特性

| 模式          | 基础字体 | 基础间距 | 按钮高度 | 适用场景           |
| ------------- | -------- | -------- | -------- | ------------------ |
| `small`       | 12px     | 8px      | 28px     | 移动端、紧凑布局   |
| `medium`      | 16px     | 16px     | 36px     | 桌面端标准         |
| `large`       | 18px     | 20px     | 44px     | 大屏显示、老年友好 |
| `extra-large` | 20px     | 24px     | 52px     | 超大屏、演示模式   |

## ⚙️ 配置管理

### getSizeConfig

获取指定模式的尺寸配置。

```typescript
function getSizeConfig(mode: SizeMode): SizeConfig
```

**示例：**

```typescript
const config = getSizeConfig('large')
console.log(config.fontSize.base) // '18px'
console.log(config.spacing.base) // '20px'
```

### getAvailableModes

获取所有可用的尺寸模式。

```typescript
function getAvailableModes(): SizeMode[]
```

**示例：**

```typescript
const modes = getAvailableModes()
console.log(modes) // ['small', 'medium', 'large', 'extra-large']
```

### sizeConfigs

所有尺寸配置的映射对象。

```typescript
const sizeConfigs: Record<SizeMode, SizeConfig>
```

## 🎨 CSS 变量生成

### CSSVariableGenerator

CSS 变量生成器类。

```typescript
class CSSVariableGenerator {
  constructor(prefix?: string)

  generateVariables(config: SizeConfig): Record<string, string>
  generateCSSString(variables: Record<string, string>, selector?: string): string
  updatePrefix(prefix: string): void
  getPrefix(): string
}
```

**示例：**

```typescript
const generator = new CSSVariableGenerator('--my-app')
const config = getSizeConfig('medium')
const variables = generator.generateVariables(config)

console.log(variables)
// {
//   '--my-app-font-size-base': '16px',
//   '--my-app-spacing-base': '16px',
//   ...
// }
```

### CSSInjector

CSS 注入器类。

```typescript
class CSSInjector {
  constructor(options?: CSSInjectionOptions)

  injectVariables(variables: Record<string, string>): void
  injectCSS(cssString: string): void
  removeCSS(): void
  updateVariables(variables: Record<string, string>): void
  isInjected(): boolean
  destroy(): void
}
```

## 🔧 工具函数

### 模式验证和转换

```typescript
// 验证是否为有效的尺寸模式
function isValidSizeMode(mode: string): mode is SizeMode

// 获取下一个尺寸模式
function getNextSizeMode(currentMode: SizeMode): SizeMode

// 获取上一个尺寸模式
function getPreviousSizeMode(currentMode: SizeMode): SizeMode

// 比较两个尺寸模式的大小
function compareSizeModes(mode1: SizeMode, mode2: SizeMode): number

// 获取尺寸模式的显示名称
function getSizeModeDisplayName(mode: SizeMode): string

// 从字符串解析尺寸模式
function parseSizeMode(value: string): SizeMode | null
```

**示例：**

```typescript
// 模式验证
console.log(isValidSizeMode('large')) // true
console.log(isValidSizeMode('invalid')) // false

// 模式切换
console.log(getNextSizeMode('medium')) // 'large'
console.log(getPreviousSizeMode('large')) // 'medium'

// 模式比较
console.log(compareSizeModes('small', 'large')) // -2

// 显示名称
console.log(getSizeModeDisplayName('large')) // '大'

// 模式解析
console.log(parseSizeMode('l')) // 'large'
console.log(parseSizeMode('大')) // 'large'
```

### CSS 工具函数

```typescript
// 格式化CSS值
function formatCSSValue(value: string | number, unit?: string): string

// 解析CSS值
function parseCSSValue(value: string): { number: number, unit: string }

// 计算尺寸缩放比例
function calculateSizeScale(fromMode: SizeMode, toMode: SizeMode): number
```

**示例：**

```typescript
// 值格式化
console.log(formatCSSValue(16)) // '16px'
console.log(formatCSSValue(1.5, 'rem')) // '1.5rem'

// 值解析
console.log(parseCSSValue('16px')) // { number: 16, unit: 'px' }
console.log(parseCSSValue('1.5rem')) // { number: 1.5, unit: 'rem' }

// 缩放计算
console.log(calculateSizeScale('small', 'large')) // 1.5
```

## 📡 事件系统

### SizeChangeEvent

尺寸变化事件对象。

```typescript
interface SizeChangeEvent {
  previousMode: SizeMode // 之前的尺寸模式
  currentMode: SizeMode // 当前的尺寸模式
  timestamp: number // 变化时间戳
}
```

### 事件监听

```typescript
const unsubscribe = manager.onSizeChange((event) => {
  console.log(`尺寸从 ${event.previousMode} 变为 ${event.currentMode}`)
})

// 取消监听
unsubscribe()
```

## 🔄 生命周期

### 初始化

```typescript
const manager = createSizeManager({
  defaultMode: 'medium',
  autoInject: true,
})
```

### 使用

```typescript
// 设置模式
manager.setMode('large')

// 获取配置
const config = manager.getConfig()

// 生成CSS变量
const variables = manager.generateCSSVariables()

// 监听变化
const unsubscribe = manager.onSizeChange(handleSizeChange)
```

### 清理

```typescript
// 移除CSS
manager.removeCSS()

// 销毁管理器
manager.destroy()
```

## 💡 最佳实践

1. **使用全局管理器**：对于大多数应用，使用 `globalSizeManager` 即可
2. **监听变化**：使用 `onSizeChange` 监听尺寸变化，及时更新 UI
3. **合理使用 CSS 变量**：在 CSS 中使用生成的变量，而不是硬编码值
4. **及时清理**：在组件卸载时取消事件监听，避免内存泄漏

## 🔗 相关文档

- [Vue API 文档](./vue.md)
- [工具函数文档](./utils.md)
- [类型定义文档](./types.md)
