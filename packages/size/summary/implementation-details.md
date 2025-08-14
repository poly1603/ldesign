# @ldesign/size 实现细节

## 🔧 核心实现技术

### 1. CSS变量动态生成

**技术原理**：
利用CSS自定义属性（CSS Variables）的动态特性，在运行时生成和注入完整的设计系统变量。

**实现策略**：
```typescript
// 变量生成核心算法
class CSSVariableGenerator {
  private generateVariables(config: SizeConfig): Record<string, string> {
    const variables: Record<string, string> = {}
    
    // 1. 字体系统变量
    Object.entries(config.fontSize).forEach(([key, value]) => {
      variables[`${this.prefix}-font-size-${key}`] = value
    })
    
    // 2. 间距系统变量
    Object.entries(config.spacing).forEach(([key, value]) => {
      variables[`${this.prefix}-spacing-${key}`] = value
      // 同时生成padding和margin变量
      variables[`${this.prefix}-padding-${key}`] = value
      variables[`${this.prefix}-margin-${key}`] = value
    })
    
    // 3. 组件尺寸变量
    this.generateComponentVariables(config.component, variables)
    
    return variables
  }
}
```

**变量命名算法**：
```typescript
// BEM风格的变量命名
const generateVariableName = (prefix: string, category: string, size: string, variant?: string): string => {
  const parts = [prefix, category, size]
  if (variant) parts.push(variant)
  return parts.join('-')
}

// 示例：--ls-button-height-medium
```

### 2. DOM样式注入机制

**注入策略**：
```typescript
class CSSInjector {
  private injectCSS(cssString: string): void {
    // 1. 环境检测
    if (typeof document === 'undefined') {
      this.handleSSREnvironment()
      return
    }
    
    // 2. 清理旧样式
    this.removeExistingStyle()
    
    // 3. 创建新样式元素
    const styleElement = this.createStyleElement(cssString)
    
    // 4. 插入到DOM
    this.insertStyleElement(styleElement)
    
    // 5. 缓存引用
    this.styleElement = styleElement
  }
  
  private createStyleElement(cssString: string): HTMLStyleElement {
    const style = document.createElement('style')
    style.id = this.options.styleId
    style.type = 'text/css'
    
    // 设置CSS内容
    if (style.styleSheet) {
      // IE8及以下版本
      style.styleSheet.cssText = cssString
    } else {
      style.appendChild(document.createTextNode(cssString))
    }
    
    return style
  }
}
```

**性能优化**：
```typescript
// 批量DOM操作
class BatchDOMUpdater {
  private updates: (() => void)[] = []
  private scheduled = false
  
  schedule(update: () => void): void {
    this.updates.push(update)
    
    if (!this.scheduled) {
      this.scheduled = true
      // 使用requestAnimationFrame确保在下一帧执行
      requestAnimationFrame(() => this.flush())
    }
  }
  
  private flush(): void {
    // 批量执行所有DOM更新
    this.updates.forEach(update => update())
    this.updates.length = 0
    this.scheduled = false
  }
}
```

### 3. 状态管理实现

**响应式状态系统**：
```typescript
class ReactiveState<T> {
  private _value: T
  private listeners: Set<(value: T) => void> = new Set()
  
  constructor(initialValue: T) {
    this._value = initialValue
  }
  
  get value(): T {
    return this._value
  }
  
  set value(newValue: T) {
    if (newValue !== this._value) {
      const oldValue = this._value
      this._value = newValue
      this.notify(newValue, oldValue)
    }
  }
  
  subscribe(listener: (value: T) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  private notify(newValue: T, oldValue: T): void {
    this.listeners.forEach(listener => {
      try {
        listener(newValue)
      } catch (error) {
        console.error('Error in state listener:', error)
      }
    })
  }
}
```

**状态持久化**：
```typescript
class StatePersistence {
  private storageKey = 'ldesign-size-mode'
  
  save(mode: SizeMode): void {
    try {
      localStorage.setItem(this.storageKey, mode)
    } catch (error) {
      // 降级到sessionStorage
      try {
        sessionStorage.setItem(this.storageKey, mode)
      } catch (sessionError) {
        console.warn('Unable to persist size mode:', sessionError)
      }
    }
  }
  
  load(): SizeMode | null {
    try {
      return localStorage.getItem(this.storageKey) as SizeMode
    } catch (error) {
      try {
        return sessionStorage.getItem(this.storageKey) as SizeMode
      } catch (sessionError) {
        return null
      }
    }
  }
}
```

