# 类式使用指南

类式使用是 @ldesign/store 的核心特性之一，它提供了面向对象的状态管理方式，让你可以用熟悉的类语法来定
义和管理状态。

## 基础类定义

### 创建基础 Store 类

```typescript
import { Action, BaseStore, Getter, State } from '@ldesign/store'

class CounterStore extends BaseStore {
  // 定义状态
  @State({ default: 0 })
  count: number = 0

  @State({ default: 'My Counter' })
  title: string = 'My Counter'

  // 定义动作
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

  @Action()
  setTitle(newTitle: string) {
    this.title = newTitle
  }

  // 定义计算属性
  @Getter()
  get displayText() {
    return `${this.title}: ${this.count}`
  }

  @Getter()
  get isPositive() {
    return this.count > 0
  }
}

// 使用 Store
const counterStore = new CounterStore('counter')
```

### 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { CounterStore } from '@/stores/counter'

const store = new CounterStore('counter')

function updateTitle(event: Event) {
  const target = event.target as HTMLInputElement
  store.setTitle(target.value)
}
</script>

<template>
  <div class="counter">
    <h2>{{ store.displayText }}</h2>
    <p>当前计数: {{ store.count }}</p>
    <p v-if="store.isPositive" class="positive">计数为正数！</p>

    <div class="controls">
      <button @click="store.decrement">-</button>
      <button @click="store.reset">重置</button>
      <button @click="store.increment">+</button>
    </div>

    <input v-model="store.title" placeholder="设置标题" @input="updateTitle" />
  </div>
</template>
```

## 复杂状态管理

### 用户管理 Store

```typescript
interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  preferences: {
    theme: 'light' | 'dark'
    language: string
    notifications: boolean
  }
}

interface LoginCredentials {
  email: string
  password: string
}

class UserStore extends BaseStore {
  // 用户状态
  @PersistentState({ default: null })
  currentUser: User | null = null

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null

  @State({ default: [] })
  recentUsers: User[] = []

  // 认证相关动作
  @AsyncAction()
  async login(credentials: LoginCredentials) {
    this.loading = true
    this.error = null

    try {
      const response = await authApi.login(credentials)
      this.currentUser = response.user
      this.addToRecentUsers(response.user)

      // 触发登录成功事件
      this.onLoginSuccess(response.user)
    } catch (error) {
      this.error = error instanceof Error ? error.message : '登录失败'
      throw error
    } finally {
      this.loading = false
    }
  }

  @AsyncAction()
  async logout() {
    this.loading = true
    try {
      await authApi.logout()
      this.currentUser = null
      this.error = null
    } finally {
      this.loading = false
    }
  }

  @AsyncAction()
  async updateProfile(updates: Partial<User>) {
    if (!this.currentUser) {
      throw new Error('用户未登录')
    }

    this.loading = true
    try {
      const updatedUser = await userApi.updateProfile(this.currentUser.id, updates)
      this.currentUser = { ...this.currentUser, ...updatedUser }
    } finally {
      this.loading = false
    }
  }

  // 用户偏好设置
  @Action()
  updatePreferences(preferences: Partial<User['preferences']>) {
    if (this.currentUser) {
      this.currentUser.preferences = {
        ...this.currentUser.preferences,
        ...preferences,
      }
    }
  }

  @Action()
  setTheme(theme: 'light' | 'dark') {
    this.updatePreferences({ theme })
  }

  @Action()
  setLanguage(language: string) {
    this.updatePreferences({ language })
  }

  // 私有方法
  private addToRecentUsers(user: User) {
    const existingIndex = this.recentUsers.findIndex(u => u.id === user.id)
    if (existingIndex >= 0) {
      this.recentUsers.splice(existingIndex, 1)
    }
    this.recentUsers.unshift(user)

    // 只保留最近 5 个用户
    if (this.recentUsers.length > 5) {
      this.recentUsers = this.recentUsers.slice(0, 5)
    }
  }

  private onLoginSuccess(user: User) {
    // 可以在这里触发其他 Store 的更新
    console.log(`用户 ${user.name} 登录成功`)
  }

  // 计算属性
  @Getter()
  get isLoggedIn() {
    return this.currentUser !== null
  }

  @Getter()
  get userName() {
    return this.currentUser?.name || '游客'
  }

  @Getter()
  get userRole() {
    return this.currentUser?.role || 'guest'
  }

