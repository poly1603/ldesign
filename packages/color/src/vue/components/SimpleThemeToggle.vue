<script setup lang="ts">
/**
 * 简化的主题切换按钮组件
 *
 * 提供最简单的明暗模式切换功能
 */

import type { ColorMode } from '../../core/types'
import { computed, inject } from 'vue'
import { useColorTheme } from '../composables/useColorTheme'

interface Props {
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示文本 */
  showText?: boolean
  /** 亮色模式文本 */
  lightText?: string
  /** 暗色模式文本 */
  darkText?: string
  /** 亮色模式图标 */
  lightIcon?: string
  /** 暗色模式图标 */
  darkIcon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 是否使用圆形按钮 */
  round?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showText: false,
  lightText: '亮色',
  darkText: '暗色',
  lightIcon: '☀️',
  darkIcon: '🌙',
  disabled: false,
  customClass: '',
  round: false,
})

const emit = defineEmits<{
  beforeToggle: [newMode: ColorMode]
  afterToggle: [newMode: ColorMode]
}>()

// 尝试从上下文获取主题管理
const contextColorTheme = inject<ReturnType<typeof useColorTheme>>('colorTheme', null)

// 如果没有上下文，创建自己的实例
const colorTheme
  = contextColorTheme
    || useColorTheme({
      autoSave: true,
      enableSystemSync: false,
    })

const { currentMode, isDark, toggleMode } = colorTheme

// 处理切换
async function handleToggle() {
  if (props.disabled)
    return

  const newMode = isDark.value ? 'light' : 'dark'

  emit('beforeToggle', newMode)

  try {
    await toggleMode()
    emit('afterToggle', newMode)
  }
  catch (error) {
    if (import.meta.env.DEV) {
      console.error('[SimpleThemeToggle] 切换失败:', error)
    }
  }
}

// 计算样式类
const buttonClass = computed(() => {
  const classes = ['simple-theme-toggle']

  classes.push(`simple-theme-toggle--${props.size}`)

  if (props.round) {
    classes.push('simple-theme-toggle--round')
  }

  if (props.disabled) {
    classes.push('simple-theme-toggle--disabled')
  }

  if (isDark.value) {
    classes.push('simple-theme-toggle--dark')
  }
  else {
    classes.push('simple-theme-toggle--light')
  }

  if (props.customClass) {
    classes.push(props.customClass)
  }

  return classes.join(' ')
})

// 当前显示的图标和文本
const currentIcon = computed(() => (isDark.value ? props.lightIcon : props.darkIcon))
const currentText = computed(() => (isDark.value ? props.lightText : props.darkText))
const currentTitle = computed(() => `切换到${isDark.value ? '亮色' : '暗色'}模式`)
</script>

<template>
  <button :class="buttonClass" :disabled="disabled" :title="currentTitle" @click="handleToggle">
    <span class="simple-theme-toggle__icon">{{ currentIcon }}</span>
    <span v-if="showText" class="simple-theme-toggle__text">{{ currentText }}</span>
  </button>
</template>

<style scoped>
.simple-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid var(--color-border, #d9d9d9);
  background: var(--color-bg-container, #ffffff);
  color: var(--color-text, #000000);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
  font-size: inherit;
  line-height: 1;
  outline: none;
}

.simple-theme-toggle:hover:not(.simple-theme-toggle--disabled) {
  border-color: var(--color-primary, #1677ff);
  color: var(--color-primary, #1677ff);
}

.simple-theme-toggle:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary-bg, rgba(22, 119, 255, 0.2));
}

.simple-theme-toggle:active:not(.simple-theme-toggle--disabled) {
  transform: translateY(1px);
}

/* 尺寸变体 */
.simple-theme-toggle--small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}

.simple-theme-toggle--medium {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.375rem;
}

.simple-theme-toggle--large {
  padding: 0.75rem 1rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
}

/* 圆形变体 */
.simple-theme-toggle--round.simple-theme-toggle--small {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 50%;
}

.simple-theme-toggle--round.simple-theme-toggle--medium {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 50%;
}

.simple-theme-toggle--round.simple-theme-toggle--large {
  width: 3rem;
  height: 3rem;
  padding: 0;
  border-radius: 50%;
}

/* 禁用状态 */
.simple-theme-toggle--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 主题状态 */
.simple-theme-toggle--dark {
  background: var(--color-bg-container-dark, #1f1f1f);
  color: var(--color-text-dark, #ffffff);
  border-color: var(--color-border-dark, #424242);
}

.simple-theme-toggle--light {
  background: var(--color-bg-container-light, #ffffff);
  color: var(--color-text-light, #000000);
  border-color: var(--color-border-light, #d9d9d9);
}

/* 图标和文本 */
.simple-theme-toggle__icon {
  display: inline-block;
  line-height: 1;
}

.simple-theme-toggle__text {
  font-weight: 500;
}

/* 圆形按钮隐藏文本 */
.simple-theme-toggle--round .simple-theme-toggle__text {
  display: none;
}
</style>
