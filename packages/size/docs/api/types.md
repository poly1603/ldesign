# 类型定义文档

本文档详细介绍了 @ldesign/size 的 TypeScript 类型定义。

## 📚 导入方式

```typescript
import type {
  BorderRadiusConfig,
  ComponentSizeConfig,
  CSSInjectorOptions,
  CSSVariableConfig,
  // 配置类型
  FontSizeConfig,

  ShadowConfig,
  SizeChangeEvent,
  SizeConfig,
  SizeControlPanelProps,
  SizeIndicatorProps,
  SizeManager,

  SizeManagerOptions,
  // 基础类型
  SizeMode,
  SizeStorageOptions,
  SizeSwitcherProps,
  SpacingConfig,

  // Vue 相关类型
  UseSizeOptions,
  UseSizeReturn,
  // 插件类型
  VueSizePluginOptions,
} from '@ldesign/size'
```

## 🎯 基础类型

### SizeMode

尺寸模式枚举类型。

```typescript
type SizeMode = 'small' | 'medium' | 'large' | 'extra-large'
```

**说明：**
- `small` - 小尺寸，适合移动设备和紧凑布局
- `medium` - 中等尺寸，适合桌面端标准显示
- `large` - 大尺寸，适合大屏显示和老年友好界面
- `extra-large` - 超大尺寸，适合超大屏和演示模式

### SizeConfig

尺寸配置接口，定义了每个尺寸模式的完整配置。

```typescript
interface SizeConfig {
  /** 字体大小配置 */
  fontSize: FontSizeConfig
  /** 间距配置 */
  spacing: SpacingConfig
  /** 组件尺寸配置 */
  component: ComponentSizeConfig
  /** 边框圆角配置 */
  borderRadius: BorderRadiusConfig
  /** 阴影配置 */
  shadow: ShadowConfig
}
```

### SizeManager

尺寸管理器接口，定义了核心管理功能。

```typescript
interface SizeManager {
  /** 获取当前尺寸模式 */
  getCurrentMode: () => SizeMode

  /** 设置尺寸模式 */
  setMode: (mode: SizeMode) => Promise<void>

  /** 获取尺寸配置 */
  getConfig: (mode?: SizeMode) => SizeConfig

  /** 生成CSS变量 */
  generateCSSVariables: (mode?: SizeMode) => Record<string, string>

  /** 注入CSS变量 */
  injectCSS: (mode?: SizeMode) => void

  /** 移除CSS变量 */
  removeCSS: () => void

  /** 监听尺寸变化 */
  onSizeChange: (callback: (event: SizeChangeEvent) => void) => () => void

  /** 初始化管理器 */
  init: () => Promise<void>

  /** 销毁管理器 */
  destroy: () => void
}
```

### SizeManagerOptions

尺寸管理器配置选项。

```typescript
interface SizeManagerOptions {
  /** CSS变量前缀，默认 '--ls' */
  prefix?: string

  /** 默认尺寸模式，默认 'medium' */
  defaultMode?: SizeMode

  /** 样式标签ID，默认 'ldesign-size-variables' */
  styleId?: string

  /** 目标选择器，默认 ':root' */
  selector?: string

  /** 是否自动注入样式，默认 true */
  autoInject?: boolean

  /** 是否启用本地存储，默认 true */
  enableStorage?: boolean

  /** 存储类型，默认 'localStorage' */
  storageType?: 'localStorage' | 'sessionStorage' | 'memory'

  /** 是否启用动画过渡，默认 true */
  enableTransition?: boolean

  /** 过渡持续时间，默认 '0.3s' */
  transitionDuration?: string
}
```

### SizeChangeEvent

尺寸变化事件接口。

```typescript
interface SizeChangeEvent {
  /** 之前的尺寸模式 */
  previousMode: SizeMode

  /** 当前的尺寸模式 */
  currentMode: SizeMode

  /** 变化时间戳 */
  timestamp: number
}
```

## 🎨 配置类型

### FontSizeConfig

字体大小配置接口。

```typescript
interface FontSizeConfig {
  /** 超小字体 */
  xs: string
  /** 小字体 */
  sm: string
  /** 基础字体 */
  base: string
  /** 大字体 */
  lg: string
  /** 超大字体 */
  xl: string
  /** 特大字体 */
  xxl: string
  /** 标题字体 */
  h1: string
  h2: string
  h3: string
  h4: string
  h5: string
  h6: string
}
```

### SpacingConfig

间距配置接口。

