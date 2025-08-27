<script setup lang="ts">
import { RouterLink, useRouter } from '@ldesign/router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <div class="not-found">
    <div class="error-content">
      <div class="error-icon">
        🔍
      </div>
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>

      <div class="error-actions">
        <RouterLink to="/" class="btn btn-primary">
          返回首页
        </RouterLink>
        <button class="btn btn-secondary" @click="goBack">
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.error-content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-content h1 {
  font-size: 6rem;
  margin: 0;
  color: #3b82f6;
  font-weight: 700;
}

.error-content h2 {
  font-size: 2rem;
  margin: 1rem 0;
  color: #1f2937;
}

.error-content p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>
