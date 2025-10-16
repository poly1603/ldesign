import { inject } from 'vue'

export interface MessageApi {
  success: (content: string, duration?: number) => void
  error: (content: string, duration?: number) => void
  warning: (content: string, duration?: number) => void
  info: (content: string, duration?: number) => void
}

// 创建一个全局的消息实例
let globalMessage: MessageApi | null = null

export function setGlobalMessage(messageApi: MessageApi) {
  globalMessage = messageApi
}

export function useMessage(): MessageApi {
  // 优先使用注入的消息服务
  const injectedMessage = inject<MessageApi>('message', null)
  
  if (injectedMessage) {
    return injectedMessage
  }
  
  // 使用全局消息服务
  if (globalMessage) {
    return globalMessage
  }
  
  // 降级到 console
  console.warn('Message service not found, falling back to console')
  return {
    success: (content: string) => console.log('✓', content),
    error: (content: string) => console.error('✕', content),
    warning: (content: string) => console.warn('⚠', content),
    info: (content: string) => console.info('ℹ', content)
  }
}