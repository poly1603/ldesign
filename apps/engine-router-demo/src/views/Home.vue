<template>
  <div class="home">
    <div class="hero">
      <h2>🎉 欢迎使用Engine Router Demo</h2>
      <p>这是一个展示@ldesign/engine与@ldesign/router集成的示例应用</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <h3>🚀 Engine核心</h3>
        <p>强大的Vue3应用引擎，提供插件系统、中间件支持、全局管理等核心功能</p>
      </div>

      <div class="feature-card">
        <h3>🛣️ Router集成</h3>
        <p>使用真实的@ldesign/router功能，支持完整的路由切换和动画效果</p>
      </div>

      <div class="feature-card">
        <h3>⚙️ 配置驱动</h3>
        <p>通过简单的配置选项即可启用各种功能，无需复杂的手动配置</p>
      </div>

      <div class="feature-card">
        <h3>🔧 扩展架构</h3>
        <p>模块化的扩展系统，保持核心代码纯净，扩展功能完全隔离</p>
      </div>
    </div>

    <div class="demo-info">
      <h3>📋 当前配置</h3>
      <ul>
        <li><strong>路由模式:</strong> {{ routerMode }}</li>
        <li><strong>Engine集成:</strong> ✅ 成功</li>
        <li><strong>Router功能:</strong> ✅ 完整</li>
        <li><strong>组件注册:</strong> ✅ 正常</li>
        <li><strong>动画效果:</strong> ✅ RouterView内置动画</li>
      </ul>
      <p style="margin-top: 1rem; color: #28a745; font-weight: bold;">
        🎉 点击上方导航链接体验路由切换动画效果！
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const routerMode = computed(() => {
  // 简化处理，直接显示配置的模式
  return 'history'
})
</script>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.feature-card h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.feature-card p {
  margin: 0;
  color: #6c757d;
  line-height: 1.6;
}

.demo-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.demo-info h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.demo-info ul {
  margin: 0;
  padding-left: 1.5rem;
}

.demo-info li {
  margin-bottom: 0.5rem;
  color: #6c757d;
}
</style>
