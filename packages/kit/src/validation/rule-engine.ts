/**
 * 规则引擎
 * 提供复杂的业务规则验证和执行
 */

import type { BusinessRule, RuleContext, RuleEngineOptions, RuleResult } from '../types'
import { EventEmitter } from 'node:events'

/**
 * 规则引擎类
 */
export class RuleEngine extends EventEmitter {
  private rules: Map<string, BusinessRule> = new Map()
  private ruleGroups: Map<string, string[]> = new Map()
  private options: Required<RuleEngineOptions>

  constructor(options: RuleEngineOptions = {}) {
    super()

    this.options = {
      enableAsync: options.enableAsync !== false,
      enableCaching: options.enableCaching !== false,
      enableProfiling: options.enableProfiling !== false,
      maxExecutionTime: options.maxExecutionTime || 5000,
      enableParallelExecution: options.enableParallelExecution !== false,
      stopOnFirstFailure: options.stopOnFirstFailure !== false,
    }
  }

  /**
   * 添加规则
   */
  addRule(rule: BusinessRule): this {
    this.rules.set(rule.id, rule)
    this.emit('ruleAdded', rule)
    return this
  }

  /**
   * 批量添加规则
   */
  addRules(rules: BusinessRule[]): this {
    for (const rule of rules) {
      this.addRule(rule)
    }
    return this
  }

  /**
   * 移除规则
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId)
    if (removed) {
      this.emit('ruleRemoved', ruleId)
    }
    return removed
  }

  /**
   * 获取规则
   */
  getRule(ruleId: string): BusinessRule | undefined {
    return this.rules.get(ruleId)
  }

  /**
   * 创建规则组
   */
  createRuleGroup(groupName: string, ruleIds: string[]): this {
    this.ruleGroups.set(groupName, ruleIds)
    this.emit('ruleGroupCreated', { groupName, ruleIds })
    return this
  }

