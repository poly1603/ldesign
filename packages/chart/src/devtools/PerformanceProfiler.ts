/**
 * 性能分析器
 * 
 * 提供详细的性能分析功能，帮助开发者优化图表性能
 */

import { EventEmitter } from '../events/EventManager'

/**
 * 性能分析结果
 */
export interface ProfileResult {
  /** 分析名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 持续时间 */
  duration: number
  /** 内存使用 */
  memoryUsage?: {
    /** 使用的堆内存 */
    usedJSHeapSize: number
    /** 总堆内存 */
    totalJSHeapSize: number
    /** 堆内存限制 */
    jsHeapSizeLimit: number
  }
  /** 子分析 */
  children: ProfileResult[]
  /** 自定义数据 */
  data?: any
}

/**
 * 性能标记
 */
export interface PerformanceMark {
  /** 标记名称 */
  name: string
  /** 时间戳 */
  timestamp: number
  /** 标记类型 */
  type: 'start' | 'end' | 'mark'
  /** 相关数据 */
  data?: any
}

/**
 * 性能分析配置
 */
export interface ProfilerConfig {
  /** 是否启用分析 */
  enabled?: boolean
  /** 是否自动收集内存信息 */
  collectMemory?: boolean
  /** 最大分析结果数量 */
  maxResults?: number
  /** 是否启用详细模式 */
  verbose?: boolean
}

/**
 * 性能分析器
 */
export class PerformanceProfiler extends EventEmitter {
  private _config: Required<ProfilerConfig>
  private _activeProfiles: Map<string, ProfileResult> = new Map()
  private _completedProfiles: ProfileResult[] = []
  private _marks: PerformanceMark[] = []
  private _profileStack: string[] = []

  constructor(config: ProfilerConfig = {}) {
    super()
    
    this._config = {
      enabled: config.enabled ?? false,
      collectMemory: config.collectMemory ?? true,
      maxResults: config.maxResults ?? 100,
      verbose: config.verbose ?? false
    }
  }

  /**
   * 启用分析器
   */
  enable(): void {
    this._config.enabled = true
    this.mark('profiler-enabled')
  }

  /**
   * 禁用分析器
   */
  disable(): void {
    this._config.enabled = false
    this.mark('profiler-disabled')
  }

  /**
   * 开始性能分析
   * @param name - 分析名称
   * @param data - 相关数据
   */
  start(name: string, data?: any): void {
    if (!this._config.enabled) return

    const startTime = performance.now()
    const memoryUsage = this._config.collectMemory ? this._getMemoryUsage() : undefined

    const profile: ProfileResult = {
      name,
      startTime,
      endTime: 0,
      duration: 0,
      memoryUsage,
      children: [],
      data
    }

    this._activeProfiles.set(name, profile)
    this._profileStack.push(name)

    this.mark(`${name}-start`, 'start', data)
    
    if (this._config.verbose) {
      console.log(`🚀 开始分析: ${name}`)
    }
  }

  /**
   * 结束性能分析
   * @param name - 分析名称
   * @returns 分析结果
   */
  end(name: string): ProfileResult | null {
    if (!this._config.enabled) return null

    const profile = this._activeProfiles.get(name)
    if (!profile) {
      console.warn(`性能分析 "${name}" 未找到`)
      return null
    }

    const endTime = performance.now()
    profile.endTime = endTime
    profile.duration = endTime - profile.startTime

    // 更新内存使用
    if (this._config.collectMemory) {
      const endMemory = this._getMemoryUsage()
      if (profile.memoryUsage && endMemory) {
        profile.memoryUsage = endMemory
      }
    }

    // 从活跃分析中移除
    this._activeProfiles.delete(name)
    
    // 从堆栈中移除
    const stackIndex = this._profileStack.indexOf(name)
    if (stackIndex !== -1) {
      this._profileStack.splice(stackIndex, 1)
    }

    // 如果有父分析，添加为子分析
    if (this._profileStack.length > 0) {
      const parentName = this._profileStack[this._profileStack.length - 1]
      const parentProfile = this._activeProfiles.get(parentName)
      if (parentProfile) {
        parentProfile.children.push(profile)
      }
    } else {
      // 顶级分析，添加到完成列表
      this._completedProfiles.push(profile)
      
      // 限制结果数量
      if (this._completedProfiles.length > this._config.maxResults) {
        this._completedProfiles.shift()
      }
    }

    this.mark(`${name}-end`, 'end')
    this.emit('profileCompleted', profile)
    
    if (this._config.verbose) {
      console.log(`✅ 完成分析: ${name} (${profile.duration.toFixed(2)}ms)`)
    }

    return profile
  }

