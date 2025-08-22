// 条件渲染器

import type {
  BuiltinConditionalFunctions,
  ConditionalContext,
  ConditionalEngine,
  ConditionalResult,
  ConditionalRule,
  ConditionalWatchCallback,
  ConditionalWatcher,
} from '../types/conditional'
import type { FormItemConfig } from '../types/field'
import type { FormData } from '../types/form'
import { get } from '../utils/common'
import { SimpleEventEmitter } from '../utils/event'

/**
 * 内置条件函数
 */
const builtinFunctions: BuiltinConditionalFunctions = {
  eq: (a, b) => a === b,
  ne: (a, b) => a !== b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  includes: (arr, item) => Array.isArray(arr) && arr.includes(item),
  excludes: (arr, item) => Array.isArray(arr) && !arr.includes(item),
  isEmpty: (value) => {
    if (value === null || value === undefined)
      return true
    if (typeof value === 'string')
      return value.trim() === ''
    if (Array.isArray(value))
      return value.length === 0
    if (typeof value === 'object')
      return Object.keys(value).length === 0
    return false
  },
  isNotEmpty: value => !builtinFunctions.isEmpty(value),
  isNumber: value => typeof value === 'number' && !isNaN(value),
  isString: value => typeof value === 'string',
  isArray: value => Array.isArray(value),
  isObject: value =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  matches: (value, pattern) => typeof value === 'string' && pattern.test(value),
  lengthEq: (value, length) => {
    const len
      = typeof value === 'string'
        ? value.length
        : Array.isArray(value)
          ? value.length
          : 0
    return len === length
  },
  lengthGt: (value, length) => {
    const len
      = typeof value === 'string'
        ? value.length
        : Array.isArray(value)
          ? value.length
          : 0
    return len > length
  },
  lengthLt: (value, length) => {
    const len
      = typeof value === 'string'
        ? value.length
        : Array.isArray(value)
          ? value.length
          : 0
    return len < length
  },
  inRange: (value, min, max) =>
    typeof value === 'number' && value >= min && value <= max,
  notInRange: (value, min, max) =>
    typeof value === 'number' && (value < min || value > max),
}

/**
 * 条件监听器实现
 */
class ConditionalWatcherImpl implements ConditionalWatcher {
  private watchers: Map<string, Set<ConditionalWatchCallback>> = new Map()

  watch(field: string, callback: ConditionalWatchCallback): void {
    if (!this.watchers.has(field)) {
      this.watchers.set(field, new Set())
    }
    this.watchers.get(field)!.add(callback)
  }

  unwatch(field: string, callback?: ConditionalWatchCallback): void {
    if (!callback) {
      this.watchers.delete(field)
      return
    }

    const fieldWatchers = this.watchers.get(field)
    if (fieldWatchers) {
      fieldWatchers.delete(callback)
      if (fieldWatchers.size === 0) {
        this.watchers.delete(field)
      }
    }
  }

  trigger(field: string, value: any): void {
    const fieldWatchers = this.watchers.get(field)
    if (fieldWatchers) {
      fieldWatchers.forEach((callback) => {
        try {
          // 这里需要从外部获取上下文，暂时传入空对象
          callback(field, value, undefined, {} as ConditionalContext)
        }
        catch (error) {
          console.error(
            `Error in conditional watcher for field "${field}":`,
            error,
          )
        }
      })
    }
  }

  getWatchedFields(): string[] {
    return Array.from(this.watchers.keys())
  }

  clear(): void {
    this.watchers.clear()
  }
}

/**
 * 条件渲染器实现
 */
