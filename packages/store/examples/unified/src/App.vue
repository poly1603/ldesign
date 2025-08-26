<script setup lang="ts">
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <h1>@ldesign/store</h1>
            <span class="brand-subtitle">统一示例</span>
          </router-link>
        </div>

        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/basic" class="nav-link">基础示例</router-link>
          <router-link to="/decorators" class="nav-link">装饰器</router-link>
          <router-link to="/functional" class="nav-link">函数式</router-link>
          <router-link to="/composition" class="nav-link">组合式</router-link>
          <router-link to="/performance" class="nav-link">性能优化</router-link>
          <router-link to="/persistence" class="nav-link">持久化</router-link>
          <router-link to="/enterprise" class="nav-link">企业级</router-link>
          <router-link to="/realtime" class="nav-link">实时同步</router-link>
        </div>

        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span />
          <span />
          <span />
        </button>
      </div>

      <!-- 移动端菜单 -->
      <div class="mobile-menu" :class="{ active: mobileMenuOpen }">
        <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">首页</router-link>
        <router-link to="/basic" class="mobile-nav-link" @click="closeMobileMenu">基础示例</router-link>
        <router-link to="/decorators" class="mobile-nav-link" @click="closeMobileMenu">装饰器</router-link>
        <router-link to="/functional" class="mobile-nav-link" @click="closeMobileMenu">函数式</router-link>
        <router-link to="/composition" class="mobile-nav-link" @click="closeMobileMenu">组合式</router-link>
        <router-link to="/performance" class="mobile-nav-link" @click="closeMobileMenu">性能优化</router-link>
        <router-link to="/persistence" class="mobile-nav-link" @click="closeMobileMenu">持久化</router-link>
        <router-link to="/enterprise" class="mobile-nav-link" @click="closeMobileMenu">企业级</router-link>
        <router-link to="/realtime" class="mobile-nav-link" @click="closeMobileMenu">实时同步</router-link>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 LDesign Team. 基于 MIT 许可发布。</p>
        <div class="footer-links">
          <a href="https://github.com/ldesign/store" target="_blank" rel="noopener">GitHub</a>
          <a href="https://ldesign.github.io/store" target="_blank" rel="noopener">文档</a>
          <a href="https://npmjs.com/package/@ldesign/store" target="_blank" rel="noopener">NPM</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 70px;
}

.nav-brand .brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.brand-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-btn span {
  width: 20px;
  height: 2px;
  background: white;
  transition: all 0.3s ease;
}

.mobile-menu {
  display: none;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-menu.active {
  display: block;
}

.mobile-nav-link {
  display: block;
  color: white;
  text-decoration: none;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: opacity 0.3s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  opacity: 0.8;
}

.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer {
  background: #2d3748;
  color: #a0aec0;
  padding: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-content p {
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: #63b3ed;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-links {
    gap: 0.25rem;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-links {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .main-content {
    padding: 1rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
