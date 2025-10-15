/**
 * 请求速率限制插件（令牌桶）
 */
import type { ApiPlugin } from '../types'
import { RequestThrottler } from '../utils/RequestThrottler'

export interface RateLimitPluginOptions {
 /** 每秒请求数（默认 10） */
 requestsPerSecond?: number
 /** 最大突发请求数（默认等于 requestsPerSecond） */
 maxBurst?: number
 /** 是否启用限流（默认 true） */
 enabled?: boolean
 /** 分桶策略：按方法名或自定义键进行分桶（默认方法名） */
 bucketKey?: (methodName: string) => string
}

export function createRateLimitPlugin(options: RateLimitPluginOptions = {}): ApiPlugin {
 const requestsPerSecond = options.requestsPerSecond ?? 10
 const maxBurst = options.maxBurst ?? requestsPerSecond
 const enabled = options.enabled ?? true
 const bucketKey = options.bucketKey ?? ((name: string) => name)

 const buckets = new Map<string, RequestThrottler>()
 const getLimiter = (name: string) => {
  const key = bucketKey(name)
  if (!buckets.has(key)) {
   buckets.set(key, new RequestThrottler({
    requestsPerSecond,
    maxBurst,
    enabled,
   }))
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
