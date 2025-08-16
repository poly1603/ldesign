<script setup lang="ts">
// 这里可以添加一些统计逻辑
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>@ldesign/store 高级示例</h1>
      <p class="hero-subtitle">
        探索企业级状态管理的强大功能，包括性能优化、Store池管理、实时同步等高级特性
      </p>
    </div>

    <div class="features grid grid-2">
      <div class="feature-card card">
        <div class="feature-icon">
          ⚡
        </div>
        <h3>性能优化</h3>
        <p>学习如何使用缓存、防抖、节流、性能监控等技术优化应用性能</p>
        <router-link to="/performance" class="btn btn-primary">
          查看示例
        </router-link>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">
          🏊‍♂️
        </div>
        <h3>Store 池管理</h3>
        <p>了解如何使用Store池减少内存分配，提高应用性能和资源利用率</p>
        <router-link to="/store-pool" class="btn btn-primary">
          查看示例
        </router-link>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">
          🏢
        </div>
        <h3>企业级功能</h3>
        <p>探索权限管理、数据验证、错误处理等企业级应用必备功能</p>
        <router-link to="/enterprise" class="btn btn-primary">
          查看示例
        </router-link>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">
          🔄
        </div>
        <h3>实时同步</h3>
        <p>实现WebSocket连接、数据同步、离线处理等实时应用功能</p>
        <router-link to="/realtime" class="btn btn-primary">
          查看示例
        </router-link>
      </div>
    </div>

    <div class="getting-started card">
      <h2>快速开始</h2>
      <p>
        这些示例展示了 @ldesign/store 的高级用法，适合有一定基础的开发者学习。
      </p>

      <div class="code-example">
        <h4>安装依赖</h4>
        <div class="code-block">
          <pre>pnpm add @ldesign/store pinia vue reflect-metadata</pre>
        </div>
      </div>

      <div class="code-example">
        <h4>基本配置</h4>
        <div class="code-block">
          <pre>
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'reflect-metadata'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')</pre>
        </div>
      </div>

      <div class="alert alert-info">
        <strong>提示：</strong>这些示例需要对 Vue 3、TypeScript
        和状态管理有基本了解。 如果你是初学者，建议先查看基础示例。
      </div>
    </div>

    <div class="stats grid grid-3">
      <div class="metric">
        <div class="metric-value">
          4
        </div>
        <div class="metric-label">
          高级示例
        </div>
      </div>
      <div class="metric">
        <div class="metric-value">
          15+
        </div>
        <div class="metric-label">
          核心功能
        </div>
      </div>
      <div class="metric">
        <div class="metric-value">
          100%
        </div>
        <div class="metric-label">
          TypeScript
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.features {
  margin-bottom: 3rem;
}

.feature-card {
  text-align: center;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.feature-card p {
  color: #718096;
  margin-bottom: 1.5rem;
}

.getting-started {
  margin-bottom: 3rem;
}

.getting-started h2 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.code-example {
  margin: 1.5rem 0;
}

.code-example h4 {
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.stats {
  margin-top: 2rem;
}
</style>