### 4. 事件系统实现

**发布订阅模式**：
```typescript
class EventEmitter<T = any> {
  private events: Map<string, Set<(data: T) => void>> = new Map()
  
  on(event: string, callback: (data: T) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    
    this.events.get(event)!.add(callback)
    
    // 返回取消订阅函数
    return () => {
      const callbacks = this.events.get(event)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.events.delete(event)
        }
      }
    }
  }
  
  emit(event: string, data: T): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      // 异步执行回调，避免阻塞主线程
      Promise.resolve().then(() => {
        callbacks.forEach(callback => {
          try {
            callback(data)
          } catch (error) {
            console.error(`Error in event callback for ${event}:`, error)
          }
        })
      })
    }
  }
}
```

**事件防抖处理**：
```typescript
class DebouncedEventEmitter extends EventEmitter {
  private debounceMap: Map<string, NodeJS.Timeout> = new Map()
  
  emitDebounced(event: string, data: any, delay: number = 100): void {
    // 清除之前的定时器
    const existingTimer = this.debounceMap.get(event)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    // 设置新的定时器
    const timer = setTimeout(() => {
      this.emit(event, data)
      this.debounceMap.delete(event)
    }, delay)
    
    this.debounceMap.set(event, timer)
  }
}
```

## 🎨 Vue集成实现

### 1. 响应式集成

**Vue 3 Composition API集成**：
```typescript
function useSize(options: UseSizeOptions = {}): UseSizeReturn {
  const sizeManager = getSizeManager(options)
  
  // 创建响应式引用
  const currentMode = ref<SizeMode>(sizeManager.getCurrentMode())
  const currentConfig = ref<SizeConfig>(sizeManager.getConfig())
  
  // 计算属性
  const currentModeDisplayName = computed(() => 
    getSizeModeDisplayName(currentMode.value)
  )
  
  // 监听尺寸变化
  const unsubscribe = sizeManager.onSizeChange((event) => {
    // 更新响应式状态
    currentMode.value = event.currentMode
    currentConfig.value = sizeManager.getConfig(event.currentMode)
  })
  
  // 组件卸载时清理
  onUnmounted(() => {
    unsubscribe()
    if (!options.global && !options.shared) {
      sizeManager.destroy()
    }
  })
  
  return {
    currentMode: readonly(currentMode),
    currentConfig: readonly(currentConfig),
    currentModeDisplayName,
    setMode: sizeManager.setMode.bind(sizeManager),
    nextMode: () => sizeManager.setMode(getNextSizeMode(currentMode.value)),
    previousMode: () => sizeManager.setMode(getPreviousSizeMode(currentMode.value)),
  }
}
```

### 2. 组件实现技术

**TSX组件实现**：
```typescript
export const SizeSwitcher = defineComponent({
  name: 'SizeSwitcher',
  props: {
    switcherStyle: {
      type: String as PropType<'button' | 'select' | 'radio'>,
      default: 'button'
    }
  },
  setup(props, { emit }) {
    const { currentMode, availableModes, setMode } = useSizeSwitcher()
    
    const handleModeChange = (mode: SizeMode) => {
      setMode(mode)
      emit('change', mode)
    }
    
    // 渲染函数工厂
    const renderStrategies = {
      button: () => (
        <div class="size-switcher size-switcher--button">
          {availableModes.map(mode => (
            <button
              key={mode}
              class={['size-switcher__button', {
                'size-switcher__button--active': currentMode.value === mode
              }]}
              onClick={() => handleModeChange(mode)}
            >
              {getSizeModeDisplayName(mode)}
            </button>
          ))}
        </div>
      ),
      
      select: () => (
        <select
          class="size-switcher size-switcher--select"
          value={currentMode.value}
          onChange={(e: Event) => {
            const target = e.target as HTMLSelectElement
            handleModeChange(target.value as SizeMode)
          }}
        >
          {availableModes.map(mode => (
            <option key={mode} value={mode}>
              {getSizeModeDisplayName(mode)}
            </option>
          ))}
        </select>
      ),
      
      radio: () => (
        <div class="size-switcher size-switcher--radio">
          {availableModes.map(mode => (
            <label key={mode} class="size-switcher__radio-label">
              <input
                type="radio"
                name="size-mode"
                value={mode}
                checked={currentMode.value === mode}
                onChange={() => handleModeChange(mode)}
              />
              <span>{getSizeModeDisplayName(mode)}</span>
            </label>
          ))}
        </div>
      )
    }
    
    return () => renderStrategies[props.switcherStyle]()
  }
})
```

