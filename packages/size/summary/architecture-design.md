# @ldesign/size 架构设计

## 🏗️ 整体架构

### 架构概览

@ldesign/size 采用分层架构设计，从底层的工具函数到顶层的框架集成，每一层都有明确的职责和边界。

```
┌─────────────────────────────────────────────────────────┐
│                    Framework Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Vue      │  │   React     │  │  Angular    │     │
│  │  Plugin     │  │   Hooks     │  │  Services   │     │
│  │ Components  │  │ Components  │  │ Directives  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                     Core Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Size     │  │    CSS      │  │    CSS      │     │
│  │  Manager    │  │ Generator   │  │  Injector   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                   Foundation Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Presets   │  │    Utils    │  │    Types    │     │
│  │  Configs    │  │ Functions   │  │ Definitions │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 架构特点

1. **分层清晰**：每层职责明确，依赖关系单向
2. **松耦合**：模块间通过接口通信，降低耦合度
3. **高内聚**：相关功能聚合在同一模块内
4. **可扩展**：支持插件和自定义扩展
5. **可测试**：每层都可以独立测试

## 🔧 核心模块设计

### 1. Size Manager (尺寸管理器)

**职责**：

- 管理当前尺寸模式状态
- 协调各个子模块的工作
- 提供统一的对外接口
- 处理事件的发布和订阅

**设计模式**：

- **单例模式**：全局管理器实例
- **观察者模式**：事件监听和通知
- **策略模式**：不同尺寸模式的处理策略
- **外观模式**：简化复杂子系统的接口

**核心接口**：

```typescript
interface SizeManager {
  // 状态管理
  getCurrentMode(): SizeMode
  setMode(mode: SizeMode): void
  getConfig(mode?: SizeMode): SizeConfig

  // CSS操作
  generateCSSVariables(mode?: SizeMode): Record<string, string>
  injectCSS(mode?: SizeMode): void
  removeCSS(): void

  // 事件系统
  onSizeChange(callback: SizeChangeCallback): UnsubscribeFunction

  // 生命周期
  destroy(): void
}
```

**状态管理**：

```typescript
class SizeManagerImpl implements SizeManager {
  private currentMode: SizeMode = 'medium'
  private listeners: SizeChangeCallback[] = []
  private cssGenerator: CSSVariableGenerator
  private cssInjector: CSSInjector

