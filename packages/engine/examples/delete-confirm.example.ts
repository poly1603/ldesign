/**
 * Delete Confirm Dialog Plugin 使用示例
 */

import { createDialogManager, type DialogOptions, type DialogInstance } from '../index'
import {
  createDeleteConfirmPlugin,
  injectDeleteConfirmStyles,
  type DeleteConfirmOptions,
} from './delete-confirm'

// Dialog API 接口定义
interface DialogAPI {
  open: (options: DialogOptions) => Promise<DialogInstance>
  alert: (content: string, options?: Partial<DialogOptions>) => Promise<void>
  confirm: (content: string, options?: Partial<DialogOptions>) => Promise<boolean>
  prompt: (content: string, defaultValue?: string, options?: Partial<DialogOptions>) => Promise<string | null>
  close: (id: string, result?: unknown) => Promise<boolean>
  closeAll: () => Promise<void>
  getById: (id: string) => DialogInstance | null
  getAll: () => DialogInstance[]
  getVisible: () => DialogInstance[]
  config: (newConfig: Record<string, unknown>) => void
}

// 初始化
export async function initDeleteConfirmExample() {
  // 1. 创建 Dialog 管理器
  const dialogManager = createDialogManager({
    zIndexBase: 2000,
    defaultAnimation: 'zoom',
  })

  await dialogManager.initialize()

  // 2. 创建并安装删除确认插件
  const deleteConfirmPlugin = createDeleteConfirmPlugin()

  // 注入样式
  injectDeleteConfirmStyles()

  // 3. 安装插件到 Dialog API
  const dialogAPI: DialogAPI = {
    open: dialogManager.open.bind(dialogManager),
    alert: dialogManager.alert.bind(dialogManager),
    confirm: dialogManager.confirm.bind(dialogManager),
    prompt: dialogManager.prompt.bind(dialogManager),
    close: dialogManager.close.bind(dialogManager),
    closeAll: dialogManager.closeAll.bind(dialogManager),
    getById: dialogManager.getById.bind(dialogManager),
    getAll: dialogManager.getAll.bind(dialogManager),
    getVisible: dialogManager.getVisible.bind(dialogManager),
    config: dialogManager.updateConfig.bind(dialogManager),
  }

  deleteConfirmPlugin.install(dialogAPI as any)

  return { dialogManager, deleteConfirmPlugin }
}

// ================== 使用示例 ==================

/**
 * 示例 1: 简单的删除确认
 */
export async function example1_simpleDelete() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  // 点击删除按钮时
  const deleteButton = document.querySelector('#delete-btn')
  deleteButton?.addEventListener('click', async () => {
    // 显示删除确认弹窗
    const confirmed = await deleteConfirmPlugin.showDeleteConfirm({
      itemName: '用户数据',
    })

    if (confirmed) {
      console.log('用户确认删除')
      // 执行删除操作
      await performDelete()
    } else {
      console.log('用户取消删除')
    }
  })
}

/**
 * 示例 2: 带回调的删除确认
 */
export async function example2_deleteWithCallback() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  const confirmed = await deleteConfirmPlugin.showDeleteConfirm({
    itemName: '文件 "document.pdf"',
    message: '删除后将无法恢复，确定要继续吗？',
    onConfirm: async () => {
      console.log('正在删除文件...')
      await deleteFile('document.pdf')
      console.log('文件已删除')
    },
    onCancel: () => {
      console.log('取消删除操作')
    },
  })
}

/**
 * 示例 3: 自定义按钮文本和类型
 */
export async function example3_customButtons() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  const confirmed = await deleteConfirmPlugin.showDeleteConfirm({
    itemName: '项目文件夹',
    confirmText: '永久删除',
    cancelText: '暂不删除',
    confirmButtonType: 'danger',
    showWarningIcon: true,
  })

  if (confirmed) {
    console.log('永久删除项目')
  }
}

/**
 * 示例 4: 危险删除（需要输入确认）
 */
export async function example4_dangerousDelete() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  // 删除重要数据时，需要用户输入 "DELETE" 确认
  const confirmed = await deleteConfirmPlugin.showDeleteConfirm({
    itemName: '整个数据库',
    message: '您即将删除整个数据库，这是一个非常危险的操作！',
    requireConfirmInput: true,
    confirmInputText: 'DELETE',
    confirmButtonType: 'danger',
  })

  if (confirmed) {
    console.log('用户确认删除数据库')
    await deleteDatabase()
  }
}

/**
 * 示例 5: 快速删除确认（简化API）
 */
export async function example5_quickDelete() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  // 最简单的用法
  const confirmed = await deleteConfirmPlugin.quickDeleteConfirm('这条记录')

  if (confirmed) {
    console.log('删除记录')
  }
}

