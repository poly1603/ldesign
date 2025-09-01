/**
 * 消息系统统一导出
 */

import type { MessageManagerConfig } from './message-manager'
// 导出核心类
// 导入核心类用于创建实例
import { MessageManager } from './message-manager'

export { MessageManager } from './message-manager'
export type { MessageManagerConfig } from './message-manager'

// 导出类型定义
export * from './types'

// 导出工具函数
// 选择性导出工具函数以避免冲突
export {
  calculatePosition as calculateMessagePosition,
  MessageQueue as createMessageQueue,
  generateMessageId,
  getViewportSize,
  debounce as messageDebounce,
  deepClone as messageDeepClone,
  throttle as messageThrottle,
  validateMessageConfig,
} from './utils'

/**
 * 创建消息管理器实例
 */
export function createMessageManager(
  config?: MessageManagerConfig
): MessageManager {
  return new MessageManager(config)
}

/**
 * 全局消息管理器实例
 */
let globalMessageManager: MessageManager | null = null

/**
 * 获取全局消息管理器实例
 */
export function getGlobalMessageManager(): MessageManager {
  if (!globalMessageManager) {
    globalMessageManager = new MessageManager()
    // 自动初始化
    globalMessageManager.initialize().catch(console.error)
  }
  return globalMessageManager
}

/**
 * 设置全局消息管理器实例
 */
export function setGlobalMessageManager(manager: MessageManager): void {
  globalMessageManager = manager
}

/**
 * 全局消息API - 便捷方法
 */
export const message = {
  /**
   * 显示消息
   */
  show: (options: any) => getGlobalMessageManager().show(options),

  /**
   * 显示成功消息
   */
  success: (content: string, options?: any) =>
    getGlobalMessageManager().success(content, options),

  /**
   * 显示错误消息
   */
  error: (content: string, options?: any) =>
    getGlobalMessageManager().error(content, options),

  /**
   * 显示警告消息
   */
  warning: (content: string, options?: any) =>
    getGlobalMessageManager().warning(content, options),

  /**
   * 显示信息消息
   */
  info: (content: string, options?: any) =>
    getGlobalMessageManager().info(content, options),

  /**
   * 显示加载消息
   */
  loading: (content: string, options?: any) =>
    getGlobalMessageManager().loading(content, options),

  /**
   * 关闭消息
   */
  close: (id: string) => getGlobalMessageManager().close(id),

  /**
   * 关闭所有消息
   */
  closeAll: () => getGlobalMessageManager().closeAll(),

  /**
   * 配置全局消息管理器
   */
  config: (config: MessageManagerConfig) => {
    const manager = getGlobalMessageManager()
    manager.updateConfig(config)
  },

  /**
   * 获取统计信息
   */
  getStats: () => getGlobalMessageManager().getStats(),
}

// 默认导出消息管理器类
export default MessageManager

// 使用示例
/*
// 基础用法
import { message } from '@/message'

// 显示不同类型的消息
message.success('操作成功！')
message.error('操作失败！')
message.warning('请注意！')
message.info('提示信息')
const loadingMsg = message.loading('加载中...')

// 关闭特定消息
setTimeout(() => {
  loadingMsg.close()
}, 3000)

// 高级用法
import { MessageManager, createMessageManager } from '@/message'

const messageManager = createMessageManager({
  maxCount: 3,
  defaultDuration: 5000,
  defaultPosition: 'top'
})

await messageManager.initialize()

messageManager.show({
  type: 'success',
  title: '成功',
  content: '数据保存成功！',
  duration: 4000,
  showClose: true,
  onClick: () => console.log('消息被点击'),
  onClose: () => console.log('消息已关闭')
})

// 使用构建器模式
import { messageBuilder } from '@/message'

const config = messageBuilder
  .success('操作成功')
  .title('提示')
  .duration(5000)
  .showClose(true)
  .onClick(() => console.log('clicked'))
  .build()

message.show(config)
*/
