<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-pattern"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-text">✨ LDesign v1.0</span>
        </div>
        <h1 class="hero-title">{{ t('home.title') }}</h1>
        <p class="hero-subtitle">{{ t('home.subtitle') }}</p>
        <div class="hero-actions">
          <router-link to="/color-scales" class="btn btn-primary btn-large">
            <span class="btn-icon">🌈</span>
            {{ t('home.buttons.getStarted') }}
          </router-link>
          <router-link to="/cache-demo" class="btn btn-secondary btn-large">
            <span class="btn-icon">💾</span>
            {{ t('home.buttons.viewDocs') }}
          </router-link>
        </div>
      </div>
    </section>

    <main class="home-content">
      <!-- 核心特性区域 -->
      <section class="features-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.features.title') }}</h2>
          <p class="section-subtitle">{{ t('home.descriptions.powerfulFeatures') }}</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" data-feature="router">
            <div class="feature-header">
              <div class="feature-icon">🚀</div>
              <h3>{{ t('home.features.router') }}</h3>
            </div>
            <p class="feature-description">{{ t('demo.routerSystem') }}</p>
            <div class="feature-footer">
              <router-link to="/login" class="feature-link">
                {{ t('home.buttons.experienceRouter') }}
              </router-link>
            </div>
          </div>
          <div class="feature-card" data-feature="template">
            <div class="feature-header">
              <div class="feature-icon">📱</div>
              <h3>{{ t('home.features.template') }}</h3>
            </div>
            <p class="feature-description">{{ t('demo.templateEngine') }}</p>
            <div class="feature-footer">
              <span class="feature-link">{{ t('home.buttons.templateEngine') }}</span>
            </div>
          </div>
          <div class="feature-card" data-feature="color">
            <div class="feature-header">
              <div class="feature-icon">🎨</div>
              <h3>{{ t('home.features.color') }}</h3>
            </div>
            <p class="feature-description">{{ t('demo.colorSystem') }}</p>
            <div class="feature-footer">
              <router-link to="/color-scales" class="feature-link">
                {{ t('home.buttons.colorSystem') }}
              </router-link>
            </div>
          </div>
          <div class="feature-card" data-feature="i18n">
            <div class="feature-header">
              <div class="feature-icon">🌍</div>
              <h3>{{ t('home.features.i18n') }}</h3>
            </div>
            <p class="feature-description">{{ t('demo.i18nSystem') }}</p>
            <div class="feature-footer">
              <span class="feature-link">{{ t('home.buttons.i18nSystem') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- App Config 演示区域 -->
      <section class="app-config-section">
        <div class="section-header">
          <h2 class="section-title">App Configuration</h2>
          <p class="section-subtitle">实时查看 import.meta.env.appConfig 配置</p>
        </div>
        <AppConfigPanel />
      </section>

      <!-- 演示区域 -->
      <section class="demos-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.sections.engineApi') }}</h2>
          <p class="section-subtitle">{{ t('home.descriptions.completeDemo') }}</p>
        </div>
        <div class="demos-grid">
          <div class="demo-card">
            <div class="demo-icon">🔐</div>
            <h3>{{ t('demo.cryptoDemo') }}</h3>
            <p>{{ t('demo.cryptoDescription') }}</p>
            <router-link to="/crypto-demo" class="demo-link">
              {{ t('home.buttons.tryNow') }}
            </router-link>
          </div>
          <div class="demo-card">
            <div class="demo-icon">💾</div>
            <h3>{{ t('demo.cacheDemo') }}</h3>
            <p>{{ t('demo.cacheDescription') }}</p>
            <router-link to="/cache-demo" class="demo-link">
              {{ t('home.buttons.tryNow') }}
            </router-link>
          </div>
          <div class="demo-card">
            <div class="demo-icon">🗃️</div>
            <h3>{{ t('demo.storeDemo') }}</h3>
            <p>{{ t('demo.storeDescription') }}</p>
            <router-link to="/store-test" class="demo-link">
              {{ t('home.buttons.tryNow') }}
            </router-link>
          </div>
          <div class="demo-card">
            <div class="demo-icon">🌐</div>
            <h3>{{ t('demo.httpDemo') }}</h3>
            <p>{{ t('demo.httpDescription') }}</p>
            <router-link to="/http-demo" class="demo-link">
              {{ t('home.buttons.tryNow') }}
            </router-link>
          </div>
          <div class="demo-card">
            <div class="demo-icon">🔌</div>
            <h3>{{ t('demo.apiDemo') }}</h3>
            <p>{{ t('demo.apiDescription') }}</p>
            <router-link to="/api-demo" class="demo-link">
              {{ t('home.buttons.tryNow') }}
            </router-link>
          </div>
          <div class="demo-card">
            <div class="demo-icon">📱</div>
            <h3>{{ t('demo.deviceDemo') }}</h3>
            <p>{{ t('demo.deviceDescription') }}</p>
            <router-link to="/device-demo" class="demo-link">
              {{ t('home.buttons.tryNow') }}
            </router-link>
          </div>
        </div>
      </section>

      <!-- 技术信息区域 -->
      <section class="tech-section">
        <div class="tech-grid">
          <div class="tech-card">
            <h3>{{ t('home.sections.pluginSystem') }}</h3>
            <div class="tech-info">
              <div class="info-item">
                <span class="info-label">{{ t('nav.home') }}:</span>
                <span class="info-value">{{ route.path }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('user.name') }}:</span>
                <span class="info-value">{{ route.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Meta:</span>
                <span class="info-value">{{ JSON.stringify(route.meta) }}</span>
              </div>
            </div>
          </div>
          <div class="tech-card">
            <h3>{{ t('home.sections.typeScript') }}</h3>
            <div class="tech-info">
              <div class="info-item">
                <span class="info-label">{{ t('home.sections.engineApi') }}:</span>
                <span class="info-value">createAndMountApp</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('demo.routerSystem') }}:</span>
                <span class="info-value">createRouterEnginePlugin</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('demo.i18nSystem') }}:</span>
                <span class="info-value">createI18nEnginePlugin</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '@ldesign/router'
