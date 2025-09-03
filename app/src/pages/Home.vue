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
  padding: var(--ls-spacing-xl);
  transition: all 0.3s ease;
}

.home-header {
  text-align: center;
  margin-bottom: var(--ls-spacing-3xl);
}

.home-header h1 {
  font-size: var(--ls-font-size-3xl);
  margin-bottom: var(--ls-spacing-lg);
  font-weight: var(--ls-font-weight-bold);
}

.subtitle {
  font-size: var(--ls-font-size-lg);
  opacity: 0.9;
}

.home-content {
  max-width: var(--ls-container-max-width);
  margin: 0 auto;
}

.feature-section {
  margin-bottom: var(--ls-spacing-3xl);
}

.feature-section h2 {
  text-align: center;
  margin-bottom: var(--ls-spacing-xl);
  font-size: var(--ls-font-size-2xl);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--ls-grid-min-width), 1fr));
  gap: var(--ls-spacing-xl);
  margin-bottom: var(--ls-spacing-3xl);
}

.feature-card {
  background: var(--color-bg-secondary);
  border: var(--ls-border-width) solid var(--color-border);
  padding: var(--ls-spacing-xl);
  border-radius: var(--ls-border-radius-lg);
  text-align: center;
  box-shadow: var(--ls-shadow-sm);
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
  height: var(--ls-border-accent-height);
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(var(--ls-transform-hover-y-lg));
  box-shadow: var(--ls-shadow-lg);
  border-color: var(--color-primary-light);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  font-size: var(--ls-font-size-3xl);
  margin-bottom: var(--ls-spacing-lg);
}

.feature-card h3 {
  margin-bottom: var(--ls-spacing-lg);
  font-size: var(--ls-font-size-xl);
}

.navigation-section {
  margin-bottom: var(--ls-spacing-3xl);
  text-align: center;
}

.navigation-section h2 {
  margin-bottom: var(--ls-spacing-xl);
  font-size: var(--ls-font-size-2xl);
}

.nav-buttons {
  display: flex;
  gap: var(--ls-spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.nav-button {
  padding: var(--ls-spacing-lg) var(--ls-spacing-xl);
  border: none;
  border-radius: var(--ls-border-radius);
  font-size: var(--ls-font-size-lg);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.nav-button.primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-bg);
  border: var(--ls-border-width-thick) solid transparent;
  font-weight: var(--ls-font-weight-semibold);
}

.nav-button.secondary {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  border: var(--ls-border-width-thick) solid var(--color-primary-light);
}

.nav-button:hover {
  transform: translateY(var(--ls-transform-hover-y));
  box-shadow: var(--ls-shadow-lg);
}

.nav-button.primary:hover {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-darker) 100%);
  box-shadow: var(--ls-shadow-lg);
}

.nav-button.secondary:hover {
  background: var(--color-primary-lighter);
  color: var(--color-primary-darker);
  border-color: var(--color-primary);
}

.info-section {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  border: var(--ls-border-width) solid var(--color-border);
  padding: var(--ls-spacing-xl);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ls-shadow-md);
  position: relative;
  overflow: hidden;
}

.info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--ls-border-accent-height-sm);
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}

.api-section {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  border: var(--ls-border-width) solid var(--color-border);
  padding: var(--ls-spacing-xl);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ls-shadow-md);
  margin-top: var(--ls-spacing-xl);
  position: relative;
  overflow: hidden;
}

.api-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--ls-border-accent-height-sm);
  background: linear-gradient(90deg, var(--color-success) 0%, var(--color-primary) 100%);
}

.api-section h2 {
  margin-bottom: var(--ls-spacing-lg);
  font-size: var(--ls-font-size-xl);
  color: var(--color-text);
}

.api-info p {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--color-text-secondary);
}

.info-section h2 {
  margin-bottom: var(--ls-spacing-lg);
  font-size: var(--ls-font-size-xl);
}

.route-info p {
  margin-bottom: var(--ls-spacing-sm);
  font-family: 'Courier New', monospace;
}

.route-info strong {
  color: var(--color-primary);
  font-weight: var(--ls-font-weight-semibold);
}

@media (max-width: var(--ls-breakpoint-md)) {
  .home-header h1 {
    font-size: var(--ls-font-size-2xl);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .nav-buttons {
    flex-direction: column;
    align-items: center;
  }

  .nav-button {
    width: var(--ls-button-width-mobile);
  }
}
</style>
