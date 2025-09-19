<template>
  <button ref="buttonRef" :class="buttonClasses" :style="style" :type="nativeType" :disabled="isDisabled"
    @click="handleClick" @focus="handleFocus" @blur="handleBlur" @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave">
    <!-- 加载图标 -->
    <span v-if="loading" class="ld-button__loading">
      ⟳
    </span>

    <!-- 按钮内容 -->
    <span class="ld-button__content">
      <!-- 左侧图标 -->
      <span v-if="icon && iconPosition === 'left'" class="ld-button__icon ld-button__icon--left">
        <component v-if="typeof icon === 'object'" :is="icon" />
        <span v-else>{{ icon }}</span>
      </span>

      <!-- 文本内容 -->
      <slot />

      <!-- 右侧图标 -->
      <span v-if="icon && iconPosition === 'right'" class="ld-button__icon ld-button__icon--right">
        <component v-if="typeof icon === 'object'" :is="icon" />
        <span v-else>{{ icon }}</span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { buttonProps, buttonEmits } from './types'
import type { ButtonInstance } from './types'
import {
  useBreakpoints,
  useTouch,
  useKeyboardNavigation,
  useAccessibility,
  KEYBOARD_SHORTCUTS
} from '../../utils'

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

// 响应式断点支持
const { current: currentBreakpoint, isMobile, isTablet, isDesktop } = useBreakpoints()

// 触摸设备支持
const { on: onTouch, isTouchDevice } = useTouch(buttonRef, {
  enabled: true,
  preventDefault: false
})

// 键盘导航支持
const { registerShortcut } = useKeyboardNavigation(buttonRef, {
  autoFocus: false
})

// 无障碍访问支持
const { setAria, announce } = useAccessibility(buttonRef, {
  enabled: true,
  aria: {
    role: 'button'
  }
})



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
      'ld-button--ghost': props.ghost,
      // 设备相关类名
      'ld-button--mobile': isMobile.value,
      'ld-button--tablet': isTablet.value,
      'ld-button--desktop': isDesktop.value,
      'ld-button--touch': isTouchDevice.value,
      [`ld-button--${currentBreakpoint.value}`]: true
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

// 组件挂载时设置跨设备支持
onMounted(() => {
  // 设置 ARIA 属性
  setAria('disabled', isDisabled.value)
  setAria('pressed', false)

  // 设置触摸事件
  onTouch('tap', (event) => {
    if (!isDisabled.value) {
      handleClick(event.originalEvent as MouseEvent)
    }
  })

  onTouch('longPress', () => {
    if (!isDisabled.value) {
      announce('长按按钮', 'polite')
    }
  })

  // 设置键盘快捷键
  registerShortcut({
    key: KEYBOARD_SHORTCUTS.ENTER,
    handler: (event) => {
      if (!isDisabled.value) {
        handleClick(event as unknown as MouseEvent)
      }
    },
    description: '激活按钮'
  })

  registerShortcut({
    key: KEYBOARD_SHORTCUTS.SPACE,
    handler: (event) => {
      if (!isDisabled.value) {
        handleClick(event as unknown as MouseEvent)
      }
    },
    description: '激活按钮'
  })
})

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