import { useI18n } from '@ldesign/i18n/vue/index.ts'
import AppConfigPanel from '../components/AppConfigPanel.vue'

/**
 * 首页组件
 * 展示 LDesign Demo 的基础功能和 @ldesign/router 集成
 */

// 获取路由信息
const route = useRoute()

// 获取国际化功能
const { t } = useI18n()
</script>

<style scoped lang="less">
.home-page {
  min-height: 100vh;
  background: var(--ldesign-bg-color-page);
  color: var(--ldesign-text-color-primary);
  overflow-x: hidden;
}

/* 英雄区域样式 */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ls-spacing-xxl) var(--ls-spacing-xl);
  background: linear-gradient(135deg,
    var(--ldesign-brand-color-1) 0%,
    var(--ldesign-brand-color-2) 50%,
    var(--ldesign-brand-color-3) 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.hero-pattern {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image:
    radial-gradient(circle at 25% 25%, var(--ldesign-brand-color-2) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, var(--ldesign-brand-color-3) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
  opacity: 0.3;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
}

.hero-badge {
  display: inline-block;
  margin-bottom: var(--ls-spacing-lg);
  padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
  background: var(--ldesign-brand-color);
  color: white;
  border-radius: var(--ls-border-radius-full);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  box-shadow: var(--ldesign-shadow-2);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: var(--ls-spacing-lg);
  background: linear-gradient(135deg,
    var(--ldesign-brand-color-8) 0%,
    var(--ldesign-brand-color-6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: var(--ls-font-size-xl);
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-spacing-xxl);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: var(--ls-spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-spacing-lg) var(--ls-spacing-xl);
  border: none;
  border-radius: var(--ls-border-radius-lg);
  font-size: var(--ls-font-size-base);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-large {
  padding: var(--ls-spacing-xl) var(--ls-spacing-xxl);
  font-size: var(--ls-font-size-lg);
}

.btn-primary {
  background: linear-gradient(135deg,
    var(--ldesign-brand-color) 0%,
    var(--ldesign-brand-color-6) 100%);
  color: white;
  box-shadow: var(--ldesign-shadow-2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--ldesign-shadow-3);
  background: linear-gradient(135deg,
    var(--ldesign-brand-color-6) 0%,
    var(--ldesign-brand-color-8) 100%);
}

.btn-secondary {
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-brand-color);
  border: 2px solid var(--ldesign-brand-color-3);
  box-shadow: var(--ldesign-shadow-1);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: var(--ldesign-brand-color-1);
  border-color: var(--ldesign-brand-color);
  box-shadow: var(--ldesign-shadow-2);
}

.btn-icon {
  font-size: 1.2em;
}

/* 主要内容区域 */
.home-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ls-spacing-xxl) var(--ls-spacing-xl);
}

/* 区域标题样式 */
.section-header {
  text-align: center;
  margin-bottom: var(--ls-spacing-xxl);
}

.section-title {
  font-size: var(--ls-font-size-h2);
  font-weight: 700;
  margin-bottom: var(--ls-spacing-lg);
  color: var(--ldesign-text-color-primary);
}

.section-subtitle {
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 特性区域样式 */
.features-section {
  margin-bottom: var(--ls-spacing-xxl);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ls-spacing-xl);
}

.feature-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xl);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg,
    var(--ldesign-brand-color) 0%,
    var(--ldesign-brand-color-6) 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--ldesign-shadow-3);
  border-color: var(--ldesign-brand-color-3);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-header {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-lg);
  margin-bottom: var(--ls-spacing-lg);
}

