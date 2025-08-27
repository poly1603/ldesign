<template>
  <div class="not-found">
    <div class="error-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在。</p>
      
      <div class="actions">
        <button @click="goHome" class="btn-primary">返回首页</button>
        <button @click="goBack" class="btn-secondary">返回上页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const goHome = () => {
  window.location.href = '/'
}

const goBack = () => {
  window.history.back()
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-content h1 {
  font-size: 6rem;
  margin: 0;
  color: #dc3545;
  font-weight: bold;
}

.error-content h2 {
  font-size: 2rem;
  margin: 1rem 0;
  color: #495057;
}

.error-content p {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}
</style>
