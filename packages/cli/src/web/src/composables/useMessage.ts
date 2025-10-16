/**
 * useMessage composable
 * 用于在任何组件中显示全局消息通知
 * 
 * 使用方法：
 * import { useMessage } from '../composables/useMessage'
 * 
 * const message = useMessage()
 * message.success('操作成功')
 * message.error('操作失败')
 * message.warning('警告信息')
 * message.info('提示信息')
 */

import { getCurrentInstance } from 'vue'

/**
 * 消息类型
 */
export type MessageType = 'success' | 'error' | 'warning' | 'info'

/**
 * 消息实例接口
 */
export interface MessageInstance {
  success: (content: string, duration?: number) => void
  error: (content: string, duration?: number) => void
  warning: (content: string, duration?: number) => void
  info: (content: string, duration?: number) => void
}

/**
 * 全局消息实例
 */
let globalMessageInstance: MessageInstance | null = null

/**
 * 设置全局消息实例
 */
export const setGlobalMessageInstance = (instance: MessageInstance) => {
  globalMessageInstance = instance
}

/**
 * 使用消息通知
 */
export const useMessage = (): MessageInstance => {
  // 尝试从当前组件实例获取
  const instance = getCurrentInstance()
  if (instance?.appContext.config.globalProperties.$message) {
    return instance.appContext.config.globalProperties.$message
  }
  
  // 使用全局实例
  if (globalMessageInstance) {
    return globalMessageInstance
  }
  
  // 如果没有实例，返回空实现
  console.warn('Message instance not found. Please ensure Message component is mounted.')
  return {
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {}
  }
}

