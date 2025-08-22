/**
 * @fileoverview 性能监控工具模块
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import { performance } from 'node:perf_hooks'
import os from 'node:os'
import process from 'node:process'
import type { PerformanceMetrics, PerformanceConfig } from '../types'
import { logger } from './logger'

/**
 * 系统信息接口
 */
interface SystemInfo {
  /** 操作系统平台 */
  platform: string
  /** 系统架构 */
  arch: string
  /** CPU 信息 */
  cpus: os.CpuInfo[]
  /** 总内存（字节） */
  totalMemory: number
  /** 可用内存（字节） */
  freeMemory: number
  /** Node.js 版本 */
  nodeVersion: string
  /** V8 版本 */
  v8Version: string
}

/**
 * 内存使用情况接口
 */
interface MemoryUsage {
  /** RSS (Resident Set Size) - 物理内存使用量 */
  rss: number
  /** 堆总大小 */
  heapTotal: number
  /** 堆使用量 */
  heapUsed: number
  /** 外部内存使用量 */
  external: number
  /** 数组缓冲区大小 */
  arrayBuffers: number
}

/**
 * 性能测量结果接口
 */
interface PerformanceMeasurement {
  /** 测量名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 持续时间（毫秒） */
  duration: number
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private config: PerformanceConfig
  private measurements: Map<string, number> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private metrics: PerformanceMetrics = {
    startupTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    fileWatchTime: 0,
    hmrTime: 0
  }

  constructor(config: PerformanceConfig = { enabled: true, sampleInterval: 1000, verbose: false }) {
    this.config = config
    
    if (config.enabled) {
      this.startMonitoring()
    }
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    logger.debug('启动性能监控')
    
    // 记录启动时间
    this.mark('startup')
    
    // 定期收集性能指标
    const interval = setInterval(() => {
      this.collectMetrics()
    }, this.config.sampleInterval)
    
    this.intervals.set('main', interval)
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    logger.debug('停止性能监控')
    
    for (const [name, interval] of this.intervals) {
      clearInterval(interval)
      this.intervals.delete(name)
    }
    
    if (this.config.reportPath) {
      this.generateReport()
    }
  }

  /**
   * 标记时间点
   * @param name 标记名称
   */
  mark(name: string): void {
    const timestamp = performance.now()
    this.measurements.set(name, timestamp)
    
    if (this.config.verbose) {
      logger.debug(`Performance mark: ${name} at ${timestamp.toFixed(2)}ms`)
    }
  }

  /**
   * 测量两个时间点之间的持续时间
   * @param name 测量名称
   * @param startMark 开始标记
   * @param endMark 结束标记（可选，默认为当前时间）
   * @returns 测量结果
   */
  measure(name: string, startMark: string, endMark?: string): PerformanceMeasurement {
    const startTime = this.measurements.get(startMark)
    if (!startTime) {
      throw new Error(`Start mark "${startMark}" not found`)
    }

    const endTime = endMark 
      ? this.measurements.get(endMark) 
      : performance.now()
    
    if (!endTime) {
      throw new Error(`End mark "${endMark}" not found`)
    }

    const duration = endTime - startTime
    const measurement: PerformanceMeasurement = {
      name,
      startTime,
      endTime,
      duration
    }

    if (this.config.verbose) {
      logger.info(`Performance measure: ${name} took ${duration.toFixed(2)}ms`)
    }

    return measurement
  }

