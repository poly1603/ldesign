/**
 * 基础适配器
 * 
 * 定义框架适配器的基础接口和抽象实现
 * 为不同UI框架提供统一的适配层
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import type { FormCore } from '../core/form-core'
import type { FormConfig, FormEventCallbacks, FieldConfig } from '../types'

/**
 * 适配器配置接口
 */
export interface AdapterConfig {
  /** 适配器名称 */
  name: string
  /** 适配器版本 */
  version: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 自定义配置 */
  [key: string]: any
}

/**
 * 渲染选项接口
 */
export interface RenderOptions {
  /** 容器元素 */
  container?: HTMLElement | string
  /** 是否自动挂载 */
  autoMount?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 自定义样式 */
  style?: Record<string, string>
}

/**
 * 字段渲染器接口
 */
export interface FieldRenderer {
  /** 字段类型 */
  type: string
  /** 渲染函数 */
  render: (config: FieldConfig, value: any, onChange: (value: any) => void) => any
  /** 验证函数 */
  validate?: (value: any, config: FieldConfig) => boolean | string
}

/**
 * 基础适配器抽象类
 * 
 * 定义了所有框架适配器必须实现的基础接口
 * 提供了通用的适配器功能和生命周期管理
 */
export abstract class BaseAdapter {
  /** 适配器配置 */
  protected config: AdapterConfig

  /** 表单核心实例 */
  protected formCore: FormCore | null = null

  /** 字段渲染器映射 */
  protected fieldRenderers: Map<string, FieldRenderer> = new Map()

  /** 是否已挂载 */
  protected mounted = false

  /** 是否已销毁 */
  protected destroyed = false

  /**
   * 构造函数
   * 
   * @param config 适配器配置
   */
  constructor(config: AdapterConfig) {
    this.config = { ...config }
    this.registerBuiltinRenderers()
  }

  /**
   * 获取适配器名称
   */
  get name(): string {
    return this.config.name
  }

  /**
   * 获取适配器版本
   */
  get version(): string {
    return this.config.version
  }

  /**
   * 检查适配器是否支持当前环境
   */
  abstract isSupported(): boolean

  /**
   * 创建表单实例
   * 
   * @param formConfig 表单配置
   * @param callbacks 事件回调
   * @returns 表单实例
   */
  createForm<T = Record<string, any>>(
    formConfig: FormConfig<T>,
    callbacks: FormEventCallbacks<T> = {}
  ): FormCore<T> {
    this.checkDestroyed()

    const form = new FormCore<T>(formConfig, callbacks)
    this.formCore = form as any

    return form
  }

  /**
   * 渲染表单
   * 
   * @param form 表单实例
   * @param options 渲染选项
   * @returns 渲染结果
   */
  abstract render(form: FormCore, options?: RenderOptions): any

  /**
   * 挂载表单到DOM
   * 
   * @param form 表单实例
   * @param container 容器元素
   * @param options 渲染选项
   */
  abstract mount(form: FormCore, container: HTMLElement | string, options?: RenderOptions): void

  /**
   * 卸载表单
   */
  abstract unmount(): void

  /**
   * 注册字段渲染器
   * 
   * @param renderer 字段渲染器
   */
  registerFieldRenderer(renderer: FieldRenderer): void {
    this.checkDestroyed()
    this.fieldRenderers.set(renderer.type, renderer)
  }

  /**
   * 注销字段渲染器
   * 
   * @param type 字段类型
   */
  unregisterFieldRenderer(type: string): void {
    this.fieldRenderers.delete(type)
  }

  /**
   * 获取字段渲染器
   * 
   * @param type 字段类型
   * @returns 字段渲染器
   */
  getFieldRenderer(type: string): FieldRenderer | undefined {
    return this.fieldRenderers.get(type)
  }

  /**
   * 获取所有字段渲染器
   * 
   * @returns 字段渲染器映射
   */
  getAllFieldRenderers(): Map<string, FieldRenderer> {
    return new Map(this.fieldRenderers)
  }

  /**
   * 更新适配器配置
   * 
   * @param updates 配置更新
   */
  updateConfig(updates: Partial<AdapterConfig>): void {
    this.checkDestroyed()
    this.config = { ...this.config, ...updates }
  }

