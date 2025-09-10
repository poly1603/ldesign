/**
 * @file useTheme 组合式函数
 * @description 主题管理的组合式函数
 */

import { ref, inject, onMounted, onUnmounted, type Ref } from 'vue'
import type { FestivalThemeManager } from '../../core/theme-manager'
import type { FestivalType, FestivalThemeConfig } from '../../core/types'
import type { UseThemeReturn } from '../types'

/**
 * 使用主题的组合式函数
 * 
 * @returns 主题管理相关的响应式数据和方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useTheme } from '@ldesign/theme/vue'
 * 
 * const {
 *   currentTheme,
 *   availableThemes,
 *   isInitialized,
 *   setTheme,
 *   getThemeConfig
 * } = useTheme()
 * 
 * // 切换到春节主题
 * await setTheme('spring-festival')
 * </script>
 * ```
 */
export function useTheme(): UseThemeReturn {
  // 注入主题管理器
  const themeManager = inject<FestivalThemeManager>('themeManager')
  
  if (!themeManager) {
    throw new Error('useTheme must be used within a theme provider or after installing the Vue theme plugin')
  }

  // 响应式状态
  const currentTheme = ref<FestivalType | null>(themeManager.currentTheme)
  const availableThemes = ref<FestivalType[]>(themeManager.availableThemes)
  const isInitialized = ref<boolean>(themeManager.isInitialized)
  const isTransitioning = ref<boolean>(themeManager.isTransitioning)

  // 事件监听器
  const handleThemeChange = (theme: FestivalType) => {
    currentTheme.value = theme
  }

  const handleInitialized = () => {
    isInitialized.value = true
    availableThemes.value = themeManager.availableThemes
  }

  const handleTransitionStart = () => {
    isTransitioning.value = true
  }

  const handleTransitionEnd = () => {
    isTransitioning.value = false
  }

  // 设置主题
  const setTheme = async (theme: FestivalType): Promise<void> => {
    await themeManager.setTheme(theme)
  }

  // 获取主题配置
  const getThemeConfig = (theme: FestivalType): FestivalThemeConfig | null => {
    return themeManager.getThemeConfig(theme)
  }

  // 添加主题
  const addTheme = (config: FestivalThemeConfig): void => {
    themeManager.addTheme(config)
    availableThemes.value = themeManager.availableThemes
  }

  // 移除主题
  const removeTheme = (theme: FestivalType): void => {
    themeManager.removeTheme(theme)
    availableThemes.value = themeManager.availableThemes
  }

  // 生命周期
  onMounted(() => {
    // 监听主题变化事件
    themeManager.on('theme-changed', handleThemeChange)
    themeManager.on('initialized', handleInitialized)
    themeManager.on('transition-start', handleTransitionStart)
    themeManager.on('transition-end', handleTransitionEnd)

    // 更新初始状态
    currentTheme.value = themeManager.currentTheme
    availableThemes.value = themeManager.availableThemes
    isInitialized.value = themeManager.isInitialized
    isTransitioning.value = themeManager.isTransitioning
  })

  onUnmounted(() => {
    // 移除事件监听器
    themeManager.off('theme-changed', handleThemeChange)
    themeManager.off('initialized', handleInitialized)
    themeManager.off('transition-start', handleTransitionStart)
    themeManager.off('transition-end', handleTransitionEnd)
  })

  return {
    currentTheme,
    availableThemes,
    isInitialized,
    isTransitioning,
    setTheme,
    getThemeConfig,
    addTheme,
    removeTheme
  }
}
