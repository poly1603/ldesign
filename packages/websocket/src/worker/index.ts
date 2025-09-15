/**
 * Web Worker相关导出
 */

export { WorkerAdapter, WebSocketWorkerProxy, WorkerMessageType } from '../adapters/worker'
export type { WorkerMessage } from '../adapters/worker'

import { WebSocketWorkerProxy } from '../adapters/worker'
import type { WebSocketConfig } from '../types'

/**
 * 创建WebSocket Worker代理
 * @param workerScript Worker脚本路径或URL
 * @param url WebSocket服务器URL
 * @param config WebSocket配置
 * @returns WebSocket Worker代理实例
 */
export async function createWebSocketWorker(
  workerScript: string | URL,
  url: string,
  config?: Partial<WebSocketConfig>
): Promise<WebSocketWorkerProxy> {
  const proxy = new WebSocketWorkerProxy(workerScript)
  await proxy.init(url, config)
  return proxy
}

/**
 * 创建内联WebSocket Worker
 * 使用Blob URL创建Worker，无需外部脚本文件
 * @param url WebSocket服务器URL
 * @param config WebSocket配置
 * @returns WebSocket Worker代理实例
 */
export async function createInlineWebSocketWorker(
  url: string,
  config?: Partial<WebSocketConfig>
): Promise<WebSocketWorkerProxy> {
  // 创建内联Worker脚本
  const workerScript = `
    // 导入WebSocket库（需要根据实际部署调整路径）
    importScripts('/dist/websocket-worker.js');
    
    // Worker脚本内容会在构建时注入
    console.log('内联WebSocket Worker已启动');
  `
  
  const blob = new Blob([workerScript], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(blob)
  
  try {
    const proxy = new WebSocketWorkerProxy(workerUrl)
    await proxy.init(url, config)
    return proxy
  } finally {
    // 清理Blob URL
    URL.revokeObjectURL(workerUrl)
  }
}

/**
 * 检查是否支持Web Worker
 * @returns 是否支持Web Worker
 */
export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined'
}

/**
 * 检查当前是否在Worker环境中
 * @returns 是否在Worker环境中
 */
export function isInWorker(): boolean {
  return typeof self !== 'undefined' && 
         typeof window === 'undefined' && 
         self.constructor.name === 'DedicatedWorkerGlobalScope'
}

/**
 * WebSocket Worker工厂类
 * 提供更高级的Worker管理功能
 */
export class WebSocketWorkerFactory {
  private static workers = new Map<string, WebSocketWorkerProxy>()
  private static workerCount = 0

  /**
   * 创建或获取WebSocket Worker
   * @param key Worker标识键
   * @param workerScript Worker脚本路径
   * @param url WebSocket服务器URL
   * @param config WebSocket配置
   * @returns WebSocket Worker代理实例
   */
  public static async getOrCreateWorker(
    key: string,
    workerScript: string | URL,
    url: string,
    config?: Partial<WebSocketConfig>
  ): Promise<WebSocketWorkerProxy> {
    if (this.workers.has(key)) {
      return this.workers.get(key)!
    }

    const worker = await createWebSocketWorker(workerScript, url, config)
    this.workers.set(key, worker)
    this.workerCount++

    return worker
  }

  /**
   * 销毁指定的Worker
   * @param key Worker标识键
   */
  public static destroyWorker(key: string): void {
    const worker = this.workers.get(key)
    if (worker) {
      worker.destroy()
      this.workers.delete(key)
      this.workerCount--
    }
  }

  /**
   * 销毁所有Worker
   */
  public static destroyAllWorkers(): void {
    this.workers.forEach(worker => worker.destroy())
    this.workers.clear()
    this.workerCount = 0
  }

  /**
   * 获取Worker数量
   * @returns 当前Worker数量
   */
  public static getWorkerCount(): number {
    return this.workerCount
  }

  /**
   * 获取所有Worker键
   * @returns Worker键数组
   */
  public static getWorkerKeys(): string[] {
    return Array.from(this.workers.keys())
  }

  /**
   * 检查Worker是否存在
   * @param key Worker标识键
   * @returns Worker是否存在
   */
  public static hasWorker(key: string): boolean {
    return this.workers.has(key)
  }
}

/**
 * 默认Worker配置
 */
export const DEFAULT_WORKER_CONFIG = {
  /** 最大Worker数量 */
  maxWorkers: 4,
  /** Worker空闲超时时间（毫秒） */
  idleTimeout: 30000,
  /** 是否自动清理空闲Worker */
  autoCleanup: true
} as const

/**
 * Worker池管理器
 * 管理多个WebSocket Worker实例
 */
export class WebSocketWorkerPool {
  private workers: WebSocketWorkerProxy[] = []
  private currentIndex = 0
  private readonly maxWorkers: number
  private readonly workerScript: string | URL

  constructor(
    workerScript: string | URL,
    maxWorkers: number = DEFAULT_WORKER_CONFIG.maxWorkers
  ) {
    this.workerScript = workerScript
    this.maxWorkers = maxWorkers
  }

  /**
   * 获取可用的Worker
   * @param url WebSocket服务器URL
   * @param config WebSocket配置
   * @returns WebSocket Worker代理实例
   */
  public async getWorker(
    url: string,
    config?: Partial<WebSocketConfig>
  ): Promise<WebSocketWorkerProxy> {
    // 如果池中没有Worker，创建新的
    if (this.workers.length === 0) {
      const worker = await createWebSocketWorker(this.workerScript, url, config)
      this.workers.push(worker)
      return worker
    }

    // 使用轮询策略选择Worker
    const worker = this.workers[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.workers.length

    return worker
  }

  /**
   * 添加新的Worker到池中
   * @param url WebSocket服务器URL
   * @param config WebSocket配置
   */
  public async addWorker(
    url: string,
    config?: Partial<WebSocketConfig>
  ): Promise<void> {
    if (this.workers.length >= this.maxWorkers) {
      throw new Error(`Worker池已达到最大数量限制: ${this.maxWorkers}`)
    }

    const worker = await createWebSocketWorker(this.workerScript, url, config)
    this.workers.push(worker)
  }

  /**
   * 移除Worker
   * @param index Worker索引
   */
  public removeWorker(index: number): void {
    if (index >= 0 && index < this.workers.length) {
      const worker = this.workers[index]
      worker.destroy()
      this.workers.splice(index, 1)
      
      // 调整当前索引
      if (this.currentIndex >= this.workers.length) {
        this.currentIndex = 0
      }
    }
  }

  /**
   * 获取池中Worker数量
   * @returns Worker数量
   */
  public getWorkerCount(): number {
    return this.workers.length
  }

  /**
   * 销毁所有Worker
   */
  public destroy(): void {
    this.workers.forEach(worker => worker.destroy())
    this.workers.length = 0
    this.currentIndex = 0
  }
}