  // 状态变更时的处理流程
  setMode(mode: SizeMode): void {
    const previousMode = this.currentMode
    this.currentMode = mode

    // 1. 更新CSS
    if (this.options.autoInject) {
      this.injectCSS(mode)
    }

    // 2. 触发事件
    this.emitSizeChange({
      previousMode,
      currentMode: mode,
      timestamp: Date.now(),
    })
  }
}
```

### 2. CSS Variable Generator (CSS 变量生成器)

**职责**：

- 根据尺寸配置生成 CSS 变量
- 管理 CSS 变量的命名规范
- 提供 CSS 字符串的格式化

**设计模式**：

- **建造者模式**：逐步构建 CSS 变量集合
- **模板方法模式**：定义生成流程的骨架

**核心算法**：

```typescript
class CSSVariableGenerator {
  generateVariables(config: SizeConfig): Record<string, string> {
    const variables: Record<string, string> = {}

    // 1. 生成字体变量
    this.generateFontVariables(config.fontSize, variables)

    // 2. 生成间距变量
    this.generateSpacingVariables(config.spacing, variables)

    // 3. 生成组件变量
    this.generateComponentVariables(config.component, variables)

    // 4. 生成其他变量
    this.generateBorderRadiusVariables(config.borderRadius, variables)
    this.generateShadowVariables(config.shadow, variables)

    return variables
  }
}
```

**变量命名规范**：

```
前缀-类别-尺寸-变体
--ls-font-size-base
--ls-spacing-lg
--ls-button-height-medium
--ls-border-radius-sm
```

### 3. CSS Injector (CSS 注入器)

**职责**：

- 将 CSS 变量注入到 DOM 中
- 管理样式标签的生命周期
- 处理样式的更新和移除

**设计模式**：

- **单例模式**：确保样式标签的唯一性
- **命令模式**：封装 CSS 操作命令

**注入策略**：

```typescript
class CSSInjector {
  injectVariables(variables: Record<string, string>): void {
    // 1. 检查环境
    if (typeof document === 'undefined') {
      console.warn('CSS injection is only available in browser environment')
      return
    }

    // 2. 移除旧样式
    this.removeCSS()

    // 3. 创建新样式
    const styleElement = document.createElement('style')
    styleElement.id = this.options.styleId
    styleElement.textContent = this.generateCSSString(variables)

    // 4. 插入到DOM
    document.head.appendChild(styleElement)

    this.styleElement = styleElement
  }
}
```

## 🎨 Vue 集成架构

### 1. Plugin (插件)

**设计目标**：

- 提供全局的尺寸管理能力
- 集成到 Vue 的生命周期中
- 提供全局属性和方法

**实现架构**：

```typescript
const VueSizePlugin: Plugin = {
  install(app: App, options: VueSizePluginOptions = {}) {
    // 1. 创建管理器实例
    const sizeManager = createSizeManager(options)

    // 2. 提供给子组件
    app.provide(VueSizeSymbol, sizeManager)

    // 3. 添加全局属性
    app.config.globalProperties.$size = sizeManager

    // 4. 生命周期管理
    const originalUnmount = app.unmount
    app.unmount = function (...args) {
      sizeManager.destroy()
      return originalUnmount.apply(this, args)
    }
  },
}
```

### 2. Composables (组合式 API)

**设计目标**：

- 提供响应式的尺寸状态
- 封装常用的尺寸操作
- 支持组件级的尺寸管理

**核心 Hook 设计**：

```typescript
function useSize(options: UseSizeOptions = {}): UseSizeReturn {
  // 1. 获取管理器实例
  const sizeManager = getSizeManager(options)

  // 2. 创建响应式状态
  const currentMode = ref<SizeMode>(sizeManager.getCurrentMode())
  const currentConfig = ref<SizeConfig>(sizeManager.getConfig())

  // 3. 监听变化
  const unsubscribe = sizeManager.onSizeChange(event => {
    currentMode.value = event.currentMode
    currentConfig.value = sizeManager.getConfig(event.currentMode)
  })

  // 4. 生命周期管理
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    currentMode,
    currentConfig,
    setMode: sizeManager.setMode.bind(sizeManager),
    // ... 其他方法
  }
}
```

### 3. Components (组件)

**设计目标**：

- 提供开箱即用的 UI 组件
- 支持多种样式和交互模式
- 与尺寸系统深度集成

**组件架构**：

```typescript
export const SizeSwitcher = defineComponent({
  name: 'SizeSwitcher',
  props: {
    mode: String as PropType<SizeMode>,
    switcherStyle: String as PropType<'button' | 'select' | 'radio'>,
    // ... 其他属性
  },
  setup(props, { emit }) {
    const { currentMode, setMode, availableModes } = useSizeSwitcher()

    // 渲染逻辑
    return () => {
      switch (props.switcherStyle) {
        case 'select':
          return renderSelectSwitcher()
        case 'radio':
          return renderRadioSwitcher()
        default:
          return renderButtonSwitcher()
      }
    }
  },
})
```

## 📊 数据流设计

### 1. 单向数据流

```
用户交互 → 事件触发 → 状态更新 → 视图重渲染
    ↓           ↓           ↓           ↓
  点击按钮    setMode()   currentMode   UI更新
```

### 2. 状态同步机制

```typescript
// 状态变更流程
class SizeManagerImpl {
  setMode(mode: SizeMode): void {
    // 1. 验证输入
    if (!isValidSizeMode(mode)) return

    // 2. 检查变化
    if (mode === this.currentMode) return

    // 3. 更新状态
    const previousMode = this.currentMode
    this.currentMode = mode

    // 4. 同步CSS
    if (this.options.autoInject) {
      this.injectCSS(mode)
    }

    // 5. 通知监听器
    this.emitSizeChange({
      previousMode,
      currentMode: mode,
      timestamp: Date.now(),
    })
  }
}
```

### 3. 事件系统设计

**事件类型**：

```typescript
interface SizeChangeEvent {
  previousMode: SizeMode
  currentMode: SizeMode
  timestamp: number
}

