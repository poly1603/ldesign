<template>
  <div
    v-if="loading"
    ref="loadingRef"
    :class="loadingClasses"
    :style="style"
  >
    <!-- 遮罩层 -->
    <div
      v-if="overlay"
      class="ld-loading__overlay"
    />

    <!-- 加载内容 -->
    <div class="ld-loading__content">
      <!-- 加载图标 -->
      <div class="ld-loading__spinner">
        <div
          v-for="i in 12"
          :key="i"
          class="ld-loading__dot"
          :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
        />
      </div>

      <!-- 加载文本 -->
      <div
        v-if="text || $slots.default"
        class="ld-loading__text"
      >
        <slot>{{ text }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { loadingProps, loadingEmits } from './types'
import type { LoadingInstance } from './types'

/**
 * Loading 加载组件
 *
 * 用于页面和区块的加载中状态，支持自定义文本和遮罩层
 *
 * @example
 * ```vue
 * <template>
 *   <l-loading :loading="isLoading" text="加载中...">
 *     <div>页面内容</div>
 *   </l-loading>
 * </template>
 * ```
 */

// 组件名称
defineOptions({
  name: 'LLoading'
})

// Props 定义
const props = defineProps(loadingProps)

// Emits 定义
const emit = defineEmits(loadingEmits)

// 组件引用
const loadingRef = ref<HTMLElement>()

// 计算类名
const loadingClasses = computed(() => {
  const classes = [
    'ld-loading',
    `ld-loading--${props.size}`,
    {
      'ld-loading--overlay': props.overlay,
      'ld-loading--absolute': props.absolute
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
  $el: loadingRef
})
</script>

<style lang="less">
@import './loading.less';
</style>