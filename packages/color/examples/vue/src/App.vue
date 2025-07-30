<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeControlPanel from '@/components/ThemeControlPanel.vue'
import ThemePreview from '@/components/ThemePreview.vue'
import ColorGenerator from '@/components/ColorGenerator.vue'
import ColorScales from '@/components/ColorScales.vue'
import CustomThemeCreator from '@/components/CustomThemeCreator.vue'
import ComposableDemo from '@/components/ComposableDemo.vue'
import PerformanceMonitor from '@/components/PerformanceMonitor.vue'
import SystemThemeSync from '@/components/SystemThemeSync.vue'
import Notification from '@/components/Notification.vue'
</script>

<template>
  <div class="app">
    <!-- 头部 -->
    <AppHeader />

    <!-- 主要内容 -->
    <main class="main">
      <div class="container">
        <!-- 主题控制面板 -->
        <ThemeControlPanel />

        <!-- 功能演示区域 -->
        <div class="demo-grid">
          <!-- 主题预览 -->
          <ThemePreview />

          <!-- 颜色生成器 -->
          <ColorGenerator />

          <!-- 色阶展示 -->
          <ColorScales />

          <!-- 自定义主题 -->
          <CustomThemeCreator />

          <!-- 组合式 API 演示 -->
          <ComposableDemo />

          <!-- 性能监控 -->
          <PerformanceMonitor />

          <!-- 系统主题同步 -->
          <SystemThemeSync />
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <AppFooter />

    <!-- 全局通知 -->
    <Notification />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .main {
    padding: 1rem 0;
  }

  .demo-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }
}
</style>
