import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  Validator,
  ValidationError,
  StoreConfigValidator,
  TypeGuards,
  Assert,
  AssertionError,
  ErrorHandler,
  safeJsonParse,
  safeJsonStringify,
} from '../utils/validation'

describe('Validator', () => {
  describe('validate', () => {
    it('should validate required fields', () => {
      const result = Validator.validate(null, { required: true })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Value is required')
    })

    it('should validate type', () => {
      const result = Validator.validate('test', { type: 'number' })
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Expected type number')
    })

    it('should validate number range', () => {
      const result = Validator.validate(5, { type: 'number', min: 10, max: 20 })
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('at least 10')
    })

    it('should validate string length', () => {
      const result = Validator.validate('ab', { type: 'string', min: 3, max: 10 })
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('at least 3')
    })

    it('should validate string pattern', () => {
      const result = Validator.validate('test@', {
        type: 'string',
        pattern: /^[a-z]+$/,
      })
      expect(result.valid).toBe(false)
    })

    it('should validate array length', () => {
      const result = Validator.validate([1], { type: 'array', min: 2, max: 5 })
      expect(result.valid).toBe(false)
    })

    it('should run custom validation', () => {
      const result = Validator.validate(10, {
        custom: (value) => value % 2 === 0 || 'Must be even',
      })
      expect(result.valid).toBe(true)

      const result2 = Validator.validate(11, {
        custom: (value) => value % 2 === 0 || 'Must be even',
      })
      expect(result2.valid).toBe(false)
      expect(result2.errors[0]).toBe('Must be even')
    })

    it('should pass validation with valid value', () => {
      const result = Validator.validate('test', {
        required: true,
        type: 'string',
        min: 3,
        max: 10,
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('validateObject', () => {
    it('should validate object properties', () => {
      const obj = {
        name: 'John',
        age: 15,
        email: 'invalid-email',
      }

      const schema = {
        name: { required: true, type: 'string' as const },
        age: { type: 'number' as const, min: 18 },
        email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      }

      const result = Validator.validateObject(obj, schema)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('assert', () => {
    it('should throw ValidationError on invalid value', () => {
      expect(() => {
        Validator.assert('', { required: true })
      }).toThrow(ValidationError)
    })

    it('should not throw on valid value', () => {
      expect(() => {
        Validator.assert('test', { required: true, type: 'string' })
      }).not.toThrow()
    })
  })
})

describe('StoreConfigValidator', () => {
  describe('validateStoreId', () => {
    it('should accept valid store IDs', () => {
      expect(() => {
        StoreConfigValidator.validateStoreId('my-store')
        StoreConfigValidator.validateStoreId('myStore123')
        StoreConfigValidator.validateStoreId('my_store')
      }).not.toThrow()
    })

    it('should reject invalid store IDs', () => {
      expect(() => {
        StoreConfigValidator.validateStoreId('')
      }).toThrow()

      expect(() => {
        StoreConfigValidator.validateStoreId('123store')
      }).toThrow()

      expect(() => {
        StoreConfigValidator.validateStoreId('store@name')
      }).toThrow()
    })
  })

  describe('validateCacheOptions', () => {
    it('should accept valid cache options', () => {
      expect(() => {
        StoreConfigValidator.validateCacheOptions({
          maxSize: 1000,
          defaultTTL: 60000,
        })
      }).not.toThrow()
    })

    it('should reject invalid cache options', () => {
      expect(() => {
        StoreConfigValidator.validateCacheOptions({ maxSize: -1 })
      }).toThrow()

      expect(() => {
        StoreConfigValidator.validateCacheOptions({ defaultTTL: -100 })
      }).toThrow()
    })
  })

  describe('validatePersistOptions', () => {
    it('should accept valid persist options', () => {
      expect(() => {
        StoreConfigValidator.validatePersistOptions({
          key: 'my-store',
          paths: ['user', 'settings'],
        })
      }).not.toThrow()
    })

    it('should reject invalid persist options', () => {
      expect(() => {
        StoreConfigValidator.validatePersistOptions({ key: '' })
      }).toThrow()

      expect(() => {
        StoreConfigValidator.validatePersistOptions({ paths: 'not-array' as any })
      }).toThrow()
    })
  })
})

describe('TypeGuards', () => {
  it('should check object types', () => {
    expect(TypeGuards.isObject({})).toBe(true)
    expect(TypeGuards.isObject([])).toBe(false)
    expect(TypeGuards.isObject(null)).toBe(false)

    expect(TypeGuards.isPlainObject({})).toBe(true)
    expect(TypeGuards.isPlainObject(new Date())).toBe(false)

    expect(TypeGuards.isEmptyObject({})).toBe(true)
    expect(TypeGuards.isEmptyObject({ a: 1 })).toBe(false)
  })

  it('should check function types', () => {
    expect(TypeGuards.isFunction(() => {})).toBe(true)
    expect(TypeGuards.isFunction(function() {})).toBe(true)
    expect(TypeGuards.isFunction({})).toBe(false)

    expect(TypeGuards.isAsyncFunction(async () => {})).toBe(true)
    expect(TypeGuards.isAsyncFunction(() => {})).toBe(false)

    expect(TypeGuards.isPromise(Promise.resolve())).toBe(true)
    expect(TypeGuards.isPromise({ then: () => {} })).toBe(true)
    expect(TypeGuards.isPromise({})).toBe(false)
  })

  it('should check string types', () => {
    expect(TypeGuards.isString('test')).toBe(true)
    expect(TypeGuards.isString('')).toBe(true)
    expect(TypeGuards.isString(123)).toBe(false)

    expect(TypeGuards.isNonEmptyString('test')).toBe(true)
    expect(TypeGuards.isNonEmptyString('')).toBe(false)
    expect(TypeGuards.isNonEmptyString('  ')).toBe(false)
  })

  it('should check number types', () => {
    expect(TypeGuards.isNumber(123)).toBe(true)
    expect(TypeGuards.isNumber(0)).toBe(true)
    expect(TypeGuards.isNumber(NaN)).toBe(false)
    expect(TypeGuards.isNumber(Infinity)).toBe(false)

    expect(TypeGuards.isPositiveInteger(5)).toBe(true)
    expect(TypeGuards.isPositiveInteger(0)).toBe(false)
    expect(TypeGuards.isPositiveInteger(1.5)).toBe(false)
  })

  it('should check array types', () => {
    expect(TypeGuards.isArray([])).toBe(true)
    expect(TypeGuards.isArray([1, 2, 3])).toBe(true)
    expect(TypeGuards.isArray({})).toBe(false)

    expect(TypeGuards.isNonEmptyArray([1])).toBe(true)
    expect(TypeGuards.isNonEmptyArray([])).toBe(false)
  })

  it('should check null and undefined', () => {
    expect(TypeGuards.isNullOrUndefined(null)).toBe(true)
    expect(TypeGuards.isNullOrUndefined(undefined)).toBe(true)
    expect(TypeGuards.isNullOrUndefined(0)).toBe(false)

    expect(TypeGuards.isValidValue(null)).toBe(false)
    expect(TypeGuards.isValidValue(undefined)).toBe(false)
    expect(TypeGuards.isValidValue(0)).toBe(true)
  })
})

describe('Assert', () => {
  it('should assert conditions', () => {
    expect(() => Assert.isTrue(true, 'Error')).not.toThrow()
    expect(() => Assert.isTrue(false, 'Error')).toThrow(AssertionError)

    expect(() => Assert.isFalse(false, 'Error')).not.toThrow()
    expect(() => Assert.isFalse(true, 'Error')).toThrow(AssertionError)
  })

  it('should assert defined values', () => {
    expect(() => Assert.isDefined('value', 'Error')).not.toThrow()
    expect(() => Assert.isDefined(null, 'Error')).toThrow(AssertionError)
    expect(() => Assert.isDefined(undefined, 'Error')).toThrow(AssertionError)
  })

  it('should assert types', () => {
    expect(() => Assert.isObject({}, 'Error')).not.toThrow()
    expect(() => Assert.isObject([], 'Error')).toThrow(AssertionError)

    expect(() => Assert.isArray([], 'Error')).not.toThrow()
    expect(() => Assert.isArray({}, 'Error')).toThrow(AssertionError)

    expect(() => Assert.isFunction(() => {}, 'Error')).not.toThrow()
    expect(() => Assert.isFunction({}, 'Error')).toThrow(AssertionError)

    expect(() => Assert.isString('test', 'Error')).not.toThrow()
    expect(() => Assert.isString(123, 'Error')).toThrow(AssertionError)

    expect(() => Assert.isNumber(123, 'Error')).not.toThrow()
    expect(() => Assert.isNumber('123', 'Error')).toThrow(AssertionError)
  })

  it('should assert ranges', () => {
    expect(() => Assert.inRange(5, 1, 10, 'Error')).not.toThrow()
    expect(() => Assert.inRange(0, 1, 10, 'Error')).toThrow(AssertionError)
    expect(() => Assert.inRange(11, 1, 10, 'Error')).toThrow(AssertionError)
  })

  it('should assert non-empty arrays', () => {
    expect(() => Assert.notEmpty([1], 'Error')).not.toThrow()
    expect(() => Assert.notEmpty([], 'Error')).toThrow(AssertionError)
  })
})

describe('ErrorHandler', () => {
  let originalHandlers: any

  beforeEach(() => {
    originalHandlers = (ErrorHandler as any).handlers
    ;(ErrorHandler as any).handlers = new Map()
  })

  afterEach(() => {
    ;(ErrorHandler as any).handlers = originalHandlers
  })

  it('should register and handle errors', () => {
    let handled = false
    ErrorHandler.register('test', () => {
      handled = true
    })

    const error = new Error('Test error')
    ErrorHandler.handle(error, 'test')

    expect(handled).toBe(true)
  })

  it('should wrap async functions', async () => {
    let handled = false
    ErrorHandler.register('test', () => {
      handled = true
    })

    const wrapped = ErrorHandler.wrapAsync(
      async () => {
        throw new Error('Test error')
      },
      'test'
    )

    try {
      await wrapped()
    } catch (error) {
      // Expected to throw
    }

    expect(handled).toBe(true)
  })

  it('should safely execute functions', async () => {
    let handled = false
    ErrorHandler.register('test', () => {
      handled = true
    })

    const result = await ErrorHandler.safeExecute(
      async () => {
        throw new Error('Test error')
      },
      'test'
    )

    expect(result).toBeNull()
    expect(handled).toBe(true)
  })

  it('should clear handlers', () => {
    ErrorHandler.register('test', () => {})
    ErrorHandler.clear()

    expect((ErrorHandler as any).handlers.size).toBe(0)
  })
})

describe('JSON utilities', () => {
  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"key": "value"}')
      expect(result).toEqual({ key: 'value' })
    })

    it('should return null for invalid JSON', () => {
      const result = safeJsonParse('invalid json')
      expect(result).toBeNull()
    })

    it('should return default value for invalid JSON', () => {
      const result = safeJsonParse('invalid json', { default: 'value' })
      expect(result).toEqual({ default: 'value' })
    })
  })

  describe('safeJsonStringify', () => {
    it('should stringify valid values', () => {
      const result = safeJsonStringify({ key: 'value' })
      expect(result).toBe('{"key":"value"}')
    })

    it('should return null for circular references', () => {
      const obj: any = { a: 1 }
      obj.self = obj

      const result = safeJsonStringify(obj)
      expect(result).toBeNull()
    })

    it('should support pretty printing', () => {
      const result = safeJsonStringify({ key: 'value' }, 2)
      expect(result).toContain('\n')
      expect(result).toContain('  ')
    })
  })
})
