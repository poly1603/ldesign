# 插件类型（Plugin Types）

插件用于扩展引擎功能。

## Plugin

```ts
interface Plugin {
  name: string
  version?: string
  dependencies?: string[]
  install(engine: Engine): void | Promise<void>
  uninstall?(engine: Engine): void | Promise<void>
}
```

## PluginManager（片段）

```ts
interface PluginManager {
  register(plugin: Plugin): Promise<void>
  unregister(name: string): Promise<void>
  get(name: string): Plugin | undefined
  getAll(): Plugin[]
  isRegistered(name: string): boolean
}
```

更多：src/types/plugin.ts、src/plugins/plugin-manager.ts。
