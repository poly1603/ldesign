/**
 * 模板性能监控
 */

import { ref, reactive, computed, readonly, onMounted, onUnmounted } from 'vue'

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

/**
 * 性能监控 composable
 */
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

  // 性能条目
  const entries = ref<PerformanceEntry[]>([])

  // 内存信息
  const memory = reactive<MemoryInfo>({
    value: 0,
    limit: 0,
    used: 0,
    available: 0,
    usagePercent: 0
  })

  // FPS 监控
  const fpsHistory = ref<number[]>([])
  let rafId: number | null = null
  let lastTime = 0

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
          
          entries.value.push({
            name,
            startTime: measure.startTime,
            duration: measure.duration,
            type: 'measure'
          })
          
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
    
    fpsHistory.value.push(fps)
    if (fpsHistory.value.length > 60) {
      fpsHistory.value.shift()
    }
    
    metrics.fps = Math.round(
      fpsHistory.value.reduce((a, b) => a + b, 0) / fpsHistory.value.length
    )
    
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
    entries.value = []
    fpsHistory.value = []
    
    Object.keys(metrics).forEach(key => {
      (metrics as any)[key] = 0
    })
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
    const interval = setInterval(() => {
      updateMemory()
      countDOMNodes()
    }, 1000)
    
    onUnmounted(() => {
      clearInterval(interval)
      stopFPSMonitoring()
    })
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