### 3. 插件系统实现

**Vue插件注册机制**：
```typescript
const VueSizePlugin: Plugin = {
  install(app: App, options: VueSizePluginOptions = {}) {
    // 1. 创建管理器实例
    const sizeManager = createSizeManager(options)
    
    // 2. 全局提供
    app.provide(VueSizeSymbol, sizeManager)
    
    // 3. 全局属性
    const globalPropertyName = options.globalPropertyName || '$size'
    app.config.globalProperties[globalPropertyName] = sizeManager
    
    // 4. 全局方法
    app.config.globalProperties.$setSize = (mode: string) => {
      if (isValidSizeMode(mode)) {
        sizeManager.setMode(mode)
      }
    }
    
    // 5. 生命周期钩子
    const originalUnmount = app.unmount
    app.unmount = function(...args) {
      sizeManager.destroy()
      return originalUnmount.apply(this, args)
    }
    
    // 6. 开发工具集成
    if (process.env.NODE_ENV === 'development') {
      app.config.globalProperties.$sizeDebug = {
        manager: sizeManager,
        modes: getAvailableModes(),
        currentConfig: () => sizeManager.getConfig()
      }
    }
  }
}
```

## 🚀 性能优化实现

### 1. 缓存策略

**多级缓存系统**：
```typescript
class CacheManager {
  private l1Cache = new Map<string, any>() // 内存缓存
  private l2Cache = new Map<string, any>() // 会话缓存
  
  get<T>(key: string): T | undefined {
    // L1缓存命中
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key)
    }
    
    // L2缓存命中
    if (this.l2Cache.has(key)) {
      const value = this.l2Cache.get(key)
      // 提升到L1缓存
      this.l1Cache.set(key, value)
      return value
    }
    
    return undefined
  }
  
  set<T>(key: string, value: T, level: 1 | 2 = 1): void {
    if (level === 1) {
      this.l1Cache.set(key, value)
    } else {
      this.l2Cache.set(key, value)
    }
  }
  
  // LRU淘汰策略
  private evictLRU(): void {
    if (this.l1Cache.size > 100) {
      const firstKey = this.l1Cache.keys().next().value
      this.l1Cache.delete(firstKey)
    }
  }
}
```

### 2. 懒加载实现

**动态导入策略**：
```typescript
class LazyLoader {
  private loadedModules = new Map<string, any>()
  
  async loadVueSupport(): Promise<any> {
    if (this.loadedModules.has('vue')) {
      return this.loadedModules.get('vue')
    }
    
    try {
      const vueModule = await import('./vue')
      this.loadedModules.set('vue', vueModule)
      return vueModule
    } catch (error) {
      console.error('Failed to load Vue support:', error)
      throw error
    }
  }
  
  async loadReactSupport(): Promise<any> {
    if (this.loadedModules.has('react')) {
      return this.loadedModules.get('react')
    }
    
    try {
      const reactModule = await import('./react')
      this.loadedModules.set('react', reactModule)
      return reactModule
    } catch (error) {
      console.error('Failed to load React support:', error)
      throw error
    }
  }
}
```

### 3. 内存管理

**弱引用和清理机制**：
```typescript
class MemoryManager {
  private weakRefs = new Set<WeakRef<any>>()
  private cleanupTasks = new Set<() => void>()
  
  addWeakRef<T extends object>(obj: T): WeakRef<T> {
    const weakRef = new WeakRef(obj)
    this.weakRefs.add(weakRef)
    return weakRef
  }
  
  addCleanupTask(task: () => void): void {
    this.cleanupTasks.add(task)
  }
  
  cleanup(): void {
    // 清理弱引用
    this.weakRefs.forEach(ref => {
      if (ref.deref() === undefined) {
        this.weakRefs.delete(ref)
      }
    })
    
    // 执行清理任务
    this.cleanupTasks.forEach(task => {
      try {
        task()
      } catch (error) {
        console.error('Error in cleanup task:', error)
      }
    })
    
    this.cleanupTasks.clear()
  }
  
  // 定期清理
  startPeriodicCleanup(interval: number = 60000): void {
    setInterval(() => this.cleanup(), interval)
  }
}
```

## 🔍 错误处理实现

