<script setup lang="ts">
import type { SizeMode } from '../../../src/types'
import { SizeControlPanel } from '../../../src/vue'
import ComponentDemo from './components/ComponentDemo.vue'
import CompositionApiDemo from './components/CompositionApiDemo.vue'
import RealWorldDemo from './components/RealWorldDemo.vue'
import ResponsiveDemo from './components/ResponsiveDemo.vue'

function handleSizeChange(mode: SizeMode) {
  console.log('尺寸模式变化:', mode)
}
</script>

<template>
  <div class="app">
    <!-- 头部控制面板 -->
    <header class="header">
      <div class="container">
        <h1>@ldesign/size Vue 示例</h1>
        <p>展示页面尺寸缩放功能在Vue项目中的各种使用方式</p>

        <!-- 尺寸控制面板 -->
        <SizeControlPanel
          class="header-control"
          :show-switcher="true"
          :show-indicator="true"
          switcher-style="button"
          @change="handleSizeChange"
        />
      </div>
    </header>

    <main class="main">
      <div class="container">
        <!-- Plugin 使用示例 -->
        <section class="section">
          <h2 class="section-title">
            1. Vue Plugin 使用
          </h2>
          <p>通过全局插件访问尺寸管理功能</p>

          <div class="demo-card">
            <h3>全局属性访问</h3>
            <p>当前模式: {{ $getSizeMode() }}</p>
            <p>
              当前配置: {{ JSON.stringify($getSizeConfig().fontSize, null, 2) }}
            </p>

            <div class="demo-actions">
              <button class="btn btn-primary" @click="$setSize('small')">
                设置为小尺寸
              </button>
              <button class="btn btn-primary" @click="$setSize('large')">
                设置为大尺寸
              </button>
            </div>
          </div>
        </section>

        <!-- Composition API 使用示例 -->
        <section class="section">
          <h2 class="section-title">
            2. Composition API 使用
          </h2>
          <CompositionApiDemo />
        </section>

        <!-- 组件使用示例 -->
        <section class="section">
          <h2 class="section-title">
            3. 组件使用示例
          </h2>
          <ComponentDemo />
        </section>

        <!-- 响应式示例 -->
        <section class="section">
          <h2 class="section-title">
            4. 响应式使用示例
          </h2>
          <ResponsiveDemo />
        </section>

        <!-- 实际应用示例 -->
        <section class="section">
          <h2 class="section-title">
            5. 实际应用示例
          </h2>
          <RealWorldDemo />
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--ls-spacing-xxl, 48px) 0;
  text-align: center;
}

.header h1 {
  font-size: var(--ls-font-size-h1, 32px);
  margin-bottom: var(--ls-spacing-sm, 8px);
  font-weight: 700;
}

.header p {
  font-size: var(--ls-font-size-lg, 18px);
  opacity: 0.9;
  margin-bottom: var(--ls-spacing-lg, 24px);
}

.header-control {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--ls-border-radius-lg, 8px);
  padding: var(--ls-spacing-base, 16px);
  backdrop-filter: blur(10px);
}

.main {
  padding: var(--ls-spacing-xxl, 48px) 0;
}

.demo-actions {
  display: flex;
  gap: var(--ls-spacing-sm, 8px);
  margin-top: var(--ls-spacing-base, 16px);
}

.demo-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .header {
    padding: var(--ls-spacing-lg, 24px) 0;
  }

  .demo-actions {
    flex-direction: column;
  }
}
</style>