  /**
   * 获取适配器配置
   * 
   * @returns 适配器配置
   */
  getConfig(): AdapterConfig {
    return { ...this.config }
  }

  /**
   * 检查是否已挂载
   * 
   * @returns 是否已挂载
   */
  isMounted(): boolean {
    return this.mounted
  }

  /**
   * 检查是否已销毁
   * 
   * @returns 是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    if (this.destroyed) return

    // 卸载表单
    if (this.mounted) {
      this.unmount()
    }

    // 清理资源
    this.fieldRenderers.clear()
    this.formCore = null
    this.destroyed = true
  }

  /**
   * 注册内置字段渲染器
   */
  protected registerBuiltinRenderers(): void {
    // 基础输入框渲染器
    this.registerFieldRenderer({
      type: 'input',
      render: (config, value, onChange) => {
        return this.createInputElement(config, value, onChange)
      }
    })

    // 文本域渲染器
    this.registerFieldRenderer({
      type: 'textarea',
      render: (config, value, onChange) => {
        return this.createTextareaElement(config, value, onChange)
      }
    })

    // 选择框渲染器
    this.registerFieldRenderer({
      type: 'select',
      render: (config, value, onChange) => {
        return this.createSelectElement(config, value, onChange)
      }
    })

    // 单选框渲染器
    this.registerFieldRenderer({
      type: 'radio',
      render: (config, value, onChange) => {
        return this.createRadioElement(config, value, onChange)
      }
    })
  }

  /**
   * 创建输入框元素
   */
  protected createInputElement(config: FieldConfig, value: any, onChange: (value: any) => void): HTMLInputElement {
    const input = document.createElement('input')
    input.type = config.props?.type || 'text'
    input.value = value || ''
    input.placeholder = config.placeholder || ''

    input.addEventListener('input', (e) => {
      onChange((e.target as HTMLInputElement).value)
    })

    return input
  }

  /**
   * 创建文本域元素
   */
  protected createTextareaElement(config: FieldConfig, value: any, onChange: (value: any) => void): HTMLTextAreaElement {
    const textarea = document.createElement('textarea')
    textarea.value = value || ''
    textarea.placeholder = config.placeholder || ''
    textarea.rows = config.props?.rows || 3

    textarea.addEventListener('input', (e) => {
      onChange((e.target as HTMLTextAreaElement).value)
    })

    return textarea
  }

  /**
   * 创建选择框元素
   */
  protected createSelectElement(config: FieldConfig, value: any, onChange: (value: any) => void): HTMLSelectElement {
    const select = document.createElement('select')
    select.value = value || ''

    // 添加选项
    const options = config.props?.options || []
    options.forEach((option: any) => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label
      select.appendChild(optionElement)
    })

    select.addEventListener('change', (e) => {
      onChange((e.target as HTMLSelectElement).value)
    })

    return select
  }

  /**
   * 创建单选框元素
   */
  protected createRadioElement(config: FieldConfig, value: any, onChange: (value: any) => void): HTMLElement {
    const container = document.createElement('div')
    container.className = 'ldesign-radio-group'

    // 获取选项
    const options = config.options || []

    options.forEach((option: any) => {
      const radioWrapper = document.createElement('label')
      radioWrapper.className = 'ldesign-radio'

      const radioInput = document.createElement('input')
      radioInput.type = 'radio'
      radioInput.name = config.name
      radioInput.value = option.value
      radioInput.checked = value === option.value
      radioInput.className = 'ldesign-radio__input'

      const radioCircle = document.createElement('span')
      radioCircle.className = 'ldesign-radio__circle'

      const radioLabel = document.createElement('span')
      radioLabel.className = 'ldesign-radio__label'
      radioLabel.textContent = option.label

      radioInput.addEventListener('change', (e) => {
        if ((e.target as HTMLInputElement).checked) {
          onChange(option.value)
        }
      })

      radioWrapper.appendChild(radioInput)
      radioWrapper.appendChild(radioCircle)
      radioWrapper.appendChild(radioLabel)
      container.appendChild(radioWrapper)
    })

    return container
  }

  /**
   * 检查是否已销毁
   */
  protected checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error(`Adapter "${this.name}" has been destroyed`)
    }
  }

  /**
   * 调试日志
   */
  protected debugLog(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[${this.name}] ${message}`, data)
    }
  }
}
