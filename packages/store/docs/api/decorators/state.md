# @State 装饰器

`@State` 装饰器用于标记 Store 类中的状态属性，使其成为响应式的状态数据。

## 📖 基本语法

```typescript
@State
propertyName: Type = initialValue
```

## 🔧 参数说明

`@State` 装饰器可以不带参数使用，也可以接受配置选项：

```typescript
@State(options?: StateOptions)
```

### StateOptions

```typescript
interface StateOptions {
  deep?: boolean          // 是否深度响应式，默认 true
  readonly?: boolean      // 是否只读，默认 false
  serialize?: boolean     // 是否可序列化，默认 true
  validator?: (value: any) => boolean  // 值验证器
}
```

## 🚀 基本用法

### 简单状态

```typescript
import { BaseStore, State } from '@ldesign/store'

export class UserStore extends BaseStore {
  @State
  user: User | null = null

  @State
  loading = false

  @State
  error: string | null = null

  @State
  users: User[] = []
}
```

### 复杂状态对象

```typescript
export class AppStore extends BaseStore {
  @State
  config = {
    theme: 'light',
    language: 'zh-CN',
    apiUrl: 'https://api.example.com',
    features: {
      darkMode: true,
      notifications: true,
      analytics: false
    }
  }

  @State
  userPreferences = new Map<string, any>()

  @State
  cache = new Set<string>()
}
```

## ⚙️ 配置选项

### 深度响应式控制

```typescript
export class DataStore extends BaseStore {
  // 深度响应式（默认）
  @State
  deepData = {
    nested: {
      value: 'test'
    }
  }

  // 浅响应式
  @State({ deep: false })
  shallowData = {
    nested: {
      value: 'test'
    }
  }
}
```

### 只读状态

```typescript
export class ConfigStore extends BaseStore {
  // 只读状态，只能在初始化时设置
  @State({ readonly: true })
  readonly appVersion = '1.0.0'

  @State({ readonly: true })
  readonly buildTime = Date.now()

  // 普通状态，可以修改
  @State
  currentTheme = 'light'
}
```

### 值验证

```typescript
export class FormStore extends BaseStore {
  @State({
    validator: (value: string) => value.length >= 2
  })
  username = ''

  @State({
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  })
  email = ''

  @State({
    validator: (value: number) => value >= 0 && value <= 120
  })
  age = 0
}
```

### 序列化控制

```typescript
export class SessionStore extends BaseStore {
  // 可序列化状态（默认）
  @State
  userToken = ''

  // 不可序列化状态（如函数、DOM 元素等）
  @State({ serialize: false })
  eventHandlers = new Map<string, Function>()

  @State({ serialize: false })
  domElements: HTMLElement[] = []
}
```

## 🎯 实际应用示例

### 用户管理状态

```typescript
export class UserManagementStore extends BaseStore {
  @State
  currentUser: User | null = null

  @State
  users: User[] = []

  @State
  selectedUsers: Set<string> = new Set()

  @State
  filters = {
    role: '',
    status: 'all',
    department: '',
    searchQuery: ''
  }

  @State
  pagination = {
    page: 1,
    pageSize: 20,
    total: 0
  }

  @State
  loading = {
    users: false,
    create: false,
    update: false,
    delete: false
  }

  @State
  errors = {
    fetch: null as string | null,
    create: null as string | null,
    update: null as string | null,
    delete: null as string | null
  }
}
```

### 购物车状态

```typescript
export interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
  addedAt: number
}

export class CartStore extends BaseStore {
  @State
  items: CartItem[] = []

  @State
  discountCode: string | null = null

  @State
  shippingInfo = {
    method: 'standard',
    cost: 0,
    estimatedDays: 3
  }

  @State
  paymentInfo = {
    method: 'credit_card',
    cardLast4: '',
    expiryMonth: 0,
    expiryYear: 0
  }

  @State
  checkoutStep = 1

  @State
  orderSummary = {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0
  }
}
```

### 应用设置状态

```typescript
export class SettingsStore extends BaseStore {
  @State({
    validator: (theme: string) => ['light', 'dark', 'auto'].includes(theme)
  })
  theme: 'light' | 'dark' | 'auto' = 'light'

  @State({
    validator: (lang: string) => ['zh-CN', 'en-US', 'ja-JP'].includes(lang)
  })
  language: string = 'zh-CN'

  @State
  notifications = {
    email: true,
    push: true,
    sms: false,
    marketing: false
  }

  @State
  privacy = {
    profileVisible: true,
    activityVisible: false,
    allowAnalytics: true
  }

  @State
  accessibility = {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false
  }
}
```

