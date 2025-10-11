# TypeScript 类型系统指南

@ldesign/template 包提供了完整的 TypeScript 类型系统，确保类型安全和更好的开发体验。

## 📑 目录

- [通用类型](#通用类型)
- [类型守卫](#类型守卫)
- [类型辅助工具](#类型辅助工具)
- [实际应用示例](#实际应用示例)
- [最佳实践](#最佳实践)

## 🎯 通用类型

### 基础类型

```typescript
import type { Primitive, JsonValue, Dictionary } from '@ldesign/template'

// 基础原始类型
const primitiveValue: Primitive = 'hello' // string | number | boolean | null | undefined | symbol | bigint

// JSON 值类型
const jsonData: JsonValue = {
  name: 'user',
  age: 25,
  tags: ['tag1', 'tag2']
}

// 字典类型
const config: Dictionary<string> = {
  apiUrl: 'https://api.example.com',
  timeout: '5000'
}
```

### 深度类型操作

```typescript
import type { DeepReadonly, DeepPartial, DeepRequired } from '@ldesign/template'

interface Config {
  server: {
    host: string
    port: number
    ssl?: {
      enabled: boolean
      cert?: string
    }
  }
  cache: {
    ttl: number
  }
}

// 深度只读
const readonlyConfig: DeepReadonly<Config> = {
  server: { host: 'localhost', port: 3000 },
  cache: { ttl: 3600 }
}
// readonlyConfig.server.host = 'new' // ❌ 错误：只读属性

// 深度可选
const partialConfig: DeepPartial<Config> = {
  server: {
    host: 'localhost'
    // port 可选
  }
  // cache 可选
}

// 深度必填
const requiredConfig: DeepRequired<Config> = {
  server: {
    host: 'localhost',
    port: 3000,
    ssl: {
      enabled: true,
      cert: '/path/to/cert' // 必填
    }
  },
  cache: { ttl: 3600 }
}
```

### 函数类型

```typescript
import type { 
  AnyFunction, 
  AsyncFunction, 
  Callback, 
  EventHandler 
} from '@ldesign/template'

// 通用函数类型
const fn: AnyFunction = (a, b) => a + b

// 异步函数类型
const asyncFn: AsyncFunction<string> = async () => {
  return 'result'
}

// 回调函数类型
const callback: Callback<number> = (err, result) => {
  if (err) console.error(err)
  else console.log(result)
}

// 事件处理器类型
const handleClick: EventHandler<MouseEvent> = async (event) => {
  console.log(event.clientX, event.clientY)
}
```

### 可选/可空类型

```typescript
import type { Nullable, Optional, Maybe } from '@ldesign/template'

// 可空类型（允许 null）
const nullableValue: Nullable<string> = null

// 可选类型（允许 undefined）
const optionalValue: Optional<number> = undefined

// Maybe 类型（允许 null 和 undefined）
const maybeValue: Maybe<boolean> = null // 或 undefined 或 boolean
```

### 对象操作类型

```typescript
import type { Merge, Replace, PartialBy, RequiredBy } from '@ldesign/template'

interface Base {
  id: number
  name: string
}

interface Extension {
  name: string // 会覆盖 Base 的 name
  email: string
}

// 合并类型
type Merged = Merge<Base, Extension>
// { id: number; name: string; email: string }

// 替换类型
type Replaced = Replace<Base, 'name', number>
// { id: number; name: number }

// 部分可选
type PartialName = PartialBy<Base, 'name'>
// { id: number; name?: string }

// 部分必填
interface User {
  id?: number
  name?: string
}
type RequiredUser = RequiredBy<User, 'name'>
// { id?: number; name: string }
```

## 🛡️ 类型守卫

### 基础类型守卫

```typescript
import { 
  isString, 
  isNumber, 
  isBoolean, 
  isArray, 
  isObject 
} from '@ldesign/template'

function processValue(value: unknown) {
  if (isString(value)) {
    // value 类型为 string
    console.log(value.toUpperCase())
  }
  
  if (isNumber(value)) {
    // value 类型为 number
    console.log(value.toFixed(2))
  }
  
  if (isArray(value)) {
    // value 类型为 unknown[]
    console.log(value.length)
  }
}
```

### 复合类型守卫

```typescript
import { 
  and, 
  or, 
  not, 
  arrayOf, 
  nullable 
} from '@ldesign/template'

// 组合守卫（与）
const isStringArray = arrayOf(isString)
if (isStringArray(value)) {
  // value 类型为 string[]
  value.forEach(s => console.log(s.toUpperCase()))
}

// 可空守卫
const isNullableString = nullable(isString)
if (isNullableString(value)) {
  // value 类型为 string | null
  console.log(value?.toUpperCase())
}

// 组合守卫（或）
const isStringOrNumber = or(isString, isNumber)
if (isStringOrNumber(value)) {
  // value 类型为 string | number
  console.log(value)
}
```

### 断言函数

```typescript
import { 
  assertString, 
  assertNumber, 
  assertNonNullable 
} from '@ldesign/template'

function processUsername(username: unknown) {
  // 断言为字符串，如果不是则抛出错误
  assertString(username, 'Username must be a string')
  
  // 此后 username 类型为 string
  return username.toUpperCase()
}

function processId(id: number | null) {
  // 断言非空
  assertNonNullable(id, 'ID cannot be null')
  
  // 此后 id 类型为 number
  return id + 1
}
```

### 自定义类型守卫

```typescript
import { createTypeGuard, hasProperty } from '@ldesign/template'

interface User {
  id: number
  name: string
  email: string
}

// 创建用户类型守卫
const isUser = createTypeGuard<User>((value): value is User => {
  return (
    hasProperty(value, 'id') &&
    hasProperty(value, 'name') &&
    hasProperty(value, 'email') &&
    isNumber((value as any).id) &&
    isString((value as any).name) &&
    isString((value as any).email)
  )
})

function processUser(data: unknown) {
  if (isUser(data)) {
    // data 类型为 User
    console.log(data.name, data.email)
  }
}
```

## 🔧 类型辅助工具

### 枚举工具

```typescript
import { ExtractEnum } from '@ldesign/template'

const Status = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

// 提取枚举值类型
type StatusValue = ExtractEnum<typeof Status>
// 'pending' | 'active' | 'inactive'

const currentStatus: StatusValue = 'active'
```

### 函数类型工具

```typescript
import type { 
  ExcludeFunctions, 
  OnlyFunctions, 
  FirstParameter 
} from '@ldesign/template'

interface API {
  baseUrl: string
  timeout: number
  get(url: string): Promise<any>
  post(url: string, data: any): Promise<any>
}

// 排除函数，只保留数据属性
type APIData = ExcludeFunctions<API>
// { baseUrl: string; timeout: number }

// 只保留函数
type APIMethods = OnlyFunctions<API>
// { get: (url: string) => Promise<any>; post: (url: string, data: any) => Promise<any> }

// 提取第一个参数类型
type GetUrl = FirstParameter<API['get']>
// string
```

### Promise 工具

```typescript
import type { Promisify, UnwrapPromise } from '@ldesign/template'

interface SyncAPI {
  fetchUser(id: number): { name: string; email: string }
  fetchPosts(): { id: number; title: string }[]
}

// 将所有方法转换为异步
type AsyncAPI = Promisify<SyncAPI>
// {
//   fetchUser(id: number): Promise<{ name: string; email: string }>
//   fetchPosts(): Promise<{ id: number; title: string }[]>
// }

// 解包 Promise
type UserData = UnwrapPromise<Promise<{ name: string }>>
// { name: string }
```

### 属性操作工具

```typescript
import type { PartialBy, RequiredBy, ReadonlyBy } from '@ldesign/template'

interface FormData {
  id: number
  username: string
  email: string
  avatar?: string
}

// 使特定属性可选
type UpdateFormData = PartialBy<FormData, 'id' | 'avatar'>
// { id?: number; username: string; email: string; avatar?: string }

// 使特定属性必填
type CreateFormData = RequiredBy<FormData, 'avatar'>
// { id: number; username: string; email: string; avatar: string }

// 使特定属性只读
type ImmutableUser = ReadonlyBy<FormData, 'id' | 'username'>
// { readonly id: number; readonly username: string; email: string; avatar?: string }
```

## 💼 实际应用示例

### 1. 配置对象类型安全

```typescript
import type { DeepPartial, DeepReadonly } from '@ldesign/template'
import { isPlainObject, hasProperty } from '@ldesign/template'

interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
    retry: {
      maxAttempts: number
      delay: number
    }
  }
  cache: {
    enabled: boolean
    ttl: number
  }
}

// 默认配置（只读）
const defaultConfig: DeepReadonly<AppConfig> = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retry: {
      maxAttempts: 3,
      delay: 1000
    }
  },
  cache: {
    enabled: true,
    ttl: 3600
  }
}

// 用户配置（部分可选）
function createConfig(userConfig: DeepPartial<AppConfig>): AppConfig {
  // 深度合并配置
  return {
    api: {
      baseUrl: userConfig.api?.baseUrl ?? defaultConfig.api.baseUrl,
      timeout: userConfig.api?.timeout ?? defaultConfig.api.timeout,
      retry: {
        maxAttempts: userConfig.api?.retry?.maxAttempts ?? defaultConfig.api.retry.maxAttempts,
        delay: userConfig.api?.retry?.delay ?? defaultConfig.api.retry.delay
      }
    },
    cache: {
      enabled: userConfig.cache?.enabled ?? defaultConfig.cache.enabled,
      ttl: userConfig.cache?.ttl ?? defaultConfig.cache.ttl
    }
  }
}
```

### 2. API 响应处理

```typescript
import { isObject, hasProperty, assertString, assertNumber } from '@ldesign/template'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

function validateApiResponse<T>(
  response: unknown,
  dataValidator: (data: unknown) => data is T
): ApiResponse<T> | null {
  if (!isObject(response)) {
    return null
  }

  if (!hasProperty(response, 'success') || typeof response.success !== 'boolean') {
    return null
  }

  if (!hasProperty(response, 'data')) {
    return null
  }

  if (!dataValidator(response.data)) {
    return null
  }

  return response as ApiResponse<T>
}

// 使用示例
interface User {
  id: number
  name: string
}

const isUser = (data: unknown): data is User => {
  return (
    isObject(data) &&
    hasProperty(data, 'id') &&
    hasProperty(data, 'name') &&
    typeof data.id === 'number' &&
    typeof data.name === 'string'
  )
}

const response = await fetch('/api/user/1').then(r => r.json())
const validatedResponse = validateApiResponse(response, isUser)

if (validatedResponse && validatedResponse.success) {
  // validatedResponse.data 类型为 User
  console.log(validatedResponse.data.name)
}
```

### 3. 事件系统类型安全

```typescript
import type { Dictionary, EventHandler } from '@ldesign/template'
import { isFunction } from '@ldesign/template'

type EventMap = {
  'user:login': { userId: number; timestamp: number }
  'user:logout': { userId: number }
  'template:load': { templateId: string; device: 'mobile' | 'tablet' | 'desktop' }
  'template:error': { templateId: string; error: Error }
}

class TypedEventEmitter<T extends Dictionary> {
  private listeners: Partial<{ [K in keyof T]: Array<(data: T[K]) => void> }> = {}

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event]!.push(handler)
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.listeners[event]
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    const handlers = this.listeners[event]
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
}

// 使用示例
const emitter = new TypedEventEmitter<EventMap>()

emitter.on('user:login', (data) => {
  // data 类型为 { userId: number; timestamp: number }
  console.log(`User ${data.userId} logged in at ${data.timestamp}`)
})

emitter.on('template:load', (data) => {
  // data 类型为 { templateId: string; device: 'mobile' | 'tablet' | 'desktop' }
  console.log(`Template ${data.templateId} loaded on ${data.device}`)
})

emitter.emit('user:login', { userId: 123, timestamp: Date.now() })
```

## ✅ 最佳实践

### 1. 优先使用类型推断

```typescript
// ❌ 避免
const numbers: number[] = [1, 2, 3]

// ✅ 推荐（类型推断）
const numbers = [1, 2, 3]
```

### 2. 使用类型守卫替代类型断言

```typescript
// ❌ 避免
const value = data as string

// ✅ 推荐
import { assertString } from '@ldesign/template'
assertString(data, 'Data must be a string')
// 此后 data 类型为 string
```

### 3. 利用品牌类型创建名义类型

```typescript
import type { Brand } from '@ldesign/template'

type UserId = Brand<number, 'UserId'>
type ProductId = Brand<number, 'ProductId'>

function fetchUser(id: UserId) {
  // ...
}

const userId = 123 as UserId
const productId = 456 as ProductId

fetchUser(userId) // ✅
fetchUser(productId) // ❌ 类型错误
```

### 4. 使用严格的工具类型

```typescript
import type { StrictOmit, StrictPick } from '@ldesign/template'

interface User {
  id: number
  name: string
  email: string
}

// ✅ 严格的 Omit（键必须存在）
type UserWithoutEmail = StrictOmit<User, 'email'>

// ❌ 以下会报错
type Invalid = StrictOmit<User, 'nonexistent'>
```

### 5. 组合类型守卫

```typescript
import { and, or, arrayOf, isString, isNumber } from '@ldesign/template'

// 复合守卫
const isStringOrNumberArray = or(
  arrayOf(isString),
  arrayOf(isNumber)
)

if (isStringOrNumberArray(value)) {
  // value 类型为 string[] | number[]
}
```

### 6. 避免使用 any

```typescript
import type { JsonValue, Dictionary } from '@ldesign/template'

// ❌ 避免
function process(data: any) {
  return data.value
}

// ✅ 推荐
function process(data: JsonValue) {
  // 使用类型守卫
  if (isObject(data) && hasProperty(data, 'value')) {
    return data.value
  }
  return undefined
}
```

## 📚 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

## 🤝 贡献

如果您发现类型定义有问题或有改进建议，欢迎提交 Issue 或 Pull Request！
