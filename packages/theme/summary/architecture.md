# LDesign Theme 架构设计

## 整体架构

LDesign Theme 采用分层架构设计，确保代码的可维护性、可扩展性和性能。

### 架构层次

```
┌─────────────────────────────────────┐
│           应用层 (Application)        │
│  Vue 组件、指令、组合式函数            │
├─────────────────────────────────────┤
│           适配层 (Adapter)           │
│  Vue 插件、React 适配器（计划中）      │
├─────────────────────────────────────┤
│           业务层 (Business)          │
│  主题管理、装饰管理、动画管理          │
├─────────────────────────────────────┤
│           核心层 (Core)              │
│  事件系统、类型定义、工具函数          │
├─────────────────────────────────────┤
│           基础层 (Foundation)        │
│  DOM 操作、动画引擎、资源管理          │
└─────────────────────────────────────┘
```

## 核心模块设计

### 1. 主题管理器 (ThemeManager)

主题管理器是整个系统的核心，负责主题的生命周期管理。

```typescript
class ThemeManager {
  private themes: Map<string, ThemeConfig>
  private currentTheme?: string
  private decorationManager: DecorationManager
  private animationManager: AnimationManager
  private eventEmitter: EventEmitter

  // 主题操作
  async setTheme(name: string): Promise<void>
  getTheme(name: string): ThemeConfig | undefined
  getCurrentTheme(): string | undefined
  getAvailableThemes(): string[]

  // 主题管理
  addTheme(theme: ThemeConfig): void
  removeTheme(name: string): void

  // 资源管理
  async preloadResources(theme: string): Promise<void>
  clearResources(theme?: string): void

  // 事件系统
  on(event: string, listener: Function): void
  off(event: string, listener: Function): void
  emit(event: string, data: any): void
}
```

#### 设计原则

- **单一职责**: 专注于主题的管理和切换
- **依赖注入**: 通过构造函数注入依赖的管理器
- **事件驱动**: 通过事件系统通知状态变化
- **异步操作**: 支持异步的主题加载和切换

### 2. 装饰管理器 (DecorationManager)

装饰管理器负责装饰元素的创建、管理和销毁。

```typescript
class DecorationManager {
  private decorations: Map<string, BaseDecoration>
  private container: HTMLElement
  private factory: DecorationFactory

  // 装饰操作
  addDecoration(config: DecorationConfig): BaseDecoration
  removeDecoration(id: string): void
  updateDecoration(id: string, updates: Partial<DecorationConfig>): void

  // 批量操作
  addMultiple(configs: DecorationConfig[]): BaseDecoration[]
  removeMultiple(ids: string[]): void
  clearAll(): void

  // 查询操作
  getDecoration(id: string): BaseDecoration | undefined
  getDecorations(): DecorationConfig[]
  getVisibleDecorations(): BaseDecoration[]
}
```

#### 工厂模式

装饰管理器使用工厂模式创建不同类型的装饰元素：

```typescript
class DecorationFactory {
  private static registry = new Map<string, DecorationConstructor>()

  static register(type: string, constructor: DecorationConstructor): void
  static create(config: DecorationConfig, container: HTMLElement): BaseDecoration
  static createMultiple(configs: DecorationConfig[], container: HTMLElement): BaseDecoration[]
}
```

### 3. 动画管理器 (AnimationManager)

动画管理器负责动画的创建、控制和性能优化。

```typescript
class AnimationManager {
  private animations: Map<string, BaseAnimation>
  private factory: AnimationFactory
  private performanceMonitor: PerformanceMonitor

  // 动画控制
  startAnimation(name: string, elements?: HTMLElement[]): void
  stopAnimation(name: string): void
  pauseAnimation(name: string): void
  resumeAnimation(name: string): void

  // 批量控制
  startMultiple(names: string[]): void
  stopAll(): void
  pauseAll(): void
  resumeAll(): void

  // 性能监控
  getPerformanceMetrics(): PerformanceMetrics
  enablePerformanceMonitoring(): void
  disablePerformanceMonitoring(): void
}
```

## 装饰系统架构

### 装饰元素继承体系