```typescript
interface SpacingConfig {
  /** 超小间距 */
  xs: string
  /** 小间距 */
  sm: string
  /** 基础间距 */
  base: string
  /** 大间距 */
  lg: string
  /** 超大间距 */
  xl: string
  /** 特大间距 */
  xxl: string
}
```

### ComponentSizeConfig

组件尺寸配置接口。

```typescript
interface ComponentSizeConfig {
  /** 按钮高度 */
  buttonHeight: string
  /** 输入框高度 */
  inputHeight: string
  /** 图标尺寸 */
  iconSize: string
  /** 头像尺寸 */
  avatarSize: string
}
```

### BorderRadiusConfig

边框圆角配置接口。

```typescript
interface BorderRadiusConfig {
  /** 小圆角 */
  sm: string
  /** 基础圆角 */
  base: string
  /** 大圆角 */
  lg: string
  /** 圆形 */
  full: string
}
```

### ShadowConfig

阴影配置接口。

```typescript
interface ShadowConfig {
  /** 小阴影 */
  sm: string
  /** 基础阴影 */
  base: string
  /** 大阴影 */
  lg: string
  /** 超大阴影 */
  xl: string
}
```

### CSSVariableConfig

CSS变量配置接口。

```typescript
interface CSSVariableConfig {
  /** 变量名 */
  name: string
  /** 变量值 */
  value: string | number
  /** 单位（如果值是数字） */
  unit?: string
}
```

## 🧩 Vue 相关类型

### UseSizeOptions

useSize Hook 的选项接口。

```typescript
interface UseSizeOptions {
  /** 是否使用全局管理器，默认 true */
  global?: boolean
  /** 初始尺寸模式 */
  initialMode?: SizeMode
  /** 是否自动注入CSS，默认 true */
  autoInject?: boolean
}
```

### UseSizeReturn

useSize Hook 的返回值接口。

```typescript
interface UseSizeReturn {
  /** 当前尺寸模式 */
  currentMode: Ref<SizeMode>
  /** 当前配置 */
  currentConfig: ComputedRef<SizeConfig>
  /** 当前模式显示名称 */
  currentModeDisplayName: ComputedRef<string>
  /** 设置尺寸模式 */
  setMode: (mode: SizeMode) => Promise<void>
  /** 切换到下一个模式 */
  nextMode: () => Promise<void>
  /** 切换到上一个模式 */
  previousMode: () => Promise<void>
  /** 获取配置 */
  getConfig: (mode?: SizeMode) => SizeConfig
  /** 生成CSS变量 */
  generateCSSVariables: (mode?: SizeMode) => Record<string, string>
  /** 注入CSS */
  injectCSS: (mode?: SizeMode) => void
  /** 移除CSS */
  removeCSS: () => void
  /** 尺寸管理器实例 */
  sizeManager: SizeManager
}
```

### VueSizePluginOptions

Vue 插件选项接口。

```typescript
interface VueSizePluginOptions extends SizeManagerOptions {
  /** 是否全局注册组件，默认 true */
  registerComponents?: boolean
  /** 组件名称前缀，默认 'Size' */
  componentPrefix?: string
}
```

## 🔧 工具类型

### SizeStorageOptions

存储管理器选项接口。

```typescript
interface SizeStorageOptions {
  /** 是否启用存储，默认 true */
  enabled?: boolean
  /** 存储类型，默认 'localStorage' */
  type?: 'localStorage' | 'sessionStorage' | 'memory'
  /** 存储键名，默认 'ldesign-size-mode' */
  key?: string
}
```

### CSSInjectorOptions

CSS注入器选项接口。

```typescript
interface CSSInjectorOptions {
  /** 样式标签ID */
  styleId?: string
  /** 目标选择器 */
  selector?: string
  /** 是否启用过渡动画 */
  enableTransition?: boolean
  /** 过渡持续时间 */
  transitionDuration?: string
}
```

## 🎯 类型守卫

### 类型检查函数

```typescript
/** 检查是否为有效的尺寸模式 */
function isValidSizeMode(mode: string): mode is SizeMode

/** 检查是否为有效的输入 */
function isValidInput(input: unknown): boolean

/** 检查是否为尺寸配置对象 */
function isSizeConfig(config: unknown): config is SizeConfig
```

## 🔗 相关链接

- [核心 API 文档](./core.md)
- [Vue API 文档](./vue.md)
- [使用指南](../getting-started/basic-usage.md)
- [最佳实践](../best-practices/typescript-usage.md)