  @Getter()
  get isAdmin() {
    return this.userRole === 'admin'
  }

  @Getter()
  get currentTheme() {
    return this.currentUser?.preferences.theme || 'light'
  }

  @CachedGetter(['currentUser'])
  get userDisplayInfo() {
    if (!this.currentUser) return null

    return {
      name: this.currentUser.name,
      email: this.currentUser.email,
      avatar: this.currentUser.avatar || this.generateAvatar(this.currentUser.name),
      roleText: this.getRoleText(this.currentUser.role),
    }
  }

  // 工具方法
  private generateAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  }

  private getRoleText(role: User['role']): string {
    const roleMap = {
      admin: '管理员',
      user: '用户',
      guest: '游客',
    }
    return roleMap[role]
  }
}
```

### 购物车 Store

```typescript
interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
}

interface CartItem extends Product {
  quantity: number
  addedAt: Date
}

class ShoppingCartStore extends BaseStore {
  @PersistentState({ default: [] })
  items: CartItem[] = []

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  coupon: string | null = null

  @State({ default: 0 })
  discount: number = 0

  // 购物车操作
  @Action()
  addItem(product: Product, quantity: number = 1) {
    const existingItem = this.items.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        ...product,
        quantity,
        addedAt: new Date(),
      })
    }

    this.notifyItemAdded(product, quantity)
  }

  @Action()
  removeItem(productId: string) {
    const index = this.items.findIndex(item => item.id === productId)
    if (index > -1) {
      const removedItem = this.items[index]
      this.items.splice(index, 1)
      this.notifyItemRemoved(removedItem)
    }
  }

  @Action()
  updateQuantity(productId: string, quantity: number) {
    const item = this.items.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  @Action()
  clearCart() {
    this.items = []
    this.coupon = null
    this.discount = 0
  }

  @AsyncAction()
  async applyCoupon(couponCode: string) {
    this.loading = true
    try {
      const response = await couponApi.validate(couponCode)
      this.coupon = couponCode
      this.discount = response.discount
    } catch (error) {
      throw new Error('优惠券无效或已过期')
    } finally {
      this.loading = false
    }
  }

  @AsyncAction()
  async checkout() {
    if (this.isEmpty) {
      throw new Error('购物车为空')
    }

    this.loading = true
    try {
      const orderData = {
        items: this.items,
        coupon: this.coupon,
        discount: this.discount,
        total: this.finalTotal,
      }

      const order = await orderApi.create(orderData)
      this.clearCart()
      return order
    } finally {
      this.loading = false
    }
  }

  // 私有方法
  private notifyItemAdded(product: Product, quantity: number) {
    console.log(`已添加 ${quantity} 个 ${product.name} 到购物车`)
  }

  private notifyItemRemoved(item: CartItem) {
    console.log(`已从购物车移除 ${item.name}`)
  }

  // 计算属性
  @Getter()
  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  @Getter()
  get uniqueItemCount() {
    return this.items.length
  }

  @Getter()
  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get discountAmount() {
    return this.subtotal * (this.discount / 100)
  }

  @Getter()
  get finalTotal() {
    return this.subtotal - this.discountAmount
  }

  @Getter()
  get isEmpty() {
    return this.items.length === 0
  }

  @CachedGetter(['items'])
  get itemsByCategory() {
    return this.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, CartItem[]>)
  }

  @CachedGetter(['items'])
  get recentlyAdded() {
    return [...this.items].sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()).slice(0, 3)
  }
}
```

## 继承和组合

### Store 继承

```typescript
// 基础 Store
abstract class BaseApiStore extends BaseStore {
  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null

  @State({ default: null })
  lastUpdated: Date | null = null

  @Action()
  setLoading(loading: boolean) {
    this.loading = loading
  }

  @Action()
  setError(error: string | null) {
    this.error = error
  }

  @Action()
  updateTimestamp() {
    this.lastUpdated = new Date()
  }

  @Getter()
  get hasError() {
    return this.error !== null
  }

  @Getter()
  get isStale() {
    if (!this.lastUpdated) return true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return this.lastUpdated < fiveMinutesAgo
  }
}

// 继承基础 Store
class ProductStore extends BaseApiStore {
  @State({ default: [] })
  products: Product[] = []

  @State({ default: null })
  selectedProduct: Product | null = null