### 1. 错误分类和处理

**结构化错误处理**：
```typescript
enum ErrorCode {
  INVALID_SIZE_MODE = 'E001',
  CSS_INJECTION_FAILED = 'E002',
  CONFIG_VALIDATION_FAILED = 'E003',
  PLUGIN_LOAD_FAILED = 'E004'
}

class SizeError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'SizeError'
  }
  
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack
    }
  }
}

class ErrorHandler {
  private errorReporters: ((error: SizeError) => void)[] = []
  
  handle(error: SizeError): void {
    // 1. 记录错误
    console.error(`[${error.code}] ${error.message}`, error.context)
    
    // 2. 错误恢复
    this.recover(error)
    
    // 3. 错误上报
    this.report(error)
  }
  
  private recover(error: SizeError): void {
    switch (error.code) {
      case ErrorCode.INVALID_SIZE_MODE:
        // 回退到默认模式
        this.fallbackToDefaultMode()
        break
        
      case ErrorCode.CSS_INJECTION_FAILED:
        // 重试注入
        this.retryInjection()
        break
        
      default:
        console.warn('No recovery strategy for error:', error.code)
    }
  }
  
  private report(error: SizeError): void {
    this.errorReporters.forEach(reporter => {
      try {
        reporter(error)
      } catch (reportError) {
        console.error('Error in error reporter:', reportError)
      }
    })
  }
}
```

### 2. 开发环境调试

**调试工具实现**：
```typescript
class DebugManager {
  private isEnabled = process.env.NODE_ENV === 'development'
  private logs: Array<{ timestamp: number; level: string; message: string; data?: any }> = []
  
  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.isEnabled) return
    
    const logEntry = {
      timestamp: Date.now(),
      level,
      message,
      data
    }
    
    this.logs.push(logEntry)
    
    // 控制台输出
    const consoleMethod = console[level] || console.log
    consoleMethod(`[LDesign Size] ${message}`, data)
    
    // 限制日志数量
    if (this.logs.length > 1000) {
      this.logs.splice(0, 500)
    }
  }
  
  getLogs(): typeof this.logs {
    return [...this.logs]
  }
  
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
  
  // 性能监控
  time(label: string): void {
    if (this.isEnabled) {
      console.time(`[LDesign Size] ${label}`)
    }
  }
  
  timeEnd(label: string): void {
    if (this.isEnabled) {
      console.timeEnd(`[LDesign Size] ${label}`)
    }
  }
}
```

## 🧪 测试实现策略

### 1. 单元测试架构

**测试工具链**：
- **Vitest**: 快速的单元测试框架
- **@testing-library/vue**: Vue组件测试
- **jsdom**: DOM环境模拟

**测试覆盖策略**：
```typescript
// 核心功能测试
describe('SizeManager', () => {
  let manager: SizeManager
  
  beforeEach(() => {
    manager = createSizeManager({ autoInject: false })
  })
  
  afterEach(() => {
    manager.destroy()
  })
  
  it('should set and get size mode correctly', () => {
    manager.setMode('large')
    expect(manager.getCurrentMode()).toBe('large')
  })
  
  it('should emit size change events', () => {
    const callback = vi.fn()
    manager.onSizeChange(callback)
    
    manager.setMode('small')
    
    expect(callback).toHaveBeenCalledWith({
      previousMode: 'medium',
      currentMode: 'small',
      timestamp: expect.any(Number)
    })
  })
})
```

### 2. 集成测试

**Vue组件测试**：
```typescript
import { mount } from '@vue/test-utils'
import { SizeSwitcher } from '../vue/SizeSwitcher'

describe('SizeSwitcher Component', () => {
  it('should render all size options', () => {
    const wrapper = mount(SizeSwitcher)
    
    const buttons = wrapper.findAll('.size-switcher__button')
    expect(buttons).toHaveLength(4)
    
    const modes = buttons.map(btn => btn.attributes('data-mode'))
    expect(modes).toEqual(['small', 'medium', 'large', 'extra-large'])
  })
  
  it('should emit change event when clicked', async () => {
    const wrapper = mount(SizeSwitcher)
    
    await wrapper.find('[data-mode="large"]').trigger('click')
    
    expect(wrapper.emitted('change')).toEqual([['large']])
  })
})
```

---

*这些实现细节展示了@ldesign/size在技术层面的深度思考和精心设计，确保了系统的稳定性、性能和可维护性。*
