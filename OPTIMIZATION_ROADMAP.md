# LDesign 优化实施路线图

> 开始时间：2025-01-18  
> 预计完成时间：2025-03-18 (2个月)

---

## 📋 实施概览

### 阶段划分

```
Phase 1 (Week 1-2)    Phase 2 (Week 3-4)    Phase 3 (Week 5-6)    Phase 4 (Week 7-8)
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ 插件通信改进     │ → │ 错误处理系统     │ → │ 性能优化         │ → │ 测试&工具       │
│ + 事件规范       │   │ + 错误类型       │   │ + 代码分割       │   │ + 测试覆盖      │
│ + Plugin API     │   │ + 错误边界       │   │ + Web Worker     │   │ + DevTools      │
└─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## 🎯 阶段 1: 插件间通信机制改进 (Week 1-2)

### 1.1 统一事件命名规范

**目标**：建立一致的事件命名标准

**任务清单**：
- [x] 创建事件常量文件
- [ ] 统一所有插件的事件名称
- [ ] 添加事件类型定义
- [ ] 更新文档

**实施步骤**：

```typescript
// Step 1: 创建 @packages/engine/packages/core/src/constants/events.ts
export const ENGINE_EVENTS = {
  // 生命周期事件
  BEFORE_INIT: 'engine:lifecycle:beforeInit',
  INIT: 'engine:lifecycle:init',
  AFTER_INIT: 'engine:lifecycle:afterInit',
  
  // 插件事件
  PLUGIN_INSTALLED: 'engine:plugin:installed',
  PLUGIN_UNINSTALLED: 'engine:plugin:uninstalled',
} as const

export const PLUGIN_EVENTS = {
  // I18n 插件
  I18N_LOCALE_CHANGED: 'plugin:i18n:locale:changed',
  I18N_MESSAGES_LOADED: 'plugin:i18n:messages:loaded',
  
  // Router 插件
  ROUTER_NAVIGATED: 'plugin:router:navigated',
  ROUTER_GUARD_REJECTED: 'plugin:router:guard:rejected',
  
  // Color 插件
  COLOR_THEME_CHANGED: 'plugin:color:theme:changed',
  COLOR_MODE_CHANGED: 'plugin:color:mode:changed',
  
  // Size 插件
  SIZE_PRESET_CHANGED: 'plugin:size:preset:changed',
  SIZE_VALUE_CHANGED: 'plugin:size:value:changed',
} as const

// Step 2: 事件数据类型定义
export interface EngineEventMap {
  [ENGINE_EVENTS.BEFORE_INIT]: { timestamp: number }
  [ENGINE_EVENTS.INIT]: { timestamp: number }
  [PLUGIN_EVENTS.I18N_LOCALE_CHANGED]: { locale: string; oldLocale: string }
  [PLUGIN_EVENTS.ROUTER_NAVIGATED]: { to: any; from: any }
  // ...
}

// Step 3: 类型安全的事件发射器
class TypedEventEmitter {
  emit<K extends keyof EngineEventMap>(
    event: K,
    data: EngineEventMap[K]
  ): void
  
  on<K extends keyof EngineEventMap>(
    event: K,
    handler: (data: EngineEventMap[K]) => void
  ): () => void
}
```

### 1.2 插件 API 注册机制

**目标**：提供类型安全的插件间调用

**实施步骤**：

```typescript
// Step 1: 定义插件 API 接口
// @packages/engine/packages/core/src/types/plugin-api.ts

export interface PluginAPI {
  name: string
  version: string
}

export interface I18nPluginAPI extends PluginAPI {
  name: 'i18n'
  getLocale(): string
  setLocale(locale: string): Promise<void>
  t(key: string, params?: any): string
  addMessages(locale: string, messages: any): void
}

export interface RouterPluginAPI extends PluginAPI {
  name: 'router'
  push(path: string): Promise<void>
  replace(path: string): Promise<void>
  getCurrentRoute(): any
}

export interface ColorPluginAPI extends PluginAPI {
  name: 'color'
  getTheme(): any
  applyTheme(color: string): Promise<void>
  setMode(mode: 'light' | 'dark'): void
}

export interface SizePluginAPI extends PluginAPI {
  name: 'size'
  getCurrentPreset(): any
  applyPreset(name: string): void
  getBaseSize(): number
}

// Step 2: 插件 API 注册表
// @packages/engine/packages/core/src/plugin/plugin-api-registry.ts

export class PluginAPIRegistry {
  private apis = new Map<string, PluginAPI>()
  