  @AsyncAction()
  async fetchProducts() {
    this.setLoading(true)
    this.setError(null)

    try {
      const products = await productApi.getAll()
      this.products = products
      this.updateTimestamp()
    } catch (error) {
      this.setError(error instanceof Error ? error.message : '获取产品失败')
    } finally {
      this.setLoading(false)
    }
  }

  @Action()
  selectProduct(product: Product) {
    this.selectedProduct = product
  }

  @Getter()
  get featuredProducts() {
    return this.products.filter(product => product.featured)
  }
}
```

### Store 组合

```typescript
// 组合多个 Store
class AppStore extends BaseStore {
  private userStore: UserStore
  private cartStore: ShoppingCartStore
  private productStore: ProductStore

  constructor(id: string) {
    super(id)
    this.userStore = new UserStore('user')
    this.cartStore = new ShoppingCartStore('cart')
    this.productStore = new ProductStore('product')
  }

  // 代理方法
  @Action()
  async login(credentials: LoginCredentials) {
    await this.userStore.login(credentials)
    // 登录后可能需要刷新购物车
    if (this.userStore.isLoggedIn) {
      await this.syncUserCart()
    }
  }

  @Action()
  async logout() {
    await this.userStore.logout()
    this.cartStore.clearCart()
  }

  @AsyncAction()
  private async syncUserCart() {
    // 同步用户购物车逻辑
    try {
      const serverCart = await cartApi.getUserCart(this.userStore.currentUser!.id)
      // 合并本地购物车和服务器购物车
      this.mergeCart(serverCart)
    } catch (error) {
      console.error('同步购物车失败:', error)
    }
  }

  private mergeCart(serverCart: CartItem[]) {
    // 购物车合并逻辑
    serverCart.forEach(serverItem => {
      const localItem = this.cartStore.items.find(item => item.id === serverItem.id)
      if (localItem) {
        // 取较大的数量
        localItem.quantity = Math.max(localItem.quantity, serverItem.quantity)
      } else {
        this.cartStore.addItem(serverItem, serverItem.quantity)
      }
    })
  }

  // 计算属性
  @Getter()
  get appState() {
    return {
      user: {
        isLoggedIn: this.userStore.isLoggedIn,
        name: this.userStore.userName,
        role: this.userStore.userRole,
      },
      cart: {
        itemCount: this.cartStore.itemCount,
        total: this.cartStore.finalTotal,
        isEmpty: this.cartStore.isEmpty,
      },
      products: {
        count: this.productStore.products.length,
        loading: this.productStore.loading,
        hasError: this.productStore.hasError,
      },
    }
  }

  // 获取子 Store
  get user() {
    return this.userStore
  }
  get cart() {
    return this.cartStore
  }
  get products() {
    return this.productStore
  }
}
```

## 最佳实践

### 1. Store 设计原则

```typescript
// ✅ 好的设计
class UserStore extends BaseStore {
  // 单一职责：只管理用户相关状态
  @State({ default: null })
  currentUser: User | null = null

  @Action()
  setUser(user: User) {
    this.currentUser = user
  }
}

// ❌ 不好的设计
class MixedStore extends BaseStore {
  // 职责混乱：既管理用户又管理产品
  @State({ default: null })
  user: User | null = null

  @State({ default: [] })
  products: Product[] = []
}
```

### 2. 状态规范化

```typescript
// ✅ 规范化的状态结构
class NormalizedStore extends BaseStore {
  @State({ default: {} })
  usersById: Record<string, User> = {}

  @State({ default: [] })
  userIds: string[] = []

  @Getter()
  get users() {
    return this.userIds.map(id => this.usersById[id])
  }
}

// ❌ 非规范化的状态结构
class DenormalizedStore extends BaseStore {
  @State({ default: [] })
  users: User[] = [] // 可能包含重复数据
}
```

### 3. 错误处理

```typescript
class RobustStore extends BaseStore {
  @State({ default: null })
  data: any = null

  @State({ default: null })
  error: Error | null = null

  @AsyncAction()
  async fetchData() {
    try {
      this.error = null
      this.data = await api.getData()
    } catch (error) {
      this.error = error instanceof Error ? error : new Error('未知错误')
      // 记录错误日志
      console.error('获取数据失败:', error)
      // 可以选择重新抛出错误
      throw error
    }
  }
}
```

## 下一步

- 学习 [装饰器详解](/guide/decorators) 了解更多装饰器功能
- 查看 [性能优化](/guide/performance) 提升应用性能
- 探索 [最佳实践](/guide/best-practices) 编写更好的代码
