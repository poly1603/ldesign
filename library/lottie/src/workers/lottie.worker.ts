/**
 * Lottie Web Worker
 * 在后台线程处理 CPU 密集型任务
 */

import { compressData, decompressData } from './compressor'
import { parseAnimationData, optimizeAnimationData } from './parser'

export interface WorkerMessage {
  type: 'parse' | 'compress' | 'decompress' | 'optimize'
  id: string
  data: any
  options?: any
}

export interface WorkerResponse {
  id: string
  result?: any
  error?: string
  duration?: number
}

// Worker 消息处理
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, id, data, options } = e.data
  const startTime = performance.now()

  try {
    let result: any

    switch (type) {
      case 'parse':
        // 解析动画 JSON 数据
        result = await parseAnimationData(data, options)
        break

      case 'compress':
        // 压缩动画数据
        result = await compressData(data, options)
        break

      case 'decompress':
        // 解压缩动画数据
        result = await decompressData(data, options)
        break

      case 'optimize':
        // 优化动画数据（移除隐藏层、简化路径等）
        result = await optimizeAnimationData(data, options)
        break

      default:
        throw new Error(`Unknown worker task type: ${type}`)
    }

    const duration = performance.now() - startTime

    const response: WorkerResponse = {
      id,
      result,
      duration
    }

    self.postMessage(response)
  } catch (error) {
    const response: WorkerResponse = {
      id,
      error: error instanceof Error ? error.message : String(error)
    }

    self.postMessage(response)
  }
}

// Worker 初始化完成
self.postMessage({ type: 'ready' })


