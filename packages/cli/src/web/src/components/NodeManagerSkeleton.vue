<template>
  <div class="node-manager-skeleton">
    <!-- 当前版本骨架 -->
    <div class="skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-circle"></div>
        <div class="skeleton-text skeleton-title"></div>
      </div>
      <div class="skeleton-version-info">
        <div class="skeleton-text skeleton-version"></div>
        <div class="skeleton-text skeleton-status"></div>
      </div>
    </div>

    <!-- 已安装版本骨架 -->
    <div class="skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-circle"></div>
        <div class="skeleton-text skeleton-title"></div>
      </div>
      <div class="skeleton-versions-grid">
        <div v-for="i in 3" :key="`installed-${i}`" class="skeleton-version-item">
          <div class="skeleton-text skeleton-version-num"></div>
          <div class="skeleton-btn"></div>
        </div>
      </div>
    </div>

    <!-- 推荐版本骨架 -->
    <div class="skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-circle"></div>
        <div class="skeleton-text skeleton-title"></div>
      </div>
      <div class="skeleton-recommended-grid">
        <div v-for="i in 3" :key="`recommended-${i}`" class="skeleton-recommended-item">
          <div class="skeleton-badge"></div>
          <div class="skeleton-text skeleton-label"></div>
          <div class="skeleton-text skeleton-version-num"></div>
          <div class="skeleton-text skeleton-desc"></div>
          <div class="skeleton-btn"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 纯展示组件，无逻辑
</script>

<style lang="less" scoped>
.node-manager-skeleton {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ls-spacing-xl);
}

.skeleton-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-lg);
  margin-bottom: var(--ls-spacing-lg);
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-spacing-base);
}

.skeleton-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    var(--ldesign-gray-color-1) 25%,
    var(--ldesign-gray-color-2) 50%,
    var(--ldesign-gray-color-1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-text {
  background: linear-gradient(
    90deg,
    var(--ldesign-gray-color-1) 25%,
    var(--ldesign-gray-color-2) 50%,
    var(--ldesign-gray-color-1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  height: 20px;
}

.skeleton-title {
  width: 120px;
}

.skeleton-version-info {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
  margin-top: var(--ls-spacing-base);
}

.skeleton-version {
  width: 150px;
  height: 36px;
}

.skeleton-status {
  width: 100px;
  height: 16px;
}

.skeleton-versions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--ls-spacing-base);
}

.skeleton-version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
}

.skeleton-version-num {
  width: 80px;
}

.skeleton-btn {
  width: 60px;
  height: 28px;
  border-radius: var(--ls-border-radius-base);
  background: linear-gradient(
    90deg,
    var(--ldesign-gray-color-1) 25%,
    var(--ldesign-gray-color-2) 50%,
    var(--ldesign-gray-color-1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--ls-spacing-base);
}

.skeleton-recommended-item {
  padding: var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
}

.skeleton-badge {
  width: 50px;
  height: 20px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    var(--ldesign-gray-color-1) 25%,
    var(--ldesign-gray-color-2) 50%,
    var(--ldesign-gray-color-1) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-label {
  width: 140px;
}

.skeleton-desc {
  width: 100%;
  height: 16px;
  margin-top: var(--ls-spacing-xs);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
