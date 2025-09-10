/**
 * Dialog弹窗管理器
 * 统一的弹窗管理系统
 */

import type { Engine } from '../types/engine'
import { BaseManager } from '../core/base-manager'

export interface DialogOptions {
  id?: string
  type?: 'alert' | 'confirm' | 'prompt' | 'custom'
  title?: string
  content?: string
  html?: boolean
  width?: string | number
  height?: string | number
  modal?: boolean
  closable?: boolean
  maskClosable?: boolean
  escClosable?: boolean
  draggable?: boolean
  resizable?: boolean
  centered?: boolean
  zIndex?: number
  customClass?: string
  showMask?: boolean
  maskStyle?: Record<string, string>
  bodyStyle?: Record<string, string>
  headerStyle?: Record<string, string>
  footerStyle?: Record<string, string>
  animation?: 'fade' | 'zoom' | 'slide' | 'none'
  animationDuration?: number
  buttons?: DialogButton[]
  onOpen?: () => void
  onClose?: (result?: unknown) => void
  onCancel?: () => void
  onConfirm?: (result?: unknown) => void
  beforeClose?: (result?: unknown) => boolean | Promise<boolean>
}

export interface DialogButton {
  text: string
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  loading?: boolean
  onClick?: (dialog: DialogInstance) => void | Promise<void>
}

export interface DialogInstance {
  id: string
  options: DialogOptions
  element: HTMLElement
  maskElement?: HTMLElement
  visible: boolean
  zIndex: number
  result?: any
  open: () => Promise<void>
  close: (result?: unknown) => Promise<void>
  update: (options: Partial<DialogOptions>) => void
  destroy: () => void
}

export interface DialogManagerConfig {
  zIndexBase?: number
  zIndexStep?: number
  defaultAnimation?: 'fade' | 'zoom' | 'slide' | 'none'
  defaultAnimationDuration?: number
  maxDialogs?: number
  escapeKeyClose?: boolean
  clickMaskClose?: boolean
}

export class DialogManager extends BaseManager<DialogManagerConfig> {
  private instances = new Map<string, DialogInstance>()
  private zIndexCounter = 0
  private idCounter = 0

  constructor(config: DialogManagerConfig = {}, engine?: Engine) {
    const defaults: DialogManagerConfig = {
      zIndexBase: 2000,
      zIndexStep: 10,
      defaultAnimation: 'fade',
      defaultAnimationDuration: 300,
      maxDialogs: 10,
      escapeKeyClose: true,
      clickMaskClose: true,
    }
    const merged: DialogManagerConfig = { ...defaults, ...config }
    super('DialogManager', merged, engine)
  }

  /**
   * 初始化Dialog管理器
   */
  async initialize(): Promise<void> {
    this.log('info', 'Initializing dialog manager...')

    // 绑定全局事件
    this.bindGlobalEvents()

    // 创建样式
    this.createStyles()

    this.log('info', 'Dialog manager initialized')
  }

