/**
 * WebSocket Worker脚本
 * 在Web Worker中运行WebSocket客户端
 */

import { WorkerAdapter } from '../adapters/worker'
import { createWebSocketClient } from '../factory'
import type { WebSocketConfig } from '../types'

// 全局适配器实例
let adapter: WorkerAdapter | null = null

/**
 * 初始化WebSocket适配器
 * @param url WebSocket服务器URL
 * @param config WebSocket配置
 */
function initializeAdapter(url: string, config?: Partial<WebSocketConfig>): void {
  // 创建WebSocket客户端
  const client = createWebSocketClient({ url, ...config })
  
  // 创建Worker适配器
  adapter = new WorkerAdapter(client, {
    autoConnect: false, // 在Worker中手动控制连接
    autoDisconnect: true
  })
}

/**
 * 获取适配器实例
 */
function getAdapter(): WorkerAdapter {
  if (!adapter) {
    throw new Error('WebSocket适配器未初始化，请先调用初始化方法')
  }
  return adapter
}

// 导出给Worker使用的函数
declare const self: DedicatedWorkerGlobalScope
export { initializeAdapter, getAdapter }

// 如果在Worker环境中，直接启动
if (typeof self !== 'undefined' && self.constructor.name === 'DedicatedWorkerGlobalScope') {
  console.log('WebSocket Worker已启动')
}
