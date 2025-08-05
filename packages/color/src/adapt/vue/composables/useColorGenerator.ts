/**
 * 颜色生成器组合式 API
 */

import type { ColorConfig, ThemeManagerInstance } from '../../../core/types'
import type { UseColorGeneratorReturn } from '../types'
import { ref } from 'vue'
import { createCustomTheme } from '../../../themes/presets'
import { generateColorConfig } from '../../../utils/color-generator'
import { useTheme } from './useTheme'

/**
 * 颜色生成器组合式 API
 * @param manager 可选的主题管理器实例
 * @returns 颜色生成相关的响应式状态和方法
 */
export function useColorGenerator(manager?: ThemeManagerInstance): UseColorGeneratorReturn {
  const { registerTheme } = useTheme(manager)

  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  const generateColors = async (primaryColor: string): Promise<ColorConfig> => {
    isGenerating.value = true
    error.value = null

    try {
      const colors = await generateColorConfig(primaryColor)
      return colors
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate colors'
      throw err
    }
    finally {
      isGenerating.value = false
    }
  }

  const generateColorScales = async (colors: ColorConfig): Promise<Record<string, string[]>> => {
    isGenerating.value = true
    error.value = null

    try {
      // 简单的色阶生成逻辑
      const scales: Record<string, string[]> = {}
      Object.entries(colors).forEach(([key, color]) => {
        if (typeof color === 'string') {
          scales[key] = [color] // 简化版本，实际应该生成色阶
        }
      })
      return scales
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate color scales'
      throw err
    }
    finally {
      isGenerating.value = false
    }
  }

  const previewColors = async (primaryColor: string): Promise<ColorConfig> => {
    // 预览不设置loading状态，因为这是临时操作
    try {
      const colors = await generateColorConfig(primaryColor)
      return colors
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to preview colors'
      throw err
    }
  }

  const applyGeneratedColors = async (
    colors: ColorConfig,
    themeName: string = 'custom',
  ): Promise<void> => {
    isGenerating.value = true
    error.value = null

    try {
      // 创建自定义主题
      const customTheme = createCustomTheme(themeName, colors.primary)

      // 注册主题
      registerTheme(customTheme)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to apply generated colors'
      throw err
    }
    finally {
      isGenerating.value = false
    }
  }

  return {
    generateColors,
    generateColorScales,
    previewColors,
    applyGeneratedColors,
    isGenerating,
    error,
  }
}
