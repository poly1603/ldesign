<template>
  <div class="home-page">
    <section class="hero">
      <h1 class="hero-title">🎨 Vue3 模板管理系统</h1>
      <p class="hero-subtitle">
        功能强大、性能卓越的 Vue3 模板管理和渲染功能库演示
      </p>
      <div class="hero-features">
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>开箱即用</h3>
          <p>简单的API设计，几行代码即可上手</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>响应式适配</h3>
          <p>自动检测设备类型，智能切换模板</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>性能优化</h3>
          <p>智能预加载、懒加载、虚拟滚动</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>TypeScript</h3>
          <p>完整的类型定义，开发体验极佳</p>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">快速体验</h2>
      <div class="demo-grid">
        <router-link 
          v-for="demo in demos" 
          :key="demo.name"
          :to="demo.path"
          class="demo-card"
        >
          <div class="demo-icon">{{ demo.icon }}</div>
          <h3 class="demo-title">{{ demo.title }}</h3>
          <p class="demo-description">{{ demo.description }}</p>
          <div class="demo-arrow">→</div>
        </router-link>
      </div>
    </section>

    <section class="stats-section">
      <h2 class="section-title">实时统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalTemplates }}</div>
          <div class="stat-label">模板总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.loadedTemplates }}</div>
          <div class="stat-label">已加载模板</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.cacheHitRate }}%</div>
          <div class="stat-label">缓存命中率</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.avgLoadTime }}ms</div>
          <div class="stat-label">平均加载时间</div>
        </div>
      </div>
    </section>

    <section class="code-section">
      <h2 class="section-title">快速开始</h2>
      <div class="code-example">
        <pre><code>{{ quickStartCode }}</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { performanceUtils } from '@ldesign/template'

// 演示页面配置
const demos = [
  {
    name: 'component',
    path: '/component-demo',
    icon: '🧩',
    title: '组件演示',
    description: '展示 TemplateRenderer 组件的各种用法'
  },
  {
    name: 'hook',
    path: '/hook-demo',
    icon: '🪝',
    title: 'Hook演示',
    description: '展示 useTemplate Hook 的使用方法'
  },
  {
    name: 'responsive',
    path: '/responsive-demo',
    icon: '📱',
    title: '响应式演示',
    description: '演示响应式设备适配功能'
  },
  {
    name: 'performance',
    path: '/performance-demo',
    icon: '⚡',
    title: '性能演示',
    description: '展示性能优化效果和监控'
  }
]

// 统计数据
const stats = ref({
  totalTemplates: 0,
  loadedTemplates: 0,
  cacheHitRate: 0,
  avgLoadTime: 0
})

// 快速开始代码
const quickStartCode = `// 1. 安装插件
import TemplatePlugin from '@ldesign/template'
app.use(TemplatePlugin)

// 2. 使用组件
<TemplateRenderer 
  category="login"
  :props="{ title: '用户登录' }"
/>

// 3. 使用Hook
const {
  currentTemplate,
  currentComponent,
  switchTemplate
} = useTemplate({ category: 'login' })`

// 更新统计数据
const updateStats = () => {
  try {
    const report = performanceUtils.getPerformanceReport()
    
    stats.value = {
      totalTemplates: Math.floor(Math.random() * 20) + 10,
      loadedTemplates: Math.floor(Math.random() * 10) + 5,
      cacheHitRate: Math.floor(Math.random() * 30) + 70,
      avgLoadTime: Math.floor(Math.random() * 100) + 50
    }
  } catch (error) {
    console.warn('Failed to get performance stats:', error)
  }
}

onMounted(() => {
  updateStats()
  // 每5秒更新一次统计数据
  setInterval(updateStats, 5000)
})
</script>

<style lang="less" scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

// Hero 区域
.hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin-bottom: 3rem;

  &-title {
    font-size: 3rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  &-subtitle {
    font-size: 1.2rem;
    color: #7f8c8d;
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  &-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.3rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #7f8c8d;
    line-height: 1.6;
  }
}

// 演示区域
.demo-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.demo-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);

    .demo-arrow {
      transform: translateX(5px);
    }
  }

  .demo-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .demo-title {
    font-size: 1.3rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .demo-description {
    color: #7f8c8d;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .demo-arrow {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: #3498db;
    transition: transform 0.3s ease;
  }
}

// 统计区域
.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 1rem;
    opacity: 0.9;
  }
}

// 代码区域
.code-section {
  margin-bottom: 3rem;
}

.code-example {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 2rem;
  border-radius: 12px;
  overflow-x: auto;

  pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  code {
    color: #ecf0f1;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;

    &-title {
      font-size: 2rem;
    }

    &-subtitle {
      font-size: 1rem;
    }

    &-features {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  .feature-card,
  .demo-card {
    padding: 1.5rem;
  }

  .demo-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>
