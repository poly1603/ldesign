<template>
  <div
    ref="cardRef"
    :class="cardClasses"
    :style="style"
  >
    <!-- 卡片头部 -->
    <div
      v-if="$slots.header || title"
      class="ld-card__header"
    >
      <slot name="header">
        <div class="ld-card__title">{{ title }}</div>
        <div
          v-if="extra"
          class="ld-card__extra"
        >
          {{ extra }}
        </div>
      </slot>
    </div>

    <!-- 卡片内容 -->
    <div class="ld-card__body">
      <slot />
    </div>

    <!-- 卡片底部 -->
    <div
      v-if="$slots.footer"
      class="ld-card__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cardProps, cardEmits } from './types'
import type { CardInstance } from './types'

/**
 * Card 卡片组件
 *
 * 通用卡片容器，提供标题、内容、底部等区域，支持阴影、边框等样式
 *
 * @example
 * ```vue
 * <template>
 *   <l-card title="卡片标题" extra="额外内容">
 *     <p>卡片内容</p>
 *     <template #footer>
 *       <l-button>确定</l-button>
 *     </template>
 *   </l-card>
 * </template>
 * ```
 */

// 组件名称
defineOptions({
  name: 'LCard'
})

// Props 定义
const props = defineProps(cardProps)

// Emits 定义
const emit = defineEmits(cardEmits)

// 组件引用
const cardRef = ref<HTMLElement>()

// 计算类名
const cardClasses = computed(() => {
  const classes = [
    'ld-card',
    `ld-card--${props.size}`,
    {
      'ld-card--bordered': props.bordered,
      [`ld-card--shadow-${props.shadow}`]: true,
      'ld-card--hoverable': props.hoverable
    }
  ]

  // 添加自定义类名
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class)
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) {
          classes.push(key)
        }
      })
    }
  }

  return classes
})

// 暴露给父组件的方法和属性
defineExpose({
  $el: cardRef
})
</script>

<style lang="less">
@import './card.less';
</style>