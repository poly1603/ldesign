/**
 * 条件渲染引擎实现
 * 
 * 负责处理字段间的依赖关系、条件显示/隐藏、动态属性更新等功能
 */

import type {
  FormFieldItem,
  FormFieldConfig,
  ConditionalRenderConfig,
  ConditionalFunction,
  DynamicPropsFunction,
  EventBus,
  AnyObject
} from '../types'

/**
 * 依赖关系图节点
 */
interface DependencyNode {
  field: string
  dependsOn: Set<string>
  dependents: Set<string>
  config: ConditionalRenderConfig
  lastEvaluationResult: AnyObject
}

/**
 * 条件评估结果
 */
interface EvaluationResult {
  show?: boolean
  hide?: boolean
  disabled?: boolean
  enabled?: boolean
  required?: boolean
  optional?: boolean
  props?: AnyObject
  rules?: any[]
  options?: any[]
}

/**
 * 条件渲染引擎实现类
 */
export class ConditionEngine {
  // 依赖关系图
  private dependencyGraph = new Map<string, DependencyNode>()
  
  // 字段配置映射
  private fieldConfigs = new Map<string, FormFieldConfig>()
  
  // 当前表单数据
  private formData: AnyObject = {}
  
  // 事件总线
  private eventBus: EventBus
  
  // 评估缓存
  private evaluationCache = new Map<string, { result: EvaluationResult; timestamp: number }>()
  
  // 缓存TTL（毫秒）
  private cacheTTL = 1000
  
