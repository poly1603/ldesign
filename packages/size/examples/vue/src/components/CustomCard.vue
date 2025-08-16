<script setup lang="ts">
import { computed } from 'vue'
import { useSize } from '../../../../src/vue'

interface Props {
  title?: string
  shadow?: 'none' | 'sm' | 'base' | 'lg' | 'xl'
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'base',
  bordered: true,
})

// 使用尺寸系统
const { currentConfig } = useSize({ global: true })

// 根据当前尺寸配置计算样式
const cardShadow = computed(() => {
  return currentConfig.value.shadow[props.shadow]
})

const cardBorderRadius = computed(() => {
  return currentConfig.value.borderRadius.lg
})
</script>

<template>
  <div class="custom-card">
    <div v-if="title || $slots.header" class="custom-card__header">
      <slot name="header">
        <h3 class="custom-card__title">
          {{ title }}
        </h3>
      </slot>
    </div>

    <div class="custom-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="custom-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.custom-card {
  background: var(--ls-bg-primary, #ffffff);
  border-radius: v-bind(cardBorderRadius);
  overflow: hidden;
  transition: all 0.3s ease;
}

.custom-card {
  box-shadow: v-bind(cardShadow);
}

.custom-card[data-bordered='true'] {
  border: 1px solid var(--ls-border-light, #f0f0f0);
}

.custom-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ls-shadow-xl, 0 8px 24px rgba(0, 0, 0, 0.2));
}

.custom-card__header {
  padding: var(--ls-spacing-lg, 24px) var(--ls-spacing-lg, 24px) 0;
  border-bottom: 1px solid var(--ls-border-light, #f0f0f0);
  margin-bottom: var(--ls-spacing-base, 16px);
}

.custom-card__title {
  font-size: var(--ls-font-size-lg, 18px);
  font-weight: 600;
  color: var(--ls-text-primary, #333);
  margin: 0;
}

.custom-card__body {
  padding: var(--ls-spacing-lg, 24px);
  color: var(--ls-text-primary, #333);
  line-height: 1.6;
}

.custom-card__body :deep(p) {
  margin: 0 0 var(--ls-spacing-base, 16px);
  font-size: var(--ls-font-size-sm, 14px);
}

.custom-card__body :deep(p:last-child) {
  margin-bottom: 0;
}

.custom-card__footer {
  padding: 0 var(--ls-spacing-lg, 24px) var(--ls-spacing-lg, 24px);
  border-top: 1px solid var(--ls-border-light, #f0f0f0);
  margin-top: var(--ls-spacing-base, 16px);
  display: flex;
  gap: var(--ls-spacing-sm, 8px);
  align-items: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .custom-card__header,
  .custom-card__body,
  .custom-card__footer {
    padding-left: var(--ls-spacing-base, 16px);
    padding-right: var(--ls-spacing-base, 16px);
  }

  .custom-card__header {
    padding-bottom: 0;
  }

  .custom-card__footer {
    padding-top: 0;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