export class ConditionalRenderer
  extends SimpleEventEmitter
  implements ConditionalEngine {
  private rules: Map<string, ConditionalRule> = new Map()
  private cache: Map<string, { result: ConditionalResult, timestamp: number }>
    = new Map()

  private watcher: ConditionalWatcher = new ConditionalWatcherImpl()
  private executionCounts: Map<string, number> = new Map()

  constructor() {
    super()
  }

  /**
   * 注册条件规则
   */
  registerRule(rule: ConditionalRule): void {
    this.rules.set(rule.id, rule)
    this.emit('ruleRegistered', rule)
  }

  /**
   * 移除条件规则
   */
  removeRule(id: string): void {
    const rule = this.rules.get(id)
    if (rule) {
      this.rules.delete(id)
      this.clearRuleCache(id)
      this.emit('ruleRemoved', rule)
    }
  }

  /**
   * 获取条件规则
   */
  getRule(id: string): ConditionalRule | undefined {
    return this.rules.get(id)
  }

  /**
   * 获取所有规则
   */
  getAllRules(): ConditionalRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * 执行条件检查
   */
  execute(context: ConditionalContext): ConditionalResult {
    const startTime = performance.now()
    const field = context.field
    const cacheKey = this.generateCacheKey(context)

    // 检查缓存
    if (context.field.conditionalRender?.cache !== false) {
      const cached = this.cache.get(cacheKey)
      if (
        cached
        && this.isCacheValid(cached, context.field.conditionalRender?.cacheTime)
      ) {
        return cached.result
      }
    }

    try {
      const condition = field.conditionalRender
      if (!condition) {
        return this.createResult(true, undefined, startTime)
      }

      // 获取依赖字段的值
      const dependentValues = this.getDependentValues(
        condition.dependsOn,
        context.formData,
      )

      // 执行条件判断
      const matched = condition.condition(
        context.formData,
        field,
        context.allFields,
      )

      // 执行动态配置
      let config: Partial<FormItemConfig> | undefined
      if (matched && condition.render) {
        config = condition.render(context.formData, field, context.allFields)
      }

      const result = this.createResult(
        matched,
        config,
        startTime,
        undefined,
        cacheKey,
      )

      // 缓存结果
      if (condition.cache !== false) {
        this.cache.set(cacheKey, {
          result,
          timestamp: Date.now(),
        })
      }

      // 更新执行计数
      const count = this.executionCounts.get(field.name) || 0
      this.executionCounts.set(field.name, count + 1)

      this.emit('conditionExecuted', field.name, result)
      return result
    }
    catch (error) {
      const errorResult = this.createResult(
        false,
        undefined,
        startTime,
        error.message,
      )
      this.emit('conditionError', field.name, error)
      return errorResult
    }
  }

  /**
   * 批量执行条件检查
   */
  executeBatch(contexts: ConditionalContext[]): ConditionalResult[] {
    return contexts.map(context => this.execute(context))
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 启用规则
   */
  enableRule(id: string): void {
    const rule = this.rules.get(id)
    if (rule) {
      rule.enabled = true
      this.emit('ruleEnabled', rule)
    }
  }

  /**
   * 禁用规则
   */
  disableRule(id: string): void {
    const rule = this.rules.get(id)
    if (rule) {
      rule.enabled = false
      this.emit('ruleDisabled', rule)
    }
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    this.rules.clear()
    this.cache.clear()
    this.watcher.clear()
    this.executionCounts.clear()
    this.removeAllListeners()
  }

  /**
   * 获取依赖字段的值
   */
  private getDependentValues(
    dependsOn: string | string[],
    formData: FormData,
  ): Record<string, any> {
    const dependencies = Array.isArray(dependsOn) ? dependsOn : [dependsOn]
    const values: Record<string, any> = {}

    dependencies.forEach((dep) => {
      values[dep] = get(formData, dep)
    })

    return values
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(context: ConditionalContext): string {
    const field = context.field
    const condition = field.conditionalRender
    if (!condition)
      return ''

    const dependencies = Array.isArray(condition.dependsOn)
      ? condition.dependsOn
      : [condition.dependsOn]
    const dependentValues = dependencies.map(
      dep => `${dep}:${JSON.stringify(get(context.formData, dep))}`,
    )

    return `${field.name}:${dependentValues.join('|')}`
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(
    cached: { result: ConditionalResult, timestamp: number },
    cacheTime?: number,
  ): boolean {
    const maxAge = cacheTime || 5000 // 默认5秒
    return Date.now() - cached.timestamp < maxAge
  }

  /**
   * 创建结果对象
   */
  private createResult(
    matched: boolean,
    config?: Partial<FormItemConfig>,
    startTime?: number,
    error?: string,
    cacheKey?: string,
  ): ConditionalResult {
    const endTime = performance.now()
    return {
      matched,
      config,
      timestamp: Date.now(),
      duration: startTime ? endTime - startTime : 0,
      error,
      cacheKey,
    }
  }

  /**
   * 清理规则缓存
   */
  private clearRuleCache(ruleId: string): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${ruleId}:`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    ruleCount: number
    cacheSize: number
    executionCounts: Record<string, number>
    enabledRules: number
    disabledRules: number
  } {
    const enabledRules = Array.from(this.rules.values()).filter(
      rule => rule.enabled !== false,
    ).length
    const disabledRules = this.rules.size - enabledRules

    return {
      ruleCount: this.rules.size,
      cacheSize: this.cache.size,
      executionCounts: Object.fromEntries(this.executionCounts),
      enabledRules,
      disabledRules,
    }
  }

  /**
   * 获取监听器
   */
  getWatcher(): ConditionalWatcher {
    return this.watcher
  }
}
