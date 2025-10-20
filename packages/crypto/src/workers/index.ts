/**
 * Workers Module - Worker 线程池管理
 * 
 * 提供多线程并行加密/解密处理能力
 * 支持 Web Worker (浏览器) 和 Worker Threads (Node.js)
 * 
 * @example
 * ```typescript
 * import { WorkerPool, getGlobalWorkerPool } from '@ldesign/crypto/workers'
 * 
 * // 使用全局 Worker 池
 * const pool = getGlobalWorkerPool({ size: 4 })
 * const result = await pool.encrypt('data', 'key', 'AES')
 * 
 * // 批量加密
 * const results = await pool.batchEncrypt([
 *   { data: 'data1', key: 'key1', algorithm: 'AES' },
 *   { data: 'data2', key: 'key2', algorithm: 'AES' },
 * ])
 * 
 * // 获取统计信息
 * const stats = pool.getStats()
 * 
 * ```
 */

export {
  type WorkerMessage,
  type WorkerResponse,
} from './crypto.worker'

export {
  destroyGlobalWorkerPool,
  getGlobalWorkerPool,
  WorkerPool,
  type WorkerPoolOptions,
  type WorkerPoolStats,
} from './worker-pool'
