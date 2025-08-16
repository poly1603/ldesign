# 电商系统完整状态管理

本示例展示了如何使用 @ldesign/store 构建一个完整的电商系统状态管理解决方案，涵盖用户认证、商品管理、
购物车、订单处理等核心功能。

## 系统架构

### Store 架构设计

```
EcommerceApp
├── AuthStore          # 用户认证
├── UserStore           # 用户信息管理
├── ProductStore        # 商品管理
├── CategoryStore       # 商品分类
├── CartStore           # 购物车
├── OrderStore          # 订单管理
├── PaymentStore        # 支付处理
├── InventoryStore      # 库存管理
└── NotificationStore   # 通知系统
```

## 核心 Store 实现

### 1. 用户认证 Store

```typescript
// stores/auth.ts
import { AsyncAction, BaseStore, Getter, PersistentState, State } from '@ldesign/store'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'customer' | 'admin' | 'vendor'
  permissions: string[]
}

interface LoginCredentials {
  email: string
  password: string
}

export class AuthStore extends BaseStore {
  @PersistentState({ default: null, key: 'auth_user' })
  currentUser: User | null = null

  @PersistentState({ default: null, key: 'auth_token' })
  token: string | null = null

  @State({ default: false })
  loading: boolean = false

  @State({ default: null })
  error: string | null = null

  @State({ default: new Date() })
  lastActivity: Date = new Date()

  @AsyncAction()
  async login(credentials: LoginCredentials) {
    this.error = null

    try {
      const response = await authApi.login(credentials)
      this.currentUser = response.user
      this.token = response.token
      this.updateLastActivity()

      // 触发其他 Store 的登录后初始化
      await this.initializeUserData()

      return response.user
    } catch (error) {
      this.error = error instanceof Error ? error.message : '登录失败'
      throw error
    }
  }

  @AsyncAction()
  async logout() {
    try {
      if (this.token) {
        await authApi.logout(this.token)
      }
    } finally {
      this.currentUser = null
      this.token = null
      this.clearUserData()
    }
  }

  @AsyncAction()
  async refreshToken() {
    if (!this.token) return false

    try {
      const response = await authApi.refreshToken(this.token)
      this.token = response.token
      this.updateLastActivity()
      return true
    } catch (error) {
      await this.logout()
      return false
    }
  }

  @Action()
  updateLastActivity() {
    this.lastActivity = new Date()
  }

  private async initializeUserData() {
    // 初始化用户相关数据
    const cartStore = new CartStore('cart')
    const orderStore = new OrderStore('order')

    await Promise.all([
      cartStore.loadUserCart(this.currentUser!.id),
      orderStore.loadUserOrders(this.currentUser!.id),
    ])
  }

  private clearUserData() {
    // 清理用户相关数据
    const cartStore = new CartStore('cart')
    cartStore.clearCart()
  }

  @Getter()
  get isLoggedIn() {
    return this.currentUser !== null && this.token !== null
  }

  @Getter()
  get userRole() {
    return this.currentUser?.role || 'customer'
  }

  @Getter()
  get hasPermission() {
    return (permission: string) => {
      return this.currentUser?.permissions.includes(permission) || false
    }
  }

  @Getter()
  get isSessionExpired() {
    if (!this.lastActivity) return true
    const thirtyMinutes = 30 * 60 * 1000
    return Date.now() - this.lastActivity.getTime() > thirtyMinutes
  }
}
```

### 2. 商品管理 Store

