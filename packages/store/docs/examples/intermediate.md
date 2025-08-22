# 中级示例

这里展示了 @ldesign/store 的中级使用技巧，包括异步操作、缓存策略、状态组合等。

## 异步数据管理

### 用户管理系统

展示如何处理异步操作、加载状态和错误处理：

```typescript
// stores/user.ts
import { AsyncAction, BaseStore, CachedAction, Getter, State } from '@ldesign/store'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
}

interface UserFilters {
  search: string
  status: 'all' | 'active' | 'inactive'
  role: string
}

export class UserStore extends BaseStore {
  @State({ default: [] })
  users: User[] = []

  @State({ default: null })
  selectedUser: User | null = null

  @State({ default: false })
  loading: boolean = false

  @State({ default: false })
  saving: boolean = false

  @State({ default: null })
  error: string | null = null

  @State({ default: { search: '', status: 'all', role: '' } })
  filters: UserFilters = { search: '', status: 'all', role: '' }

  @State({ default: 1 })
  currentPage: number = 1

  @State({ default: 20 })
  pageSize: number = 20

  @State({ default: 0 })
  totalCount: number = 0

  // 获取用户列表
  @AsyncAction()
  async fetchUsers() {
    try {
      this.error = null
      const response = await userApi.getUsers({
        page: this.currentPage,
        pageSize: this.pageSize,
        filters: this.filters,
      })

      this.users = response.users
      this.totalCount = response.total
    } catch (error) {
      this.error = error instanceof Error ? error.message : '获取用户失败'
      throw error
    }
  }

  // 缓存的用户详情获取
  @CachedAction(300000) // 缓存 5 分钟
  async fetchUserById(id: string): Promise<User> {
    try {
      const response = await userApi.getUserById(id)
      return response.user
    } catch (error) {
      this.error = error instanceof Error ? error.message : '获取用户详情失败'
      throw error
    }
  }

  // 创建用户
  @AsyncAction({ loadingState: 'saving' })
  async createUser(userData: Omit<User, 'id' | 'createdAt'>) {
    try {
      this.error = null
      const response = await userApi.createUser(userData)
      this.users.push(response.user)
      this.totalCount++
      return response.user
    } catch (error) {
      this.error = error instanceof Error ? error.message : '创建用户失败'
      throw error
    }
  }

  // 更新用户
  @AsyncAction({ loadingState: 'saving' })
  async updateUser(id: string, updates: Partial<User>) {
    try {
      this.error = null
      const response = await userApi.updateUser(id, updates)
      const index = this.users.findIndex(u => u.id === id)
      if (index > -1) {
        this.users[index] = response.user
      }
      if (this.selectedUser?.id === id) {
        this.selectedUser = response.user
      }
      return response.user
    } catch (error) {
      this.error = error instanceof Error ? error.message : '更新用户失败'
      throw error
    }
  }

  // 删除用户
  @AsyncAction()
  async deleteUser(id: string) {
    try {
      this.error = null
      await userApi.deleteUser(id)
      const index = this.users.findIndex(u => u.id === id)
      if (index > -1) {
        this.users.splice(index, 1)
        this.totalCount--
      }
      if (this.selectedUser?.id === id) {
        this.selectedUser = null
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : '删除用户失败'
      throw error
    }
  }

  // 设置过滤器
  @Action()
  setFilters(filters: Partial<UserFilters>) {
    this.filters = { ...this.filters, ...filters }
    this.currentPage = 1 // 重置到第一页
  }

  // 设置当前页
  @Action()
  setCurrentPage(page: number) {
    this.currentPage = page
  }

  // 选择用户
  @Action()
  async selectUser(id: string) {
    if (this.selectedUser?.id === id) return

    try {
      const user = await this.fetchUserById(id)
      this.selectedUser = user
    } catch (error) {
      console.error('选择用户失败:', error)
    }
  }

  // 清除选择
  @Action()
  clearSelection() {
    this.selectedUser = null
  }

  // 计算属性
  @Getter()
  get filteredUsers() {
    let filtered = this.users

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase()
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
      )
    }

    if (this.filters.status !== 'all') {
      // 假设有状态字段
      filtered = filtered.filter(user => user.status === this.filters.status)
    }

    if (this.filters.role) {
      // 假设有角色字段
      filtered = filtered.filter(user => user.role === this.filters.role)
    }

    return filtered
  }

  @Getter()
  get totalPages() {
    return Math.ceil(this.totalCount / this.pageSize)
  }

  @Getter()
  get hasNextPage() {
    return this.currentPage < this.totalPages
  }

  @Getter()
  get hasPrevPage() {
    return this.currentPage > 1
  }

  @Getter()
  get isFirstPage() {
    return this.currentPage === 1
  }

  @Getter()
  get isLastPage() {
    return this.currentPage === this.totalPages
  }
}
```

