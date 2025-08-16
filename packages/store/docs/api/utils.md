# 工具函数 API

@ldesign/store 提供了一系列实用的工具函数，帮助你更好地使用状态管理功能。

## 状态工具

### isRef

检查一个值是否为 Vue 的 ref 对象。

```typescript
isRef(value: any): value is Ref<any>
```

**示例：**

```typescript
import { isRef } from '@ldesign/store'
import { ref } from 'vue'

const count = ref(0)
const name = 'hello'

console.log(isRef(count)) // true
console.log(isRef(name)) // false
```

### isReactive

检查一个值是否为 Vue 的 reactive 对象。

```typescript
isReactive(value: any): value is object
```

**示例：**

```typescript
import { isReactive } from '@ldesign/store'
import { reactive } from 'vue'

const state = reactive({ count: 0 })
const obj = { count: 0 }

console.log(isReactive(state)) // true
console.log(isReactive(obj)) // false
```

### toRaw

获取 reactive 或 ref 对象的原始值。

```typescript
toRaw<T>(observed: T): T
```

**示例：**

```typescript
import { toRaw } from '@ldesign/store'
import { reactive } from 'vue'

const state = reactive({ count: 0 })
const raw = toRaw(state)

console.log(raw === state) // false
console.log(raw.count) // 0
```

### unref

获取 ref 的值，如果不是 ref 则返回原值。

```typescript
unref<T>(ref: T | Ref<T>): T
```

**示例：**

```typescript
import { unref } from '@ldesign/store'
import { ref } from 'vue'

const count = ref(10)
const name = 'hello'

console.log(unref(count)) // 10
console.log(unref(name)) // 'hello'
```

## 类型工具

### isStore

检查一个对象是否为 Store 实例。

```typescript
isStore(value: any): value is Store
```

**示例：**

```typescript
import { isStore } from '@ldesign/store'
import { UserStore } from '@/stores/user'

const userStore = new UserStore('user')
const obj = { count: 0 }

console.log(isStore(userStore)) // true
console.log(isStore(obj)) // false
```

### getStoreId

获取 Store 的 ID。

```typescript
getStoreId(store: Store): string
```

**示例：**

```typescript
import { getStoreId } from '@ldesign/store'

const userStore = new UserStore('user')
console.log(getStoreId(userStore)) // 'user'
```

### getStoreMetadata

获取 Store 的元数据信息。

```typescript
getStoreMetadata(StoreClass: typeof BaseStore): StoreMetadata
```

**StoreMetadata 接口：**

```typescript
interface StoreMetadata {
  states: StateMetadata[]
  actions: ActionMetadata[]
  getters: GetterMetadata[]
  options: StoreOptions
}

interface StateMetadata {
  name: string
  type: string
  defaultValue: any
  options: StateDecoratorOptions
}

interface ActionMetadata {
  name: string
  type: 'sync' | 'async'
  options: ActionDecoratorOptions
}

interface GetterMetadata {
  name: string
  dependencies: string[]
  options: GetterDecoratorOptions
}
```

**示例：**

```typescript
import { getStoreMetadata } from '@ldesign/store'

class UserStore extends BaseStore {
  @State({ default: null })
  user: User | null = null

  @Action()
  setUser(user: User) {
    this.user = user
  }

  @Getter()
  get isLoggedIn() {
    return this.user !== null
  }
}

const metadata = getStoreMetadata(UserStore)
console.log(metadata.states) // [{ name: 'user', type: 'State', ... }]
console.log(metadata.actions) // [{ name: 'setUser', type: 'sync', ... }]
console.log(metadata.getters) // [{ name: 'isLoggedIn', ... }]
```

## 序列化工具

### serialize

序列化 Store 状态为 JSON 字符串。

```typescript
serialize(store: Store, options?: SerializeOptions): string
```

**SerializeOptions 接口：**

```typescript
interface SerializeOptions {
  include?: string[] // 包含的字段
  exclude?: string[] // 排除的字段
  space?: number // JSON 格式化空格数
  replacer?: (key: string, value: any) => any // 自定义替换函数
}
```

**示例：**

```typescript
import { serialize } from '@ldesign/store'

const userStore = new UserStore('user')
userStore.setUser({ id: '1', name: 'John' })

// 基础序列化
const json = serialize(userStore)
console.log(json) // '{"user":{"id":"1","name":"John"}}'

// 排除某些字段
const filtered = serialize(userStore, {
  exclude: ['password', 'token'],
})

// 格式化输出
const formatted = serialize(userStore, {
  space: 2,
})
```

### deserialize

从 JSON 字符串反序列化 Store 状态。

```typescript
deserialize(store: Store, json: string, options?: DeserializeOptions): void
```

**DeserializeOptions 接口：**

