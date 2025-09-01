<script setup lang="ts">
// 简化的App组件，不包含任何业务逻辑
</script>

<template>
  <div id="app">
    <!-- 简化的导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>LDesign Template</h1>
        </div>

        <div class="nav-links">
          <router-link to="/component" class="nav-link">
            组件方式
          </router-link>
          <router-link to="/hook" class="nav-link">
            Hook 方式
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 简化的页脚 -->
    <footer class="footer">
      <div class="footer-container">
        <p>&copy; 2024 LDesign Template</p>
        <div class="footer-links">
          <a href="https://github.com/ldesign/template" target="_blank">GitHub</a>
          <a href="/docs" target="_blank">文档</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 使用简化设计系统的全局样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family-sans);
  color: var(--color-gray-700);
  background: var(--color-gray-50);
}

/* 简化的导航栏样式 */
.navbar {
  position: relative;
  z-index: 200; /* 确保导航栏在内容之上，但在模态框之下 */
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
}

.nav-brand h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
}

.nav-links {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-base);
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  font-size: var(--font-size-sm);
}

.nav-link:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border-color: var(--color-gray-200);
}

.nav-link.router-link-active {
  background: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
}

/* 简化的主要内容区域 */
.main-content {
  flex: 1;
  padding: var(--spacing-8) 0;
}

/* 简化的页脚样式 */
.footer {
  background: var(--color-gray-800);
  color: var(--color-white);
  padding: var(--spacing-6) 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.footer-links {
  display: flex;
  gap: var(--spacing-6);
}

.footer-links a {
  color: var(--color-gray-400);
  text-decoration: none;
  transition: color var(--transition-fast);
  font-size: var(--font-size-sm);
}

.footer-links a:hover {
  color: var(--color-white);
}

/* 简化的响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .nav-links {
    order: 2;
  }

  .device-indicator {
    order: 3;
  }

  .footer-container {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .main-content {
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-links {
    gap: 0.5rem;
  }
}
</style>
