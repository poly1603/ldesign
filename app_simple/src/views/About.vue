<template>
  <div class="about-container">
    <div class="about-content">
      <h1 class="about-title">{{ t('page.about.title') }}</h1>
      
      <div class="about-section">
        <h2>{{ t('page.about.intro.title') }}</h2>
        <p>{{ t('page.about.intro.content') }}</p>
      </div>
      
      <div class="about-section">
        <h2>{{ t('page.about.goals.title') }}</h2>
        <ul>
          <li v-for="(item, index) in goalItems" :key="index">{{ item }}</li>
        </ul>
      </div>
      
      <div class="about-section">
        <h2>{{ t('page.about.features.title') }}</h2>
        <div class="feature-list">
          <div class="feature-item">
            <h3>{{ t('page.about.features.smartPrefetch.title') }}</h3>
            <p>{{ t('page.about.features.smartPrefetch.description') }}</p>
          </div>
          <div class="feature-item">
            <h3>{{ t('page.about.features.cacheManagement.title') }}</h3>
            <p>{{ t('page.about.features.cacheManagement.description') }}</p>
          </div>
          <div class="feature-item">
            <h3>{{ t('page.about.features.performanceMonitoring.title') }}</h3>
            <p>{{ t('page.about.features.performanceMonitoring.description') }}</p>
          </div>
          <div class="feature-item">
            <h3>{{ t('page.about.features.securityProtection.title') }}</h3>
            <p>{{ t('page.about.features.securityProtection.description') }}</p>
          </div>
        </div>
      </div>
      
      <div class="about-section">
        <h2>{{ t('page.about.techStack.title') }}</h2>
        <div class="tech-stack">
          <span class="tech-badge">Vue 3</span>
          <span class="tech-badge">TypeScript</span>
          <span class="tech-badge">Vite</span>
          <span class="tech-badge">Rollup</span>
          <span class="tech-badge">ESBuild</span>
        </div>
      </div>
      
      <div class="about-section">
        <h2>{{ t('page.about.version.title') }}</h2>
        <table class="version-table">
          <tbody>
            <tr>
              <td>{{ t('page.about.version.current') }}</td>
              <td>v1.0.0</td>
            </tr>
            <tr>
              <td>{{ t('page.about.version.vueVersion') }}</td>
              <td>v3.4+</td>
            </tr>
            <tr>
              <td>{{ t('page.about.version.nodeVersion') }}</td>
              <td>v16+</td>
            </tr>
            <tr>
              <td>{{ t('page.about.version.license') }}</td>
              <td>MIT</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="about-section">
        <h2>{{ t('page.about.contribute.title') }}</h2>
        <p>{{ t('page.about.contribute.content') }}</p>
        <div class="contribute-links">
          <a href="#" class="contribute-link">{{ t('page.about.contribute.links.github') }}</a>
          <a href="#" class="contribute-link">{{ t('page.about.contribute.links.docs') }}</a>
          <a href="#" class="contribute-link">{{ t('page.about.contribute.links.discussions') }}</a>
        </div>
      </div>
      
      <div class="about-footer">
        <p>{{ t('page.about.footer.madeWith') }}</p>
        <p class="copyright">{{ t('page.about.footer.copyright') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from '../composables/useI18n'

const { t, locale } = useI18n()

// Compute goal items based on current locale
const goalItems = computed(() => {
  const goals = locale.value === 'zh-CN' ? [
    '提供简洁而强大的 API',
    '优化性能，减少内存占用',
    '完善的 TypeScript 支持',
    '与 @ldesign/engine 深度集成',
    '丰富的功能扩展'
  ] : [
    'Provide simple yet powerful API',
    'Optimize performance, reduce memory usage',
    'Complete TypeScript support',
    'Deep integration with @ldesign/engine',
    'Rich feature extensions'
  ]
  return goals
})

onMounted(() => {
  console.log('About page mounted')
})
</script>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.about-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  padding: 40px;
}

.about-title {
  font-size: 36px;
  color: #2c3e50;
  margin: 0 0 40px 0;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.about-section {
  margin-bottom: 40px;
}

.about-section h2 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.about-section p {
  color: #666;
  line-height: 1.8;
  margin: 0 0 15px 0;
}

.about-section ul {
  color: #666;
  line-height: 1.8;
  padding-left: 20px;
}

.about-section li {
  margin-bottom: 10px;
}

/* 功能列表 */
.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-item h3 {
  color: #667eea;
  font-size: 18px;
  margin: 0 0 10px 0;
}

.feature-item p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 技术栈 */
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-badge {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

/* 版本表格 */
.version-table {
  width: 100%;
  border-collapse: collapse;
}

.version-table tr {
  border-bottom: 1px solid #f0f0f0;
}

.version-table td {
  padding: 12px;
  color: #666;
}

.version-table td:first-child {
  font-weight: 600;
  width: 40%;
}

/* 贡献链接 */
.contribute-links {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.contribute-link {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.contribute-link:hover {
  background: #667eea;
  color: white;
}

/* 页脚 */
.about-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.about-footer p {
  color: #999;
  margin: 5px 0;
}

.copyright {
  font-size: 12px;
}

@media (max-width: 768px) {
  .about-content {
    padding: 20px;
  }
  
  .about-title {
    font-size: 28px;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
  
  .contribute-links {
    flex-direction: column;
  }
}
</style>