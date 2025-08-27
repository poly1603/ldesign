<script setup lang="ts">
import { RouterLink } from '@ldesign/router'
</script>

<template>
  <div class="not-found">
    <div class="error-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在。</p>
      <RouterLink to="/" class="btn">
        返回首页
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  text-align: center;
}

.error-content h1 {
  font-size: 4rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.error-content h2 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.error-content p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.btn:hover {
  background: #2563eb;
}
</style>
