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

<script setup lang="ts">
// 简化的App组件，不包含任何业务逻辑
</script>

<style scoped>
/* 简化的全局样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #f8f9fa;
}

/* 简化的导航栏样式 */
.navbar {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #6c757d;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #dee2e6;
}

.nav-link.router-link-active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* 简化的主要内容区域 */
.main-content {
  flex: 1;
  padding: 2rem 0;
}

/* 简化的页脚样式 */
.footer {
  background: #343a40;
  color: white;
  padding: 1.5rem 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: #adb5bd;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: white;
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