  register<T extends PluginAPI>(api: T): void {
    this.apis.set(api.name, api)
  }
  
  get<T extends PluginAPI>(name: string): T | undefined {
    return this.apis.get(name) as T | undefined
  }
  
  has(name: string): boolean {
    return this.apis.has(name)
  }
}

// Step 3: 集成到 Engine
// @packages/engine/packages/core/src/engine/core-engine.ts

export class EngineCoreImpl implements CoreEngine {
  readonly apiRegistry = new PluginAPIRegistry()
  
  /**
   * 获取插件 API（类型安全）
   */
  getPluginAPI<T extends PluginAPI>(name: string): T | undefined {
    return this.apiRegistry.get<T>(name)
  }
  
  /**
   * 注册插件 API
   */
  registerPluginAPI<T extends PluginAPI>(api: T): void {
    this.apiRegistry.register(api)
  }
}

// Step 4: 插件实现示例
// @packages/i18n/packages/vue/src/plugins/engine-plugin.ts

export function createI18nEnginePlugin(options: I18nEnginePluginOptions): Plugin {
  return {
    name: 'i18n',
    version: '1.0.0',
    
    async install(context) {
      const engine = context.engine
      const i18n = new OptimizedI18n(options)
      
      // 注册插件 API
      engine.registerPluginAPI<I18nPluginAPI>({
        name: 'i18n',
        version: '1.0.0',
        getLocale: () => i18n.locale,
        setLocale: (locale) => i18n.setLocale(locale),
        t: (key, params) => i18n.t(key, params),
        addMessages: (locale, messages) => i18n.addMessages(locale, messages),
      })
      
      // ... 其他逻辑
    },
  }
}

// Step 5: 使用示例
// 在其他插件中调用

async install(context) {
  const engine = context.engine
  
  // 类型安全的 API 调用
  const i18nAPI = engine.getPluginAPI<I18nPluginAPI>('i18n')
  if (i18nAPI) {
    const currentLocale = i18nAPI.getLocale()
    await i18nAPI.setLocale('zh-CN')
    const text = i18nAPI.t('hello')
  }
}
```

**预期效果**：
- ✅ 插件间调用有完整的类型提示
- ✅ 避免硬编码事件名称
- ✅ 便于插件依赖管理

---

## 🎯 阶段 2: 统一错误处理系统 (Week 3-4)

### 2.1 创建标准错误类型

```typescript
// @packages/engine/packages/core/src/errors/engine-error.ts

export enum ErrorCode {
  // 引擎错误 (1xxx)
  ENGINE_INIT_FAILED = 'E1001',
  ENGINE_ALREADY_INITIALIZED = 'E1002',
  ENGINE_NOT_INITIALIZED = 'E1003',
  
  // 插件错误 (2xxx)
  PLUGIN_INSTALL_FAILED = 'E2001',
  PLUGIN_NOT_FOUND = 'E2002',
  PLUGIN_ALREADY_INSTALLED = 'E2003',
  PLUGIN_DEPENDENCY_MISSING = 'E2004',
  PLUGIN_CIRCULAR_DEPENDENCY = 'E2005',
  
  // I18n 错误 (3xxx)
  I18N_LOCALE_NOT_FOUND = 'E3001',
  I18N_MESSAGE_NOT_FOUND = 'E3002',
  I18N_INVALID_FORMAT = 'E3003',
  
  // Router 错误 (4xxx)
  ROUTER_ROUTE_NOT_FOUND = 'E4001',
  ROUTER_NAVIGATION_CANCELLED = 'E4002',
  ROUTER_GUARD_REJECTED = 'E4003',
  
  // Color 错误 (5xxx)
  COLOR_INVALID_FORMAT = 'E5001',
  COLOR_THEME_NOT_FOUND = 'E5002',
  
  // Size 错误 (6xxx)
  SIZE_PRESET_NOT_FOUND = 'E6001',
  SIZE_INVALID_VALUE = 'E6002',
}