type SizeChangeCallback = (event: SizeChangeEvent) => void
```

**事件管理**：

```typescript
class EventManager {
  private listeners: SizeChangeCallback[] = []

  subscribe(callback: SizeChangeCallback): UnsubscribeFunction {
    this.listeners.push(callback)

    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  emit(event: SizeChangeEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in size change callback:', error)
      }
    })
  }
}
```

## 🔧 扩展性设计

### 1. 插件系统

```typescript
interface SizePlugin {
  name: string
  version?: string
  install(manager: SizeManager, options?: any): void
  uninstall?(manager: SizeManager): void
}

class PluginManager {
  private plugins: Map<string, SizePlugin> = new Map()

  use(plugin: SizePlugin, options?: any): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already installed`)
      return
    }

    plugin.install(this.sizeManager, options)
    this.plugins.set(plugin.name, plugin)
  }
}
```

### 2. 配置扩展

```typescript
interface ExtendedSizeConfig extends SizeConfig {
  // 允许用户扩展配置
  [key: string]: any
}

// 配置合并策略
function mergeConfig(base: SizeConfig, extension: Partial<ExtendedSizeConfig>): ExtendedSizeConfig {
  return deepMerge(base, extension)
}
```

### 3. 主题系统

```typescript
interface SizeTheme {
  name: string
  configs: Record<SizeMode, SizeConfig>
  cssVariables?: Record<string, string>
}

class ThemeManager {
  private themes: Map<string, SizeTheme> = new Map()
  private currentTheme: string = 'default'

  registerTheme(theme: SizeTheme): void {
    this.themes.set(theme.name, theme)
  }

  switchTheme(themeName: string): void {
    const theme = this.themes.get(themeName)
    if (!theme) return

    this.currentTheme = themeName
    // 更新配置和CSS变量
  }
}
```

## 🚀 性能优化设计

### 1. 懒加载策略

```typescript
// 框架特定功能按需加载
const loadVueSupport = () => import('./vue')
const loadReactSupport = () => import('./react')

// 配置按需生成
const configCache = new Map<SizeMode, SizeConfig>()

function getConfig(mode: SizeMode): SizeConfig {
  if (!configCache.has(mode)) {
    configCache.set(mode, generateConfig(mode))
  }
  return configCache.get(mode)!
}
```

### 2. 缓存机制

```typescript
class CacheManager {
  private cssCache = new Map<string, string>()
  private configCache = new Map<SizeMode, SizeConfig>()

  getCachedCSS(key: string): string | undefined {
    return this.cssCache.get(key)
  }

  setCachedCSS(key: string, css: string): void {
    this.cssCache.set(key, css)
  }
}
```

### 3. 批量更新

```typescript
class BatchUpdater {
  private pendingUpdates: (() => void)[] = []
  private isScheduled = false

  schedule(update: () => void): void {
    this.pendingUpdates.push(update)

    if (!this.isScheduled) {
      this.isScheduled = true
      requestAnimationFrame(() => {
        this.flush()
      })
    }
  }

  private flush(): void {
    this.pendingUpdates.forEach(update => update())
    this.pendingUpdates.length = 0
    this.isScheduled = false
  }
}
```

## 🔍 错误处理设计

### 1. 错误分类

```typescript
enum ErrorType {
  INVALID_MODE = 'INVALID_MODE',
  INJECTION_FAILED = 'INJECTION_FAILED',
  CONFIG_ERROR = 'CONFIG_ERROR',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
}

class SizeError extends Error {
  constructor(public type: ErrorType, message: string, public context?: any) {
    super(message)
    this.name = 'SizeError'
  }
}
```

### 2. 错误恢复策略

```typescript
class ErrorHandler {
  handle(error: SizeError): void {
    switch (error.type) {
      case ErrorType.INVALID_MODE:
        // 使用默认模式
        this.fallbackToDefault()
        break

      case ErrorType.INJECTION_FAILED:
        // 重试注入
        this.retryInjection()
        break

      default:
        console.error('Unhandled size error:', error)
    }
  }
}
```

---

_这个架构设计确保了@ldesign/size 的可维护性、可扩展性和高性能，为项目的长期发展奠定了坚实的基础。_
