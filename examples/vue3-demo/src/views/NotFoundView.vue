<!--
  404 页面
-->

<template>
  <div class="not-found-view">
    <div class="not-found-content">
      <div class="not-found-icon">🔍</div>
      <h1 class="not-found-title">404</h1>
      <h2 class="not-found-subtitle">页面未找到</h2>
      <p class="not-found-description">
        抱歉，您访问的页面不存在或已被移动。
      </p>
      
      <div class="not-found-actions">
        <router-link to="/" class="btn btn--primary">
          🏠 返回首页
        </router-link>
        <button class="btn btn--secondary" @click="goBack">
          ← 返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style lang="less" scoped>
.not-found-view {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.not-found-content {
  max-width: 500px;
  padding: var(--ls-padding-xl);
}

.not-found-icon {
  font-size: 80px;
  margin-bottom: var(--ls-margin-lg);
  opacity: 0.6;
}

.not-found-title {
  font-size: 120px;
  font-weight: 700;
  color: var(--ldesign-brand-color);
  margin: 0;
  line-height: 1;
}

.not-found-subtitle {
  font-size: var(--ls-font-size-h2);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin: var(--ls-margin-base) 0;
}

.not-found-description {
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-secondary);
  line-height: 1.6;
  margin-bottom: var(--ls-margin-xl);
}

.not-found-actions {
  display: flex;
  gap: var(--ls-spacing-base);
  justify-content: center;
  flex-wrap: wrap;
}
</style>
