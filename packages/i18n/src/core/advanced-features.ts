/**
 * 高级功能模块
 * 
 * 提供i18n系统的高级功能和增强特性
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import { UnifiedCache } from './unified-cache'
import { UnifiedPerformanceMonitor } from './unified-performance'

/**
 * 智能预加载器
 * 
 * 基于用户行为和路由预测，智能预加载翻译资源
 */
export class SmartPreloader {
  private preloadQueue = new Set<string>()
  private preloadHistory = new Map<string, number>()
  private routePredictions = new Map<string, string[]>()
  private isPreloading = false
  private preloadWorker?: Worker

  constructor(private options: {
    maxConcurrent?: number
    predictionThreshold?: number
    useWebWorker?: boolean
  } = {}) {
    this.options = {
      maxConcurrent: 3,
      predictionThreshold: 0.7,
      useWebWorker: typeof Worker !== 'undefined',
      ...options,
    }

    if (this.options.useWebWorker) {
      this.initWebWorker()
    }
  }

  /**
   * 预测下一个可能访问的路由
   */
  predictNextRoutes(currentRoute: string): string[] {
    const predictions = this.routePredictions.get(currentRoute) || []
    const history = Array.from(this.preloadHistory.entries())
      .filter(([route]) => route !== currentRoute)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([route]) => route)

    return [...new Set([...predictions, ...history])]
  }

  /**
   * 记录路由转换
   */
  recordTransition(from: string, to: string): void {
    // 更新转换历史
    const count = this.preloadHistory.get(to) || 0
    this.preloadHistory.set(to, count + 1)

    // 更新预测模型
    const predictions = this.routePredictions.get(from) || []
    if (!predictions.includes(to)) {
      predictions.push(to)
      if (predictions.length > 5) {
        predictions.shift()
      }
      this.routePredictions.set(from, predictions)
    }
  }

  /**
   * 智能预加载
   */
  async preload(resources: string[], loader: (resource: string) => Promise<any>): Promise<void> {
    if (this.isPreloading) return

    this.isPreloading = true
    const chunks = this.chunkArray(resources, this.options.maxConcurrent!)

    for (const chunk of chunks) {
      await Promise.all(chunk.map(resource => this.preloadResource(resource, loader)))
    }

    this.isPreloading = false
  }

  /**
   * 预加载单个资源
   */
  private async preloadResource(resource: string, loader: (resource: string) => Promise<any>): Promise<void> {
    try {
      if (this.options.useWebWorker && this.preloadWorker) {
        // 使用Web Worker加载
        return new Promise((resolve, reject) => {
          const messageHandler = (e: MessageEvent) => {
            if (e.data.type === 'preload-complete' && e.data.resource === resource) {
              this.preloadWorker!.removeEventListener('message', messageHandler)
              resolve()
            } else if (e.data.type === 'preload-error' && e.data.resource === resource) {
              this.preloadWorker!.removeEventListener('message', messageHandler)
              reject(new Error(e.data.error))
            }
          }
          this.preloadWorker!.addEventListener('message', messageHandler)
          this.preloadWorker!.postMessage({ type: 'preload', resource })
        })
      } else {
        // 常规加载
        await loader(resource)
      }
    } catch (error) {
      console.warn(`Failed to preload resource: ${resource}`, error)
    }
  }

  /**
   * 初始化Web Worker
   */
  private initWebWorker(): void {
    const workerCode = `
      self.addEventListener('message', async (e) => {
        if (e.data.type === 'preload') {
          try {
            const response = await fetch(e.data.resource)
            const data = await response.json()
            self.postMessage({ 
              type: 'preload-complete', 
              resource: e.data.resource, 
              data 
            })
          } catch (error) {
            self.postMessage({ 
              type: 'preload-error', 
              resource: e.data.resource, 
              error: error.message 
            })
          }
        }
      })
    `
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    this.preloadWorker = new Worker(URL.createObjectURL(blob))
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 销毁预加载器
   */
  destroy(): void {
    if (this.preloadWorker) {
      this.preloadWorker.terminate()
    }
    this.preloadQueue.clear()
    this.preloadHistory.clear()
    this.routePredictions.clear()
  }
}

