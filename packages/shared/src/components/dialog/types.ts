/**
 * Dialog 组件类型定义
 */

export interface DialogProps {
  /** 是否显示对话框 */
  visible?: boolean
  /** 对话框标题 */
  title?: string
  /** 对话框宽度 */
  width?: string | number
  /** 对话框最大宽度 */
  maxWidth?: string | number
  /** 对话框高度 */
  height?: string | number
  /** 对话框最大高度 */
  maxHeight?: string | number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示遮罩层 */
  showMask?: boolean
  /** 是否点击遮罩层关闭 */
  closeOnClickMask?: boolean
  /** 是否按 ESC 关闭 */
  closeOnEscape?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
  /** 是否居中显示 */
  center?: boolean
  /** 是否全屏显示 */
  fullscreen?: boolean
  /** 是否锁定滚动 */
  lockScroll?: boolean
  /** 对话框 z-index */
  zIndex?: number
  /** 自定义类名 */
  dialogClass?: string
  /** 自定义样式 */
  dialogStyle?: Record<string, any>
  /** 遮罩层自定义类名 */
  maskClass?: string
  /** 遮罩层自定义样式 */
  maskStyle?: Record<string, any>
  /** 动画类型 */
  animation?: 'fade' | 'slide' | 'zoom' | 'bounce'
  /** 动画持续时间 */
  animationDuration?: number
  /** 是否销毁内容 */
  destroyOnClose?: boolean
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮类型 */
  confirmType?: 'primary' | 'success' | 'warning' | 'danger'
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
}

export interface DialogEmits {
  /** 显示状态变化事件 */
  'update:visible': [visible: boolean]
  /** 打开事件 */
  'open': []
  /** 关闭事件 */
  'close': []
  /** 确认事件 */
  'confirm': []
  /** 取消事件 */
  'cancel': []
  /** 遮罩层点击事件 */
  'mask-click': [event: MouseEvent]
}

export interface DialogPosition {
  top: number
  left: number
}

export interface DialogSize {
  width: number
  height: number
}
