# 配置类型（Config Types）

配置系统通过 ConfigManager 提供完整的读取、写入、监听与校验能力。

## ConfigManager

```ts
interface ConfigManager {
  get<T = any>(path: string, defaultValue?: T): T
  set(path: string, value: any): void
  has(path: string): boolean
  remove(path: string): void
  merge(partial: Record<string, any>): void
  clear(): void

  watch<T = any>(path: string, cb: (newVal: T, oldVal: T) => void): () => void

  setSchema(schema: ConfigSchema): void
  getSchema(): ConfigSchema | undefined

  enableAutoSave(interval?: number): void
  disableAutoSave(): void

  createSnapshot(): ConfigSnapshot
  restoreSnapshot(snapshot: ConfigSnapshot): void
}
```

## ConfigSchema（片段）

```ts
interface ConfigSchemaNode {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required?: boolean
  default?: any
  description?: string
  children?: Record<string, ConfigSchemaNode>
  validator?: (val: any) => boolean
}

type ConfigSchema = Record<string, ConfigSchemaNode>
```

更多：请参考 src/types/config.ts、src/config/config-manager.ts。
