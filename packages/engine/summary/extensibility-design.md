# 扩展性设计

## 扩展性原则

LDesign Engine 的扩展性设计遵循以下核心原则：

### 1. 开放封闭原则 (Open-Closed Principle)

- **对扩展开放**: 支持通过插件、中间件、适配器等方式扩展功能
- **对修改封闭**: 核心代码无需修改即可添加新功能

### 2. 依赖倒置原则 (Dependency Inversion Principle)

- **面向接口编程**: 依赖抽象而非具体实现
- **依赖注入**: 通过依赖注入实现松耦合

### 3. 单一职责原则 (Single Responsibility Principle)

- **模块化设计**: 每个模块只负责一个特定功能
- **插件化架构**: 功能通过插件形式提供

## 插件扩展系统

### 插件接口设计

```typescript
interface Plugin {
  // 基本信息
  name: string
  version?: string
  description?: string
  author?: string

  // 依赖管理
  dependencies?: string[]
  peerDependencies?: string[]
  optionalDependencies?: string[]

  // 生命周期钩子
  install: (engine: Engine, options?: any) => void | Promise<void>
  uninstall?: (engine: Engine) => void | Promise<void>

  // 配置和元数据
  config?: PluginConfig
  meta?: Record<string, any>

  // 扩展点
  hooks?: PluginHooks
  providers?: PluginProviders
}

interface PluginHooks {
  beforeInstall?: (engine: Engine) => void | Promise<void>
  afterInstall?: (engine: Engine) => void | Promise<void>
  beforeUninstall?: (engine: Engine) => void | Promise<void>
  afterUninstall?: (engine: Engine) => void | Promise<void>
}

interface PluginProviders {
  services?: Record<string, ServiceProvider>
  components?: Record<string, ComponentProvider>
  directives?: Record<string, DirectiveProvider>
}
```

### 插件开发模式

#### 1. 功能增强插件

```typescript
// 认证插件示例
const authPlugin: Plugin = {
  name: 'auth',
  version: '1.0.0',
  description: '用户认证插件',

  install: (engine) => {
    // 注册认证服务
    engine.auth = new AuthService(engine)

    // 注册中间件
    engine.middleware.use(authMiddleware)

    // 注册路由守卫
    engine.router?.beforeEach(authGuard)

    // 监听事件
    engine.events.on('user:logout', () => {
      engine.auth.clearSession()
    })
  },

  providers: {
    services: {
      auth: AuthServiceProvider,
    },

    directives: {
      auth: authDirective,
    },
  },
}
```

#### 2. 适配器插件

```typescript
// Vue Router 适配器插件
const vueRouterPlugin: Plugin = {
  name: 'vue-router-adapter',
  version: '1.0.0',

  install: (engine, options) => {
    const { router } = options

    // 适配 Vue Router
    engine.router = new VueRouterAdapter(router, engine)

    // 注册路由事件
    router.beforeEach((to, from, next) => {
      engine.events.emit('router:beforeEach', { to, from, next })
    })

    router.afterEach((to, from) => {
      engine.events.emit('router:afterEach', { to, from })
    })
  },
}
```

#### 3. 工具集成插件

```typescript
// Element Plus 集成插件
const elementPlusPlugin: Plugin = {
  name: 'element-plus-integration',
  version: '1.0.0',
  dependencies: ['theme'],

  install: (engine) => {
    // 重写通知系统
    engine.notifications = new ElementPlusNotifications()

    // 集成主题系统
    engine.theme.onThemeChange((theme) => {
      updateElementPlusTheme(theme)
    })

    // 注册组件
    engine.components.register('el-form-validator', ElFormValidator)
  },
}
```

## 中间件扩展系统

### 中间件接口设计