  /**
   * 执行单个规则
   */
  async executeRule(ruleId: string, context: RuleContext): Promise<RuleResult> {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`)
    }

    const startTime = Date.now()
    this.emit('ruleExecutionStart', { ruleId, context })

    try {
      // 检查前置条件
      if (rule.condition && !(await this.evaluateCondition(rule.condition, context))) {
        return {
          ruleId,
          success: true,
          skipped: true,
          message: 'Rule condition not met',
          executionTime: Date.now() - startTime,
        }
      }

      // 执行规则
      const result = await this.executeRuleLogic(rule, context)

      const executionTime = Date.now() - startTime

      // 检查执行时间
      if (executionTime > this.options.maxExecutionTime) {
        this.emit('ruleTimeout', { ruleId, executionTime })
      }

      const finalResult: RuleResult = {
        ruleId,
        success: result.success,
        message: result.message,
        data: result.data,
        executionTime,
        metadata: result.metadata,
      }

      this.emit('ruleExecutionEnd', finalResult)
      return finalResult
    }
    catch (error) {
      const executionTime = Date.now() - startTime
      const errorResult: RuleResult = {
        ruleId,
        success: false,
        message: `Rule execution failed: ${error}`,
        error: error as Error,
        executionTime,
      }

      this.emit('ruleExecutionError', errorResult)
      return errorResult
    }
  }

  /**
   * 执行规则组
   */
  async executeRuleGroup(groupName: string, context: RuleContext): Promise<RuleResult[]> {
    const ruleIds = this.ruleGroups.get(groupName)
    if (!ruleIds) {
      throw new Error(`Rule group not found: ${groupName}`)
    }

    this.emit('ruleGroupExecutionStart', { groupName, ruleIds, context })

    const results: RuleResult[] = []

    if (this.options.enableParallelExecution) {
      // 并行执行
      const promises = ruleIds.map(ruleId => this.executeRule(ruleId, context))
      results.push(...(await Promise.all(promises)))
    }
    else {
      // 串行执行
      for (const ruleId of ruleIds) {
        const result = await this.executeRule(ruleId, context)
        results.push(result)

        // 如果启用了"首次失败即停止"且规则失败
        if (this.options.stopOnFirstFailure && !result.success) {
          break
        }
      }
    }

    this.emit('ruleGroupExecutionEnd', { groupName, results })
    return results
  }

  /**
   * 执行所有规则
   */
  async executeAllRules(context: RuleContext): Promise<RuleResult[]> {
    const ruleIds = Array.from(this.rules.keys())
    const results: RuleResult[] = []

    for (const ruleId of ruleIds) {
      const result = await this.executeRule(ruleId, context)
      results.push(result)

      if (this.options.stopOnFirstFailure && !result.success) {
        break
      }
    }

    return results
  }

  /**
   * 验证规则依赖
   */
  validateDependencies(): { valid: boolean, errors: string[] } {
    const errors: string[] = []

    for (const [ruleId, rule] of this.rules) {
      if (rule.dependencies) {
        for (const depId of rule.dependencies) {
          if (!this.rules.has(depId)) {
            errors.push(`Rule ${ruleId} depends on non-existent rule: ${depId}`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 获取规则执行顺序
   */
  getRuleExecutionOrder(ruleIds?: string[]): string[] {
    const targetRules = ruleIds || Array.from(this.rules.keys())
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (ruleId: string): void => {
      if (visited.has(ruleId))
        return
      if (visiting.has(ruleId)) {
        throw new Error(`Circular dependency detected involving rule: ${ruleId}`)
      }

      visiting.add(ruleId)

      const rule = this.rules.get(ruleId)
      if (rule && rule.dependencies) {
        for (const depId of rule.dependencies) {
          if (targetRules.includes(depId)) {
            visit(depId)
          }
        }
      }

      visiting.delete(ruleId)
      visited.add(ruleId)
      order.push(ruleId)
    }

    for (const ruleId of targetRules) {
      visit(ruleId)
    }

    return order
  }

  /**
   * 执行规则逻辑
   */
  private async executeRuleLogic(rule: BusinessRule, context: RuleContext): Promise<RuleResult> {
    if (this.options.enableAsync && rule.async) {
      return await rule.execute(context)
    }
    else {
      return rule.execute(context)
    }
  }

  /**
   * 评估条件
   */
  private async evaluateCondition(
    condition: (context: RuleContext) => boolean | Promise<boolean>,
    context: RuleContext,
  ): Promise<boolean> {
    try {
      const result = condition(context)
      return result instanceof Promise ? await result : result
    }
    catch (error) {
      this.emit('conditionEvaluationError', { condition, context, error })
      return false
    }
  }

  /**
   * 获取规则统计信息
   */
  getStats(): {
    totalRules: number
    ruleGroups: number
    averageExecutionTime: number
    successRate: number
  } {
    // 这里应该从实际执行历史中计算统计信息
    // 为了简化，返回基本信息
    return {
      totalRules: this.rules.size,
      ruleGroups: this.ruleGroups.size,
      averageExecutionTime: 0,
      successRate: 0,
    }
  }

  /**
   * 导出规则配置
   */
  exportRules(): any {
    const rulesData = Array.from(this.rules.entries()).map(([id, rule]) => ({
      id,
      name: rule.name,
      description: rule.description,
      priority: rule.priority,
      dependencies: rule.dependencies,
      condition: rule.condition?.toString(),
      // 注意：execute函数无法序列化，需要特殊处理
    }))

    const groupsData = Array.from(this.ruleGroups.entries()).map(([name, ruleIds]) => ({
      name,
      ruleIds,
    }))

    return {
      rules: rulesData,
      groups: groupsData,
      options: this.options,
    }
  }

  /**
   * 清空所有规则
   */
  clear(): this {
    this.rules.clear()
    this.ruleGroups.clear()
    this.emit('rulesCleared')
    return this
  }

  /**
   * 获取所有规则ID
   */
  getRuleIds(): string[] {
    return Array.from(this.rules.keys())
  }

  /**
   * 获取所有规则组名称
   */
  getRuleGroupNames(): string[] {
    return Array.from(this.ruleGroups.keys())
  }

  /**
   * 检查规则是否存在
   */
  hasRule(ruleId: string): boolean {
    return this.rules.has(ruleId)
  }

  /**
   * 检查规则组是否存在
   */
  hasRuleGroup(groupName: string): boolean {
    return this.ruleGroups.has(groupName)
  }

  /**
   * 创建规则引擎实例
   */
  static create(options?: RuleEngineOptions): RuleEngine {
    return new RuleEngine(options)
  }

  /**
   * 创建带规则的规则引擎
   */
  static createWithRules(rules: BusinessRule[], options?: RuleEngineOptions): RuleEngine {
    const engine = new RuleEngine(options)
    engine.addRules(rules)
    return engine
  }
}

/**
 * 规则构建器
 */
export class RuleBuilder {
  private rule: Partial<BusinessRule> = {}

  /**
   * 设置规则ID
   */
  id(id: string): this {
    this.rule.id = id
    return this
  }

  /**
   * 设置规则名称
   */
  name(name: string): this {
    this.rule.name = name
    return this
  }

  /**
   * 设置规则描述
   */
  description(description: string): this {
    this.rule.description = description
    return this
  }

  /**
   * 设置规则优先级
   */
  priority(priority: number): this {
    this.rule.priority = priority
    return this
  }

  /**
   * 设置规则依赖
   */
  dependencies(dependencies: string[]): this {
    this.rule.dependencies = dependencies
    return this
  }

  /**
   * 设置执行条件
   */
  condition(condition: (context: RuleContext) => boolean | Promise<boolean>): this {
    this.rule.condition = condition
    return this
  }

  /**
   * 设置执行函数
   */
  execute(execute: (context: RuleContext) => RuleResult | Promise<RuleResult>): this {
    this.rule.execute = execute
    return this
  }

  /**
   * 设置为异步规则
   */
  async(async: boolean = true): this {
    this.rule.async = async
    return this
  }

  /**
   * 构建规则
   */
  build(): BusinessRule {
    if (!this.rule.id) {
      throw new Error('Rule ID is required')
    }
    if (!this.rule.execute) {
      throw new Error('Rule execute function is required')
    }

    return {
      id: this.rule.id,
      name: this.rule.name || this.rule.id,
      description: this.rule.description || '',
      priority: this.rule.priority || 0,
      dependencies: this.rule.dependencies || [],
      condition: this.rule.condition,
      execute: this.rule.execute,
      async: this.rule.async || false,
    }
  }

  /**
   * 创建规则构建器实例
   */
  static create(): RuleBuilder {
    return new RuleBuilder()
  }
}
