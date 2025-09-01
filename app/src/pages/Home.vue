<template>
  <div class="home-page">
    <header class="home-header">
      <h1>欢迎使用 LDesign Demo</h1>
      <p class="subtitle">展示优化后的 Engine API 设计和功能</p>
    </header>
    
    <main class="home-content">
      <section class="feature-section">
        <h2>功能特性</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>高性能路由</h3>
            <p>基于 LDesign Engine 的高性能路由系统</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>设备适配</h3>
            <p>智能设备检测和适配功能</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔗</div>
            <h3>模板集成</h3>
            <p>与模板系统深度集成</p>
          </div>
        </div>
      </section>
      
      <section class="navigation-section">
        <h2>路由导航测试</h2>
        <div class="nav-buttons">
          <router-link to="/login" class="nav-button primary">
            前往登录页
          </router-link>
          <button @click="testNavigation" class="nav-button secondary">
            编程式导航测试
          </button>
        </div>
      </section>

      <section class="info-section">
        <h2>当前路由信息</h2>
        <div class="route-info">
          <p><strong>路径:</strong> {{ route.path }}</p>
          <p><strong>名称:</strong> {{ route.name }}</p>
          <p><strong>参数:</strong> {{ JSON.stringify(route.params) }}</p>
          <p><strong>查询:</strong> {{ JSON.stringify(route.query) }}</p>
          <p><strong>元信息:</strong> {{ JSON.stringify(route.meta) }}</p>
        </div>
      </section>

      <section class="api-section">
        <h2>LDesign Engine + Router 集成</h2>
        <div class="api-info">
          <p><strong>Engine API:</strong> createAndMountApp 一步到位</p>
          <p><strong>Router 集成:</strong> createRouterEnginePlugin</p>
          <p><strong>路由模式:</strong> Hash 模式</p>
          <p><strong>功能特性:</strong> 预加载、缓存、动画、性能监控</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'

/**
 * 首页组件
 * 展示 LDesign Demo 的基础功能和 @ldesign/router 集成
 */

// 获取路由信息
const route = useRoute()
const router = useRouter()

/**
 * 测试编程式导航
 */
const testNavigation = () => {
  console.log('🧭 使用编程式导航跳转到登录页')
  router.push({
    path: '/login',
    query: { from: 'home' }
  })
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.home-header {
  text-align: center;
  margin-bottom: 3rem;
}

.home-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-section {
  margin-bottom: 3rem;
}

.feature-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.navigation-section {
  margin-bottom: 3rem;
  text-align: center;
}

.navigation-section h2 {
  margin-bottom: 2rem;
  font-size: 2rem;
}

.nav-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.nav-button.primary {
  background: #fff;
  color: #667eea;
}

.nav-button.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.info-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.info-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.route-info p {
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
}

.route-info strong {
  color: #ffd700;
}

@media (max-width: 768px) {
  .home-header h1 {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-button {
    width: 200px;
  }
}
</style>
