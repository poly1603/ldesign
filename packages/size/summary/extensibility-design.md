# @ldesign/size 扩展性设计

## 🔧 扩展性架构概述

@ldesign/size 采用高度模块化的架构设计，提供多个层次的扩展点，支持从简单的配置定制到复杂的功能扩展。

### 扩展层次结构

```
┌─────────────────────────────────────────────────────────┐
│                   Plugin Ecosystem                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Theme     │  │ Animation   │  │   Storage   │     │
│  │  Plugins    │  │  Plugins    │  │  Plugins    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                  Extension Points                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Config    │  │   Events    │  │   Hooks     │     │
│  │ Extensions  │  │ Extensions  │  │ Extensions  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                    Core System                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Size     │  │    CSS      │  │   Event     │     │
│  │  Manager    │  │ Generator   │  │  System     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 🎨 配置扩展系统

### 1. 自定义尺寸配置

**扩展现有配置**：

```typescript
import { createSizeManager, type SizeConfig } from '@ldesign/size'

// 扩展配置接口
interface ExtendedSizeConfig extends SizeConfig {
  // 添加自定义属性
  animation: {
    duration: string
    easing: string
  }
  layout: {
    containerWidth: string
    sidebarWidth: string
  }
}

// 自定义配置生成器
class CustomConfigGenerator {
  generateConfig(mode: SizeMode): ExtendedSizeConfig {
    const baseConfig = getSizeConfig(mode)

    return {
      ...baseConfig,
      animation: this.generateAnimationConfig(mode),
      layout: this.generateLayoutConfig(mode),
    }
  }

  private generateAnimationConfig(mode: SizeMode) {
    const durations = {
      small: '200ms',
      medium: '300ms',
      large: '400ms',
      'extra-large': '500ms',
    }

    return {
      duration: durations[mode],
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }

  private generateLayoutConfig(mode: SizeMode) {
    const layouts = {
      small: { containerWidth: '100%', sidebarWidth: '60px' },
      medium: { containerWidth: '1200px', sidebarWidth: '200px' },
      large: { containerWidth: '1400px', sidebarWidth: '250px' },
      'extra-large': { containerWidth: '1600px', sidebarWidth: '300px' },
    }

    return layouts[mode]
  }
}
```

### 2. 主题系统扩展

**主题定义接口**：

```typescript
interface SizeTheme {
  name: string
  displayName: string
  description?: string
  configs: Record<SizeMode, SizeConfig>
  cssVariables?: Record<string, string>
  metadata?: Record<string, any>
}

// 主题管理器
class ThemeManager {
  private themes = new Map<string, SizeTheme>()
  private currentTheme = 'default'
  private eventEmitter = new EventEmitter()

  // 注册主题
  registerTheme(theme: SizeTheme): void {
    this.validateTheme(theme)
    this.themes.set(theme.name, theme)
    this.eventEmitter.emit('themeRegistered', theme)
  }