  // 内部状态
  private initialized = false
  private destroyed = false
  private evaluating = false
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
    this.setupEventListeners()
  }
  
  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听字段值变化
    this.eventBus.on('field:change', (event) => {
      if (event.field?.name) {
        this.handleFieldChange(event.field.name, event.value)
      }
    })
    
    // 监听表单数据变化
    this.eventBus.on('form:updated', (event) => {
      if (event.formData) {
        this.formData = event.formData
      }
    })
  }
  
  /**
   * 初始化条件引擎
   */
  public initialize(fields: FormFieldItem[]): void {
    if (this.initialized) {
      return
    }
    
    this.initialized = true
    
    // 解析字段配置并构建依赖关系图
    this.parseFields(fields)
    this.buildDependencyGraph()
    
    // 执行初始评估
    this.evaluateAllConditions()
  }
  
  /**
   * 解析字段配置
   */
  private parseFields(fields: FormFieldItem[], parentPath = ''): void {
    for (const field of fields) {
      if (field.type === 'group' && 'fields' in field) {
        // 递归处理分组字段
        this.parseFields(field.fields, parentPath)
      } else if (field.type !== 'actions' && 'name' in field) {
        // 处理普通字段
        const fieldConfig = field as FormFieldConfig
        const fieldPath = parentPath ? `${parentPath}.${fieldConfig.name}` : fieldConfig.name
        
        this.fieldConfigs.set(fieldPath, fieldConfig)
        
        // 如果字段有条件渲染配置，添加到依赖图
        if (fieldConfig.conditionalRender) {
          this.addDependencyNode(fieldPath, fieldConfig.conditionalRender)
        }
      }
    }
  }
  
  /**
   * 添加依赖节点
   */
  private addDependencyNode(field: string, config: ConditionalRenderConfig): void {
    const dependsOn = new Set<string>()
    
    // 解析依赖字段
    if (typeof config.dependsOn === 'string') {
      dependsOn.add(config.dependsOn)
    } else if (Array.isArray(config.dependsOn)) {
      config.dependsOn.forEach(dep => dependsOn.add(dep))
    }
    
    const node: DependencyNode = {
      field,
      dependsOn,
      dependents: new Set(),
      config,
      lastEvaluationResult: {}
    }
    
    this.dependencyGraph.set(field, node)
  }
  
  /**
   * 构建依赖关系图
   */
  private buildDependencyGraph(): void {
    // 构建反向依赖关系
    for (const [field, node] of this.dependencyGraph) {
      for (const dependency of node.dependsOn) {
        const dependencyNode = this.dependencyGraph.get(dependency)
        if (dependencyNode) {
          dependencyNode.dependents.add(field)
        }
      }
    }
  }
  
  /**
   * 处理字段变化
   */
  private handleFieldChange(fieldName: string, value: any): void {
    if (this.evaluating) {
      return // 避免循环评估
    }
    
    // 更新表单数据
    this.setNestedValue(this.formData, fieldName, value)
    
    // 检查该字段的条件
    this.checkConditions(fieldName, value)
  }
  
  /**
   * 检查条件
   */
  public checkConditions(fieldName: string, value: any): void {
    if (this.destroyed) {
      return
    }
    
    // 获取依赖于该字段的所有字段
    const affectedFields = this.getAffectedFields(fieldName)
    
    // 评估受影响的字段
    for (const affectedField of affectedFields) {
      this.evaluateFieldConditions(affectedField)
    }
  }
  
  /**
   * 获取受影响的字段
   */
  private getAffectedFields(fieldName: string): string[] {
    const affected = new Set<string>()
    const queue = [fieldName]
    
    while (queue.length > 0) {
      const current = queue.shift()!
      const node = this.dependencyGraph.get(current)
      
      if (node) {
        for (const dependent of node.dependents) {
          if (!affected.has(dependent)) {
            affected.add(dependent)
            queue.push(dependent)
          }
        }
      }
    }
    
    return Array.from(affected)
  }
  
  /**
   * 评估字段条件
   */
  private evaluateFieldConditions(fieldName: string): void {
    const node = this.dependencyGraph.get(fieldName)
    if (!node) {
      return
    }
    
    // 检查缓存
    const cacheKey = this.generateCacheKey(fieldName, this.formData)
    const cached = this.evaluationCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.applyEvaluationResult(fieldName, cached.result)
      return
    }
    
    try {
      this.evaluating = true
      
      const result = this.evaluateConditions(node.config, this.formData)
      
      // 缓存结果
      this.evaluationCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      })
      
      // 应用结果
      this.applyEvaluationResult(fieldName, result)
      
      // 保存最后评估结果
      node.lastEvaluationResult = result
      
    } catch (error) {
      console.error(`条件评估错误 (${fieldName}):`, error)
    } finally {
      this.evaluating = false
    }
  }
  
  /**
   * 评估条件配置
   */
  private evaluateConditions(config: ConditionalRenderConfig, formData: AnyObject): EvaluationResult {
    const result: EvaluationResult = {}
    
    // 评估显示条件
    if (config.show) {
      result.show = this.evaluateCondition(config.show, formData)
    }
    
    // 评估隐藏条件
    if (config.hide) {
      result.hide = this.evaluateCondition(config.hide, formData)
    }
    
    // 评估禁用条件
    if (config.disabled) {
      result.disabled = this.evaluateCondition(config.disabled, formData)
    }
    
    // 评估启用条件
    if (config.enabled) {
      result.enabled = this.evaluateCondition(config.enabled, formData)
    }
    
    // 评估必填条件
    if (config.required) {
      result.required = this.evaluateCondition(config.required, formData)
    }
    
    // 评估可选条件
    if (config.optional) {
      result.optional = this.evaluateCondition(config.optional, formData)
    }
    
    // 评估动态属性
    if (config.props) {
      result.props = this.evaluateDynamicProps(config.props, formData)
    }
    
    // 评估动态验证规则
    if (config.rules) {
      result.rules = config.rules(formData)
    }
    
    // 评估动态选项
    if (config.options) {
      const optionsResult = config.options(formData)
      if (optionsResult instanceof Promise) {
        // 异步选项处理
        optionsResult.then(options => {
          result.options = options
          // 触发异步更新事件
          this.eventBus.emit('condition:async-update', {
            type: 'condition:async-update',
            timestamp: Date.now(),
            id: `async_${Date.now()}`,
            data: { options }
          })
        }).catch(error => {
          console.error('异步选项加载失败:', error)
        })
      } else {
        result.options = optionsResult
      }
    }
    
    return result
  }
  
  /**
   * 评估单个条件
   */
  private evaluateCondition(condition: ConditionalFunction, formData: AnyObject): boolean {
    try {
      return condition(formData)
    } catch (error) {
      console.error('条件评估错误:', error)
      return false
    }
  }
  
  /**
   * 评估动态属性
   */
  private evaluateDynamicProps(propsFunction: DynamicPropsFunction, formData: AnyObject): AnyObject {
    try {
      return propsFunction(formData) || {}
    } catch (error) {
      console.error('动态属性评估错误:', error)
      return {}
    }
  }
  
  /**
   * 应用评估结果
   */
  private applyEvaluationResult(fieldName: string, result: EvaluationResult): void {
    const fieldConfig = this.fieldConfigs.get(fieldName)
    if (!fieldConfig) {
      return
    }
    
    // 构建更新数据
    const updates: AnyObject = {}
    
    // 处理显示/隐藏
    if (result.show !== undefined) {
      updates.hidden = !result.show
    }
    if (result.hide !== undefined) {
      updates.hidden = result.hide
    }
    
    // 处理禁用/启用
    if (result.disabled !== undefined) {
      updates.disabled = result.disabled
    }
    if (result.enabled !== undefined) {
      updates.disabled = !result.enabled
    }
    
    // 处理必填/可选
    if (result.required !== undefined) {
      updates.required = result.required
    }
    if (result.optional !== undefined) {
      updates.required = !result.optional
    }
    
    // 处理动态属性
    if (result.props) {
      updates.props = { ...fieldConfig.props, ...result.props }
    }
    
    // 处理动态验证规则
    if (result.rules) {
      updates.rules = result.rules
    }
    
    // 处理动态选项
    if (result.options) {
      if (!updates.props) {
        updates.props = { ...fieldConfig.props }
      }
      updates.props.options = result.options
    }
    
    // 触发字段更新事件
    this.eventBus.emit('condition:field-update', {
      type: 'condition:field-update',
      timestamp: Date.now(),
      id: `update_${Date.now()}`,
      field: fieldConfig,
      updates,
      evaluationResult: result
    })
    
    // 如果有onChange回调，执行它
    const conditionalRender = fieldConfig.conditionalRender
    if (conditionalRender?.onChange) {
      try {
        const fieldValue = this.getNestedValue(this.formData, fieldName)
        conditionalRender.onChange(fieldValue, this.formData)
      } catch (error) {
        console.error('onChange回调执行错误:', error)
      }
    }
  }
  
  /**
   * 评估所有条件
   */
  private evaluateAllConditions(): void {
    for (const fieldName of this.dependencyGraph.keys()) {
      this.evaluateFieldConditions(fieldName)
    }
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(fieldName: string, formData: AnyObject): string {
    const node = this.dependencyGraph.get(fieldName)
    if (!node) {
      return fieldName
    }
    
    // 只包含依赖字段的值
    const relevantData: AnyObject = {}
    for (const dependency of node.dependsOn) {
      relevantData[dependency] = this.getNestedValue(formData, dependency)
    }
    
    return `${fieldName}:${JSON.stringify(relevantData)}`
  }
  
  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: AnyObject, path: string): any {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return undefined
      }
      current = current[key]
    }
    
    return current
  }
  
  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: AnyObject, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }
  
  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.evaluationCache.clear()
  }
  
  /**
   * 获取依赖关系信息
   */
  public getDependencyInfo(): AnyObject {
    const info: AnyObject = {}
    
    for (const [field, node] of this.dependencyGraph) {
      info[field] = {
        dependsOn: Array.from(node.dependsOn),
        dependents: Array.from(node.dependents),
        lastEvaluationResult: node.lastEvaluationResult
      }
    }
    
    return info
  }
  
  /**
   * 获取调试信息
   */
  public getDebugInfo(): AnyObject {
    return {
      initialized: this.initialized,
      destroyed: this.destroyed,
      evaluating: this.evaluating,
      dependencyCount: this.dependencyGraph.size,
      cacheSize: this.evaluationCache.size,
      cacheTTL: this.cacheTTL,
      dependencyInfo: this.getDependencyInfo()
    }
  }
  
  /**
   * 销毁条件引擎
   */
  public destroy(): void {
    if (this.destroyed) {
      return
    }
    
    this.destroyed = true
    
    // 清理所有数据
    this.dependencyGraph.clear()
    this.fieldConfigs.clear()
    this.evaluationCache.clear()
    this.formData = {}
  }
}