/**
 * 实时翻译同步器
 * 
 * 支持多标签页/窗口之间的翻译同步
 */
export class TranslationSynchronizer {
  private channel?: BroadcastChannel
  private localStorage = typeof window !== 'undefined' ? window.localStorage : null
  private syncKey = 'i18n-sync'
  private listeners = new Map<string, Set<(data: any) => void>>()

  constructor(private channelName: string = 'i18n-sync') {
    this.init()
  }

  private init(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      // 使用BroadcastChannel进行同步
      this.channel = new BroadcastChannel(this.channelName)
      this.channel.addEventListener('message', this.handleMessage.bind(this))
    } else if (this.localStorage) {
      // 降级到localStorage事件
      window.addEventListener('storage', this.handleStorageChange.bind(this))
    }
  }

  /**
   * 广播语言变更
   */
  broadcastLanguageChange(locale: string): void {
    const data = { type: 'language-change', locale, timestamp: Date.now() }
    
    if (this.channel) {
      this.channel.postMessage(data)
    } else if (this.localStorage) {
      this.localStorage.setItem(this.syncKey, JSON.stringify(data))
    }

    this.emit('language-change', data)
  }

  /**
   * 广播翻译更新
   */
  broadcastTranslationUpdate(updates: Record<string, any>): void {
    const data = { type: 'translation-update', updates, timestamp: Date.now() }
    
    if (this.channel) {
      this.channel.postMessage(data)
    } else if (this.localStorage) {
      this.localStorage.setItem(this.syncKey, JSON.stringify(data))
    }

    this.emit('translation-update', data)
  }

  /**
   * 监听事件
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  /**
   * 移除监听
   */
  off(event: string, listener: (data: any) => void): void {
    this.listeners.get(event)?.delete(listener)
  }

  /**
   * 处理消息
   */
  private handleMessage(event: MessageEvent): void {
    const { type, ...data } = event.data
    this.emit(type, data)
  }

  /**
   * 处理localStorage变化
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === this.syncKey && event.newValue) {
      try {
        const data = JSON.parse(event.newValue)
        this.emit(data.type, data)
      } catch (error) {
        console.error('Failed to parse sync data:', error)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in sync listener: ${error}`)
        }
      }
    }
  }

  /**
   * 销毁同步器
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close()
    } else if (this.localStorage) {
      window.removeEventListener('storage', this.handleStorageChange.bind(this))
    }
    this.listeners.clear()
  }
}

/**
 * 翻译验证器
 * 
 * 验证翻译的完整性和正确性
 */
export class TranslationValidator {
  private rules = new Map<string, (value: any, context?: any) => boolean>()
  private cache = new UnifiedCache<boolean>({ maxSize: 1000 })

  constructor() {
    this.registerDefaultRules()
  }

  /**
   * 注册默认规则
   */
  private registerDefaultRules(): void {
    // 非空验证
    this.addRule('required', (value) => {
      return value !== null && value !== undefined && value !== ''
    })

    // 类型验证
    this.addRule('string', (value) => typeof value === 'string')
    this.addRule('number', (value) => typeof value === 'number')
    this.addRule('boolean', (value) => typeof value === 'boolean')
    this.addRule('object', (value) => typeof value === 'object' && value !== null)
    this.addRule('array', (value) => Array.isArray(value))

    // 格式验证
    this.addRule('email', (value) => {
      if (typeof value !== 'string') return false
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    })

    this.addRule('url', (value) => {
      if (typeof value !== 'string') return false
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    })

    this.addRule('date', (value) => {
      if (typeof value !== 'string') return false
      return !isNaN(Date.parse(value))
    })

    // 长度验证
    this.addRule('minLength', (value, context) => {
      if (typeof value !== 'string' && !Array.isArray(value)) return false
      return value.length >= (context?.minLength || 0)
    })

    this.addRule('maxLength', (value, context) => {
      if (typeof value !== 'string' && !Array.isArray(value)) return false
      return value.length <= (context?.maxLength || Infinity)
    })

    // 插值验证
    this.addRule('hasPlaceholders', (value) => {
      if (typeof value !== 'string') return false
      return /\{\{[^}]+\}\}/.test(value)
    })

