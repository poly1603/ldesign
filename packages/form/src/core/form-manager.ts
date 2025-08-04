/**
 * 表单管理器 - 统一管理表单的所有功能
 */

import type {
  FormConfig,
  FormItemConfig,
  FormState,
  FormGroup,
  FormEventType,
  FormEventData,
  FormManagerOptions,
  ItemPosition,
} from '../types'
import { EventEmitter } from '../utils/event-emitter'
import { LayoutCalculator } from './layout-calculator'
import { FormRenderer } from './form-renderer'
import { FormStateManager } from './form-state-manager'
import { ValidationEngine, ValidationEngineOptions } from './validation-engine'
import { observeResize, unobserveResize } from '../utils/resize-observer'
import { throttle, debounce } from '../utils/throttle'

export interface FormManagerEvents {
  configUpdated: { config: FormConfig }
  layoutUpdated: { positions: ItemPosition[] }
  stateChanged: { state: FormState }
  fieldChanged: { key: string; value: any; oldValue: any }
  fieldFocused: { key: string }
  fieldBlurred: { key: string }
  fieldValidated: { key: string; valid: boolean; error?: string }
  formValidated: { valid: boolean; errors: Record<string, string> }
  expandToggled: { expanded: boolean }
  modalToggled: { visible: boolean }
  groupToggled: { groupId: string; expanded: boolean }
  destroyed: {}
}

export class FormManager extends EventEmitter<FormManagerEvents> {
  private config: FormConfig
  private options: Required<FormManagerOptions>
  private container: HTMLElement
  private layoutCalculator: LayoutCalculator
  private renderer: FormRenderer
  private stateManager: FormStateManager
  private validationEngine: ValidationEngine
  
  private isExpanded = false
  private isModalVisible = false
  private groups = new Map<string, FormGroup>()
  private resizeObserver?: () => void
  private throttledResize: () => void
  private debouncedValidation: (key?: string) => void
  
  private isDestroyed = false

  constructor(
    container: HTMLElement,
    config: FormConfig,
    options: FormManagerOptions = {}
  ) {
    super()
    
    this.container = container
    this.config = config
    this.options = {
      autoResize: options.autoResize ?? true,
      autoValidate: options.autoValidate ?? true,
      persistState: options.persistState ?? false,
      storageKey: options.storageKey ?? 'form-state',
      debounceDelay: options.debounceDelay ?? 300,
      throttleDelay: options.throttleDelay ?? 100,
      enableGroups: options.enableGroups ?? true,
      enableModal: options.enableModal ?? true,
      enableExpandCollapse: options.enableExpandCollapse ?? true,
      customRenderers: options.customRenderers ?? {},
      validationOptions: options.validationOptions ?? {},
    }
    
    this.initializeComponents()
    this.setupEventListeners()
    this.setupResizeObserver()
    this.initializeGroups()
    this.loadPersistedState()
    
    // 创建节流和防抖函数
    this.throttledResize = throttle(
      this.handleResize.bind(this),
      this.options.throttleDelay
    )
    
    this.debouncedValidation = debounce(
      this.handleValidation.bind(this),
      this.options.debounceDelay
    )
    
    // 初始渲染
    this.render()
  }

  /**
   * 初始化组件
   */
  private initializeComponents(): void {
    // 初始化布局计算器
    this.layoutCalculator = new LayoutCalculator(
      this.config.layout || {},
      this.container
    )
    
    // 初始化状态管理器
    this.stateManager = new FormStateManager(
      this.config,
      this.config.behavior?.initialValues || {}
    )
    
    // 初始化验证引擎
    this.validationEngine = new ValidationEngine(
      this.config,
      this.options.validationOptions
    )
    
    // 初始化渲染器
    this.renderer = new FormRenderer(
      this.container,
      this.config,
      {
        customRenderers: this.options.customRenderers,
        onFieldChange: this.handleFieldChange.bind(this),
        onFieldFocus: this.handleFieldFocus.bind(this),
        onFieldBlur: this.handleFieldBlur.bind(this),
      }
    )
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 布局计算器事件
    this.layoutCalculator.on('positionsUpdated', (data) => {
      this.renderer.updatePositions(data.positions)
      this.emit('layoutUpdated', { positions: data.positions })
    })
    
    // 状态管理器事件
    this.stateManager.on('stateChanged', (data) => {
      this.emit('stateChanged', { state: data.state })
      if (this.options.persistState) {
        this.persistState()
      }
    })
    
    // 验证引擎事件
    this.validationEngine.on('fieldValidated', (result) => {
      this.stateManager.setFieldError(result.key, result.error)
      this.renderer.setFieldError(result.key, result.error)
      this.emit('fieldValidated', {
        key: result.key,
        valid: result.valid,
        error: result.error,
      })
    })
    
    this.validationEngine.on('formValidated', (result) => {
      Object.entries(result.errors).forEach(([key, error]) => {
        this.stateManager.setFieldError(key, error)
        this.renderer.setFieldError(key, error)
      })
      this.emit('formValidated', {
        valid: result.valid,
        errors: result.errors,
      })
    })
  }

