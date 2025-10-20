/**
 * 模板性能监控
 */

import { onMounted, onUnmounted, reactive, readonly, ref } from 'vue'

/**
 * 性能监控 composable
 */
import { ObjectPool } from '../utils/objectPool'

export interface PerformanceMetrics {
  renderTime: number
  loadTime: number
  updateTime: number
  componentCount: number
  domNodes: number
  memory?: number
  fps?: number
}

export interface PerformanceEntry {
  name: string
  startTime: number
  duration: number
  type: 'measure' | 'mark' | 'navigation' | 'resource'
  details?: any
}

export interface MemoryInfo {
  value: number
  limit: number
  used: number
  available: number
  usagePercent: number
}

// 对象池用于复用PerformanceEntry
const entryPool = new ObjectPool<PerformanceEntry>({
  maxSize: 50,
  factory: () => ({
    name: '',
    startTime: 0,
    duration: 0,
    type: 'measure' as const
  }),
  reset: (entry) => {
    entry.name = ''
    entry.startTime = 0
    entry.duration = 0
    entry.type = 'measure'
    entry.details = undefined
  }
})

export function useTemplatePerformance(templateId: string) {
  // 性能指标
  const metrics = reactive<PerformanceMetrics>({
    renderTime: 0,
    loadTime: 0,
    updateTime: 0,
    componentCount: 0,
    domNodes: 0,
    memory: 0,
    fps: 0
  })

  // 性能条目 - 限制数组大小
  const entries = ref<PerformanceEntry[]>([])
  const MAX_ENTRIES = 100

  // 内存信息
  const memory = reactive<MemoryInfo>({
    value: 0,
    limit: 0,
    used: 0,
    available: 0,
    usagePercent: 0
  })

  // FPS 监控 - 使用环形缓冲区
  const FPS_HISTORY_SIZE = 60
  const fpsHistory = ref<number[]>(Array.from({length: FPS_HISTORY_SIZE}, () => 0))
  let fpsIndex = 0
  let rafId: number | null = null
  let lastTime = 0
  let intervalId: number | null = null

  /**
   * 开始测量
   */
  const startMeasure = (name: string) => {
    if (window.performance && window.performance.mark) {
      window.performance.mark(`${name}-start`)
    }
  }

  /**
   * 结束测量
   */
  const endMeasure = (name: string) => {
    if (window.performance && window.performance.mark && window.performance.measure) {
      const endMark = `${name}-end`
      const startMark = `${name}-start`
      
      window.performance.mark(endMark)
      
      try {
        window.performance.measure(name, startMark, endMark)
        
        const measures = window.performance.getEntriesByName(name, 'measure')
        if (measures.length > 0) {
          const measure = measures[measures.length - 1]
          
          const entry = entryPool.acquire()
          entry.name = name
          entry.startTime = measure.startTime
          entry.duration = measure.duration
          entry.type = 'measure'
          
          // 使用环形缓冲区避免频繁的数组操作
          if (entries.value.length >= MAX_ENTRIES) {
            const removed = entries.value.shift()
            if (removed) entryPool.release(removed)
          }
          entries.value.push(entry)
          
          // 更新指标
          if (name.includes('render')) {
            metrics.renderTime = Math.round(measure.duration)
          } else if (name.includes('load')) {
            metrics.loadTime = Math.round(measure.duration)
          } else if (name.includes('update')) {
            metrics.updateTime = Math.round(measure.duration)
          }
        }
        
        // 清理标记
        window.performance.clearMarks(startMark)
        window.performance.clearMarks(endMark)
        window.performance.clearMeasures(name)
      } catch (err) {
        console.warn('Performance measure failed:', err)
      }
    }
  }

  /**
   * 测量函数执行时间
   */
  const measure = async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
    startMeasure(name)
    
    try {
      const result = await fn()
      return result
    } finally {
      endMeasure(name)
    }
  }

  /**
   * 更新内存信息
   */
  const updateMemory = () => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory
      
      memory.used = memoryInfo.usedJSHeapSize
      memory.limit = memoryInfo.jsHeapSizeLimit
      memory.available = memory.limit - memory.used
      memory.usagePercent = (memory.used / memory.limit) * 100
      memory.value = memory.used
      
      metrics.memory = Math.round(memory.used / 1024 / 1024) // MB
    }
  }

  /**
   * 计算 FPS
   */
  const calculateFPS = (timestamp: number) => {
    if (!lastTime) {
      lastTime = timestamp
      rafId = requestAnimationFrame(calculateFPS)
      return
    }

    const delta = timestamp - lastTime
    const fps = Math.round(1000 / delta)
    
    // 使用环形缓冲区
    fpsHistory.value[fpsIndex] = fps
    fpsIndex = (fpsIndex + 1) % FPS_HISTORY_SIZE
    
    // 计算平均FPS - 更高效的算法
    let sum = 0
    let count = 0
    for (let i = 0; i < FPS_HISTORY_SIZE; i++) {
      if (fpsHistory.value[i] > 0) {
        sum += fpsHistory.value[i]
        count++
      }
    }
    metrics.fps = count > 0 ? Math.round(sum / count) : 0
    
    lastTime = timestamp
    rafId = requestAnimationFrame(calculateFPS)
  }

  /**
   * 开始 FPS 监控
   */
  const startFPSMonitoring = () => {
    if (!rafId) {
      rafId = requestAnimationFrame(calculateFPS)
    }
  }

  /**
   * 停止 FPS 监控
   */
  const stopFPSMonitoring = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
      lastTime = 0
    }
  }

  /**
   * 统计 DOM 节点数
   */
  const countDOMNodes = () => {
    metrics.domNodes = document.getElementsByTagName('*').length
  }

  /**
   * 获取导航性能数据
   */
  const getNavigationTiming = () => {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      
      return {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        domProcessing: timing.domComplete - timing.domLoading,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        pageLoad: timing.loadEventEnd - timing.navigationStart
      }
    }
    
    return null
  }

  /**
   * 获取资源加载性能
   */
  const getResourceTiming = () => {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource')
      
      return resources.map(resource => ({
        name: resource.name,
        type: (resource as any).initiatorType,
        duration: Math.round(resource.duration),
        size: (resource as any).transferSize || 0,
        startTime: Math.round(resource.startTime)
      }))
    }
    
    return []
  }

  /**
   * 清除性能数据
   */
  const clear = () => {
    // 释放对象池中的对象
    entries.value.forEach(entry => entryPool.release(entry))
    entries.value = []
    fpsHistory.value.fill(0)
    fpsIndex = 0
    
    // 重置指标
    metrics.renderTime = 0
    metrics.loadTime = 0
    metrics.updateTime = 0
    metrics.componentCount = 0
    metrics.domNodes = 0
    metrics.memory = 0
    metrics.fps = 0
  }

  /**
   * 获取性能指标
   */
  const getMetrics = () => {
    countDOMNodes()
    updateMemory()
    
    return {
      ...metrics,
      navigationTiming: getNavigationTiming(),
      resourceTiming: getResourceTiming(),
      entries: entries.value
    }
  }

  /**
   * 生成性能报告
   */
  const generateReport = () => {
    const report = {
      templateId,
      timestamp: Date.now(),
      metrics: getMetrics(),
      memory: { ...memory },
      fps: {
        current: metrics.fps,
        history: [...fpsHistory.value],
        average: Math.round(
          fpsHistory.value.reduce((a, b) => a + b, 0) / fpsHistory.value.length
        )
      }
    }
    
    return report
  }

  /**
   * 导出性能数据
   */
  const exportData = (format: 'json' | 'csv' = 'json') => {
    const report = generateReport()
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2)
    }
    
    // CSV 格式
    const rows = [
      ['Metric', 'Value'],
      ['Render Time', `${metrics.renderTime}ms`],
      ['Load Time', `${metrics.loadTime}ms`],
      ['Update Time', `${metrics.updateTime}ms`],
      ['Component Count', String(metrics.componentCount)],
      ['DOM Nodes', String(metrics.domNodes)],
      ['Memory Usage', `${metrics.memory}MB`],
      ['FPS', String(metrics.fps)]
    ]
    
    return rows.map(row => row.join(',')).join('\n')
  }

  // 生命周期
  onMounted(() => {
    startFPSMonitoring()
    updateMemory()
    countDOMNodes()
    
    // 定期更新
    intervalId = window.setInterval(() => {
      updateMemory()
      countDOMNodes()
    }, 1000)
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    stopFPSMonitoring()
    // 清理对象池
    entries.value.forEach(entry => entryPool.release(entry))
    entries.value = []
  })

  return {
    // 状态
    metrics: readonly(metrics),
    entries: readonly(entries),
    memory: readonly(memory),
    fpsHistory: readonly(fpsHistory),
    
    // 方法
    startMeasure,
    endMeasure,
    measure,
    clear,
    getMetrics,
    generateReport,
    exportData,
    
    // FPS 监控
    startFPSMonitoring,
    stopFPSMonitoring,
    
    // 工具
    updateMemory,
    countDOMNodes,
    getNavigationTiming,
    getResourceTiming
  }
}