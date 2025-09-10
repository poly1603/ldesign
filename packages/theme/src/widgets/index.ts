/**
 * @file 挂件工厂函数
 * @description 提供创建各种类型挂件的工厂函数
 */

import type { WidgetConfig, WidgetPosition, WidgetStyle, AnimationConfig } from '../core/types'
import { WidgetType } from '../core/types'

/**
 * 挂件创建选项
 */
export interface WidgetFactoryOptions {
  /** 位置配置 */
  position?: WidgetPosition
  /** 样式配置 */
  style?: WidgetStyle
  /** 动画配置 */
  animation?: AnimationConfig
  /** 是否可交互 */
  interactive?: boolean
  /** 是否响应式 */
  responsive?: boolean
  /** 是否可见 */
  visible?: boolean
  /** 自定义属性 */
  customProps?: Record<string, any>
}

/**
 * 创建按钮挂件
 * 
 * @param id 挂件ID
 * @param name 挂件名称
 * @param content 挂件内容
 * @param options 挂件选项
 * @returns 按钮挂件配置
 * 
 * @example
 * ```typescript
 * const buttonWidget = createButtonWidget(
 *   'festive-button',
 *   '节日按钮',
 *   '<svg>...</svg>',
 *   {
 *     position: { type: 'fixed', position: { x: '50%', y: '50%' }, anchor: 'center' },
 *     animation: { name: 'pulse', duration: 2000, iterations: 'infinite' }
 *   }
 * )
 * ```
 */
export function createButtonWidget(
  id: string,
  name: string,
  content: string,
  options: WidgetFactoryOptions = {}
): WidgetConfig {
  return {
    id,
    name,
    type: WidgetType.BUTTON,
    content,
    position: options.position || {
      type: 'fixed',
      position: { x: '50%', y: '50%' },
      anchor: 'center'
    },
    style: {
      zIndex: 1000,
      opacity: 0.9,
      ...options.style
    },
    animation: options.animation,
    interactive: options.interactive !== false,
    responsive: options.responsive !== false,
    visible: options.visible !== false,
    customProps: options.customProps
  }
}

/**
 * 创建面板挂件
 * 
 * @param id 挂件ID
 * @param name 挂件名称
 * @param content 挂件内容
 * @param options 挂件选项
 * @returns 面板挂件配置
 */
export function createPanelWidget(
  id: string,
  name: string,
  content: string,
  options: WidgetFactoryOptions = {}
): WidgetConfig {
  return {
    id,
    name,
    type: WidgetType.PANEL,
    content,
    position: options.position || {
      type: 'fixed',
      position: { x: '20%', y: '20%' },
      anchor: 'top-left'
    },
    style: {
      zIndex: 999,
      opacity: 0.95,
      ...options.style
    },
    animation: options.animation,
    interactive: options.interactive !== false,
    responsive: options.responsive !== false,
    visible: options.visible !== false,
    customProps: options.customProps
  }
}

/**
 * 创建背景装饰挂件
 * 
 * @param id 挂件ID
 * @param name 挂件名称
 * @param content 挂件内容
 * @param options 挂件选项
 * @returns 背景装饰挂件配置
 */
