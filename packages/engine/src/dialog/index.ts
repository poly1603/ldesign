/**
 * Dialog弹窗系统统一导出
 */

import type { DialogManagerConfig } from './dialog-manager'
// 导出核心类
// 导入核心类用于创建实例
import { DialogManager } from './dialog-manager'

export { DialogManager } from './dialog-manager'
export type { DialogManagerConfig } from './dialog-manager'

// 导出类型定义
export * from './types'

/**
 * 创建Dialog管理器实例
 */
export function createDialogManager(
  config?: DialogManagerConfig
): DialogManager {
  const manager = new DialogManager(config)
  // 懒加载初始化
  if (typeof window !== 'undefined') {
    manager.initialize().catch(console.error)
  }
  return manager
}

/**
 * 全局Dialog管理器实例
 */
let globalDialogManager: DialogManager | null = null

/**
 * 获取全局Dialog管理器实例
 */
export function getGlobalDialogManager(): DialogManager {
  if (!globalDialogManager) {
    globalDialogManager = new DialogManager()
    // 自动初始化
    globalDialogManager.initialize().catch(console.error)
  }
  return globalDialogManager
}

/**
 * 设置全局Dialog管理器实例
 */
export function setGlobalDialogManager(manager: DialogManager): void {
  globalDialogManager = manager
}

/**
 * 全局Dialog API - 便捷方法
 */
export const dialog = {
  /**
   * 显示弹窗
   */
  open: (options: any) => getGlobalDialogManager().open(options),

  /**
   * 显示Alert弹窗
   */
  alert: (content: string, options?: any) =>
    getGlobalDialogManager().alert(content, options),

  /**
   * 显示Confirm弹窗
   */
  confirm: (content: string, options?: any) =>
    getGlobalDialogManager().confirm(content, options),

  /**
   * 显示Prompt弹窗
   */
  prompt: (content: string, defaultValue?: string, options?: any) =>
    getGlobalDialogManager().prompt(content, defaultValue, options),

  /**
   * 关闭弹窗
   */
  close: (id: string, result?: any) =>
    getGlobalDialogManager().close(id, result),

  /**
   * 关闭所有弹窗
   */
  closeAll: () => getGlobalDialogManager().closeAll(),

  /**
   * 配置全局Dialog管理器
   */
  config: (config: DialogManagerConfig) => {
    const manager = getGlobalDialogManager()
    manager.updateConfig(config)
  },

  /**
   * 获取统计信息
   */
  getStats: () => getGlobalDialogManager().getStats(),
}

// 默认导出Dialog管理器类
export default DialogManager

// 使用示例
/*
// 基础用法
import { dialog } from '@/dialog'

// 显示不同类型的弹窗
await dialog.alert('操作成功！')
const confirmed = await dialog.confirm('确定要删除吗？')
const userInput = await dialog.prompt('请输入您的姓名：', '默认值')

// 自定义弹窗
const instance = await dialog.open({
  title: '自定义弹窗',
  content: '这是自定义内容',
  width: 500,
  height: 300,
  draggable: true,
  resizable: true,
  buttons: [
    {
      text: '取消',
      onClick: (dialog) => dialog.close(false)
    },
    {
      text: '确定',
      type: 'primary',
      onClick: (dialog) => dialog.close(true)
    }
  ]
})

// 高级用法
import { DialogManager, createDialogManager } from '@/dialog'

const dialogManager = createDialogManager({
  zIndexBase: 3000,
  maxDialogs: 5,
  defaultAnimation: 'zoom'
})

await dialogManager.initialize()

const customDialog = await dialogManager.open({
  type: 'custom',
  title: '高级弹窗',
  content: '<p>支持HTML内容</p>',
  html: true,
  modal: true,
  closable: true,
  maskClosable: false,
  draggable: true,
  resizable: true,
  animation: 'slide',
  animationDuration: 500,
  onOpen: () => console.log('弹窗已打开'),
  onClose: (result) => console.log('弹窗已关闭，结果：', result),
  beforeClose: async (result) => {
    // 可以在这里进行异步验证
    return confirm('确定要关闭吗？')
  }
})

// 更新弹窗
customDialog.update({
  title: '更新后的标题',
  content: '更新后的内容'
})

// 手动关闭
setTimeout(() => {
  customDialog.close('手动关闭')
}, 5000)
*/
