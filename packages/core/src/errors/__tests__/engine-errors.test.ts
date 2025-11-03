import { describe, it, expect } from 'vitest'
import {
  EngineError,
  PluginError,
  CacheError,
  StateError,
  EventError,
  MiddlewareError,
  LifecycleError,
  DIError,
  ConfigError,
  ErrorCodes
} from '../engine-errors'

describe('EngineError', () => {
  it('应该创建基础错误', () => {
    const error = new EngineError('TEST_ERROR', '测试错误')
    
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('EngineError')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.message).toBe('测试错误')
    expect(error.timestamp).toBeGreaterThan(0)
  })

  it('应该包含错误详情', () => {
    const details = { key: 'value', count: 123 }
    const error = new EngineError('TEST_ERROR', '测试错误', details)
    
    expect(error.details).toEqual(details)
  })

  it('应该正确转换为 JSON', () => {
    const error = new EngineError('TEST_ERROR', '测试错误', { key: 'value' })
    const json = error.toJSON()
    
    expect(json.name).toBe('EngineError')
    expect(json.code).toBe('TEST_ERROR')
    expect(json.message).toBe('测试错误')
    expect(json.details).toEqual({ key: 'value' })
    expect(json.timestamp).toBeGreaterThan(0)
    expect(json.stack).toBeDefined()
  })

  it('应该正确转换为字符串', () => {
    const error = new EngineError('TEST_ERROR', '测试错误', { key: 'value' })
    const str = error.toString()
    
    expect(str).toContain('EngineError')
    expect(str).toContain('TEST_ERROR')
    expect(str).toContain('测试错误')
    expect(str).toContain('key')
  })
})

describe('PluginError', () => {
  it('应该创建插件错误', () => {
    const error = new PluginError(
      ErrorCodes.PLUGIN_NOT_FOUND,
      '插件未找到',
      'my-plugin'
    )
    
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('PluginError')
    expect(error.pluginName).toBe('my-plugin')
    expect(error.details?.pluginName).toBe('my-plugin')
  })
})

describe('CacheError', () => {
  it('应该创建缓存错误', () => {
    const error = new CacheError(
      ErrorCodes.CACHE_INVALID_KEY,
      '无效的缓存键',
      'invalid-key'
    )
    
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('CacheError')
    expect(error.key).toBe('invalid-key')
  })
})

describe('StateError', () => {
  it('应该创建状态错误', () => {
    const error = new StateError(
      ErrorCodes.STATE_INVALID_PATH,
      '无效的状态路径',
      'user.invalid.path'
    )
    
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('StateError')
    expect(error.path).toBe('user.invalid.path')
  })
})

describe('EventError', () => {
  it('应该创建事件错误', () => {
    const error = new EventError(
      ErrorCodes.EVENT_INVALID_NAME,
      '无效的事件名称',
      'invalid:event'
    )
    
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('EventError')
    expect(error.eventName).toBe('invalid:event')
  })
})

describe('MiddlewareError', () => {
  it('应该创建中间件错误', () => {
    const error = new MiddlewareError(
      ErrorCodes.MIDDLEWARE_EXECUTION_FAILED,
      '中间件执行失败',
      'auth-middleware'
    )
    
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('MiddlewareError')
    expect(error.middlewareName).toBe('auth-middleware')
  })
})

describe('LifecycleError', () => {
  it('应该创建生命周期错误', () => {
    const error = new LifecycleError(
      ErrorCodes.LIFECYCLE_INVALID_PHASE,
      '无效的生命周期阶段',
      'beforeMount'
    )
    
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('LifecycleError')
    expect(error.phase).toBe('beforeMount')
  })
})

describe('DIError', () => {
  it('应该创建依赖注入错误', () => {
    const error = new DIError(
      ErrorCodes.DI_SERVICE_NOT_FOUND,
      '服务未找到',
      'UserService'
    )
    
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('DIError')
    expect(error.serviceName).toBe('UserService')
  })
})

describe('ConfigError', () => {
  it('应该创建配置错误', () => {
    const error = new ConfigError(
      ErrorCodes.CONFIG_INVALID_KEY,
      '无效的配置键',
      'app.timeout'
    )
    
    expect(error).toBeInstanceOf(EngineError)
    expect(error.name).toBe('ConfigError')
    expect(error.configKey).toBe('app.timeout')
  })
})

describe('ErrorCodes', () => {
  it('应该包含所有错误代码', () => {
    expect(ErrorCodes.PLUGIN_NOT_FOUND).toBe('PLUGIN_NOT_FOUND')
    expect(ErrorCodes.CACHE_INVALID_KEY).toBe('CACHE_INVALID_KEY')
    expect(ErrorCodes.STATE_INVALID_PATH).toBe('STATE_INVALID_PATH')
    expect(ErrorCodes.EVENT_INVALID_NAME).toBe('EVENT_INVALID_NAME')
    expect(ErrorCodes.MIDDLEWARE_EXECUTION_FAILED).toBe('MIDDLEWARE_EXECUTION_FAILED')
    expect(ErrorCodes.LIFECYCLE_INVALID_PHASE).toBe('LIFECYCLE_INVALID_PHASE')
    expect(ErrorCodes.DI_SERVICE_NOT_FOUND).toBe('DI_SERVICE_NOT_FOUND')
    expect(ErrorCodes.CONFIG_INVALID_KEY).toBe('CONFIG_INVALID_KEY')
  })
})

describe('错误堆栈跟踪', () => {
  it('应该包含正确的堆栈跟踪', () => {
    const error = new EngineError('TEST_ERROR', '测试错误')
    
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('EngineError')
  })

  it('应该在子类中保持正确的堆栈跟踪', () => {
    const error = new PluginError(
      ErrorCodes.PLUGIN_NOT_FOUND,
      '插件未找到',
      'my-plugin'
    )
    
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('PluginError')
  })
})

describe('错误继承', () => {
  it('所有错误类型都应该继承自 EngineError', () => {
    const pluginError = new PluginError('CODE', 'message', 'plugin')
    const cacheError = new CacheError('CODE', 'message', 'key')
    const stateError = new StateError('CODE', 'message', 'path')
    const eventError = new EventError('CODE', 'message', 'event')
    const middlewareError = new MiddlewareError('CODE', 'message', 'middleware')
    const lifecycleError = new LifecycleError('CODE', 'message', 'phase')
    const diError = new DIError('CODE', 'message', 'service')
    const configError = new ConfigError('CODE', 'message', 'key')
    
    expect(pluginError).toBeInstanceOf(EngineError)
    expect(cacheError).toBeInstanceOf(EngineError)
    expect(stateError).toBeInstanceOf(EngineError)
    expect(eventError).toBeInstanceOf(EngineError)
    expect(middlewareError).toBeInstanceOf(EngineError)
    expect(lifecycleError).toBeInstanceOf(EngineError)
    expect(diError).toBeInstanceOf(EngineError)
    expect(configError).toBeInstanceOf(EngineError)
  })

  it('所有错误类型都应该继承自 Error', () => {
    const error = new EngineError('CODE', 'message')
    
    expect(error).toBeInstanceOf(Error)
  })
})

describe('错误详情合并', () => {
  it('应该正确合并特定字段和额外详情', () => {
    const error = new PluginError(
      ErrorCodes.PLUGIN_NOT_FOUND,
      '插件未找到',
      'my-plugin',
      { version: '1.0.0', author: 'test' }
    )
    
    expect(error.details).toEqual({
      pluginName: 'my-plugin',
      version: '1.0.0',
      author: 'test'
    })
  })
})

