<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()
const cartCount = computed(() => 3)
const totalAmount = computed(() => 299.99)
</script>

<template>
  <div class="shop-module">
    <div class="module-header">
      <h2>🛍️ 商店模块</h2>
      <p>这是商店模块的主页面，包含商品浏览、购物车和结账功能。</p>
    </div>

    <nav class="module-nav">
      <RouterLink to="/nested/shop/products" class="nav-link">
        📦 商品列表
      </RouterLink>
      <RouterLink to="/nested/shop/cart" class="nav-link">
        🛒 购物车 <span class="cart-count">({{ cartCount }})</span>
      </RouterLink>
      <RouterLink to="/nested/shop/checkout" class="nav-link">
        💳 结账
      </RouterLink>
    </nav>

    <div class="module-content">
      <RouterView />
    </div>

    <div class="module-info">
      <h3>商店信息</h3>
      <p>当前路由: {{ route.path }}</p>
      <p>购物车商品: {{ cartCount }} 件</p>
      <p>总金额: ¥{{ totalAmount }}</p>
    </div>
  </div>
</template>

<style scoped>
.shop-module {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.module-header {
  text-align: center;
  margin-bottom: 2rem;
}

.module-header h2 {
  color: #059669;
  margin-bottom: 0.5rem;
}

.module-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.nav-link {
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  background: #e5e7eb;
}

.nav-link.router-link-active {
  background: #059669;
  color: white;
}

.cart-count {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  margin-left: 0.5rem;
}

.module-content {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  min-height: 200px;
}

.module-info {
  background: #f0fdf4;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #059669;
}

.module-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.module-info p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
