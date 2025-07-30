/**
 * 预设主题配置
 */

import type { ThemeConfig } from '../core/types'

/**
 * 海洋蓝主题 - 专业稳重
 */
export const defaultTheme: ThemeConfig = {
  name: 'default',
  displayName: '海洋蓝',
  description: '深邃如海洋的蓝色，专业稳重，适合商务和企业应用',
  builtin: true,
  light: {
    primary: '#1677ff', // 更现代的蓝色
  },
  dark: {
    primary: '#4096ff',
  },
}

/**
 * 翡翠绿主题 - 自然清新
 */
export const greenTheme: ThemeConfig = {
  name: 'green',
  displayName: '翡翠绿',
  description: '如翡翠般温润的绿色，象征生机与成长，带来清新自然的感受',
  builtin: true,
  light: {
    primary: '#00b96b', // 更现代的绿色
  },
  dark: {
    primary: '#52c41a',
  },
}

/**
 * 紫罗兰主题 - 优雅神秘
 */
export const purpleTheme: ThemeConfig = {
  name: 'purple',
  displayName: '紫罗兰',
  description: '神秘优雅的紫色，展现创意与想象力，适合设计和艺术类应用',
  builtin: true,
  light: {
    primary: '#722ed1', // 保持经典紫色
  },
  dark: {
    primary: '#9254de',
  },
}

/**
 * 珊瑚红主题 - 温暖活力
 */
export const redTheme: ThemeConfig = {
  name: 'red',
  displayName: '珊瑚红',
  description: '温暖如珊瑚的红色，充满活力与激情，传递积极向上的能量',
  builtin: true,
  light: {
    primary: '#ff4d4f', // 更温暖的红色
  },
  dark: {
    primary: '#ff7875',
  },
}

/**
 * 日落橙主题 - 温暖治愈
 */
export const orangeTheme: ThemeConfig = {
  name: 'orange',
  displayName: '日落橙',
  description: '如日落般温暖的橙色，治愈人心，营造舒适温馨的氛围',
  builtin: true,
  light: {
    primary: '#fa8c16', // 保持经典橙色
  },
  dark: {
    primary: '#ffa940',
  },
}

/**
 * 天空青主题 - 清澈宁静
 */
export const cyanTheme: ThemeConfig = {
  name: 'cyan',
  displayName: '天空青',
  description: '清澈如天空的青色，宁静致远，带来内心的平和与专注',
  builtin: true,
  light: {
    primary: '#13c2c2', // 保持经典青色
  },
  dark: {
    primary: '#36cfc9',
  },
}

/**
 * 樱花粉主题 - 浪漫温柔
 */
export const pinkTheme: ThemeConfig = {
  name: 'pink',
  displayName: '樱花粉',
  description: '浪漫如樱花的粉色，温柔细腻，展现优雅的女性魅力',
  builtin: true,
  light: {
    primary: '#eb2f96', // 保持经典粉色
  },
  dark: {
    primary: '#f759ab',
  },
}

/**
 * 金盏花主题 - 明亮活泼
 */
export const yellowTheme: ThemeConfig = {
  name: 'yellow',
  displayName: '金盏花',
  description: '明亮如金盏花的黄色，充满阳光般的活力与希望',
  builtin: true,
  light: {
    primary: '#faad14', // 稍微调整黄色
  },
  dark: {
    primary: '#ffc53d',
  },
}

/**
 * 午夜蓝主题 - 深邃专业
 */
export const darkTheme: ThemeConfig = {
  name: 'dark',
  displayName: '午夜蓝',
  description: '深邃如午夜的蓝色，专业而神秘，完美适配深色模式界面',
  builtin: true,
  light: {
    primary: '#1d39c4', // 更深的蓝色
  },
  dark: {
    primary: '#4096ff',
  },
}

/**
 * 石墨灰主题 - 简约现代
 */
export const minimalTheme: ThemeConfig = {
  name: 'minimal',
  displayName: '石墨灰',
  description: '如石墨般纯净的灰色，极简现代，让内容成为真正的主角',
  builtin: true,
  light: {
    primary: '#595959', // 保持经典灰色
  },
  dark: {
    primary: '#8c8c8c',
  },
}

/**
 * 薰衣草主题 - 宁静舒缓
 */
