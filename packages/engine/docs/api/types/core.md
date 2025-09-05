# 核心类型（Core Types）

核心类型覆盖 Engine、各 Manager 基本接口，以及跨模块通用类型。

## Engine

```ts
interface Engine {
  // 管理器
  plugins: PluginManager
  middleware: MiddlewareManager
  events: EventManager
  state: StateManager
  directives: DirectiveManager
  errors: ErrorManager
  logger: Logger
  notifications: NotificationManager

  // 可选扩展
  router?: RouterAdapter
  store?: StateAdapter
  i18n?: I18nAdapter
  theme?: ThemeAdapter

  // 配置
  config: ConfigManager

  // Vue 集成
  createApp(root: Component): App
  install(app: App): void
  mount(target: string | Element): Promise<void>
  unmount(): Promise<void>
}
```

## 统计与主题

```ts
interface Stats {
  total?: number
  visible?: number
  [k: string]: any
}

type Theme = 'light' | 'dark' | 'auto'
```

更多：请参考 src/types/engine.ts、src/types/index.ts。
