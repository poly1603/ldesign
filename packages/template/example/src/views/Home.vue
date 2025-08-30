<template>
  <div class="home">
    <div class="container">
      <!-- 欢迎区域 -->
      <section class="hero">
        <h1 class="hero-title">
          🎨 欢迎使用 LDesign Template
        </h1>
        <p class="hero-subtitle">
          高性能动态模板管理系统，让你的 Vue 3 应用更加灵活和强大
        </p>
        
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">{{ templateCount }}</div>
            <div class="stat-label">可用模板</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ categoryCount }}</div>
            <div class="stat-label">模板分类</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">3</div>
            <div class="stat-label">设备类型</div>
          </div>
        </div>
      </section>

      <!-- 功能特性 -->
      <section class="features">
        <h2 class="section-title">✨ 核心特性</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3 class="feature-title">高性能</h3>
            <p class="feature-description">
              智能缓存策略和懒加载机制，确保最佳性能表现
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-title">响应式设计</h3>
            <p class="feature-description">
              自动检测设备类型，无缝切换桌面/平板/移动端模板
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">类型安全</h3>
            <p class="feature-description">
              完整的 TypeScript 支持，提供出色的开发体验
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔧</div>
            <h3 class="feature-title">易于使用</h3>
            <p class="feature-description">
              简洁直观的 API 设计，5分钟即可上手
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3 class="feature-title">灵活定制</h3>
            <p class="feature-description">
              支持自定义模板、主题和配置选项
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3 class="feature-title">Vue 3 集成</h3>
            <p class="feature-description">
              开箱即用的组件和 Composition API
            </p>
          </div>
        </div>
      </section>

      <!-- 快速开始 -->
      <section class="quick-start">
        <h2 class="section-title">🚀 快速开始</h2>
        <div class="quick-start-content">
          <div class="code-example">
            <h3>1. 安装依赖</h3>
            <pre><code>pnpm add @ldesign/template</code></pre>
          </div>
          
          <div class="code-example">
            <h3>2. 注册插件</h3>
            <pre><code>import TemplatePlugin from '@ldesign/template'
app.use(TemplatePlugin, {
  enableCache: true,
  autoDetect: true
})</code></pre>
          </div>
          
          <div class="code-example">
            <h3>3. 使用组件</h3>
            <pre><code>&lt;TemplateRenderer 
  category="login" 
  :show-selector="true"
/&gt;</code></pre>
          </div>
        </div>
      </section>

      <!-- 示例导航 -->
      <section class="examples">
        <h2 class="section-title">📚 示例演示</h2>
        <div class="examples-grid">
          <router-link to="/basic" class="example-card">
            <div class="example-icon">🎯</div>
            <h3 class="example-title">基础示例</h3>
            <p class="example-description">
              了解如何使用 TemplateRenderer 组件渲染模板
            </p>
          </router-link>
          
          <router-link to="/advanced" class="example-card">
            <div class="example-icon">🔥</div>
            <h3 class="example-title">高级示例</h3>
            <p class="example-description">
              探索模板选择器、设备切换等高级功能
            </p>
          </router-link>
          
          <router-link to="/composition" class="example-card">
            <div class="example-icon">⚡</div>
            <h3 class="example-title">Composition API</h3>
            <p class="example-description">
              使用 useTemplate 等 Composition API
            </p>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 模拟数据
const availableTemplates = ref([
  { id: 'login-desktop-default', name: 'Default Login' },
  { id: 'login-desktop-modern', name: 'Modern Login' },
  { id: 'login-mobile-simple', name: 'Simple Mobile Login' },
  { id: 'dashboard-desktop-admin', name: 'Admin Dashboard' },
])

const availableCategories = ref(['login', 'dashboard'])

// 统计信息
const templateCount = computed(() => availableTemplates.value.length)
const categoryCount = computed(() => availableCategories.value.length)
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 欢迎区域 */
.hero {
  text-align: center;
  padding: 4rem 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin-bottom: 4rem;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

/* 功能特性 */
.features {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.feature-description {
  color: #666;
  line-height: 1.6;
}

/* 快速开始 */
.quick-start {
  margin-bottom: 4rem;
}

.quick-start-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.code-example {
  background: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  border-radius: 12px;
  color: white;
}

.code-example h3 {
  margin-bottom: 1rem;
  color: #4fc08d;
}

.code-example pre {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0;
}

.code-example code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 示例导航 */
.examples {
  margin-bottom: 4rem;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.example-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: block;
}

.example-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.example-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.example-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.example-description {
  color: #666;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .hero {
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-stats {
    gap: 2rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid,
  .examples-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-start-content {
    grid-template-columns: 1fr;
  }
}
</style>
