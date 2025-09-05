<template>
  <div :class="cardClass">
    <div v-if="$slots.header || title" class="ld-card-header">
      <slot name="header">
        <h3 v-if="title" class="ld-card-title">{{ title }}</h3>
      </slot>
      <div v-if="$slots.extra" class="ld-card-extra">
        <slot name="extra" />
      </div>
    </div>
    
    <div class="ld-card-body">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="ld-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  bordered?: boolean
  hoverable?: boolean
  loading?: boolean
  size?: 'small' | 'default' | 'large'
  shadow?: 'never' | 'hover' | 'always'
}>(), {
  bordered: true,
  hoverable: false,
  loading: false,
  size: 'default',
  shadow: 'hover'
})

// 计算样式类
const cardClass = computed(() => [
  'ld-card',
  `ld-card--${props.size}`,
  `ld-card--shadow-${props.shadow}`,
  {
    'ld-card--bordered': props.bordered,
    'ld-card--hoverable': props.hoverable,
    'ld-card--loading': props.loading
  }
])
</script>

<style scoped>
.ld-card {
  background-color: var(--ld-color-bg, #fff);
  border-radius: var(--ld-border-radius, 6px);
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
}

.ld-card--bordered {
  border: 1px solid var(--ld-color-border, #e8e8e8);
}

.ld-card--hoverable:hover {
  transform: translateY(-2px);
}

.ld-card--shadow-never {
  box-shadow: none;
}

.ld-card--shadow-hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ld-card--shadow-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ld-card--shadow-always {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ld-card--loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: loading 1.5s infinite;
  z-index: 1;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.ld-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ld-color-border, #e8e8e8);
  background-color: var(--ld-color-bg-light, #fafafa);
}

.ld-card--small .ld-card-header {
  padding: 12px 16px;
}

.ld-card--large .ld-card-header {
  padding: 20px 24px;
}

.ld-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ld-color-text, #333);
}

.ld-card--small .ld-card-title {
  font-size: 14px;
}

.ld-card--large .ld-card-title {
  font-size: 18px;
}

.ld-card-extra {
  color: var(--ld-color-text-secondary, #666);
}

.ld-card-body {
  padding: 20px;
}

.ld-card--small .ld-card-body {
  padding: 16px;
}

.ld-card--large .ld-card-body {
  padding: 24px;
}

.ld-card-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--ld-color-border, #e8e8e8);
  background-color: var(--ld-color-bg-light, #fafafa);
}

.ld-card--small .ld-card-footer {
  padding: 12px 16px;
}

.ld-card--large .ld-card-footer {
  padding: 20px 24px;
}
</style>
