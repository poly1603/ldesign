/**
 * Dialog弹窗类型定义
 */

export interface DialogOptions {
  title?: string
  content?: string
  width?: string | number
  height?: string | number
  modal?: boolean
  closable?: boolean
  maskClosable?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  footer?: boolean
  className?: string
  zIndex?: number
}

export interface DialogInstance {
  open(): void
  close(): void
  update(options: Partial<DialogOptions>): void
  destroy(): void
}

export interface DialogManager {
  open(options: DialogOptions): DialogInstance
  confirm(message: string, title?: string): Promise<boolean>
  alert(message: string, title?: string): Promise<void>
  prompt(message: string, title?: string, defaultValue?: string): Promise<string | null>
  closeAll(): void
}

export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm'

export interface DialogConfig {
  type?: DialogType
  icon?: string
  duration?: number
  position?: 'center' | 'top' | 'bottom'
}