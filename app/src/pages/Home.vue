<template>
  <div class="home-page">
    <header class="home-header">
      <h1>{{ t('home.title') }}</h1>
      <p class="subtitle">{{ t('home.subtitle') }}</p>
    </header>

    <main class="home-content">
      <section class="feature-section">
        <h2>{{ t('home.features.title') }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>{{ t('home.features.router') }}</h3>
            <p>{{ t('demo.routerSystem') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>{{ t('home.features.template') }}</h3>
            <p>{{ t('demo.templateEngine') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔗</div>
            <h3>{{ t('home.features.color') }}</h3>
            <p>{{ t('demo.colorSystem') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>{{ t('home.features.i18n') }}</h3>
            <p>{{ t('demo.i18nSystem') }}</p>
          </div>
        </div>
      </section>

      <section class="navigation-section">
        <h2>{{ t('home.sections.engineApi') }}</h2>
        <div class="nav-buttons">
          <router-link to="/login" class="nav-button primary">
            {{ t('nav.login') }}
          </router-link>
          <router-link to="/theme-demo" class="nav-button primary">
            🎨 {{ t('app.theme') }}
          </router-link>
          <router-link to="/color-scales" class="nav-button primary">
            🌈 {{ t('demo.colorSystem') }}
          </router-link>
          <button @click="testNavigation" class="nav-button secondary">
            {{ t('home.buttons.tryDemo') }}
          </button>
        </div>
      </section>

      <section class="info-section">
        <h2>{{ t('home.sections.pluginSystem') }}</h2>
        <div class="route-info">
          <p><strong>{{ t('nav.home') }}:</strong> {{ route.path }}</p>
          <p><strong>{{ t('user.name') }}:</strong> {{ route.name }}</p>
          <p><strong>{{ t('common.info') }}:</strong> {{ JSON.stringify(route.params) }}</p>
          <p><strong>{{ t('common.search') }}:</strong> {{ JSON.stringify(route.query) }}</p>
          <p><strong>Meta:</strong> {{ JSON.stringify(route.meta) }}</p>
        </div>
      </section>

      <section class="api-section">
        <h2>{{ t('home.sections.typeScript') }}</h2>
        <div class="api-info">
          <p><strong>{{ t('home.sections.engineApi') }}:</strong> createAndMountApp</p>
          <p><strong>{{ t('demo.routerSystem') }}:</strong> createRouterEnginePlugin</p>
          <p><strong>{{ t('demo.i18nSystem') }}:</strong> createI18nEnginePlugin</p>
          <p><strong>{{ t('home.features.performance') }}:</strong> {{ t('demo.performanceMonitor') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { useI18n } from '@ldesign/i18n/vue'

/**
 * 首页组件
 * 展示 LDesign Demo 的基础功能和 @ldesign/router 集成
 */

// 获取路由信息
const route = useRoute()
const router = useRouter()

// 获取国际化功能
const { t } = useI18n()

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
