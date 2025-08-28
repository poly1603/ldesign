<template>
  <div class="home">
    <div class="hero">
      <h2>🎉 {{ ($t as any)('home.welcome') }}</h2>
      <p>{{ ($t as any)('home.description') }}</p>
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
        <h3>🔧 插件架构</h3>
        <p>基于插件的集成方式，通过createRouterEnginePlugin实现Router功能</p>
      </div>
    </div>

    <div class="demo-info">
      <h3>📋 当前配置</h3>
      <ul>
        <li><strong>集成方式:</strong> createRouterEnginePlugin</li>
        <li><strong>路由模式:</strong> {{ routerMode }}</li>
        <li><strong>预设配置:</strong> SPA</li>
        <li><strong>Engine集成:</strong> ✅ 成功</li>
        <li><strong>Router功能:</strong> ✅ 完整</li>
        <li><strong>组件注册:</strong> ✅ 自动注册</li>
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
  padding: var(--size-lg, 1rem);
  font-size: var(--size-base, 1rem);
  color: var(--color-text, #1a202c);
  transition: all 0.3s ease;
}

.hero {
  text-align: center;
  margin-bottom: var(--size-6xl, 3rem);
  background: var(--color-surface, white);
  padding: var(--size-4xl, 2rem);
  border-radius: var(--size-lg, 12px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
}

.hero h2 {
  font-size: var(--size-3xl, 2rem);
  color: var(--color-text, #1a202c);
  margin-bottom: var(--size-lg, 1rem);
  font-weight: 700;
}

.hero p {
  font-size: var(--size-lg, 1.1rem);
  color: var(--color-text-secondary, #718096);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--size-2xl, 1.5rem);
  margin-bottom: var(--size-6xl, 3rem);
}

.feature-card {
  background: var(--color-surface, white);
  padding: var(--size-2xl, 1.5rem);
  border-radius: var(--size-md, 8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.feature-card h3 {
  margin: 0 0 var(--size-lg, 1rem) 0;
  color: var(--color-text, #1a202c);
  font-size: var(--size-xl, 1.25rem);
  font-weight: 600;
}

.feature-card p {
  margin: 0;
  color: var(--color-text-secondary, #4a5568);
  line-height: 1.6;
  font-size: var(--size-base, 1rem);
}

.demo-info {
  background: var(--color-muted, #f7fafc);
  padding: var(--size-2xl, 1.5rem);
  border-radius: var(--size-md, 8px);
  border: 1px solid var(--color-border, #e2e8f0);
}

.demo-info h3 {
  margin: 0 0 var(--size-lg, 1rem) 0;
  color: var(--color-text, #1a202c);
  font-size: var(--size-xl, 1.25rem);
  font-weight: 600;
}

.demo-info ul {
  margin: 0;
  padding-left: var(--size-2xl, 1.5rem);
}

.demo-info li {
  margin-bottom: var(--size-sm, 0.5rem);
  color: var(--color-text-secondary, #4a5568);
  font-size: var(--size-base, 1rem);
}

.demo-info p {
  margin-top: var(--size-lg, 1rem);
  color: var(--color-success, #10b981);
  font-weight: bold;
  font-size: var(--size-base, 1rem);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
    padding: var(--size-sm, 0.5rem);
  }

  .hero {
    padding: var(--size-lg, 1rem);
    margin-bottom: var(--size-4xl, 2rem);
  }

  .hero h2 {
    font-size: var(--size-2xl, 1.5rem);
  }

  .hero p {
    font-size: var(--size-base, 1rem);
  }

  .features-grid {
    gap: var(--size-lg, 1rem);
    margin-bottom: var(--size-4xl, 2rem);
  }

  .feature-card {
    padding: var(--size-lg, 1rem);
  }

  .demo-info {
    padding: var(--size-lg, 1rem);
  }
}
</style>