### 在组件中使用

```vue
<script setup lang="ts">
import { debounce } from '@ldesign/store'
import { onMounted, ref, watch } from 'vue'
import { UserStore } from '@/stores/user'

const userStore = new UserStore('user')

// 防抖搜索
const handleSearch = debounce(() => {
  userStore.setFilters({ search: userStore.filters.search })
  userStore.fetchUsers()
}, 300)

function handleFilterChange() {
  userStore.fetchUsers()
}

function editUser(user: User) {
  // 编辑用户逻辑
  console.log('编辑用户:', user)
}

async function deleteUser(id: string) {
  if (confirm('确定要删除这个用户吗？')) {
    try {
      await userStore.deleteUser(id)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN').format(new Date(date))
}

// 监听过滤器变化
watch(
  () => userStore.filters,
  () => {
    userStore.fetchUsers()
  },
  { deep: true }
)

onMounted(() => {
  userStore.fetchUsers()
})
</script>

<template>
  <div class="user-management">
    <!-- 搜索和过滤 -->
    <div class="filters">
      <input
        v-model="userStore.filters.search"
        placeholder="搜索用户..."
        class="search-input"
        @input="handleSearch"
      />

      <select v-model="userStore.filters.status" @change="handleFilterChange">
        <option value="all">所有状态</option>
        <option value="active">活跃</option>
        <option value="inactive">非活跃</option>
      </select>

      <button class="refresh-btn" @click="userStore.fetchUsers()">刷新</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="userStore.loading" class="loading">加载中...</div>

    <!-- 错误状态 -->
    <div v-if="userStore.error" class="error">
      {{ userStore.error }}
      <button @click="userStore.fetchUsers()">重试</button>
    </div>

    <!-- 用户列表 -->
    <div v-if="!userStore.loading" class="user-list">
      <div
        v-for="user in userStore.filteredUsers"
        :key="user.id"
        :class="{ selected: userStore.selectedUser?.id === user.id }"
        class="user-item"
        @click="userStore.selectUser(user.id)"
      >
        <img :src="user.avatar" :alt="user.name" class="avatar" />
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
        </div>
        <div class="user-actions">
          <button @click.stop="editUser(user)">编辑</button>
          <button @click.stop="deleteUser(user.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button
        :disabled="userStore.isFirstPage"
        @click="userStore.setCurrentPage(userStore.currentPage - 1)"
      >
        上一页
      </button>

      <span> 第 {{ userStore.currentPage }} 页，共 {{ userStore.totalPages }} 页 </span>

      <button
        :disabled="userStore.isLastPage"
        @click="userStore.setCurrentPage(userStore.currentPage + 1)"
      >
        下一页
      </button>
    </div>

    <!-- 用户详情 -->
    <div v-if="userStore.selectedUser" class="user-detail">
      <h2>用户详情</h2>
      <div class="detail-content">
        <p><strong>姓名:</strong> {{ userStore.selectedUser.name }}</p>
        <p><strong>邮箱:</strong> {{ userStore.selectedUser.email }}</p>
        <p><strong>创建时间:</strong> {{ formatDate(userStore.selectedUser.createdAt) }}</p>
      </div>
      <button @click="userStore.clearSelection()">关闭</button>
    </div>
  </div>
</template>
```

## 状态组合模式

### 购物车和产品组合

展示如何组合多个 Store 来构建复杂功能：

