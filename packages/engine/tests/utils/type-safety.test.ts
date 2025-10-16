import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ErrorUtil,
  getTypedConfig,
  InputValidator,
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isPromise,
  isString,
  isValidObject,
  PromiseUtil,
  safeAsync,
  safeDeepClone,
  safeFilter,
  safeGet,
  safeGetNested,
  safeJsonParse,
  safeJsonStringify,
  safeMap,
  safeMerge,
  setTypedConfig,
  TypedConfigWrapper,
  typedEmit,
  typedOn
} from '../../src/utils/type-safety'

// 模拟事件发射器
const mockEventEmitter = {
  emit: vi.fn(),
  on: vi.fn(),
  once: vi.fn()
}

// 模拟配置管理器
const mockConfigManager = {
  get: vi.fn(),
  set: vi.fn()
}

// 模拟插件系统
const mockPluginManager = {
  register: vi.fn(),
  getContext: vi.fn()
}

describe('类型安全事件系统', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('typedEmit', () => {
    it('应该安全地发射事件', () => {
      const result = typedEmit(mockEventEmitter, 'test-event', { data: 'test' })
      
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('test-event', { data: 'test' })
      expect(result.success).toBe(true)
    })

    it('应该处理发射错误', () => {
      mockEventEmitter.emit.mockImplementation(() => {
        throw new Error('Emit failed')
      })

      const result = typedEmit(mockEventEmitter, 'test-event', {})
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Emit failed')
    })

    it('应该验证事件名称类型', () => {
      const result = typedEmit(mockEventEmitter, null as any, {})
      
      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('Event name must be a string')
    })
  })

  describe('typedOn', () => {
    it('应该安全地注册事件监听器', () => {
      const handler = vi.fn()
      const result = typedOn(mockEventEmitter, 'test-event', handler)
      
      expect(mockEventEmitter.on).toHaveBeenCalledWith('test-event', expect.any(Function))
      expect(result.success).toBe(true)
      expect(result.unsubscribe).toBeInstanceOf(Function)
    })

    it('应该处理注册错误', () => {
      mockEventEmitter.on.mockImplementation(() => {
        throw new Error('Registration failed')
      })

      const result = typedOn(mockEventEmitter, 'test-event', vi.fn())
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该验证处理函数类型', () => {
      const result = typedOn(mockEventEmitter, 'test-event', 'not-a-function' as any)
      
      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('Handler must be a function')
    })
  })
})

describe('类型安全配置系统', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigManager.get.mockReturnValue('default-value')
  })

  describe('getTypedConfig', () => {
    it('应该安全地获取配置', () => {
      const result = getTypedConfig(mockConfigManager, 'test.key', 'fallback')
      
      expect(mockConfigManager.get).toHaveBeenCalledWith('test.key')
      expect(result.success).toBe(true)
      expect(result.value).toBe('default-value')
    })

    it('应该在获取失败时返回默认值', () => {
      mockConfigManager.get.mockImplementation(() => {
        throw new Error('Config not found')
      })

      const result = getTypedConfig(mockConfigManager, 'missing.key', 'fallback')
      
      expect(result.success).toBe(false)
      expect(result.value).toBe('fallback')
      expect(result.error).toBeDefined()
    })

    it('应该进行类型验证', () => {
      const validator = (value: any): value is string => typeof value === 'string'
      
      mockConfigManager.get.mockReturnValue(123) // 返回数字，但期望字符串
      
      const result = getTypedConfig(mockConfigManager, 'test.key', 'fallback', validator)
      
      expect(result.success).toBe(false)
      expect(result.value).toBe('fallback')
      expect(result.error?.message).toContain('Type validation failed')
    })
  })

  describe('setTypedConfig', () => {
    it('应该安全地设置配置', () => {
      const result = setTypedConfig(mockConfigManager, 'test.key', 'new-value')
      
      expect(mockConfigManager.set).toHaveBeenCalledWith('test.key', 'new-value')
      expect(result.success).toBe(true)
    })

    it('应该处理设置错误', () => {
      mockConfigManager.set.mockImplementation(() => {
        throw new Error('Set failed')
      })

      const result = setTypedConfig(mockConfigManager, 'test.key', 'value')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})

describe('类型守护函数', () => {
  describe('isValidObject', () => {
    it('应该正确识别有效对象', () => {
      expect(isValidObject({})).toBe(true)
      expect(isValidObject({ key: 'value' })).toBe(true)
      expect(isValidObject([])).toBe(false) // 数组不是普通对象
      expect(isValidObject(null)).toBe(false)
      expect(isValidObject(undefined)).toBe(false)
      expect(isValidObject('string')).toBe(false)
    })
  })

  describe('基本类型守护', () => {
    it('isString应该正确识别字符串', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
    })

    it('isNumber应该正确识别数字', () => {
      expect(isNumber(123)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(Number.NaN)).toBe(false) // NaN不被认为是有效数字
      expect(isNumber('123')).toBe(false)
    })

    it('isBoolean应该正确识别布尔值', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
      expect(isBoolean(0)).toBe(false)
      expect(isBoolean('true')).toBe(false)
    })

    it('isFunction应该正确识别函数', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(async () => {})).toBe(true)
      expect(isFunction({})).toBe(false)
    })

    it('isArray应该正确识别数组', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
      expect(isArray({})).toBe(false)
      expect(isArray('array')).toBe(false)
    })

    it('isPromise应该正确识别Promise', () => {
      expect(isPromise(Promise.resolve())).toBe(true)
      expect(isPromise(new Promise(() => {}))).toBe(true)
      expect(isPromise({ then: () => {} })).toBe(true) // thenable对象
      expect(isPromise({})).toBe(false)
    })
  })
})

