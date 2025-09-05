<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <header class="page-header">
      <h1 class="page-title">Hooks 用法示例</h1>
      <p class="page-description">
        展示如何直接使用 useForm、useField、useFieldArray 等 Composition API hooks
      </p>
    </header>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Composition API Hooks 演示</h2>
        <p class="card-description">此页面正在开发中，敬请期待...</p>
      </div>

      <div class="placeholder-content">
        <div class="placeholder-icon">🎣</div>
        <h3>Hooks 功能开发中</h3>
        <p>Hooks 用法示例包含以下内容：</p>
        <ul>
          <li>useForm - 表单状态管理</li>
          <li>useField - 单个字段管理</li>
          <li>useFieldArray - 数组字段管理</li>
          <li>useFormContext - 表单上下文</li>
          <li>自定义 hooks 组合</li>
        </ul>
        <p>这些示例正在积极开发中，将展示如何在不使用组件的情况下直接使用 hooks。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Hooks 用法页面逻辑
</script>

<style scoped>
.placeholder-content {
  text-align: center;
  padding: var(--ls-spacing-xxl);
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: var(--ls-spacing-lg);
}

.placeholder-content h3 {
  font-size: var(--ls-font-size-xl);
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-base);
}

.placeholder-content p {
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-spacing-base);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.placeholder-content ul {
  text-align: left;
  max-width: 400px;
  margin: var(--ls-spacing-lg) auto;
  color: var(--ldesign-text-color-secondary);
}

.placeholder-content li {
  margin-bottom: var(--ls-spacing-xs);
}
</style>
