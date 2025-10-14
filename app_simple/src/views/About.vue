<template>
  <div class="about-container">
    <div class="about-content">
      <h1 class="about-title">{{ t('about.title') }}</h1>
      
      <div class="about-section">
        <h2>{{ t('about.subtitle') }}</h2>
        <p>{{ t('about.description') }}</p>
      </div>
      
      <div class="about-section">
        <h2>{{ t('about.goals.title') || '我们的目标' }}</h2>
        <ul>
          <li v-for="(item, index) in goalItems" :key="index">{{ item }}</li>
        </ul>
      </div>
      
      <div class="about-section">
        <h2>{{ t('about.features.title') }}</h2>
        <div class="feature-list">
          <div class="feature-item" v-for="feature in features" :key="feature.key">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>
      
      <div class="about-section">
        <h2>{{ t('about.techStack') || '技术栈' }}</h2>
        <div class="tech-stack">
          <span class="tech-badge" v-for="tech in techStack" :key="tech">{{ tech }}</span>
        </div>
      </div>
      
      <div class="about-section">
        <h2>{{ t('about.version') }}</h2>
        <table class="version-table">
          <tbody>
            <tr>
              <td>{{ t('about.version') }}</td>
              <td>v1.0.0</td>
            </tr>
            <tr>
              <td>Vue {{ t('about.version') }}</td>
              <td>v3.4+</td>
            </tr>
            <tr>
              <td>Node {{ t('about.version') }}</td>
              <td>v16+</td>
            </tr>
            <tr>
              <td>{{ t('about.license') }}</td>
              <td>MIT</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="about-section">
        <h2>{{ t('about.contact.title') }}</h2>
        <p>{{ t('about.team.description') }}</p>
        <div class="contribute-links">
          <a href="#" class="contribute-link">{{ t('about.repository') }}</a>
          <a href="#" class="contribute-link">{{ t('home.viewDocs') }}</a>
          <a href="#" class="contribute-link">{{ t('about.contact.community') || '讨论区' }}</a>
        </div>
      </div>
      
      <div class="about-footer">
        <p>{{ t('about.team.title') }}</p>
        <p class="copyright">{{ t('app.copyright') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()

// 目标项列表
const goalItems = computed(() => [
  t('about.goals.api') || '提供简洁而强大的 API',
  t('about.goals.performance') || '优化性能，减少内存占用',
  t('about.goals.typescript') || '完善的 TypeScript 支持',
  t('about.goals.integration') || '与 @ldesign/engine 深度集成',
  t('about.goals.extensible') || '丰富的功能扩展'
])

// 特性列表
const features = computed(() => [
  {
    key: 'vue3',
    title: t('about.features.items.vue3'),
    desc: t('about.features.vue3Desc') || '基于 Vue 3 构建，提供出色的性能'
  },
  {
    key: 'typescript',
    title: t('about.features.items.typescript'),
    desc: t('home.features.list.typescriptDesc')
  },
  {
    key: 'vite',
    title: t('about.features.items.vite'),
    desc: t('about.features.viteDesc') || '快速的开发服务器和构建工具'
  },
  {
    key: 'i18n',
    title: t('about.features.items.i18n'),
    desc: t('about.features.i18nDesc') || '完整的国际化支持'
  }
])

// 技术栈
const techStack = ['Vue 3', 'TypeScript', 'Vite', 'Rollup', 'ESBuild', 'i18n']

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