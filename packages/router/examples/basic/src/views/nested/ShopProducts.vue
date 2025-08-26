<script setup lang="ts">
import { reactive } from 'vue'

interface Product {
  id: number
  name: string
  description: string
  price: number
  emoji: string
}

const products = reactive<Product[]>([
  {
    id: 1,
    name: '智能手机',
    description: '最新款智能手机，功能强大',
    price: 2999,
    emoji: '📱',
  },
  {
    id: 2,
    name: '笔记本电脑',
    description: '轻薄便携，性能卓越',
    price: 5999,
    emoji: '💻',
  },
  {
    id: 3,
    name: '无线耳机',
    description: '高品质音效，舒适佩戴',
    price: 299,
    emoji: '🎧',
  },
  {
    id: 4,
    name: '智能手表',
    description: '健康监测，时尚设计',
    price: 1299,
    emoji: '⌚',
  },
  {
    id: 5,
    name: '平板电脑',
    description: '大屏体验，创作利器',
    price: 3999,
    emoji: '📱',
  },
  {
    id: 6,
    name: '游戏手柄',
    description: '精准操控，游戏必备',
    price: 199,
    emoji: '🎮',
  },
])

function addToCart(_product: Product) {
  // 模拟加入购物车操作
}
</script>

<template>
  <div class="shop-products">
    <h3>📦 商品列表</h3>
    <p>浏览我们精选的商品，找到您喜欢的产品。</p>

    <div class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image">
          {{ product.emoji }}
        </div>
        <div class="product-info">
          <h4>{{ product.name }}</h4>
          <p class="product-description">
            {{ product.description }}
          </p>
          <div class="product-price">
            ¥{{ product.price }}
          </div>
          <button class="add-to-cart-btn" @click="addToCart(product)">
            加入购物车
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-products h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.product-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-image {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.product-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 1rem;
}

.add-to-cart-btn {
  width: 100%;
  background: #059669;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-to-cart-btn:hover {
  background: #047857;
}
</style>