```typescript
abstract class BaseDecoration {
  protected config: DecorationConfig
  protected element: HTMLElement
  protected container: HTMLElement
  protected isShown: boolean = false

  // 生命周期
  abstract updateContent(): Promise<void>
  show(): void
  hide(): void
  destroy(): void

  // 配置管理
  updateConfig(updates: Partial<DecorationConfig>): void
  getConfig(): DecorationConfig

  // 交互处理
  protected setupInteractivity(): void
  protected onInteract(type: string, event: Event): void
}

// 具体装饰类
class SnowflakeDecoration extends BaseDecoration {
  protected async updateContent(): Promise<void> {
    // 雪花特定的内容更新逻辑
  }
}

class LanternDecoration extends BaseDecoration {
  protected async updateContent(): Promise<void> {
    // 灯笼特定的内容更新逻辑
  }
}

class FireworkDecoration extends BaseDecoration {
  protected async updateContent(): Promise<void> {
    // 烟花特定的内容更新逻辑
  }
}
```

### 装饰定位系统

```typescript
interface DecorationPosition {
  type: 'fixed' | 'absolute' | 'relative'
  position: { x: string | number; y: string | number }
  anchor:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  offset?: { x: string | number; y: string | number }
}

class PositionCalculator {
  static calculate(
    position: DecorationPosition,
    container: HTMLElement,
    element: HTMLElement
  ): { x: number; y: number } {
    // 位置计算逻辑
  }
}
```

## 动画系统架构

### 动画类型体系

```typescript
abstract class BaseAnimation {
  protected config: AnimationConfig
  protected elements: HTMLElement[]
  protected animation?: Animation
  protected isRunning: boolean = false

  // 动画控制
  abstract createAnimation(): void
  start(): void
  stop(): void
  pause(): void
  resume(): void

  // 配置管理
  updateConfig(updates: Partial<AnimationConfig>): void
  getConfig(): AnimationConfig
}

// 具体动画类
class FallingAnimation extends BaseAnimation {
  protected createAnimation(): void {
    // 下落动画实现
  }
}

class FloatingAnimation extends BaseAnimation {
  protected createAnimation(): void {
    // 漂浮动画实现
  }
}

class SparklingAnimation extends BaseAnimation {
  protected createAnimation(): void {
    // 闪烁动画实现
  }
}
```

### 动画性能优化

```typescript
class PerformanceOptimizer {
  // GPU 加速
  static enableGPUAcceleration(element: HTMLElement): void {
    element.style.transform = element.style.transform || 'translateZ(0)'
    element.style.willChange = 'transform, opacity'
  }

  // 批量更新
  static batchUpdate(updates: Array<() => void>): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  }

  // 性能监控
  static monitorPerformance(): PerformanceMetrics {
    return {
      fps: this.calculateFPS(),
      memoryUsage: this.getMemoryUsage(),
      animationCount: this.getActiveAnimationCount(),
    }
  }
}
```

## Vue 集成架构

### 插件系统

```typescript
const VueThemePlugin = {
  install(app: App, options: VueThemePluginOptions) {
    // 创建全局主题管理器
    const themeManager = createThemeManager(options)

    // 注册组件
    app.component('ThemeProvider', ThemeProvider)
    app.component('ThemeButton', ThemeButton)
    app.component('ThemeSelector', ThemeSelector)

    // 注册指令
    app.directive('theme-decoration', vThemeDecoration)
    app.directive('theme-animation', vThemeAnimation)

    // 提供全局实例
    app.provide('themeManager', themeManager)
    app.config.globalProperties.$theme = themeManager
  },
}
```

### 组合式函数架构

```typescript
// 主题管理
export function useTheme(): UseThemeReturn {
  const themeContext = inject(VueThemeContextKey)
  // 实现逻辑
}

// 装饰管理
export function useThemeDecorations(): UseThemeDecorationsReturn {
  const themeContext = inject(VueThemeContextKey)
  // 实现逻辑
}

// 动画管理
export function useThemeAnimations(): UseThemeAnimationsReturn {
  const themeContext = inject(VueThemeContextKey)
  // 实现逻辑
}
```

### 指令系统

```typescript
const vThemeDecoration: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // 创建装饰
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // 更新装饰
  },
  unmounted(el: HTMLElement) {
    // 清理装饰
  },
}

const vThemeAnimation: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // 创建动画
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // 更新动画
  },
  unmounted(el: HTMLElement) {
    // 清理动画
  },
}
```

## 事件系统架构

### 事件总线

```typescript
class EventEmitter {
  private listeners: Map<string, Function[]> = new Map()

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener({
            type: event,
            timestamp: Date.now(),
            ...data,
          })
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }
}
```

### 事件类型

