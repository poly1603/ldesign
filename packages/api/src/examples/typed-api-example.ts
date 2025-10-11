/**
 * TypedApiEngine 使用示例
 * 展示如何使用类型安全的 API 引擎
 */

import { createApiEngine } from '../index'
import {
  defineApiMethod,
  defineApiMethods,
  definePlugin,
  toTypedApiEngine,
} from '../types/typed-api'
import type {
  ApiMethodMap,
  TypedApiEngine,
  TypedApiPlugin,
} from '../types/typed-api'

/**
 * 示例 1: 定义类型安全的 API 方法
 */

// 定义用户相关的请求参数和返回类型
interface GetUserParams {
  userId: string
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface UpdateUserParams {
  userId: string
  name?: string
  email?: string
  avatar?: string
}

interface LoginParams {
  username: string
  password: string
}

interface LoginResult {
  token: string
  user: User
  expiresIn: number
}

// 定义 API 方法映射
const userApiMethods = defineApiMethods({
  getUser: defineApiMethod<GetUserParams, User>({
    name: 'getUser',
    config: {
      url: '/api/user/:userId',
      method: 'GET',
    },
  }),
  updateUser: defineApiMethod<UpdateUserParams, User>({
    name: 'updateUser',
    config: {
      url: '/api/user/:userId',
      method: 'PUT',
    },
  }),
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

/**
 * 示例 2: 创建类型安全的插件
 */
const userPlugin: TypedApiPlugin<typeof userApiMethods> = definePlugin({
  name: 'user',
  version: '1.0.0',
  apis: userApiMethods,
})

/**
 * 示例 3: 使用类型安全的 API 引擎
 */
async function exampleUsage() {
  // 创建标准 API 引擎
  const engine = createApiEngine({
    http: {
      baseURL: 'https://api.example.com',
    },
  })

  // 转换为类型安全的引擎
  const typedEngine = toTypedApiEngine<typeof userApiMethods>(engine)

  // 注册插件（带类型检查）
  await typedEngine.use(userPlugin)

  // 类型安全的 API 调用
  // ✅ 参数类型自动推导为 GetUserParams
  // ✅ 返回类型自动推导为 Promise<User>
  const user = await typedEngine.call('getUser', {
    userId: '123',
  })

  console.log(user.name) // ✅ 类型安全，user 有 name 属性

  // ✅ 参数类型检查
  const updatedUser = await typedEngine.call('updateUser', {
    userId: '123',
    name: 'New Name',
  })

  // ✅ 无参数的方法可以省略 params
  await typedEngine.call('logout')

  // ❌ 类型错误示例（以下代码会在编译时报错）
  
  // 错误：参数类型不匹配
  // await typedEngine.call('getUser', {
  //   wrongParam: '123'
  // })

  // 错误：缺少必需参数
  // await typedEngine.call('login')

  // 错误：方法不存在
  // await typedEngine.call('nonExistentMethod', {})

  // 批量调用（类型安全）
  const results = await typedEngine.callBatch([
    {
      methodName: 'getUser',
      params: { userId: '123' },
    },
    {
      methodName: 'getUser',
      params: { userId: '456' },
    },
  ])

  // ✅ results 的类型是 User[]
  results.forEach((user) => {
    console.log(user.name)
  })
}

/**
 * 示例 4: 扩展 API 方法
 */
interface ProductParams {
  productId: string
}

interface Product {
  id: string
  name: string
  price: number
}

// 定义产品 API 方法
const productApiMethods = defineApiMethods({
  getProduct: defineApiMethod<ProductParams, Product>({
    name: 'getProduct',
    config: {
      url: '/api/product/:productId',
      method: 'GET',
    },
  }),
})

// 合并多个 API 方法映射
type AllApiMethods = typeof userApiMethods & typeof productApiMethods

async function extendedUsage() {
  const engine = createApiEngine()
  const typedEngine = toTypedApiEngine<AllApiMethods>(engine)

  // 注册多个插件
  await typedEngine.use(userPlugin)
  await typedEngine.use(
    definePlugin({
      name: 'product',
      apis: productApiMethods,
    }),
  )

  // 现在可以调用所有注册的方法
  const user = await typedEngine.call('getUser', { userId: '123' })
  const product = await typedEngine.call('getProduct', { productId: 'abc' })

  console.log(user.name, product.name)
}

/**
 * 示例 5: 使用泛型创建通用的 CRUD API
 */
function createCrudApi<TEntity, TId = string>(entityName: string) {
  type ListParams = {
    page?: number
    pageSize?: number
    search?: string
  }

  type ListResult<T> = {
    items: T[]
    total: number
    page: number
    pageSize: number
  }

  type CreateParams<T> = Omit<T, 'id'>
  type UpdateParams<T> = Partial<T> & { id: TId }

  return defineApiMethods({
    list: defineApiMethod<ListParams, ListResult<TEntity>>({
      name: `${entityName}.list`,
      config: {
        url: `/api/${entityName}`,
        method: 'GET',
      },
    }),
    get: defineApiMethod<{ id: TId }, TEntity>({
      name: `${entityName}.get`,
      config: {
        url: `/api/${entityName}/:id`,
        method: 'GET',
      },
    }),
    create: defineApiMethod<CreateParams<TEntity>, TEntity>({
      name: `${entityName}.create`,
      config: {
        url: `/api/${entityName}`,
        method: 'POST',
      },
    }),
    update: defineApiMethod<UpdateParams<TEntity>, TEntity>({
      name: `${entityName}.update`,
      config: {
        url: `/api/${entityName}/:id`,
        method: 'PUT',
      },
    }),
    delete: defineApiMethod<{ id: TId }, void>({
      name: `${entityName}.delete`,
      config: {
        url: `/api/${entityName}/:id`,
        method: 'DELETE',
      },
    }),
  })
}

// 使用泛型 CRUD API
interface Article {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
}

const articleApi = createCrudApi<Article>('articles')

async function crudUsage() {
  const engine = createApiEngine()
  const typedEngine = toTypedApiEngine<typeof articleApi>(engine)

  // 注册方法
  typedEngine.registerBatch(articleApi)

  // 列表查询
  const articles = await typedEngine.call('list', {
    page: 1,
    pageSize: 10,
  })

  // 获取单个
  const article = await typedEngine.call('get', { id: '123' })

  // 创建
  const newArticle = await typedEngine.call('create', {
    title: 'New Article',
    content: 'Content...',
    author: 'John',
    createdAt: new Date().toISOString(),
  })

  // 更新
  const updated = await typedEngine.call('update', {
    id: '123',
    title: 'Updated Title',
  })

  // 删除
  await typedEngine.call('delete', { id: '123' })
}

export {
  exampleUsage,
  extendedUsage,
  crudUsage,
  userApiMethods,
  productApiMethods,
  articleApi,
}
