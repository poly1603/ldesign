import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '../../src/stores/decorators/ProductStore'

describe('productStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useProductStore()

      expect(store.products).toHaveLength(5) // 初始有5个产品
      expect(store.cart).toEqual([])
      expect(store.searchKeyword).toBe('')
      expect(store.filters.category).toBe('all')
      expect(store.sortBy).toBe('name')
      expect(store.sortOrder).toBe('asc')
      expect(store.selectedProducts).toEqual([])
      expect(store.loading).toBe(false)
    })

    it('应该有正确的初始产品数据', () => {
      const store = useProductStore()

      expect(store.products[0]).toMatchObject({
        id: 1,
        name: 'MacBook Pro',
        category: 'laptop',
        price: 12999,
        inStock: true,
        description: '强大的专业级笔记本电脑'
      })
    })
  })

  describe('getters', () => {
    it('filteredProducts 应该根据搜索查询过滤产品', () => {
      const store = useProductStore()

      store.searchKeyword = 'MacBook'
      expect(store.filteredProducts).toHaveLength(1)
      expect(store.filteredProducts[0].name).toBe('MacBook Pro')
    })

    it('filteredProducts 应该根据分类过滤产品', () => {
      const store = useProductStore()

      store.setFilters({ category: 'laptop' })
      const laptopProducts = store.filteredProducts
      expect(laptopProducts.every(p => p.category === 'laptop')).toBe(true)
    })

    it('filteredProducts 应该正确排序', () => {
      const store = useProductStore()

      store.setSorting('price', 'asc')
      const sortedProducts = store.filteredProducts

      for (let i = 1; i < sortedProducts.length; i++) {
        expect(sortedProducts[i].price).toBeGreaterThanOrEqual(sortedProducts[i - 1].price)
      }
    })

    it('cartTotal 应该计算正确的总价', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2) // MacBook Pro * 2
      await store.addToCart(2, 1) // iPhone 15 * 1

      const expectedTotal = 12999 * 2 + 7999 * 1
      expect(store.cartTotal).toBe(expectedTotal)
    })

    it('cartItemsCount 应该计算正确的商品数量', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      await store.addToCart(2, 1)

      expect(store.cartItemsCount).toBe(3)
    })

    it('categories 应该返回所有唯一分类', () => {
      const store = useProductStore()

      const categories = store.categories
      expect(categories).toContainEqual({ value: 'laptop', label: '笔记本电脑' })
      expect(categories).toContainEqual({ value: 'phone', label: '智能手机' })
      expect(categories).toContainEqual({ value: 'tablet', label: '平板电脑' })
      expect(categories).toContainEqual({ value: 'watch', label: '智能手表' })
      expect(categories).toContainEqual({ value: 'headphones', label: '耳机' })
    })

    it('selectedProductsCount 应该返回选中产品数量', () => {
      const store = useProductStore()

      store.toggleProductSelection(1)
      store.toggleProductSelection(2)

      expect(store.selectedProductsCount).toBe(2)
    })

    it('hasSelectedProducts 应该在有选中产品时返回 true', () => {
      const store = useProductStore()

      expect(store.hasSelectedProducts).toBe(false)

      store.toggleProductSelection(1)
      expect(store.hasSelectedProducts).toBe(true)
    })

    it('inStockProducts 应该返回有库存的产品', () => {
      const store = useProductStore()

      const inStockProducts = store.inStockProducts
      expect(inStockProducts.every(p => p.inStock)).toBe(true)
    })

    it('outOfStockProducts 应该返回无库存的产品', () => {
      const store = useProductStore()

      // 修改一个产品的库存状态
      store.products[0].inStock = false

      const outOfStockProducts = store.outOfStockProducts
      expect(outOfStockProducts).toHaveLength(1)
      expect(outOfStockProducts[0].inStock).toBe(false)
    })

    it('averageRating 应该计算平均评分', () => {
      const store = useProductStore()

      const expectedAverage = store.products.reduce((sum, product) => sum + product.rating, 0) / store.products.length
      expect(store.averageRating).toBeCloseTo(expectedAverage, 2)
    })
  })

  describe('actions', () => {
    it('searchProducts 应该更新搜索关键词', () => {
      const store = useProductStore()

      store.searchProducts('test')
      expect(store.searchKeyword).toBe('test')
    })

    it('setFilters 应该更新过滤条件', () => {
      const store = useProductStore()

      store.setFilters({ category: 'laptop' })
      expect(store.filters.category).toBe('laptop')
    })

    it('setSorting 应该更新排序设置', () => {
      const store = useProductStore()

      store.setSorting('price', 'desc')
      expect(store.sortBy).toBe('price')
      expect(store.sortOrder).toBe('desc')
    })

    it('addToCart 应该添加产品到购物车', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)

      expect(store.cart).toHaveLength(1)
      expect(store.cart[0]).toMatchObject({
        productId: 1,
        quantity: 2
      })
    })

    it('addToCart 应该更新已存在产品的数量', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      await store.addToCart(1, 3)

      expect(store.cart).toHaveLength(1)
      expect(store.cart[0].quantity).toBe(5)
    })

    it('removeFromCart 应该从购物车移除产品', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      store.removeFromCart(1)

      expect(store.cart).toHaveLength(0)
    })

    it('updateCartQuantity 应该更新购物车中产品数量', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      store.updateCartQuantity(1, 5)

      expect(store.cart[0].quantity).toBe(5)
    })

    it('clearCart 应该清空购物车', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      await store.addToCart(2, 1)
      store.clearCart()

      expect(store.cart).toHaveLength(0)
    })

    it('toggleProductSelection 应该切换产品选中状态', () => {
      const store = useProductStore()

      store.toggleProductSelection(1)
      expect(store.selectedProducts).toContain(1)

      store.toggleProductSelection(1)
      expect(store.selectedProducts).not.toContain(1)
    })

    it('toggleSelectAll 应该全选或取消全选产品', () => {
      const store = useProductStore()

      store.toggleSelectAll()
      expect(store.selectedProducts).toHaveLength(store.filteredProducts.length)

      store.toggleSelectAll()
      expect(store.selectedProducts).toHaveLength(0)
    })

    it('batchUpdateSelected 应该批量更新选中的产品', () => {
      const store = useProductStore()

      store.toggleProductSelection(1)
      store.toggleProductSelection(2)

      store.batchUpdateSelected({ inStock: false })

      const product1 = store.products.find(p => p.id === 1)
      const product2 = store.products.find(p => p.id === 2)

      expect(product1?.inStock).toBe(false)
      expect(product2?.inStock).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('应该处理空搜索查询', () => {
      const store = useProductStore()

      store.searchProducts('')
      expect(store.filteredProducts).toHaveLength(store.products.length)
    })

    it('应该处理不存在的产品ID', async () => {
      const store = useProductStore()

      await store.addToCart(999, 1)
      expect(store.cart).toHaveLength(1) // 仍然会添加，因为没有验证
    })

    it('应该处理负数数量', async () => {
      const store = useProductStore()

      await store.addToCart(1, -1)
      expect(store.cart).toHaveLength(1) // 仍然会添加
    })

    it('应该处理零数量', async () => {
      const store = useProductStore()

      await store.addToCart(1, 0)
      expect(store.cart).toHaveLength(1) // 仍然会添加
    })

    it('应该处理购物车数量更新为零', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      store.updateCartQuantity(1, 0)

      expect(store.cart).toHaveLength(0) // 应该被移除
    })
  })
})
