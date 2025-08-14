<template>
  <div class="home-page">
    <h1>🏠 首页</h1>
    <p>这是 LDesign Theme 的演示首页</p>

    <div class="feature-grid">
      <div class="feature-card">
        <h3>🎨 主题系统</h3>
        <p>强大的主题管理功能</p>
      </div>

      <div class="feature-card">
        <h3>🎭 装饰元素</h3>
        <p>丰富的装饰效果</p>
      </div>

      <div class="feature-card">
        <h3>🎬 动画效果</h3>
        <p>流畅的动画体验</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简单的首页组件
</script>

<style scoped>
.home-page {
  padding: 2rem;
  text-align: center;
}

.home-page h1 {
  color: var(--theme-primary);
  margin-bottom: 1rem;
}

.home-page p {
  color: var(--theme-text-secondary);
  margin-bottom: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.feature-card {
  background-color: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.75rem;
  padding: 2rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  margin: 0 0 1rem 0;
  color: var(--theme-text);
}

.feature-card p {
  margin: 0;
  color: var(--theme-text-secondary);
}
</style>