```typescript
interface ThemeEvent {
  type: string
  timestamp: number
}

interface ThemeChangedEvent extends ThemeEvent {
  type: 'theme-changed'
  theme: string
  previousTheme?: string
}

interface DecorationEvent extends ThemeEvent {
  type: 'decoration-added' | 'decoration-removed' | 'decoration-updated'
  decoration?: DecorationConfig
  decorationId?: string
}

interface AnimationEvent extends ThemeEvent {
  type: 'animation-started' | 'animation-stopped' | 'animation-completed'
  animation: string
  elements?: HTMLElement[]
}
```

## 资源管理架构

### 资源加载器

```typescript
class ResourceLoader {
  private cache: Map<string, any> = new Map()
  private loading: Map<string, Promise<any>> = new Map()

  async loadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }

    if (this.loading.has(url)) {
      return this.loading.get(url)
    }

    const promise = this.doLoadImage(url)
    this.loading.set(url, promise)

    try {
      const image = await promise
      this.cache.set(url, image)
      return image
    } finally {
      this.loading.delete(url)
    }
  }

  async loadSVG(url: string): Promise<string> {
    // SVG 加载逻辑
  }

  async loadJSON(url: string): Promise<any> {
    // JSON 加载逻辑
  }

  preload(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map(url => this.loadImage(url)))
  }

  clearCache(): void {
    this.cache.clear()
  }
}
```

### 缓存策略

```typescript
interface CacheConfig {
  maxSize: number
  ttl: number // Time to live in milliseconds
  strategy: 'lru' | 'fifo' | 'lfu'
}

class ResourceCache {
  private cache: Map<string, CacheItem> = new Map()
  private config: CacheConfig

  set(key: string, value: any): void {
    // 缓存设置逻辑
  }

  get(key: string): any | undefined {
    // 缓存获取逻辑
  }

  has(key: string): boolean {
    // 缓存检查逻辑
  }

  delete(key: string): void {
    // 缓存删除逻辑
  }

  clear(): void {
    this.cache.clear()
  }

  private evict(): void {
    // 缓存淘汰逻辑
  }
}
```

## 性能优化架构

### 虚拟化渲染

```typescript
class VirtualRenderer {
  private viewport: { width: number; height: number }
  private visibleItems: Set<string> = new Set()

  updateViewport(): void {
    // 更新视口信息
  }

  getVisibleDecorations(decorations: BaseDecoration[]): BaseDecoration[] {
    return decorations.filter(decoration => {
      return this.isInViewport(decoration.getBounds())
    })
  }

  private isInViewport(bounds: DOMRect): boolean {
    // 视口检测逻辑
  }
}
```

### 批量更新

```typescript
class BatchUpdater {
  private pendingUpdates: Array<() => void> = []
  private isScheduled: boolean = false

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
    const updates = this.pendingUpdates.splice(0)
    updates.forEach(update => update())
    this.isScheduled = false
  }
}
```

## 扩展性设计

### 插件接口

```typescript
interface ThemePlugin {
  name: string
  version: string
  install(themeManager: ThemeManager): void
  uninstall?(): void
}

class PluginManager {
  private plugins: Map<string, ThemePlugin> = new Map()

  register(plugin: ThemePlugin): void {
    this.plugins.set(plugin.name, plugin)
    plugin.install(this.themeManager)
  }

  unregister(name: string): void {
    const plugin = this.plugins.get(name)
    if (plugin && plugin.uninstall) {
      plugin.uninstall()
    }
    this.plugins.delete(name)
  }
}
```

### 自定义装饰注册

```typescript
interface DecorationConstructor {
  new (config: DecorationConfig, container: HTMLElement): BaseDecoration
}

class DecorationRegistry {
  private static types: Map<string, DecorationConstructor> = new Map()

  static register(type: string, constructor: DecorationConstructor): void {
    this.types.set(type, constructor)
  }

  static create(type: string, config: DecorationConfig, container: HTMLElement): BaseDecoration {
    const Constructor = this.types.get(type)
    if (!Constructor) {
      throw new Error(`Unknown decoration type: ${type}`)
    }
    return new Constructor(config, container)
  }
}
```

## 总结

LDesign Theme 的架构设计遵循以下原则：

1. **分层架构**: 清晰的层次划分，职责明确
2. **模块化设计**: 高内聚、低耦合的模块设计
3. **设计模式**: 合理运用工厂、观察者、单例等设计模式
4. **性能优化**: 多层次的性能优化策略
5. **扩展性**: 良好的插件系统和扩展接口
6. **类型安全**: 完整的 TypeScript 类型定义

这种架构设计确保了系统的可维护性、可扩展性和高性能，为用户提供了优秀的开发体验。
