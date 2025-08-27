/**
 * 表单引擎核心实现
 * 
 * 负责表单的整体状态管理、生命周期控制和数据流管理
 */

import type {
  FormConfig,
  FormState,
  FormFieldItem,
  FormFieldConfig,
  AnyObject,
  ModeType,
  ThemeType,
  SizeType
} from '../types'
import { EventBus } from './event-bus'
import { StateManager } from './state-manager'
import { ValidationEngine } from './validation-engine'
import { LayoutEngine } from './layout-engine'
import { ConditionEngine } from './condition-engine'

/**
 * 表单引擎类
 * 
 * 作为表单系统的核心控制器，协调各个子系统的工作
 */
export class FormEngine {
  // 唯一标识
  public readonly id: string
  
  // 表单配置
  public config: FormConfig
  
  // 表单状态
  public state: FormState
  
  // 子系统实例
  public readonly eventBus: EventBus
  public readonly stateManager: StateManager
  public readonly validationEngine: ValidationEngine
  public readonly layoutEngine: LayoutEngine
  public readonly conditionEngine: ConditionEngine
  
  // 内部状态
  private _mounted = false
  private _destroyed = false
  private _history: Array<{ data: AnyObject; timestamp: Date; description?: string }> = []
  private _historyIndex = -1
  private _maxHistorySize = 50
  
  constructor(config: FormConfig) {
    this.id = this.generateId()
    this.config = this.normalizeConfig(config)
    
    // 初始化状态
    this.state = this.createInitialState()
    
    // 初始化子系统
    this.eventBus = new EventBus()
    this.stateManager = new StateManager(this.eventBus)
    this.validationEngine = new ValidationEngine(this.eventBus)
    this.layoutEngine = new LayoutEngine(this.eventBus)
    this.conditionEngine = new ConditionEngine(this.eventBus)
    
    // 设置事件监听
    this.setupEventListeners()
    
    // 触发创建事件
    this.eventBus.emit('form:created', {
      type: 'form:created',
      timestamp: Date.now(),
      id: this.id,
      form: this,
      formConfig: this.config
    })
  }
  
  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 标准化配置
   */
  private normalizeConfig(config: FormConfig): FormConfig {
    return {
      name: config.name || 'untitled',
      title: config.title,
      description: config.description,
      version: config.version || '1.0.0',
      fields: config.fields || [],
      layout: {
        type: 'grid',
        responsive: { enabled: true },
        calculation: {
          autoCalculate: true,
          minColumnWidth: 300,
          maxColumns: 6,
          defaultColumns: 3
        },
        section: {
          defaultRows: 1,
          expandMode: 'dropdown'
        },
        ...config.layout
      },
      validation: {
        enabled: true,
        trigger: 'change',
        showStatus: true,
        showMessage: true,
        ...config.validation
      },
      theme: {
        type: 'light',
        name: 'default',
        ...config.theme
      },
      performance: {
        debounce: {
          validation: 300,
          onChange: 100,
          autoSave: 1000
        },
        cache: {
          enabled: true,
          maxSize: 100,
          ttl: 300000
        },
        ...config.performance
      },
      ...config
    }
  }
  
  /**
   * 创建初始状态
   */
  private createInitialState(): FormState {
    return {
      // 基础状态
      isDirty: false,
      isValid: true,
      isSubmitting: false,
      isLoading: false,
      
      // 扩展状态
      isAutoSaving: false,
      hasUnsavedChanges: false,
      lastSaved: null,
      lastValidated: null,
      
      // 操作历史
      canUndo: false,
      canRedo: false,
      historyIndex: -1,
      historySize: 0,
      
      // 模式状态
      mode: 'edit',
      theme: this.config.theme?.type || 'light',
      size: 'medium',
      
      // 布局状态
      collapsed: false,
      expanded: false,
      fullscreen: false,
      
      // 网络状态
      online: navigator.onLine,
      synced: true,
      
      // 错误状态
      hasErrors: false,
      errorCount: 0,
      warningCount: 0,
      
      // 统计信息
      fieldCount: this.countFields(this.config.fields),
      visibleFieldCount: 0,
      requiredFieldCount: 0,
      completedFieldCount: 0
    }
  }
  
