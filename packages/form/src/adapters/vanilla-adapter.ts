/**
 * 原生JavaScript适配器
 * 
 * 为原生JavaScript环境提供表单渲染和交互功能
 * 不依赖任何UI框架，直接操作DOM元素
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { BaseAdapter } from './base-adapter'
import type { FormCore } from '../core/form-core'
import type { RenderOptions, AdapterConfig } from './base-adapter'
import type { FieldConfig, LayoutConfig } from '../types'
import {
  calculateHorizontalGridStyles,
  calculateHorizontalFieldStyles,
  generateHorizontalLayoutClasses,
  DEFAULT_LAYOUT_CONFIG,
  calculateVisibleFields,
  calculateHiddenFieldsCount,
  generateCollapseButtonHTML,
  calculateButtonPosition,
  applyCollapseAnimation
} from '../utils/layout'

/**
 * 原生JavaScript适配器类
 * 
 * 提供完整的原生JavaScript表单渲染功能，包括：
 * - DOM元素创建和管理
 * - 事件绑定和处理
 * - 样式应用
 * - 表单验证显示
 */
export class VanillaAdapter extends BaseAdapter {
  /** 表单容器元素 */
  private container: HTMLElement | null = null

  /** 表单根元素 */
  private formElement: HTMLFormElement | null = null

  /** 字段元素映射 */
  private fieldElements: Map<string, HTMLElement> = new Map()

  /** 错误显示元素映射 */
  private errorElements: Map<string, HTMLElement> = new Map()

  /** 展开状态 */
  private isExpanded: boolean = false

  /** 展开/收起按钮元素 */
  private collapseButton: HTMLElement | null = null

  /** 可折叠字段容器 */
  private collapsibleContainer: HTMLElement | null = null

  /**
   * 构造函数
   * 
   * @param config 适配器配置
   */
  constructor(config: Partial<AdapterConfig> = {}) {
    super({
      name: 'vanilla',
      version: '2.0.0',
      ...config
    })
  }

  /**
   * 检查是否支持当前环境
   */
  isSupported(): boolean {
    return typeof document !== 'undefined' && typeof HTMLElement !== 'undefined'
  }

  /**
   * 渲染表单
   * 
   * @param form 表单实例
   * @param options 渲染选项
   * @returns 表单DOM元素
   */
  render(form: FormCore, options: RenderOptions = {}): HTMLFormElement {
    this.checkDestroyed()

    if (!this.isSupported()) {
      throw new Error('VanillaAdapter is not supported in this environment')
    }

    // 创建表单元素
    this.formElement = this.createFormElement(form, options)

    // 绑定表单事件
    this.bindFormEvents(form)

    // 渲染字段
    this.renderFields(form)

    this.debugLog('Form rendered', { formId: form.id })

    return this.formElement
  }

  /**
   * 挂载表单到DOM
   * 
   * @param form 表单实例
   * @param container 容器元素或选择器
   * @param options 渲染选项
   */
  mount(form: FormCore, container: HTMLElement | string, options: RenderOptions = {}): void {
    this.checkDestroyed()

    // 获取容器元素
    if (typeof container === 'string') {
      this.container = document.querySelector(container)
      if (!this.container) {
        throw new Error(`Container element not found: ${container}`)
      }
    } else {
      this.container = container
    }

    // 渲染表单
    const formElement = this.render(form, options)

    // 挂载到容器
    this.container.appendChild(formElement)
    this.mounted = true

    this.debugLog('Form mounted', { container: this.container })
  }

  /**
   * 卸载表单
   */
  unmount(): void {
    if (!this.mounted) return

    // 移除表单元素
    if (this.formElement && this.formElement.parentNode) {
      this.formElement.parentNode.removeChild(this.formElement)
    }

    // 清理资源
    this.cleanup()
    this.mounted = false

    this.debugLog('Form unmounted')
  }