export class EngineError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly plugin: string,
    message: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, any>
  ) {
    super(message)
    this.name = 'EngineError'
    
    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EngineError)
    }
  }
  
  /**
   * 格式化错误信息
   */
  toString(): string {
    return `[${this.code}] [${this.plugin}] ${this.message}`
  }
  
  /**
   * 转换为 JSON
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      plugin: this.plugin,
      message: this.message,
      context: this.context,
      stack: this.stack,
      cause: this.cause ? {
        message: this.cause.message,
        stack: this.cause.stack,
      } : undefined,
    }
  }
}

// 具体错误类型
export class PluginError extends EngineError {
  constructor(code: ErrorCode, pluginName: string, message: string, cause?: Error) {
    super(code, pluginName, message, cause)
    this.name = 'PluginError'
  }
}

export class I18nError extends EngineError {
  constructor(code: ErrorCode, message: string, cause?: Error) {
    super(code, 'i18n', message, cause)
    this.name = 'I18nError'
  }
}

export class RouterError extends EngineError {
  constructor(code: ErrorCode, message: string, cause?: Error) {
    super(code, 'router', message, cause)
    this.name = 'RouterError'
  }
}
```

### 2.2 创建错误边界

```typescript
// @packages/engine/packages/core/src/errors/error-boundary.ts

export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E }

export class ErrorBoundary {
  private handlers: Array<(error: EngineError) => void> = []
  
  /**
   * 注册错误处理器
   */
  onError(handler: (error: EngineError) => void): () => void {
    this.handlers.push(handler)
    return () => {
      const index = this.handlers.indexOf(handler)
      if (index > -1) {
        this.handlers.splice(index, 1)
      }
    }
  }
  
  /**
   * 执行函数并捕获错误
   */
  async execute<T>(fn: () => Promise<T>): Promise<Result<T, EngineError>> {
    try {
      const data = await fn()
      return { ok: true, data }
    } catch (error) {
      const normalizedError = this.normalizeError(error)
      this.handleError(normalizedError)
      return { ok: false, error: normalizedError }
    }
  }
  
  /**
   * 同步版本
   */
  executeSync<T>(fn: () => T): Result<T, EngineError> {
    try {
      const data = fn()
      return { ok: true, data }
    } catch (error) {
      const normalizedError = this.normalizeError(error)
      this.handleError(normalizedError)
      return { ok: false, error: normalizedError }
    }
  }
  
  /**
   * 标准化错误
   */
  private normalizeError(error: unknown): EngineError {
    if (error instanceof EngineError) {
      return error
    }
    
    if (error instanceof Error) {
      return new EngineError(
        ErrorCode.ENGINE_INIT_FAILED,
        'unknown',
        error.message,
        error
      )
    }
    
    return new EngineError(
      ErrorCode.ENGINE_INIT_FAILED,
      'unknown',
      String(error)
    )
  }
  
  /**
   * 处理错误
   */
  private handleError(error: EngineError): void {
    // 触发所有错误处理器
    this.handlers.forEach(handler => {
      try {
        handler(error)
      } catch (err) {
        console.error('Error in error handler:', err)
      }
    })
  }
}
```

### 2.3 集成到 Engine

```typescript
// @packages/engine/packages/core/src/engine/core-engine.ts

export class EngineCoreImpl implements CoreEngine {
  readonly errorBoundary = new ErrorBoundary()
  
  async init(): Promise<void> {
    const result = await this.errorBoundary.execute(async () => {
      if (this.initialized) {
        throw new EngineError(
          ErrorCode.ENGINE_ALREADY_INITIALIZED,
          'engine',
          'Engine is already initialized'
        )
      }
      
      await this.lifecycle.trigger('beforeInit')
      await this.lifecycle.trigger('init')
      this.initialized = true
      await this.lifecycle.trigger('afterInit')
    })
    
    if (!result.ok) {
      throw result.error
    }
  }
  
  /**
   * 全局错误处理器
   */
  onError(handler: (error: EngineError) => void): () => void {
    return this.errorBoundary.onError(handler)
  }
}
```

---

## 🎯 阶段 3: 性能优化 (Week 5-6)

### 3.1 代码分割优化

```typescript
// @packages/engine/packages/vue3/src/index.ts

// 主入口：只导出核心功能
export { createVueEngine, VueEngine } from './engine/vue-engine'
export type { VueEngineConfig } from './engine/vue-engine'

// 按需加载：高级功能
export const loadAdvancedFeatures = () => import('./advanced')
export const loadDevTools = () => import('./devtools')

// @packages/engine/packages/vue3/src/advanced/index.ts
export { PluginHotReload } from './plugin-hot-reload'
export { PerformanceMonitor } from './performance-monitor'
export { PluginMarketplace } from './plugin-marketplace'
```

### 3.2 打包配置优化

```typescript
// packages/engine/builder.config.ts
export default {
  rollup: {
    output: {
      manualChunks: {
        // 核心包
        'core': ['./src/engine/core-engine.ts'],
        
        // Vue 适配层
        'vue': ['./src/engine/vue-engine.ts'],
        
        // 插件系统
        'plugins': ['./src/plugin/plugin-manager.ts'],
        
        // 高级功能（按需加载）
        'advanced': ['./src/advanced/index.ts'],
      },
    },
  },
}
```

### 3.3 Web Worker 优化

```typescript
// @packages/router/packages/core/src/workers/matcher-worker.ts

