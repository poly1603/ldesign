<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被移动。
      </p>
      <div class="error-actions">
        <button class="btn primary" @click="goHome">
          返回首页
        </button>
        <button class="btn" @click="goBack">
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="less" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.not-found-content {
  max-width: 400px;
  padding: var(--ls-spacing-xl);
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: var(--ldesign-brand-color);
  line-height: 1;
  margin-bottom: var(--ls-spacing-base);
}

.error-title {
  font-size: var(--ls-font-size-xl);
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-base);
}

.error-description {
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-spacing-xl);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: var(--ls-spacing-base);
  justify-content: center;
}

.btn {
  padding: var(--ls-spacing-sm) var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-color);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  border-radius: var(--ls-border-radius-base);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--ls-font-size-base);

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-brand-color);
  }

  &.primary {
    background: var(--ldesign-brand-color);
    color: white;
    border-color: var(--ldesign-brand-color);

    &:hover {
      background: var(--ldesign-brand-color-6);
    }
  }
}

@media (max-width: 768px) {
  .error-actions {
    flex-direction: column;
  }
}
</style>
