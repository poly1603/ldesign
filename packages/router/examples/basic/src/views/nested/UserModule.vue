<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()
const userId = computed(() => Math.floor(Math.random() * 1000) + 1)
</script>

<template>
  <div class="user-module">
    <div class="module-header">
      <h2>👤 用户模块</h2>
      <p>这是用户模块的主页面，包含用户相关的所有功能。</p>
    </div>

    <nav class="module-nav">
      <RouterLink to="/nested/user/profile" class="nav-link">
        📋 个人资料
      </RouterLink>
      <RouterLink to="/nested/user/settings" class="nav-link">
        ⚙️ 用户设置
      </RouterLink>
      <RouterLink to="/nested/user/dashboard" class="nav-link">
        📊 用户仪表板
      </RouterLink>
    </nav>

    <div class="module-content">
      <RouterView />
    </div>

    <div class="module-info">
      <h3>模块信息</h3>
      <p>当前路由: {{ route.path }}</p>
      <p>用户ID: {{ userId }}</p>
    </div>
  </div>
</template>

<style scoped>
.user-module {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.module-header {
  text-align: center;
  margin-bottom: 2rem;
}

.module-header h2 {
  color: #2563eb;
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
}

.nav-link:hover {
  background: #e5e7eb;
}

.nav-link.router-link-active {
  background: #2563eb;
  color: white;
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
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #2563eb;
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
