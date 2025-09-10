<template>
  <div class="app">
    <header class="app-header">
      <h1>LDesign Editor</h1>
      <p>功能完整的企业级富文本编辑器</p>
    </header>

    <nav class="app-nav">
      <router-link 
        v-for="route in routes" 
        :key="route.path"
        :to="route.path"
        class="nav-link"
        :class="{ active: $route.path === route.path }"
      >
        <span class="nav-icon">{{ route.icon }}</span>
        <span class="nav-text">{{ route.name }}</span>
      </router-link>
    </nav>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
      <p>LDesign Editor - 企业级富文本编辑器解决方案</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const $route = useRoute()

const routes = [
  { path: '/', name: '统一编辑器', icon: '🏠' },
  { path: '/performance', name: '性能测试', icon: '📊' },
  { path: '/advanced', name: '高级演示', icon: '🔬' }
]
</script>

<style scoped lang="less">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, var(--ldesign-brand-color-7), var(--ldesign-brand-color-5));
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: var(--ldesign-shadow-2);

  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }
}

.app-nav {
  background: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  padding: 1rem 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  box-shadow: var(--ldesign-shadow-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--ldesign-text-color-primary);
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: var(--ldesign-bg-color-container-hover);
    border-color: var(--ldesign-border-level-2-color);
  }

  &.active {
    background: var(--ldesign-brand-color);
    color: white;
    border-color: var(--ldesign-brand-color);
  }
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  font-weight: 500;
}

.app-main {
  flex: 1;
  padding: 2rem;
  background: var(--ldesign-bg-color-page);
}

.app-footer {
  background: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-level-1-color);
  padding: 1rem 2rem;
  text-align: center;
  color: var(--ldesign-text-color-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .app-header {
    padding: 1.5rem 1rem;

    h1 {
      font-size: 2rem;
    }
  }

  .app-nav {
    padding: 1rem;
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .app-main {
    padding: 1rem;
  }

  .app-footer {
    padding: 1rem;
  }
}
</style>
