/**
 * @file useThemeSelector 组合式函数
 * @description 主题选择器的组合式函数
 */

import { ref, computed, type Ref } from 'vue'
import { useTheme } from './useTheme'
import type { FestivalType } from '../../core/types'
import type { UseThemeSelectorReturn } from '../types'

/**
 * 使用主题选择器的组合式函数
 * 
 * @param themes 可选主题列表，如果不提供则使用所有可用主题
 * @returns 主题选择相关的响应式数据和方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useThemeSelector } from '@ldesign/theme/vue'
 * 
 * const {
 *   selectedTheme,
 *   selectableThemes,
 *   selectTheme,
 *   nextTheme,
 *   previousTheme
 * } = useThemeSelector(['spring-festival', 'christmas', 'halloween'])
 * </script>
 * ```
 */
export function useThemeSelector(themes?: FestivalType[]): UseThemeSelectorReturn {
  const { currentTheme, availableThemes, setTheme } = useTheme()

  // 可选主题列表
  const selectableThemes = computed(() => {
    return themes || availableThemes.value
  })

  // 选中的主题
  const selectedTheme = computed({
    get: () => currentTheme.value,
    set: (theme: FestivalType | null) => {
      if (theme) {
        selectTheme(theme)
      }
    }
  })

  // 选择主题
  const selectTheme = async (theme: FestivalType): Promise<void> => {
    if (selectableThemes.value.includes(theme)) {
      await setTheme(theme)
    } else {
      console.warn(`Theme "${theme}" is not in the selectable themes list`)
    }
  }

  // 下一个主题
  const nextTheme = async (): Promise<void> => {
    const themes = selectableThemes.value
    if (themes.length === 0) return

    const currentIndex = currentTheme.value ? themes.indexOf(currentTheme.value) : -1
    const nextIndex = (currentIndex + 1) % themes.length
    await selectTheme(themes[nextIndex])
  }

  // 上一个主题
  const previousTheme = async (): Promise<void> => {
    const themes = selectableThemes.value
    if (themes.length === 0) return

    const currentIndex = currentTheme.value ? themes.indexOf(currentTheme.value) : -1
    const previousIndex = currentIndex <= 0 ? themes.length - 1 : currentIndex - 1
    await selectTheme(themes[previousIndex])
  }

  return {
    selectedTheme,
    selectableThemes,
    selectTheme,
    nextTheme,
    previousTheme
  }
}
