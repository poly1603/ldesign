// 主题工具函数

import type { FormTheme } from '../types/theme'

/**
 * 预设主题
 */
const PRESET_THEMES: Record<string, FormTheme> = {
  light: {
    name: 'light',
    colors: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      text: '#262626',
      textSecondary: '#595959',
      border: '#d9d9d9',
      background: '#ffffff',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#177ddc',
      success: '#49aa19',
      warning: '#d89614',
      error: '#dc4446',
      text: '#ffffff',
      textSecondary: '#a6a6a6',
      border: '#434343',
      background: '#1f1f1f',
    },
  },
}

/**
 * 获取预设主题
 */
export function getPresetTheme(name: string): FormTheme | undefined {
  return PRESET_THEMES[name]
}

/**
 * 创建自定义主题
 */
export function createCustomTheme(theme: Partial<FormTheme>): FormTheme {
  const baseTheme = getPresetTheme('light') || PRESET_THEMES.light

  return {
    ...baseTheme,
    ...theme,
    colors: {
      ...baseTheme.colors,
      ...theme.colors,
    },
  }
}

/**
 * 应用主题
 */
export function applyTheme(theme: FormTheme, element?: HTMLElement): void {
  const target = element || document.documentElement

  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      target.style.setProperty(`--form-color-${key}`, value)
    })
  }
}
