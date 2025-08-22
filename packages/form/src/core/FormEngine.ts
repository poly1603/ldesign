/**
 * @fileoverview Core form engine implementation (Framework-agnostic)
 * @author LDesign Team
 */

import type {
  FormData,
  FormFieldValue,
  FormOptions,
  FormItemConfig,
  FormGroupConfig,
  FormValidationResult,
  FieldValidationResult,
  FormEvents,
  FormInstance,
} from '../types'
import { EventEmitter } from './EventEmitter'

/**
 * Framework-agnostic form engine
 * Handles core form logic without UI framework dependencies
 */
export class FormEngine extends EventEmitter<FormEvents> implements FormInstance {
  private options: FormOptions
  private data: FormData = {}
  private errors: Record<string, FieldValidationResult> = {}
  private loading = false
  private expanded = false
  private groupStates: Record<string, { collapsed: boolean }> = {}
  private initialized = false
  private destroyed = false

  constructor(options: FormOptions = {}) {
    super()
    this.options = this.normalizeOptions(options)
    this.initialize()
  }

  /**
   * Initialize the form engine
   */
  private initialize(): void {
    if (this.initialized) return

    // Initialize form data with default values
    this.initializeFormData()

    // Initialize group states
    this.initializeGroupStates()

    // Set initial expanded state
    this.expanded = this.shouldAutoExpand()

    this.initialized = true

    // Emit initialization event
    this.emit('form:init', {
      options: this.options,
      initialData: { ...this.data },
      timestamp: Date.now(),
    })
  }

  /**
   * Normalize form options with defaults
   */
  private normalizeOptions(options: FormOptions): FormOptions {
    return {
      fields: [],
      groups: [],
      layout: {
        defaultRows: 3,
        minColumnWidth: 300,
        autoCalculate: true,
        horizontalGap: 16,
        verticalGap: 16,
        breakpoints: {
          xs: 576,
          sm: 768,
          md: 992,
          lg: 1200,
          xl: 1400,
        },
        ...options.layout,
      },
      label: {
        showColon: true,
        position: 'right',
        width: 'auto',
        align: 'right',
        ...options.label,
      },
      button: {
        position: 'inline',
        span: 1,
        align: 'left',
        expandMode: 'toggle',
        expandText: '展开',
        collapseText: '收起',
        showSubmit: true,
        submitText: '提交',
        showReset: true,
        resetText: '重置',
        showExpand: true,
        ...options.button,
      },
      style: {
        type: 'edit',
        responsive: true,
        ...options.style,
      },
      rules: {},
      initialData: {},
      debug: false,
      ...options,
    }
  }

  /**
   * Initialize form data with default values
   */
  private initializeFormData(): void {
    const initialData = { ...this.options.initialData }

    // Set default values from field configs
    this.getAllFields().forEach(field => {
      if (field.name && field.defaultValue !== undefined) {
        if (!(field.name in initialData)) {
          initialData[field.name] = field.defaultValue
        }
      }
    })

    this.data = initialData
  }

  /**
   * Initialize group states
   */
  private initializeGroupStates(): void {
    if (this.options.groups) {
      this.options.groups.forEach(group => {
        this.groupStates[group.groupName] = {
          collapsed: group.collapsed ?? false,
        }
      })
    }
  }

  /**
   * Get all fields from both fields and groups
   */
  private getAllFields(): FormItemConfig[] {
    const fields: FormItemConfig[] = []

    if (this.options.fields) {
      fields.push(...this.options.fields)
    }

    if (this.options.groups) {
      this.options.groups.forEach(group => {
        fields.push(...group.fields)
      })
    }

    return fields
  }

  /**
   * Check if form should auto-expand based on field count
   */
  private shouldAutoExpand(): boolean {
    const totalFields = this.getAllFields().length
    const defaultRows = this.options.layout?.defaultRows ?? 3
    const columns = this.options.layout?.columns ?? 3
    return totalFields <= defaultRows * columns
  }

  /**
   * Set form data
   */
  setFormData(data: Partial<FormData>): void {
    if (this.destroyed) return

    const oldData = { ...this.data }
    this.data = { ...this.data, ...data }

    // Emit change events for each changed field
    Object.keys(data).forEach(field => {
      const newValue = data[field]
      const oldValue = oldData[field]

      if (newValue !== oldValue) {
        this.emit('form:change', {
          data: { ...this.data },
          field,
          value: newValue!,
          oldValue,
          timestamp: Date.now(),
          source: 'programmatic',
        })

        this.emit('field:change', {
          field,
          value: newValue!,
          oldValue,
          source: 'programmatic',
          timestamp: Date.now(),
        })
      }
    })
  }

  /**
   * Get form data
   */
  getFormData(): FormData {
    return { ...this.data }
  }

  /**
   * Set single field value
   */
  setFieldValue(name: string, value: FormFieldValue): void {
    if (this.destroyed) return

    const oldValue = this.data[name]
    if (value !== oldValue) {
      this.data[name] = value

      // Clear field validation error
      if (this.errors[name]) {
        delete this.errors[name]
      }

      this.emit('form:change', {
        data: { ...this.data },
        field: name,
        value,
        oldValue,
        timestamp: Date.now(),
        source: 'programmatic',
      })

      this.emit('field:change', {
        field: name,
        value,
        oldValue,
        source: 'programmatic',
        timestamp: Date.now(),
      })
    }
  }

