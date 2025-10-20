/**
 * 自动批处理插件
 * 自动将多个请求合并为一个批量请求
 */
import type { ApiPlugin } from '../types'

export interface AutoBatchConfig {
 /** 是否启用 */
 enabled?: boolean
 /** 批处理端点 */
 batchEndpoint: string
 /** 最大批处理大小 */
 maxBatchSize?: number
 /** 批处理间隔（毫秒） */
 batchInterval?: number
 /** 可批处理的方法名称（正则或字符串数组） */
 batchableMethods?: Array<string | RegExp>
 /** 请求转换函数 */
 transformRequest?: (calls: BatchCall[]) => any
 /** 响应转换函数 */
 transformResponse?: (response: any) => any[]
}

interface BatchCall {
 methodName: string
 params: any
 resolve: (value: any) => void
 reject: (reason: any) => void
}

/**
 * 批处理管理器
 */
class BatchManager {
 private queue: BatchCall[] = []
 private timer: NodeJS.Timeout | null = null

 constructor(
  private config: Required<AutoBatchConfig>,
  private httpClient: any,
 ) {}

 /**
  * 判断方法是否可批处理
  */
 isBatchable(methodName: string): boolean {
  if (!this.config?.batchableMethods || this.config?.batchableMethods.length === 0) {
   return true
  }

  return this.config?.batchableMethods.some((pattern) => {
   if (pattern instanceof RegExp) {
    return pattern.test(methodName)
   }
   return methodName === pattern
  })
 }

 /**
  * 添加到批处理队列
  */
 enqueue(call: BatchCall): void {
  if (!this.config?.enabled) {
   // 不批处理，直接执行
   this.executeSingle(call)
   return
  }

  if (!this.isBatchable(call.methodName)) {
   // 不可批处理，直接执行
   this.executeSingle(call)
   return
  }

  this.queue.push(call)

  // 如果达到最大批处理大小，立即执行
  if (this.queue.length >= this.config?.maxBatchSize) {
   this.flush()
   return
  }

  // 设置定时器
  if (!this.timer) {
   this.timer = setTimeout(() => {
    this.flush()
   }, this.config?.batchInterval)
  }
 }

 /**
  * 执行单个请求
  */
 private async executeSingle(call: BatchCall): Promise<void> {
  try {
   // 这里需要直接调用 HTTP 客户端
   // 注意：这是一个简化实现，实际应该通过引擎调用
   const result = await this.httpClient.request({
    url: `/api/${call.methodName}`,
    method: 'POST',
    data: call.params,
   })
   call.resolve(result.data)
  }
  catch (error) {
   call.reject(error)
  }
 }

 /**
  * 刷新批处理队列
  */
 private async flush(): Promise<void> {
  if (this.timer) {
   clearTimeout(this.timer)
   this.timer = null
  }

  if (this.queue.length === 0) {
   return
  }

  const calls = this.queue.splice(0)

  try {
   // 构建批量请求
   const batchRequest = this.config?.transformRequest
    ? this.config?.transformRequest(calls)
    : calls.map(call => ({
      method: call.methodName,
      params: call.params,
     }))

   // 发送批量请求
   const response = await this.httpClient.request({
    url: this.config?.batchEndpoint,
    method: 'POST',
    data: batchRequest,
   })

   // 解析响应
   const results = this.config?.transformResponse
    ? this.config?.transformResponse(response.data)
    : response.data

   // 分发结果
   if (Array.isArray(results) && results.length === calls.length) {
    calls.forEach((call, index) => {
     call.resolve(results[index])
    })
   }
   else {
    // 结果数量不匹配，全部失败
    const error = new Error('Batch response length mismatch')
    calls.forEach(call => call.reject(error))
   }
  }
  catch (error) {
   // 批量请求失败，全部失败
   calls.forEach(call => call.reject(error))
  }
 }

 /**
  * 销毁
  */
 destroy(): void {
  if (this.timer) {
   clearTimeout(this.timer)
   this.timer = null
  }
  // 清空队列（拒绝所有待处理请求）
  const error = new Error('Batch manager destroyed')
  this.queue.forEach(call => call.reject(error))
  this.queue = []
 }
}

/**
 * 创建自动批处理插件
 */
export function createAutoBatchPlugin(config: AutoBatchConfig): ApiPlugin {
 const fullConfig: Required<AutoBatchConfig> = {
  enabled: true,
  maxBatchSize: 10,
  batchInterval: 50,
  batchableMethods: [],
  transformRequest: undefined as any,
  transformResponse: undefined as any,
  ...config,
 }

 let batchManager: BatchManager | null = null

 return {
  name: 'auto-batch',
  version: '1.0.0',
  install(engine) {
   batchManager = new BatchManager(fullConfig, engine.httpClient)

   // 拦截 call 方法（需要通过中间件实现）
   // 注意：这是一个简化实现
   // 真实场景中应该更深入地集成到引擎调用链中

   // 在引擎销毁时清理
   const originalDestroy = engine.destroy.bind(engine)
   engine.destroy = () => {
    if (batchManager) {
     batchManager.destroy()
     batchManager = null
    }
    originalDestroy()
   }
  },
  uninstall(_engine) {
   if (batchManager) {
    batchManager.destroy()
    batchManager = null
   }
  },
 }
}

/**
 * 批处理辅助函数
 * 用于手动批处理多个请求
 */
export async function batchCalls<T = any>(
 engine: any,
 calls: Array<{ methodName: string, params?: any }>,
 batchEndpoint: string,
): Promise<T[]> {
 const response = await engine.httpClient.request({
  url: batchEndpoint,
  method: 'POST',
  data: calls.map(call => ({
   method: call.methodName,
   params: call.params || {},
  })),
 })

 return response.data
}
