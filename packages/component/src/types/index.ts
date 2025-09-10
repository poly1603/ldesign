/**
 * 组件库通用类型定义
 * 
 * 定义组件库中所有组件共用的基础类型和接口
 */

import type { App, Component } from 'vue'

/**
 * 组件大小枚举
 */
export type ComponentSize = 'small' | 'medium' | 'large'

/**
 * 组件状态枚举
 */
export type ComponentStatus = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * 组件主题枚举
 */
export type ComponentTheme = 'light' | 'dark'

/**
 * 基础组件属性接口
 */
export interface BaseComponentProps {
  /** 组件大小 */
  size?: ComponentSize
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  class?: string
  /** 自定义样式 */
  style?: string | Record<string, any>
}

/**
 * 可安装的组件接口
 */
export interface InstallableComponent extends Component {
  install: (app: App) => void
}

/**
 * 组件库配置接口
 */
export interface ComponentLibraryConfig {
  /** 组件名称前缀 */
  prefix?: string
  /** 默认组件大小 */
  size?: ComponentSize
  /** 默认主题 */
  theme?: ComponentTheme
  /** 是否启用全局样式 */
  globalStyles?: boolean
}

/**
 * 事件处理器类型
 */
export type EventHandler<T = Event> = (event: T) => void

/**
 * 异步事件处理器类型
 */
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>

/**
 * 组件插槽类型
 */
export interface ComponentSlots {
  default?: () => any
  [key: string]: ((...args: any[]) => any) | undefined
}

/**
 * 表单验证规则接口
 */
export interface ValidationRule {
  /** 是否必填 */
  required?: boolean
  /** 最小长度 */
  min?: number
  /** 最大长度 */
  max?: number
  /** 正则表达式 */
  pattern?: RegExp
  /** 自定义验证函数 */
  validator?: (value: any) => boolean | string
  /** 错误提示信息 */
  message?: string
}

/**
 * 表单验证结果接口
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误信息 */
  message?: string
}

/**
 * 位置枚举
 */
export type Placement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'

/**
 * 触发方式枚举
 */
export type Trigger = 'hover' | 'click' | 'focus' | 'manual'

/**
 * 动画类型枚举
 */
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'bounce'

/**
 * 响应式断点枚举
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

/**
 * 响应式配置接口
 */
export interface ResponsiveConfig {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  xxl?: number
}

// 导出所有组件特定的类型（将在组件开发时添加）
// export * from './button'
// export * from './input'
// export * from './card'
// export * from './loading'
// export * from './select'
// export * from './form'
// export * from './modal'
// export * from './table'