```typescript
// stores/product.ts
import {
  AsyncAction,
  BaseStore,
  CachedAction,
  DebouncedAction,
  Getter,
  State,
} from '@ldesign/store'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  categoryId: string
  brand: string
  tags: string[]
  attributes: Record<string, any>
  stock: number
  rating: number
  reviewCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ProductFilter {
  categoryId?: string
  brand?: string
  priceRange?: [number, number]
  tags?: string[]
  inStock?: boolean
  rating?: number
}

export class ProductStore extends BaseStore {
  @State({ default: [] })
  products: Product[] = []

  @State({ default: [] })
  featuredProducts: Product[] = []

  @State({ default: null })
  selectedProduct: Product | null = null

  @State({ default: '' })
  searchQuery: string = ''

  @State({ default: {} })
  filters: ProductFilter = {}

  @State({ default: 'name' })
  sortBy: 'name' | 'price' | 'rating' | 'createdAt' = 'name'

  @State({ default: 'asc' })
  sortOrder: 'asc' | 'desc' = 'asc'

  @State({ default: 1 })
  currentPage: number = 1

  @State({ default: 20 })
  pageSize: number = 20

  @State({ default: 0 })
  totalCount: number = 0

  @State({ default: false })
  loading: boolean = false

  @AsyncAction()
  async fetchProducts(refresh = false) {
    if (!refresh && this.products.length > 0) return

    try {
      const response = await productApi.getProducts({
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchQuery,
        filters: this.filters,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      })

      this.products = response.products
      this.totalCount = response.total
    } catch (error) {
      console.error('获取商品失败:', error)
      throw error
    }
  }

  @CachedAction(300000) // 缓存5分钟
  async fetchFeaturedProducts() {
    const response = await productApi.getFeaturedProducts()
    this.featuredProducts = response.products
    return response.products
  }

  @AsyncAction()
  async fetchProductById(id: string) {
    try {
      const product = await productApi.getProductById(id)
      this.selectedProduct = product

      // 更新产品列表中的数据
      const index = this.products.findIndex(p => p.id === id)
      if (index > -1) {
        this.products[index] = product
      }

      return product
    } catch (error) {
      console.error('获取商品详情失败:', error)
      throw error
    }
  }

  @DebouncedAction(300)
  async searchProducts(query: string) {
    this.searchQuery = query
    this.currentPage = 1
    await this.fetchProducts(true)
  }

  @Action()
  setFilters(filters: Partial<ProductFilter>) {
    this.filters = { ...this.filters, ...filters }
    this.currentPage = 1
  }

  @Action()
  setSorting(sortBy: typeof this.sortBy, sortOrder: typeof this.sortOrder) {
    this.sortBy = sortBy
    this.sortOrder = sortOrder
    this.currentPage = 1
  }

  @Action()
  setPage(page: number) {
    this.currentPage = page
  }

  @Action()
  clearFilters() {
    this.filters = {}
    this.searchQuery = ''
    this.currentPage = 1
  }

  @Getter()
  get filteredProducts() {
    let filtered = [...this.products]

    // 应用搜索
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 应用过滤器
    if (this.filters.categoryId) {
      filtered = filtered.filter(p => p.categoryId === this.filters.categoryId)
    }

    if (this.filters.brand) {
      filtered = filtered.filter(p => p.brand === this.filters.brand)
    }

    if (this.filters.priceRange) {
      const [min, max] = this.filters.priceRange
      filtered = filtered.filter(p => p.price >= min && p.price <= max)
    }

    if (this.filters.inStock) {
      filtered = filtered.filter(p => p.stock > 0)
    }

    if (this.filters.rating) {
      filtered = filtered.filter(p => p.rating >= this.filters.rating!)
    }

    // 应用排序
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy]
      let bValue: any = b[this.sortBy]

      if (this.sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

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
  get productsByCategory() {
    return this.products.reduce((acc, product) => {
      if (!acc[product.categoryId]) {
        acc[product.categoryId] = []
      }
      acc[product.categoryId].push(product)
      return acc
    }, {} as Record<string, Product[]>)
  }

  @Getter()
  get availableBrands() {
    return [...new Set(this.products.map(p => p.brand))].sort()
  }

  @Getter()
  get priceRange() {
    if (this.products.length === 0) return [0, 0]

    const prices = this.products.map(p => p.price)
    return [Math.min(...prices), Math.max(...prices)]
  }
}
```

