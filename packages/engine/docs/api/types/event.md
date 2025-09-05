# 事件类型（Event Types）

事件系统使用发布/订阅模型，带优先级、一次性监听等能力。

## 基本类型

```ts
interface EventManager<TMap = Record<string, any>> {
  on<K extends keyof TMap>(event: K, handler: (payload: TMap[K]) => void, priority?: number): void
  once<K extends keyof TMap>(event: K, handler: (payload: TMap[K]) => void, priority?: number): void
  off<K extends keyof TMap>(event: K, handler?: (payload: TMap[K]) => void): void
  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void

  listenerCount(event: string): number
  eventNames(): string[]
  listeners(event: string): Function[]
  removeAllListeners(event?: string): void
}
```

```ts
interface EngineEventMap {
  'app:created': App
  'engine:installed': { app: App }
  'engine:mounted': { target: string | Element }
  'engine:unmounted': void
  'engine:error': any
  [k: string]: any
}
```

更多：src/types/event.ts、src/events/event-manager.ts。
