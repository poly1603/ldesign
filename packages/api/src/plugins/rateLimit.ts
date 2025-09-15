/**
 * 请求速率限制插件（令牌桶）
 */
import type { ApiPlugin } from '../types'
import { RateLimiter } from '../utils/RateLimiter'

export interface RateLimitPluginOptions {
  /** 桶容量（默认 tokensPerInterval） */
  capacity?: number
  /** 每个间隔补充的令牌数（默认 10） */
  tokensPerInterval?: number
  /** 间隔（毫秒，默认 1000） */
  intervalMs?: number
  /** 分桶策略：按方法名或自定义键进行分桶（默认方法名） */
  bucketKey?: (methodName: string) => string
}

export function createRateLimitPlugin(options: RateLimitPluginOptions = {}): ApiPlugin {
  const tokensPerInterval = options.tokensPerInterval ?? 10
  const capacity = options.capacity ?? tokensPerInterval
  const intervalMs = options.intervalMs ?? 1000
  const bucketKey = options.bucketKey ?? ((name: string) => name)

  const buckets = new Map<string, RateLimiter>()
  const getLimiter = (name: string) => {
    const key = bucketKey(name)
    if (!buckets.has(key)) {
      buckets.set(key, new RateLimiter(capacity, tokensPerInterval, intervalMs))
    }
    return buckets.get(key)!
  }

  return {
    name: 'rate-limit',
    version: '1.0.0',
    install(engine) {
      engine.config.middlewares ||= {}
      engine.config.middlewares.request ||= []

      const reqMw = async (cfg: any, ctx: any) => {
        await getLimiter(ctx.methodName).acquire()
        return cfg
      }

      engine.config.middlewares.request.push(reqMw as any)
    },
  }
}
