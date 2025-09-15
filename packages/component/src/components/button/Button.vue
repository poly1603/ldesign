<template>
  <button
    ref="buttonRef"
    :class="buttonClasses"
    :style="style"
    :type="nativeType"
    :disabled="isDisabled"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <!-- 加载图标 -->
    <span
      v-if="loading"
      class="ld-button__loading"
    >
      ⟳
    </span>

    <!-- 按钮内容 -->
    <span class="ld-button__content">
      <!-- 左侧图标 -->
      <span
        v-if="icon && iconPosition === 'left'"
        class="ld-button__icon ld-button__icon--left"
      >
        <component
          v-if="typeof icon === 'object'"
          :is="icon"
        />
        <span v-else>{{ icon }}</span>
      </span>

      <!-- 文本内容 -->
      <slot />

      <!-- 右侧图标 -->
      <span
        v-if="icon && iconPosition === 'right'"
        class="ld-button__icon ld-button__icon--right"
      >
        <component
          v-if="typeof icon === 'object'"
          :is="icon"
        />
        <span v-else>{{ icon }}</span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { buttonProps, buttonEmits } from './types'
import type { ButtonInstance } from './types'

/**
 * Button 组件
 * 
 * 基础的按钮组件，支持多种类型、大小、形状和状态
 * 
 * @example
 * ```vue
 * <template>
 *   <l-button type="primary" @click="handleClick">
 *     点击我
 *   </l-button>
 * </template>
 * ```
 */

// 组件名称
defineOptions({
  name: 'LButton'
})

// Props 定义
const props = defineProps(buttonProps)

// Emits 定义
const emit = defineEmits(buttonEmits)

// 按钮元素引用
const buttonRef = ref<HTMLElement>()



// 计算是否禁用
const isDisabled = computed(() => {
  return props.disabled || props.loading
})

// 计算按钮类名
const buttonClasses = computed(() => {
  const classes = [
    'ld-button',
    `ld-button--${props.type}`,
    `ld-button--${props.size}`,
    `ld-button--${props.shape}`,
    {
      [`ld-button--${props.variant}`]: props.variant !== 'base',
      'ld-button--disabled': isDisabled.value,
      'ld-button--loading': props.loading,
      'ld-button--block': props.block,
      'ld-button--ghost': props.ghost
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

// 事件处理函数
const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleMouseenter = (event: MouseEvent) => {
  emit('mouseenter', event)
}

const handleMouseleave = (event: MouseEvent) => {
  emit('mouseleave', event)
}

// 暴露组件实例方法
const focus = () => {
  buttonRef.value?.focus()
}

const blur = () => {
  buttonRef.value?.blur()
}

// 暴露给父组件的方法和属性
defineExpose({
  $el: buttonRef,
  focus,
  blur
})
</script>

<style lang="less">
@import './button.less';
</style>
