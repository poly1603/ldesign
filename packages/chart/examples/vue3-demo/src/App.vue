<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <h1 class="title">@ldesign/chart Vue 3 示例</h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/components" class="nav-link">组件示例</router-link>
          <router-link to="/composables" class="nav-link">Composables</router-link>
          <router-link to="/advanced" class="nav-link">高级功能</router-link>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>

    <!-- 底部信息 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 @ldesign/chart Vue 3 示例项目</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 这里不需要任何功能代码，只是展示组件的使用
</script>

<style scoped>
.header {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  padding: 1rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  display: inline-block;
  margin-right: 2rem;
}

.nav {
  display: inline-block;
}

.nav-link {
  margin-right: 1.5rem;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #409eff;
}

.main {
  min-height: calc(100vh - 120px);
  padding: 2rem 0;
}

.footer {
  background: #f5f5f5;
  padding: 1rem 0;
  text-align: center;
  color: #666;
}
</style>
