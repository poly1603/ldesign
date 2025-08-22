# 示例集合

这里提供了各种使用 @ldesign/store 的实际示例，帮助你快速上手和理解不同的使用场景。

## 🎮 交互式体验

在学习代码之前，先体验一下 @ldesign/store 的强大功能：

### 计数器示例

<CounterDemo />

### 待办事项示例

<TodoDemo />

### 购物车示例

<ShoppingCartDemo />

## 基础示例

### 计数器应用

最简单的状态管理示例，展示基本的状态、动作和计算属性。

```typescript
// stores/counter.ts
import { Action, BaseStore, Getter, State } from '@ldesign/store'

export class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 1 })
  step: number = 1

  @Action()
  increment() {
    this.count += this.step
  }

  @Action()
  decrement() {
    this.count -= this.step
  }

  @Action()
  reset() {
    this.count = 0
  }

  @Action()
  setStep(step: number) {
    this.step = Math.max(1, step)
  }

  @Getter()
  get displayText() {
    return `Count: ${this.count}`
  }

  @Getter()
  get isPositive() {
    return this.count > 0
  }
}
```

```vue
<!-- components/Counter.vue -->
<script setup lang="ts">
import { CounterStore } from '@/stores/counter'

const store = new CounterStore('counter')
</script>

<template>
  <div class="counter">
    <h2>{{ store.displayText }}</h2>
    <p class="count">
      {{ store.count }}
    </p>
    <p v-if="store.isPositive" class="positive">正数！</p>

    <div class="controls">
      <label>
        步长:
        <input v-model.number="store.step" type="number" min="1" max="10" />
      </label>

      <div class="buttons">
        <button @click="store.decrement">-{{ store.step }}</button>
        <button @click="store.reset">重置</button>
        <button @click="store.increment">+{{ store.step }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.counter {
  text-align: center;
  padding: 2rem;
}

.count {
  font-size: 3rem;
  font-weight: bold;
  margin: 1rem 0;
}

.positive {
  color: green;
  font-weight: bold;
}

.controls {
  margin-top: 2rem;
}

.buttons {
  margin-top: 1rem;
}

.buttons button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
</style>
```

### 待办事项应用

展示列表管理、过滤和持久化功能。

```typescript
// stores/todos.ts
import { Action, BaseStore, Getter, PersistentState, State } from '@ldesign/store'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

type FilterType = 'all' | 'active' | 'completed'

export class TodoStore extends BaseStore {
  @PersistentState({ default: [] })
  todos: Todo[] = []

  @State({ default: 'all' })
  filter: FilterType = 'all'

  @State({ default: '' })
  newTodoText: string = ''

  @Action()
  addTodo(text: string, priority: Todo['priority'] = 'medium') {
    if (text.trim()) {
      this.todos.push({
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
        priority,
      })
      this.newTodoText = ''
    }
  }

  @Action()
  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  @Action()
  removeTodo(id: number) {
    const index = this.todos.findIndex(t => t.id === id)
    if (index > -1) {
      this.todos.splice(index, 1)
    }
  }

  @Action()
  updateTodo(id: number, updates: Partial<Todo>) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      Object.assign(todo, updates)
    }
  }

  @Action()
  setFilter(filter: FilterType) {
    this.filter = filter
  }

  @Action()
  clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed)
  }

  @Action()
  markAllCompleted() {
    const hasIncomplete = this.todos.some(todo => !todo.completed)
    this.todos.forEach(todo => {
      todo.completed = hasIncomplete
    })
  }

  @Getter()
  get filteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed)
      case 'completed':
        return this.todos.filter(todo => todo.completed)
      default:
        return this.todos
    }
  }

  @Getter()
  get totalCount() {
    return this.todos.length
  }

  @Getter()
  get activeCount() {
    return this.todos.filter(todo => !todo.completed).length
  }

  @Getter()
  get completedCount() {
    return this.todos.filter(todo => todo.completed).length
  }

  @Getter()
  get completionRate() {
    if (this.totalCount === 0) return 0
    return Math.round((this.completedCount / this.totalCount) * 100)
  }
}
```