  // 切换主题
  switchTheme(themeName: string): void {
    const theme = this.themes.get(themeName)
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`)
    }

    const previousTheme = this.currentTheme
    this.currentTheme = themeName

    // 更新配置
    this.updateConfigs(theme.configs)

    // 注入自定义CSS变量
    if (theme.cssVariables) {
      this.injectThemeVariables(theme.cssVariables)
    }

    this.eventEmitter.emit('themeChanged', {
      previousTheme,
      currentTheme: themeName,
      theme,
    })
  }

  // 创建主题
  createTheme(baseTheme: string, overrides: Partial<SizeTheme>): SizeTheme {
    const base = this.themes.get(baseTheme)
    if (!base) {
      throw new Error(`Base theme "${baseTheme}" not found`)
    }

    return {
      ...base,
      ...overrides,
      configs: {
        ...base.configs,
        ...overrides.configs,
      },
    }
  }
}

// 使用示例
const themeManager = new ThemeManager()

// 注册暗色主题
themeManager.registerTheme({
  name: 'dark',
  displayName: '暗色主题',
  configs: {
    small: { ...getSizeConfig('small') /* 暗色配置 */ },
    medium: { ...getSizeConfig('medium') /* 暗色配置 */ },
    large: { ...getSizeConfig('large') /* 暗色配置 */ },
    'extra-large': { ...getSizeConfig('extra-large') /* 暗色配置 */ },
  },
  cssVariables: {
    '--ls-bg-primary': '#1a1a1a',
    '--ls-bg-secondary': '#2a2a2a',
    '--ls-text-primary': '#ffffff',
    '--ls-text-secondary': '#cccccc',
  },
})
```

## 🔌 插件系统

### 1. 插件接口定义

```typescript
interface SizePlugin {
  name: string
  version?: string
  description?: string
  dependencies?: string[]

  // 生命周期钩子
  install(manager: SizeManager, options?: any): void | Promise<void>
  uninstall?(manager: SizeManager): void | Promise<void>

  // 可选的扩展点
  beforeModeChange?(event: BeforeModeChangeEvent): void | boolean
  afterModeChange?(event: AfterModeChangeEvent): void
  onConfigGenerate?(config: SizeConfig, mode: SizeMode): SizeConfig
  onCSSGenerate?(variables: Record<string, string>, mode: SizeMode): Record<string, string>
}

// 插件管理器
class PluginManager {
  private plugins = new Map<string, SizePlugin>()
  private installedPlugins = new Set<string>()
  private sizeManager: SizeManager

  constructor(sizeManager: SizeManager) {
    this.sizeManager = sizeManager
  }

  // 注册插件
  register(plugin: SizePlugin): void {
    this.validatePlugin(plugin)
    this.plugins.set(plugin.name, plugin)
  }

  // 安装插件
  async install(pluginName: string, options?: any): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`)
    }

    if (this.installedPlugins.has(pluginName)) {
      console.warn(`Plugin "${pluginName}" is already installed`)
      return
    }

    // 检查依赖
    await this.checkDependencies(plugin)

    // 安装插件
    await plugin.install(this.sizeManager, options)
    this.installedPlugins.add(pluginName)

    // 注册事件监听器
    this.registerPluginHooks(plugin)
  }

  // 卸载插件
  async uninstall(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin || !this.installedPlugins.has(pluginName)) {
      return
    }

    if (plugin.uninstall) {
      await plugin.uninstall(this.sizeManager)
    }

    this.installedPlugins.delete(pluginName)
    this.unregisterPluginHooks(plugin)
  }
}
```

### 2. 内置插件示例

**动画插件**：

```typescript
const AnimationPlugin: SizePlugin = {
  name: 'animation',
  version: '1.0.0',
  description: '为尺寸切换添加动画效果',

  install(manager: SizeManager, options = {}) {
    const config = {
      duration: 300,
      easing: 'ease-in-out',
      ...options,
    }

    // 添加动画样式
    this.injectAnimationCSS(config)

    // 监听尺寸变化
    manager.onSizeChange(() => {
      this.triggerAnimation(config)
    })
  },

  injectAnimationCSS(config: any) {
    const css = `
      * {
        transition: font-size ${config.duration}ms ${config.easing},
                   padding ${config.duration}ms ${config.easing},
                   margin ${config.duration}ms ${config.easing},
                   border-radius ${config.duration}ms ${config.easing} !important;
      }
    `

    const style = document.createElement('style')
    style.id = 'size-animation-plugin'
    style.textContent = css
    document.head.appendChild(style)
  },

  triggerAnimation(config: any) {
    // 添加动画类
    document.body.classList.add('size-changing')

    setTimeout(() => {
      document.body.classList.remove('size-changing')
    }, config.duration)
  },

  uninstall() {
    const style = document.getElementById('size-animation-plugin')
    if (style) {
      style.remove()
    }
  },
}
```

**存储插件**：

```typescript
const StoragePlugin: SizePlugin = {
  name: 'storage',
  version: '1.0.0',
  description: '自动保存和恢复用户的尺寸偏好',

  install(manager: SizeManager, options = {}) {
    const config = {
      storageKey: 'ldesign-size-preference',
      storageType: 'localStorage', // 'localStorage' | 'sessionStorage' | 'cookie'
      ...options,
    }

    // 恢复保存的尺寸偏好
    this.restorePreference(manager, config)

    // 监听变化并保存
    manager.onSizeChange(event => {
      this.savePreference(event.currentMode, config)
    })
  },

  restorePreference(manager: SizeManager, config: any) {
    try {
      const storage = window[config.storageType]
      const saved = storage.getItem(config.storageKey)

      if (saved && isValidSizeMode(saved)) {
        manager.setMode(saved as SizeMode)
      }
    } catch (error) {
      console.warn('Failed to restore size preference:', error)
    }
  },

  savePreference(mode: SizeMode, config: any) {
    try {
      const storage = window[config.storageType]
      storage.setItem(config.storageKey, mode)
    } catch (error) {
      console.warn('Failed to save size preference:', error)
    }
  },
}
```

## 🎯 事件系统扩展

### 1. 自定义事件

```typescript
// 扩展事件类型
interface CustomSizeEvents {
  'mode:beforeChange': BeforeModeChangeEvent
  'mode:afterChange': AfterModeChangeEvent
  'config:updated': ConfigUpdatedEvent
  'css:injected': CSSInjectedEvent
  'theme:changed': ThemeChangedEvent
}