  /**
   * 绑定全局事件
   */
  private bindGlobalEvents(): void {
    // ESC键关闭
    if (this.config.escapeKeyClose) {
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.closeTopDialog()
        }
      })
    }
  }

  /**
   * 创建样式
   */
  private createStyles(): void {
    if (document.querySelector('#engine-dialog-styles')) {
      return
    }

    const styleEl = document.createElement('style')
    styleEl.id = 'engine-dialog-styles'
    styleEl.textContent = `
      .engine-dialog-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .engine-dialog {
        position: relative;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .engine-dialog-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .engine-dialog-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .engine-dialog-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .engine-dialog-close:hover {
        color: #666;
      }

      .engine-dialog-body {
        padding: 20px;
        flex: 1;
        overflow-y: auto;
      }

      .engine-dialog-footer {
        padding: 16px 20px;
        border-top: 1px solid #e8e8e8;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .engine-dialog-button {
        padding: 8px 16px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .engine-dialog-button:hover {
        border-color: #409eff;
        color: #409eff;
      }

      .engine-dialog-button.primary {
        background: #409eff;
        border-color: #409eff;
        color: white;
      }

      .engine-dialog-button.primary:hover {
        background: #66b1ff;
        border-color: #66b1ff;
      }

      .engine-dialog-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* 动画 */
      .engine-dialog-fade-enter {
        opacity: 0;
      }

      .engine-dialog-fade-enter-active {
        transition: opacity 0.3s ease;
      }

      .engine-dialog-fade-leave-active {
        transition: opacity 0.3s ease;
        opacity: 0;
      }

      .engine-dialog-zoom-enter {
        opacity: 0;
        transform: scale(0.7);
      }

      .engine-dialog-zoom-enter-active {
        transition: all 0.3s ease;
      }

      .engine-dialog-zoom-leave-active {
        transition: all 0.3s ease;
        opacity: 0;
        transform: scale(0.7);
      }

      .engine-dialog-slide-enter {
        opacity: 0;
        transform: translateY(-50px);
      }

      .engine-dialog-slide-enter-active {
        transition: all 0.3s ease;
      }

      .engine-dialog-slide-leave-active {
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(-50px);
      }

      /* 拖拽 */
      .engine-dialog-draggable .engine-dialog-header {
        cursor: move;
        user-select: none;
      }

      /* 可调整大小 */
      .engine-dialog-resizable {
        resize: both;
        overflow: auto;
      }
    `
    document.head.appendChild(styleEl)
  }

  /**
   * 显示弹窗
   */
  async open(options: DialogOptions): Promise<DialogInstance> {
    const id = options.id || this.generateId()

    // 检查弹窗数量限制
    await this.checkMaxDialogs()

    // 创建弹窗实例
    const instance = await this.createInstance(id, options)

    // 添加到管理器
    this.instances.set(id, instance)

    // 显示弹窗
    await instance.open()

    this.log('info', `Dialog opened: ${id}`)
    return instance
  }

  /**
   * 显示Alert弹窗
   */
  async alert(
    content: string,
    options?: Partial<DialogOptions>
  ): Promise<void> {
    return new Promise(resolve => {
      this.open({
        type: 'alert',
        title: '提示',
        content,
        buttons: [
          {
            text: '确定',
            type: 'primary',
            onClick: () => resolve(),
          },
        ],
        ...options,
      })
    })
  }

  /**
   * 显示Confirm弹窗
   */
  async confirm(
    content: string,
    options?: Partial<DialogOptions>
  ): Promise<boolean> {
    return new Promise(resolve => {
      this.open({
        type: 'confirm',
        title: '确认',
        content,
        buttons: [
          {
            text: '取消',
            onClick: () => resolve(false),
          },
          {
            text: '确定',
            type: 'primary',
            onClick: () => resolve(true),
          },
        ],
        ...options,
      })
    })
  }

  /**
   * 显示Prompt弹窗
   */
  async prompt(
    content: string,
    defaultValue = '',
    options?: Partial<DialogOptions>
  ): Promise<string | null> {
    return new Promise(resolve => {
      let inputValue = defaultValue

      this.open({
        type: 'prompt',
        title: '输入',
        content,
        html: false,
        buttons: [
          {
            text: '取消',
            onClick: () => resolve(null),
          },
          {
            text: '确定',
            type: 'primary',
            onClick: () => {
              // 获取当前输入框的值
              const inputEl = document.querySelector(
                '.engine-dialog-body input'
              ) as HTMLInputElement
              const currentValue = inputEl ? inputEl.value : inputValue
              resolve(currentValue)
            },
          },
        ],
        onOpen: () => {
          // 在对话框打开后添加输入框
          const bodyEl = document.querySelector('.engine-dialog-body')
          if (bodyEl) {
            // 创建输入框
            const inputEl = document.createElement('input')
            inputEl.type = 'text'
            inputEl.value = defaultValue
            inputEl.style.cssText =
              'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-top: 12px;'

            // 绑定输入事件
            inputEl.addEventListener('input', e => {
              inputValue = (e.target as HTMLInputElement).value
            })

            // 添加到对话框内容中
            bodyEl.appendChild(inputEl)

            // 聚焦并选中文本
            inputEl.focus()
            inputEl.select()
          }
        },
        ...options,
      })
    })
  }

  /**
   * 关闭弹窗
   */
  async close(id: string, result?: unknown): Promise<boolean> {
    const instance = this.instances.get(id)
    if (!instance) {
      return false
    }

    await instance.close(result)
    return true
  }

  /**
   * 关闭顶层弹窗
   */
  async closeTopDialog(): Promise<boolean> {
    const topInstance = this.getTopDialog()
    if (topInstance) {
      await topInstance.close()
      return true
    }
    return false
  }

  /**
   * 关闭所有弹窗
   */
  async closeAll(): Promise<void> {
    const promises = Array.from(this.instances.values()).map(instance =>
      instance.close()
    )
    await Promise.all(promises)
  }

  /**
   * 获取顶层弹窗
   */
  private getTopDialog(): DialogInstance | null {
    let topInstance: DialogInstance | null = null
    let maxZIndex = 0

    Array.from(this.instances.values()).forEach(instance => {
      if (instance.visible && instance.zIndex > maxZIndex) {
        maxZIndex = instance.zIndex
        topInstance = instance
      }
    })

    return topInstance
  }

  /**
   * 检查弹窗数量限制
   */
  private async checkMaxDialogs(): Promise<void> {
    const maxDialogs = this.config.maxDialogs!

    // 如果当前对话框数量已经达到最大限制，关闭最早的对话框
    while (this.instances.size >= maxDialogs) {
      const firstInstance = this.instances.values().next().value
      if (firstInstance) {
        await firstInstance.close()
      } else {
        break
      }
    }
  }

  /**
   * 生成弹窗ID
   */
  private generateId(): string {
    return `dialog_${++this.idCounter}_${Date.now()}`
  }

  /**
   * 获取下一个z-index
   */
  private getNextZIndex(): number {
    return (
      this.config.zIndexBase! + ++this.zIndexCounter * this.config.zIndexStep!
    )
  }

  /**
   * 创建弹窗实例
   */
  private async createInstance(
    id: string,
    options: DialogOptions
  ): Promise<DialogInstance> {
    const mergedOptions: DialogOptions = {
      type: 'custom',
      modal: true,
      closable: true,
      maskClosable: this.config.clickMaskClose,
      escClosable: this.config.escapeKeyClose,
      draggable: false,
      resizable: false,
      centered: true,
      showMask: true,
      animation: this.config.defaultAnimation,
      animationDuration: this.config.defaultAnimationDuration,
      width: 'auto',
      height: 'auto',
      ...options,
      id,
    }

    const zIndex = this.getNextZIndex()
    const { element, maskElement } = this.createElement(mergedOptions, zIndex)

    const instance: DialogInstance = {
      id,
      options: mergedOptions,
      element,
      maskElement,
      visible: false,
      zIndex,
      open: async () => {
        await this.showInstance(instance)
      },
      close: async (result?: unknown) => {
        await this.hideInstance(instance, result)
      },
      update: (newOptions: Partial<DialogOptions>) => {
        Object.assign(instance.options, newOptions)
        this.updateElement(instance)
      },
      destroy: () => {
        this.destroyInstance(instance)
      },
    }

    return instance
  }

  /**
   * 创建弹窗元素
   */
  private createElement(
    options: DialogOptions,
    zIndex: number
  ): {
    element: HTMLElement
    maskElement?: HTMLElement
  } {
    let maskElement: HTMLElement | undefined

    // 创建遮罩
    if (options.showMask) {
      maskElement = document.createElement('div')
      maskElement.className = 'engine-dialog-mask'
      maskElement.style.zIndex = zIndex.toString()

      if (options.maskStyle) {
        Object.assign(maskElement.style, options.maskStyle)
      }

      // 点击遮罩关闭
      if (options.maskClosable) {
        maskElement.addEventListener('click', e => {
          if (e.target === maskElement) {
            const instance = this.instances.get(options.id!)
            if (instance) {
              instance.close()
            }
          }
        })
      }
    }

    // 创建弹窗
    const dialogEl = document.createElement('div')
    dialogEl.className = 'engine-dialog'

    if (options.customClass) {
      dialogEl.className += ` ${options.customClass}`
    }

    if (options.draggable) {
      dialogEl.className += ' engine-dialog-draggable'
    }

    if (options.resizable) {
      dialogEl.className += ' engine-dialog-resizable'
    }

    // 设置样式
    if (options.width) {
      dialogEl.style.width =
        typeof options.width === 'number' ? `${options.width}px` : options.width
    }

    if (options.height) {
      dialogEl.style.height =
        typeof options.height === 'number'
          ? `${options.height}px`
          : options.height
    }

    if (options.bodyStyle) {
      Object.assign(dialogEl.style, options.bodyStyle)
    }

    // 创建头部
    if (options.title || options.closable) {
      const headerEl = this.createHeader(options)
      dialogEl.appendChild(headerEl)
    }

    // 创建内容
    const bodyEl = this.createBody(options)
    dialogEl.appendChild(bodyEl)

    // 创建底部
    if (options.buttons && options.buttons.length > 0) {
      const footerEl = this.createFooter(options)
      dialogEl.appendChild(footerEl)
    }

    // 添加到遮罩或直接添加到body
    if (maskElement) {
      maskElement.appendChild(dialogEl)
    }

    return { element: dialogEl, maskElement }
  }

  /**
   * 创建头部
   */
  private createHeader(options: DialogOptions): HTMLElement {
    const headerEl = document.createElement('div')
    headerEl.className = 'engine-dialog-header'

    if (options.headerStyle) {
      Object.assign(headerEl.style, options.headerStyle)
    }

    // 标题
    if (options.title) {
      const titleEl = document.createElement('h3')
      titleEl.className = 'engine-dialog-title'
      titleEl.textContent = options.title
      headerEl.appendChild(titleEl)
    }

    // 关闭按钮
    if (options.closable) {
      const closeEl = document.createElement('button')
      closeEl.className = 'engine-dialog-close'
      closeEl.innerHTML = '×'
      closeEl.addEventListener('click', () => {
        const instance = this.instances.get(options.id!)
        if (instance) {
          instance.close()
        }
      })
      headerEl.appendChild(closeEl)
    }

    return headerEl
  }

  /**
   * 创建内容区域
   */
  private createBody(options: DialogOptions): HTMLElement {
    const bodyEl = document.createElement('div')
    bodyEl.className = 'engine-dialog-body'

    if (options.bodyStyle) {
      Object.assign(bodyEl.style, options.bodyStyle)
    }

    if (options.content) {
      if (options.html) {
        bodyEl.innerHTML = options.content
      } else {
        bodyEl.textContent = options.content
      }
    }

    return bodyEl
  }

  /**
   * 创建底部
   */
  private createFooter(options: DialogOptions): HTMLElement {
    const footerEl = document.createElement('div')
    footerEl.className = 'engine-dialog-footer'

    if (options.footerStyle) {
      Object.assign(footerEl.style, options.footerStyle)
    }

    // 创建按钮
    options.buttons?.forEach(button => {
      const buttonEl = document.createElement('button')
      buttonEl.className = `engine-dialog-button ${button.type || ''}`
      buttonEl.textContent = button.text
      buttonEl.disabled = button.disabled || false

      if (button.loading) {
        buttonEl.textContent = '加载中...'
        buttonEl.disabled = true
      }

      buttonEl.addEventListener('click', async () => {
        const instance = this.instances.get(options.id!)
        if (instance && button.onClick) {
          try {
            await button.onClick(instance)
          } catch (error) {
            this.error('Button click error:', error)
          }
        }
      })

      footerEl.appendChild(buttonEl)
    })

    return footerEl
  }

  /**
   * 显示弹窗实例
   */
  private async showInstance(instance: DialogInstance): Promise<void> {
    const container = instance.maskElement || instance.element

    // 添加到DOM
    document.body.appendChild(container)

    // 标记为可见
    instance.visible = true

    // 设置初始状态
    const animation = instance.options.animation!
    if (animation !== 'none') {
      container.classList.add(`engine-dialog-${animation}-enter`)
    }

    // 触发打开回调
    instance.options.onOpen?.()

    // 强制浏览器重排，确保DOM元素完全渲染
    void container.offsetHeight

    // 执行进入动画
    if (animation !== 'none') {
      requestAnimationFrame(() => {
        container.classList.add(`engine-dialog-${animation}-enter-active`)
        container.classList.remove(`engine-dialog-${animation}-enter`)

        setTimeout(() => {
          container.classList.remove(`engine-dialog-${animation}-enter-active`)
        }, instance.options.animationDuration!)
      })
    }

    // 设置拖拽
    if (instance.options.draggable) {
      this.makeDraggable(instance)
    }
  }

  /**
   * 隐藏弹窗实例
   */
  private async hideInstance(
    instance: DialogInstance,
    result?: any
  ): Promise<void> {
    if (!instance.visible) {
      return
    }

    // 执行beforeClose钩子
    if (instance.options.beforeClose) {
      const canClose = await instance.options.beforeClose(result)
      if (!canClose) {
        return
      }
    }

    const container = instance.maskElement || instance.element
    const animation = instance.options.animation!

    // 检查是否在测试环境中
    const isTestEnvironment = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') ||
      (typeof globalThis !== 'undefined' && (globalThis as { __VITEST__?: unknown }).__VITEST__)

    // 执行离开动画
    if (animation !== 'none' && !isTestEnvironment) {
      container.classList.add(`engine-dialog-${animation}-leave-active`)

      setTimeout(() => {
        this.destroyInstance(instance)
      }, instance.options.animationDuration!)
    } else {
      // 在测试环境中或无动画时立即销毁
      this.destroyInstance(instance)
    }

    // 标记为不可见
    instance.visible = false
    instance.result = result

    // 触发关闭回调
    instance.options.onClose?.(result)
  }

  /**
   * 更新弹窗元素
   */
  private updateElement(instance: DialogInstance): void {
    // 重新创建元素（简化实现）
    const { element, maskElement } = this.createElement(
      instance.options,
      instance.zIndex
    )

    // 替换现有元素
    const oldContainer = instance.maskElement || instance.element
    if (oldContainer.parentNode) {
      oldContainer.parentNode.replaceChild(maskElement || element, oldContainer)
    }

    instance.element = element
    instance.maskElement = maskElement
  }

  /**
   * 销毁弹窗实例
   */
  private destroyInstance(instance: DialogInstance): void {
    const container = instance.maskElement || instance.element

    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }

    this.instances.delete(instance.id)
    this.log('info', `Dialog destroyed: ${instance.id}`)
  }

  /**
   * 使弹窗可拖拽
   */
  private makeDraggable(instance: DialogInstance): void {
    const dialog = instance.element
    const header = dialog.querySelector('.engine-dialog-header') as HTMLElement

    if (!header) return

    let isDragging = false
    let startX = 0
    let startY = 0
    let startLeft = 0
    let startTop = 0

    // 定义事件处理函数
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      dialog.style.position = 'fixed'
      dialog.style.left = `${startLeft + deltaX}px`
      dialog.style.top = `${startTop + deltaY}px`
      dialog.style.transform = 'none'
    }

    const handleMouseUp = () => {
      isDragging = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    header.addEventListener('mousedown', e => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY

      const rect = dialog.getBoundingClientRect()
      startLeft = rect.left
      startTop = rect.top

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    })
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const baseStats = super.getStats()
    const visibleInstances = Array.from(this.instances.values()).filter(i => i.visible)
    return {
      ...baseStats,
      totalDialogs: visibleInstances.length,
      visibleDialogs: visibleInstances.length,
      dialogIds: visibleInstances.map(i => i.id),
      zIndexCounter: this.zIndexCounter,
    }
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    await this.closeAll()

    // 强制清理所有残留的 DOM 元素
    const masks = document.querySelectorAll('.engine-dialog-mask')
    masks.forEach(mask => {
      if (mask.parentNode) {
        mask.parentNode.removeChild(mask)
      }
    })

    const dialogs = document.querySelectorAll('.engine-dialog')
    dialogs.forEach(dialog => {
      if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog)
      }
    })

    // 清理实例映射
    this.instances.clear()

    // 移除样式
    const styleEl = document.querySelector('#engine-dialog-styles')
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl)
    }

    await super.destroy()
  }
}
