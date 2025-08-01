# @ldesign/store

> 🚀 一个基于Pinia的Vue3状态管理库，支持类、Hook、Provider、装饰器等多种使用方式，性能优越，功能丰富！

[![npm version](https://badge.fury.io/js/@ldesign%2Fstore.svg)](https://badge.fury.io/js/@ldesign%2Fstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ 特性亮点

🎯 **四种使用方式，随心所欲**

- 🏛️ **类式**：面向对象，装饰器加持，优雅如诗
- 🪝 **Hook式**：函数式编程，简洁明了，React开发者的最爱
- 🔌 **Provider式**：依赖注入，解耦合，架构师的选择
- 🧩 **组合式**：Vue3 Composition API，原生体验

⚡ **性能爆表，快如闪电**

- 🏎️ 基于 Pinia 的高性能状态管理
- 🧠 智能缓存、防抖、节流，性能优化到极致
- 🦥 懒加载和按需创建，资源利用最大化

🛠️ **功能丰富，应有尽有**

- 🎨 装饰器支持（@State、@Action、@Getter）
- 💾 持久化存储，数据永不丢失
- 📦 批量操作，效率翻倍
- 🔒 TypeScript 类型安全，bug无处遁形
- 🔧 开发工具支持，调试如虎添翼

📦 **打包友好，兼容性强**

- 📚 支持 ESM、CJS、UMD、IIFE 多种格式
- 🌳 Tree-shaking 友好，包体积最小化
- 📝 完整的类型定义文件

## 🚀 快速开始

### 安装

```bash
# 选择你喜欢的包管理器
npm install @ldesign/store pinia vue reflect-metadata
# 或者
yarn add @ldesign/store pinia vue reflect-metadata
# 或者
pnpm add @ldesign/store pinia vue reflect-metadata
```

### 30秒上手 - 装饰器方式

```typescript
import { Action, BaseStore, Getter, State } from '@ldesign/store'

// 🎨 用装饰器打造你的专属Store
class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 'My Awesome Counter' })
  title: string = 'My Awesome Counter'

  @Action()
  increment() {
    this.count++
    console.log('🎉 Count increased!')
  }

  @Action()
  decrement() {
    this.count--
    console.log('📉 Count decreased!')
  }

  @Getter()
  get displayText() {
    return `${this.title}: ${this.count} 🔥`
  }
}

// 🚀 创建并使用
const store = new CounterStore('counter')
store.increment()
console.log(store.displayText) // "My Awesome Counter: 1 🔥"
```

### Vue组件中的魔法时刻

```vue
<script setup lang="ts">
import { CounterStore } from './stores/counter'

// ✨ 一行代码，状态管理就绪！
const store = new CounterStore('counter')
</script>

<template>
  <div class="counter-magic">
    <h1>{{ store.displayText }}</h1>
    <div class="counter-display">
      <span class="count">{{ store.count }}</span>
    </div>
    <div class="button-group">
      <button class="btn btn-plus" @click="store.increment">
        ➕ 增加
      </button>
      <button class="btn btn-minus" @click="store.decrement">
        ➖ 减少
      </button>
    </div>
  </div>
</template>

<style scoped>
.counter-magic {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.counter-display {
  font-size: 4rem;
  font-weight: bold;
  margin: 2rem 0;
}

.btn {
  margin: 0 1rem;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
</style>
```

## 🎭 多种使用方式展示

### 🏛️ 类式 + 装饰器（推荐）

```typescript
class UserStore extends BaseStore {
  @PersistentState({ default: null })
  user: User | null = null

  @State({ default: false })
  loading: boolean = false

  @AsyncAction()
  async login(credentials: LoginCredentials) {
    this.loading = true
    try {
      this.user = await api.login(credentials)
      console.log('🎉 登录成功！')
    }
    finally {
      this.loading = false
    }
  }

  @CachedGetter(['user'])
  get userProfile() {
    return this.user ? `${this.user.name} (${this.user.email})` : '未登录'
  }
}
```

### 🪝 Hook式（函数式爱好者）

```typescript
import { createStore } from '@ldesign/store'

export const useCounter = createStore('counter', () => {
  const count = ref(0)
  const title = ref('Hook Counter')

  const increment = () => {
    count.value++
    console.log('🚀 Hook方式增加！')
  }

  const displayText = computed(() => `${title.value}: ${count.value}`)

  return {
    state: { count, title },
    actions: { increment },
    getters: { displayText }
  }
})
```

### 🔌 Provider式（架构师之选）

```vue
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'

const stores = {
  user: UserStore,
  cart: ShoppingCartStore,
  notifications: NotificationStore
}
</script>

<template>
  <StoreProvider :stores="stores">
    <UserDashboard />
    <ShoppingCart />
    <NotificationCenter />
  </StoreProvider>
</template>
```

## 🎨 装饰器魔法秀

### 🎯 状态装饰器

```typescript
class MagicStore extends BaseStore {
  @State({ default: 'Hello' })
  message: string = 'Hello'

  @ReactiveState({ default: { theme: 'dark', lang: 'zh' } })
  settings: Settings = { theme: 'dark', lang: 'zh' }

  @PersistentState({ default: [] })
  favorites: string[] = []

  @ReadonlyState({ value: '2024' })
  year: string
}
```

### ⚡ 动作装饰器

```typescript
class ActionStore extends BaseStore {
  @DebouncedAction(300) // 防抖搜索，用户体验满分
  async search(query: string) {
    return await api.search(query)
  }

  @ThrottledAction(100) // 节流滚动，性能无忧
  updateScrollPosition(position: number) {
    this.scrollY = position
  }

  @CachedAction(5000) // 缓存结果，速度飞起
  async expensiveOperation(data: any) {
    return await heavyComputation(data)
  }
}
```

### 🧮 计算装饰器

```typescript
class ComputedStore extends BaseStore {
  @CachedGetter(['items']) // 智能缓存
  get expensiveCalculation() {
    return this.items.reduce((sum, item) => sum + item.value, 0)
  }

  @MemoizedGetter(['firstName', 'lastName']) // 记忆化计算
  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
```

## 🌟 实战案例

### 🛒 购物车系统

```typescript
class ShoppingCartStore extends BaseStore {
  @PersistentState({ default: [] })
  items: CartItem[] = []

  @State({ default: false })
  loading: boolean = false

  @Action()
  addItem(product: Product, quantity: number = 1) {
    const existingItem = this.items.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    }
    else {
      this.items.push({ ...product, quantity })
    }
    console.log(`🛒 已添加 ${product.name} 到购物车`)
  }

  @Action()
  removeItem(productId: string) {
    const index = this.items.findIndex(item => item.id === productId)
    if (index > -1) {
      const item = this.items[index]
      this.items.splice(index, 1)
      console.log(`🗑️ 已从购物车移除 ${item.name}`)
    }
  }

  @CachedGetter(['items'])
  get totalPrice() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  @AsyncAction()
  async checkout() {
    this.loading = true
    try {
      await api.checkout(this.items)
      this.items = []
      console.log('🎉 结账成功！')
    }
    finally {
      this.loading = false
    }
  }
}
```

## 📚 文档导航

- 📖 [完整文档](https://ldesign-store.netlify.app) - 详细的使用指南
- 🚀 [快速开始](https://ldesign-store.netlify.app/guide/getting-started) - 5分钟上手
- 🎨 [装饰器指南](https://ldesign-store.netlify.app/guide/decorators) - 装饰器魔法
- 🪝 [Hook使用](https://ldesign-store.netlify.app/guide/hooks) - 函数式编程
- 🔌 [Provider模式](https://ldesign-store.netlify.app/guide/provider) - 依赖注入
- 📋 [API参考](https://ldesign-store.netlify.app/api/) - 完整API文档

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. 🍴 Fork 这个项目
2. 🌿 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 📤 推送到分支 (`git push origin feature/AmazingFeature`)
5. 🔀 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 [Pinia](https://pinia.vuejs.org/) 提供的优秀状态管理基础
- 感谢 [Vue.js](https://vuejs.org/) 团队的杰出工作
- 感谢所有贡献者的辛勤付出

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️！**

Made with ❤️ by [LDesign Team](https://github.com/ldesign)

</div>
