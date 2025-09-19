/**
 * Icon 组件类型定义
 */

import type { ExtractPropTypes, PropType, Component, VNode } from 'vue'

/**
 * 图标尺寸类型
 */
export type IconSize = 'small' | 'medium' | 'large'

/**
 * Icon Props 定义
 */
export const iconProps = {
  /**
   * 图标名称或内容
   * 可以是 emoji、Unicode 字符、SVG 字符串或组件
   */
  name: {
    type: [String, Object] as PropType<string | Component>,
    default: undefined
  },

  /**
   * 图标尺寸
   * @default 'medium'
   */
  size: {
    type: [String, Number] as PropType<IconSize | number>,
    default: 'medium'
  },

  /**
   * 图标颜色
   */
  color: {
    type: String,
    default: undefined
  },

  /**
   * 是否旋转动画
   * @default false
   */
  spin: {
    type: Boolean,
    default: false
  },

  /**
   * 旋转角度（度）
   */
  rotate: {
    type: Number,
    default: 0
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
 * Icon Emits 定义
 */
export const iconEmits = {
  /**
   * 点击事件
   */
  click: (event: MouseEvent) => event instanceof MouseEvent
} as const

/**
 * Icon 组件实例接口
 */

/**
 * Icon Props 类型
 */
export interface IconProps {
  name?: string
  size?: IconSize
  color?: string
  spin?: boolean
  class?: string | string[] | Record<string, boolean>
  style?: string | Record<string, string>
  id?: string
  'data-testid'?: string
}

/**
 * Icon Emits 类型
 */
export interface IconEmits {
  click: (event: MouseEvent) => void
}

/**
 * Icon 插槽定义
 */
export interface IconSlots {
  /**
   * 默认插槽
   */
  default?: () => VNode | VNode[]
}

/**
 * Icon 实例类型
 */
export interface IconInstance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}
// 类型工具函数
export * from '../../types/utilities'
