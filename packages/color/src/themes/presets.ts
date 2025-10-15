/**
 * 预设主题配置
 */

export interface PresetTheme {
  name: string
  label: string
  color: string
  description?: string
  order?: number
  /** 是否为用户自定义主题 */
  custom?: boolean
}

export const presetThemes: PresetTheme[] = [
  // 品牌色
  {
    name: 'blue',
    label: '拂晓蓝',
    color: '#1890ff',
    description: '包容、科技、普惠',
    order: 1
  },
  {
    name: 'purple',
    label: '酱紫',
    color: '#722ed1',
    description: '优雅、创新、独特',
    order: 2
  },
  {
    name: 'cyan',
    label: '明青',
    color: '#13c2c2',
    description: '清新、效率、科技',
    order: 3
  },
  {
    name: 'green',
    label: '极光绿',
    color: '#52c41a',
    description: '生命、健康、希望',
    order: 4
  },
  {
    name: 'magenta',
    label: '法式洋红',
    color: '#eb2f96',
    description: '活力、激情、创意',
    order: 5
  },
  {
    name: 'red',
    label: '薄暮红',
    color: '#f5222d',
    description: '热情、力量、决心',
    order: 6
  },
  {
    name: 'orange',
    label: '日暮橙',
    color: '#fa8c16',
    description: '温暖、活泼、创造',
    order: 7
  },
  {
    name: 'yellow',
    label: '日出黄',
    color: '#fadb14',
    description: '阳光、希望、活力',
    order: 8
  },
  {
    name: 'volcano',
    label: '火山橙',
    color: '#fa541c',
    description: '激情、能量、热烈',
    order: 9
  },
  {
    name: 'geekblue',
    label: '极客蓝',
    color: '#2f54eb',
    description: '专业、科技、创新',
    order: 10
  },
  {
    name: 'lime',
    label: '青柠绿',
    color: '#a0d911',
    description: '自然、生机、清新',
    order: 11
  },
  {
    name: 'gold',
    label: '金盏花',
    color: '#faad14',
    description: '贵重、荣耀、财富',
    order: 12
  },
  // 中性色
  {
    name: 'gray',
    label: '中性灰',
    color: '#8c8c8c',
    description: '稳重、专业、平衡',
    order: 13
  },
  // 深色主题色
  {
    name: 'dark-blue',
    label: '深海蓝',
    color: '#1e3a8a',
    description: '深邃、神秘、专业',
    order: 14
  },
  {
    name: 'dark-green',
    label: '森林绿',
    color: '#166534',
    description: '自然、成熟、稳重',
    order: 15
  }
]

/**
 * 根据名称获取预设主题
 */
export function getPresetTheme(name: string): PresetTheme | undefined {
  return presetThemes.find(theme => theme.name === name)
}

/**
 * 获取预设主题的颜色值
 */
export function getPresetColor(name: string): string | undefined {
  return getPresetTheme(name)?.color
}

/**
 * 获取所有预设主题的名称列表
 */
export function getPresetNames(): string[] {
  return presetThemes.map(theme => theme.name)
}

/**
 * 获取预设主题分组
 */
export function getPresetGroups() {
  const brandColors = presetThemes.slice(0, 12)
  const neutralColors = presetThemes.slice(12, 13)
  const darkColors = presetThemes.slice(13)
  
  return {
    brand: brandColors,
    neutral: neutralColors,
    dark: darkColors
  }
}