  /**
   * 设置尺寸监听器
   */
  private setupResizeObserver(): void {
    if (!this.options.autoResize) return
    
    this.resizeObserver = observeResize(
      this.container,
      this.throttledResize
    )
  }

  /**
   * 初始化分组
   */
  private initializeGroups(): void {
    if (!this.options.enableGroups) return
    
    const groupMap = new Map<string, FormItemConfig[]>()
    
    this.config.items.forEach(item => {
      const groupId = item.group || 'default'
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, [])
      }
      groupMap.get(groupId)!.push(item)
    })
    
    groupMap.forEach((items, groupId) => {
      const group: FormGroup = {
        id: groupId,
        title: groupId === 'default' ? '' : groupId,
        items,
        expanded: true,
        visible: true,
      }
      this.groups.set(groupId, group)
    })
  }

  /**
   * 加载持久化状态
   */
  private loadPersistedState(): void {
    if (!this.options.persistState) return
    
    try {
      const stored = localStorage.getItem(this.options.storageKey)
      if (stored) {
        const state = JSON.parse(stored)
        this.stateManager.setState(state.values || {})
        this.isExpanded = state.expanded ?? false
        
        // 恢复分组状态
        if (state.groups) {
          Object.entries(state.groups).forEach(([groupId, groupState]: [string, any]) => {
            const group = this.groups.get(groupId)
            if (group) {
              group.expanded = groupState.expanded ?? true
              group.visible = groupState.visible ?? true
            }
          })
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted form state:', error)
    }
  }

  /**
   * 持久化状态
   */
  private persistState(): void {
    if (!this.options.persistState) return
    
    try {
      const state = {
        values: this.stateManager.getValues(),
        expanded: this.isExpanded,
        groups: Object.fromEntries(
          Array.from(this.groups.entries()).map(([id, group]) => [
            id,
            {
              expanded: group.expanded,
              visible: group.visible,
            },
          ])
        ),
      }
      localStorage.setItem(this.options.storageKey, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to persist form state:', error)
    }
  }

  /**
   * 处理字段变化
   */
  private handleFieldChange(key: string, value: any): void {
    const oldValue = this.stateManager.getFieldValue(key)
    this.stateManager.setFieldValue(key, value)
    this.stateManager.setFieldTouched(key, true)
    
    this.emit('fieldChanged', { key, value, oldValue })
    
    // 自动验证
    if (this.options.autoValidate) {
      this.debouncedValidation(key)
    }
  }

  /**
   * 处理字段聚焦
   */
  private handleFieldFocus(key: string): void {
    this.emit('fieldFocused', { key })
  }

  /**
   * 处理字段失焦
   */
  private handleFieldBlur(key: string): void {
    this.stateManager.setFieldTouched(key, true)
    this.emit('fieldBlurred', { key })
    
    // 失焦时验证
    if (this.options.autoValidate) {
      this.validateField(key)
    }
  }

  /**
   * 处理尺寸变化
   */
  private handleResize(): void {
    if (this.isDestroyed) return
    
    this.layoutCalculator.updateContainerSize()
    this.render()
  }

  /**
   * 处理验证
   */
  private handleValidation(key?: string): void {
    if (this.isDestroyed) return
    
    const values = this.stateManager.getValues()
    if (key) {
      this.validationEngine.validate(key, values)
    } else {
      this.validationEngine.validate(undefined, values)
    }
  }

  /**
   * 渲染表单
   */
  private render(): void {
    if (this.isDestroyed) return
    
    // 更新布局
    this.layoutCalculator.setExpanded(this.isExpanded)
    
    // 过滤可见项目
    const visibleItems = this.getVisibleItems()
    this.layoutCalculator.updateItems(visibleItems)
    
    // 渲染
    this.renderer.render()
  }

  /**
   * 获取可见项目
   */
  private getVisibleItems(): FormItemConfig[] {
    if (!this.options.enableGroups) {
      return this.config.items
    }
    
    const visibleItems: FormItemConfig[] = []
    
    this.config.items.forEach(item => {
      const groupId = item.group || 'default'
      const group = this.groups.get(groupId)
      
      if (group && group.visible && group.expanded) {
        visibleItems.push(item)
      }
    })
    
    return visibleItems
  }

  /**
   * 更新配置
   */
  updateConfig(config: FormConfig): void {
    this.config = config
    
    this.layoutCalculator.updateConfig(config.layout || {})
    this.renderer.updateConfig(config)
    this.stateManager.updateConfig(config)
    this.validationEngine.updateConfig(config)
    
    this.initializeGroups()
    this.render()
    
    this.emit('configUpdated', { config })
  }

  /**
   * 获取表单值
   */
  getValues(): Record<string, any> {
    return this.stateManager.getValues()
  }

  /**
   * 设置表单值
   */
  setValues(values: Record<string, any>): void {
    this.stateManager.setState(values)
    this.renderer.updateValues(values)
  }

  /**
   * 获取字段值
   */
  getFieldValue(key: string): any {
    return this.stateManager.getFieldValue(key)
  }

  /**
   * 设置字段值
   */
  setFieldValue(key: string, value: any): void {
    this.handleFieldChange(key, value)
    this.renderer.setFieldValue(key, value)
  }

  /**
   * 获取表单状态
   */
  getState(): FormState {
    return this.stateManager.getState()
  }

  /**
   * 验证字段
   */
  async validateField(key: string): Promise<boolean> {
    const values = this.stateManager.getValues()
    const result = await this.validationEngine.validateField(
      key,
      values[key],
      values
    )
    return result.valid
  }

  /**
   * 验证表单
   */
  async validateForm(): Promise<boolean> {
    const values = this.stateManager.getValues()
    const result = await this.validationEngine.validateForm(values)
    return result.valid
  }

  /**
   * 重置表单
   */
  reset(): void {
    this.stateManager.reset()
    this.renderer.reset()
    this.validationEngine.clearCache()
    
    // 重置展开状态
    this.isExpanded = false
    
    // 重置分组状态
    this.groups.forEach(group => {
      group.expanded = true
      group.visible = true
    })
    
    this.render()
  }

  /**
   * 清除验证错误
   */
  clearErrors(): void {
    this.stateManager.clearErrors()
    this.renderer.clearErrors()
    this.validationEngine.clearCache()
  }

  /**
   * 设置字段错误
   */
  setFieldError(key: string, error?: string): void {
    this.stateManager.setFieldError(key, error)
    this.renderer.setFieldError(key, error)
  }

  /**
   * 设置字段禁用状态
   */
  setFieldDisabled(key: string, disabled: boolean): void {
    this.renderer.setFieldDisabled(key, disabled)
  }

  /**
   * 设置字段可见性
   */
  setFieldVisible(key: string, visible: boolean): void {
    this.renderer.setFieldVisible(key, visible)
    
    // 重新计算布局
    const visibleItems = this.getVisibleItems().filter(item => 
      item.key !== key || visible
    )
    this.layoutCalculator.updateItems(visibleItems)
    this.render()
  }

  /**
   * 切换展开状态
   */
  toggleExpanded(): void {
    if (!this.options.enableExpandCollapse) return
    
    this.isExpanded = !this.isExpanded
    this.render()
    this.emit('expandToggled', { expanded: this.isExpanded })
  }

  /**
   * 设置展开状态
   */
  setExpanded(expanded: boolean): void {
    if (!this.options.enableExpandCollapse) return
    
    this.isExpanded = expanded
    this.render()
    this.emit('expandToggled', { expanded: this.isExpanded })
  }

  /**
   * 获取展开状态
   */
  isFormExpanded(): boolean {
    return this.isExpanded
  }

  /**
   * 切换模态框
   */
  toggleModal(): void {
    if (!this.options.enableModal) return
    
    this.isModalVisible = !this.isModalVisible
    this.renderer.setModalVisible(this.isModalVisible)
    this.emit('modalToggled', { visible: this.isModalVisible })
  }

  /**
   * 设置模态框可见性
   */
  setModalVisible(visible: boolean): void {
    if (!this.options.enableModal) return
    
    this.isModalVisible = visible
    this.renderer.setModalVisible(visible)
    this.emit('modalToggled', { visible })
  }

  /**
   * 获取模态框状态
   */
  isModalOpen(): boolean {
    return this.isModalVisible
  }

  /**
   * 切换分组展开状态
   */
  toggleGroup(groupId: string): void {
    if (!this.options.enableGroups) return
    
    const group = this.groups.get(groupId)
    if (group) {
      group.expanded = !group.expanded
      this.render()
      this.emit('groupToggled', { groupId, expanded: group.expanded })
    }
  }

  /**
   * 设置分组展开状态
   */
  setGroupExpanded(groupId: string, expanded: boolean): void {
    if (!this.options.enableGroups) return
    
    const group = this.groups.get(groupId)
    if (group) {
      group.expanded = expanded
      this.render()
      this.emit('groupToggled', { groupId, expanded })
    }
  }

  /**
   * 设置分组可见性
   */
  setGroupVisible(groupId: string, visible: boolean): void {
    if (!this.options.enableGroups) return
    
    const group = this.groups.get(groupId)
    if (group) {
      group.visible = visible
      this.render()
    }
  }

  /**
   * 获取分组列表
   */
  getGroups(): FormGroup[] {
    return Array.from(this.groups.values())
  }

  /**
   * 获取分组
   */
  getGroup(groupId: string): FormGroup | undefined {
    return this.groups.get(groupId)
  }

  /**
   * 聚焦字段
   */
  focusField(key: string): void {
    this.renderer.focusField(key)
  }

  /**
   * 滚动到字段
   */
  scrollToField(key: string): void {
    this.renderer.scrollToField(key)
  }

  /**
   * 获取字段元素
   */
  getFieldElement(key: string): HTMLElement | null {
    return this.renderer.getFieldElement(key)
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container
  }

  /**
   * 获取布局信息
   */
  getLayoutInfo() {
    return this.layoutCalculator.getLayoutInfo()
  }

  /**
   * 触发事件
   */
  emitEvent(type: FormEventType, data: FormEventData): void {
    this.emit(type as keyof FormManagerEvents, data as any)
  }

  /**
   * 保存状态快照
   */
  saveSnapshot(): void {
    this.stateManager.saveSnapshot()
  }

  /**
   * 撤销
   */
  undo(): boolean {
    const success = this.stateManager.undo()
    if (success) {
      this.renderer.updateValues(this.stateManager.getValues())
    }
    return success
  }

  /**
   * 重做
   */
  redo(): boolean {
    const success = this.stateManager.redo()
    if (success) {
      this.renderer.updateValues(this.stateManager.getValues())
    }
    return success
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.stateManager.canUndo()
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.stateManager.canRedo()
  }

  /**
   * 销毁表单管理器
   */
  destroy(): void {
    if (this.isDestroyed) return
    
    this.isDestroyed = true
    
    // 清理尺寸监听器
    if (this.resizeObserver) {
      this.resizeObserver()
    }
    
    // 销毁组件
    this.layoutCalculator.destroy()
    this.renderer.destroy()
    this.stateManager.destroy()
    this.validationEngine.destroy()
    
    // 清理数据
    this.groups.clear()
    
    // 移除所有事件监听器
    this.removeAllListeners()
    
    this.emit('destroyed', {})
  }
}

/**
 * 创建表单管理器
 */
export function createFormManager(
  container: HTMLElement,
  config: FormConfig,
  options?: FormManagerOptions
): FormManager {
  return new FormManager(container, config, options)
}

/**
 * 表单管理器工厂函数
 */
export function createForm(
  selector: string | HTMLElement,
  config: FormConfig,
  options?: FormManagerOptions
): FormManager {
  const container = typeof selector === 'string'
    ? document.querySelector(selector) as HTMLElement
    : selector
    
  if (!container) {
    throw new Error('Container element not found')
  }
  
  return new FormManager(container, config, options)
}