export const lavenderTheme: ThemeConfig = {
  name: 'lavender',
  displayName: '薰衣草',
  description: '宁静如薰衣草的淡紫色，舒缓心灵，营造放松的工作环境',
  builtin: true,
  light: {
    primary: '#9254de',
  },
  dark: {
    primary: '#b37feb',
  },
}

/**
 * 森林绿主题 - 自然沉稳
 */
export const forestTheme: ThemeConfig = {
  name: 'forest',
  displayName: '森林绿',
  description: '深沉如森林的绿色，自然沉稳，象征成长与稳定',
  builtin: true,
  light: {
    primary: '#389e0d',
  },
  dark: {
    primary: '#73d13d',
  },
}

/**
 * 所有预设主题
 */
export const presetThemes: ThemeConfig[] = [
  defaultTheme,
  greenTheme,
  purpleTheme,
  redTheme,
  orangeTheme,
  cyanTheme,
  pinkTheme,
  yellowTheme,
  darkTheme,
  minimalTheme,
  lavenderTheme,
  forestTheme,
]

/**
 * 按名称获取预设主题
 */
export function getPresetTheme(name: string): ThemeConfig | undefined {
  return presetThemes.find(theme => theme.name === name)
}

/**
 * 获取所有预设主题名称
 */
export function getPresetThemeNames(): string[] {
  return presetThemes.map(theme => theme.name)
}

/**
 * 检查是否为预设主题
 */
export function isPresetTheme(name: string): boolean {
  return presetThemes.some(theme => theme.name === name)
}

/**
 * 创建自定义主题配置
 */
export function createCustomTheme(
  name: string,
  primaryColor: string,
  options?: {
    displayName?: string
    description?: string
    darkPrimaryColor?: string
  },
): ThemeConfig {
  return {
    name,
    displayName: options?.displayName || name,
    description: options?.description || `自定义主题：${name}`,
    builtin: false,
    light: {
      primary: primaryColor,
    },
    dark: {
      primary: options?.darkPrimaryColor || primaryColor,
    },
  }
}

/**
 * 主题分类
 */
export const themeCategories = {
  /** 基础主题 */
  basic: [defaultTheme, darkTheme, minimalTheme],
  /** 彩色主题 */
  colorful: [greenTheme, forestTheme, purpleTheme, lavenderTheme, redTheme, orangeTheme, cyanTheme, pinkTheme, yellowTheme],
  /** 所有主题 */
  all: presetThemes,
} as const

/**
 * 按分类获取主题
 */
export function getThemesByCategory(category: keyof typeof themeCategories): ThemeConfig[] {
  return [...(themeCategories[category] || [])]
}

/**
 * 主题标签
 */
export const themeTags = {
  professional: [defaultTheme, minimalTheme, darkTheme, forestTheme],
  vibrant: [redTheme, orangeTheme, pinkTheme, yellowTheme],
  calm: [greenTheme, cyanTheme, purpleTheme, lavenderTheme],
  modern: [defaultTheme, darkTheme, purpleTheme, lavenderTheme],
  classic: [defaultTheme, greenTheme, redTheme, forestTheme],
  natural: [greenTheme, forestTheme, cyanTheme],
  elegant: [purpleTheme, lavenderTheme, pinkTheme, minimalTheme],
} as const

/**
 * 按标签获取主题
 */
export function getThemesByTag(tag: keyof typeof themeTags): ThemeConfig[] {
  return [...(themeTags[tag] || [])]
}

/**
 * 随机获取一个预设主题
 */
export function getRandomPresetTheme(): ThemeConfig {
  const randomIndex = Math.floor(Math.random() * presetThemes.length)
  return presetThemes[randomIndex]
}

/**
 * 根据颜色偏好推荐主题
 */
export function recommendThemes(preferences: {
  brightness?: 'light' | 'dark' | 'auto'
  style?: 'professional' | 'vibrant' | 'calm' | 'modern' | 'classic'
  excludeColors?: string[]
}): ThemeConfig[] {
  let candidates = presetThemes

  // 根据风格筛选
  if (preferences.style && themeTags[preferences.style]) {
    candidates = [...themeTags[preferences.style]]
  }

  // 排除指定颜色
  if (preferences.excludeColors && preferences.excludeColors.length > 0) {
    candidates = candidates.filter(theme =>
      !preferences.excludeColors!.some(color =>
        theme.name.toLowerCase().includes(color.toLowerCase()),
      ),
    )
  }

  return candidates
}
