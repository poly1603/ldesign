<script setup lang="ts">
/**
 * 模板骨架屏组件
 * 
 * 在模板加载时显示的占位符
 */
import { computed } from 'vue'

interface Props {
  /**
   * 骨架屏类型
   */
  type?: 'default' | 'card' | 'list' | 'article' | 'form' | 'custom'
  /**
   * 动画效果
   */
  animation?: 'pulse' | 'wave' | 'none'
  /**
   * 行数（list类型时使用）
   */
  rows?: number
  /**
   * 是否显示头像
   */
  avatar?: boolean
  /**
   * 是否显示标题
   */
  title?: boolean
  /**
   * 自定义类名
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  animation: 'pulse',
  rows: 3,
  avatar: false,
  title: true
})

const skeletonClass = computed(() => {
  const classes = ['template-skeleton']
  if (props.animation !== 'none') {
    classes.push(`skeleton-${props.animation}`)
  }
  if (props.class) {
    classes.push(props.class)
  }
  return classes.join(' ')
})
</script>

<template>
  <div :class="skeletonClass">
    <!-- Default skeleton -->
    <div v-if="type === 'default'" class="skeleton-default">
      <div v-if="title" class="skeleton-header">
        <div class="skeleton-line skeleton-title" />
      </div>
      <div class="skeleton-content">
        <div v-for="i in rows" :key="i" class="skeleton-line" :style="{ width: `${100 - i * 10}%` }" />
      </div>
    </div>

    <!-- Card skeleton -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-card-image" />
      <div class="skeleton-card-body">
        <div class="skeleton-line skeleton-title" />
        <div class="skeleton-line skeleton-subtitle" />
        <div class="skeleton-line skeleton-text" />
        <div class="skeleton-line skeleton-text" style="width: 60%" />
      </div>
    </div>

    <!-- List skeleton -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in rows" :key="i" class="skeleton-list-item">
        <div v-if="avatar" class="skeleton-avatar" />
        <div class="skeleton-list-content">
          <div class="skeleton-line skeleton-title" />
          <div class="skeleton-line skeleton-text" />
        </div>
      </div>
    </div>

    <!-- Article skeleton -->
    <div v-else-if="type === 'article'" class="skeleton-article">
      <div class="skeleton-line skeleton-h1" />
      <div class="skeleton-line skeleton-meta" />
      <div class="skeleton-paragraph">
        <div v-for="i in 5" :key="`p1-${i}`" class="skeleton-line" />
      </div>
      <div class="skeleton-paragraph">
        <div v-for="i in 4" :key="`p2-${i}`" class="skeleton-line" />
      </div>
    </div>

    <!-- Form skeleton -->
    <div v-else-if="type === 'form'" class="skeleton-form">
      <div v-for="i in rows" :key="i" class="skeleton-form-group">
        <div class="skeleton-line skeleton-label" />
        <div class="skeleton-line skeleton-input" />
      </div>
      <div class="skeleton-form-actions">
        <div class="skeleton-button" />
        <div class="skeleton-button skeleton-button-secondary" />
      </div>
    </div>

    <!-- Custom skeleton -->
    <div v-else-if="type === 'custom'" class="skeleton-custom">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.template-skeleton {
  padding: 20px;
  width: 100%;
  height: 100%;
}

/* Base skeleton styles */
.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-title {
  height: 20px;
  width: 40%;
  margin-bottom: 16px;
}

.skeleton-subtitle {
  height: 16px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 12px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 50%;
  margin-right: 12px;
}

/* Animations */
.skeleton-pulse .skeleton-line,
.skeleton-pulse .skeleton-avatar,
.skeleton-pulse .skeleton-card-image,
.skeleton-pulse .skeleton-button {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.skeleton-wave .skeleton-line,
.skeleton-wave .skeleton-avatar,
.skeleton-wave .skeleton-card-image,
.skeleton-wave .skeleton-button {
  animation: wave 1.5s linear infinite;
}

@keyframes wave {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Default skeleton */
.skeleton-default {
  max-width: 100%;
}

/* Card skeleton */
.skeleton-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-card-image {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-card-body {
  padding: 16px;
}

/* List skeleton */
.skeleton-list-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-list-item:last-child {
  border-bottom: none;
}

.skeleton-list-content {
  flex: 1;
}

/* Article skeleton */
.skeleton-article {
  max-width: 800px;
  margin: 0 auto;
}

.skeleton-h1 {
  height: 32px;
  width: 70%;
  margin-bottom: 16px;
}

.skeleton-meta {
  height: 14px;
  width: 30%;
  margin-bottom: 24px;
  opacity: 0.6;
}

.skeleton-paragraph {
  margin-bottom: 24px;
}

.skeleton-paragraph .skeleton-line:last-child {
  width: 80%;
}

/* Form skeleton */
.skeleton-form-group {
  margin-bottom: 20px;
}

.skeleton-label {
  height: 14px;
  width: 100px;
  margin-bottom: 8px;
}

.skeleton-input {
  height: 36px;
  width: 100%;
  border-radius: 4px;
}

.skeleton-form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.skeleton-button {
  height: 36px;
  width: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
}

.skeleton-button-secondary {
  opacity: 0.6;
}
</style>