// 事件扩展管理器
class EventExtensionManager {
  private customEvents = new Map<string, Set<Function>>()

  // 注册自定义事件
  registerEvent<K extends keyof CustomSizeEvents>(
    event: K,
    handler: (data: CustomSizeEvents[K]) => void
  ): () => void {
    if (!this.customEvents.has(event)) {
      this.customEvents.set(event, new Set())
    }

    this.customEvents.get(event)!.add(handler)

    return () => {
      this.customEvents.get(event)?.delete(handler)
    }
  }

  // 触发自定义事件
  emitEvent<K extends keyof CustomSizeEvents>(event: K, data: CustomSizeEvents[K]): void {
    const handlers = this.customEvents.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in custom event handler for ${event}:`, error)
        }
      })
    }
  }
}
```

### 2. 中间件系统

```typescript
interface SizeMiddleware {
  name: string
  priority?: number

  // 中间件处理函数
  process(context: MiddlewareContext, next: () => void): void
}

interface MiddlewareContext {
  action: 'setMode' | 'generateCSS' | 'injectCSS'
  data: any
  manager: SizeManager
}

class MiddlewareManager {
  private middlewares: SizeMiddleware[] = []

  // 注册中间件
  use(middleware: SizeMiddleware): void {
    this.middlewares.push(middleware)
    // 按优先级排序
    this.middlewares.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  // 执行中间件链
  async execute(context: MiddlewareContext): Promise<void> {
    let index = 0

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) {
        return
      }

      const middleware = this.middlewares[index++]
      await middleware.process(context, next)
    }

    await next()
  }
}

// 中间件示例：日志记录
const LoggingMiddleware: SizeMiddleware = {
  name: 'logging',
  priority: 100,

  process(context, next) {
    console.log(`[Size] ${context.action}:`, context.data)
    const startTime = performance.now()

    next()

    const endTime = performance.now()
    console.log(`[Size] ${context.action} completed in ${endTime - startTime}ms`)
  },
}

// 中间件示例：验证
const ValidationMiddleware: SizeMiddleware = {
  name: 'validation',
  priority: 200,

  process(context, next) {
    if (context.action === 'setMode') {
      if (!isValidSizeMode(context.data)) {
        throw new Error(`Invalid size mode: ${context.data}`)
      }
    }

    next()
  },
}
```

## 🔗 框架集成扩展

### 1. React 支持扩展

```typescript
// React Hook 扩展
import { useState, useEffect, useCallback } from 'react'

export function useSize(options: UseSizeOptions = {}) {
  const [currentMode, setCurrentMode] = useState<SizeMode>('medium')
  const [currentConfig, setCurrentConfig] = useState<SizeConfig>()

  const sizeManager = useMemo(() => {
    return options.global ? globalSizeManager : createSizeManager(options)
  }, [options.global])

  useEffect(() => {
    setCurrentMode(sizeManager.getCurrentMode())
    setCurrentConfig(sizeManager.getConfig())

    const unsubscribe = sizeManager.onSizeChange(event => {
      setCurrentMode(event.currentMode)
      setCurrentConfig(sizeManager.getConfig(event.currentMode))
    })

    return unsubscribe
  }, [sizeManager])

  const setMode = useCallback(
    (mode: SizeMode) => {
      sizeManager.setMode(mode)
    },
    [sizeManager]
  )

  return {
    currentMode,
    currentConfig,
    setMode,
    sizeManager,
  }
}

// React 组件扩展
export const SizeSwitcher: React.FC<SizeSwitcherProps> = ({
  switcherStyle = 'button',
  onChange,
}) => {
  const { currentMode, setMode } = useSize({ global: true })
  const availableModes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']

  const handleChange = (mode: SizeMode) => {
    setMode(mode)
    onChange?.(mode)
  }

  if (switcherStyle === 'button') {
    return (
      <div className='size-switcher size-switcher--button'>
        {availableModes.map(mode => (
          <button
            key={mode}
            className={`size-switcher__button ${currentMode === mode ? 'active' : ''}`}
            onClick={() => handleChange(mode)}
          >
            {getSizeModeDisplayName(mode)}
          </button>
        ))}
      </div>
    )
  }

  // 其他样式的实现...
}
```

### 2. Angular 支持扩展

```typescript
// Angular 服务
@Injectable({
  providedIn: 'root',
})
export class SizeService {
  private sizeManager = globalSizeManager
  private currentMode$ = new BehaviorSubject<SizeMode>('medium')
  private currentConfig$ = new BehaviorSubject<SizeConfig>(getSizeConfig('medium'))

  constructor() {
    this.currentMode$.next(this.sizeManager.getCurrentMode())
    this.currentConfig$.next(this.sizeManager.getConfig())

    this.sizeManager.onSizeChange(event => {
      this.currentMode$.next(event.currentMode)
      this.currentConfig$.next(this.sizeManager.getConfig(event.currentMode))
    })
  }

  getCurrentMode(): Observable<SizeMode> {
    return this.currentMode$.asObservable()
  }

  getCurrentConfig(): Observable<SizeConfig> {
    return this.currentConfig$.asObservable()
  }

  setMode(mode: SizeMode): void {
    this.sizeManager.setMode(mode)
  }
}

// Angular 指令
@Directive({
  selector: '[sizeResponsive]',
})
export class SizeResponsiveDirective implements OnInit, OnDestroy {
  @Input() sizeResponsive: Partial<Record<SizeMode, any>> = {}

  private destroy$ = new Subject<void>()

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private sizeService: SizeService
  ) {}

  ngOnInit() {
    this.sizeService
      .getCurrentMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        this.applyModeStyles(mode)
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private applyModeStyles(mode: SizeMode) {
    const styles = this.sizeResponsive[mode]
    if (styles) {
      Object.entries(styles).forEach(([property, value]) => {
        this.renderer.setStyle(this.el.nativeElement, property, value)
      })
    }
  }
}
```

## 🚀 未来扩展规划

### 1. 可视化配置工具

```typescript
interface VisualConfigTool {
  // 可视化编辑器
  openEditor(): void

  // 实时预览
  previewMode(mode: SizeMode): void

  // 导出配置
  exportConfig(): SizeConfig

  // 导入配置
  importConfig(config: SizeConfig): void
}
```

### 2. 云端同步扩展

```typescript
interface CloudSyncExtension {
  // 同步到云端
  syncToCloud(userId: string, preferences: UserPreferences): Promise<void>

  // 从云端恢复
  restoreFromCloud(userId: string): Promise<UserPreferences>

  // 跨设备同步
  enableCrossDeviceSync(userId: string): void
}
```

### 3. AI 智能推荐

```typescript
interface AIRecommendationExtension {
  // 基于用户行为推荐尺寸
  recommendSize(userBehavior: UserBehaviorData): SizeMode

  // 自动调整
  enableAutoAdjustment(preferences: AutoAdjustmentPreferences): void

  // 学习用户偏好
  learnUserPreferences(interactions: UserInteraction[]): void
}
```

---

_通过这些扩展性设计，@ldesign/size 能够适应各种复杂的使用场景，并为未来的功能扩展提供了坚实的基础。_
