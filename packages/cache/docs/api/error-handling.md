# 错误处理与容错（Retry / Circuit Breaker / Fallback）

提供稳定性增强能力：自动重试、熔断保护与多级降级，保障系统在不稳定网络或后端故障时的可用性。

## 能力概览
- 自动重试：固定/线性/指数/斐波那契延迟 + 抖动
- 熔断器：CLOSED/OPEN/HALF_OPEN 状态机
- 降级策略：主方案失败时回退到备用方案
- 装饰器：对任意异步函数无侵入增强

## 自动重试（RetryManager）

```ts
import { RetryManager } from '@ldesign/cache'

const retry = new RetryManager()
const res = await retry.retry(
  async () => fetch('/api/data').then(r => r.json()),
  {
    maxAttempts: 3,        // 最大重试次数
    initialDelay: 200,     // 初始延迟
    maxDelay: 10_000,      // 最大延迟
    strategy: 'exponential', // 'fixed' | 'linear' | 'exponential' | 'fibonacci'
    jitter: true,          // 抖动
    shouldRetry: (err, attempt) => !/FATAL/.test(String(err)),
    onRetry: (err, attempt) => console.warn(`重试 ${attempt}:`, err.message),
    timeout: 30_000,
  }
)
```

## 熔断器（CircuitBreaker）

```ts
import { CircuitBreaker } from '@ldesign/cache'

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 3, // 半开态连续成功阈值
  timeout: 10_000,
  resetTimeout: 30_000,
  windowSize: 10,
})

try {
  const data = await breaker.execute(() => fetch('/api/data').then(r => r.json()))
} catch (error) {
  if ((error as Error).message === 'Circuit breaker is OPEN') {
    // 快速失败
  }
}
```

## 降级（FallbackHandler）

```ts
import { FallbackHandler } from '@ldesign/cache'

const fallback = new FallbackHandler<any>()
  .addFallback(() => cache.get('backup'))
  .addFallback(() => Promise.resolve({ default: true }))

const data = await fallback.execute(
  () => fetch('/api/data').then(r => r.json()),
  {
    onFallback: (level, error) => console.warn(`降级到方案 ${level}:`, error.message),
  }
)
```

## 装饰器函数

```ts
import { withRetry, withCircuitBreaker, withFallback } from '@ldesign/cache'

const fn1 = withRetry(fetchJson, { maxAttempts: 3 })
const fn2 = withCircuitBreaker(fetchJson, { failureThreshold: 5 })
const fn3 = withFallback(
  () => primary(),
  () => backup1(),
  () => backup2(),
)
```

## 最佳实践
- 重试谨慎：仅对幂等/可重试操作使用；注意上游限流
- 熔断及时：避免雪崩，设置合理 resetTimeout；半开放逐步恢复
- 降级优雅：为关键路径提供合理的默认值或本地数据
- 监控联动：结合 PerformanceMonitor 观察失败率与时延