  /**
   * 测量函数执行时间
   * @param name 测量名称
   * @param fn 要测量的函数
   * @returns 函数返回值和执行时间
   */
  async measureFunction<T>(
    name: string, 
    fn: () => T | Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (this.config.verbose) {
        logger.info(`Function "${name}" executed in ${duration.toFixed(2)}ms`)
      }
      
      return { result, duration }
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      logger.error(`Function "${name}" failed after ${duration.toFixed(2)}ms: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 获取当前性能指标
   * @returns 性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 重置性能指标
   */
  resetMetrics(): void {
    this.measurements.clear()
    this.metrics = {
      startupTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      fileWatchTime: 0,
      hmrTime: 0
    }
  }

  /**
   * 收集性能指标
   */
  private collectMetrics(): void {
    const memUsage = process.memoryUsage()
    const startupMark = this.measurements.get('startup')
    
    this.metrics = {
      startupTime: startupMark ? performance.now() - startupMark : 0,
      memoryUsage: memUsage.heapUsed,
      cpuUsage: this.getCPUUsage(),
      fileWatchTime: 0, // 需要在文件监听时更新
      hmrTime: 0 // 需要在热更新时更新
    }
  }

  /**
   * 获取 CPU 使用率（简化版本）
   * @returns CPU 使用率百分比
   */
  private getCPUUsage(): number {
    const usage = process.cpuUsage()
    const total = usage.user + usage.system
    return total / 1000000 // 转换为秒
  }

  /**
   * 生成性能报告
   */
  private generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      measurements: Object.fromEntries(this.measurements),
      systemInfo: getSystemInfo()
    }

    logger.info('Performance Report:', report)
  }
}

/**
 * 测量函数性能的装饰器
 * @param name 测量名称
 * @returns 装饰器函数
 */
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const measureName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now()
      
      try {
        const result = await originalMethod.apply(this, args)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        logger.debug(`Method "${measureName}" executed in ${duration.toFixed(2)}ms`)
        return result
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        logger.error(`Method "${measureName}" failed after ${duration.toFixed(2)}ms`)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 获取系统信息
 * @returns 系统信息
 */
export function getSystemInfo(): SystemInfo {
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    nodeVersion: process.version,
    v8Version: process.versions.v8
  }
}

/**
 * 获取内存使用情况
 * @returns 内存使用情况
 */
export function getMemoryUsage(): MemoryUsage {
  return process.memoryUsage()
}

/**
 * 监控内存使用情况
 * @param interval 监控间隔（毫秒）
 * @param threshold 内存阈值（字节）
 * @returns 停止监控的函数
 */
export function monitorMemoryUsage(
  interval = 5000, 
  threshold = 500 * 1024 * 1024 // 500MB
): () => void {
  const intervalId = setInterval(() => {
    const memUsage = getMemoryUsage()
    const usageInMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    
    logger.debug(`Memory usage: ${usageInMB}MB (heap: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB)`)
    
    if (memUsage.heapUsed > threshold) {
      logger.warn(`Memory usage exceeded threshold: ${usageInMB}MB > ${Math.round(threshold / 1024 / 1024)}MB`)
    }
  }, interval)

  return () => {
    clearInterval(intervalId)
    logger.debug('Memory monitoring stopped')
  }
}

/**
 * 创建性能分析器
 * @param name 分析器名称
 * @returns 分析器对象
 */
export function createProfiler(name: string) {
  const startTime = performance.now()
  const startMemory = getMemoryUsage()
  
  return {
    /**
     * 结束性能分析
     * @returns 分析结果
     */
    end() {
      const endTime = performance.now()
      const endMemory = getMemoryUsage()
      const duration = endTime - startTime
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed
      
      const result = {
        name,
        duration,
        memoryDelta,
        startMemory: startMemory.heapUsed,
        endMemory: endMemory.heapUsed
      }
      
      logger.info(`Profile "${name}":`, {
        duration: `${duration.toFixed(2)}ms`,
        memoryDelta: `${Math.round(memoryDelta / 1024)}KB`,
        finalMemory: `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`
      })
      
      return result
    }
  }
}

/**
 * 等待指定时间
 * @param ms 等待时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 测量异步操作的性能
 * @param name 操作名称
 * @param operation 异步操作
 * @returns 操作结果和性能信息
 */
export async function timeAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<{ result: T; duration: number; memoryUsed: number }> {
  const profiler = createProfiler(name)
  const startMemory = getMemoryUsage().heapUsed
  
  try {
    const result = await operation()
    const { duration, memoryDelta } = profiler.end()
    
    return {
      result,
      duration,
      memoryUsed: memoryDelta
    }
  } catch (error) {
    profiler.end()
    throw error
  }
}

/**
 * 创建并发限制器
 * @param limit 并发限制数
 * @returns 限制器对象
 */
export function createConcurrencyLimiter(limit: number) {
  let running = 0
  const queue: Array<() => void> = []

  return {
    /**
     * 执行带并发限制的异步操作
     * @param operation 异步操作
     * @returns Promise
     */
    async run<T>(operation: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        const execute = async () => {
          running++
          
          try {
            const result = await operation()
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            running--
            
            // 执行队列中的下一个操作
            const next = queue.shift()
            if (next) {
              next()
            }
          }
        }

        if (running < limit) {
          execute()
        } else {
          queue.push(execute)
        }
      })
    },

    /**
     * 获取当前状态
     * @returns 状态信息
     */
    getStatus() {
      return {
        running,
        queued: queue.length,
        limit
      }
    }
  }
}

/**
 * 默认性能监控器实例
 */
export const performanceMonitor = new PerformanceMonitor()