# 状态类型（State Types）

状态模块提供键值访问、嵌套路径、快照、命名空间与统计。

## StateManager（片段）

```ts
interface StateManager {
  get<T = any>(key: string): T | undefined
  set<T = any>(key: string, value: T): void
  remove(key: string): void
  clear(): void

  has(key: string): boolean
  keys(): string[]
  watch<T = any>(key: string, cb: (newVal: T, oldVal: T) => void): () => void

  getSnapshot(): Record<string, any>
  restoreFromSnapshot(snapshot: Record<string, any>): void
  merge(partial: Record<string, any>): void

  getStats(): { totalKeys: number; totalWatchers: number; memoryUsage: string }
  getPerformanceStats(): { totalChanges: number; recentChanges: number; batchedUpdates: number; memoryUsage: number }

  namespace(ns: string): StateManager
}
```

更多：src/types/state.ts、src/state/state-manager.ts。
