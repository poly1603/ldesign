/**
 * 主题切换组件类型定义
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { ExtractPropTypes, PropType, Component, VNode } from 'vue'
import type { ThemeType } from '../../utils/theme'

/**
 * 主题切换组件尺寸
 */
export type ThemeToggleSize = 'small' | 'medium' | 'large'

/**
 * ThemeToggle Props 定义
 */
export const themeToggleProps = {
  /** 组件尺寸 */
  size: {
    type: String as PropType<ThemeToggleSize>,
    default: 'medium'
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 是否显示文字标签 */
  showLabel: {
    type: Boolean,
    default: false
  },
  /** 自定义图标映射 */
  icons: {
    type: Object as PropType<Partial<Record<Exclude<ThemeType, 'auto'>, string | Component>>>,
    default: undefined
  },
  /** 自定义标签映射 */
  labels: {
    type: Object as PropType<Partial<Record<Exclude<ThemeType, 'auto'>, string>>>,
    default: undefined
  },
  /** 切换模式：toggle（在light/dark间切换）或cycle（循环所有主题） */
  mode: {
    type: String as PropType<'toggle' | 'cycle'>,
    default: 'toggle'
  },
  /** 可用的主题列表（cycle模式下使用） */
  themes: {
    type: Array as PropType<Array<Exclude<ThemeType, 'auto'>>>,
    default: () => ['light', 'dark', 'high-contrast']
  },
  /** 自定义类名 */
  class: {
    type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    default: undefined
  },
  /** 自定义样式 */
  style: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: undefined
  }
} as const

/**
 * ThemeToggle Emits 定义
 */
export const themeToggleEmits = {
  /** 主题变更事件 */
  change: (theme: ThemeType, previousTheme: ThemeType) => typeof theme === 'string' && typeof previousTheme === 'string',
  /** 点击事件 */
  click: (event: MouseEvent) => event instanceof MouseEvent
} as const

/**
 * 主题切换组件实例
 */
export interface ThemeToggleInstance {
  /** 当前主题 */
  readonly currentTheme: Exclude<ThemeType, 'auto'>
  /** 切换到下一个主题 */
  toggle(): void
  /** 切换到指定主题 */
  setTheme(theme: ThemeType): void
}

/**
 * 主题图标配置
 */
export interface ThemeIconConfig {
  /** 亮色主题图标 */
  light: string | Component
  /** 暗色主题图标 */
  dark: string | Component
  /** 高对比度主题图标 */
  'high-contrast': string | Component
}

/**
 * 主题标签配置
 */
export interface ThemeLabelConfig {
  /** 亮色主题标签 */
  light: string
  /** 暗色主题标签 */
  dark: string
  /** 高对比度主题标签 */
  'high-contrast': string
}

/**
 * 主题切换组件配置
 */
export interface ThemeToggleConfig {
  /** 默认尺寸 */
  defaultSize?: ThemeToggleSize
  /** 默认图标配置 */
  defaultIcons?: Partial<ThemeIconConfig>
  /** 默认标签配置 */
  defaultLabels?: Partial<ThemeLabelConfig>
  /** 是否启用动画 */
  enableAnimation?: boolean
  /** 是否启用键盘导航 */
  enableKeyboard?: boolean
}


/**
 * ThemeToggle Props 类型
 */
export type ThemeToggleProps = ExtractPropTypes<typeof themeToggleProps>

/**
 * ThemeToggle Emits 类型
 */
export type ThemeToggleEmits = typeof themeToggleEmits

/**
 * ThemeToggle 插槽定义
 */
export interface ThemeToggleSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * ThemeToggle 实例类型
 */
export interface ThemeToggleInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement

  /** 当前主题 */
  readonly currentTheme: Exclude<ThemeType, 'auto'>

  /** 切换到下一个主题 */
  toggle(): void

  /** 切换到指定主题 */
  setTheme(theme: ThemeType): void
}
// 类型工具函数
export * from '../../types/utilities'
