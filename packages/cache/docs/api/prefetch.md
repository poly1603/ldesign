# 智能预取（Prefetch）

通过访问模式学习与规则触发机制，提前加载用户可能即将访问的数据，提高交互速度与体验。

## 能力概览
- 规则触发：基于当前 key、最近访问键、上下文自定义
- 预测预取：窗口模式匹配 + 置信度计算
- 空闲预取：空闲时执行低优先级任务
- 并发控制：最大并发 + 超时控制

## 快速上手

```ts
import { withPrefetching } from '@ldesign/cache'
import { createCache } from '@ldesign/cache'

const cache = createCache()
const smartCache = withPrefetching(cache, {
  enablePredictive: true,
  predictionWindow: 5,
  minConfidence: 0.6,
  maxConcurrent: 3,
  timeout: 5000,
  prefetchOnIdle: true,
  idleThreshold: 2000,
})

// 规则：访问产品列表时预取相关详情
smartCache.prefetcher.addRule({
  id: 'product-details',
  trigger: ctx => ctx.currentKey?.startsWith('products:list'),
  keys: ctx => ['product:1', 'product:2', 'product:3'],
  fetcher: key => fetch(`/api/${key}`).then(r => r.json()),
  priority: 10,
  strategy: 'eager', // 立即预取
})

// 访问触发学习与预取
await smartCache.get('products:list')
```

## API

### withPrefetching(cache, options)
```ts
interface PrefetcherOptions {
  maxConcurrent?: number
  timeout?: number
  enablePredictive?: boolean
  predictionWindow?: number
  minConfidence?: number
  prefetchOnIdle?: boolean
  idleThreshold?: number
}
```

### Prefetcher
```ts
class Prefetcher {
  addRule(rule: PrefetchRule): void
  removeRule(id: string): void
  recordAccess(key: string): void
  prefetch(keys: string[], fetcher: (key: string) => Promise<any>, options?: {
    priority?: number
    strategy?: 'eager' | 'lazy' | 'predictive' | 'manual'
  }): Promise<void>
  getStats(): {
    totalTasks: number
    pendingTasks: number
    runningTasks: number
    completedTasks: number
    failedTasks: number
    patterns: number
    predictions: Array<{ key: string; confidence: number }>
  }
}

interface PrefetchRule {
  id: string
  trigger: (ctx: PrefetchContext) => boolean
  keys: string[] | ((ctx: PrefetchContext) => string[])
  fetcher: (key: string) => Promise<any>
  priority?: number
  strategy?: 'eager' | 'lazy' | 'predictive' | 'manual'
  delay?: number
}

interface PrefetchContext {
  currentKey?: string
  recentKeys: string[]
  timestamp: number
  userData?: any
}
```

## 最佳实践
- 规则要精：只针对高频路径与热点数据
- 预取要稳：超时 + 并发 + 失败重试（可结合 RetryManager）
- 影响要小：空闲时预取 + 低优先级批处理
- 监控要全：结合 PerformanceMonitor 观察预取收益