```typescript
interface Middleware {
  name: string
  priority?: number
  phase?: string | string[]

  handler: MiddlewareHandler

  // 扩展配置
  config?: MiddlewareConfig
  conditions?: MiddlewareCondition[]
}

interface MiddlewareHandler {
  (context: MiddlewareContext, next: NextFunction): Promise<void>
}

interface MiddlewareContext {
  engine: Engine
  phase: string
  data: any

  // 扩展上下文
  [key: string]: any
}
```

### 中间件开发模式

#### 1. 通用中间件

```typescript
// 日志中间件
const loggingMiddleware: Middleware = {
  name: 'logging',
  priority: 1000, // 最高优先级

  handler: async (context, next) => {
    const { engine, phase, data } = context
    const startTime = performance.now()

    engine.logger.debug(`[${phase}] 开始执行`, data)

    try {
      await next()

      const duration = performance.now() - startTime
      engine.logger.debug(`[${phase}] 执行完成`, { duration })
    }
    catch (error) {
      const duration = performance.now() - startTime
      engine.logger.error(`[${phase}] 执行失败`, { error, duration })
      throw error
    }
  },
}
```

#### 2. 条件中间件

```typescript
// 权限检查中间件
const permissionMiddleware: Middleware = {
  name: 'permission',
  priority: 900,

  conditions: [
    {
      phase: 'beforeRoute',
      when: context => context.data.meta?.requiresPermission,
    },
  ],

  handler: async (context, next) => {
    const { engine, data } = context
    const requiredPermission = data.meta.requiresPermission

    const hasPermission = engine.auth.hasPermission(requiredPermission)

    if (!hasPermission) {
      throw new PermissionError(`权限不足: ${requiredPermission}`)
    }

    await next()
  },
}
```

## 管理器扩展系统

### 管理器接口设计

```typescript
interface Manager {
  name: string

  initialize: (engine: Engine, config?: any) => void | Promise<void>
  destroy: () => void | Promise<void>

  // 扩展接口
  extend: (extension: ManagerExtension) => void
  getExtensions: () => ManagerExtension[]
}

interface ManagerExtension {
  name: string
  extend: (manager: Manager, engine: Engine) => void
}
```

### 自定义管理器

```typescript
// 自定义数据管理器
class DataManager implements Manager {
  name = 'data'

  private repositories = new Map<string, Repository>()
  private cache: CacheManager

  constructor(private engine: Engine) {
    this.cache = engine.cache.namespace('data')
  }

  initialize() {
    // 注册默认仓库
    this.registerRepository('users', new UserRepository())
    this.registerRepository('posts', new PostRepository())
  }

  registerRepository(name: string, repository: Repository) {
    this.repositories.set(name, repository)
  }

  getRepository<T extends Repository>(name: string): T {
    return this.repositories.get(name) as T
  }

  // 扩展接口实现
  extend(extension: ManagerExtension) {
    extension.extend(this, this.engine)
  }
}

// 注册自定义管理器
engine.registerManager('data', DataManager)
```

## 适配器模式

### 适配器接口设计

```typescript
interface Adapter<TTarget, TAdapted> {
  name: string
  target: string

  adapt: (target: TTarget, engine: Engine) => TAdapted
  isCompatible: (target: TTarget) => boolean

  // 生命周期
  beforeAdapt?: (target: TTarget, engine: Engine) => void
  afterAdapt?: (adapted: TAdapted, engine: Engine) => void
}
```

### 路由适配器

```typescript
// Vue Router 适配器
class VueRouterAdapter implements Adapter<Router, EngineRouter> {
  name = 'vue-router'
  target = 'Router'

  isCompatible(router: Router): boolean {
    return router && typeof router.push === 'function'
  }

  adapt(router: Router, engine: Engine): EngineRouter {
    return {
      // 基础路由方法
      push: router.push.bind(router),
      replace: router.replace.bind(router),
      go: router.go.bind(router),
      back: router.back.bind(router),
      forward: router.forward.bind(router),

      // 扩展方法
      navigate: (to, options = {}) => {
        engine.events.emit('router:navigate', { to, options })
        return options.replace ? router.replace(to) : router.push(to)
      },

      // 路由守卫
      beforeEach: (guard) => {
        return router.beforeEach((to, from, next) => {
          const context = { to, from, next, engine }
          return guard(context)
        })
      },

      afterEach: (hook) => {
        return router.afterEach((to, from) => {
          const context = { to, from, engine }
          return hook(context)
        })
      },
    }
  }
}
```

