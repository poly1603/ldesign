import { defineStore } from 'pinia'

// 预定义的分类常量，确保对象引用一致
const CATEGORIES = [
  { value: 'laptop', label: '笔记本电脑' },
  { value: 'phone', label: '智能手机' },
  { value: 'tablet', label: '平板电脑' },
  { value: 'headphones', label: '耳机' },
  { value: 'watch', label: '智能手表' }
]

export interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
  description: string
  rating: number
  reviews: number
}

export interface ProductFilters {
  category: string
  priceRange: [number, number]
  inStockOnly: boolean
  minRating: number
}

/**
 * 产品管理 Store - 展示装饰器风格的功能
 *
 * 注意：由于当前使用 Pinia 原生语法，这里展示的是等效的功能实现
 * 在实际的装饰器版本中，会使用 @State、@Action、@Getter 等装饰器
 */
export const useProductStore = defineStore('product-decorator', {
  state: () => ({
    // 产品列表
    products: [
      {
        id: 1,
        name: 'MacBook Pro',
        price: 12999,
        category: 'laptop',
        inStock: true,
        description: '强大的专业级笔记本电脑',
        rating: 4.8,
        reviews: 1250
      },
      {
        id: 2,
        name: 'iPhone 15 Pro',
        price: 7999,
        category: 'phone',
        inStock: true,
        description: '最新的智能手机',
        rating: 4.9,
        reviews: 2100
      },
      {
        id: 3,
        name: 'iPad Air',
        price: 4399,
        category: 'tablet',
        inStock: true,
        description: '轻薄的平板电脑',
        rating: 4.7,
        reviews: 890
      },
      {
        id: 4,
        name: 'AirPods Pro',
        price: 1899,
        category: 'headphones',
        inStock: true,
        description: '主动降噪耳机',
        rating: 4.6,
        reviews: 3200
      },
      {
        id: 5,
        name: 'Apple Watch',
        price: 2999,
        category: 'watch',
        inStock: true,
        description: '智能手表',
        rating: 4.5,
        reviews: 1800
      }
    ] as Product[],

    // 过滤条件
    filters: {
      category: 'all',
      priceRange: [0, 20000] as [number, number],
      inStockOnly: false,
      minRating: 0
    } as ProductFilters,

    // 搜索关键词
    searchKeyword: '',

    // 排序方式
    sortBy: 'name' as 'name' | 'price' | 'rating',
    sortOrder: 'asc' as 'asc' | 'desc',

    // 选中的产品
    selectedProducts: [] as number[],

    // 购物车
    cart: [] as Array<{ productId: number; quantity: number }>,

    // UI 状态
    loading: false,
    error: null as string | null,

    // 统计信息
    viewHistory: [] as Array<{ productId: number; timestamp: number }>
  }),

  actions: {
    // 搜索产品 (模拟 @DebouncedAction)
    searchProducts(keyword: string) {
      this.searchKeyword = keyword
    },

    // 设置过滤条件
    setFilters(filters: Partial<ProductFilters>) {
      this.filters = { ...this.filters, ...filters }
    },

    // 设置排序
    setSorting(sortBy: 'name' | 'price' | 'rating', sortOrder: 'asc' | 'desc' = 'asc') {
      this.sortBy = sortBy
      this.sortOrder = sortOrder
    },

    // 切换产品选中状态
    toggleProductSelection(productId: number) {
      const index = this.selectedProducts.indexOf(productId)
      if (index > -1) {
        this.selectedProducts.splice(index, 1)
      } else {
        this.selectedProducts.push(productId)
      }
    },

    // 全选/取消全选
    toggleSelectAll() {
      if (this.selectedProducts.length === this.filteredProducts.length) {
        this.selectedProducts = []
      } else {
        this.selectedProducts = this.filteredProducts.map(p => p.id)
      }
    },

    // 添加到购物车 (模拟 @AsyncAction)
    async addToCart(productId: number, quantity: number = 1) {
      this.loading = true
      this.error = null

      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 500))

        const existingItem = this.cart.find(item => item.productId === productId)
        if (existingItem) {
          existingItem.quantity += quantity
        } else {
          this.cart.push({ productId, quantity })
        }

        // 记录浏览历史
        this.viewHistory.push({ productId, timestamp: Date.now() })
      } catch (error) {
        this.error = error instanceof Error ? error.message : '添加到购物车失败'
      } finally {
        this.loading = false
      }
    },

    // 从购物车移除
    removeFromCart(productId: number) {
      const index = this.cart.findIndex(item => item.productId === productId)
      if (index > -1) {
        this.cart.splice(index, 1)
      }
    },

    // 更新购物车数量
    updateCartQuantity(productId: number, quantity: number) {
      const item = this.cart.find(item => item.productId === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = quantity
        }
      }
    },

    // 清空购物车
    clearCart() {
      this.cart = []
    },

    // 批量操作选中的产品
    batchUpdateSelected(updates: Partial<Product>) {
      this.selectedProducts.forEach(productId => {
        const product = this.products.find(p => p.id === productId)
        if (product) {
          Object.assign(product, updates)
        }
      })
    },

    // 添加产品 (用于性能测试)
    addProduct(product: Product) {
      this.products.push(product)
    },

    // 更新产品 (用于性能测试)
    updateProduct(productId: number, updates: Partial<Product>) {
      const product = this.products.find(p => p.id === productId)
      if (product) {
        Object.assign(product, updates)
      }
    },

    // 删除产品 (用于性能测试)
    removeProduct(productId: number) {
      const index = this.products.findIndex(p => p.id === productId)
      if (index > -1) {
        this.products.splice(index, 1)
      }
    },

    // 过滤产品 (用于性能测试)
    filterProducts(filters: Partial<ProductFilters>) {
      this.setFilters(filters)
      return this.filteredProducts
    }
  },

  getters: {
    // 过滤后的产品列表 (模拟 @CachedGetter)
    filteredProducts: (state) => {
      let filtered = state.products

      // 按关键词搜索
      if (state.searchKeyword) {
        const keyword = state.searchKeyword.toLowerCase()
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(keyword) ||
          product.description.toLowerCase().includes(keyword)
        )
      }

      // 按分类过滤
      if (state.filters.category !== 'all') {
        filtered = filtered.filter(product => product.category === state.filters.category)
      }

      // 按价格范围过滤
      filtered = filtered.filter(product =>
        product.price >= state.filters.priceRange[0] &&
        product.price <= state.filters.priceRange[1]
      )

      // 按库存状态过滤
      if (state.filters.inStockOnly) {
        filtered = filtered.filter(product => product.inStock)
      }

      // 按评分过滤
      filtered = filtered.filter(product => product.rating >= state.filters.minRating)

      // 排序
      filtered.sort((a, b) => {
        let aValue = a[state.sortBy]
        let bValue = b[state.sortBy]

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = (bValue as string).toLowerCase()
        }

        if (state.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })

      return filtered
    },

    // 产品分类列表
    categories: (state) => {
      const existingCategories = [...new Set(state.products.map(p => p.category))]
      return CATEGORIES.filter(cat => existingCategories.includes(cat.value))
    },

    // 购物车总价
    cartTotal: (state) => {
      return state.cart.reduce((total, item) => {
        const product = state.products.find(p => p.id === item.productId)
        return total + (product ? product.price * item.quantity : 0)
      }, 0)
    },

    // 购物车商品数量
    cartItemsCount: (state) => {
      return state.cart.reduce((count, item) => count + item.quantity, 0)
    },

    // 购物车商品数量（别名）
    cartItemCount: (state) => {
      return state.cart.reduce((count, item) => count + item.quantity, 0)
    },

    // 选中产品数量
    selectedProductsCount: (state) => {
      return state.selectedProducts.length
    },

    // 是否有选中产品
    hasSelectedProducts: (state) => {
      return state.selectedProducts.length > 0
    },

    // 有库存的产品
    inStockProducts: (state) => {
      return state.products.filter(product => product.inStock)
    },

    // 无库存的产品
    outOfStockProducts: (state) => {
      return state.products.filter(product => !product.inStock)
    },

    // 平均评分
    averageRating: (state) => {
      if (state.products.length === 0) return 0
      const total = state.products.reduce((sum, product) => sum + product.rating, 0)
      return total / state.products.length
    },

    // 选中产品的统计信息
    selectedProductsStats: (state) => {
      const selected = state.products.filter(p => state.selectedProducts.includes(p.id))
      return {
        count: selected.length,
        totalValue: selected.reduce((sum, p) => sum + p.price, 0),
        averageRating: selected.length > 0
          ? selected.reduce((sum, p) => sum + p.rating, 0) / selected.length
          : 0,
        inStockCount: selected.filter(p => p.inStock).length
      }
    },

    // 是否全选
    isAllSelected: (state) => {
      const filteredIds = state.products
        .filter(product => {
          // 应用相同的过滤逻辑
          let filtered = true

          if (state.searchKeyword) {
            const keyword = state.searchKeyword.toLowerCase()
            filtered = filtered && (
              product.name.toLowerCase().includes(keyword) ||
              product.description.toLowerCase().includes(keyword)
            )
          }

          if (state.filters.category !== 'all') {
            filtered = filtered && product.category === state.filters.category
          }

          filtered = filtered &&
            product.price >= state.filters.priceRange[0] &&
            product.price <= state.filters.priceRange[1]

          if (state.filters.inStockOnly) {
            filtered = filtered && product.inStock
          }

          filtered = filtered && product.rating >= state.filters.minRating

          return filtered
        })
        .map(p => p.id)

      return filteredIds.length > 0 && filteredIds.every(id => state.selectedProducts.includes(id))
    },

    // 最近浏览的产品
    recentlyViewed: (state) => {
      const recent = state.viewHistory
        .slice(-10) // 最近10个
        .reverse()
        .map(item => state.products.find(p => p.id === item.productId))
        .filter(Boolean) as Product[]

      // 去重
      const unique = recent.filter((product, index, self) =>
        self.findIndex(p => p.id === product.id) === index
      )

      return unique
    }
  }
})
