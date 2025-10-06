<script setup lang="ts">
/**
 * 简化的主题选择器组件
 *
 * 使用原生 HTML select 元素实现主题选择功能
 * 不依赖任何外部 UI 组件库
 */

import type { ThemeConfig } from '../../core/types'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { presetThemes } from '../../themes/presets'
import { useColorTheme } from '../composables/useColorTheme'

interface Props {
  /** 选择器大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示预览色块 */
  showPreview?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 占位文本 */
  placeholder?: string
  /** 自定义主题列表 */
  customThemes?: ThemeConfig[]
  /** 禁用的内置主题 */
  disabledBuiltinThemes?: string[]
  /** 自定义类名 */
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showPreview: true,
  disabled: false,
  placeholder: '选择主题',
  customThemes: () => [],
  disabledBuiltinThemes: () => [],
  customClass: '',
})

const emit = defineEmits<{
  themeChange: [theme: string, mode: 'light' | 'dark']
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

const { currentTheme, currentMode, setTheme } = colorTheme

// 本地状态
const selectedTheme = ref(currentTheme.value || '')

// 合并主题列表（内置主题 + 用户自定义主题）
const mergedThemes = computed(() => {
  // 过滤掉被禁用的内置主题
  const enabledBuiltinThemes = presetThemes.filter(
    theme => !props.disabledBuiltinThemes.includes(theme.name)
  )

  // 合并内置主题和用户自定义主题（自定义优先显示）
  return [...props.customThemes, ...enabledBuiltinThemes]
})

// 获取主题的主色调
function getThemeColor(theme: ThemeConfig): string {
  // 优先使用 colors 对象中的颜色
  if (theme.colors?.primary) {
    return theme.colors.primary
  }

  // 如果没有 colors 对象，使用 light/dark 模式下的 primary 颜色
  const modeColors = theme.light || theme.dark
  if (modeColors?.primary) {
    return modeColors.primary
  }

  // 默认颜色
  return '#1890ff'
}

// 处理主题变更
async function handleThemeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const themeName = target.value

  if (!themeName || props.disabled) {
    return
  }

  selectedTheme.value = themeName

  try {
    // setTheme 只接受一个参数（theme），不接受 mode 参数
    await setTheme(themeName)
    emit('themeChange', themeName, currentMode.value)
  }
  catch (error) {
    if (import.meta.env.DEV) {
      console.error('[SimpleThemeSelector] 主题切换失败:', error)
    }
  }
}

// 计算样式类
const selectorClass = computed(() => {
  const classes = ['simple-theme-selector']

  classes.push(`simple-theme-selector--${props.size}`)

  if (props.disabled) {
    classes.push('simple-theme-selector--disabled')
  }

  if (props.customClass) {
    classes.push(props.customClass)
  }

  return classes.join(' ')
})

// 监听外部主题变化
watch(currentTheme, (newTheme) => {
  if (newTheme && newTheme !== selectedTheme.value) {
    selectedTheme.value = newTheme
  }
})

// 初始化
onMounted(() => {
  if (currentTheme.value) {
    selectedTheme.value = currentTheme.value
  }
})
</script>

<template>
  <div :class="selectorClass">
    <select v-model="selectedTheme" :disabled="disabled" class="simple-theme-selector__select"
      @change="handleThemeChange">
      <option value="" disabled>
        {{ placeholder }}
      </option>
      <option v-for="theme in mergedThemes" :key="theme.name" :value="theme.name">
        {{ theme.displayName || theme.name }}
      </option>
    </select>
    <div v-if="showPreview && selectedTheme" class="simple-theme-selector__preview" :style="{
      backgroundColor: getThemeColor(
        mergedThemes.find(t => t.name === selectedTheme)!
      ),
    }" :title="`当前主题: ${selectedTheme}`" />
  </div>
</template>

<style scoped>
.simple-theme-selector {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.simple-theme-selector__select {
  flex: 1;
  border: 1px solid var(--color-border, #d9d9d9);
  background: var(--color-bg-container, #ffffff);
  color: var(--color-text, #000000);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.simple-theme-selector__select:hover:not(:disabled) {
  border-color: var(--color-primary, #1677ff);
}

.simple-theme-selector__select:focus {
  border-color: var(--color-primary, #1677ff);
  box-shadow: 0 0 0 2px var(--color-primary-bg, rgba(22, 119, 255, 0.2));
}

.simple-theme-selector__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-bg-disabled, #f5f5f5);
}

/* 尺寸变体 */
.simple-theme-selector--small .simple-theme-selector__select {
  padding: 0.25rem 2.5rem 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}

.simple-theme-selector--medium .simple-theme-selector__select {
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.375rem;
}

.simple-theme-selector--large .simple-theme-selector__select {
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
}

/* 预览色块 */
.simple-theme-selector__preview {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--color-border, #d9d9d9);
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;
}

.simple-theme-selector--small .simple-theme-selector__preview {
  width: 1.25rem;
  height: 1.25rem;
}

.simple-theme-selector--large .simple-theme-selector__preview {
  width: 1.75rem;
  height: 1.75rem;
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .simple-theme-selector__select {
    background-color: var(--color-bg-container-dark, #1f1f1f);
    color: var(--color-text-dark, #ffffff);
    border-color: var(--color-border-dark, #424242);
  }

  .simple-theme-selector__select:disabled {
    background-color: var(--color-bg-disabled-dark, #2a2a2a);
  }
}
</style>
