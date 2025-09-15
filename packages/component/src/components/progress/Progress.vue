<template>
  <div
    ref="progressRef"
    :class="progressClasses"
    :style="style"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { progressProps, progressEmits } from './types'
import type { ProgressInstance } from './types'

/**
 * Progress 组件
 * 
 * TODO: 添加组件描述
 * 
 * @example
 * ```vue
 * <template>
 *   <l-progress>
 *     内容
 *   </l-progress>
 * </template>
 * ```
 */

// 组件名称
defineOptions({
  name: 'LProgress'
})

// Props 定义
const props = defineProps(progressProps)

// Emits 定义
const emit = defineEmits(progressEmits)

// 组件引用
const progressRef = ref<HTMLElement>()

// 计算类名
const progressClasses = computed(() => {
  const classes = [
    'ld-progress',
    `ld-progress--${props.size}`,
    {
      'ld-progress--disabled': props.disabled
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
defineExpose<ProgressInstance>({
  $el: progressRef
})
</script>

<style lang="less">
@import './progress.less';
</style>