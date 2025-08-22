/**
 * @fileoverview Vanilla JavaScript form instance
 * @author LDesign Team
 */

import type {
  VanillaFormOptions,
  VanillaFormInstance,
  FormData,
  FormFieldValue,
  FormValidationResult,
  FieldValidationResult,
  FormOptions,
} from '../types'
import { FormEngine } from '../core/FormEngine'
import { ValidationEngine } from '../core/ValidationEngine'
import { LayoutCalculator } from '../core/LayoutCalculator'

/**
 * Vanilla JavaScript form instance implementation
 */
export class VanillaFormInstanceImpl extends FormEngine implements VanillaFormInstance {
  private container: HTMLElement
  private validationEngine: ValidationEngine
  private layoutCalculator: LayoutCalculator
  private rendered = false

  constructor(options: VanillaFormOptions) {
    // Extract form options from vanilla options
    const { container, onSubmit, onChange, onValidate, onReset, onFieldChange, onFieldFocus, onFieldBlur, ...formOptions } = options

    super(formOptions)

    this.container = this.resolveContainer(container)
    this.validationEngine = new ValidationEngine()
    this.layoutCalculator = new LayoutCalculator(formOptions.layout)

    this.setupEventListeners(options)
    this.render()
  }

  /**
   * Resolve container element
   */
  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container)
      if (!element) {
        throw new Error(`Container element not found: ${container}`)
      }
      return element as HTMLElement
    }
    return container
  }

  /**
   * Setup event listeners for vanilla callbacks
   */
  private setupEventListeners(options: VanillaFormOptions): void {
    if (options.onSubmit) {
      this.on('form:submit', (event) => {
        options.onSubmit!(event.data, event.valid)
      })
    }

    if (options.onChange) {
      this.on('form:change', (event) => {
        options.onChange!(event.data, event.field, event.value)
      })
    }

    if (options.onValidate) {
      this.on('form:validate', (event) => {
        options.onValidate!(event.result)
      })
    }

    if (options.onReset) {
      this.on('form:reset', (event) => {
        options.onReset!(event.newData)
      })
    }

    if (options.onFieldChange) {
      this.on('field:change', (event) => {
        options.onFieldChange!(event.field, event.value, event.oldValue)
      })
    }

    if (options.onFieldFocus) {
      this.on('field:focus', (event) => {
        options.onFieldFocus!(event.field, event.value)
      })
    }

    if (options.onFieldBlur) {
      this.on('field:blur', (event) => {
        options.onFieldBlur!(event.field, event.value)
      })
    }
  }

  /**
   * Enhanced validate method with validation engine
   */
  async validate(): Promise<FormValidationResult> {
    const fieldRules: Record<string, any[]> = {}

    // Collect validation rules from field configs
    const allFields = [
      ...(this.getOptions().fields || []),
      ...(this.getOptions().groups?.flatMap(g => g.fields) || [])
    ]

    allFields.forEach(field => {
      if (field.rules && field.rules.length > 0) {
        fieldRules[field.name] = field.rules
      }
    })

    return this.validationEngine.validateForm(this.getFormData(), fieldRules)
  }

  /**
   * Enhanced validateField method
   */
  async validateField(name: string): Promise<FieldValidationResult> {
    const allFields = [
      ...(this.getOptions().fields || []),
      ...(this.getOptions().groups?.flatMap(g => g.fields) || [])
    ]

    const field = allFields.find(f => f.name === name)
    if (!field || !field.rules) {
      return { valid: true }
    }

    return this.validationEngine.validateField(
      name,
      this.getFieldValue(name),
      field.rules,
      this.getFormData()
    )
  }

  /**
   * Get DOM container
   */
  getContainer(): HTMLElement {
    return this.container
  }

  /**
   * Render the form
   */
  render(): void {
    this.container.innerHTML = ''

    // Create form structure
    const formElement = this.createFormElement()
    this.container.appendChild(formElement)

    this.rendered = true
  }

  /**
   * Create form element
   */
  private createFormElement(): HTMLElement {
    const form = document.createElement('div')
    form.className = 'ldesign-form'

    // Add form styles
    this.applyFormStyles(form)

    // Create form content
    const formContent = this.createFormContent()
    form.appendChild(formContent)

    return form
  }

  /**
   * Apply form styles
   */
  private applyFormStyles(form: HTMLElement): void {
    const options = this.getOptions()
    const containerWidth = this.container.offsetWidth || 800

    // Calculate layout
    const layout = this.layoutCalculator.calculateGridLayout(
      containerWidth,
      this.getAllFieldsCount()
    )

    const gaps = this.layoutCalculator.calculateGaps(containerWidth)
    const gridTemplate = this.layoutCalculator.generateGridTemplate(
      containerWidth,
      this.getAllFieldsCount()
    )

    // Apply CSS Grid layout
    Object.assign(form.style, {
      display: 'grid',
      gridTemplateColumns: gridTemplate.gridTemplateColumns,
      gridTemplateRows: gridTemplate.gridTemplateRows,
      gap: gridTemplate.gap,
      width: '100%',
      boxSizing: 'border-box',
    })

    // Apply theme styles
    if (options.style?.cssVars) {
      Object.entries(options.style.cssVars).forEach(([key, value]) => {
        form.style.setProperty(`--${key}`, String(value))
      })
    }
  }

  /**
   * Create form content
   */
  private createFormContent(): HTMLElement {
    const content = document.createElement('div')
    content.className = 'ldesign-form-content'

    const options = this.getOptions()

    // Render fields
    if (options.fields) {
      options.fields.forEach(field => {
        const fieldElement = this.createFieldElement(field)
        content.appendChild(fieldElement)
      })
    }

    // Render groups
    if (options.groups) {
      options.groups.forEach(group => {
        const groupElement = this.createGroupElement(group)
        content.appendChild(groupElement)
      })
    }

    // Render buttons
    if (options.button?.showSubmit || options.button?.showReset) {
      const buttonsElement = this.createButtonsElement()
      content.appendChild(buttonsElement)
    }

    return content
  }

  /**
   * Create field element
   */
  private createFieldElement(field: any): HTMLElement {
    const fieldContainer = document.createElement('div')
    fieldContainer.className = 'ldesign-form-field'
    fieldContainer.setAttribute('data-field', field.name)

    // Apply field span
    const containerWidth = this.container.offsetWidth || 800
    const totalColumns = this.layoutCalculator.calculateColumns(containerWidth)
    const span = this.layoutCalculator.calculateFieldSpan(
      field.span,
      containerWidth,
      totalColumns
    )

    fieldContainer.style.gridColumn = `span ${span}`

    // Create label
    if (field.title) {
      const label = this.createLabelElement(field)
      fieldContainer.appendChild(label)
    }

    // Create input
    const input = this.createInputElement(field)
    fieldContainer.appendChild(input)

    // Create error display
    const errorDisplay = this.createErrorDisplay(field.name)
    fieldContainer.appendChild(errorDisplay)

    return fieldContainer
  }

  /**
   * Create label element
   */
  private createLabelElement(field: any): HTMLElement {
    const label = document.createElement('label')
    label.className = 'ldesign-form-label'
    label.textContent = field.title
    label.setAttribute('for', field.name)

    if (field.required) {
      const required = document.createElement('span')
      required.className = 'ldesign-form-required'
      required.textContent = ' *'
      required.style.color = '#ff4d4f'
      label.appendChild(required)
    }

    return label
  }

  /**
   * Create input element
   */
  private createInputElement(field: any): HTMLElement {
    let input: HTMLElement

    // Create different input types based on component
    switch (field.component) {
      case 'textarea':
      case 'FormTextarea':
        input = document.createElement('textarea')
        break
      case 'select':
      case 'FormSelect':
        input = document.createElement('select')
        break
      default:
        input = document.createElement('input')
        const inputElement = input as HTMLInputElement
        inputElement.type = field.props?.type || 'text'
        break
    }

    input.className = 'ldesign-form-input'
    input.setAttribute('name', field.name)
    input.setAttribute('id', field.name)

    // Set initial value
    const value = this.getFieldValue(field.name)
    if (value !== undefined && value !== null) {
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.value = String(value)
      }
    }

    // Apply field properties
    if (field.props) {
      Object.entries(field.props).forEach(([key, value]) => {
        if (key !== 'type') {
          input.setAttribute(key, String(value))
        }
      })
    }

    // Add event listeners
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.setFieldValue(field.name, target.value)
    })

    input.addEventListener('focus', (e) => {
      this.emit('field:focus', {
        field: field.name,
        value: this.getFieldValue(field.name),
        nativeEvent: e as FocusEvent,
        timestamp: Date.now(),
      })
    })

    input.addEventListener('blur', (e) => {
      this.emit('field:blur', {
        field: field.name,
        value: this.getFieldValue(field.name),
        nativeEvent: e as FocusEvent,
        timestamp: Date.now(),
      })
    })

    return input
  }

  /**
   * Create error display element
   */
  private createErrorDisplay(fieldName: string): HTMLElement {
    const errorDisplay = document.createElement('div')
    errorDisplay.className = 'ldesign-form-error'
    errorDisplay.setAttribute('data-field-error', fieldName)
    errorDisplay.style.display = 'none'
    errorDisplay.style.color = '#ff4d4f'
    errorDisplay.style.fontSize = '12px'
    errorDisplay.style.marginTop = '4px'

    return errorDisplay
  }

  /**
   * Create group element
   */
  private createGroupElement(group: any): HTMLElement {
    const groupContainer = document.createElement('div')
    groupContainer.className = 'ldesign-form-group'
    groupContainer.setAttribute('data-group', group.groupName)

    // Create group title
    if (group.title) {
      const title = document.createElement('div')
      title.className = 'ldesign-form-group-title'
      title.textContent = group.title
      groupContainer.appendChild(title)
    }

    // Create group fields
    const fieldsContainer = document.createElement('div')
    fieldsContainer.className = 'ldesign-form-group-fields'

    group.fields.forEach((field: any) => {
      const fieldElement = this.createFieldElement(field)
      fieldsContainer.appendChild(fieldElement)
    })

    groupContainer.appendChild(fieldsContainer)

    return groupContainer
  }

  /**
   * Create buttons element
   */
  private createButtonsElement(): HTMLElement {
    const buttonsContainer = document.createElement('div')
    buttonsContainer.className = 'ldesign-form-buttons'

    const options = this.getOptions()

    // Submit button
    if (options.button?.showSubmit) {
      const submitButton = document.createElement('button')
      submitButton.type = 'button'
      submitButton.className = 'ldesign-form-button ldesign-form-button-primary'
      submitButton.textContent = options.button.submitText || '提交'

      submitButton.addEventListener('click', () => {
        this.submit()
      })

      buttonsContainer.appendChild(submitButton)
    }

    // Reset button
    if (options.button?.showReset) {
      const resetButton = document.createElement('button')
      resetButton.type = 'button'
      resetButton.className = 'ldesign-form-button ldesign-form-button-default'
      resetButton.textContent = options.button.resetText || '重置'

      resetButton.addEventListener('click', () => {
        this.reset()
      })

      buttonsContainer.appendChild(resetButton)
    }

    return buttonsContainer
  }

  /**
   * Get total fields count
   */
  private getAllFieldsCount(): number {
    const options = this.getOptions()
    let count = options.fields?.length || 0

    if (options.groups) {
      count += options.groups.reduce((sum, group) => sum + group.fields.length, 0)
    }

    return count
  }

  /**
   * Mount to new container
   */
  mount(container: string | HTMLElement): void {
    this.container = this.resolveContainer(container)
    this.render()
  }

  /**
   * Unmount the form
   */
  unmount(): void {
    if (this.rendered) {
      this.container.innerHTML = ''
      this.rendered = false
    }
  }

  /**
   * Destroy the form instance
   */
  destroy(): void {
    this.unmount()
    super.destroy()
  }
}