    this.addRule('validPlaceholders', (value, context) => {
      if (typeof value !== 'string') return false
      const placeholders = value.match(/\{\{([^}]+)\}\}/g) || []
      const expectedPlaceholders = context?.placeholders || []
      return placeholders.every(p => {
        const name = p.replace(/\{\{|\}\}/g, '').trim()
        return expectedPlaceholders.includes(name)
      })
    })
  }

  /**
   * 添加验证规则
   */
  addRule(name: string, validator: (value: any, context?: any) => boolean): void {
    this.rules.set(name, validator)
  }

  /**
   * 验证单个值
   */
  validate(value: any, rules: string | string[], context?: any): boolean {
    const ruleList = Array.isArray(rules) ? rules : [rules]
    const cacheKey = `${JSON.stringify(value)}-${ruleList.join(',')}-${JSON.stringify(context)}`

    // 检查缓存
    const cached = this.cache.get(cacheKey)
    if (cached !== undefined) {
      return cached
    }

    // 执行验证
    const isValid = ruleList.every(ruleName => {
      const rule = this.rules.get(ruleName)
      if (!rule) {
        console.warn(`Validation rule "${ruleName}" not found`)
        return true
      }
      return rule(value, context)
    })

    // 缓存结果
    this.cache.set(cacheKey, isValid)
    return isValid
  }

  /**
   * 验证翻译对象
   */
  validateTranslations(translations: Record<string, any>, schema: Record<string, any>): {
    valid: boolean
    errors: Array<{ path: string; message: string }>
  } {
    const errors: Array<{ path: string; message: string }> = []

    const validateRecursive = (obj: any, schemaObj: any, path: string = '') => {
      for (const key in schemaObj) {
        const fullPath = path ? `${path}.${key}` : key
        const value = obj?.[key]
        const rules = schemaObj[key]

        if (typeof rules === 'object' && !Array.isArray(rules)) {
          // 递归验证嵌套对象
          validateRecursive(value, rules, fullPath)
        } else {
          // 验证值
          const ruleList = Array.isArray(rules) ? rules : [rules]
          if (!this.validate(value, ruleList)) {
            errors.push({
              path: fullPath,
              message: `Validation failed for rules: ${ruleList.join(', ')}`,
            })
          }
        }
      }
    }

    validateRecursive(translations, schema)

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

/**
 * 翻译差异检测器
 * 
 * 检测不同语言版本之间的差异
 */
export class TranslationDiffDetector {
  /**
   * 比较两个翻译对象
   */
  diff(source: Record<string, any>, target: Record<string, any>): {
    missing: string[]
    extra: string[]
    different: Array<{ key: string; source: any; target: any }>
  } {
    const missing: string[] = []
    const extra: string[] = []
    const different: Array<{ key: string; source: any; target: any }> = []

    const sourceKeys = this.getAllKeys(source)
    const targetKeys = this.getAllKeys(target)

    // 查找缺失的键
    for (const key of sourceKeys) {
      if (!targetKeys.has(key)) {
        missing.push(key)
      } else {
        // 检查值是否不同
        const sourceValue = this.getValue(source, key)
        const targetValue = this.getValue(target, key)
        if (!this.isEqual(sourceValue, targetValue)) {
          different.push({ key, source: sourceValue, target: targetValue })
        }
      }
    }

    // 查找多余的键
    for (const key of targetKeys) {
      if (!sourceKeys.has(key)) {
        extra.push(key)
      }
    }

    return { missing, extra, different }
  }

  /**
   * 生成补丁
   */
  generatePatch(source: Record<string, any>, target: Record<string, any>): Array<{
    op: 'add' | 'remove' | 'replace'
    path: string
    value?: any
  }> {
    const patches: Array<{ op: 'add' | 'remove' | 'replace'; path: string; value?: any }> = []
    const diff = this.diff(source, target)

    // 添加缺失的键
    for (const key of diff.missing) {
      patches.push({
        op: 'add',
        path: key,
        value: this.getValue(source, key),
      })
    }

    // 移除多余的键
    for (const key of diff.extra) {
      patches.push({
        op: 'remove',
        path: key,
      })
    }

    // 替换不同的值
    for (const item of diff.different) {
      patches.push({
        op: 'replace',
        path: item.key,
        value: item.source,
      })
    }

    return patches
  }

  /**
   * 应用补丁
   */
  applyPatch(target: Record<string, any>, patches: Array<{
    op: 'add' | 'remove' | 'replace'
    path: string
    value?: any
  }>): Record<string, any> {
    const result = { ...target }

    for (const patch of patches) {
      switch (patch.op) {
        case 'add':
        case 'replace':
          this.setValue(result, patch.path, patch.value)
          break
        case 'remove':
          this.deleteValue(result, patch.path)
          break
      }
    }

    return result
  }

  /**
   * 获取所有键
   */
  private getAllKeys(obj: Record<string, any>, prefix: string = ''): Set<string> {
    const keys = new Set<string>()

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.add(fullKey)

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        const nestedKeys = this.getAllKeys(obj[key], fullKey)
        for (const nestedKey of nestedKeys) {
          keys.add(nestedKey)
        }
      }
    }

    return keys
  }

  /**
   * 获取值
   */
  private getValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current?.[key] === undefined) {
        return undefined
      }
      current = current[key]
    }

    return current
  }

  /**
   * 设置值
   */
  private setValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 删除值
   */
  private deleteValue(obj: Record<string, any>, path: string): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key]) {
        return
      }
      current = current[key]
    }

    delete current[keys[keys.length - 1]]
  }

  /**
   * 比较两个值是否相等
   */
  private isEqual(a: any, b: any): boolean {
    if (a === b) return true
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object' || a === null || b === null) return false

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!this.isEqual(a[key], b[key])) return false
    }

    return true
  }
}

