/**
 * @fileoverview useForm Composition API hook
 * @author LDesign Team
 */

import { ref, reactive, computed, watch, onUnmounted, h, type VNode } from 'vue'
import type {
  FormData,
  FormFieldValue,
  FormOptions,
  FormValidationResult,
  FieldValidationResult,
  UseFormReturn,
  UseFormOptions,
  FormInstance,
} from '../types'
import { FormEngine } from '../core/FormEngine'
import { ValidationEngine } from '../core/ValidationEngine'

/**
 * Use form composition hook
 * Provides reactive form state and operations
 */
export function useForm(options: UseFormOptions = {}): UseFormReturn {
  // Initialize engines
  const formEngine = new FormEngine(options)
  const validationEngine = new ValidationEngine()

  // Reactive state
  const formData = ref<FormData>({})
  const errors = ref<Record<string, FieldValidationResult>>({})
  const loading = ref(false)
  const expanded = ref(false)
  const groupStates = ref<Record<string, { collapsed: boolean }>>({})

  // Initialize reactive state from engine
  const initializeState = () => {
    const state = formEngine.getState()
    formData.value = state.data
    errors.value = state.errors
    loading.value = state.loading
    expanded.value = state.expanded
    groupStates.value = state.groupStates
  }

  // Set up event listeners
  const setupEventListeners = () => {
    formEngine.on('form:change', (event) => {
      formData.value = { ...event.data }
    })

    formEngine.on('form:validate', (event) => {
      errors.value = { ...event.result.errors }
    })

    formEngine.on('form:expand', (event) => {
      expanded.value = event.expanded
    })

    formEngine.on('group:toggle', (event) => {
      if (groupStates.value[event.groupName]) {
        groupStates.value[event.groupName].collapsed = event.collapsed
      }
    })

    formEngine.on('form:loading', (event) => {
      loading.value = event.loading
    })
  }

  // Enhanced form instance with validation engine
  const enhancedFormInstance: FormInstance = {
    ...formEngine,
    async validate(): Promise<FormValidationResult> {
      const fieldRules: Record<string, any[]> = {}

      // Collect validation rules from field configs
      const allFields = [
        ...(options.fields || []),
        ...(options.groups?.flatMap(g => g.fields) || [])
      ]

      allFields.forEach(field => {
        if (field.rules && field.rules.length > 0) {
          fieldRules[field.name] = field.rules
        }
      })

      const result = await validationEngine.validateForm(formData.value, fieldRules)
      errors.value = result.errors

      formEngine.emit('form:validate', {
        result,
        trigger: 'manual',
        timestamp: Date.now(),
      })

      return result
    },

    async validateField(name: string): Promise<FieldValidationResult> {
      const field = allFields.find(f => f.name === name)
      if (!field || !field.rules) {
        return { valid: true }
      }

      const result = await validationEngine.validateField(
        name,
        formData.value[name],
        field.rules,
        formData.value
      )

      if (!result.valid) {
        errors.value[name] = result
      } else {
        delete errors.value[name]
      }

      formEngine.emit('field:validate', {
        field: name,
        result,
        value: formData.value[name],
        trigger: 'manual',
        timestamp: Date.now(),
      })

      return result
    }
  }

  // Get all fields for validation
  const allFields = computed(() => [
    ...(options.fields || []),
    ...(options.groups?.flatMap(g => g.fields) || [])
  ])

  // Form operations
  const validate = async (): Promise<FormValidationResult> => {
    return enhancedFormInstance.validate()
  }

  const reset = (): void => {
    formEngine.reset()
    initializeState()
  }

  const setFieldValue = (name: string, value: FormFieldValue): void => {
    formEngine.setFieldValue(name, value)
  }

  const getFieldValue = (name: string): FormFieldValue => {
    return formEngine.getFieldValue(name)
  }

  const submit = async (): Promise<{ data: FormData; valid: boolean }> => {
    loading.value = true
    try {
      const validationResult = await validate()
      const data = formEngine.getFormData()

      formEngine.emit('form:submit', {
        data,
        valid: validationResult.valid,
        validationResult,
        timestamp: Date.now(),
      })

      return { data, valid: validationResult.valid }
    } finally {
      loading.value = false
    }
  }

  // Watch for auto-validation
  if (options.autoValidateDelay && options.autoValidateDelay > 0) {
    watch(
      formData,
      async () => {
        await validate()
      },
      {
        deep: true,
        debounce: options.autoValidateDelay
      }
    )
  }

  // Render function (placeholder for now)
  const renderForm = (): VNode => {
    return h('div', { class: 'ldesign-form' }, [
      h('p', 'Form rendering will be implemented with form components')
    ])
  }

  // Initialize state and event listeners
  initializeState()
  setupEventListeners()

  // Cleanup on unmount
  onUnmounted(() => {
    formEngine.destroy()
  })

  return {
    formData,
    errors,
    loading,
    expanded,
    groupStates,
    formInstance: enhancedFormInstance,
    validate,
    reset,
    setFieldValue,
    getFieldValue,
    submit,
    renderForm,
  }
}