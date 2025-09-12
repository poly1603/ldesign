/**
 * 历史记录面板
 * 
 * 显示和管理流程图的历史记录
 */

import type { FlowchartTheme } from '../../types'

/**
 * 历史记录项接口
 */
interface HistoryItem {
  timestamp: number
  data: any
  description: string
}

/**
 * 历史记录面板配置
 */
export interface HistoryPanelConfig {
  visible?: boolean
  position?: 'left' | 'right'
  width?: number
  onHistorySelect?: (index: number) => void
  onHistoryUndo?: () => void
  onHistoryRedo?: () => void
  onHistoryClear?: () => void
}

/**
 * 历史记录面板类
 */
export class HistoryPanel {
  private config: HistoryPanelConfig
  private panelElement: HTMLElement | null = null
  private historyList: HistoryItem[] = []
  private currentIndex: number = -1
  private currentTheme: FlowchartTheme = 'default'

  constructor(config: HistoryPanelConfig = {}) {
    this.config = {
      visible: true,
      position: 'right',
      width: 280,
      ...config
    }
  }

  /**
   * 创建面板
   */
  create(): HTMLElement {
    this.panelElement = document.createElement('div')
    this.panelElement.className = 'ldesign-history-panel'
    this.panelElement.style.cssText = `
      width: ${this.config.width}px;
      height: 100%;
      background: var(--panel-bg, #ffffff);
      border-left: 1px solid var(--panel-border, #e5e5e5);
      display: ${this.config.visible ? 'flex' : 'none'};
      flex-direction: column;
      overflow: hidden;
    `

    this.createHeader()
    this.createContent()
    this.createFooter()
    this.applyStyles()

    return this.panelElement
  }