/**
 * 翻译质量分析器
 */
export class TranslationQualityAnalyzer {
  private performanceMonitor: UnifiedPerformanceMonitor

  constructor() {
    this.performanceMonitor = new UnifiedPerformanceMonitor({
      enabled: true,
      sampleRate: 1, // 100%采样用于质量分析
    })
  }

  /**
   * 分析翻译质量
   */
  analyzeQuality(translations: Record<string, any>): {
    score: number
    issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }>
    suggestions: string[]
  } {
    const issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }> = []
    const scores: number[] = []

    // 检查完整性
    const completenessScore = this.checkCompleteness(translations, issues)
    scores.push(completenessScore)

    // 检查一致性
    const consistencyScore = this.checkConsistency(translations, issues)
    scores.push(consistencyScore)

    // 检查复杂度
    const complexityScore = this.checkComplexity(translations, issues)
    scores.push(complexityScore)

    // 检查性能
    const performanceScore = this.checkPerformance(translations, issues)
    scores.push(performanceScore)

    // 计算总分
    const totalScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

    // 生成建议
    const suggestions = this.generateSuggestions(issues, totalScore)

    return {
      score: totalScore,
      issues,
      suggestions,
    }
  }

  /**
   * 检查完整性
   */
  private checkCompleteness(
    translations: Record<string, any>,
    issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }>
  ): number {
    let score = 100
    const emptyKeys: string[] = []
    
    const checkRecursive = (obj: any, path: string = '') => {
      for (const key in obj) {
        const fullPath = path ? `${path}.${key}` : key
        const value = obj[key]

        if (value === null || value === undefined || value === '') {
          emptyKeys.push(fullPath)
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          checkRecursive(value, fullPath)
        }
      }
    }

    checkRecursive(translations)

    if (emptyKeys.length > 0) {
      const severity = emptyKeys.length > 10 ? 'high' : emptyKeys.length > 5 ? 'medium' : 'low'
      score -= emptyKeys.length * 5
      issues.push({
        type: 'completeness',
        severity,
        message: `Found ${emptyKeys.length} empty translation keys`,
      })
    }

    return Math.max(0, score)
  }

  /**
   * 检查一致性
   */
  private checkConsistency(
    translations: Record<string, any>,
    issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }>
  ): number {
    let score = 100
    const patterns = new Map<string, number>()
    
    const analyzePatterns = (value: string) => {
      // 检查常见的不一致模式
      const hasCapitalization = /^[A-Z]/.test(value)
      const hasPunctuation = /[.!?]$/.test(value)
      const hasPlaceholders = /\{\{[^}]+\}\}/.test(value)

      const pattern = `${hasCapitalization}-${hasPunctuation}-${hasPlaceholders}`
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1)
    }

    const processRecursive = (obj: any) => {
      for (const key in obj) {
        const value = obj[key]
        if (typeof value === 'string') {
          analyzePatterns(value)
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          processRecursive(value)
        }
      }
    }

    processRecursive(translations)

    // 检查模式分布
    const totalPatterns = Array.from(patterns.values()).reduce((sum, count) => sum + count, 0)
    const dominantPattern = Math.max(...patterns.values())
    const consistencyRatio = dominantPattern / totalPatterns

    if (consistencyRatio < 0.7) {
      score -= 30
      issues.push({
        type: 'consistency',
        severity: 'medium',
        message: 'Inconsistent formatting patterns detected across translations',
      })
    }

    return Math.max(0, score)
  }

  /**
   * 检查复杂度
   */
  private checkComplexity(
    translations: Record<string, any>,
    issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }>
  ): number {
    let score = 100
    let totalComplexity = 0
    let count = 0

    const calculateComplexity = (value: string): number => {
      const placeholders = (value.match(/\{\{[^}]+\}\}/g) || []).length
      const length = value.length
      const nestingLevel = (value.match(/[([{]/g) || []).length
      
      return placeholders * 2 + length / 50 + nestingLevel
    }

    const processRecursive = (obj: any) => {
      for (const key in obj) {
        const value = obj[key]
        if (typeof value === 'string') {
          totalComplexity += calculateComplexity(value)
          count++
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          processRecursive(value)
        }
      }
    }

    processRecursive(translations)

    const avgComplexity = count > 0 ? totalComplexity / count : 0

    if (avgComplexity > 10) {
      score -= 20
      issues.push({
        type: 'complexity',
        severity: 'medium',
        message: 'Some translations are overly complex',
      })
    }

    return Math.max(0, score)
  }

  /**
   * 检查性能
   */
  private checkPerformance(
    translations: Record<string, any>,
    issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }>
  ): number {
    const size = JSON.stringify(translations).length
    let score = 100

    // 检查大小
    if (size > 1024 * 1024) { // 1MB
      score -= 30
      issues.push({
        type: 'performance',
        severity: 'high',
        message: 'Translation file size is too large',
      })
    } else if (size > 512 * 1024) { // 512KB
      score -= 15
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: 'Translation file size could be optimized',
      })
    }

    return Math.max(0, score)
  }

  /**
   * 生成建议
   */
  private generateSuggestions(
    issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }>,
    score: number
  ): string[] {
    const suggestions: string[] = []

    if (score < 60) {
      suggestions.push('Consider a comprehensive review of your translations')
    }

    const issueTypes = new Set(issues.map(i => i.type))

    if (issueTypes.has('completeness')) {
      suggestions.push('Fill in all empty translation keys')
    }

    if (issueTypes.has('consistency')) {
      suggestions.push('Establish and follow consistent formatting guidelines')
    }

    if (issueTypes.has('complexity')) {
      suggestions.push('Simplify complex translations where possible')
    }

    if (issueTypes.has('performance')) {
      suggestions.push('Consider splitting large translation files')
    }

    if (score >= 90) {
      suggestions.push('Translation quality is excellent!')
    }

    return suggestions
  }
}

/**
 * 导出所有高级功能
 */
export const advancedFeatures = {
  SmartPreloader,
  TranslationSynchronizer,
  TranslationValidator,
  TranslationDiffDetector,
  TranslationQualityAnalyzer,
}