### 状态适配器

```typescript
// Pinia 适配器
class PiniaAdapter implements Adapter<Pinia, EngineState> {
  name = 'pinia'
  target = 'Pinia'

  adapt(pinia: Pinia, engine: Engine): EngineState {
    return {
      // 状态操作
      set: (key: string, value: any) => {
        const store = this.getStore(key)
        store.$patch({ [this.getProperty(key)]: value })
      },

      get: (key: string) => {
        const store = this.getStore(key)
        return store[this.getProperty(key)]
      },

      // 订阅状态变化
      subscribe: (key: string, callback: Function) => {
        const store = this.getStore(key)
        return store.$subscribe((mutation, state) => {
          if (mutation.storeId === this.getStoreId(key)) {
            callback(state[this.getProperty(key)])
          }
        })
      },
    }
  }

  private getStore(key: string) {
    const storeId = this.getStoreId(key)
    return useStore(storeId)()
  }

  private getStoreId(key: string): string {
    return key.split('.')[0]
  }

  private getProperty(key: string): string {
    return key.split('.').slice(1).join('.')
  }
}
```

## 钩子系统

### 钩子接口设计

```typescript
interface Hook<T = any> {
  name: string
  type: 'sync' | 'async' | 'waterfall' | 'bail'

  tap: (name: string, handler: HookHandler<T>) => void
  call: (...args: any[]) => T
  callAsync: (...args: any[]) => Promise<T>
}

interface HookHandler<T> {
  (...args: any[]): T | Promise<T>
}
```

### 钩子实现

```typescript
// 同步钩子
class SyncHook<T> implements Hook<T> {
  name: string
  type = 'sync' as const
  private handlers: HookHandler<T>[] = []

  tap(name: string, handler: HookHandler<T>) {
    this.handlers.push(handler)
  }

  call(...args: any[]): T {
    let result: T

    for (const handler of this.handlers) {
      result = handler(...args) as T
    }

    return result!
  }
}

// 异步钩子
class AsyncHook<T> implements Hook<T> {
  name: string
  type = 'async' as const
  private handlers: HookHandler<T>[] = []

  tap(name: string, handler: HookHandler<T>) {
    this.handlers.push(handler)
  }

  async callAsync(...args: any[]): Promise<T> {
    let result: T

    for (const handler of this.handlers) {
      result = (await handler(...args)) as T
    }

    return result!
  }
}

// 瀑布钩子（结果传递）
class WaterfallHook<T> implements Hook<T> {
  name: string
  type = 'waterfall' as const
  private handlers: HookHandler<T>[] = []

  tap(name: string, handler: HookHandler<T>) {
    this.handlers.push(handler)
  }

  call(initialValue: T, ...args: any[]): T {
    let result = initialValue

    for (const handler of this.handlers) {
      result = handler(result, ...args) as T
    }

    return result
  }
}
```

### 钩子使用示例

```typescript
// 在引擎中定义钩子
class Engine {
  hooks = {
    beforeMount: new AsyncHook<void>('beforeMount'),
    afterMount: new AsyncHook<void>('afterMount'),
    beforeDestroy: new AsyncHook<void>('beforeDestroy'),

    // 数据处理钩子
    processData: new WaterfallHook<any>('processData'),

    // 配置钩子
    normalizeConfig: new WaterfallHook<EngineConfig>('normalizeConfig'),
  }

  async mount(app: App) {
    // 触发钩子
    await this.hooks.beforeMount.callAsync(app)

    // 挂载逻辑
    this.doMount(app)

    await this.hooks.afterMount.callAsync(app)
  }
}

// 插件中使用钩子
const hookPlugin: Plugin = {
  name: 'hook-plugin',

  install: (engine) => {
    // 注册钩子处理器
    engine.hooks.beforeMount.tap('hook-plugin', async (app) => {
      console.log('应用即将挂载')
    })

    engine.hooks.processData.tap('hook-plugin', (data) => {
      // 数据预处理
      return { ...data, processed: true }
    })
  },
}
```