### 3. 购物车 Store

```typescript
// stores/cart.ts
import { Action, AsyncAction, BaseStore, Getter, PersistentState, State } from '@ldesign/store'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  selectedAttributes: Record<string, any>
  addedAt: Date
}

interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxDiscount?: number
  expiresAt: Date
}

export class CartStore extends BaseStore {
  @PersistentState({ default: [] })
  items: CartItem[] = []

  @State({ default: null })
  appliedCoupon: Coupon | null = null

  @State({ default: 0 })
  shippingFee: number = 0

  @State({ default: 0 })
  tax: number = 0

  @State({ default: false })
  loading: boolean = false

  @Action()
  addItem(product: Product, quantity: number = 1, attributes: Record<string, any> = {}) {
    const existingItem = this.items.find(
      item =>
        item.productId === product.id &&
        JSON.stringify(item.selectedAttributes) === JSON.stringify(attributes)
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        id: generateId(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity,
        selectedAttributes: attributes,
        addedAt: new Date(),
      })
    }

    this.calculateShippingAndTax()
  }

  @Action()
  removeItem(itemId: string) {
    const index = this.items.findIndex(item => item.id === itemId)
    if (index > -1) {
      this.items.splice(index, 1)
      this.calculateShippingAndTax()
    }
  }

  @Action()
  updateQuantity(itemId: string, quantity: number) {
    const item = this.items.find(item => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId)
      } else {
        item.quantity = quantity
        this.calculateShippingAndTax()
      }
    }
  }

  @Action()
  clearCart() {
    this.items = []
    this.appliedCoupon = null
    this.shippingFee = 0
    this.tax = 0
  }

  @AsyncAction()
  async applyCoupon(couponCode: string) {
    try {
      const coupon = await couponApi.validateCoupon(couponCode, this.subtotal)
      this.appliedCoupon = coupon
      return coupon
    } catch (error) {
      throw new Error('优惠券无效或已过期')
    }
  }

  @Action()
  removeCoupon() {
    this.appliedCoupon = null
  }

  @AsyncAction()
  async loadUserCart(userId: string) {
    try {
      const cartData = await cartApi.getUserCart(userId)
      this.items = cartData.items
      this.appliedCoupon = cartData.coupon
      this.calculateShippingAndTax()
    } catch (error) {
      console.error('加载购物车失败:', error)
    }
  }

  @AsyncAction()
  async syncToServer() {
    const authStore = new AuthStore('auth')
    if (!authStore.isLoggedIn) return

    try {
      await cartApi.syncCart(authStore.currentUser!.id, {
        items: this.items,
        coupon: this.appliedCoupon,
      })
    } catch (error) {
      console.error('同步购物车失败:', error)
    }
  }

  private calculateShippingAndTax() {
    // 计算运费
    if (this.subtotal >= 99) {
      this.shippingFee = 0 // 满99免运费
    } else {
      this.shippingFee = 10
    }

    // 计算税费
    this.tax = this.subtotal * 0.1 // 10% 税率
  }

  @Getter()
  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  @Getter()
  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get discountAmount() {
    if (!this.appliedCoupon) return 0

    let discount = 0
    if (this.appliedCoupon.type === 'percentage') {
      discount = this.subtotal * (this.appliedCoupon.value / 100)
    } else {
      discount = this.appliedCoupon.value
    }

    // 应用最大折扣限制
    if (this.appliedCoupon.maxDiscount) {
      discount = Math.min(discount, this.appliedCoupon.maxDiscount)
    }

    return discount
  }

  @Getter()
  get total() {
    return Math.max(0, this.subtotal - this.discountAmount + this.shippingFee + this.tax)
  }

  @Getter()
  get isEmpty() {
    return this.items.length === 0
  }

  @Getter()
  get canApplyCoupon() {
    return this.subtotal > 0 && !this.appliedCoupon
  }
}
```

## 使用示例

