<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { computed, onMounted, ref, watch } from 'vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const filters = ref({
  category: '',
  sort: 'name',
  order: 'asc',
})

const currentPage = ref(1)
const itemsPerPage = 6

// 模拟产品数据
const products = ref([
  { id: 1, name: 'Smartphone', category: 'electronics', price: 599, rating: 4, emoji: '📱', date: '2023-01-15' },
  { id: 2, name: 'Laptop', category: 'electronics', price: 1299, rating: 5, emoji: '💻', date: '2023-02-20' },
  { id: 3, name: 'T-Shirt', category: 'clothing', price: 29, rating: 3, emoji: '👕', date: '2023-03-10' },
  { id: 4, name: 'Jeans', category: 'clothing', price: 79, rating: 4, emoji: '👖', date: '2023-03-15' },
  { id: 5, name: 'Novel', category: 'books', price: 15, rating: 5, emoji: '📚', date: '2023-04-01' },
  { id: 6, name: 'Cookbook', category: 'books', price: 25, rating: 4, emoji: '📖', date: '2023-04-05' },
  { id: 7, name: 'Plant Pot', category: 'home', price: 35, rating: 4, emoji: '🪴', date: '2023-05-01' },
  { id: 8, name: 'Lamp', category: 'home', price: 89, rating: 3, emoji: '💡', date: '2023-05-10' },
  { id: 9, name: 'Headphones', category: 'electronics', price: 199, rating: 5, emoji: '🎧', date: '2023-06-01' },
  { id: 10, name: 'Sneakers', category: 'clothing', price: 129, rating: 4, emoji: '👟', date: '2023-06-15' },
  { id: 11, name: 'Tablet', category: 'electronics', price: 399, rating: 4, emoji: '📱', date: '2023-07-01' },
  { id: 12, name: 'Cushion', category: 'home', price: 45, rating: 3, emoji: '🛏️', date: '2023-07-10' },
])

// 计算属性
const filteredProducts = computed(() => {
  let result = [...products.value]

  // 按类别过滤
  if (filters.value.category) {
    result = result.filter(p => p.category === filters.value.category)
  }

  // 排序
  result.sort((a, b) => {
    let aVal, bVal

    switch (filters.value.sort) {
      case 'price':
        aVal = a.price
        bVal = b.price
        break
      case 'rating':
        aVal = a.rating
        bVal = b.rating
        break
      case 'date':
        aVal = new Date(a.date).getTime()
        bVal = new Date(b.date).getTime()
        break
      default:
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
    }

    if (filters.value.order === 'desc') {
      return aVal < bVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })

  // 分页
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return result.slice(start, end)
})

const totalPages = computed(() => {
  let result = [...products.value]

  if (filters.value.category) {
    result = result.filter(p => p.category === filters.value.category)
  }

  return Math.ceil(result.length / itemsPerPage)
})

// 方法
function updateFilters() {
  currentPage.value = 1

  const query: Record<string, string> = {}

  if (filters.value.category)
    query.category = filters.value.category
  if (filters.value.sort !== 'name')
    query.sort = filters.value.sort
  if (filters.value.order !== 'asc')
    query.order = filters.value.order
  if (currentPage.value !== 1)
    query.page = currentPage.value.toString()

  router.replace({ query })
}

function clearFilters() {
  filters.value = {
    category: '',
    sort: 'name',
    order: 'asc',
  }
  currentPage.value = 1
  router.replace({ query: {} })
}

function goToPage(page: number) {
  currentPage.value = page

  const query = { ...route.value.query }
  if (page === 1) {
    delete query.page
  }
  else {
    query.page = page.toString()
  }

  router.replace({ query })
}

function viewProduct(productId: number) {
  // 这里可以导航到产品详情页
  alert(`Viewing product ${productId}`)
}

function loadFromQuery() {
  const query = route.value.query

  if (query.category)
    filters.value.category = query.category as string
  if (query.sort)
    filters.value.sort = query.sort as string
  if (query.order)
    filters.value.order = query.order as string
  if (query.page)
    currentPage.value = Number.parseInt(query.page as string) || 1
}

// 生命周期
onMounted(() => {
  loadFromQuery()
})

// 监听路由变化
watch(() => route.value.query, () => {
  loadFromQuery()
})
</script>

<template>
  <div class="products">
    <h2>🛍️ Products</h2>
    <p>This page demonstrates query parameter handling and filtering.</p>

    <div class="filters">
      <h3>Filters:</h3>
      <div class="filter-group">
        <label>
          Category:
          <select v-model="filters.category" @change="updateFilters">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home & Garden</option>
          </select>
        </label>

        <label>
          Sort by:
          <select v-model="filters.sort" @change="updateFilters">
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="date">Date Added</option>
          </select>
        </label>

        <label>
          Order:
          <select v-model="filters.order" @change="updateFilters">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <button class="clear-button" @click="clearFilters">
          Clear Filters
        </button>
      </div>
    </div>

    <div class="products-grid">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        @click="viewProduct(product.id)"
      >
        <div class="product-image">
          {{ product.emoji }}
        </div>
        <div class="product-info">
          <h4>{{ product.name }}</h4>
          <p class="product-category">
            {{ product.category }}
          </p>
          <div class="product-price">
            ${{ product.price }}
          </div>
          <div class="product-rating">
            <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= product.rating }">★</span>
            <span class="rating-text">({{ product.rating }}/5)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button
        v-for="page in totalPages"
        :key="page"
        class="page-button" :class="[{ active: currentPage === page }]"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </div>

    <div class="query-info">
      <h3>Current Query Parameters:</h3>
      <pre>{{ JSON.stringify($route.query, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.products {
  max-width: 1200px;
  margin: 0 auto;
}

.filters {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: end;
}

.filter-group label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: bold;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 120px;
}

.clear-button {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-button:hover {
  background: #c82333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.product-card {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.product-image {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.product-category {
  color: #666;
  text-transform: capitalize;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.product-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.5rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.star {
  color: #ddd;
  font-size: 1.2rem;
}

.star.filled {
  color: #ffc107;
}

.rating-text {
  color: #666;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.page-button {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-button:hover {
  background: #f8f9fa;
}

.page-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.query-info {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.query-info pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 0.9rem;
}
</style>