  /**
   * 创建头部
   */
  private createHeader(): void {
    if (!this.panelElement) return

    const header = document.createElement('div')
    header.className = 'panel-header'
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid var(--panel-border, #e5e5e5);
      background: var(--panel-bg, #f8f8f8);
    `

    const title = document.createElement('h3')
    title.textContent = '历史记录'
    title.style.cssText = `
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--panel-text, rgba(0, 0, 0, 0.9));
    `

    const subtitle = document.createElement('p')
    subtitle.textContent = '查看和管理操作历史'
    subtitle.style.cssText = `
      margin: 0;
      font-size: 12px;
      color: var(--panel-text-secondary, rgba(0, 0, 0, 0.7));
    `

    header.appendChild(title)
    header.appendChild(subtitle)
    this.panelElement.appendChild(header)
  }

  /**
   * 创建内容区域
   */
  private createContent(): void {
    if (!this.panelElement) return

    const content = document.createElement('div')
    content.className = 'panel-content'
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    `

    const historyContainer = document.createElement('div')
    historyContainer.className = 'history-container'
    historyContainer.id = 'history-container'

    content.appendChild(historyContainer)
    this.panelElement.appendChild(content)

    this.updateHistoryList()
  }

  /**
   * 创建底部操作区
   */
  private createFooter(): void {
    if (!this.panelElement) return

    const footer = document.createElement('div')
    footer.className = 'panel-footer'
    footer.style.cssText = `
      padding: 12px 16px;
      border-top: 1px solid var(--panel-border, #e5e5e5);
      display: flex;
      gap: 8px;
    `

    // 撤销按钮
    const undoBtn = this.createButton('撤销', () => {
      this.config.onHistoryUndo?.()
    })

    // 重做按钮
    const redoBtn = this.createButton('重做', () => {
      this.config.onHistoryRedo?.()
    })

    // 清空按钮
    const clearBtn = this.createButton('清空', () => {
      if (confirm('确定要清空所有历史记录吗？')) {
        this.config.onHistoryClear?.()
      }
    })

    footer.appendChild(undoBtn)
    footer.appendChild(redoBtn)
    footer.appendChild(clearBtn)
    this.panelElement.appendChild(footer)
  }

  /**
   * 创建按钮
   */
  private createButton(text: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button')
    button.textContent = text
    button.className = 'history-button'
    button.style.cssText = `
      flex: 1;
      padding: 6px 12px;
      border: 1px solid var(--input-border, #d9d9d9);
      background: var(--button-bg, #f0f0f0);
      color: var(--panel-text, rgba(0, 0, 0, 0.9));
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    `

    button.addEventListener('click', onClick)
    button.addEventListener('mouseenter', () => {
      button.style.background = 'var(--button-hover, #e0e0e0)'
    })
    button.addEventListener('mouseleave', () => {
      button.style.background = 'var(--button-bg, #f0f0f0)'
    })

    return button
  }

  /**
   * 更新历史记录列表
   */
  updateHistoryList(): void {
    const container = document.getElementById('history-container')
    if (!container) return

    container.innerHTML = ''

    if (this.historyList.length === 0) {
      const emptyState = document.createElement('div')
      emptyState.className = 'empty-state'
      emptyState.style.cssText = `
        text-align: center;
        padding: 40px 20px;
        color: var(--panel-text-secondary, rgba(0, 0, 0, 0.5));
        font-size: 14px;
      `
      emptyState.textContent = '暂无历史记录'
      container.appendChild(emptyState)
      return
    }

    this.historyList.forEach((item, index) => {
      const historyItem = this.createHistoryItem(item, index)
      container.appendChild(historyItem)
    })
  }

  /**
   * 创建历史记录项
   */
  private createHistoryItem(item: HistoryItem, index: number): HTMLElement {
    const itemElement = document.createElement('div')
    itemElement.className = `history-item ${index === this.currentIndex ? 'current' : ''}`
    itemElement.style.cssText = `
      padding: 12px;
      margin-bottom: 4px;
      border: 1px solid var(--panel-border, #e5e5e5);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      ${index === this.currentIndex ? 'background: var(--ldesign-brand-color-1, #f1ecf9); border-color: var(--ldesign-brand-color, #722ED1);' : 'background: var(--input-bg, #ffffff);'}
    `

    const description = document.createElement('div')
    description.className = 'history-description'
    description.textContent = item.description
    description.style.cssText = `
      font-size: 13px;
      font-weight: 500;
      color: var(--panel-text, rgba(0, 0, 0, 0.9));
      margin-bottom: 4px;
    `

    const timestamp = document.createElement('div')
    timestamp.className = 'history-timestamp'
    timestamp.textContent = new Date(item.timestamp).toLocaleString()
    timestamp.style.cssText = `
      font-size: 11px;
      color: var(--panel-text-secondary, rgba(0, 0, 0, 0.6));
    `

    itemElement.appendChild(description)
    itemElement.appendChild(timestamp)

    // 点击事件
    itemElement.addEventListener('click', () => {
      this.config.onHistorySelect?.(index)
    })

    // 悬停效果
    itemElement.addEventListener('mouseenter', () => {
      if (index !== this.currentIndex) {
        itemElement.style.background = 'var(--panel-hover, #f8f8f8)'
      }
    })
    itemElement.addEventListener('mouseleave', () => {
      if (index !== this.currentIndex) {
        itemElement.style.background = 'var(--input-bg, #ffffff)'
      }
    })

    return itemElement
  }

  /**
   * 设置历史记录数据
   */
  setHistoryData(historyList: HistoryItem[], currentIndex: number): void {
    this.historyList = historyList
    this.currentIndex = currentIndex
    this.updateHistoryList()
  }

  /**
   * 设置主题
   */
  setTheme(theme: FlowchartTheme): void {
    this.currentTheme = theme
    // 主题变化时，CSS变量会自动更新
  }

  /**
   * 显示/隐藏面板
   */
  setVisible(visible: boolean): void {
    if (this.panelElement) {
      this.panelElement.style.display = visible ? 'flex' : 'none'
    }
    this.config.visible = visible
  }

  /**
   * 应用样式
   */
  private applyStyles(): void {
    // 样式已经通过内联样式和CSS变量应用
  }

  /**
   * 销毁面板
   */
  destroy(): void {
    if (this.panelElement) {
      this.panelElement.remove()
      this.panelElement = null
    }
  }
}
