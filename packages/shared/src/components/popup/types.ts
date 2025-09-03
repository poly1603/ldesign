/**
 * Popup 组件类型定义
 */

export type PopupPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'

export type PopupTrigger = 'click' | 'hover' | 'focus' | 'manual'

export interface PopupProps {
  /** 是否显示弹出层 */
  visible?: boolean
  /** 弹出位置 */
  placement?: PopupPlacement
  /** 触发方式 */
  trigger?: PopupTrigger
  /** 是否禁用 */
  disabled?: boolean
  /** 弹出层内容 */
  content?: string
  /** 弹出层标题 */
  title?: string
  /** 弹出层宽度 */
  width?: string | number
  /** 弹出层最大宽度 */
  maxWidth?: string | number
  /** 弹出层最大高度 */
  maxHeight?: string | number
  /** 是否显示箭头 */
  showArrow?: boolean
  /** 箭头大小 */
  arrowSize?: number
  /** 偏移量 */
  offset?: number
  /** 延迟显示时间（毫秒） */
  showDelay?: number
  /** 延迟隐藏时间（毫秒） */
  hideDelay?: number
  /** 是否点击外部关闭 */
  closeOnClickOutside?: boolean
  /** 是否按 ESC 关闭 */
  closeOnEscape?: boolean
  /** 弹出层 z-index */
  zIndex?: number
  /** 自定义类名 */
  popupClass?: string
  /** 自定义样式 */
  popupStyle?: Record<string, any>
  /** 动画类型 */
  animation?: 'fade' | 'slide' | 'zoom' | 'bounce'
  /** 动画持续时间 */
  animationDuration?: number
  /** 是否保持在视口内 */
  keepInViewport?: boolean
  /** 是否跟随触发元素滚动 */
  followScroll?: boolean
}

export interface PopupEmits {
  /** 显示状态变化事件 */
  'update:visible': [visible: boolean]
  /** 显示事件 */
  'show': []
  /** 隐藏事件 */
  'hide': []
  /** 点击外部事件 */
  'click-outside': [event: MouseEvent]
}

export interface PopupPosition {
  top: number | string
  left: number | string
  placement: PopupPlacement
}
