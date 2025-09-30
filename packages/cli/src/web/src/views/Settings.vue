<template>
  <div class="settings">
    <div class="page-header">
      <h1>系统设置</h1>
      <p class="page-description">配置系统参数和偏好设置</p>
    </div>

    <div class="placeholder-content">
      <div class="placeholder-icon">⚙️</div>
      <h3>系统设置功能开发中</h3>
      <p>系统配置和偏好设置功能正在开发中，敬请期待！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 系统设置页面 - 占位实现
</script>

<style lang="less" scoped>
.settings {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--ls-spacing-xl);

  h1 {
    font-size: var(--ls-font-size-xl);
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-spacing-xs);
  }

  .page-description {
    color: var(--ldesign-text-color-secondary);
  }
}

.placeholder-content {
  text-align: center;
  padding: var(--ls-spacing-xl);

  .placeholder-icon {
    font-size: 64px;
    margin-bottom: var(--ls-spacing-base);
  }

  h3 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-spacing-sm);
  }

  p {
    color: var(--ldesign-text-color-secondary);
  }
}
</style>
