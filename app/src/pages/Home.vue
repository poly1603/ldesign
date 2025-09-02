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
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>主题管理</h3>
            <p>智能主题选择和切换系统</p>
          </div>
        </div>
      </section>

      <section class="navigation-section">
        <h2>路由导航测试</h2>
        <div class="nav-buttons">
          <router-link to="/login" class="nav-button primary">
            前往登录页
          </router-link>
          <router-link to="/theme-demo" class="nav-button primary">
            🎨 主题演示
          </router-link>
          <router-link to="/color-scales" class="nav-button primary">
            🌈 色阶展示
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
  background: var(--color-bg);
  color: var(--color-text);
  padding: 2rem;
  transition: all 0.3s ease;
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
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px var(--color-shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px var(--color-shadow);
  border-color: var(--color-primary-light);
}

.feature-card:hover::before {
  opacity: 1;
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
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-bg);
  border: 2px solid transparent;
  font-weight: 600;
}

.nav-button.secondary {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  border: 2px solid var(--color-primary-light);
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--color-shadow);
}

.nav-button.primary:hover {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-darker) 100%);
  box-shadow: 0 8px 20px var(--ldesign-shadow-2, rgba(0, 0, 0, 0.3));
}

.nav-button.secondary:hover {
  background: var(--color-primary-lighter);
  color: var(--color-primary-darker);
  border-color: var(--color-primary);
}

.info-section {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  border: 1px solid var(--color-border);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--color-shadow);
  position: relative;
  overflow: hidden;
}

.info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}

.api-section {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  border: 1px solid var(--color-border);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--color-shadow);
  margin-top: 2rem;
  position: relative;
  overflow: hidden;
}

.api-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-success) 0%, var(--color-primary) 100%);
}

.api-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: var(--color-text);
}

.api-info p {
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
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
  color: var(--color-primary);
  font-weight: 600;
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
