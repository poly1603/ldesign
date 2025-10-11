/**
 * TypedApiEngine 测试
 */

import { describe, expect, it } from 'vitest'
import { createApiEngine } from '../src/index'
import {
  defineApiMethod,
  defineApiMethods,
  definePlugin,
  toTypedApiEngine,
} from '../src/types/typed-api'

describe('TypedApiEngine', () => {
  it('应该正确推导方法参数和返回类型', async () => {
    // 定义类型
    interface GetUserParams {
      userId: string
    }

    interface User {
      id: string
      name: string
      email: string
    }

    // 定义方法
    const methods = defineApiMethods({
      getUser: defineApiMethod<GetUserParams, User>({
        name: 'getUser',
        config: {
          url: '/api/user/:userId',
          method: 'GET',
        },
        transform: (response) => response.data,
      }),
    })

    // 创建引擎
    const engine = createApiEngine({
      http: {
        baseURL: 'https://api.example.com',
      },
    })

    const typedEngine = toTypedApiEngine<typeof methods>(engine)

    // 注册方法
    typedEngine.register('getUser', methods.getUser)

    // 验证方法存在
    expect(typedEngine.hasMethod('getUser')).toBe(true)
  })

  it('应该支持类型安全的插件注册', async () => {
    interface LoginParams {
      username: string
      password: string
    }

    interface LoginResult {
      token: string
      userId: string
    }

    const authMethods = defineApiMethods({
      login: defineApiMethod<LoginParams, LoginResult>({
        name: 'login',
        config: {
          url: '/api/auth/login',
          method: 'POST',
        },
      }),
      logout: defineApiMethod<void, void>({
        name: 'logout',
        config: {
          url: '/api/auth/logout',
          method: 'POST',
        },
      }),
    })

    const authPlugin = definePlugin({
      name: 'auth',
      version: '1.0.0',
      apis: authMethods,
    })

    const engine = createApiEngine()
    const typedEngine = toTypedApiEngine<typeof authMethods>(engine)

    await typedEngine.use(authPlugin)

    expect(typedEngine.hasMethod('login')).toBe(true)
    expect(typedEngine.hasMethod('logout')).toBe(true)
  })

  it('应该支持批量注册方法', () => {
    interface UserParams {
      id: string
    }

    interface User {
      id: string
      name: string
    }

    interface ProductParams {
      id: string
    }

    interface Product {
      id: string
      name: string
      price: number
    }

    const methods = defineApiMethods({
      getUser: defineApiMethod<UserParams, User>({
        name: 'getUser',
        config: { url: '/api/user/:id', method: 'GET' },
      }),
      getProduct: defineApiMethod<ProductParams, Product>({
        name: 'getProduct',
        config: { url: '/api/product/:id', method: 'GET' },
      }),
    })

    const engine = createApiEngine()
    const typedEngine = toTypedApiEngine<typeof methods>(engine)

    // 批量注册
    typedEngine.registerBatch(methods)

    expect(typedEngine.hasMethod('getUser')).toBe(true)
    expect(typedEngine.hasMethod('getProduct')).toBe(true)
  })

  it('defineApiMethod 应该返回正确的配置', () => {
    interface TestParams {
      id: string
    }

    interface TestResult {
      success: boolean
    }

    const method = defineApiMethod<TestParams, TestResult>({
      name: 'test',
      config: {
        url: '/api/test',
        method: 'POST',
      },
      transform: (response) => response.data,
    })

    expect(method.config.name).toBe('test')
    expect(method.config.config.url).toBe('/api/test')
    expect(method.config.config.method).toBe('POST')
    expect(method.config.transform).toBeDefined()
  })

  it('defineApiMethods 应该返回方法映射', () => {
    const methods = defineApiMethods({
      method1: defineApiMethod({
        name: 'method1',
        config: { url: '/api/1', method: 'GET' },
      }),
      method2: defineApiMethod({
        name: 'method2',
        config: { url: '/api/2', method: 'POST' },
      }),
    })

    expect(methods).toHaveProperty('method1')
    expect(methods).toHaveProperty('method2')
    expect(methods.method1.config.name).toBe('method1')
    expect(methods.method2.config.name).toBe('method2')
  })

  it('definePlugin 应该返回插件配置', () => {
    const methods = defineApiMethods({
      test: defineApiMethod({
        name: 'test',
        config: { url: '/api/test', method: 'GET' },
      }),
    })

    const plugin = definePlugin({
      name: 'testPlugin',
      version: '1.0.0',
      apis: methods,
    })

    expect(plugin.name).toBe('testPlugin')
    expect(plugin.version).toBe('1.0.0')
    expect(plugin.apis).toBe(methods)
  })

  it('应该支持方法级配置', () => {
    interface TestParams {
      id: string
    }

    interface TestResult {
      data: string
    }

    const method = defineApiMethod<TestParams, TestResult>({
      name: 'test',
      config: {
        url: '/api/test/:id',
        method: 'GET',
      },
      cache: {
        enabled: true,
        ttl: 60000,
      },
      retry: {
        enabled: true,
        retries: 3,
      },
      onSuccess: (data) => {
        console.log('Success:', data)
      },
      onError: (error) => {
        console.error('Error:', error)
      },
    })

    expect(method.config.cache).toBeDefined()
    expect(method.config.cache?.enabled).toBe(true)
    expect(method.config.retry).toBeDefined()
    expect(method.config.retry?.retries).toBe(3)
    expect(method.config.onSuccess).toBeDefined()
    expect(method.config.onError).toBeDefined()
  })

  it('应该支持泛型 CRUD 方法定义', () => {
    interface Entity {
      id: string
      name: string
    }

    type ListParams = {
      page: number
      pageSize: number
    }

    type ListResult<T> = {
      items: T[]
      total: number
    }

    const crudMethods = defineApiMethods({
      list: defineApiMethod<ListParams, ListResult<Entity>>({
        name: 'list',
        config: { url: '/api/entities', method: 'GET' },
      }),
      get: defineApiMethod<{ id: string }, Entity>({
        name: 'get',
        config: { url: '/api/entities/:id', method: 'GET' },
      }),
      create: defineApiMethod<Omit<Entity, 'id'>, Entity>({
        name: 'create',
        config: { url: '/api/entities', method: 'POST' },
      }),
      update: defineApiMethod<Entity, Entity>({
        name: 'update',
        config: { url: '/api/entities/:id', method: 'PUT' },
      }),
      delete: defineApiMethod<{ id: string }, void>({
        name: 'delete',
        config: { url: '/api/entities/:id', method: 'DELETE' },
      }),
    })

    expect(crudMethods.list.config.name).toBe('list')
    expect(crudMethods.get.config.name).toBe('get')
    expect(crudMethods.create.config.name).toBe('create')
    expect(crudMethods.update.config.name).toBe('update')
    expect(crudMethods.delete.config.name).toBe('delete')
  })
})