  /**
   * 创建表单元素
   */
  private createFormElement(form: FormCore, options: RenderOptions): HTMLFormElement {
    const formElement = document.createElement('form')
    const layoutConfig = form.config.layout || DEFAULT_LAYOUT_CONFIG

    // 基础类名
    let className = `ldesign-form ${options.className || ''}`

    // 添加布局相关类名
    if (layoutConfig.mode === 'horizontal') {
      const containerWidth = this.getContainerWidth()
      const layoutClasses = generateHorizontalLayoutClasses(layoutConfig, containerWidth)
      className += ' ' + layoutClasses.join(' ')

      // 添加标签对齐类名
      if (layoutConfig.labelAlign) {
        className += ` ldesign-form--label-${layoutConfig.labelAlign}`
      }
    } else {
      className += ' ldesign-form--vertical'
    }

    formElement.className = className
    formElement.id = form.id
    formElement.setAttribute('data-adapter', 'vanilla')

    // 应用布局样式
    this.applyLayoutStyles(formElement, layoutConfig)

    // 应用自定义样式
    if (options.style) {
      Object.assign(formElement.style, options.style)
    }

    // 阻止默认提交行为
    formElement.addEventListener('submit', (e) => {
      e.preventDefault()
    })

    return formElement
  }

  /**
   * 绑定表单事件
   */
  private bindFormEvents(form: FormCore): void {
    // 监听表单数据变化
    form.on('field:change', ({ name, value }) => {
      this.updateFieldValue(name, value)
    })

    // 监听验证状态变化
    form.on('validation:complete', (result) => {
      this.updateValidationDisplay(result)
    })

    // 监听表单状态变化
    form.on('state:change', (state) => {
      this.updateFormState(state)
    })
  }

  /**
   * 渲染字段
   */
  private renderFields(form: FormCore): void {
    const fieldNames = form.fieldManager.getFieldNames()
    const layoutConfig = form.config.layout || DEFAULT_LAYOUT_CONFIG
    const allFields = fieldNames.map(name => form.fieldManager.getFieldConfig(name)).filter(Boolean) as FieldConfig[]

    // 检查是否启用展开/收起功能
    if (layoutConfig.collapsible?.enabled) {
      this.renderCollapsibleFields(allFields, form)
    } else {
      // 正常渲染所有字段
      allFields.forEach(fieldConfig => {
        this.renderField(fieldConfig, form)
      })
    }
  }

  /**
   * 渲染可折叠字段
   */
  private renderCollapsibleFields(fields: FieldConfig[], form: FormCore): void {
    const layoutConfig = form.config.layout || DEFAULT_LAYOUT_CONFIG
    const visibleFields = calculateVisibleFields(fields, layoutConfig, this.isExpanded)

    // 渲染所有字段，但为隐藏字段添加特殊类名
    fields.forEach((fieldConfig, index) => {
      const fieldElement = this.createFieldElement(fieldConfig, form)

      // 检查当前字段是否在可见字段列表中
      const isVisible = visibleFields.includes(fieldConfig)

      // 如果是隐藏字段，添加可折叠类名
      if (!isVisible) {
        fieldElement.classList.add('ldesign-form-field-collapsible')
        if (!this.isExpanded) {
          fieldElement.classList.add('collapsed')
        }
      }

      this.formElement!.appendChild(fieldElement)
    })

    // 创建操作按钮组（包含展开/收起、重置、提交按钮）
    const hiddenCount = calculateHiddenFieldsCount(fields, layoutConfig)
    this.createActionButtons(layoutConfig, hiddenCount, fields, form)
  }