```typescript
interface DeserializeOptions {
  merge?: boolean // 是否合并现有状态
  validate?: boolean // 是否验证数据
  reviver?: (key: string, value: any) => any // 自定义恢复函数
}
```

**示例：**

```typescript
import { deserialize } from '@ldesign/store'

const userStore = new UserStore('user')
const json = '{"user":{"id":"1","name":"John"}}'

// 基础反序列化
deserialize(userStore, json)

// 合并模式
deserialize(userStore, json, { merge: true })

// 自定义恢复函数
deserialize(userStore, json, {
  reviver: (key, value) => {
    if (key === 'createdAt') {
      return new Date(value)
    }
    return value
  },
})
```

## 缓存工具

### createCache

创建一个缓存实例。

```typescript
createCache<K, V>(options?: CacheOptions): Cache<K, V>
```

**CacheOptions 接口：**

```typescript
interface CacheOptions {
  maxSize?: number // 最大缓存数量
  ttl?: number // 默认过期时间（毫秒）
  onEvict?: (key: K, value: V) => void // 驱逐回调
}
```

**Cache 接口：**

```typescript
interface Cache<K, V> {
  get: (key: K) => V | undefined
  set: (key: K, value: V, ttl?: number) => void
  has: (key: K) => boolean
  delete: (key: K) => boolean
  clear: () => void
  size: number
  keys: () => IterableIterator<K>
  values: () => IterableIterator<V>
  entries: () => IterableIterator<[K, V]>
}
```

**示例：**

```typescript
import { createCache } from '@ldesign/store'

// 创建缓存
const cache = createCache<string, any>({
  maxSize: 100,
  ttl: 60000, // 1分钟
  onEvict: (key, value) => {
    console.log(`缓存项 ${key} 被驱逐`)
  },
})

// 使用缓存
cache.set('user:1', { id: '1', name: 'John' })
const user = cache.get('user:1')

// 设置自定义过期时间
cache.set('temp:data', someData, 5000) // 5秒后过期
```

### memoize

创建一个记忆化函数。

```typescript
memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: MemoizeOptions
): T & { cache: Cache<string, ReturnType<T>> }
```

**MemoizeOptions 接口：**

```typescript
interface MemoizeOptions {
  maxSize?: number // 最大缓存数量
  ttl?: number // 缓存过期时间
  keyGenerator?: (...args: any[]) => string // 自定义键生成器
}
```

**示例：**

```typescript
import { memoize } from '@ldesign/store'

// 记忆化昂贵的计算
const expensiveCalculation = memoize(
  (a: number, b: number) => {
    console.log('执行计算...')
    return a * b * Math.random()
  },
  {
    maxSize: 50,
    ttl: 30000, // 30秒
  }
)

console.log(expensiveCalculation(5, 10)) // 执行计算...
console.log(expensiveCalculation(5, 10)) // 使用缓存

// 自定义键生成器
const memoizedFetch = memoize(
  async (url: string, options: any) => {
    const response = await fetch(url, options)
    return response.json()
  },
  {
    keyGenerator: (url, options) => `${url}-${JSON.stringify(options)}`,
  }
)
```

## 防抖和节流

### debounce

创建防抖函数。

```typescript
debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options?: DebounceOptions
): T & { cancel: () => void; flush: () => void }
```

**DebounceOptions 接口：**

```typescript
interface DebounceOptions {
  leading?: boolean // 是否在延迟开始时执行
  trailing?: boolean // 是否在延迟结束时执行
  maxWait?: number // 最大等待时间
}
```

**示例：**

```typescript
import { debounce } from '@ldesign/store'

// 防抖搜索
const debouncedSearch = debounce((query: string) => {
  console.log('搜索:', query)
}, 300)

// 使用
debouncedSearch('hello')
debouncedSearch('hello world') // 只有这个会执行

// 取消防抖
debouncedSearch.cancel()

// 立即执行
debouncedSearch.flush()
```

### throttle

创建节流函数。

```typescript
throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number,
  options?: ThrottleOptions
): T & { cancel: () => void }
```

**ThrottleOptions 接口：**

```typescript
interface ThrottleOptions {
  leading?: boolean // 是否在间隔开始时执行
  trailing?: boolean // 是否在间隔结束时执行
}
```

**示例：**

```typescript
import { throttle } from '@ldesign/store'

// 节流滚动处理
const throttledScroll = throttle((event: Event) => {
  console.log('滚动位置:', window.scrollY)
}, 100)

window.addEventListener('scroll', throttledScroll)

// 取消节流
throttledScroll.cancel()
```

## 深度工具

### deepClone

深度克隆对象。

```typescript
deepClone<T>(obj: T): T
```

**示例：**

```typescript
import { deepClone } from '@ldesign/store'

const original = {
  user: { id: '1', profile: { name: 'John' } },
  items: [1, 2, 3],
}

const cloned = deepClone(original)
cloned.user.profile.name = 'Jane'

console.log(original.user.profile.name) // 'John'
console.log(cloned.user.profile.name) // 'Jane'
```