describe('安全工具函数', () => {
  describe('safeDeepClone', () => {
    it('应该安全地深拷贝对象', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4, { e: 5 }]
        }
      }

      const result = safeDeepClone(original)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(original)
      expect(result.data).not.toBe(original) // 不是同一个引用
      expect(result.data!.b).not.toBe(original.b) // 深拷贝
    })

    it('应该处理循环引用', () => {
      const obj: any = { a: 1 }
      obj.self = obj // 创建循环引用

      const result = safeDeepClone(obj)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理无法序列化的值', () => {
      const obj = {
        func: () => {},
        symbol: Symbol('test'),
        undef: undefined
      }

      const result = safeDeepClone(obj)
      
      // 函数和Symbol会被忽略，undefined会被忽略
      expect(result.success).toBe(true)
      expect(result.data).toEqual({})
    })
  })

  describe('safeMerge', () => {
    it('应该安全地合并对象', () => {
      const obj1 = { a: 1, b: { c: 2 } }
      const obj2 = { b: { d: 3 }, e: 4 }

      const result = safeMerge(obj1, obj2)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      })
    })

    it('应该处理非对象输入', () => {
      const result = safeMerge('not-object' as any, { a: 1 })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('safeGet和safeGetNested', () => {
    const testObj = {
      a: {
        b: {
          c: 'value'
        }
      },
      arr: [1, 2, { nested: 'array-value' }]
    }

    it('safeGet应该安全地获取属性', () => {
      expect(safeGet(testObj, 'a')).toBe(testObj.a)
      expect(safeGet(testObj, 'missing', 'default')).toBe('default')
      expect(safeGet(null, 'key', 'default')).toBe('default')
    })

    it('safeGetNested应该安全地获取嵌套属性', () => {
      expect(safeGetNested(testObj, 'a.b.c')).toBe('value')
      expect(safeGetNested(testObj, 'a.b.missing', 'default')).toBe('default')
      expect(safeGetNested(testObj, 'arr.2.nested')).toBe('array-value')
      expect(safeGetNested(null, 'a.b.c', 'default')).toBe('default')
    })
  })

  describe('safeFilter和safeMap', () => {
    it('safeFilter应该安全地过滤数组', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = safeFilter(arr, x => x > 3)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual([4, 5])
    })

    it('safeFilter应该处理非数组输入', () => {
      const result = safeFilter('not-array' as any, () => true)
      
      expect(result.success).toBe(false)
      expect(result.data).toEqual([])
    })

    it('safeMap应该安全地映射数组', () => {
      const arr = [1, 2, 3]
      const result = safeMap(arr, x => x * 2)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual([2, 4, 6])
    })

    it('safeMap应该处理映射函数错误', () => {
      const arr = [1, 2, 3]
      const result = safeMap(arr, () => {
        throw new Error('Map error')
      })
      
      expect(result.success).toBe(false)
      expect(result.data).toEqual([])
    })
  })

  describe('safeAsync', () => {
    it('应该安全地执行异步函数', async () => {
      const asyncFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'success'
      }

      const result = await safeAsync(asyncFn)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
    })

    it('应该处理异步函数错误', async () => {
      const asyncFn = async () => {
        throw new Error('Async error')
      }

      const result = await safeAsync(asyncFn)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Async error')
    })

    it('应该支持超时', async () => {
      const slowAsyncFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return 'too-slow'
      }

      const result = await safeAsync(slowAsyncFn, 100)
      
      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('timeout')
    })
  })

  describe('jSON安全操作', () => {
    it('safeJsonParse应该安全地解析JSON', () => {
      const validJson = '{"key": "value"}'
      const result = safeJsonParse(validJson)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ key: 'value' })
    })

    it('safeJsonParse应该处理无效JSON', () => {
      const invalidJson = '{"invalid": json}'
      const result = safeJsonParse(invalidJson, { fallback: true })
      
      expect(result.success).toBe(false)
      expect(result.data).toEqual({ fallback: true })
    })

    it('safeJsonStringify应该安全地序列化对象', () => {
      const obj = { key: 'value', num: 123 }
      const result = safeJsonStringify(obj)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('{"key":"value","num":123}')
    })

    it('safeJsonStringify应该处理循环引用', () => {
      const obj: any = { key: 'value' }
      obj.self = obj
      
      const result = safeJsonStringify(obj)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})

