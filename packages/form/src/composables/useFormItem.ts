/**
 * @fileoverview useFormItem Composition API hook
 * @author LDesign Team
 */

import { ref, computed, watch, type Ref } from 'vue'
import type {
  FormFieldValue,
  FormItemConfig,
  FieldValidationResult,
  UseFormItemReturn,
  FormInstance,
} from '../types'

/**
 * Use form item composition hook
 * Provides reactive field state and operations
 */
export function useFormItem(
  config: FormItemConfig,
  formInstance?: FormInstance,
  initialValue?: FormFieldValue
): UseFormItemReturn {
  // Reactive state
  const value = ref<FormFieldValue>(
    initialValue ??
    formInstance?.getFieldValue(config.name) ??
    config.defaultValue
  )
  const error = ref<string>('')
  const validating = ref(false)
  const dirty = ref(false)
  const touched = ref(false)

  // Computed properties
  const hasError = computed(() => !!error.value)
  const isRequired = computed(() => !!config.required)

  // Set field value
  const setValue = (newValue: FormFieldValue): void => {
    const oldValue = value.value
    value.value = newValue
    dirty.value = true

    // Update form instance if available
    if (formInstance) {
      formInstance.setFieldValue(config.name, newValue)
    }

    // Auto-validate on change if trigger is set
    if (config.rules?.some(rule => rule.trigger === 'change')) {
      validate()
    }
  }

  // Validate field
  const validate = async (): Promise<FieldValidationResult> => {
    if (!config.rules || config.rules.length === 0) {
      return { valid: true }
    }

    validating.value = true
    error.value = ''

    try {
      const result = formInstance
        ? await formInstance.validateField(config.name)
        : { valid: true }

      if (!result.valid && result.message) {
        error.value = result.message
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '验证失败'
      error.value = errorMessage
      return {
        valid: false,
        message: errorMessage,
      }
    } finally {
      validating.value = false
    }
  }

  // Clear validation
  const clearValidation = (): void => {
    error.value = ''
    if (formInstance) {
      formInstance.clearFieldValidation(config.name)
    }
  }

  // Reset field
  const reset = (): void => {
    value.value = config.defaultValue
    error.value = ''
    dirty.value = false
    touched.value = false

    if (formInstance) {
      formInstance.setFieldValue(config.name, config.defaultValue)
      formInstance.clearFieldValidation(config.name)
    }
  }

  // Mark as touched
  const touch = (): void => {
    touched.value = true

    // Auto-validate on blur if trigger is set
    if (config.rules?.some(rule => rule.trigger === 'blur')) {
      validate()
    }
  }

  // Watch for external value changes from form instance
  if (formInstance) {
    // Listen for form data changes
    formInstance.on('form:change', (event) => {
      if (event.field === config.name && event.value !== value.value) {
        value.value = event.value
      }
    })

    // Listen for field validation results
    formInstance.on('field:validate', (event) => {
      if (event.field === config.name) {
        if (!event.result.valid && event.result.message) {
          error.value = event.result.message
        } else {
          error.value = ''
        }
      }
    })

    // Listen for form reset
    formInstance.on('form:reset', () => {
      reset()
    })
  }

  // Watch for value changes to sync with form instance
  watch(
    value,
    (newValue, oldValue) => {
      if (newValue !== oldValue && formInstance) {
        formInstance.setFieldValue(config.name, newValue)
      }
    },
    { deep: true }
  )

  return {
    value,
    error,
    validating,
    dirty,
    touched,
    setValue,
    validate,
    clearValidation,
    reset,
    touch,
  }
}