### deepMerge

深度合并对象。

```typescript
deepMerge<T>(target: T, ...sources: Partial<T>[]): T
```

**示例：**

```typescript
import { deepMerge } from '@ldesign/store'

const target = {
  user: { id: '1', name: 'John' },
  settings: { theme: 'light' },
}

const source = {
  user: { email: 'john@example.com' },
  settings: { language: 'en' },
}

const merged = deepMerge(target, source)
// {
//   user: { id: '1', name: 'John', email: 'john@example.com' },
//   settings: { theme: 'light', language: 'en' }
// }
```

### deepEqual

深度比较两个对象是否相等。

```typescript
deepEqual(a: any, b: any): boolean
```

**示例：**

```typescript
import { deepEqual } from '@ldesign/store'

const obj1 = { user: { id: '1', name: 'John' } }
const obj2 = { user: { id: '1', name: 'John' } }
const obj3 = { user: { id: '1', name: 'Jane' } }

console.log(deepEqual(obj1, obj2)) // true
console.log(deepEqual(obj1, obj3)) // false
```

## 验证工具

### validateSchema

根据 JSON Schema 验证数据。

```typescript
validateSchema(data: any, schema: JSONSchema): ValidationResult
```

**ValidationResult 接口：**

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  path: string
  message: string
  value: any
}
```

**示例：**

```typescript
import { validateSchema } from '@ldesign/store'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    age: { type: 'number', minimum: 0 },
  },
  required: ['name'],
}

const data = { name: 'John', age: 25 }
const result = validateSchema(data, schema)

if (result.valid) {
  console.log('数据有效')
} else {
  console.log('验证错误:', result.errors)
}
```

### createValidator

创建自定义验证器。

```typescript
createValidator<T>(
  rules: ValidationRule<T>[]
): (data: T) => ValidationResult
```

**ValidationRule 接口：**

```typescript
interface ValidationRule<T> {
  field: keyof T
  validator: (value: any, data: T) => boolean | string
  message?: string
}
```

**示例：**

```typescript
import { createValidator } from '@ldesign/store'

interface User {
  name: string
  email: string
  age: number
}

const userValidator = createValidator<User>([
  {
    field: 'name',
    validator: value => typeof value === 'string' && value.length > 0,
    message: '姓名不能为空',
  },
  {
    field: 'email',
    validator: value => /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value),
    message: '邮箱格式不正确',
  },
  {
    field: 'age',
    validator: value => typeof value === 'number' && value >= 0,
    message: '年龄必须是非负数',
  },
])

const result = userValidator({
  name: 'John',
  email: 'john@example.com',
  age: 25,
})
```

## 事件工具

### createEventBus

创建事件总线。

```typescript
createEventBus(): EventBus
```

**EventBus 接口：**

```typescript
interface EventBus {
  on: <T>(event: string, handler: (data: T) => void) => () => void
  off: (event: string, handler?: Function) => void
  emit: <T>(event: string, data?: T) => void
  once: <T>(event: string, handler: (data: T) => void) => () => void
  clear: () => void
}
```

**示例：**

```typescript
import { createEventBus } from '@ldesign/store'

const eventBus = createEventBus()

// 监听事件
const unsubscribe = eventBus.on('user:login', user => {
  console.log('用户登录:', user)
})

// 发送事件
eventBus.emit('user:login', { id: '1', name: 'John' })

// 一次性监听
eventBus.once('app:ready', () => {
  console.log('应用就绪')
})

// 取消监听
unsubscribe()
```

## 常见问题

### Q: 工具函数是否支持 Tree Shaking？

A: 是的，所有工具函数都支持 Tree Shaking：

```typescript
// 只导入需要的函数
import { debounce, memoize } from '@ldesign/store'
```

### Q: 缓存工具的内存管理如何？

A: 缓存工具提供了多种内存管理策略：

```typescript
const cache = createCache({
  maxSize: 100, // 限制最大数量
  ttl: 60000, // 自动过期
  onEvict: (k, v) => {
    // 驱逐回调
    console.log('清理缓存:', k)
  },
})
```

### Q: 如何自定义序列化行为？

A: 使用自定义的 replacer 和 reviver 函数：

```typescript
const json = serialize(store, {
  replacer: (key, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() }
    }
    return value
  },
})

deserialize(store, json, {
  reviver: (key, value) => {
    if (value && value.__type === 'Date') {
      return new Date(value.value)
    }
    return value
  },
})
```

## 下一步

- 学习 [类型定义](/api/types) 了解完整的类型系统
- 查看 [基础示例](/examples/basic) 了解实际用法
- 探索 [实战项目](/examples/real-world/) 查看完整的项目示例
