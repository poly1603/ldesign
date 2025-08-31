# 通用工具

通用工具函数提供了常用的编程工具，包括防抖节流、深度克隆、对象操作等实用功能。

## 概述

通用工具模块包含以下功能：
- **函数工具**：防抖、节流、函数组合等
- **对象操作**：深度克隆、合并、属性选择等
- **类型判断**：精确的类型检测工具
- **数据处理**：空值判断、数据转换等
- **性能优化**：缓存、记忆化等工具

## 安装和导入

```typescript
// 按需导入
import { 
  debounce, 
  throttle, 
  deepClone, 
  deepMerge,
  isEmpty 
} from '@ldesign/shared'

// 或者导入整个通用模块
import { general } from '@ldesign/shared'
```

## API 参考

### debounce

创建一个防抖函数，在指定时间内只执行最后一次调用。

**函数签名**
```typescript
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
  pending: () => boolean
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
  }
): DebouncedFunction<T>
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| func | Function | ✓ | - | 要防抖的函数 |
| wait | number | ✓ | - | 延迟时间（毫秒） |
| options | object | ✗ | {} | 配置选项 |

**选项说明**

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| leading | boolean | ✗ | false | 是否在延迟开始前调用 |
| trailing | boolean | ✗ | true | 是否在延迟结束后调用 |
| maxWait | number | ✗ | - | 最大等待时间 |

**返回值**
- `DebouncedFunction<T>` - 防抖函数，包含 cancel、flush、pending 方法

**使用示例**

```typescript
// 基础搜索防抖
const searchInput = document.getElementById('search') as HTMLInputElement
const debouncedSearch = debounce((query: string) => {
  console.log('搜索:', query)
  // 执行搜索逻辑
}, 300)

searchInput.addEventListener('input', (e) => {
  debouncedSearch((e.target as HTMLInputElement).value)
})

// 窗口大小调整防抖
const debouncedResize = debounce(() => {
  console.log('窗口大小已调整')
  // 重新计算布局
}, 250)

window.addEventListener('resize', debouncedResize)

// 表单验证防抖
const validateField = debounce(async (value: string) => {
  const isValid = await checkFieldValidity(value)
  updateValidationUI(isValid)
}, 500)

// 使用 leading 选项
const saveData = debounce(() => {
  console.log('保存数据')
}, 1000, { leading: true, trailing: false })

// 手动控制
const debouncedFn = debounce(() => console.log('执行'), 1000)

// 取消执行
debouncedFn.cancel()

// 立即执行
debouncedFn.flush()

// 检查是否有待执行的调用
if (debouncedFn.pending()) {
  console.log('有待执行的调用')
}

// 实际应用：自动保存
class AutoSave {
  private saveFunction = debounce(this.performSave.bind(this), 2000)
  
  onContentChange(content: string) {
    this.saveFunction(content)
  }
  
  private async performSave(content: string) {
    try {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content })
      })
      console.log('自动保存成功')
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }
  
  forceSave() {
    this.saveFunction.flush()
  }
}
```

### throttle

创建一个节流函数，在指定时间间隔内最多执行一次。

**函数签名**
```typescript
interface ThrottledFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: {
    leading?: boolean
    trailing?: boolean
  }
): ThrottledFunction<T>
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| func | Function | ✓ | - | 要节流的函数 |
| wait | number | ✓ | - | 间隔时间（毫秒） |
| options | object | ✗ | {} | 配置选项 |

**使用示例**

```typescript
// 滚动事件节流
const throttledScroll = throttle(() => {
  const scrollTop = window.pageYOffset
  updateScrollIndicator(scrollTop)
}, 100)

window.addEventListener('scroll', throttledScroll)

// 按钮点击节流（防止重复提交）
const throttledSubmit = throttle(async () => {
  await submitForm()
}, 2000, { leading: true, trailing: false })

// API 调用节流
const throttledApiCall = throttle((params: any) => {
  return fetch('/api/data', {
    method: 'POST',
    body: JSON.stringify(params)
  })
}, 1000)

// 实际应用：无限滚动
class InfiniteScroll {
  private loadMore = throttle(this.loadMoreData.bind(this), 500)
  
  constructor() {
    window.addEventListener('scroll', this.handleScroll.bind(this))
  }
  
  private handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      this.loadMore()
    }
  }
  
  private async loadMoreData() {
    console.log('加载更多数据...')
    // 加载数据逻辑
  }
}
```

### deepClone

创建对象的深度克隆。

**函数签名**
```typescript
function deepClone<T>(obj: T): T
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| obj | T | ✓ | - | 要克隆的对象 |

**返回值**
- `T` - 深度克隆的新对象

**使用示例**

```typescript
// 基础对象克隆
const original = {
  name: 'John',
  age: 30,
  address: {
    city: 'Beijing',
    country: 'China'
  },
  hobbies: ['reading', 'coding']
}

const cloned = deepClone(original)
cloned.address.city = 'Shanghai'
cloned.hobbies.push('gaming')

console.log(original.address.city) // 'Beijing' (未被修改)
console.log(cloned.address.city) // 'Shanghai'

