/**
 * 智能重试策略插件
 * 根据错误类型自动选择重试策略
 */
import type { ApiPlugin, ErrorMiddleware } from '../types'
import type { ApiErrorCode} from '../utils/ErrorCodes';
import { isRetryableError } from '../utils/ErrorCodes'

export interface SmartRetryOptions {
 /** 最大重试次数 */
 maxRetries?: number
 /** 初始延迟（毫秒） */
 initialDelay?: number
 /** 最大延迟（毫秒） */
 maxDelay?: number
 /** 退避策略 */
 backoffStrategy?: 'exponential' | 'linear' | 'fibonacci'
 /** 抖动比例 (0-1) */
 jitter?: number
 /** 自定义重试条件 */
 retryCondition?: (error: any, attempt: number) => boolean
 /** 重试回调 */
 onRetry?: (attempt: number, error: any, delay: number) => void
 /** 是否启用 */
 enabled?: boolean
}

/**
 * 计算下一次重试延迟
 */
function calculateDelay(
 attempt: number,
 strategy: 'exponential' | 'linear' | 'fibonacci',
 initialDelay: number,
 maxDelay: number,
 jitter: number,
): number {
 let delay = initialDelay

 switch (strategy) {
  case 'exponential':
   delay = initialDelay * 2**attempt
   break
  case 'linear':
   delay = initialDelay * (attempt + 1)
   break
  case 'fibonacci': {
   // 斐波那契数列：1, 1, 2, 3, 5, 8, 13, ...
   let a = 1
   let b = 1
   for (let i = 0; i < attempt; i++) {
    const temp = a + b
    a = b
    b = temp
   }
   delay = initialDelay * b
   break
  }
 }

 // 限制最大延迟
 delay = Math.min(delay, maxDelay)

 // 添加抖动
 if (jitter > 0) {
  const jitterAmount = delay * jitter
  delay = delay + (Math.random() * 2 - 1) * jitterAmount
 }

 return Math.max(0, Math.floor(delay))
}

/**
 * 智能判断错误是否可重试
 */
function shouldRetry(error: any, attempt: number, maxRetries: number): boolean {
 if (attempt >= maxRetries) {
  return false
 }

 // 检查是否是可重试的错误码
 if (error?.code && typeof error.code === 'string') {
  return isRetryableError(error.code as ApiErrorCode)
 }

 // 检查HTTP状态码
 if (error?.response?.status) {
  const status = error.response.status
  // 5xx 服务器错误、408 超时、429 限流 - 可重试
  return status >= 500 || status === 408 || status === 429
 }

 // 网络错误 - 可重试
 if (error?.message) {
  const msg = error.message.toLowerCase()
  return (
   msg.includes('network')
   || msg.includes('timeout')
   || msg.includes('econnrefused')
   || msg.includes('enotfound')
  )
 }

 return false
}

/**
 * 创建智能重试插件
 */
export function createSmartRetryPlugin(options: SmartRetryOptions = {}): ApiPlugin {
 const config = {
  enabled: true,
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffStrategy: 'exponential' as const,
  jitter: 0.1,
  ...options,
 }

 // 存储每个请求的重试状态
 const retryState = new Map<string, number>()

 const errorMiddleware: ErrorMiddleware = async (error, ctx) => {
  if (!config.enabled) {
   return
  }

  const key = `${ctx.methodName}:${JSON.stringify(ctx.params)}`
  const currentAttempt = retryState.get(key) || 0

  // 自定义重试条件
  if (config.retryCondition) {
   const shouldRetryCustom = config.retryCondition(error, currentAttempt)
   if (!shouldRetryCustom) {
    retryState.delete(key)
    return
   }
  }
  else {
   // 默认智能判断
   if (!shouldRetry(error, currentAttempt, config.maxRetries)) {
    retryState.delete(key)
    return
   }
  }

  // 计算延迟
  const delay = calculateDelay(
   currentAttempt,
   config.backoffStrategy,
   config.initialDelay,
   config.maxDelay,
   config.jitter,
  )

  // 更新重试次数
  retryState.set(key, currentAttempt + 1)

  // 触发回调
  if (config.onRetry) {
   config.onRetry(currentAttempt + 1, error, delay)
  }

  // 等待后重试
  await new Promise(resolve => setTimeout(resolve, delay))

  // 抛出错误让上层重试
  throw error
 }

 return {
  name: 'smart-retry',
  version: '1.0.0',
  install(engine) {
   engine.config.middlewares ||= {}
   engine.config.middlewares.error ||= []
   engine.config.middlewares.error.push(errorMiddleware)
  },
 }
}
