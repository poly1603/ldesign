<script setup lang="ts">
import { RouterLink, RouterView } from '@ldesign/router'
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>@ldesign/router 企业级示例</h1>
      <nav>
        <RouterLink to="/">
          首页
        </RouterLink>
        <RouterLink to="/dashboard">
          仪表板
        </RouterLink>
        <RouterLink to="/admin">
          管理后台
        </RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <p>&copy; 2024 企业级路由示例</p>
    </footer>
  </div>
</template>

<style scoped>
.app-header {
  background: #1f2937;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header nav {
  display: flex;
  gap: 2rem;
}

.app-header nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.app-header nav a:hover,
.app-header nav a.router-link-active {
  background: #374151;
}

.app-main {
  min-height: calc(100vh - 120px);
  padding: 2rem;
}

.app-footer {
  background: #f9fafb;
  padding: 1rem 2rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}
</style>
