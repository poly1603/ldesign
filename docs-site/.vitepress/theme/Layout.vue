<template>
  <Layout>
    <template #home-hero-before>
      <div class="hero-animation">
        <!-- 可以在这里添加动画效果 -->
      </div>
    </template>
    
    <template #home-features-after>
      <div class="custom-features">
        <div class="container">
          <h2>为什么选择 LDesign？</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🚀</div>
              <h3>高性能</h3>
              <p>经过优化的构建流程，极致的运行时性能</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📦</div>
              <h3>模块化</h3>
              <p>70+ 独立包，按需使用，减少打包体积</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛠️</div>
              <h3>工程化</h3>
              <p>完整的工具链支持，提升开发效率</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💡</div>
              <h3>TypeScript</h3>
              <p>100% TypeScript 编写，完整的类型支持</p>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <template #aside-ads-before>
      <!-- 可以在侧边栏添加自定义内容 -->
    </template>
  </Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'

const { Layout } = DefaultTheme

onMounted(() => {
  // 页面加载后的处理
})
</script>

<style scoped>
.hero-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.custom-features {
  padding: 4rem 0;
  background-color: var(--vp-c-bg-alt);
}

.custom-features .container {
  max-width: var(--vp-layout-max-width);
  margin: 0 auto;
  padding: 0 24px;
}

.custom-features h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 12px 24px rgba(52, 81, 178, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.feature-card p {
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .custom-features h2 {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
