# 快速开始

欢迎使用 @ldesign/store！这是一个基于 Pinia 的 Vue3 状态管理库，提供了多种灵活的使用方式。

## 安装

首先，你需要安装 @ldesign/store 及其依赖：

```bash
# 使用 npm
npm install @ldesign/store pinia vue reflect-metadata

# 使用 yarn
yarn add @ldesign/store pinia vue reflect-metadata

# 使用 pnpm
pnpm add @ldesign/store pinia vue reflect-metadata
```

::: tip 提示 `reflect-metadata` 是装饰器功能所必需的。如果你不使用装饰器，可以不安装此依赖。 :::

## 基础设置

### 1. 配置 TypeScript

在你的 `tsconfig.json` 中启用装饰器支持：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false
  }
}
```

### 2. 导入 reflect-metadata

在你的应用入口文件（如 `main.ts`）中导入：

```typescript
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import 'reflect-metadata'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

## 创建你的第一个 Store

### 使用类和装饰器

```typescript
// stores/counter.ts
import { Action, BaseStore, Getter, State } from '@ldesign/store'

export class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 'My Counter' })
  title: string = 'My Counter'

  @Action()
  increment() {
    this.count++
  }

  @Action()
  decrement() {
    this.count--
  }

  @Action()
  reset() {
    this.count = 0
  }

  @Getter()
  get displayText() {
    return `${this.title}: ${this.count}`
  }

  @Getter()
  get isPositive() {
    return this.count > 0
  }
}
```

### 在组件中使用

```vue
<script setup lang="ts">
import { CounterStore } from '@/stores/counter'

// 创建 store 实例
const store = new CounterStore('counter')
</script>

<template>
  <div class="counter">
    <h2>{{ store.displayText }}</h2>
    <p>当前计数: {{ store.count }}</p>
    <p v-if="store.isPositive" class="positive">计数为正数！</p>

    <div class="buttons">
      <button @click="store.increment">增加</button>
      <button @click="store.decrement">减少</button>
      <button @click="store.reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.counter {
  padding: 20px;
  text-align: center;
}

.buttons {
  margin-top: 20px;
}

.buttons button {
  margin: 0 10px;
  padding: 8px 16px;
}

.positive {
  color: green;
  font-weight: bold;
}
</style>
```

## 其他使用方式

### Hook 方式

```typescript
// stores/useCounter.ts
import { createStore } from '@ldesign/store'

export const useCounter = createStore('counter', () => {
  const count = ref(0)
  const title = ref('My Counter')

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => (count.value = 0)

  const displayText = computed(() => `${title.value}: ${count.value}`)
  const isPositive = computed(() => count.value > 0)

  return {
    state: { count, title },
    actions: { increment, decrement, reset },
    getters: { displayText, isPositive },
  }
})
```

### Provider 方式

```vue
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { CounterStore } from '@/stores/counter'
import CounterComponent from './CounterComponent.vue'
</script>

<template>
  <StoreProvider :stores="{ counter: CounterStore }">
    <CounterComponent />
  </StoreProvider>
</template>
```

## 下一步

现在你已经了解了基础用法，可以继续学习：

- [装饰器详解](/guide/decorators) - 深入了解各种装饰器
- [Hook 使用方式](/guide/hooks) - 学习函数式的使用方法
- [Provider 模式](/guide/provider) - 了解依赖注入模式
- [API 参考](/api/) - 查看完整的 API 文档
