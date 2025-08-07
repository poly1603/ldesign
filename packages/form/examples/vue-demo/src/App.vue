<template>
  <div class="app">
    <div class="header">
      <h1>@ldesign/form</h1>
      <p>Vue 3 + TypeScript 演示项目</p>
    </div>

    <div class="container">
      <!-- 基础表单演示 -->
      <div class="demo-section">
        <h2 class="demo-title">🚀 基础表单演示</h2>
        <p class="demo-description">
          演示 Vue 组件方式使用
          @ldesign/form，包含基本的表单创建、数据绑定和验证功能。
        </p>

        <div class="tabs">
          <button
            class="tab"
            :class="{ active: activeTab === 'component' }"
            @click="activeTab = 'component'"
          >
            Vue 组件
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'composable' }"
            @click="activeTab = 'composable'"
          >
            Composition API
          </button>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'component'">
            <p>Vue 组件演示 - 正在开发中...</p>
          </div>
          <div v-if="activeTab === 'composable'">
            <p>Composition API 演示 - 正在开发中...</p>
          </div>
        </div>
      </div>

      <!-- 高级表单演示 -->
      <div class="demo-section">
        <h2 class="demo-title">🎨 高级表单演示</h2>
        <p class="demo-description">
          演示高级功能：条件渲染、自定义验证、动态字段、主题切换等。
        </p>

        <p>高级功能演示 - 正在开发中...</p>
      </div>

      <!-- 表单分组演示 -->
      <div class="demo-section">
        <h2 class="demo-title">📊 表单分组演示</h2>
        <p class="demo-description">
          演示表单分组功能，将相关字段组织成逻辑分组，支持分组展开/折叠。
        </p>

        <p>表单分组演示 - 正在开发中...</p>
      </div>

      <!-- 主题演示 -->
      <div class="demo-section">
        <h2 class="demo-title">🎨 主题系统演示</h2>
        <p class="demo-description">
          演示主题系统功能，支持多种预设主题和运行时主题切换。
        </p>

        <p>主题系统演示 - 正在开发中...</p>
      </div>
    </div>

    <div class="footer">
      <p>&copy; 2024 LDesign Team. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 暂时注释掉所有组件导入，先测试基本启动
// import BasicFormDemo from './components/BasicFormDemo.vue'
// import ComposableDemo from './components/ComposableDemo.vue'
// import AdvancedFormDemo from './components/AdvancedFormDemo.vue'
// import GroupedFormDemo from './components/GroupedFormDemo.vue'
// import ThemeDemo from './components/ThemeDemo.vue'

const activeTab = ref('component')
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}
</style>
