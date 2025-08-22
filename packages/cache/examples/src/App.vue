<script setup lang="ts">
import BasicDemo from './components/BasicDemo.vue'
import LargeDataDemo from './components/LargeDataDemo.vue'
import PerformanceDemo from './components/PerformanceDemo.vue'
import SecurityDemo from './components/SecurityDemo.vue'
import SmartStrategyDemo from './components/SmartStrategyDemo.vue'
import VueIntegrationDemo from './components/VueIntegrationDemo.vue'
</script>

<template>
  <div id="app">
    <div class="header">
      <h1>@ldesign/cache</h1>
      <p>功能强大的浏览器缓存管理器演示</p>
    </div>

    <div class="demo-grid">
      <!-- 基础功能演示 -->
      <BasicDemo />

      <!-- 智能策略演示 -->
      <SmartStrategyDemo />

      <!-- 安全功能演示 -->
      <SecurityDemo />

      <!-- Vue 集成演示 -->
      <VueIntegrationDemo />

      <!-- 性能监控演示 -->
      <PerformanceDemo />

      <!-- 大数据处理演示 -->
      <LargeDataDemo />
    </div>
  </div>
</template>
