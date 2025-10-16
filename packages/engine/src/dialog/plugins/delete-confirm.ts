/**
 * Delete Confirm Dialog Plugin
 * 用于删除操作的确认弹窗插件
 */

import type { DialogAPI, DialogConfig, DialogInstance, DialogPlugin } from '../types'
import { getLogger } from '../../logger/logger'

export interface DeleteConfirmOptions {
  /** 要删除的项目名称或描述 */
  itemName?: string
  /** 自定义提示内容 */
  message?: string
  /** 是否显示警告图标 */
  showWarningIcon?: boolean
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否需要二次确认（输入确认文本） */
  requireConfirmInput?: boolean
  /** 需要输入的确认文本 */
  confirmInputText?: string
  /** 确认按钮类型 */
  confirmButtonType?: 'danger' | 'warning' | 'primary'
  /** 删除成功后的回调 */
  onConfirm?: () => void | Promise<void>
  /** 取消删除的回调 */
  onCancel?: () => void
}

export class DeleteConfirmPlugin implements DialogPlugin {
  private logger = getLogger('DeleteConfirmPlugin')

  name = 'delete-confirm'
  private dialogAPI: DialogAPI | null = null

  install(dialogAPI: DialogAPI): void {
    this.dialogAPI = dialogAPI
  }

  uninstall(): void {
    this.dialogAPI = null
  }

  /**
   * 显示删除确认弹窗
   */
  async showDeleteConfirm(options: DeleteConfirmOptions = {}): Promise<boolean> {
    if (!this.dialogAPI) {
      throw new Error('Dialog API not initialized')
    }

    const {
      itemName = '此项',
      message,
      showWarningIcon = true,
      confirmText = '确认删除',
      cancelText = '取消',
      requireConfirmInput = false,
      confirmInputText = 'DELETE',
      confirmButtonType = 'danger',
      onConfirm,
      onCancel,
    } = options

    // 构建提示内容
    const content = message || `确定要删除${itemName}吗？此操作不可撤销。`

    // 如果需要二次确认
    if (requireConfirmInput) {
      return this.showDeleteConfirmWithInput(
        content,
        confirmInputText,
        confirmText,
        cancelText,
        confirmButtonType,
        showWarningIcon,
        onConfirm,
        onCancel
      )
    }

    // 普通确认弹窗
    return this.showSimpleDeleteConfirm(
      content,
      confirmText,
      cancelText,
      confirmButtonType,
      showWarningIcon,
      onConfirm,
      onCancel
    )
  }

  /**
   * 显示简单的删除确认弹窗
   */
  private async showSimpleDeleteConfirm(
    content: string,
    confirmText: string,
    cancelText: string,
    confirmButtonType: string,
    showWarningIcon: boolean,
    onConfirm?: () => void | Promise<void>,
    onCancel?: () => void
  ): Promise<boolean> {
    const confirmButtonDisabled = false

    const dialogConfig: DialogConfig = {
      type: 'custom',
      title: '删除确认',
      width: 460,
      centered: true,
      closable: true,
      maskClosable: false,
      escClosable: true,
      animation: 'zoom',
      animationDuration: 200,
      customClass: 'delete-confirm-dialog',
      buttons: [
        {
          text: cancelText,
          type: 'secondary',
          onClick: async (dialog: DialogInstance) => {
            if (onCancel) {
              onCancel()
            }
            await dialog.close(false)
          },
        },
        {
          text: confirmText,
          type: confirmButtonType as 'primary' | 'secondary' | 'danger',
          disabled: confirmButtonDisabled,
          onClick: async (dialog: DialogInstance) => {
            if (onConfirm) {
              try {
                await onConfirm()
              } catch (error) {
                this.logger.error('Delete confirm callback error:', error)
                return
              }
            }
            await dialog.close(true)
          },
        },
      ],
    }

    // 创建内容HTML
    const contentHTML = `
      <div class="delete-confirm-content">
        ${
          showWarningIcon
            ? `
        <div class="delete-confirm-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" fill="#FFF3E0"/>
            <path d="M24 14V26M24 30V32" stroke="#FF9800" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        `
            : ''
        }
        <div class="delete-confirm-message">${content}</div>
      </div>
    `

    if (!this.dialogAPI) {
      throw new Error('Dialog API is not initialized')
    }

    const instance = await this.dialogAPI.open({
      ...dialogConfig,
      content: contentHTML,
      html: true,
    })

    return new Promise((resolve) => {
      const originalClose = instance.close.bind(instance)
      instance.close = async (result?: unknown) => {
        await originalClose(result)
        resolve(result === true)
      }
    })
  }

