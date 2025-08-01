<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

// 计算属性
const canGoBack = computed(() => window.history.length > 1)

const routeInfo = computed(() => ({
  path: route.value.path,
  name: route.value.name,
  params: route.value.params,
  query: route.value.query,
  hash: route.value.hash,
  fullPath: route.value.fullPath,
  meta: route.value.meta,
}))

// 方法
function goToAbout() {
  router.push('/about')
}

function goToUser() {
  router.push({ name: 'User', params: { id: '456' } })
}

function goToProducts() {
  router.push({
    path: '/products',
    query: { category: 'electronics', sort: 'price' },
  })
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="home">
    <h2>🏠 Welcome to LDesign Router</h2>
    <p>This is the home page demonstrating the basic functionality of @ldesign/router.</p>

    <div class="features">
      <h3>Features Demonstrated:</h3>
      <ul>
        <li>✅ Basic routing with RouterLink and RouterView</li>
        <li>✅ Dynamic route parameters</li>
        <li>✅ Query parameters and hash fragments</li>
        <li>✅ Navigation guards</li>
        <li>✅ Route transitions</li>
        <li>✅ Programmatic navigation</li>
        <li>✅ Scroll behavior</li>
      </ul>
    </div>

    <div class="actions">
      <h3>Try Navigation:</h3>
      <div class="button-group">
        <button @click="goToAbout">
          Go to About
        </button>
        <button @click="goToUser">
          Go to User Profile
        </button>
        <button @click="goToProducts">
          Go to Products
        </button>
        <button :disabled="!canGoBack" @click="goBack">
          Go Back
        </button>
      </div>
    </div>

    <div class="route-info">
      <h3>Current Route Information:</h3>
      <pre>{{ routeInfo }}</pre>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.button-group button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.button-group button:hover:not(:disabled) {
  background: #0056b3;
}

.button-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.route-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.route-info pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