  /**
   * 创建操作按钮组（展开/收起、重置、提交）
   */
  private createActionButtons(layoutConfig: LayoutConfig, hiddenCount: number, fields: FieldConfig[], form: FormCore): void {
    // 创建按钮组容器作为表单项
    const buttonGroupContainer = document.createElement('div')
    buttonGroupContainer.className = 'ldesign-form-item ldesign-form-actions'

    // 创建按钮组内容容器
    const buttonsContainer = document.createElement('div')
    buttonsContainer.className = 'ldesign-form-control'

    // 创建按钮组
    const buttonGroup = document.createElement('div')
    buttonGroup.className = 'ldesign-form-button-group'

    // 1. 创建展开/收起按钮（如果有隐藏字段）
    if (hiddenCount > 0) {
      const collapseButtonContainer = this.createCollapseButtonElement(layoutConfig, hiddenCount)
      buttonGroup.appendChild(collapseButtonContainer)

      // 绑定展开/收起事件
      const actualButton = collapseButtonContainer.querySelector('.ldesign-form-collapse-button') as HTMLElement
      if (actualButton) {
        actualButton.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.toggleCollapse(layoutConfig, fields)
        })
      } else {
        console.error('Could not find .ldesign-form-collapse-button element')
      }
    }

    // 2. 创建重置按钮
    const resetButton = document.createElement('button')
    resetButton.type = 'button'
    resetButton.className = 'ldesign-form-button ldesign-form-button--secondary'
    resetButton.textContent = '重置'
    resetButton.addEventListener('click', () => {
      form.reset()
    })
    buttonGroup.appendChild(resetButton)

    // 3. 创建提交按钮
    const submitButton = document.createElement('button')
    submitButton.type = 'button'
    submitButton.className = 'ldesign-form-button ldesign-form-button--primary'
    submitButton.textContent = '提交'
    submitButton.addEventListener('click', () => {
      const data = form.getData()
      console.log('提交数据:', data)
    })
    buttonGroup.appendChild(submitButton)

    // 组装结构
    buttonsContainer.appendChild(buttonGroup)
    buttonGroupContainer.appendChild(buttonsContainer)

    // 设置按钮组容器引用（用于位置样式应用）
    this.collapseButton = buttonGroupContainer

    // 应用按钮组位置样式
    this.applyButtonPositionStyles(layoutConfig, fields)

    // 添加到表单中
    this.formElement!.appendChild(buttonGroupContainer)
  }

  /**
   * 创建展开/收起按钮元素
   */
  private createCollapseButtonElement(layoutConfig: LayoutConfig, hiddenCount: number): HTMLElement {
    const buttonHTML = generateCollapseButtonHTML(layoutConfig, this.isExpanded, hiddenCount)

    const buttonContainer = document.createElement('div')
    buttonContainer.innerHTML = buttonHTML

    return buttonContainer.firstElementChild as HTMLElement
  }

  /**
   * 应用按钮组位置样式
   */
  private applyButtonPositionStyles(layoutConfig: LayoutConfig, fields: FieldConfig[]): void {
    if (!this.collapseButton) return

    const buttonPosition = calculateButtonPosition(fields, layoutConfig, this.isExpanded)

    if (buttonPosition.shouldInline && buttonPosition.gridColumn) {
      // 应用网格定位样式
      this.collapseButton.style.gridColumn = buttonPosition.gridColumn
      this.collapseButton.classList.add('ldesign-form-button-inline')
    } else {
      // 移除内联样式，使用默认的独占行样式
      this.collapseButton.style.gridColumn = ''
      this.collapseButton.classList.remove('ldesign-form-button-inline')
    }
  }

  /**
   * 切换展开/收起状态
   */
  private async toggleCollapse(layoutConfig: LayoutConfig, fields: FieldConfig[]): Promise<void> {
    if (!this.collapseButton) return

    const collapsible = layoutConfig.collapsible!
    const isExpanding = !this.isExpanded

    // 更新状态
    this.isExpanded = isExpanding

    // 更新按钮状态
    this.updateCollapseButton(layoutConfig)

    // 更新按钮位置样式
    this.applyButtonPositionStyles(layoutConfig, fields)

    // 获取当前表单的所有可折叠字段（确保只操作当前表单实例的字段）
    const collapsibleFields = this.formElement?.querySelectorAll('.ldesign-form-field-collapsible')

    if (collapsibleFields) {
      // 切换字段显示状态
      collapsibleFields.forEach((field) => {
        if (isExpanding) {
          field.classList.remove('collapsed')
        } else {
          field.classList.add('collapsed')
        }
      })
    }
  }

  /**
   * 更新展开/收起按钮
   */
  private updateCollapseButton(layoutConfig: LayoutConfig): void {
    if (!this.collapseButton) return

    const collapsible = layoutConfig.collapsible!
    const buttonText = this.isExpanded
      ? collapsible.collapseText || '收起'
      : collapsible.expandText || '展开'

    const textElement = this.collapseButton.querySelector('.ldesign-form-collapse-button-text')
    const iconElement = this.collapseButton.querySelector('.ldesign-form-collapse-button-icon')

    if (textElement) {
      textElement.textContent = buttonText
    }

    if (iconElement) {
      iconElement.className = `ldesign-form-collapse-button-icon ${this.isExpanded ? 'expanded' : 'collapsed'}`
    }

    // 更新按钮的data-action属性
    this.collapseButton.dataset.action = this.isExpanded ? 'collapse' : 'expand'
  }

  /**
   * 创建字段元素（用于可折叠容器）
   */
  private createFieldElement(config: FieldConfig, form: FormCore): HTMLElement {
    const layoutConfig = form.config.layout || DEFAULT_LAYOUT_CONFIG

    // 创建字段容器
    const fieldContainer = document.createElement('div')
    fieldContainer.className = 'ldesign-form-item'
    fieldContainer.dataset.field = config.name

    // 应用布局样式
    this.applyFieldLayoutStyles(fieldContainer, config, layoutConfig)

    // 创建标签
    if (config.label) {
      const labelElement = document.createElement('label')
      labelElement.className = 'ldesign-form-label'
      labelElement.textContent = config.label
      labelElement.setAttribute('for', config.name)

      if (config.required) {
        labelElement.classList.add('required')
      }

      fieldContainer.appendChild(labelElement)
    }

    // 创建控件容器
    const controlContainer = document.createElement('div')
    controlContainer.className = 'ldesign-form-control'

    // 获取字段渲染器
    const renderer = this.getFieldRenderer(config.type || 'input')
    if (renderer) {
      const fieldElement = renderer.render(
        config,
        form.getFieldValue(config.name),
        (value) => form.setFieldValue(config.name, value)
      )

      controlContainer.appendChild(fieldElement)
      this.fieldElements.set(config.name, fieldElement)
    }

    // 创建错误显示元素
    const errorElement = document.createElement('div')
    errorElement.className = 'ldesign-form-error'
    errorElement.style.display = 'none'
    controlContainer.appendChild(errorElement)
    this.errorElements.set(config.name, errorElement)

    fieldContainer.appendChild(controlContainer)

    return fieldContainer
  }

  /**
   * 渲染单个字段
   */
  private renderField(config: FieldConfig, form: FormCore): void {
    const layoutConfig = form.config.layout || DEFAULT_LAYOUT_CONFIG

    // 创建字段容器
    const fieldContainer = document.createElement('div')
    fieldContainer.className = 'ldesign-form-item'
    fieldContainer.dataset.field = config.name

    // 应用字段布局样式
    this.applyFieldLayoutStyles(fieldContainer, config, layoutConfig)

    // 创建标签
    if (config.label) {
      const label = document.createElement('label')
      label.className = 'ldesign-form-label'

      // 添加必填标记
      if (config.required) {
        label.classList.add('ldesign-form-label-required')
      }

      label.textContent = config.label
      label.htmlFor = config.name
      fieldContainer.appendChild(label)
    }

    // 创建字段控件容器
    const controlContainer = document.createElement('div')
    controlContainer.className = 'ldesign-form-control'

    // 获取字段渲染器
    const renderer = this.getFieldRenderer(config.type || 'input')
    if (renderer) {
      const fieldElement = renderer.render(
        config,
        form.getFieldValue(config.name),
        (value) => form.setFieldValue(config.name, value)
      )

      // 设置字段属性
      if (fieldElement instanceof HTMLElement) {
        fieldElement.id = config.name
        fieldElement.name = config.name

        // 应用字段配置
        if (config.disabled) {
          (fieldElement as any).disabled = true
        }
        if (config.readonly) {
          (fieldElement as any).readOnly = true
        }

        controlContainer.appendChild(fieldElement)
        this.fieldElements.set(config.name, fieldElement)
      }
    }

    fieldContainer.appendChild(controlContainer)

    // 创建错误显示元素
    const errorElement = document.createElement('div')
    errorElement.className = 'ldesign-form-error'
    errorElement.style.display = 'none'
    fieldContainer.appendChild(errorElement)
    this.errorElements.set(config.name, errorElement)

    // 添加到表单
    if (this.formElement) {
      this.formElement.appendChild(fieldContainer)
    }
  }

  /**
   * 更新字段值
   */
  private updateFieldValue(fieldName: string, value: any): void {
    const fieldElement = this.fieldElements.get(fieldName)
    if (fieldElement && 'value' in fieldElement) {
      (fieldElement as any).value = value
    }
  }

  /**
   * 更新验证显示
   */
  private updateValidationDisplay(result: any): void {
    if (result.field) {
      // 单字段验证结果
      const errorElement = this.errorElements.get(result.field)
      if (errorElement) {
        if (result.valid) {
          errorElement.style.display = 'none'
          errorElement.textContent = ''
        } else {
          errorElement.style.display = 'block'
          errorElement.textContent = result.errors?.[0] || result.message || '验证失败'
        }
      }

      // 更新字段样式
      const fieldElement = this.fieldElements.get(result.field)
      if (fieldElement) {
        if (result.valid) {
          fieldElement.classList.remove('ldesign-form-error-field')
        } else {
          fieldElement.classList.add('ldesign-form-error-field')
        }
      }
    } else {
      // 表单整体验证结果
      Object.keys(result.fieldErrors || {}).forEach(fieldName => {
        const errors = result.fieldErrors[fieldName]
        const errorElement = this.errorElements.get(fieldName)
        const fieldElement = this.fieldElements.get(fieldName)

        if (errorElement) {
          if (errors.length === 0) {
            errorElement.style.display = 'none'
            errorElement.textContent = ''
          } else {
            errorElement.style.display = 'block'
            errorElement.textContent = errors[0]
          }
        }

        if (fieldElement) {
          if (errors.length === 0) {
            fieldElement.classList.remove('ldesign-form-error-field')
          } else {
            fieldElement.classList.add('ldesign-form-error-field')
          }
        }
      })
    }
  }

  /**
   * 更新表单状态
   */
  private updateFormState(state: any): void {
    if (!this.formElement) return

    // 更新提交状态
    if (state.submitting) {
      this.formElement.classList.add('ldesign-form-submitting')
    } else {
      this.formElement.classList.remove('ldesign-form-submitting')
    }

    // 更新验证状态
    if (state.validating) {
      this.formElement.classList.add('ldesign-form-validating')
    } else {
      this.formElement.classList.remove('ldesign-form-validating')
    }

    // 更新有效性状态
    if (state.valid) {
      this.formElement.classList.add('ldesign-form-valid')
      this.formElement.classList.remove('ldesign-form-invalid')
    } else {
      this.formElement.classList.add('ldesign-form-invalid')
      this.formElement.classList.remove('ldesign-form-valid')
    }
  }

  /**
   * 获取容器宽度
   */
  private getContainerWidth(): number {
    if (this.container) {
      return this.container.clientWidth
    }
    return window.innerWidth || 1200 // 默认宽度
  }

  /**
   * 应用布局样式
   */
  private applyLayoutStyles(formElement: HTMLFormElement, layoutConfig: LayoutConfig): void {
    if (layoutConfig.mode === 'horizontal') {
      const containerWidth = this.getContainerWidth()
      const gridStyles = calculateHorizontalGridStyles(layoutConfig, containerWidth)

      // 应用Grid样式
      Object.assign(formElement.style, gridStyles)

      // 设置CSS变量
      if (layoutConfig.horizontal?.rowGap) {
        formElement.style.setProperty('--ldesign-form-row-gap', `${layoutConfig.horizontal.rowGap}px`)
      }
      if (layoutConfig.horizontal?.columnGap) {
        formElement.style.setProperty('--ldesign-form-column-gap', `${layoutConfig.horizontal.columnGap}px`)
      }
    }

    // 设置标签宽度
    if (layoutConfig.labelWidth) {
      const labelWidth = typeof layoutConfig.labelWidth === 'number'
        ? `${layoutConfig.labelWidth}px`
        : layoutConfig.labelWidth
      formElement.style.setProperty('--ldesign-form-label-width', labelWidth)
    }

    // 设置间距
    if (layoutConfig.gutter) {
      formElement.style.setProperty('--ldesign-form-gutter', `${layoutConfig.gutter}px`)
    }
  }

  /**
   * 应用字段布局样式
   */
  private applyFieldLayoutStyles(fieldElement: HTMLElement, field: FieldConfig, layoutConfig: LayoutConfig): void {
    if (layoutConfig.mode === 'horizontal') {
      const containerWidth = this.getContainerWidth()
      const fieldStyles = calculateHorizontalFieldStyles(field, layoutConfig, containerWidth)

      // 应用字段样式
      Object.assign(fieldElement.style, fieldStyles)

      // 处理colSpan属性
      const colSpan = field.colSpan || 1
      const maxColumns = layoutConfig.horizontal?.columnsPerRow || 2
      const actualColSpan = Math.min(colSpan, maxColumns)

      if (actualColSpan > 1) {
        fieldElement.style.gridColumn = `span ${actualColSpan}`
      }

      // 兼容旧的layout.span属性
      if (field.layout?.span && field.layout.span > 1) {
        fieldElement.classList.add(`ldesign-form-item--span-${field.layout.span}`)
      }

      // 添加全宽类名
      if (field.layout?.span === -1) {
        fieldElement.classList.add('ldesign-form-item--full-width')
      }
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    this.fieldElements.clear()
    this.errorElements.clear()
    this.formElement = null
    this.container = null
    this.isExpanded = false
    this.collapseButton = null
    this.collapsibleContainer = null
  }
}