// 复杂数据结构克隆
const complexData = {
  date: new Date(),
  regex: /test/g,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  nested: {
    deep: {
      value: 'test'
    }
  }
}

const clonedComplex = deepClone(complexData)

// 数组克隆
const originalArray = [
  { id: 1, data: { value: 'a' } },
  { id: 2, data: { value: 'b' } }
]

const clonedArray = deepClone(originalArray)
clonedArray[0].data.value = 'modified'

console.log(originalArray[0].data.value) // 'a' (未被修改)

// 实际应用：表单数据备份
class FormManager {
  private originalData: any
  private currentData: any
  
  loadData(data: any) {
    this.originalData = deepClone(data)
    this.currentData = deepClone(data)
  }
  
  updateField(field: string, value: any) {
    this.currentData[field] = value
  }
  
  hasChanges(): boolean {
    return JSON.stringify(this.originalData) !== JSON.stringify(this.currentData)
  }
  
  reset() {
    this.currentData = deepClone(this.originalData)
  }
}
```

### deepMerge

深度合并多个对象。

**函数签名**
```typescript
function deepMerge<T extends Record<string, any>>(...objects: Partial<T>[]): T
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| objects | Partial\<T\>[] | ✓ | - | 要合并的对象数组 |

**返回值**
- `T` - 合并后的新对象

**使用示例**

```typescript
// 基础对象合并
const defaults = {
  theme: 'light',
  language: 'zh-CN',
  features: {
    notifications: true,
    autoSave: false
  }
}

const userConfig = {
  theme: 'dark',
  features: {
    notifications: false,
    newFeature: true
  }
}

const finalConfig = deepMerge(defaults, userConfig)
console.log(finalConfig)
// {
//   theme: 'dark',
//   language: 'zh-CN',
//   features: {
//     notifications: false,
//     autoSave: false,
//     newFeature: true
//   }
// }

// 多对象合并
const base = { a: 1, b: { x: 1 } }
const override1 = { b: { y: 2 } }
const override2 = { c: 3, b: { z: 3 } }

const merged = deepMerge(base, override1, override2)
console.log(merged)
// { a: 1, b: { x: 1, y: 2, z: 3 }, c: 3 }

// 实际应用：配置管理
class ConfigManager {
  private defaultConfig = {
    api: {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
      retries: 3
    },
    ui: {
      theme: 'light',
      language: 'en'
    }
  }
  
  createConfig(userConfig: any) {
    return deepMerge(this.defaultConfig, userConfig)
  }
}

const configManager = new ConfigManager()
const config = configManager.createConfig({
  api: { timeout: 10000 },
  ui: { theme: 'dark' }
})
```

### pick

从对象中选择指定的属性。

**函数签名**
```typescript
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>
```

**使用示例**

```typescript
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret',
  role: 'admin'
}

// 选择公开信息
const publicInfo = pick(user, ['id', 'name', 'email'])
console.log(publicInfo) // { id: 1, name: 'John', email: 'john@example.com' }

// 实际应用：API 响应过滤
function sanitizeUserData(user: any) {
  return pick(user, ['id', 'name', 'email', 'avatar'])
}
```

### omit

从对象中排除指定的属性。

**函数签名**
```typescript
function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>
```

**使用示例**

```typescript
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret',
  role: 'admin'
}

// 排除敏感信息
const safeUser = omit(user, ['password'])
console.log(safeUser) // { id: 1, name: 'John', email: 'john@example.com', role: 'admin' }
```

### isEmpty

判断值是否为空。

**函数签名**
```typescript
function isEmpty(value: any): boolean
```

**使用示例**

```typescript
// 各种空值判断
console.log(isEmpty(null)) // true
console.log(isEmpty(undefined)) // true
console.log(isEmpty('')) // true
console.log(isEmpty([])) // true
console.log(isEmpty({})) // true
console.log(isEmpty(new Map())) // true
console.log(isEmpty(new Set())) // true

// 非空值
console.log(isEmpty('hello')) // false
console.log(isEmpty([1, 2, 3])) // false
console.log(isEmpty({ a: 1 })) // false
console.log(isEmpty(0)) // false
console.log(isEmpty(false)) // false

// 实际应用：表单验证
function validateForm(formData: Record<string, any>) {
  const errors: string[] = []
  
  Object.entries(formData).forEach(([key, value]) => {
    if (isEmpty(value)) {
      errors.push(`${key} 不能为空`)
    }
  })
  
  return errors
}
```

## 注意事项

### 性能考虑
- 防抖和节流会创建闭包，注意内存使用
- 深度克隆对大对象可能影响性能
- 频繁的对象操作考虑使用缓存

### 内存管理
- 及时清理事件监听器
- 使用 cancel 方法取消防抖/节流函数
- 避免循环引用导致的内存泄漏

### 类型安全
- 使用 TypeScript 确保类型正确
- 深度克隆可能丢失某些类型信息
- 注意函数参数和返回值的类型

## 相关功能

- [数组操作](/utils/array) - 数组相关工具函数
- [字符串处理](/utils/string) - 字符串工具函数
- [useDebounce](/hooks/use-debounce) - Vue 防抖 Hook
