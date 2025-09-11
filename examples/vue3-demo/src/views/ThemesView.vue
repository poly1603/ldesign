<!--
  主题视图
-->

<template>
  <div class="themes-view">
    <div class="page-header">
      <h1>🎨 主题定制</h1>
      <p>展示主题切换和自定义主题功能</p>
    </div>

    <div class="coming-soon">
      <div class="coming-soon-content">
        <h2>🎨 主题功能开发中</h2>
        <p>主题定制功能正在开发中，敬请期待...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 主题功能实现
</script>

<style lang="less" scoped>
.themes-view {
  padding: var(--ls-padding-base) 0;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);

  h1 {
    font-size: var(--ls-font-size-h1);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }

  p {
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.coming-soon {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--ls-padding-xl);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  border: 2px dashed var(--ldesign-border-color);

  .coming-soon-content {
    h2 {
      font-size: var(--ls-font-size-h2);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-margin-base);
    }

    p {
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-secondary);
      line-height: 1.6;
    }
  }
}
</style>