  /**
   * 计算字段数量
   */
  private countFields(fields: FormFieldItem[]): number {
    let count = 0
    for (const field of fields) {
      if (field.type === 'group' && 'fields' in field) {
        count += this.countFields(field.fields)
      } else if (field.type !== 'actions') {
        count++
      }
    }
    return count
  }
  
  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听在线状态变化
    window.addEventListener('online', () => {
      this.updateState({ online: true })
    })
    
    window.addEventListener('offline', () => {
      this.updateState({ online: false })
    })
    
    // 监听表单数据变化
    this.eventBus.on('field:change', (event) => {
      this.handleFieldChange(event)
    })
    
    // 监听验证结果
    this.eventBus.on('validation:complete', (event) => {
      this.handleValidationComplete(event)
    })
    
    // 监听布局变化
    this.eventBus.on('layout:updated', (event) => {
      this.handleLayoutUpdate(event)
    })
  }
  
  /**
   * 处理字段变化
   */
  private handleFieldChange(event: any): void {
    const { field, value, oldValue } = event
    
    // 更新脏状态
    if (!this.state.isDirty && value !== oldValue) {
      this.updateState({ 
        isDirty: true,
        hasUnsavedChanges: true
      })
    }
    
    // 保存历史记录
    this.saveSnapshot(`字段 ${field.name} 变更`)
    
    // 触发条件渲染检查
    this.conditionEngine.checkConditions(field.name, value)
  }
  
  /**
   * 处理验证完成
   */
  private handleValidationComplete(event: any): void {
    const { valid, errors } = event.validationResult || {}
    
    this.updateState({
      isValid: valid,
      hasErrors: !valid,
      errorCount: errors ? Object.keys(errors).length : 0,
      lastValidated: new Date()
    })
  }
  
  /**
   * 处理布局更新
   */
  private handleLayoutUpdate(event: any): void {
    const { layoutResult } = event
    
    if (layoutResult) {
      this.updateState({
        visibleFieldCount: layoutResult.visibleFields || 0
      })
    }
  }
  
  /**
   * 更新状态
   */
  public updateState(updates: Partial<FormState>): void {
    const oldState = { ...this.state }
    this.state = { ...this.state, ...updates }
    
    // 触发状态变化事件
    this.eventBus.emit('form:updated', {
      type: 'form:updated',
      timestamp: Date.now(),
      id: this.id,
      form: this,
      oldState,
      newState: this.state,
      changes: updates
    })
  }
  
  /**
   * 挂载表单
   */
  public mount(): void {
    if (this._mounted) {
      console.warn('Form is already mounted')
      return
    }
    
    this._mounted = true
    
    // 初始化各个子系统
    this.stateManager.initialize(this.config)
    this.validationEngine.initialize(this.config.validation || {})
    this.layoutEngine.initialize(this.config.layout || {})
    this.conditionEngine.initialize(this.config.fields)
    
    // 更新状态
    this.updateState({ isLoading: false })
    
    // 触发挂载事件
    this.eventBus.emit('form:mounted', {
      type: 'form:mounted',
      timestamp: Date.now(),
      id: this.id,
      form: this
    })
  }
  
  /**
   * 卸载表单
   */
  public unmount(): void {
    if (!this._mounted) {
      return
    }
    
    this._mounted = false
    
    // 清理子系统
    this.stateManager.destroy()
    this.validationEngine.destroy()
    this.layoutEngine.destroy()
    this.conditionEngine.destroy()
    
    // 触发卸载事件
    this.eventBus.emit('form:destroyed', {
      type: 'form:destroyed',
      timestamp: Date.now(),
      id: this.id,
      form: this
    })
  }
  
  /**
   * 销毁表单
   */
  public destroy(): void {
    if (this._destroyed) {
      return
    }
    
    this._destroyed = true
    
    // 卸载表单
    this.unmount()
    
    // 清理事件监听
    this.eventBus.clear()
    
    // 清理历史记录
    this._history = []
  }
  
  /**
   * 保存快照
   */
  public saveSnapshot(description?: string): void {
    const snapshot = {
      data: this.stateManager.getFormData(),
      timestamp: new Date(),
      description
    }
    
    // 移除当前位置之后的历史记录
    if (this._historyIndex < this._history.length - 1) {
      this._history = this._history.slice(0, this._historyIndex + 1)
    }
    
    // 添加新快照
    this._history.push(snapshot)
    this._historyIndex = this._history.length - 1
    
    // 限制历史记录大小
    if (this._history.length > this._maxHistorySize) {
      this._history = this._history.slice(-this._maxHistorySize)
      this._historyIndex = this._history.length - 1
    }
    
    // 更新状态
    this.updateState({
      canUndo: this._historyIndex > 0,
      canRedo: false,
      historyIndex: this._historyIndex,
      historySize: this._history.length
    })
  }
  
  /**
   * 撤销操作
   */
  public undo(): boolean {
    if (this._historyIndex <= 0) {
      return false
    }
    
    this._historyIndex--
    const snapshot = this._history[this._historyIndex]
    
    if (snapshot) {
      this.stateManager.setFormData(snapshot.data)
      
      this.updateState({
        canUndo: this._historyIndex > 0,
        canRedo: true,
        historyIndex: this._historyIndex
      })
      
      return true
    }
    
    return false
  }
  
  /**
   * 重做操作
   */
  public redo(): boolean {
    if (this._historyIndex >= this._history.length - 1) {
      return false
    }
    
    this._historyIndex++
    const snapshot = this._history[this._historyIndex]
    
    if (snapshot) {
      this.stateManager.setFormData(snapshot.data)
      
      this.updateState({
        canUndo: true,
        canRedo: this._historyIndex < this._history.length - 1,
        historyIndex: this._historyIndex
      })
      
      return true
    }
    
    return false
  }
  
  /**
   * 重置表单
   */
  public reset(): void {
    this.stateManager.reset()
    this._history = []
    this._historyIndex = -1
    
    this.updateState({
      isDirty: false,
      hasUnsavedChanges: false,
      canUndo: false,
      canRedo: false,
      historyIndex: -1,
      historySize: 0
    })
    
    this.eventBus.emit('form:reset', {
      type: 'form:reset',
      timestamp: Date.now(),
      id: this.id,
      form: this
    })
  }
  
  /**
   * 设置模式
   */
  public setMode(mode: ModeType): void {
    if (this.state.mode !== mode) {
      this.updateState({ mode })
    }
  }
  
  /**
   * 设置主题
   */
  public setTheme(theme: ThemeType): void {
    if (this.state.theme !== theme) {
      this.updateState({ theme })
    }
  }
  
  /**
   * 设置大小
   */
  public setSize(size: SizeType): void {
    if (this.state.size !== size) {
      this.updateState({ size })
    }
  }
  
  /**
   * 获取调试信息
   */
  public getDebugInfo(): AnyObject {
    return {
      id: this.id,
      config: this.config,
      state: this.state,
      mounted: this._mounted,
      destroyed: this._destroyed,
      historySize: this._history.length,
      historyIndex: this._historyIndex,
      subsystems: {
        stateManager: this.stateManager.getDebugInfo(),
        validationEngine: this.validationEngine.getDebugInfo(),
        layoutEngine: this.layoutEngine.getDebugInfo(),
        conditionEngine: this.conditionEngine.getDebugInfo()
      }
    }
  }
  
  /**
   * 检查是否已挂载
   */
  public get isMounted(): boolean {
    return this._mounted
  }
  
  /**
   * 检查是否已销毁
   */
  public get isDestroyed(): boolean {
    return this._destroyed
  }
}