  /**
   * 显示需要输入确认的删除弹窗
   */
  private async showDeleteConfirmWithInput(
    content: string,
    confirmInputText: string,
    confirmText: string,
    cancelText: string,
    confirmButtonType: string,
    showWarningIcon: boolean,
    onConfirm?: () => void | Promise<void>,
    onCancel?: () => void
  ): Promise<boolean> {
    return new Promise((resolve) => {
      let dialogInstance: DialogInstance | null = null

      const dialogConfig: DialogConfig = {
        type: 'custom',
        title: '删除确认',
        width: 500,
        centered: true,
        closable: true,
        maskClosable: false,
        escClosable: true,
        animation: 'zoom',
        animationDuration: 200,
        customClass: 'delete-confirm-dialog delete-confirm-with-input',
        buttons: [
          {
            text: cancelText,
            type: 'secondary',
            onClick: async (dialog: DialogInstance) => {
              if (onCancel) {
                onCancel()
              }
              await dialog.close(false)
              resolve(false)
            },
          },
          {
            text: confirmText,
            type: confirmButtonType as 'primary' | 'secondary' | 'danger',
            disabled: true,
            onClick: async (dialog: DialogInstance) => {
              if (onConfirm) {
                try {
                  await onConfirm()
                } catch (error) {
                  this.logger.error('Delete confirm callback error:', error)
                  return
                }
              }
              await dialog.close(true)
              resolve(true)
            },
          },
        ],
      }

      // 创建带输入框的内容HTML
      const contentHTML = `
        <div class="delete-confirm-content">
          ${
            showWarningIcon
              ? `
          <div class="delete-confirm-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" fill="#FFEBEE"/>
              <path d="M24 14V26M24 30V32" stroke="#F44336" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          `
              : ''
          }
          <div class="delete-confirm-message">${content}</div>
          <div class="delete-confirm-input-group">
            <label class="delete-confirm-label">
              请输入 <strong>${confirmInputText}</strong> 以确认删除：
            </label>
            <input 
              type="text" 
              class="delete-confirm-input" 
              placeholder="输入 ${confirmInputText}"
              autocomplete="off"
            />
          </div>
        </div>
      `

      if (!this.dialogAPI) {
        throw new Error('Dialog API is not initialized')
      }

      this.dialogAPI.open({
        ...dialogConfig,
        content: contentHTML,
        html: true,
        onOpen: () => {
          // 获取对话框实例
          setTimeout(() => {
            if (!dialogInstance) return

            const input = dialogInstance.element.querySelector(
              '.delete-confirm-input'
            ) as HTMLInputElement
            const confirmButton = dialogInstance.element.querySelectorAll(
              '.engine-dialog-footer button'
            )[1] as HTMLButtonElement

            if (input && confirmButton) {
              // 聚焦到输入框
              input.focus()

              // 监听输入变化
              input.addEventListener('input', (e) => {
                const value = (e.target as HTMLInputElement).value.trim()
                const isValid = value === confirmInputText
                confirmButton.disabled = !isValid

                if (isValid) {
                  confirmButton.removeAttribute('disabled')
                } else {
                  confirmButton.setAttribute('disabled', 'true')
                }
              })

              // 支持回车键确认
              input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && input.value.trim() === confirmInputText) {
                  confirmButton.click()
                }
              })
            }
          }, 100)
        },
      }).then((instance) => {
        dialogInstance = instance
      })
    })
  }

  /**
   * 快速删除确认（简化API）
   */
  async quickDeleteConfirm(itemName: string): Promise<boolean> {
    return this.showDeleteConfirm({ itemName })
  }

  /**
   * 危险删除确认（需要输入确认）
   */
  async dangerousDeleteConfirm(
    itemName: string,
    confirmInputText = 'DELETE'
  ): Promise<boolean> {
    return this.showDeleteConfirm({
      itemName,
      requireConfirmInput: true,
      confirmInputText,
      message: `您即将删除${itemName}，这是一个危险操作且不可恢复。`,
      showWarningIcon: true,
    })
  }
}

/**
 * 创建并注册删除确认插件
 */
export function createDeleteConfirmPlugin(): DeleteConfirmPlugin {
  return new DeleteConfirmPlugin()
}

/**
 * 创建删除确认样式
 */
export function injectDeleteConfirmStyles(): void {
  if (document.querySelector('#delete-confirm-dialog-styles')) {
    return
  }

  const styleEl = document.createElement('style')
  styleEl.id = 'delete-confirm-dialog-styles'
  styleEl.textContent = `
    /* 删除确认弹窗样式 */
    .delete-confirm-dialog .engine-dialog {
      max-width: 95vw;
    }

    .delete-confirm-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 10px 0;
    }

    .delete-confirm-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.3s ease-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .delete-confirm-message {
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      text-align: center;
      max-width: 400px;
    }

    .delete-confirm-input-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .delete-confirm-label {
      font-size: 14px;
      color: #666;
      text-align: left;
    }

    .delete-confirm-label strong {
      color: #f44336;
      font-weight: 600;
    }

    .delete-confirm-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .delete-confirm-input:focus {
      outline: none;
      border-color: #2196F3;
    }

    .delete-confirm-input::placeholder {
      color: #bdbdbd;
    }

    /* 按钮样式 */
    .delete-confirm-dialog .engine-dialog-footer button {
      min-width: 90px;
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .delete-confirm-dialog .engine-dialog-footer button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Secondary button */
    .delete-confirm-dialog .engine-dialog-footer button:first-child {
      background: #f5f5f5;
      color: #666;
    }

    .delete-confirm-dialog .engine-dialog-footer button:first-child:hover:not([disabled]) {
      background: #e0e0e0;
    }

    /* Danger button */
    .delete-confirm-dialog .engine-dialog-footer button:last-child {
      background: #f44336;
      color: white;
    }

    .delete-confirm-dialog .engine-dialog-footer button:last-child:hover:not([disabled]) {
      background: #d32f2f;
    }

    /* Warning button */
    .delete-confirm-dialog.warning .engine-dialog-footer button:last-child {
      background: #ff9800;
    }

    .delete-confirm-dialog.warning .engine-dialog-footer button:last-child:hover:not([disabled]) {
      background: #f57c00;
    }

    /* 响应式 */
    @media (max-width: 600px) {
      .delete-confirm-dialog .engine-dialog {
        width: 90vw !important;
      }

      .delete-confirm-message {
        font-size: 14px;
      }

      .delete-confirm-icon svg {
        width: 40px;
        height: 40px;
      }
    }
  `

  document.head.appendChild(styleEl)
}