  /**
   * 添加性能标记
   * @param name - 标记名称
   * @param type - 标记类型
   * @param data - 相关数据
   */
  mark(name: string, type: PerformanceMark['type'] = 'mark', data?: any): void {
    if (!this._config.enabled) return

    const mark: PerformanceMark = {
      name,
      timestamp: performance.now(),
      type,
      data
    }

    this._marks.push(mark)
    
    // 使用浏览器原生 Performance API
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(name)
      } catch (error) {
        // 忽略标记错误
      }
    }

    this.emit('markAdded', mark)
  }

  /**
   * 测量两个标记之间的时间
   * @param startMark - 开始标记
   * @param endMark - 结束标记
   * @returns 持续时间
   */
  measure(startMark: string, endMark: string): number {
    if (!this._config.enabled) return 0

    const startMarkObj = this._marks.find(m => m.name === startMark)
    const endMarkObj = this._marks.find(m => m.name === endMark)

    if (!startMarkObj || !endMarkObj) {
      console.warn(`标记 "${startMark}" 或 "${endMark}" 未找到`)
      return 0
    }

    const duration = endMarkObj.timestamp - startMarkObj.timestamp
    
    // 使用浏览器原生 Performance API
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(`${startMark}-to-${endMark}`, startMark, endMark)
      } catch (error) {
        // 忽略测量错误
      }
    }

    return duration
  }

  /**
   * 获取所有完成的分析结果
   * @returns 分析结果列表
   */
  getResults(): ProfileResult[] {
    return [...this._completedProfiles]
  }

  /**
   * 获取指定名称的分析结果
   * @param name - 分析名称
   * @returns 分析结果
   */
  getResult(name: string): ProfileResult | undefined {
    return this._completedProfiles.find(profile => profile.name === name)
  }

  /**
   * 获取所有标记
   * @returns 标记列表
   */
  getMarks(): PerformanceMark[] {
    return [...this._marks]
  }

  /**
   * 清空分析结果
   */
  clear(): void {
    this._completedProfiles = []
    this._marks = []
    this._activeProfiles.clear()
    this._profileStack = []
    
    // 清空浏览器性能标记
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks()
    }
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      performance.clearMeasures()
    }
  }

  /**
   * 生成性能报告
   * @returns 性能报告
   */
  generateReport(): {
    summary: {
      totalProfiles: number
      totalDuration: number
      averageDuration: number
      slowestProfile: ProfileResult | null
      fastestProfile: ProfileResult | null
    }
    profiles: ProfileResult[]
    marks: PerformanceMark[]
  } {
    const profiles = this.getResults()
    const totalDuration = profiles.reduce((sum, profile) => sum + profile.duration, 0)
    const averageDuration = profiles.length > 0 ? totalDuration / profiles.length : 0
    
    let slowestProfile: ProfileResult | null = null
    let fastestProfile: ProfileResult | null = null
    
    for (const profile of profiles) {
      if (!slowestProfile || profile.duration > slowestProfile.duration) {
        slowestProfile = profile
      }
      if (!fastestProfile || profile.duration < fastestProfile.duration) {
        fastestProfile = profile
      }
    }

    return {
      summary: {
        totalProfiles: profiles.length,
        totalDuration,
        averageDuration,
        slowestProfile,
        fastestProfile
      },
      profiles,
      marks: this.getMarks()
    }
  }

  /**
   * 导出性能数据
   * @returns 性能数据 JSON
   */
  export(): string {
    const report = this.generateReport()
    return JSON.stringify(report, null, 2)
  }

  /**
   * 获取内存使用情况
   * @returns 内存使用信息
   */
  private _getMemoryUsage(): ProfileResult['memoryUsage'] | undefined {
    if (typeof performance !== 'undefined' && 
        'memory' in performance && 
        performance.memory) {
      const memory = performance.memory as any
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
    }
    return undefined
  }
}

/**
 * 性能分析装饰器
 * @param name - 分析名称
 * @returns 装饰器函数
 */
export function profile(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const profileName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = function (...args: any[]) {
      const profiler = new PerformanceProfiler({ enabled: true })
      profiler.start(profileName)
      
      try {
        const result = originalMethod.apply(this, args)
        
        // 处理异步方法
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            profiler.end(profileName)
          })
        }
        
        profiler.end(profileName)
        return result
      } catch (error) {
        profiler.end(profileName)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 全局性能分析器实例
 */
export const performanceProfiler = new PerformanceProfiler()

/**
 * 创建性能分析器
 * @param config - 配置
 * @returns 性能分析器实例
 */
export function createPerformanceProfiler(config?: ProfilerConfig): PerformanceProfiler {
  return new PerformanceProfiler(config)
}
