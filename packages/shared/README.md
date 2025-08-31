# @ldesign/shared

🚀 **LDesign 共享工具库** - 为 Vue 3 应用提供高质量的工具函数、Hooks 和类型定义

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.0+-green.svg)](https://vuejs.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🎯 **类型安全** - 完整的 TypeScript 类型定义，零 `any` 类型
- 🧪 **测试覆盖** - 100% 测试覆盖率，确保代码质量
- 📦 **模块化设计** - 支持按需导入，减少打包体积
- 🔧 **Vue 3 优化** - 专为 Vue 3 Composition API 设计
- 📚 **完整文档** - 详细的 API 文档和使用示例
- 🌐 **跨平台** - 支持现代浏览器和 Node.js 环境

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/shared

# 使用 npm
npm install @ldesign/shared

# 使用 yarn
yarn add @ldesign/shared
```

## 🚀 快速开始

### 工具函数

```typescript
import {
  // 字符串工具
  toCamelCase,
  formatFileSize,
  isValidEmail,

  // 数组工具
  unique,
  chunk,
  groupBy,

  // 日期工具
  formatDate,
  timeAgo,
  addTime,

  // 通用工具
  debounce,
  throttle,
  deepClone
} from '@ldesign/shared'

// 字符串处理
const camelCase = toCamelCase('hello-world') // 'helloWorld'
const fileSize = formatFileSize(1024) // '1.00 KB'

// 数组操作
const uniqueArray = unique([1, 2, 2, 3]) // [1, 2, 3]
const chunks = chunk([1, 2, 3, 4, 5, 6], 2) // [[1, 2], [3, 4], [5, 6]]

// 日期处理
const formatted = formatDate(new Date(), 'YYYY-MM-DD') // '2023-12-25'
const relative = timeAgo(new Date(Date.now() - 60000)) // '1分钟前'
```

### Vue 3 Hooks

```typescript
import {
  useLocalStorage,
  useDebounceValue,
  useNetwork,
  useThrottleFunction
} from '@ldesign/shared'

export default defineComponent({
  setup() {
    // 本地存储
    const [count, setCount] = useLocalStorage('count', 0)

    // 防抖值
    const searchQuery = ref('')
    const debouncedQuery = useDebounceValue(searchQuery, 300)

    // 网络状态
    const { isOnline, effectiveType } = useNetwork()

    // 节流函数
    const throttledSave = useThrottleFunction(saveData, 1000)

    return {
      count,
      setCount,
      debouncedQuery,
      isOnline,
      throttledSave
    }
  }
})
```

### 类型定义

```typescript
import type {
  DeepPartial,
  Nullable,
  ValueOrFunction,
  EasingFunction
} from '@ldesign/shared'

// 深度可选类型
interface User {
  id: number
  name: string
  profile: {
    email: string
    avatar: string
  }
}

type PartialUser = DeepPartial<User> // 所有属性都变为可选

// 可为空类型
const userId: Nullable<number> = null

// 值或函数类型
const config: ValueOrFunction<string> = () => 'dynamic-value'
```

## 📚 模块说明

### 🛠️ 工具函数 (Utils)

| 模块 | 说明 | 主要功能 |
|------|------|----------|
| `string` | 字符串处理 | 命名转换、格式化、验证、模板替换 |
| `array` | 数组操作 | 去重、分组、扁平化、数学运算 |
| `date` | 日期时间 | 格式化、计算、相对时间 |
| `general` | 通用工具 | 防抖节流、深拷贝、类型检查 |
| `easing` | 缓动函数 | 动画缓动、插值计算 |

### 🎣 Vue 3 Hooks

| Hook | 说明 | 用途 |
|------|------|------|
| `useLocalStorage` | 本地存储 | 响应式的 localStorage 操作 |
| `useSessionStorage` | 会话存储 | 响应式的 sessionStorage 操作 |
| `useDebounceValue` | 防抖值 | 值的防抖处理 |
| `useThrottleFunction` | 节流函数 | 函数的节流处理 |
| `useNetwork` | 网络状态 | 网络连接状态监听 |

### 🏷️ 类型定义 (Types)

| 类型 | 说明 | 用途 |
|------|------|------|
| `DeepPartial<T>` | 深度可选 | 将对象所有属性设为可选 |
| `DeepRequired<T>` | 深度必需 | 将对象所有属性设为必需 |
| `Nullable<T>` | 可为空 | 类型可以为 null |
| `ValueOrFunction<T>` | 值或函数 | 支持值或返回值的函数 |

## 🧪 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```

## 📖 文档

详细的 API 文档和使用指南请访问：[LDesign 文档站点](https://ldesign.github.io/shared/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT © LDesign Team