export function createBackgroundWidget(
  id: string,
  name: string,
  content: string,
  options: WidgetFactoryOptions = {}
): WidgetConfig {
  return {
    id,
    name,
    type: WidgetType.BACKGROUND,
    content,
    position: options.position || {
      type: 'fixed',
      position: { x: '90%', y: '10%' },
      anchor: 'top-right'
    },
    style: {
      zIndex: 800,
      opacity: 0.6,
      ...options.style
    },
    animation: options.animation || {
      name: 'sparkle',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: options.interactive || false,
    responsive: options.responsive !== false,
    visible: options.visible !== false,
    customProps: options.customProps
  }
}

/**
 * 创建动画挂件
 * 
 * @param id 挂件ID
 * @param name 挂件名称
 * @param content 挂件内容
 * @param options 挂件选项
 * @returns 动画挂件配置
 */
export function createAnimationWidget(
  id: string,
  name: string,
  content: string,
  options: WidgetFactoryOptions = {}
): WidgetConfig {
  return {
    id,
    name,
    type: WidgetType.ANIMATION,
    content,
    position: options.position || {
      type: 'fixed',
      position: { x: '50%', y: '10%' },
      anchor: 'top-center'
    },
    style: {
      zIndex: 998,
      opacity: 0.8,
      ...options.style
    },
    animation: options.animation || {
      name: 'float',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: options.interactive || false,
    responsive: options.responsive !== false,
    visible: options.visible !== false,
    customProps: options.customProps
  }
}

/**
 * 创建浮动挂件
 * 
 * @param id 挂件ID
 * @param name 挂件名称
 * @param content 挂件内容
 * @param options 挂件选项
 * @returns 浮动挂件配置
 */
export function createFloatingWidget(
  id: string,
  name: string,
  content: string,
  options: WidgetFactoryOptions = {}
): WidgetConfig {
  return {
    id,
    name,
    type: WidgetType.FLOATING,
    content,
    position: options.position || {
      type: 'fixed',
      position: { x: '80%', y: '30%' },
      anchor: 'center'
    },
    style: {
      zIndex: 997,
      opacity: 0.85,
      ...options.style
    },
    animation: options.animation || {
      name: 'float',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: options.interactive !== false,
    responsive: options.responsive !== false,
    visible: options.visible !== false,
    customProps: options.customProps
  }
}

/**
 * 创建图标挂件
 * 
 * @param id 挂件ID
 * @param name 挂件名称
 * @param content 挂件内容
 * @param options 挂件选项
 * @returns 图标挂件配置
 */
export function createIconWidget(
  id: string,
  name: string,
  content: string,
  options: WidgetFactoryOptions = {}
): WidgetConfig {
  return {
    id,
    name,
    type: WidgetType.ICON,
    content,
    position: options.position || {
      type: 'fixed',
      position: { x: '95%', y: '5%' },
      anchor: 'top-right'
    },
    style: {
      zIndex: 996,
      opacity: 0.7,
      size: { width: '24px', height: '24px' },
      ...options.style
    },
    animation: options.animation,
    interactive: options.interactive !== false,
    responsive: options.responsive !== false,
    visible: options.visible !== false,
    customProps: options.customProps
  }
}

/**
 * 创建文本装饰挂件
 * 
 * @param id 挂件ID
 * @param name 挂件名称
 * @param text 文本内容
 * @param options 挂件选项
 * @returns 文本装饰挂件配置
 */
export function createTextWidget(
  id: string,
  name: string,
  text: string,
  options: WidgetFactoryOptions & { fontSize?: string, color?: string, fontWeight?: string } = {}
): WidgetConfig {
  const { fontSize = '16px', color = '#333333', fontWeight = 'normal', ...widgetOptions } = options

  return {
    id,
    name,
    type: WidgetType.TEXT,
    content: `<span style="font-size: ${fontSize}; color: ${color}; font-weight: ${fontWeight};">${text}</span>`,
    position: widgetOptions.position || {
      type: 'fixed',
      position: { x: '50%', y: '90%' },
      anchor: 'bottom-center'
    },
    style: {
      zIndex: 995,
      opacity: 0.9,
      ...widgetOptions.style
    },
    animation: widgetOptions.animation,
    interactive: widgetOptions.interactive || false,
    responsive: widgetOptions.responsive !== false,
    visible: widgetOptions.visible !== false,
    customProps: widgetOptions.customProps
  }
}

/**
 * 预定义的挂件模板
 */
export const widgetTemplates = {
  /** 雪花模板 */
  snowflake: (id: string) => createAnimationWidget(
    id,
    '雪花',
    `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(15,15)" stroke="#87CEEB" stroke-width="2" fill="none">
        <line x1="0" y1="-12" x2="0" y2="12"/>
        <line x1="-12" y1="0" x2="12" y2="0"/>
        <line x1="-8" y1="-8" x2="8" y2="8"/>
        <line x1="-8" y1="8" x2="8" y2="-8"/>
      </g>
    </svg>`,
    {
      animation: { name: 'snowfall', duration: 5000, iterations: 'infinite', autoplay: true }
    }
  ),

  /** 爱心模板 */
  heart: (id: string) => createFloatingWidget(
    id,
    '爱心',
    `<svg width="30" height="26" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15,23 C15,23 3,15 3,9 C3,6 5,4 8,4 C11,4 15,6 15,9 C15,6 19,4 22,4 C25,4 27,6 27,9 C27,15 15,23 15,23 Z" 
            fill="#FF69B4"/>
    </svg>`,
    {
      animation: { name: 'pulse', duration: 2000, iterations: 'infinite', autoplay: true }
    }
  ),

  /** 星星模板 */
  star: (id: string) => createBackgroundWidget(
    id,
    '星星',
    `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="#FFD700"/>
    </svg>`,
    {
      animation: { name: 'sparkle', duration: 3000, iterations: 'infinite', autoplay: true }
    }
  ),

  /** 叶子模板 */
  leaf: (id: string) => createAnimationWidget(
    id,
    '叶子',
    `<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,2 Q20,10 20,20 Q20,25 15,28 Q10,25 5,20 Q5,10 12,2 Z" fill="#228B22"/>
      <line x1="12" y1="2" x2="12" y2="28" stroke="#8B4513" stroke-width="1"/>
    </svg>`,
    {
      animation: { name: 'float', duration: 4000, iterations: 'infinite', autoplay: true }
    }
  )
} as const

// 导出装饰类
export { BaseDecoration, SnowflakeDecoration, createSnowfallEffect } from './decorations'