.feature-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ldesign-brand-color-1);
  border-radius: var(--ls-border-radius-lg);
  flex-shrink: 0;
}

.feature-card h3 {
  font-size: var(--ls-font-size-xl);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin: 0;
}

.feature-description {
  color: var(--ldesign-text-color-secondary);
  line-height: 1.6;
  margin-bottom: var(--ls-spacing-lg);
}

.feature-footer {
  margin-top: auto;
}

.feature-link {
  color: var(--ldesign-brand-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.feature-link:hover {
  color: var(--ldesign-brand-color-hover);
}

/* 演示区域样式 */
.demos-section {
  margin-bottom: var(--ls-spacing-xxl);
  padding: var(--ls-spacing-xxl) 0;
  background: linear-gradient(135deg,
    var(--ldesign-bg-color-container) 0%,
    var(--ldesign-bg-color-component) 100%);
  border-radius: var(--ls-border-radius-xl);
}

.demos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--ls-spacing-xl);
}

.demo-card {
  background: var(--ldesign-bg-color-page);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xl);
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.demo-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--ldesign-brand-color-1) 50%,
    transparent 100%);
  transition: left 0.6s ease;
}

.demo-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ldesign-shadow-2);
  border-color: var(--ldesign-brand-color-3);
}

.demo-card:hover::after {
  left: 100%;
}

.demo-icon {
  font-size: 3rem;
  margin-bottom: var(--ls-spacing-lg);
  display: inline-block;
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-brand-color-1);
  border-radius: var(--ls-border-radius-full);
  position: relative;
  z-index: 1;
}

.demo-card h3 {
  font-size: var(--ls-font-size-xl);
  font-weight: 600;
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-primary);
  position: relative;
  z-index: 1;
}

.demo-card p {
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-spacing-lg);
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.demo-link {
  display: inline-block;
  padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
  background: var(--ldesign-brand-color);
  color: white;
  text-decoration: none;
  border-radius: var(--ls-border-radius-base);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.demo-link:hover {
  background: var(--ldesign-brand-color-hover);
  transform: translateY(-1px);
  box-shadow: var(--ldesign-shadow-1);
}

/* 技术信息区域样式 */
.tech-section {
  margin-bottom: var(--ls-spacing-xxl);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--ls-spacing-xl);
}

.tech-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xl);
  position: relative;
  overflow: hidden;
}

.tech-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
    var(--ldesign-brand-color) 0%,
    var(--ldesign-brand-color-6) 50%,
    var(--ldesign-success-color) 100%);
}

.tech-card h3 {
  font-size: var(--ls-font-size-xl);
  font-weight: 600;
  margin-bottom: var(--ls-spacing-lg);
  color: var(--ldesign-text-color-primary);
}

.tech-info {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-spacing-sm);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-base);
  border-left: 3px solid var(--ldesign-brand-color-3);
}

.info-label {
  font-weight: 600;
  color: var(--ldesign-brand-color);
  min-width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: var(--ldesign-text-color-secondary);
  font-family: 'Courier New', monospace;
  font-size: var(--ls-font-size-sm);
  word-break: break-all;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-title {
    font-size: clamp(2rem, 4vw, 3rem);
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-large {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 80vh;
    padding: var(--ls-spacing-xl) var(--ls-spacing-lg);
  }

  .home-content {
    padding: var(--ls-spacing-xl) var(--ls-spacing-lg);
  }

  .features-grid,
  .demos-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .feature-header {
    flex-direction: column;
    text-align: center;
  }

  .feature-icon {
    margin: 0 auto;
  }

  .hero-badge {
    font-size: var(--ls-font-size-xs);
    padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: var(--ls-font-size-base);
  }

  .section-title {
    font-size: var(--ls-font-size-h3);
  }

  .info-item {
    flex-direction: column;
    gap: var(--ls-spacing-xs);
  }

  .info-label {
    min-width: auto;
  }
}

/* App Config 区域样式 */
.app-config-section {
  margin: var(--ls-spacing-xxl) 0;
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  border: 1px solid var(--ldesign-border-color);
}
</style>