/**
 * 示例 6: 危险删除快捷方法
 */
export async function example6_dangerousDeleteShortcut() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  // 使用快捷方法，自动启用输入确认
  const confirmed = await deleteConfirmPlugin.dangerousDeleteConfirm(
    '生产环境配置',
    'DELETE' // 需要输入的确认文本
  )

  if (confirmed) {
    console.log('删除生产环境配置')
  }
}

/**
 * 示例 7: 批量删除
 */
export async function example7_batchDelete() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  const selectedItems = ['文件1.txt', '文件2.txt', '文件3.txt']

  const confirmed = await deleteConfirmPlugin.showDeleteConfirm({
    itemName: `${selectedItems.length} 个文件`,
    message: `您选择了 ${selectedItems.length} 个文件，确定要全部删除吗？`,
    confirmText: '删除全部',
    onConfirm: async () => {
      console.log('正在批量删除...')
      for (const item of selectedItems) {
        await deleteFile(item)
      }
      console.log('批量删除完成')
    },
  })
}

/**
 * 示例 8: 集成到 Vue 组件
 */
export const VueComponentExample = {
  template: `
    <div>
      <button @click="handleDelete">删除</button>
    </div>
  `,
  setup() {
    const handleDelete = async () => {
      const { deleteConfirmPlugin } = await initDeleteConfirmExample()

      const confirmed = await deleteConfirmPlugin.showDeleteConfirm({
        itemName: '当前项',
        onConfirm: async () => {
          // 执行删除 API 调用
          await fetch('/api/delete', { method: 'DELETE' })
        },
      })

      if (confirmed) {
        // 更新 UI
        console.log('UI 更新：项已删除')
      }
    }

    return { handleDelete }
  },
}

/**
 * 示例 9: 集成到 React 组件
 *
 * @example 在 React 中使用：
 * ```tsx
 * export function ReactComponentExample() {
 *   const handleDelete = async () => {
 *     const { deleteConfirmPlugin } = await initDeleteConfirmExample()
 *
 *     const confirmed = await deleteConfirmPlugin.showDeleteConfirm({
 *       itemName: '当前项',
 *       message: '此操作无��撤销，确定要删除吗？',
 *     })
 *
 *     if (confirmed) {
 *       // 调用删除 API
 *       await fetch('/api/delete', { method: 'DELETE' })
 *       console.log('删除成功')
 *     }
 *   }
 *
 *   return <button onClick={handleDelete}>删除</button>
 * }
 * ```
 */
export async function example9_reactIntegration() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  const confirmed = await deleteConfirmPlugin.showDeleteConfirm({
    itemName: '当前项',
    message: '此操作无法撤销，确定要删除吗？',
  })

  if (confirmed) {
    // 调用删除 API
    await fetch('/api/delete', { method: 'DELETE' })
    console.log('删除成功')
  }
}

/**
 * 示例 10: 完整配置示例
 */
export async function example10_fullConfiguration() {
  const { deleteConfirmPlugin } = await initDeleteConfirmExample()

  const options: DeleteConfirmOptions = {
    itemName: '高级数据',
    message: '这是一条自定义的警告消息，删除后数据将永久丢失。',
    showWarningIcon: true,
    confirmText: '我已知晓，确认删除',
    cancelText: '让我再想想',
    requireConfirmInput: true,
    confirmInputText: 'CONFIRM',
    confirmButtonType: 'danger',
    onConfirm: async () => {
      console.log('开始删除流程...')
      // 显示加载状态
      showLoading()
      try {
        await performDeleteWithAPI()
        showSuccessMessage('删除成功')
      } catch (error) {
        showErrorMessage('删除失败: ' + error)
      } finally {
        hideLoading()
      }
    },
    onCancel: () => {
      console.log('用户取消了删除操作')
    },
  }

  const confirmed = await deleteConfirmPlugin.showDeleteConfirm(options)
}

// ================== 辅助函数 ==================

async function performDelete() {
  // 模拟删除操作
  return new Promise((resolve) => setTimeout(resolve, 1000))
}

async function deleteFile(filename: string) {
  console.log(`删除文件: ${filename}`)
  return new Promise((resolve) => setTimeout(resolve, 500))
}

async function deleteDatabase() {
  console.log('删除数据库...')
  return new Promise((resolve) => setTimeout(resolve, 2000))
}

async function performDeleteWithAPI() {
  // 模拟 API 调用
  return fetch('/api/delete', { method: 'DELETE' })
}

function showLoading() {
  console.log('显示加载动画')
}

function hideLoading() {
  console.log('隐藏加载动画')
}

function showSuccessMessage(msg: string) {
  console.log('成功:', msg)
}

function showErrorMessage(msg: string) {
  console.error('错误:', msg)
}
