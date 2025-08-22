# 基础示例

这里展示了 @ldesign/store 的基础使用示例，帮助你快速上手。

## 计数器示例

最简单的状态管理示例：

<CounterDemo />

### 代码实现

```typescript
import { Action, BaseStore, Getter, State } from '@ldesign/store'

class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 1 })
  step: number = 1

  @Action()
  increment() {
    this.count++
  }

  @Action()
  decrement() {
    this.count--
  }

  @Action()
  add(value: number) {
    this.count += value
  }

  @Action()
  reset() {
    this.count = 0
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }

  @Getter()
  get isPositive() {
    return this.count > 0
  }
}

// 使用
const counterStore = new CounterStore('counter')
counterStore.increment()
console.log(counterStore.count) // 1
console.log(counterStore.doubleCount) // 2
```

## 待办事项示例

展示持久化状态管理和复杂业务逻辑：

<TodoDemo />

### 核心特性

- **持久化存储**：使用 `@PersistentState` 自动保存数据
- **计算属性**：自动计算过滤结果和统计信息
- **类型安全**：完整的 TypeScript 类型支持
- **响应式更新**：状态变化自动更新 UI

## 购物车示例

展示复杂的业务逻辑和计算属性：

<ShoppingCartDemo />

### 功能亮点

- **商品管理**：添加、删除、更新商品数量
- **价格计算**：自动计算小计、税费、运费
- **优惠券系统**：支持百分比和固定金额折扣
- **持久化**：购物车数据自动保存

## 基础概念

### 状态装饰器

```typescript
class ExampleStore extends BaseStore {
  // 基础状态
  @State({ default: '' })
  name: string = ''

  // 持久化状态
  @PersistentState({ default: [] })
  items: Item[] = []

  // 只读状态
  @ReadonlyState({ value: 'v1.0.0' })
  readonly version: string
}
```

### 动作装饰器

```typescript
class ExampleStore extends BaseStore {
  // 同步动作
  @Action()
  updateName(name: string) {
    this.name = name
  }

  // 异步动作
  @AsyncAction()
  async fetchData() {
    const data = await api.getData()
    this.data = data
  }

  // 缓存动作
  @CachedAction(5000)
  async expensiveOperation() {
    return await heavyComputation()
  }
}
```

### 计算属性装饰器

```typescript
class ExampleStore extends BaseStore {
  @State({ default: [] })
  items: Item[] = []

  // 基础计算属性
  @Getter()
  get itemCount() {
    return this.items.length
  }

  // 缓存计算属性
  @CachedGetter(['items'])
  get expensiveCalculation() {
    return this.items.reduce((sum, item) => sum + item.value, 0)
  }

  // 记忆化计算属性
  @MemoizedGetter()
  getItemsByCategory(category: string) {
    return this.items.filter(item => item.category === category)
  }
}
```

## Vue 组件集成

### 在组件中使用

```vue
<script setup lang="ts">
import { ExampleStore } from '@/stores/example'

const store = new ExampleStore('example')

const newItem = {
  id: Date.now(),
  name: '新项目',
  category: 'default',
  value: 100,
}
</script>

<template>
  <div>
    <h1>{{ store.name }}</h1>
    <p>项目数量: {{ store.itemCount }}</p>
    <button @click="store.addItem(newItem)">添加项目</button>
  </div>
</template>
```

### 响应式监听

```typescript
import { watch } from 'vue'

// 监听状态变化
watch(
  () => store.items,
  (newItems, oldItems) => {
    console.log('项目列表变化:', newItems)
  },
  { deep: true }
)

// 监听计算属性
watch(
  () => store.itemCount,
  newCount => {
    console.log('项目数量:', newCount)
  }
)

// 使用 Store 的订阅方法
const unsubscribe = store.$subscribe((mutation, state) => {
  console.log('状态变化:', mutation.type, state)
})

// 清理订阅
onUnmounted(() => {
  unsubscribe()
})
```

## 最佳实践

### 1. Store 命名

```typescript
// ✅ 好的命名
class UserStore extends BaseStore {}
class ShoppingCartStore extends BaseStore {}
class ProductCatalogStore extends BaseStore {}

// ❌ 不好的命名
class Store extends BaseStore {}
class DataStore extends BaseStore {}
class MyStore extends BaseStore {}
```

### 2. 状态设计

```typescript
// ✅ 扁平化状态结构
class UserStore extends BaseStore {
  @State({ default: null })
  currentUser: User | null = null

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null
}

// ❌ 嵌套过深的状态
class UserStore extends BaseStore {
  @State({ default: { user: { profile: { data: null } } } })
  userData: any = {}
}
```

### 3. 动作设计

```typescript
// ✅ 纯函数动作
class UserStore extends BaseStore {
  @Action()
  setUser(user: User) {
    this.currentUser = user
  }

  @AsyncAction()
  async fetchUser(id: string) {
    const user = await userApi.getUser(id)
    this.setUser(user)
  }
}

// ❌ 有副作用的动作
class UserStore extends BaseStore {
  @Action()
  setUserAndRedirect(user: User) {
    this.currentUser = user
    window.location.href = '/dashboard' // 副作用
  }
}
```

## 下一步

- 查看 [中级示例](/examples/intermediate) 了解更复杂的用法
- 学习 [高级示例](/examples/advanced) 掌握高级技巧
- 探索 [实战项目](/examples/real-world/) 查看完整的项目示例
