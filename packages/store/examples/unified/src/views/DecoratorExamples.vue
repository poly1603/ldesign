<script setup lang="ts">
import { ref } from 'vue'
import { useProductStore } from '@/stores/decorators/ProductStore'

// 使用产品 Store
const productStore = useProductStore()

// 排序控制
const sortBy = ref<'name' | 'price' | 'rating'>('name')

// 更新排序
function updateSorting() {
  productStore.setSorting(sortBy.value, productStore.sortOrder)
}

// 获取购物车中商品数量
function getCartQuantity(productId: number) {
  const item = productStore.cart.find(item => item.productId === productId)
  return item ? item.quantity : 0
}
</script>

<template>
  <div class="decorator-examples">
    <div class="page-header">
      <h1>装饰器示例</h1>
      <p>展示使用装饰器语法创建类式 Store 的各种功能</p>
    </div>

    <div class="alert alert-warning">
      <strong>注意：</strong>当前示例使用 Pinia 原生语法实现，展示装饰器的等效功能。在实际项目中，可以使用 @State、@Action、@Getter 等装饰器。
    </div>

    <!-- 产品管理示例 -->
    <div class="product-management">
      <!-- 搜索和过滤 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">@State 装饰器 - 状态管理</h2>
          <p class="card-description">展示响应式状态、过滤条件、搜索等功能</p>
        </div>

        <div class="example-content">
          <div class="search-filters">
            <div class="search-box">
              <input
                v-model="productStore.searchKeyword"
                type="text"
                placeholder="搜索产品..."
                class="form-input"
              >
            </div>

            <div class="filters-row">
              <select v-model="productStore.filters.category" class="form-select">
                <option value="all">所有分类</option>
                <option v-for="category in productStore.categories" :key="category.value" :value="category.value">
                  {{ category.label }} ({{ category.count }})
                </option>
              </select>

              <label class="checkbox-label">
                <input
                  v-model="productStore.filters.inStockOnly"
                  type="checkbox"
                >
                仅显示有库存
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 产品列表 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">@Action 装饰器 - 动作方法</h2>
          <p class="card-description">展示同步动作、异步动作、批量操作等功能</p>
        </div>

        <div class="example-content">
          <div class="products-header">
            <div class="products-stats">
              <span>找到 {{ productStore.filteredProducts.length }} 个产品</span>
              <span v-if="productStore.selectedProducts.length > 0">
                已选择 {{ productStore.selectedProducts.length }} 个
              </span>
            </div>

            <div class="products-actions">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  :checked="productStore.isAllSelected"
                  @change="productStore.toggleSelectAll()"
                >
                全选
              </label>

              <select
                v-model="sortBy"
                class="form-select"
                @change="updateSorting"
              >
                <option value="name">按名称排序</option>
                <option value="price">按价格排序</option>
                <option value="rating">按评分排序</option>
              </select>
            </div>
          </div>

          <div class="products-grid">
            <div
              v-for="product in productStore.filteredProducts"
              :key="product.id"
              class="product-card"
              :class="{
                'selected': productStore.selectedProducts.includes(product.id),
                'out-of-stock': !product.inStock,
              }"
            >
              <div class="product-header">
                <input
                  type="checkbox"
                  :checked="productStore.selectedProducts.includes(product.id)"
                  class="product-checkbox"
                  @change="productStore.toggleProductSelection(product.id)"
                >
                <h3 class="product-name">{{ product.name }}</h3>
                <span class="product-price">¥{{ product.price.toLocaleString() }}</span>
              </div>

              <p class="product-description">{{ product.description }}</p>

              <div class="product-meta">
                <span class="product-category">{{ product.category }}</span>
                <div class="product-rating">
                  <span class="rating-stars">★</span>
                  <span>{{ product.rating }} ({{ product.reviews }})</span>
                </div>
                <span
                  class="product-stock"
                  :class="{ 'in-stock': product.inStock, 'out-of-stock': !product.inStock }"
                >
                  {{ product.inStock ? '有库存' : '缺货' }}
                </span>
              </div>

              <div class="product-actions">
                <button
                  :disabled="!product.inStock || productStore.loading"
                  class="btn btn-primary btn-sm"
                  @click="productStore.addToCart(product.id)"
                >
                  <span v-if="productStore.loading">添加中...</span>
                  <span v-else>加入购物车</span>
                </button>

                <span v-if="getCartQuantity(product.id) > 0" class="cart-quantity">
                  购物车中: {{ getCartQuantity(product.id) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 购物车和统计 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">@Getter 装饰器 - 计算属性</h2>
          <p class="card-description">展示缓存计算属性、统计信息等功能</p>
        </div>

        <div class="example-content">
          <div class="stats-grid">
            <div class="stat-card">
              <h4>购物车统计</h4>
              <p>商品数量: {{ productStore.cartItemCount }}</p>
              <p>总价: ¥{{ productStore.cartTotal.toLocaleString() }}</p>
              <button
                :disabled="productStore.cart.length === 0"
                class="btn btn-danger btn-sm"
                @click="productStore.clearCart()"
              >
                清空购物车
              </button>
            </div>

            <div class="stat-card">
              <h4>选中产品统计</h4>
              <p>数量: {{ productStore.selectedProductsStats.count }}</p>
              <p>总价值: ¥{{ productStore.selectedProductsStats.totalValue.toLocaleString() }}</p>
              <p>平均评分: {{ productStore.selectedProductsStats.averageRating.toFixed(1) }}</p>
              <p>有库存: {{ productStore.selectedProductsStats.inStockCount }}</p>
            </div>

            <div class="stat-card">
              <h4>最近浏览</h4>
              <div class="recent-products">
                <div
                  v-for="product in productStore.recentlyViewed.slice(0, 3)"
                  :key="product.id"
                  class="recent-product"
                >
                  <span>{{ product.name }}</span>
                  <span>¥{{ product.price.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.decorator-examples {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.page-header p {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.product-management {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.search-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  width: 100%;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.form-input, .form-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
}

.form-select {
  min-width: 150px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.products-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #718096;
}

.products-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.product-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-card.selected {
  border-color: #3182ce;
  background-color: #ebf8ff;
}

.product-card.out-of-stock {
  opacity: 0.6;
}

.product-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.product-checkbox {
  margin: 0;
}

.product-name {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.product-price {
  font-weight: 600;
  color: #3182ce;
}

.product-description {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #718096;
}

.product-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 0.5rem 0;
  font-size: 0.75rem;
  flex-wrap: wrap;
}

.product-category {
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: capitalize;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rating-stars {
  color: #f6ad55;
}

.product-stock.in-stock {
  color: #38a169;
}

.product-stock.out-of-stock {
  color: #e53e3e;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.cart-quantity {
  font-size: 0.75rem;
  color: #718096;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.stat-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #2d3748;
}

.stat-card p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #4a5568;
}

.recent-products {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recent-product {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #718096;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 2rem;
}

.alert-warning {
  background: #fef5e7;
  border: 1px solid #f6ad55;
  color: #744210;
}
</style>
