<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from '@ldesign/router'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()

// 根据路由获取过渡动画名称
function getTransitionName(currentRoute: any) {
  if (currentRoute.meta?.transition) {
    return currentRoute.meta.transition
  }
  return 'fade'
}

// 登录
function login() {
  userStore.login({
    username: 'admin',
    password: 'password',
  })
}

// 退出登录
function logout() {
  userStore.logout()
}
</script>

<template>
  <div id="app" class="app">
    <header class="app-header">
      <nav class="main-nav">
        <div class="nav-brand">
          <h1>@ldesign/router 高级示例</h1>
        </div>
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">
            首页
          </RouterLink>
          <RouterLink to="/dashboard" class="nav-link">
            仪表板
          </RouterLink>
          <RouterLink to="/admin" class="nav-link">
            管理后台
          </RouterLink>
          <RouterLink to="/user/profile" class="nav-link">
            用户中心
          </RouterLink>
        </div>
        <div class="nav-actions">
          <button v-if="!userStore.isAuthenticated" class="btn btn-primary" @click="login">
            登录
          </button>
          <div v-else class="user-menu">
            <span class="user-name">{{ userStore.user?.name }}</span>
            <button class="btn btn-secondary" @click="logout">
              退出
            </button>
          </div>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <Suspense>
        <template #default>
          <RouterView v-slot="{ Component, route: currentRoute }">
            <Transition :name="getTransitionName(currentRoute)" mode="out-in">
              <component :is="Component" :key="currentRoute.path" />
            </Transition>
          </RouterView>
        </template>
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner" />
            <p>加载中...</p>
          </div>
        </template>
      </Suspense>
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 @ldesign/router 高级示例</p>
        <div class="footer-info">
          <span>当前路由: {{ route?.path }}</span>
          <span>用户状态: {{ userStore.isAuthenticated ? '已登录' : '未登录' }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.main-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #3b82f6;
  background: #eff6ff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
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

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.app-footer {
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
  color: #6b7280;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