describe('inputValidator', () => {
  let validator: InputValidator

  beforeEach(() => {
    validator = new InputValidator()
  })

  it('应该验证必填字段', () => {
    const schema = {
      name: { required: true, type: 'string' as const },
      age: { required: false, type: 'number' as const }
    }

    const result1 = validator.validate({ name: 'John', age: 25 }, schema)
    expect(result1.success).toBe(true)

    const result2 = validator.validate({ age: 25 }, schema)
    expect(result2.success).toBe(false)
    expect(result2.errors).toContain('name is required')
  })

  it('应该验证字段类型', () => {
    const schema = {
      name: { required: true, type: 'string' as const },
      age: { required: true, type: 'number' as const }
    }

    const result = validator.validate({ name: 123, age: '25' }, schema)
    
    expect(result.success).toBe(false)
    expect(result.errors).toContain('name must be a string')
    expect(result.errors).toContain('age must be a number')
  })

  it('应该支持自定义验证器', () => {
    const schema = {
      email: {
        required: true,
        type: 'string' as const,
        validator: (value: string) => value.includes('@') ? null : 'Invalid email format'
      }
    }

    const result1 = validator.validate({ email: 'test@example.com' }, schema)
    expect(result1.success).toBe(true)

    const result2 = validator.validate({ email: 'invalid-email' }, schema)
    expect(result2.success).toBe(false)
    expect(result2.errors).toContain('Invalid email format')
  })
})

describe('errorUtil', () => {
  it('应该格式化错误', () => {
    const error = new Error('Test error')
    const formatted = ErrorUtil.formatError(error)
    
    expect(formatted).toContain('Test error')
    expect(formatted).toContain('Error')
  })

  it('应该创建类型化错误', () => {
    const error = ErrorUtil.createTypedError('VALIDATION_ERROR', 'Invalid input', { field: 'name' })
    
    expect(error.name).toBe('TypedError')
    expect(error.message).toBe('Invalid input')
    expect(error.type).toBe('VALIDATION_ERROR')
    expect(error.details).toEqual({ field: 'name' })
  })

  it('应该安全地提取错误信息', () => {
    expect(ErrorUtil.safeErrorMessage(new Error('Test'))).toBe('Test')
    expect(ErrorUtil.safeErrorMessage('String error')).toBe('String error')
    expect(ErrorUtil.safeErrorMessage({ message: 'Object error' })).toBe('Object error')
    expect(ErrorUtil.safeErrorMessage(null)).toBe('Unknown error')
  })
})

describe('typedConfigWrapper', () => {
  it('应该提供类型安全的配置访问', () => {
    const config = { database: { host: 'localhost', port: 5432 } }
    const wrapper = new TypedConfigWrapper(config)
    
    expect(wrapper.get('database.host')).toBe('localhost')
    expect(wrapper.get('database.port')).toBe(5432)
    expect(wrapper.get('missing.key', 'default')).toBe('default')
  })

  it('应该支持配置更新', () => {
    const config = { key: 'value' }
    const wrapper = new TypedConfigWrapper(config)
    
    wrapper.set('key', 'new-value')
    expect(wrapper.get('key')).toBe('new-value')
    
    wrapper.set('nested.key', 'nested-value')
    expect(wrapper.get('nested.key')).toBe('nested-value')
  })
})

describe('promiseUtil', () => {
  it('应该支持Promise重试', async () => {
    let attempts = 0
    const flakyFn = async () => {
      attempts++
      if (attempts < 3) {
        throw new Error('Flaky error')
      }
      return 'success'
    }

    const result = await PromiseUtil.retry(flakyFn, 3, 10)
    
    expect(result).toBe('success')
    expect(attempts).toBe(3)
  })

  it('应该支持Promise超时', async () => {
    const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 200))
    
    await expect(PromiseUtil.timeout(slowPromise, 100)).rejects.toThrow('Promise timed out')
  })

  it('应该支持Promise批处理', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.reject(new Error('error')),
      Promise.resolve(4)
    ]

    const results = await PromiseUtil.allSettledTyped(promises)
    
    expect(results.fulfilled).toHaveLength(3)
    expect(results.rejected).toHaveLength(1)
    expect(results.fulfilled).toEqual([1, 2, 4])
    expect(results.rejected[0]).toBeInstanceOf(Error)
  })
})