// 路由匹配 Worker
self.onmessage = (e) => {
  const { path, routes } = e.data
  const result = matchRoute(path, routes)
  self.postMessage(result)
}

// @packages/router/packages/core/src/features/worker-matcher.ts

export class WorkerMatcher {
  private worker: Worker
  
  constructor() {
    this.worker = new Worker(
      new URL('./workers/matcher-worker.ts', import.meta.url)
    )
  }
  
  async match(path: string, routes: any[]): Promise<any> {
    return new Promise((resolve) => {
      this.worker.onmessage = (e) => resolve(e.data)
      this.worker.postMessage({ path, routes })
    })
  }
}
```

---

## 🎯 阶段 4: 测试覆盖率提升 (Week 7-8)

### 4.1 单元测试

```typescript
// @packages/engine/packages/core/src/__tests__/core-engine.test.ts

describe('EngineCoreImpl', () => {
  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const engine = new EngineCoreImpl()
      await engine.init()
      expect(engine.isInitialized()).toBe(true)
    })
    
    it('should throw error on double initialization', async () => {
      const engine = new EngineCoreImpl()
      await engine.init()
      
      await expect(engine.init()).rejects.toThrow(EngineError)
    })
    
    it('should trigger lifecycle hooks in correct order', async () => {
      const engine = new EngineCoreImpl()
      const order: string[] = []
      
      engine.lifecycle.on('beforeInit', () => order.push('beforeInit'))
      engine.lifecycle.on('init', () => order.push('init'))
      engine.lifecycle.on('afterInit', () => order.push('afterInit'))
      
      await engine.init()
      
      expect(order).toEqual(['beforeInit', 'init', 'afterInit'])
    })
  })
  
  describe('plugin management', () => {
    it('should install plugin successfully', async () => {
      const engine = new EngineCoreImpl()
      const plugin = {
        name: 'test',
        version: '1.0.0',
        install: vi.fn(),
      }
      
      await engine.use(plugin)
      
      expect(plugin.install).toHaveBeenCalled()
      expect(engine.plugins.has('test')).toBe(true)
    })
    
    it('should handle plugin dependencies', async () => {
      // ... 测试依赖管理
    })
  })
})
```

### 4.2 集成测试

```typescript
// @packages/engine/packages/vue3/src/__tests__/integration.test.ts

describe('Engine Integration', () => {
  it('should integrate all plugins correctly', async () => {
    const engine = createVueEngine({
      plugins: [
        createI18nEnginePlugin({ locale: 'zh-CN' }),
        createRouterEnginePlugin({ routes: [] }),
        createColorEnginePlugin({ primaryColor: '#1890ff' }),
      ],
    })
    
    await engine.init()
    
    // 验证插件间通信
    const i18nAPI = engine.getPluginAPI<I18nPluginAPI>('i18n')
    expect(i18nAPI).toBeDefined()
    expect(i18nAPI?.getLocale()).toBe('zh-CN')
  })
})
```

---

## 📊 进度追踪

| 阶段 | 任务 | 状态 | 完成度 | 预计完成 |
|------|------|------|--------|----------|
| Phase 1 | 事件命名规范 | 🔄 进行中 | 20% | Week 1 |
| Phase 1 | 插件 API 机制 | ⏸️ 待开始 | 0% | Week 2 |
| Phase 2 | 错误类型系统 | ⏸️ 待开始 | 0% | Week 3 |
| Phase 2 | 错误边界 | ⏸️ 待开始 | 0% | Week 4 |
| Phase 3 | 代码分割 | ⏸️ 待开始 | 0% | Week 5 |
| Phase 3 | Web Worker | ⏸️ 待开始 | 0% | Week 6 |
| Phase 4 | 单元测试 | ⏸️ 待开始 | 0% | Week 7 |
| Phase 4 | 集成测试 | ⏸️ 待开始 | 0% | Week 8 |

---

## 📝 更新日志

### 2025-01-18
- ✅ 创建优化路线图
- 🔄 开始阶段 1：事件命名规范
- 📝 完成事件常量设计
- 📝 完成插件 API 接口设计