```typescript
// stores/product.ts
export class ProductStore extends BaseStore {
  @State({ default: [] })
  products: Product[] = []

  @State({ default: new Map() })
  productCache: Map<string, Product> = new Map()

  @CachedAction(60000)
  async fetchProducts(category?: string) {
    const response = await productApi.getProducts({ category })
    this.products = response.products

    // 更新缓存
    response.products.forEach(product => {
      this.productCache.set(product.id, product)
    })

    return response.products
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

  getProduct(id: string): Product | undefined {
    return this.productCache.get(id) || this.products.find(p => p.id === id)
  }
}

// stores/cart.ts
export class CartStore extends BaseStore {
  @PersistentState({ default: [] })
  items: CartItem[] = []

  @State({ default: null })
  appliedCoupon: Coupon | null = null

  private productStore: ProductStore

  constructor(id: string) {
    super(id)
    this.productStore = new ProductStore('product')
  }

  @Action()
  addItem(productId: string, quantity: number = 1) {
    const product = this.productStore.getProduct(productId)
    if (!product) {
      throw new Error('产品不存在')
    }

    const existingItem = this.items.find(item => item.productId === productId)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        id: generateId(),
        productId,
        quantity,
        addedAt: new Date(),
      })
    }
  }

  @Getter()
  get enrichedItems() {
    return this.items.map(item => {
      const product = this.productStore.getProduct(item.productId)
      return {
        ...item,
        product,
        subtotal: product ? product.price * item.quantity : 0,
      }
    })
  }

  @Getter()
  get total() {
    const subtotal = this.enrichedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const discount = this.appliedCoupon ? this.calculateDiscount(subtotal) : 0
    return subtotal - discount
  }

  private calculateDiscount(subtotal: number): number {
    if (!this.appliedCoupon) return 0

    if (this.appliedCoupon.type === 'percentage') {
      return subtotal * (this.appliedCoupon.value / 100)
    } else {
      return Math.min(this.appliedCoupon.value, subtotal)
    }
  }
}

// stores/app.ts - 组合多个 Store
export class AppStore extends BaseStore {
  private userStore: UserStore
  private productStore: ProductStore
  private cartStore: CartStore

  constructor(id: string) {
    super(id)
    this.userStore = new UserStore('user')
    this.productStore = new ProductStore('product')
    this.cartStore = new CartStore('cart')
  }

  // 应用初始化
  @AsyncAction()
  async initialize() {
    try {
      // 并行加载初始数据
      await Promise.all([
        this.userStore.fetchCurrentUser(),
        this.productStore.fetchProducts(),
        this.loadUserPreferences(),
      ])
    } catch (error) {
      console.error('应用初始化失败:', error)
    }
  }

  // 用户登录
  @AsyncAction()
  async login(credentials: LoginCredentials) {
    await this.userStore.login(credentials)

    // 登录后加载用户相关数据
    await this.loadUserData()
  }

  // 用户登出
  @Action()
  async logout() {
    await this.userStore.logout()
    this.cartStore.clearCart()
    this.clearUserData()
  }

  private async loadUserData() {
    // 加载用户的购物车、收藏等
    await Promise.all([this.cartStore.loadFromServer(), this.loadUserFavorites()])
  }

  private clearUserData() {
    // 清除用户相关的本地数据
    this.cartStore.clearCart()
    // 清除其他用户数据...
  }

  @Getter()
  get appStatus() {
    return {
      user: {
        isLoggedIn: this.userStore.isLoggedIn,
        name: this.userStore.currentUser?.name,
      },
      cart: {
        itemCount: this.cartStore.itemCount,
        total: this.cartStore.total,
      },
      products: {
        loaded: this.productStore.products.length > 0,
        categories: Object.keys(this.productStore.productsByCategory),
      },
    }
  }
}
```

## 缓存和性能优化

### 智能缓存策略

```typescript
// stores/data-cache.ts
export class DataCacheStore extends BaseStore {
  @State({ default: new Map() })
  cache: Map<string, CacheEntry> = new Map()

  @State({ default: new Map() })
  requestQueue: Map<string, Promise<any>> = new Map()

  // 带去重的数据获取
  @AsyncAction()
  async fetchWithDeduplication<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000
  ): Promise<T> {
    // 检查缓存
    const cached = this.getCachedData<T>(key)
    if (cached) {
      return cached
    }

    // 检查是否正在请求中
    const existingRequest = this.requestQueue.get(key)
    if (existingRequest) {
      return existingRequest
    }

    // 创建新请求
    const request = fetcher()
      .then(data => {
        this.setCachedData(key, data, ttl)
        this.requestQueue.delete(key)
        return data
      })
      .catch(error => {
        this.requestQueue.delete(key)
        throw error
      })

    this.requestQueue.set(key, request)
    return request
  }

  // 批量数据获取
  @AsyncAction()
  async fetchBatch<T>(
    keys: string[],
    fetcher: (keys: string[]) => Promise<Record<string, T>>,
    ttl: number = 300000
  ): Promise<Record<string, T>> {
    const uncachedKeys: string[] = []
    const result: Record<string, T> = {}

    // 检查缓存
    keys.forEach(key => {
      const cached = this.getCachedData<T>(key)
      if (cached) {
        result[key] = cached
      } else {
        uncachedKeys.push(key)
      }
    })

    // 获取未缓存的数据
    if (uncachedKeys.length > 0) {
      const fetchedData = await fetcher(uncachedKeys)

      Object.entries(fetchedData).forEach(([key, data]) => {
        this.setCachedData(key, data, ttl)
        result[key] = data
      })
    }

    return result
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  private setCachedData<T>(key: string, data: T, ttl: number) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      createdAt: Date.now(),
    })

    // 清理过期缓存
    this.cleanupExpiredCache()
  }

  @Action()
  private cleanupExpiredCache() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
      }
    }
  }

  @Action()
  invalidateCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  @Getter()
  get cacheStats() {
    const entries = Array.from(this.cache.values())
    const now = Date.now()

    return {
      total: entries.length,
      expired: entries.filter(entry => now > entry.expiry).length,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: Math.min(...entries.map(entry => entry.createdAt)),
      newestEntry: Math.max(...entries.map(entry => entry.createdAt)),
    }
  }

  private estimateMemoryUsage(): number {
    // 简单的内存使用估算
    let size = 0
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2 // 字符串大小
      size += JSON.stringify(entry.data).length * 2 // 数据大小估算
      size += 24 // 对象开销
    }
    return size
  }
}

interface CacheEntry {
  data: any
  expiry: number
  createdAt: number
}
```

