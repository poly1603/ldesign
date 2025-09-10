<template>
  <div class="theme-provider ldesign-theme-provider">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @file ThemeProvider 组件
 * @description 主题提供者组件，为子组件提供主题上下文
 */

import { provide, onMounted, watch } from 'vue'
import type { ThemeProviderProps } from '../types'
import { FestivalThemeManager } from '../../core/theme-manager'
import { allThemes } from '../../themes'

// 组件属性
const props = withDefaults(defineProps<ThemeProviderProps>(), {
  themes: () => allThemes,
  autoActivate: true,
  enableCache: true,
  cacheKey: 'ldesign-theme'
})

// 创建主题管理器
const themeManager = new FestivalThemeManager({
  themes: props.themes,
  enableCache: props.enableCache,
  cacheKey: props.cacheKey
})

// 提供主题管理器给子组件
provide('themeManager', themeManager)
provide('themeContext', {
  themeManager,
  currentTheme: props.theme,
  themes: props.themes
})

// 监听主题变化
watch(() => props.theme, async (newTheme) => {
  if (newTheme && themeManager.isInitialized) {
    await themeManager.setTheme(newTheme)
  }
}, { immediate: true })

// 组件挂载时初始化
onMounted(async () => {
  await themeManager.init()
  
  if (props.autoActivate && props.theme) {
    await themeManager.setTheme(props.theme)
  }
})
</script>

<style scoped>
.ldesign-theme-provider {
  width: 100%;
  height: 100%;
}
</style>
