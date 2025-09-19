/**
 * Button 组件类型定义
 */

import type {  ExtractPropTypes, PropType , VNode } from 'vue'

/**
 * 按钮类型
 */
export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * 按钮大小
 */
export type ButtonSize = 'small' | 'medium' | 'large'

/**
 * 按钮形状
 */
export type ButtonShape = 'rectangle' | 'round' | 'circle'

/**
 * 按钮变体
 */
export type ButtonVariant = 'base' | 'outline' | 'text' | 'ghost'

/**
 * 按钮主题
 */
export type ButtonTheme = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * 按钮 Props 定义
 */
export const buttonProps = {
  /**
   * 按钮类型
   * @default 'default'
   */
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },

  /**
   * 按钮大小
   * @default 'medium'
   */
  size: {
    type: String as PropType<ButtonSize>,
    default: 'medium'
  },

  /**
   * 按钮形状
   * @default 'rectangle'
   */
  shape: {
    type: String as PropType<ButtonShape>,
    default: 'rectangle'
  },

  /**
   * 按钮变体
   * @default 'base'
   */
  variant: {
    type: String as PropType<ButtonVariant>,
    default: 'base'
  },

  /**
   * 按钮主题
   * @default 'default'
   */
  theme: {
    type: String as PropType<ButtonTheme>,
    default: 'default'
  },

  /**
   * 是否禁用
   * @default false
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * 是否加载中
   * @default false
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * 是否为块级元素
   * @default false
   */
  block: {
    type: Boolean,
    default: false
  },

  /**
   * 是否为幽灵按钮（透明背景）
   * @default false
   */
  ghost: {
    type: Boolean,
    default: false
  },

  /**
   * 图标名称或组件
   */
  icon: {
    type: [String, Object] as PropType<string | object>,
    default: undefined
  },

  /**
   * 图标位置
   * @default 'left'
   */
  iconPosition: {
    type: String as PropType<'left' | 'right'>,
    default: 'left'
  },

  /**
   * 原生 button 的 type 属性
   * @default 'button'
   */
  nativeType: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button'
  },

  /**
   * 自定义标签名
   * @default 'button'
   */
  tag: {
    type: String,
    default: 'button'
  },

  /**
   * 链接地址（当 tag 为 'a' 时有效）
   */
  href: {
    type: String,
    default: undefined
  },

  /**
   * 链接目标（当 tag 为 'a' 时有效）
   */
  target: {
    type: String as PropType<'_self' | '_blank' | '_parent' | '_top'>,
    default: '_self'
  },

  /**
   * 自定义类名
   */
  class: {
    type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    default: undefined
  },

  /**
   * 自定义样式
   */
  style: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: undefined
  }
} as const

/**
 * Button 组件 Props 类型
 */
export type ButtonProps = ExtractPropTypes<typeof buttonProps>

/**
 * Button 组件 Emits 定义
 */
export const buttonEmits = {
  /**
   * 点击事件
   */
  click: (event: MouseEvent) => event instanceof MouseEvent,

  /**
   * 焦点事件
   */
  focus: (event: FocusEvent) => event instanceof FocusEvent,

  /**
   * 失焦事件
   */
  blur: (event: FocusEvent) => event instanceof FocusEvent,

  /**
   * 鼠标进入事件
   */
  mouseenter: (event: MouseEvent) => event instanceof MouseEvent,

  /**
   * 鼠标离开事件
   */
  mouseleave: (event: MouseEvent) => event instanceof MouseEvent
} as const

/**
 * Button 组件 Emits 类型
 */
export type ButtonEmits = typeof buttonEmits

/**
 * Button 组件插槽定义
 */
export interface ButtonSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]

  /**
   * 图标插槽
   */
  icon?: () => VNode | VNode[]

  /**
   * 前缀插槽
   */
  prefix?: () => VNode | VNode[]

  /**
   * 后缀插槽
   */
  suffix?: () => VNode | VNode[]
}

/**
 * Button 组件实例类型
 */
export interface ButtonInstance {
  /**
   * 按钮元素引用
   */
  $el: HTMLElement

  /**
   * 聚焦按钮
   */
  focus: () => void

  /**
   * 失焦按钮
   */
  blur: () => void
}

// 类型工具函数
export * from '../../types/utilities'