## 🔄 状态更新模式

### 直接赋值

```typescript
export class SimpleStore extends BaseStore {
  @State
  count = 0

  @State
  message = ''

  @Action
  updateCount(newCount: number) {
    this.count = newCount
  }

  @Action
  updateMessage(newMessage: string) {
    this.message = newMessage
  }
}
```

### 对象属性更新

```typescript
export class ObjectStore extends BaseStore {
  @State
  user = {
    name: '',
    email: '',
    profile: {
      avatar: '',
      bio: ''
    }
  }

  @Action
  updateUserName(name: string) {
    this.user.name = name
  }

  @Action
  updateUserProfile(profile: Partial<typeof this.user.profile>) {
    Object.assign(this.user.profile, profile)
  }

  @Action
  updateUser(updates: Partial<typeof this.user>) {
    Object.assign(this.user, updates)
  }
}
```

### 数组操作

```typescript
export class ListStore extends BaseStore {
  @State
  items: string[] = []

  @State
  selectedItems: Set<string> = new Set()

  @Action
  addItem(item: string) {
    this.items.push(item)
  }

  @Action
  removeItem(index: number) {
    this.items.splice(index, 1)
  }

  @Action
  updateItem(index: number, newItem: string) {
    this.items[index] = newItem
  }

  @Action
  clearItems() {
    this.items = []
    this.selectedItems.clear()
  }

  @Action
  selectItem(item: string) {
    this.selectedItems.add(item)
  }

  @Action
  deselectItem(item: string) {
    this.selectedItems.delete(item)
  }
}
```

## 🧪 测试状态

### 状态初始化测试

```typescript
import { describe, it, expect } from 'vitest'
import { createTestStore } from '@ldesign/store/testing'
import { UserStore } from '@/stores/UserStore'

describe('UserStore 状态测试', () => {
  it('应该正确初始化状态', () => {
    const store = createTestStore(UserStore)
    
    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.users).toEqual([])
  })

  it('应该正确更新状态', () => {
    const store = createTestStore(UserStore)
    const mockUser = { id: '1', name: 'Test User' }
    
    store.user = mockUser
    expect(store.user).toEqual(mockUser)
    
    store.loading = true
    expect(store.loading).toBe(true)
  })
})
```

### 状态验证测试

```typescript
describe('状态验证测试', () => {
  it('应该验证用户名长度', () => {
    const store = createTestStore(FormStore)
    
    // 有效用户名
    store.username = 'john'
    expect(store.username).toBe('john')
    
    // 无效用户名（太短）
    expect(() => {
      store.username = 'a'
    }).toThrow('状态验证失败')
  })

  it('应该验证邮箱格式', () => {
    const store = createTestStore(FormStore)
    
    // 有效邮箱
    store.email = 'test@example.com'
    expect(store.email).toBe('test@example.com')
    
    // 无效邮箱
    expect(() => {
      store.email = 'invalid-email'
    }).toThrow('状态验证失败')
  })
})
```

## 🎯 最佳实践

### 1. 状态命名

```typescript
// ✅ 清晰的状态命名
@State
currentUser: User | null = null

@State
isLoading = false

@State
errorMessage: string | null = null

// ❌ 模糊的状态命名
@State
data: any = null

@State
flag = false

@State
msg = ''
```

### 2. 状态结构

```typescript
// ✅ 合理的状态结构
@State
user: User | null = null

@State
userList: User[] = []

@State
userFilters = {
  role: '',
  status: 'active'
}

// ❌ 过度嵌套的状态
@State
appState = {
  user: {
    current: null,
    list: [],
    filters: {
      role: '',
      status: 'active'
    }
  }
}
```

### 3. 初始值设置

```typescript
// ✅ 明确的初始值
@State
count: number = 0

@State
items: Item[] = []

@State
config: Config = {
  theme: 'light',
  language: 'zh-CN'
}

// ❌ 不明确的初始值
@State
count: number = undefined as any

@State
items: Item[] = null as any
```

### 4. 类型安全

```typescript
// ✅ 明确的类型定义
@State
status: 'idle' | 'loading' | 'success' | 'error' = 'idle'

@State
user: User | null = null

// ❌ 使用 any 类型
@State
status: any = 'idle'

@State
user: any = null
```

`@State` 装饰器是 @ldesign/store 的核心功能，正确使用它可以创建清晰、可维护的状态管理代码。
