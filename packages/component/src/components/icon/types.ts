/**
 * Icon 组件类型定义
 */

import type { Component } from 'vue'

/**
 * 图标尺寸类型
 */
export type IconSize = 'small' | 'medium' | 'large'

/**
 * Icon 组件属性接口
 */
export interface IconProps {
  /**
   * 图标名称或内容
   * 可以是 emoji、Unicode 字符、SVG 字符串或组件
   */
  name?: string | Component

  /**
   * 图标尺寸
   * @default 'medium'
   */
  size?: IconSize | number

  /**
   * 图标颜色
   */
  color?: string

  /**
   * 是否旋转动画
   * @default false
   */
  spin?: boolean

  /**
   * 旋转角度（度）
   */
  rotate?: number

  /**
   * 自定义类名
   */
  class?: string

  /**
   * 自定义样式
   */
  style?: string | Record<string, any>
}

/**
 * Icon 组件事件接口
 */
export interface IconEmits {
  /**
   * 点击事件
   */
  click: [event: MouseEvent]
}

/**
 * Icon 组件实例接口
 */
export interface IconInstance {
  /**
   * 获取图标元素
   */
  getElement: () => HTMLElement | null
}
