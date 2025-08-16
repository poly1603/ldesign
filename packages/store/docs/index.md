---
layout: home

hero:
  name: '@ldesign/store'
  text: 'Vue3 状态管理库'
  tagline: '支持类、Hook、Provider、装饰器等多种使用方式的现代状态管理解决方案'
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/installation
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: API 参考
      link: /api/

features:
  - icon: 🎯
    title: 多种使用方式
    details: 支持类式、Hook式、Provider式、装饰器式等多种使用方式，满足不同开发者的偏好和项目需求
  - icon: ⚡
    title: 性能优越
    details: 基于Pinia构建，内置缓存、防抖、节流、Store池管理、性能监控等优化功能，让你的应用更快更流畅
  - icon: 🔒
    title: 类型安全
    details: 完整的TypeScript支持，提供强类型检查和智能提示，减少运行时错误
  - icon: 💾
    title: 自动持久化
    details: 内置持久化功能，支持localStorage、sessionStorage等多种存储方式，数据永不丢失
  - icon: 🎨
    title: 装饰器支持
    details: 丰富的装饰器系统，让状态管理代码更简洁、更具表达力
  - icon: 🔧
    title: 开发友好
    details: 完善的开发工具支持，详细的文档和示例，让开发更高效
---

## 快速体验

### 安装

```bash
pnpm add @ldesign/store pinia vue reflect-metadata
```

### 类式使用

```typescript
import { Action, BaseStore, Getter, State } from '@ldesign/store'

class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Getter()
  get displayText() {
    return `Count: ${this.count}`
  }
}

const store = new CounterStore('counter')
```

### Hook 使用

```typescript
import { createStore } from '@ldesign/store'
import { computed, ref } from 'vue'

export const useCounter = createStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++
  const displayText = computed(() => `Count: ${count.value}`)

  return {
    state: { count },
    actions: { increment },
    getters: { displayText },
  }
})
```

### 在组件中使用

```vue
<script setup lang="ts">
import { CounterStore } from '@/stores/counter'

const store = new CounterStore('counter')
</script>

<template>
  <div>
    <p>{{ store.displayText }}</p>
    <button @click="store.increment">+1</button>
  </div>
</template>
```

## 为什么选择 @ldesign/store？

### 🚀 现代化设计

基于最新的 Vue 3 和 TypeScript 技术栈，提供现代化的开发体验。

### 🎯 灵活多样

四种使用方式任你选择：

- **类式** - 面向对象，装饰器加持
- **Hook 式** - 函数式编程，React 开发者友好
- **Provider 式** - 依赖注入，架构清晰
- **组合式** - Vue3 原生体验

### ⚡ 性能卓越

- 智能缓存机制
- 防抖和节流支持
- Store 池管理，减少内存分配
- 性能监控和优化建议
- 懒加载和按需创建
- Tree-shaking 友好

### 🛠️ 开发体验

- 完整的 TypeScript 类型安全
- 丰富的装饰器支持
- 自动持久化功能
- 开发工具支持

## 社区

- [GitHub](https://github.com/ldesign/store) - 源码和问题反馈
- [npm](https://www.npmjs.com/package/@ldesign/store) - 包管理
- [Discord](https://discord.gg/ldesign) - 社区讨论

## 许可证

[MIT License](https://github.com/ldesign/store/blob/main/LICENSE)
