<script setup lang="ts">
/**
 * 颜色主题提供者组件
 *
 * 这是一个高级组件，为子组件提供统一的主题管理上下文
 * 简化了主题管理的使用方式
 */

import type { ColorMode } from '../../core/types'
import type { UseColorThemeOptions } from '../composables/useColorTheme'
import { provide, watch } from 'vue'
import { useColorTheme } from '../composables/useColorTheme'

interface Props extends UseColorThemeOptions {
  /** 是否在主题变化时添加过渡动画 */
  enableTransition?: boolean
  /** 过渡动画持续时间（毫秒） */
  transitionDuration?: number
  /** 是否自动应用到 document.documentElement */
  autoApplyToDocument?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultTheme: 'default',
  defaultMode: 'light',
  autoSave: true,
  storageKey: 'ldesign-color-theme',
  enableSystemSync: false,
  customThemes: () => [],
  disabledBuiltinThemes: () => [],
  enableTransition: true,
  transitionDuration: 300,
  autoApplyToDocument: true,
})

const emit = defineEmits<{
  themeChange: [theme: string, mode: ColorMode]
  error: [error: Error]
}>()

// 使用颜色主题管理
const colorTheme = useColorTheme({
  defaultTheme: props.defaultTheme,
  defaultMode: props.defaultMode,
  autoSave: props.autoSave,
  storageKey: props.storageKey,
  enableSystemSync: props.enableSystemSync,
  customThemes: props.customThemes,
  disabledBuiltinThemes: props.disabledBuiltinThemes,
  onThemeChange: (theme, mode) => {
    emit('themeChange', theme, mode)
  },
  onError: (error) => {
    emit('error', error)
  },
})

// 提供给子组件
provide('colorTheme', colorTheme)

// 自动应用到 document
if (props.autoApplyToDocument && typeof document !== 'undefined') {
  const applyToDocument = () => {
    const { currentTheme, currentMode } = colorTheme

    // 设置 data 属性
    document.documentElement.setAttribute('data-theme', currentTheme.value)
    document.documentElement.setAttribute('data-mode', currentMode.value)

    // 设置 class
    document.documentElement.classList.toggle('dark', currentMode.value === 'dark')
    document.documentElement.classList.toggle('light', currentMode.value === 'light')

    // 添加过渡动画
    if (props.enableTransition) {
      document.documentElement.style.transition = `all ${props.transitionDuration}ms ease-in-out`

      // 动画完成后移除过渡
      setTimeout(() => {
        document.documentElement.style.transition = ''
      }, props.transitionDuration)
    }
  }

  // 监听主题变化
  watch([colorTheme.currentTheme, colorTheme.currentMode], applyToDocument, { immediate: true })
}

// 暴露给模板
defineExpose({
  ...colorTheme,
})
</script>

<template>
  <div class="color-theme-provider">
    <slot
      :current-theme="colorTheme.currentTheme.value"
      :current-mode="colorTheme.currentMode.value"
      :is-dark="colorTheme.isDark.value"
      :is-light="colorTheme.isLight.value"
      :available-themes="colorTheme.availableThemes.value"
      :system-theme="colorTheme.systemTheme.value"
      :is-syncing-system="colorTheme.isSyncingSystem.value"
      :set-theme="colorTheme.setTheme"
      :set-mode="colorTheme.setMode"
      :toggle-mode="colorTheme.toggleMode"
      :sync-with-system="colorTheme.syncWithSystem"
      :start-system-sync="colorTheme.startSystemSync"
      :stop-system-sync="colorTheme.stopSystemSync"
      :get-theme-config="colorTheme.getThemeConfig"
      :get-theme-display-name="colorTheme.getThemeDisplayName"
      :reset="colorTheme.reset"
    />
  </div>
</template>

<style scoped>
.color-theme-provider {
  /* 确保组件不影响布局 */
  display: contents;
}
</style>