```vue
<!-- components/TodoApp.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { TodoStore } from '@/stores/todos'

const store = new TodoStore('todos')
const selectedPriority = ref<'low' | 'medium' | 'high'>('medium')

const filters = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '待完成' },
  { value: 'completed', label: '已完成' },
]

function addTodo() {
  if (store.newTodoText.trim()) {
    store.addTodo(store.newTodoText, selectedPriority.value)
  }
}

function getPriorityText(priority: string) {
  const map = { low: '低', medium: '中', high: '高' }
  return map[priority] || priority
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
</script>

<template>
  <div class="todo-app">
    <header class="header">
      <h1>待办事项</h1>
      <div class="stats">
        <span>总计: {{ store.totalCount }}</span>
        <span>待完成: {{ store.activeCount }}</span>
        <span>已完成: {{ store.completedCount }}</span>
        <span>完成率: {{ store.completionRate }}%</span>
      </div>
    </header>

    <div class="input-section">
      <input
        v-model="store.newTodoText"
        placeholder="添加新的待办事项..."
        class="new-todo"
        @keyup.enter="addTodo"
      />
      <select v-model="selectedPriority">
        <option value="low">低优先级</option>
        <option value="medium">中优先级</option>
        <option value="high">高优先级</option>
      </select>
      <button @click="addTodo">添加</button>
    </div>

    <div class="filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        :class="{ active: store.filter === filter.value }"
        @click="store.setFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <ul class="todo-list">
      <li
        v-for="todo in store.filteredTodos"
        :key="todo.id"
        :class="{
          completed: todo.completed,
          [`priority-${todo.priority}`]: true,
        }"
      >
        <input type="checkbox" :checked="todo.completed" @change="store.toggleTodo(todo.id)" />
        <span class="todo-text">{{ todo.text }}</span>
        <span class="priority">{{ getPriorityText(todo.priority) }}</span>
        <span class="date">{{ formatDate(todo.createdAt) }}</span>
        <button class="remove" @click="store.removeTodo(todo.id)">删除</button>
      </li>
    </ul>

    <div v-if="store.totalCount > 0" class="actions">
      <button @click="store.markAllCompleted">
        {{ store.activeCount > 0 ? '全部完成' : '全部未完成' }}
      </button>
      <button v-if="store.completedCount > 0" @click="store.clearCompleted">清除已完成</button>
    </div>
  </div>
</template>

<style scoped>
.todo-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.input-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.new-todo {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filters button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.filters button.active {
  background: #007bff;
  color: white;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed {
  opacity: 0.6;
}

.todo-list li.completed .todo-text {
  text-decoration: line-through;
}

.todo-text {
  flex: 1;
}

.priority {
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
}

.priority-high {
  background: #ffebee;
  color: #c62828;
}

.priority-medium {
  background: #fff3e0;
  color: #ef6c00;
}

.priority-low {
  background: #e8f5e8;
  color: #2e7d32;
}

.date {
  font-size: 0.8rem;
  color: #999;
}

.remove {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  cursor: pointer;
}

.actions {
  margin-top: 1rem;
  text-align: center;
}

.actions button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
}
</style>
```

## 中级示例

### 购物车应用

展示复杂的业务逻辑、计算属性和异步操作。

```typescript
// stores/shopping.ts
import { Action, AsyncAction, BaseStore, Getter, PersistentState, State } from '@ldesign/store'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  stock: number
}

interface CartItem extends Product {
  quantity: number
  addedAt: Date
}

interface Coupon {
  code: string
  discount: number
  minAmount: number
  expiresAt: Date
}

export class ShoppingStore extends BaseStore {
  @State({ default: [] })
  products: Product[] = []

  @PersistentState({ default: [] })
  cartItems: CartItem[] = []

  @State({ default: null })
  appliedCoupon: Coupon | null = null

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null

  // 产品管理
  @AsyncAction()
  async fetchProducts() {
    this.loading = true
    this.error = null

    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('获取产品失败')

      this.products = await response.json()
    } catch (error) {
      this.error = error instanceof Error ? error.message : '获取产品失败'
    } finally {
      this.loading = false
    }
  }

  // 购物车操作
  @Action()
  addToCart(product: Product, quantity: number = 1) {
    const existingItem = this.cartItems.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.cartItems.push({
        ...product,
        quantity,
        addedAt: new Date(),
      })
    }
  }

  @Action()
  removeFromCart(productId: string) {
    const index = this.cartItems.findIndex(item => item.id === productId)
    if (index > -1) {
      this.cartItems.splice(index, 1)
    }
  }

  @Action()
  updateQuantity(productId: string, quantity: number) {
    const item = this.cartItems.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId)
      } else {
        item.quantity = Math.min(quantity, item.stock)
      }
    }
  }

  @Action()
  clearCart() {
    this.cartItems = []
    this.appliedCoupon = null
  }

  // 优惠券操作
  @AsyncAction()
  async applyCoupon(couponCode: string) {
    this.loading = true
    this.error = null

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amount: this.subtotal }),
      })

      if (!response.ok) throw new Error('优惠券无效')

      const coupon = await response.json()
      this.appliedCoupon = coupon
    } catch (error) {
      this.error = error instanceof Error ? error.message : '优惠券验证失败'
    } finally {
      this.loading = false
    }
  }

  @Action()
  removeCoupon() {
    this.appliedCoupon = null
  }

  // 结账
  @AsyncAction()
  async checkout() {
    if (this.cartItems.length === 0) {
      throw new Error('购物车为空')
    }

    this.loading = true
    this.error = null

    try {
      const orderData = {
        items: this.cartItems,
        coupon: this.appliedCoupon,
        total: this.finalTotal,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error('结账失败')

      const order = await response.json()
      this.clearCart()
      return order
    } catch (error) {
      this.error = error instanceof Error ? error.message : '结账失败'
      throw error
    } finally {
      this.loading = false
    }
  }

  // 计算属性
  @Getter()
  get cartItemCount() {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  @Getter()
  get subtotal() {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get discountAmount() {
    if (!this.appliedCoupon) return 0

    if (this.subtotal < this.appliedCoupon.minAmount) return 0

    return Math.min(this.subtotal * (this.appliedCoupon.discount / 100), this.subtotal)
  }

  @Getter()
  get finalTotal() {
    return Math.max(0, this.subtotal - this.discountAmount)
  }

  @Getter()
  get isEmpty() {
    return this.cartItems.length === 0
  }

  @Getter()
  get productsByCategory() {
    return this.products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = []
      }
      acc[product.category].push(product)
      return acc
    }, {} as Record<string, Product[]>)
  }

  @Getter()
  get canApplyCoupon() {
    return this.subtotal > 0 && !this.appliedCoupon
  }
}
```

