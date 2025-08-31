# 快速开始

本指南将帮助你快速上手 @ldesign/shared，从安装到第一个示例，让你在几分钟内开始使用。

## 安装

### 包管理器

推荐使用 pnpm，但你也可以使用 npm 或 yarn：

::: code-group

```bash [pnpm]
pnpm add @ldesign/shared
```

```bash [npm]
npm install @ldesign/shared
```

```bash [yarn]
yarn add @ldesign/shared
```

:::

### CDN

如果你想在浏览器中直接使用，可以通过 CDN 引入：

```html
<script src="https://unpkg.com/@ldesign/shared@latest/dist/index.umd.js"></script>
```

## 基础使用

### 导入方式

@ldesign/shared 支持多种导入方式：

```typescript
// 按需导入（推荐）
import { debounce, formatDate, useLocalStorage } from '@ldesign/shared'

// 分类导入
import { string, array, date } from '@ldesign/shared'

// 类型导入
import type { DeepPartial, Nullable } from '@ldesign/shared'
```

### 第一个示例

让我们从一个简单的示例开始：

```vue
<template>
  <div>
    <h1>计数器: {{ count }}</h1>
    <button @click="increment">增加</button>
    <button @click="decrement">减少</button>
    <button @click="reset">重置</button>
    
    <p>搜索: <input v-model="searchQuery" placeholder="输入搜索关键词" /></p>
    <p>防抖后的值: {{ debouncedQuery }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocalStorage, useDebounceValue } from '@ldesign/shared'

// 响应式本地存储
const [count, setCount] = useLocalStorage('counter', 0)

// 计数器操作
const increment = () => setCount(count.value + 1)
const decrement = () => setCount(count.value - 1)
const reset = () => setCount(0)

// 防抖搜索
const searchQuery = ref('')
const debouncedQuery = useDebounceValue(searchQuery, 300)

// 监听防抖后的搜索值
watch(debouncedQuery, (newQuery) => {
  if (newQuery) {
    console.log('执行搜索:', newQuery)
  }
})
</script>
```

## 工具函数示例

### 字符串处理

```typescript
import { 
  toCamelCase, 
  toKebabCase, 
  capitalize, 
  formatFileSize,
  isValidEmail 
} from '@ldesign/shared'

// 命名转换
const camelCase = toCamelCase('hello-world') // 'helloWorld'
const kebabCase = toKebabCase('helloWorld') // 'hello-world'
const capitalized = capitalize('hello') // 'Hello'

// 格式化
const fileSize = formatFileSize(1048576) // '1.00 MB'

// 验证
const isEmail = isValidEmail('user@example.com') // true
```

### 数组操作

```typescript
import { 
  unique, 
  chunk, 
  groupBy, 
  flatten,
  intersection 
} from '@ldesign/shared'

// 去重
const uniqueArray = unique([1, 2, 2, 3, 3, 4]) // [1, 2, 3, 4]

// 分块
const chunks = chunk([1, 2, 3, 4, 5, 6], 2) // [[1, 2], [3, 4], [5, 6]]

// 分组
const users = [
  { name: 'John', age: 25 },
  { name: 'Jane', age: 30 },
  { name: 'Bob', age: 25 }
]
const grouped = groupBy(users, 'age')
// { '25': [{ name: 'John', age: 25 }, { name: 'Bob', age: 25 }], '30': [{ name: 'Jane', age: 30 }] }

// 扁平化
const flattened = flatten([1, [2, 3], [4, [5, 6]]]) // [1, 2, 3, 4, [5, 6]]

// 交集
const common = intersection([1, 2, 3], [2, 3, 4], [3, 4, 5]) // [3]
```

### 日期处理

```typescript
import { 
  formatDate, 
  timeAgo, 
  addTime, 
  dateDiff 
} from '@ldesign/shared'

const now = new Date()

// 格式化
const formatted = formatDate(now, 'YYYY-MM-DD HH:mm:ss') // '2023-12-25 15:30:45'

// 相对时间
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
const relative = timeAgo(yesterday) // '1天前'

// 时间计算
const nextWeek = addTime(now, 7, 'days')
const diff = dateDiff(nextWeek, now, 'days') // 7
```

## Vue 3 Hooks 示例

### 本地存储

```vue
<script setup>
import { useLocalStorage } from '@ldesign/shared'

// 基础用法
const [name, setName] = useLocalStorage('username', '')

// 对象存储
const [user, setUser] = useLocalStorage('user', {
  id: 0,
  name: '',
  email: ''
})

// 自定义序列化器
const [count, setCount] = useLocalStorage('count', 0, {
  serializer: {
    read: (value) => Number(value),
    write: (value) => String(value)
  }
})
</script>
```

### 防抖和节流

```vue
<script setup>
import { ref } from 'vue'
import { 
  useDebounceValue, 
  useThrottleFunction 
} from '@ldesign/shared'

// 防抖值
const searchInput = ref('')
const debouncedSearch = useDebounceValue(searchInput, 300)

// 节流函数
const handleScroll = useThrottleFunction((event) => {
  console.log('滚动事件', event)
}, 100)

// 在模板中使用
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
```

### 网络状态

```vue
<script setup>
import { useNetwork } from '@ldesign/shared'

const { 
  isOnline, 
  type, 
  effectiveType, 
  downlink, 
  rtt 
} = useNetwork()

// 根据网络状态调整行为
watch(isOnline, (online) => {
  if (online) {
    console.log('网络已连接')
    // 重新加载数据
  } else {
    console.log('网络已断开')
    // 显示离线提示
  }
})

watch(effectiveType, (type) => {
  if (type === 'slow-2g' || type === '2g') {
    // 启用低数据模式
    console.log('检测到慢速网络，启用低数据模式')
  }
})
</script>

<template>
  <div>
    <p>网络状态: {{ isOnline ? '在线' : '离线' }}</p>
    <p>连接类型: {{ type }}</p>
    <p>有效类型: {{ effectiveType }}</p>
    <p>下行速度: {{ downlink }} Mbps</p>
    <p>往返时间: {{ rtt }} ms</p>
  </div>
</template>
```

## 类型定义示例

```typescript
import type { 
  DeepPartial, 
  DeepRequired,
  Nullable, 
  ValueOrFunction 
} from '@ldesign/shared'

// 深度可选类型
interface User {
  id: number
  name: string
  profile: {
    email: string
    avatar: string
    settings: {
      theme: 'light' | 'dark'
      notifications: boolean
    }
  }
}

type PartialUser = DeepPartial<User>
// 所有属性都变为可选，包括嵌套属性

// 深度必需类型
type RequiredUser = DeepRequired<PartialUser>
// 所有属性都变为必需

// 可为空类型
const userId: Nullable<number> = null
const userName: Nullable<string> = 'John'

// 值或函数类型
const staticConfig: ValueOrFunction<string> = 'static-value'
const dynamicConfig: ValueOrFunction<string> = () => 'dynamic-value'
```

## 下一步

现在你已经了解了基础用法，可以：

- 查看 [API 参考](/api/) 了解所有可用的函数和 Hooks
- 浏览 [示例](/examples/) 查看更多实际应用场景
- 阅读 [工具函数指南](/guide/utils) 深入了解工具函数
- 学习 [Vue 3 Hooks 指南](/guide/hooks) 掌握响应式编程

## 获得帮助

如果你遇到问题或有疑问：

- 查看 [常见问题](https://github.com/ldesign/shared/wiki/FAQ)
- 在 [GitHub Issues](https://github.com/ldesign/shared/issues) 提问
- 加入我们的 [Discord 社区](https://discord.gg/ldesign)
