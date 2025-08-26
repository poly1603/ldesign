<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from '@ldesign/router'
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pageTitle = computed(() => {
  return route.value?.meta?.title || '用户中心'
})

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="user-layout">
    <div class="user-container">
      <aside class="user-sidebar">
        <div class="user-profile">
          <div class="avatar">
            <img :src="userStore.user?.avatar || '/default-avatar.png'" :alt="userStore.user?.name">
          </div>
          <div class="user-info">
            <h3>{{ userStore.user?.name }}</h3>
            <p>{{ userStore.user?.email }}</p>
          </div>
        </div>

        <nav class="user-nav">
          <RouterLink to="/user/profile" class="nav-item" active-class="active">
            <span class="nav-icon">👤</span>
            <span class="nav-text">个人资料</span>
          </RouterLink>
          <RouterLink to="/user/settings" class="nav-item" active-class="active">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">账户设置</span>
          </RouterLink>
        </nav>
      </aside>

      <main class="user-main">
        <header class="user-header">
          <h1>{{ pageTitle }}</h1>
          <button class="btn btn-secondary" @click="goBack">
            返回首页
          </button>
        </header>

        <div class="user-content">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.user-layout {
  min-height: 100vh;
  background: #f9fafb;
}

.user-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

.user-sidebar {
  width: 300px;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  flex-shrink: 0;
}

.user-profile {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.user-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.user-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.nav-item.active {
  background: #eff6ff;
  color: #3b82f6;
  border-right: 3px solid #3b82f6;
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-text {
  font-weight: 500;
}

.user-main {
  flex: 1;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-header {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.user-content {
  padding: 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-container {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .user-sidebar {
    width: 100%;
  }

  .user-nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
  }

  .nav-item {
    flex-shrink: 0;
    padding: 0.5rem 1rem;
  }

  .user-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
