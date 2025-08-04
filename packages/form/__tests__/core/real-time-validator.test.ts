import type { FormItemConfig, ValidationRule } from '../../src/types'
import { describe, expect, it, vi } from 'vitest'
import { createRealTimeValidator, RealTimeValidator } from '../../src/core/real-time-validator'
import { ValidationEngine } from '../../src/core/validation-engine'

describe('realTimeValidator', () => {
  let validationEngine: ValidationEngine
  let validator: RealTimeValidator

  beforeEach(() => {
    validationEngine = new ValidationEngine()
    validator = new RealTimeValidator(validationEngine, {
      validateOnChange: true,
      validateOnBlur: true,
      debounceTime: 100,
    })
  })

  afterEach(() => {
    validator.destroy()
  })

  describe('constructor and initialization', () => {
    it('should create real-time validator', () => {
      expect(validator).toBeInstanceOf(RealTimeValidator)
    })

    it('should create with helper function', () => {
      const testValidator = createRealTimeValidator(validationEngine)
      expect(testValidator).toBeInstanceOf(RealTimeValidator)
      testValidator.destroy()
    })

    it('should initialize fields from form items', () => {
      const items: FormItemConfig[] = [
        {
          key: 'name',
          label: 'Name',
          type: 'input',
          validation: [
            {
              id: 'required-name',
              type: 'required',
              message: 'Name is required',
            },
          ],
        },
        {
          key: 'email',
          label: 'Email',
          type: 'email',
          validation: [
            {
              id: 'email-format',
              type: 'email',
              message: 'Invalid email format',
            },
          ],
        },
      ]

      validator.initializeFields(items)

      expect(validator.getValidationState('name')).toBeDefined()
      expect(validator.getValidationState('email')).toBeDefined()
      expect(validationEngine.hasRules('name')).toBe(true)
      expect(validationEngine.hasRules('email')).toBe(true)
    })
  })

  describe('field validation', () => {
    beforeEach(() => {
      const nameRule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      validationEngine.addRule('name', nameRule)
      validator.initializeField('name')
    })

    it('should validate field on change', async () => {
      const result = await validator.validateField('name', '', {}, 'change')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name is required')

      const state = validator.getValidationState('name')
      expect(state?.hasError).toBe(true)
      expect(state?.errors).toContain('Name is required')
    })

    it('should validate field on blur', async () => {
      const result = await validator.validateField('name', 'John', {}, 'blur')

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)

      const state = validator.getValidationState('name')
      expect(state?.hasError).toBe(false)
    })

    it('should skip validation based on trigger config', async () => {
      const testValidator = new RealTimeValidator(validationEngine, {
        validateOnChange: false,
        validateOnBlur: true,
      })
      testValidator.initializeField('name')

      const result = await testValidator.validateField('name', '', {}, 'change')

      expect(result.valid).toBe(true) // 跳过验证

      testValidator.destroy()
    })

    it('should use debounced validation', async () => {
      const eventCallback = vi.fn()
      validator.onValidation(eventCallback)

      // 快速连续调用
      validator.validateField('name', '', {}, 'change')
      validator.validateField('name', 'a', {}, 'change')
      validator.validateField('name', 'ab', {}, 'change')

      // 立即检查，由于防抖，可能还没有验证结果
      expect(eventCallback).toHaveBeenCalledTimes(0)

      // 等待防抖延迟
      await new Promise(resolve => setTimeout(resolve, 150))

      // 防抖后应该只验证最后一次
      expect(eventCallback).toHaveBeenCalledTimes(1)
    })

    it('should not debounce manual and submit triggers', async () => {
      const eventCallback = vi.fn()
      validator.onValidation(eventCallback)

      await validator.validateField('name', '', {}, 'manual')
      await validator.validateField('name', '', {}, 'submit')

      expect(eventCallback).toHaveBeenCalledTimes(2)
    })
  })

  describe('validate all fields', () => {
    beforeEach(() => {
      const nameRule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      const emailRule: ValidationRule = {
        id: 'email-format',
        type: 'email',
        message: 'Invalid email format',
      }

      validationEngine.addRule('name', nameRule)
      validationEngine.addRule('email', emailRule)
      validator.initializeField('name')
      validator.initializeField('email')
    })

    it('should validate all fields', async () => {
      const result = await validator.validateAll({
        name: '',
        email: 'invalid-email',
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('Name is required')
      expect(result.errors).toContain('Invalid email format')
    })

    it('should return valid result when all fields are valid', async () => {
      const result = await validator.validateAll({
        name: 'John',
        email: 'john@example.com',
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('error management', () => {
    beforeEach(() => {
      const nameRule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      validationEngine.addRule('name', nameRule)
      validator.initializeField('name')
    })

    it('should clear specific field errors', async () => {
      await validator.validateField('name', '', {}, 'manual')
      expect(validator.hasErrors('name')).toBe(true)

      validator.clearErrors('name')
      expect(validator.hasErrors('name')).toBe(false)
      expect(validator.getErrors('name')).toHaveLength(0)
    })

    it('should clear all errors', async () => {
      validator.initializeField('email')
      await validator.validateField('name', '', {}, 'manual')
      await validator.validateField('email', '', {}, 'manual')

      validator.clearErrors()
      expect(validator.hasErrors()).toBe(false)
    })

    it('should get errors for specific field', async () => {
      await validator.validateField('name', '', {}, 'manual')

      const errors = validator.getErrors('name')
      expect(errors).toContain('Name is required')
    })

    it('should get all errors', async () => {
      const emailRule: ValidationRule = {
        id: 'required-email',
        type: 'required',
        message: 'Email is required',
      }
      validationEngine.addRule('email', emailRule)
      validator.initializeField('email')

      await validator.validateField('name', '', {}, 'manual')
      await validator.validateField('email', '', {}, 'manual')

      const allErrors = validator.getErrors()
      expect(allErrors).toHaveLength(2)
    })
  })

  describe('validation states', () => {
    beforeEach(() => {
      validator.initializeField('name')
    })

    it('should get validation state for field', () => {
      const state = validator.getValidationState('name')

      expect(state).toBeDefined()
      expect(state?.isValidating).toBe(false)
      expect(state?.hasError).toBe(false)
      expect(state?.errors).toHaveLength(0)
    })

    it('should get all validation states', () => {
      validator.initializeField('email')

      const allStates = validator.getAllValidationStates()

      expect(allStates.name).toBeDefined()
      expect(allStates.email).toBeDefined()
    })

    it('should update validation state during validation', async () => {
      const nameRule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      validationEngine.addRule('name', nameRule)

      await validator.validateField('name', '', {}, 'manual')

      const state = validator.getValidationState('name')
      expect(state?.hasError).toBe(true)
      expect(state?.lastValidated).toBeGreaterThan(0)
      expect(state?.trigger).toBe('manual')
    })
  })

  describe('dependencies', () => {
    beforeEach(() => {
      validator.initializeField('password')
      validator.initializeField('confirmPassword')

      const passwordRule: ValidationRule = {
        id: 'required-password',
        type: 'required',
        message: 'Password is required',
      }
      const confirmRule: ValidationRule = {
        id: 'match-password',
        type: 'custom',
        message: 'Passwords do not match',
        validator: (value, allValues) => {
          return value === allValues?.password
        },
      }

      validationEngine.addRule('password', passwordRule)
      validationEngine.addRule('confirmPassword', confirmRule)
    })

    it('should set and validate dependencies', async () => {
      validator.setDependencies('confirmPassword', [
        { field: 'password' },
      ])

      const result = await validator.validateAll({
        password: 'secret123',
        confirmPassword: 'different',
      })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Passwords do not match')
    })

    it('should validate dependencies with conditions', async () => {
      validator.setDependencies('confirmPassword', [
        {
          field: 'password',
          condition: (confirmValue, passwordValue) => passwordValue.length > 0,
        },
      ])

      // 当密码为空时，不应该验证确认密码
      await validator.validateAll({
        password: '',
        confirmPassword: 'something',
      })

      const confirmState = validator.getValidationState('confirmPassword')
      expect(confirmState?.hasError).toBe(false)
    })
  })

  describe('events', () => {
    beforeEach(() => {
      const nameRule: ValidationRule = {
        id: 'required-name',
        type: 'required',
        message: 'Name is required',
      }
      validationEngine.addRule('name', nameRule)
      validator.initializeField('name')
    })

    it('should emit validation events', async () => {
      const validationCallback = vi.fn()
      validator.onValidation(validationCallback)

      await validator.validateField('name', '', {}, 'change')

      expect(validationCallback).toHaveBeenCalledWith({
        key: 'name',
        value: '',
        result: {
          valid: false,
          errors: ['Name is required'],
          warnings: [],
        },
        trigger: 'change',
        timestamp: expect.any(Number),
      })
    })

    it('should emit error change events', async () => {
      const errorChangeCallback = vi.fn()
      validator.onErrorChange(errorChangeCallback)

      await validator.validateField('name', '', {}, 'manual')

      expect(errorChangeCallback).toHaveBeenCalledWith('name', ['Name is required'])
    })
  })

  describe('configuration updates', () => {
    it('should update configuration', () => {
      validator.updateConfig({
        validateOnChange: false,
        debounceTime: 500,
      })

      // 配置更新后，change触发器应该被禁用
      expect(validator.config.validateOnChange).toBe(false)
      expect(validator.config.debounceTime).toBe(500)
    })

    it('should recreate debounced validators when debounce time changes', () => {
      validator.initializeField('test')
      const originalValidator = validator.debouncedValidators.get('test')

      validator.updateConfig({ debounceTime: 500 })
      const newValidator = validator.debouncedValidators.get('test')

      expect(newValidator).not.toBe(originalValidator)
    })
  })

  describe('error handling', () => {
    it('should handle validation engine errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // 模拟验证引擎抛出错误
      vi.spyOn(validationEngine, 'validate').mockRejectedValue(new Error('Validation engine error'))

      validator.initializeField('test')
      const result = await validator.validateField('test', 'value', {}, 'manual')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('验证过程中发生错误')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('cleanup', () => {
    it('should destroy properly', () => {
      validator.initializeField('test')
      expect(validator.getValidationState('test')).toBeDefined()

      validator.destroy()
      expect(validator.getAllValidationStates()).toEqual({})
    })

    it('should cancel debounced validators on destroy', () => {
      validator.initializeField('test')
      const debouncedValidator = validator.debouncedValidators.get('test')
      const cancelSpy = vi.spyOn(debouncedValidator!, 'cancel')

      validator.destroy()
      expect(cancelSpy).toHaveBeenCalled()
    })
  })
})
