import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '../../src/stores/decorators/ProductStore'

describe('productStore - 简化测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('基本功能', () => {
    it('应该有正确的初始状态', () => {
      const store = useProductStore()

      expect(store.products).toHaveLength(5)
      expect(store.cart).toEqual([])
      expect(store.searchKeyword).toBe('')
      expect(store.loading).toBe(false)
    })

    it('应该能够搜索产品', () => {
      const store = useProductStore()

      store.searchProducts('MacBook')
      expect(store.searchKeyword).toBe('MacBook')

      const filtered = store.filteredProducts
      expect(filtered.some(p => p.name.includes('MacBook'))).toBe(true)
    })

    it('应该能够设置过滤条件', () => {
      const store = useProductStore()

      store.setFilters({ category: 'laptop' })
      expect(store.filters.category).toBe('laptop')
    })

    it('应该能够设置排序', () => {
      const store = useProductStore()

      store.setSorting('price', 'desc')
      expect(store.sortBy).toBe('price')
      expect(store.sortOrder).toBe('desc')
    })

    it('应该能够添加产品到购物车', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)

      expect(store.cart).toHaveLength(1)
      expect(store.cart[0].productId).toBe(1)
      expect(store.cart[0].quantity).toBe(2)
    })

    it('应该能够计算购物车总价', async () => {
      const store = useProductStore()

      await store.addToCart(1, 1) // MacBook Pro

      const product = store.products.find(p => p.id === 1)
      expect(store.cartTotal).toBe(product?.price || 0)
    })

    it('应该能够选择产品', () => {
      const store = useProductStore()

      store.toggleProductSelection(1)
      expect(store.selectedProducts).toContain(1)

      store.toggleProductSelection(1)
      expect(store.selectedProducts).not.toContain(1)
    })

    it('应该能够全选产品', () => {
      const store = useProductStore()

      store.toggleSelectAll()
      expect(store.selectedProducts.length).toBeGreaterThan(0)

      store.toggleSelectAll()
      expect(store.selectedProducts).toHaveLength(0)
    })

    it('应该能够从购物车移除产品', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      expect(store.cart).toHaveLength(1)

      store.removeFromCart(1)
      expect(store.cart).toHaveLength(0)
    })

    it('应该能够更新购物车数量', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      store.updateCartQuantity(1, 5)

      expect(store.cart[0].quantity).toBe(5)
    })

    it('应该能够清空购物车', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      await store.addToCart(2, 1)

      store.clearCart()
      expect(store.cart).toHaveLength(0)
    })
  })

  describe('getters', () => {
    it('filteredProducts 应该正确过滤', () => {
      const store = useProductStore()

      const allProducts = store.filteredProducts
      expect(allProducts).toHaveLength(5)

      store.setFilters({ category: 'laptop' })
      const laptops = store.filteredProducts
      expect(laptops.every(p => p.category === 'laptop')).toBe(true)
    })

    it('categories 应该返回分类列表', () => {
      const store = useProductStore()

      const categories = store.categories
      expect(categories).toBeInstanceOf(Array)
      expect(categories.length).toBeGreaterThan(0)
      expect(categories[0]).toHaveProperty('value')
      expect(categories[0]).toHaveProperty('label')
    })

    it('cartItemCount 应该计算正确', async () => {
      const store = useProductStore()

      await store.addToCart(1, 2)
      await store.addToCart(2, 3)

      expect(store.cartItemCount).toBe(5)
    })

    it('selectedProductsStats 应该计算正确', () => {
      const store = useProductStore()

      store.toggleProductSelection(1)
      store.toggleProductSelection(2)

      expect(store.selectedProductsStats.count).toBe(2)
    })
  })
})