## 表单状态管理

### 复杂表单处理

```typescript
// stores/form.ts
export class FormStore extends BaseStore {
  @State({ default: {} })
  values: Record<string, any> = {}

  @State({ default: {} })
  errors: Record<string, string[]> = {}

  @State({ default: {} })
  touched: Record<string, boolean> = {}

  @State({ default: false })
  submitting: boolean = false

  @State({ default: false })
  submitted: boolean = false

  @State({ default: {} })
  fieldMeta: Record<string, FieldMeta> = {}

  // 设置字段值
  @Action()
  setFieldValue(name: string, value: any) {
    this.values[name] = value
    this.touched[name] = true

    // 清除该字段的错误
    if (this.errors[name]) {
      delete this.errors[name]
    }

    // 触发依赖字段的验证
    this.validateDependentFields(name)
  }

  // 设置字段错误
  @Action()
  setFieldError(name: string, errors: string[]) {
    if (errors.length > 0) {
      this.errors[name] = errors
    } else {
      delete this.errors[name]
    }
  }

  // 验证单个字段
  @AsyncAction()
  async validateField(name: string) {
    const meta = this.fieldMeta[name]
    if (!meta || !meta.validators) return

    const value = this.values[name]
    const errors: string[] = []

    for (const validator of meta.validators) {
      try {
        const result = await validator(value, this.values)
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : '验证失败')
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : '验证错误')
      }
    }

    this.setFieldError(name, errors)
    return errors.length === 0
  }

  // 验证整个表单
  @AsyncAction()
  async validateForm() {
    const fieldNames = Object.keys(this.fieldMeta)
    const validationResults = await Promise.all(fieldNames.map(name => this.validateField(name)))

    return validationResults.every(result => result)
  }

  // 提交表单
  @AsyncAction()
  async submitForm(onSubmit: (values: any) => Promise<any>) {
    this.submitting = true

    try {
      const isValid = await this.validateForm()
      if (!isValid) {
        throw new Error('表单验证失败')
      }

      const result = await onSubmit(this.values)
      this.submitted = true
      return result
    } catch (error) {
      throw error
    } finally {
      this.submitting = false
    }
  }

  // 重置表单
  @Action()
  resetForm() {
    this.values = {}
    this.errors = {}
    this.touched = {}
    this.submitting = false
    this.submitted = false
  }

  // 注册字段
  @Action()
  registerField(name: string, meta: FieldMeta) {
    this.fieldMeta[name] = meta

    if (meta.defaultValue !== undefined) {
      this.values[name] = meta.defaultValue
    }
  }

  // 注销字段
  @Action()
  unregisterField(name: string) {
    delete this.fieldMeta[name]
    delete this.values[name]
    delete this.errors[name]
    delete this.touched[name]
  }

  private validateDependentFields(changedField: string) {
    Object.entries(this.fieldMeta).forEach(([name, meta]) => {
      if (meta.dependencies?.includes(changedField)) {
        this.validateField(name)
      }
    })
  }

  @Getter()
  get isValid() {
    return Object.keys(this.errors).length === 0
  }

  @Getter()
  get isDirty() {
    return Object.keys(this.touched).length > 0
  }

  @Getter()
  get canSubmit() {
    return this.isValid && this.isDirty && !this.submitting
  }
}

interface FieldMeta {
  defaultValue?: any
  validators?: Array<(value: any, values: any) => boolean | string | Promise<boolean | string>>
  dependencies?: string[]
}
```

## 最佳实践总结

### 1. 异步操作管理

- 使用 `@AsyncAction` 自动管理加载状态
- 实现适当的错误处理和重试机制
- 使用缓存减少不必要的网络请求

### 2. 状态组合

- 将相关功能拆分到不同的 Store
- 通过组合模式管理 Store 之间的依赖
- 保持单一职责原则

### 3. 性能优化

- 使用计算属性缓存复杂计算
- 实现智能缓存策略
- 避免不必要的状态更新

### 4. 类型安全

- 定义清晰的接口和类型
- 使用泛型提高代码复用性
- 利用 TypeScript 的类型检查

## 下一步

- 查看 [高级示例](/examples/advanced) 了解更复杂的用法
- 学习 [实战项目](/examples/real-world/) 查看完整的项目示例
- 探索 [最佳实践](/guide/best-practices) 掌握开发技巧
