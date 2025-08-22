/**
 * @fileoverview Factory functions for vanilla JavaScript usage
 * @author LDesign Team
 */

import type { VanillaFormOptions, VanillaFormInstance } from '../types'
import { VanillaFormInstanceImpl } from './VanillaFormInstance'

/**
 * Create form instance for vanilla JavaScript usage
 */
export function createFormInstance(options: VanillaFormOptions): VanillaFormInstance {
  return new VanillaFormInstanceImpl(options)
}

/**
 * Create form class for object-oriented usage
 */
export class FormInstanceClass {
  private instance: VanillaFormInstance

  constructor(options: VanillaFormOptions) {
    this.instance = createFormInstance(options)
  }

  /**
   * Set form data
   */
  setData(data: Record<string, any>): void {
    this.instance.setFormData(data)
  }

  /**
   * Get form data
   */
  getData(): Record<string, any> {
    return this.instance.getFormData()
  }

  /**
   * Validate form
   */
  async validate(): Promise<{ valid: boolean; errors: Record<string, any> }> {
    const result = await this.instance.validate()
    return {
      valid: result.valid,
      errors: result.errors,
    }
  }

  /**
   * Reset form
   */
  reset(): void {
    this.instance.reset()
  }

  /**
   * Submit form
   */
  async submit(): Promise<{ data: Record<string, any>; valid: boolean }> {
    return this.instance.submit()
  }

  /**
   * Destroy form
   */
  destroy(): void {
    this.instance.destroy()
  }

  /**
   * Get underlying instance
   */
  getInstance(): VanillaFormInstance {
    return this.instance
  }
}

/**
 * Simple form creation function with minimal API
 */
export function createSimpleForm(
  container: string | HTMLElement,
  fields: Array<{
    name: string
    title: string
    type?: string
    required?: boolean
  }>,
  onSubmit?: (data: Record<string, any>) => void
): {
  setData: (data: Record<string, any>) => void
  getData: () => Record<string, any>
  validate: () => Promise<boolean>
  reset: () => void
  destroy: () => void
} {
  const formFields = fields.map(field => ({
    name: field.name,
    title: field.title,
    component: 'input',
    props: { type: field.type || 'text' },
    required: field.required || false,
    rules: field.required ? [{ validator: 'required' as const }] : [],
  }))

  const instance = createFormInstance({
    container,
    fields: formFields,
    onSubmit: onSubmit ? (data, valid) => {
      if (valid) {
        onSubmit(data)
      }
    } : undefined,
  })

  return {
    setData: (data) => instance.setFormData(data),
    getData: () => instance.getFormData(),
    validate: async () => {
      const result = await instance.validate()
      return result.valid
    },
    reset: () => instance.reset(),
    destroy: () => instance.destroy(),
  }
}

/**
 * Auto-discover and create form from existing HTML
 */
export function createFormFromHTML(
  container: string | HTMLElement,
  options: Partial<VanillaFormOptions> = {}
): VanillaFormInstance {
  const containerElement = typeof container === 'string'
    ? document.querySelector(container) as HTMLElement
    : container

  if (!containerElement) {
    throw new Error('Container not found')
  }

  // Discover fields from existing form elements
  const inputs = containerElement.querySelectorAll('input, textarea, select')
  const fields = Array.from(inputs).map(input => {
    const element = input as HTMLInputElement
    const name = element.name || element.id
    const title = element.getAttribute('data-title') ||
      element.previousElementSibling?.textContent?.trim() ||
      name

    return {
      name,
      title,
      component: element.tagName.toLowerCase(),
      props: {
        type: element.type || 'text',
        placeholder: element.placeholder,
        required: element.required,
      },
      required: element.required,
      defaultValue: element.value,
    }
  }).filter(field => field.name) // Only include fields with names

  return createFormInstance({
    ...options,
    container: containerElement,
    fields,
  })
}

/**
 * Global form registry for managing multiple forms
 */
class FormRegistry {
  private forms: Map<string, VanillaFormInstance> = new Map()

  /**
   * Register a form with an ID
   */
  register(id: string, form: VanillaFormInstance): void {
    if (this.forms.has(id)) {
      console.warn(`Form with id "${id}" already exists. Replacing...`)
      this.forms.get(id)?.destroy()
    }
    this.forms.set(id, form)
  }

  /**
   * Get form by ID
   */
  get(id: string): VanillaFormInstance | undefined {
    return this.forms.get(id)
  }

  /**
   * Unregister form
   */
  unregister(id: string): void {
    const form = this.forms.get(id)
    if (form) {
      form.destroy()
      this.forms.delete(id)
    }
  }

  /**
   * Get all form IDs
   */
  getFormIds(): string[] {
    return Array.from(this.forms.keys())
  }

  /**
   * Destroy all forms
   */
  destroyAll(): void {
    this.forms.forEach(form => form.destroy())
    this.forms.clear()
  }
}

/**
 * Global form registry instance
 */
export const formRegistry = new FormRegistry()

/**
 * Create and register a form
 */
export function createAndRegisterForm(
  id: string,
  options: VanillaFormOptions
): VanillaFormInstance {
  const form = createFormInstance(options)
  formRegistry.register(id, form)
  return form
}

/**
 * Get registered form
 */
export function getForm(id: string): VanillaFormInstance | undefined {
  return formRegistry.get(id)
}