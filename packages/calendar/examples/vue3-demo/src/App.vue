<template>
  <div id="app">
    <div class="container">
      <h1 class="page-title">@ldesign/calendar Vue3 示例</h1>
      
      <!-- 功能演示卡片 -->
      <div class="grid grid-2">
        <!-- 基础日历 -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">基础日历</h2>
          </div>
          <div class="card-body">
            <BasicCalendar />
          </div>
        </div>
        
        <!-- 高级功能 -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">高级功能</h2>
          </div>
          <div class="card-body">
            <AdvancedCalendar />
          </div>
        </div>
      </div>
      
      <!-- 完整示例 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">完整示例</h2>
        </div>
        <div class="card-body p-0">
          <FullFeaturedCalendar />
        </div>
      </div>
      
      <!-- 主题演示 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">主题演示</h2>
        </div>
        <div class="card-body">
          <ThemeDemo />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BasicCalendar from './components/BasicCalendar.vue'
import AdvancedCalendar from './components/AdvancedCalendar.vue'
import FullFeaturedCalendar from './components/FullFeaturedCalendar.vue'
import ThemeDemo from './components/ThemeDemo.vue'
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