## Hook 示例

### 用户认证 Hook

```typescript
// hooks/useAuth.ts
import { createStore } from '@ldesign/store'
import { computed, ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface LoginCredentials {
  email: string
  password: string
}

export const useAuth = createStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  // 动作
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) throw new Error('登录失败')

      const data = await response.json()
      user.value = data.user
      token.value = data.token
      localStorage.setItem('auth_token', data.token)

      return data.user
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      if (token.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` },
        })
      }
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      loading.value = false
    }
  }

  const checkAuth = async () => {
    if (!token.value) return false

    loading.value = true

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` },
      })

      if (response.ok) {
        user.value = await response.json()
        return true
      } else {
        await logout()
        return false
      }
    } catch (error) {
      await logout()
      return false
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const isLoggedIn = computed(() => user.value !== null && token.value !== null)
  const userName = computed(() => user.value?.name || '游客')
  const userAvatar = computed(() => {
    if (user.value?.avatar) return user.value.avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}`
  })

  return {
    state: { user, loading, error, token },
    actions: { login, logout, checkAuth },
    getters: { isLoggedIn, userName, userAvatar },
  }
})
```

### 数据获取 Hook

```typescript
// hooks/useApi.ts
import { createStore } from '@ldesign/store'
import { computed, ref } from 'vue'

export function createApiHook<T>(
  url: string,
  options: {
    immediate?: boolean
    transform?: (data: any) => T
  } = {}
) {
  return createStore(`api-${url}`, () => {
    const data = ref<T | null>(null)
    const loading = ref(false)
    const error = ref<Error | null>(null)
    const lastFetch = ref<Date | null>(null)

    const fetch = async (params?: Record<string, any>) => {
      loading.value = true
      error.value = null

      try {
        const searchParams = params ? new URLSearchParams(params) : ''
        const fullUrl = searchParams ? `${url}?${searchParams}` : url

        const response = await window.fetch(fullUrl)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const rawData = await response.json()
        data.value = options.transform ? options.transform(rawData) : rawData
        lastFetch.value = new Date()

        return data.value
      } catch (err) {
        error.value = err instanceof Error ? err : new Error('请求失败')
        throw err
      } finally {
        loading.value = false
      }
    }

    const refresh = () => fetch()
    const reset = () => {
      data.value = null
      error.value = null
      lastFetch.value = null
    }

    // 自动获取
    if (options.immediate !== false) {
      fetch()
    }

    const hasData = computed(() => data.value !== null)
    const hasError = computed(() => error.value !== null)
    const isStale = computed(() => {
      if (!lastFetch.value) return true
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return lastFetch.value < fiveMinutesAgo
    })

    return {
      state: { data, loading, error, lastFetch },
      actions: { fetch, refresh, reset },
      getters: { hasData, hasError, isStale },
    }
  })
}

// 使用示例
export const useUsers = createApiHook<User[]>('/api/users', {
  transform: data =>
    data.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
    })),
})

export const usePosts = createApiHook<Post[]>('/api/posts')
```

## Provider 示例

### 应用级 Provider

```vue
<!-- App.vue -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { NotificationStore, SettingsStore, ThemeStore, UserStore } from '@/stores'

const stores = {
  user: UserStore,
  settings: SettingsStore,
  notifications: NotificationStore,
  theme: ThemeStore,
}
</script>

<template>
  <StoreProvider :stores="stores">
    <div id="app">
      <NavBar />
      <main>
        <RouterView />
      </main>
      <Footer />
    </div>
  </StoreProvider>
</template>
```

### 页面级 Provider

```vue
<!-- pages/ShoppingPage.vue -->
<script setup lang="ts">
import { StoreProvider } from '@ldesign/store/vue'
import { CartStore, ProductStore, ShoppingStore } from '@/stores'

const shoppingStores = {
  shopping: ShoppingStore,
  products: ProductStore,
  cart: CartStore,
}
</script>

<template>
  <StoreProvider :stores="shoppingStores">
    <div class="shopping-page">
      <ProductFilters />
      <ProductGrid />
      <ShoppingCart />
    </div>
  </StoreProvider>
</template>
```

## 下一步

- 查看 [完整示例项目](https://github.com/ldesign/store-examples)
- 学习 [最佳实践](/guide/best-practices)
- 探索 [高级用法](/guide/advanced)
