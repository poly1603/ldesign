/**
 * useConfirm composable
 * 用于在任何组件中显示确认对话框
 * 
 * 使用方法：
 * import { useConfirm } from '../composables/useConfirm'
 * 
 * const confirm = useConfirm()
 * const result = await confirm.show({
 *   title: '确认删除',
 *   content: '确定要删除这个项目吗？',
 *   type: 'danger'
 * })
 * 
 * if (result) {
 *   // 用户点击了确认
 * }
 */

import type { ConfirmOptions } from '../components/Confirm.vue'

/**
 * 确认实例接口
 */
export interface ConfirmInstance {
  show: (options: ConfirmOptions) => Promise<boolean>
}

/**
 * 全局确认实例
 */
let globalConfirmInstance: ConfirmInstance | null = null

/**
 * 设置全局确认实例
 */
export const setGlobalConfirmInstance = (instance: ConfirmInstance) => {
  globalConfirmInstance = instance
}

/**
 * 使用确认对话框
 */
export const useConfirm = (): ConfirmInstance => {
  if (globalConfirmInstance) {
    return globalConfirmInstance
  }
  
  // 如果没有实例，返回空实现
  console.warn('Confirm instance not found. Please ensure Confirm component is mounted.')
  return {
    show: async () => false
  }
}