  /**
   * Get single field value
   */
  getFieldValue(name: string): FormFieldValue {
    return this.data[name]
  }

  /**
   * Validate form (placeholder - will be implemented in validation engine)
   */
  async validate(): Promise<FormValidationResult> {
    const startTime = Date.now()

    // For now, return a valid result
    // This will be implemented properly in the validation engine
    const result: FormValidationResult = {
      valid: Object.keys(this.errors).length === 0,
      errors: { ...this.errors },
    }

    this.emit('form:validate', {
      result,
      trigger: 'manual',
      timestamp: Date.now(),
      duration: Date.now() - startTime,
    })

    return result
  }

  /**
   * Validate single field (placeholder)
   */
  async validateField(name: string): Promise<FieldValidationResult> {
    const startTime = Date.now()
    const value = this.data[name]

    // For now, return a valid result
    // This will be implemented properly in the validation engine
    const result: FieldValidationResult = {
      valid: !this.errors[name],
      message: this.errors[name]?.message,
      rule: this.errors[name]?.rule,
    }

    this.emit('field:validate', {
      field: name,
      result,
      value,
      trigger: 'manual',
      timestamp: Date.now(),
      duration: Date.now() - startTime,
    })

    return result
  }

  /**
   * Reset form to initial state
   */
  reset(): void {
    if (this.destroyed) return

    const oldData = { ...this.data }

    // Reset to initial data
    this.initializeFormData()

    // Clear validation errors
    this.errors = {}

    // Reset group states
    this.initializeGroupStates()

    // Reset expanded state
    this.expanded = this.shouldAutoExpand()

    this.emit('form:reset', {
      oldData,
      newData: { ...this.data },
      timestamp: Date.now(),
    })
  }

  /**
   * Clear validation errors
   */
  clearValidation(): void {
    this.errors = {}
  }

  /**
   * Clear single field validation error
   */
  clearFieldValidation(name: string): void {
    delete this.errors[name]
  }

  /**
   * Submit form
   */
  async submit(): Promise<{ data: FormData; valid: boolean }> {
    if (this.destroyed) return { data: {}, valid: false }

    this.loading = true

    try {
      // Validate form before submission
      const validationResult = await this.validate()

      const data = this.getFormData()

      this.emit('form:submit', {
        data,
        valid: validationResult.valid,
        validationResult,
        timestamp: Date.now(),
      })

      return { data, valid: validationResult.valid }
    } finally {
      this.loading = false
    }
  }

  /**
   * Get form options
   */
  getOptions(): FormOptions {
    return { ...this.options }
  }

  /**
   * Update form options
   */
  updateOptions(options: Partial<FormOptions>): void {
    if (this.destroyed) return

    this.options = this.normalizeOptions({ ...this.options, ...options })

    // Re-initialize if needed
    if (options.initialData) {
      this.initializeFormData()
    }

    if (options.groups) {
      this.initializeGroupStates()
    }
  }

  /**
   * Get validation errors
   */
  getErrors(): Record<string, FieldValidationResult> {
    return { ...this.errors }
  }

  /**
   * Check if form has validation errors
   */
  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0
  }

  /**
   * Get form state
   */
  getState() {
    return {
      data: { ...this.data },
      errors: { ...this.errors },
      loading: this.loading,
      expanded: this.expanded,
      groupStates: { ...this.groupStates },
    }
  }

  /**
   * Toggle expanded state
   */
  toggleExpanded(): void {
    if (this.destroyed) return

    this.expanded = !this.expanded

    this.emit('form:expand', {
      expanded: this.expanded,
      timestamp: Date.now(),
    })
  }

  /**
   * Toggle group collapsed state
   */
  toggleGroup(groupName: string): void {
    if (this.destroyed) return

    if (this.groupStates[groupName]) {
      this.groupStates[groupName].collapsed = !this.groupStates[groupName].collapsed

      this.emit('group:toggle', {
        groupName,
        collapsed: this.groupStates[groupName].collapsed,
        fields: this.getGroupFields(groupName),
        timestamp: Date.now(),
      })
    }
  }

  /**
   * Get fields for a specific group
   */
  private getGroupFields(groupName: string): string[] {
    const group = this.options.groups?.find(g => g.groupName === groupName)
    return group ? group.fields.map(f => f.name) : []
  }

  /**
   * Destroy the form engine
   */
  destroy(): void {
    if (this.destroyed) return

    this.emit('form:destroy', {
      reason: 'manual',
      finalData: { ...this.data },
      timestamp: Date.now(),
    })

    super.destroy()

    this.data = {}
    this.errors = {}
    this.groupStates = {}
    this.destroyed = true
  }

  /**
   * Check if the form engine is destroyed
   */
  isDestroyed(): boolean {
    return this.destroyed
  }
}