## 服务提供者模式

### 服务提供者接口

```typescript
interface ServiceProvider<T = any> {
  name: string

  register: (engine: Engine) => void
  boot?: (engine: Engine) => void | Promise<void>

  provide: () => T

  dependencies?: string[]
  singleton?: boolean
}
```

### 服务提供者实现

```typescript
// API 服务提供者
class ApiServiceProvider implements ServiceProvider<ApiClient> {
  name = 'api'
  singleton = true
  dependencies = ['config', 'logger']

  private apiClient: ApiClient

  register(engine: Engine) {
    // 注册服务到容器
    engine.container.bind('api', this)
  }

  async boot(engine: Engine) {
    // 服务启动逻辑
    const config = engine.container.get('config')
    const logger = engine.container.get('logger')

    this.apiClient = new ApiClient({
      baseURL: config.apiBaseURL,
      logger,
    })

    await this.apiClient.initialize()
  }

  provide(): ApiClient {
    return this.apiClient
  }
}

// 在插件中注册服务提供者
const apiPlugin: Plugin = {
  name: 'api',

  install: (engine) => {
    const provider = new ApiServiceProvider()
    engine.registerServiceProvider(provider)
  },
}
```

## 扩展点注册

### 扩展点管理器

```typescript
class ExtensionPointManager {
  private extensionPoints = new Map<string, ExtensionPoint>()
  private extensions = new Map<string, Extension[]>()

  // 注册扩展点
  registerExtensionPoint(point: ExtensionPoint) {
    this.extensionPoints.set(point.name, point)
    this.extensions.set(point.name, [])
  }

  // 注册扩展
  registerExtension(pointName: string, extension: Extension) {
    const extensions = this.extensions.get(pointName) || []
    extensions.push(extension)
    this.extensions.set(pointName, extensions)

    // 触发扩展点
    const point = this.extensionPoints.get(pointName)
    if (point) {
      point.onExtensionAdded?.(extension)
    }
  }

  // 获取扩展
  getExtensions(pointName: string): Extension[] {
    return this.extensions.get(pointName) || []
  }
}

interface ExtensionPoint {
  name: string
  description?: string
  schema?: any

  onExtensionAdded?: (extension: Extension) => void
  onExtensionRemoved?: (extension: Extension) => void
}

interface Extension {
  name: string
  point: string
  contribution: any
}
```

### 扩展点使用示例

```typescript
// 定义菜单扩展点
const menuExtensionPoint: ExtensionPoint = {
  name: 'menu',
  description: '应用菜单扩展点',

  onExtensionAdded(extension) {
    // 添加菜单项
    const menuItem = extension.contribution
    addMenuItem(menuItem)
  },
}

// 注册扩展点
engine.extensionPoints.registerExtensionPoint(menuExtensionPoint)

// 插件贡献菜单项
const menuPlugin: Plugin = {
  name: 'menu-plugin',

  install: (engine) => {
    engine.extensionPoints.registerExtension('menu', {
      name: 'user-menu',
      point: 'menu',
      contribution: {
        id: 'user',
        label: '用户管理',
        icon: 'user',
        route: '/users',
      },
    })
  },
}
```

通过这些扩展性设计，LDesign Engine 提供了强大而灵活的扩展能力，允许开发者根据具体需求定制和扩展功能
，同时保持核心架构的稳定性和一致性。
