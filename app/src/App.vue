<template>
  <div id="app">
    <!-- 应用头部导航 -->
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>LDesign Demo</h1>
        </div>
        <div class="nav-links">
          <router-link
            to="/"
            class="nav-link"
            active-class="active"
            exact-active-class="active"
          >
            首页
          </router-link>
          <router-link
            to="/login"
            class="nav-link"
            active-class="active"
          >
            登录
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 应用底部 -->
    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; 2024 LDesign Demo App - 展示优化后的 Engine + Router API</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * 应用根组件
 * 提供应用的基本布局和导航结构
 * 使用 @ldesign/router 的路由系统
 */

console.log('🎉 App.vue 组件已加载')
console.log('🚀 使用 @ldesign/router 路由系统')
console.log('🔧 展示优化后的 LDesign Engine + Router 集成')
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.app-nav {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-block;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background: #3498db;
  color: white;
}

/* 主内容区域 */
.app-main {
  flex: 1;
}

/* 底部样式 */
.app-footer {
  background: #34495e;
  color: white;
  padding: 1rem 0;
  text-align: center;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-container,
  .footer-container {
    padding: 0 1rem;
  }
}
</style>
