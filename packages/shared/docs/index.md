---
layout: home

hero:
  name: "@ldesign/shared"
  text: "LDesign 共享工具库"
  tagline: 为 Vue 3 应用提供高质量的工具函数、Hooks 和类型定义
  image:
    src: /logo.svg
    alt: LDesign Shared
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 参考
      link: /api/
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/ldesign/shared

features:
  - icon: 🎯
    title: 类型安全
    details: 完整的 TypeScript 类型定义，零 any 类型，提供最佳的开发体验
  - icon: 🧪
    title: 测试覆盖
    details: 100% 测试覆盖率，确保代码质量和稳定性
  - icon: 📦
    title: 模块化设计
    details: 支持按需导入，减少打包体积，优化应用性能
  - icon: 🔧
    title: Vue 3 优化
    details: 专为 Vue 3 Composition API 设计，提供响应式的工具函数
  - icon: 📚
    title: 完整文档
    details: 详细的 API 文档和使用示例，让你快速上手
  - icon: 🌐
    title: 跨平台
    details: 支持现代浏览器和 Node.js 环境，适用于各种场景
---

## 快速体验

### 安装

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

### 基础使用

```typescript
// 导入工具函数
import { formatDate, debounce, unique } from '@ldesign/shared'

// 导入 Vue 3 Hooks
import { useLocalStorage, useDebounceValue } from '@ldesign/shared'

// 导入类型定义
import type { DeepPartial, Nullable } from '@ldesign/shared'
```

## 主要功能

### 🛠️ 丰富的工具函数

提供字符串、数组、日期、通用工具等多个类别的实用函数：

```typescript
// 字符串处理
toCamelCase('hello-world') // 'helloWorld'
formatFileSize(1024) // '1.00 KB'

// 数组操作
unique([1, 2, 2, 3]) // [1, 2, 3]
chunk([1, 2, 3, 4], 2) // [[1, 2], [3, 4]]

// 日期处理
formatDate(new Date(), 'YYYY-MM-DD') // '2023-12-25'
```

### 🎣 强大的 Vue 3 Hooks

专为 Vue 3 设计的响应式 Hooks：

```vue
<script setup>
import { useLocalStorage, useDebounceValue } from '@ldesign/shared'

// 响应式本地存储
const [count, setCount] = useLocalStorage('count', 0)

// 防抖值
const searchQuery = ref('')
const debouncedQuery = useDebounceValue(searchQuery, 300)
</script>
```

### 🏷️ 完整的类型定义

提供丰富的 TypeScript 类型工具：

```typescript
// 深度可选类型
type PartialUser = DeepPartial<User>

// 可为空类型
const userId: Nullable<number> = null

// 值或函数类型
const config: ValueOrFunction<string> = () => 'value'
```

## 为什么选择 @ldesign/shared？

- **🚀 开箱即用** - 无需配置，直接使用
- **💡 最佳实践** - 基于社区最佳实践设计
- **🔄 持续更新** - 跟随 Vue 3 生态系统发展
- **🤝 社区驱动** - 欢迎贡献和反馈

## 开始使用

准备好开始了吗？查看我们的[快速开始指南](/guide/getting-started)，或者直接浏览 [API 参考](/api/)。

## 贡献

我们欢迎所有形式的贡献！请查看我们的[贡献指南](https://github.com/ldesign/shared/blob/main/CONTRIBUTING.md)了解更多信息。

## 许可证

[MIT](https://github.com/ldesign/shared/blob/main/LICENSE) © LDesign Team
