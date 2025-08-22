/**
 * @fileoverview useFormValidation Composition API hook
 * @author LDesign Team
 */

import { ref, computed, type Ref } from 'vue'
import type {
  FormData,
  FormValidationResult,
  FieldValidationResult,
  UseFormValidationReturn,
  FormInstance,
} from '../types'

/**
 * Use form validation composition hook
 * Provides reactive validation state and operations
 */
export function useFormValidation(
  formInstance?: FormInstance
): UseFormValidationReturn {
  // Reactive state
  const errors = ref<Record<string, string>>({})
  const validating = ref(false)

  // Computed properties
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  // Validate entire form
  const validate = async (): Promise<FormValidationResult> => {
    if (!formInstance) {
      return { valid: true, errors: {} }
    }

    validating.value = true

    try {
      const result = await formInstance.validate()

      // Update errors state
      errors.value = {}
      Object.entries(result.errors).forEach(([field, error]) => {
        if (error.message) {
          errors.value[field] = error.message
        }
      })

      return result
    } finally {
      validating.value = false
    }
  }

  // Validate single field
  const validateField = async (field: string): Promise<FieldValidationResult> => {
    if (!formInstance) {
      return { valid: true }
    }

    validating.value = true

    try {
      const result = await formInstance.validateField(field)

      // Update field error state
      if (result.valid) {
        delete errors.value[field]
      } else if (result.message) {
        errors.value[field] = result.message
      }

      return result
    } finally {
      validating.value = false
    }
  }

  // Clear validation errors
  const clearValidation = (field?: string): void => {
    if (field) {
      delete errors.value[field]
      if (formInstance) {
        formInstance.clearFieldValidation(field)
      }
    } else {
      errors.value = {}
      if (formInstance) {
        formInstance.clearValidation()
      }
    }
  }

  // Set custom field error
  const setFieldError = (field: string, error: string): void => {
    errors.value[field] = error
  }

  // Remove field error
  const removeFieldError = (field: string): void => {
    delete errors.value[field]
  }

  // Listen to form instance validation events
  if (formInstance) {
    formInstance.on('form:validate', (event) => {
      errors.value = {}
      Object.entries(event.result.errors).forEach(([field, error]) => {
        if (error.message) {
          errors.value[field] = error.message
        }
      })
    })

    formInstance.on('field:validate', (event) => {
      if (event.result.valid) {
        delete errors.value[event.field]
      } else if (event.result.message) {
        errors.value[event.field] = event.result.message
      }
    })

    formInstance.on('form:reset', () => {
      errors.value = {}
    })
  }

  return {
    errors,
    hasErrors,
    validating,
    validate,
    validateField,
    clearValidation,
    setFieldError,
    removeFieldError,
  }
}