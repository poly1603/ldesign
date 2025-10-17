/**
 * Message消息类型定义
 */

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading'

export interface MessageOptions {
  content: string
  type?: MessageType
  duration?: number
  closable?: boolean
  onClose?: () => void
  icon?: string
  className?: string
  style?: Record<string, string>
  key?: string
}

export interface MessageInstance {
  close(): void
  update(options: Partial<MessageOptions>): void
  setProgress(progress: number): void
}

export interface MessageManager {
  info(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): MessageInstance
  success(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): MessageInstance
  warning(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): MessageInstance
  error(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): MessageInstance
  loading(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): MessageInstance
  open(options: MessageOptions): MessageInstance
  closeAll(): void
  destroy(key: string): void
}

export interface MessageConfig {
  maxCount?: number
  duration?: number
  position?: 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  getContainer?: () => HTMLElement
}