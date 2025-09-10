/**
 * @file useThemeToggle 组合式函数
 * @description 主题切换的组合式函数
 */

import { computed } from 'vue'
import { useTheme } from './useTheme'
import type { FestivalType } from '../../core/types'
import type { UseThemeToggleReturn } from '../types'

/**
 * 使用主题切换的组合式函数
 * 
 * @param themes 要在其中切换的主题列表，默认为所有可用主题
 * @returns 主题切换相关的响应式数据和方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useThemeToggle } from '@ldesign/theme/vue'
 * 
 * const { currentTheme, toggleTheme, canToggle } = useThemeToggle()
 * 
 * // 切换主题
 * const handleToggle = () => {
 *   if (canToggle.value) {
 *     toggleTheme()
 *   }
 * }
 * </script>
 * 
 * <template>
 *   <button @click="handleToggle" :disabled="!canToggle">
 *     当前主题: {{ currentTheme }}
 *   </button>
 * </template>
 * ```
 */
export function useThemeToggle(themes?: FestivalType[]): UseThemeToggleReturn {
  const { currentTheme, availableThemes, setTheme } = useTheme()

  // 可切换的主题列表
  const toggleableThemes = computed(() => {
    return themes || availableThemes.value
  })

  // 是否可以切换
  const canToggle = computed(() => {
    return toggleableThemes.value.length > 1
  })

  // 切换主题
  const toggleTheme = async (): Promise<void> => {
    const themes = toggleableThemes.value
    if (themes.length <= 1) {
      console.warn('Cannot toggle theme: less than 2 themes available')
      return
    }

    const currentIndex = currentTheme.value ? themes.indexOf(currentTheme.value) : -1
    const nextIndex = (currentIndex + 1) % themes.length
    await setTheme(themes[nextIndex])
  }

  return {
    currentTheme,
    toggleTheme,
    canToggle
  }
}