### 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { AuthStore } from '@/stores/auth'
import { CartStore } from '@/stores/cart'
import { ProductStore } from '@/stores/product'

const authStore = new AuthStore('auth')
const productStore = new ProductStore('product')
const cartStore = new CartStore('cart')

onMounted(async () => {
  await productStore.fetchProducts()
  await productStore.fetchFeaturedProducts()

  if (authStore.isLoggedIn) {
    await cartStore.loadUserCart(authStore.currentUser!.id)
  }
})

function handleAddToCart(product: Product, quantity: number) {
  cartStore.addItem(product, quantity)

  // 如果用户已登录，同步到服务器
  if (authStore.isLoggedIn) {
    cartStore.syncToServer()
  }
}

async function handleCheckout() {
  if (!authStore.isLoggedIn) {
    // 跳转到登录页面
    router.push('/login')
    return
  }

  // 创建订单
  const orderStore = new OrderStore('order')
  await orderStore.createOrder(cartStore.items, cartStore.total)
}
</script>

<template>
  <div class="ecommerce-app">
    <!-- 商品列表 -->
    <ProductGrid
      :products="productStore.filteredProducts"
      :loading="productStore.loading"
      @add-to-cart="handleAddToCart"
    />

    <!-- 购物车 -->
    <ShoppingCart
      :items="cartStore.items"
      :total="cartStore.total"
      @update-quantity="cartStore.updateQuantity"
      @remove-item="cartStore.removeItem"
      @checkout="handleCheckout"
    />
  </div>
</template>
```

## 最佳实践

### 1. Store 间通信

```typescript
// 使用事件系统进行 Store 间通信
class StoreEventBus {
  private events = new Map<string, Function[]>()

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event) || []
    callbacks.forEach(callback => callback(data))
  }
}

export const storeEventBus = new StoreEventBus()

// 在 Store 中使用
export class CartStore extends BaseStore {
  @Action()
  addItem(product: Product, quantity: number) {
    // ... 添加商品逻辑

    // 触发事件
    storeEventBus.emit('cart:item-added', { product, quantity })
  }
}

export class InventoryStore extends BaseStore {
  constructor(id: string) {
    super(id)

    // 监听购物车事件
    storeEventBus.on('cart:item-added', this.handleCartItemAdded.bind(this))
  }

  private handleCartItemAdded({ product, quantity }: any) {
    // 更新库存
    this.updateStock(product.id, -quantity)
  }
}
```

### 2. 错误处理和重试机制

```typescript
export class ApiStore extends BaseStore {
  @AsyncAction()
  async fetchWithRetry<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall()
      } catch (error) {
        lastError = error as Error

        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * 2 ** i))
        }
      }
    }

    throw lastError!
  }
}
```

### 3. 性能优化

```typescript
export class OptimizedProductStore extends BaseStore {
  // 使用虚拟滚动处理大量商品
  @State({ default: 0 })
  scrollTop: number = 0

  @State({ default: 50 })
  itemHeight: number = 50

  @State({ default: 600 })
  containerHeight: number = 600

  @Getter()
  get visibleProducts() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + 1,
      this.products.length
    )

    return this.products.slice(startIndex, endIndex)
  }

  // 使用防抖优化搜索
  @DebouncedAction(300)
  async searchProducts(query: string) {
    // 搜索逻辑
  }

  // 使用缓存优化数据获取
  @CachedAction(300000)
  async fetchProductDetails(id: string) {
    // 获取商品详情
  }
}
```

## 总结

这个电商系统示例展示了：

1. **模块化设计**：将复杂业务拆分为多个专门的 Store
2. **数据持久化**：关键数据的本地存储和服务器同步
3. **性能优化**：缓存、防抖、虚拟滚动等优化策略
4. **错误处理**：完善的错误处理和重试机制
5. **类型安全**：完整的 TypeScript 类型定义

通过这种架构，你可以构建出可维护、高性能的大型电商应用。
