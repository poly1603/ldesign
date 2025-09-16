/**
 * 右键菜单组件
 */

import { DOMUtils } from '../utils/dom'
import type { DateInput } from '../types'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  disabled?: boolean
  action?: () => void
  divider?: boolean
}

export interface ContextMenuOptions {
  items: ContextMenuItem[]
  x: number
  y: number
  date?: DateInput
  event?: any
}

export class ContextMenu {
  private element: HTMLElement | null = null
  private isVisible = false
  private options: ContextMenuOptions | null = null

  constructor() {
    this.bindEvents()
  }

  /**
   * 显示右键菜单
   */
  public show(options: ContextMenuOptions): void {
    this.hide()
    this.options = options
    this.createElement()
    this.positionMenu()
    this.isVisible = true
  }

  /**
   * 隐藏右键菜单
   */
  public hide(): void {
    if (this.element) {
      this.element.remove()
      this.element = null
    }
    this.isVisible = false
    this.options = null
  }

  /**
   * 检查菜单是否可见
   */
  public get visible(): boolean {
    return this.isVisible
  }

  /**
   * 创建菜单元素
   */
  private createElement(): void {
    if (!this.options) return

    this.element = DOMUtils.createElement('div', 'ldesign-calendar-context-menu')
    
    this.options.items.forEach(item => {
      if (item.divider) {
        const divider = DOMUtils.createElement('div', 'ldesign-calendar-context-menu-divider')
        this.element!.appendChild(divider)
        return
      }

      const menuItem = DOMUtils.createElement('div', 'ldesign-calendar-context-menu-item')
      
      if (item.disabled) {
        menuItem.classList.add('disabled')
      }

      if (item.icon) {
        const icon = DOMUtils.createElement('div', 'ldesign-calendar-context-menu-icon')
        icon.innerHTML = item.icon
        menuItem.appendChild(icon)
      }

      const label = DOMUtils.createElement('span')
      label.textContent = item.label
      menuItem.appendChild(label)

      if (!item.disabled && item.action) {
        menuItem.addEventListener('click', (e) => {
          e.stopPropagation()
          item.action!()
          this.hide()
        })
      }

      this.element!.appendChild(menuItem)
    })

    document.body.appendChild(this.element)
  }

  /**
   * 定位菜单
   */
  private positionMenu(): void {
    if (!this.element || !this.options) return

    const { x, y } = this.options
    const rect = this.element.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let left = x
    let top = y

    // 防止菜单超出视口右边界
    if (left + rect.width > viewportWidth) {
      left = viewportWidth - rect.width - 10
    }

    // 防止菜单超出视口下边界
    if (top + rect.height > viewportHeight) {
      top = viewportHeight - rect.height - 10
    }

    // 防止菜单超出视口左边界和上边界
    left = Math.max(10, left)
    top = Math.max(10, top)

    this.element.style.left = `${left}px`
    this.element.style.top = `${top}px`
  }

  /**
   * 绑定全局事件
   */
  private bindEvents(): void {
    // 点击其他地方隐藏菜单
    document.addEventListener('click', () => {
      this.hide()
    })

    // 滚动时隐藏菜单
    document.addEventListener('scroll', () => {
      this.hide()
    })

    // 窗口大小改变时隐藏菜单
    window.addEventListener('resize', () => {
      this.hide()
    })

    // ESC键隐藏菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide()
      }
    })
  }

  /**
   * 销毁菜单
   */
  public destroy(): void {
    this.hide()
  }
}

/**
 * 创建默认的日期右键菜单项
 */
export function createDateContextMenuItems(date: DateInput, callbacks: {
  onCreateEvent?: (date: DateInput) => void
  onViewDetails?: (date: DateInput) => void
  onGoToToday?: () => void
}): ContextMenuItem[] {
  return [
    {
      id: 'create-event',
      label: '新建日程',
      icon: '➕',
      action: () => callbacks.onCreateEvent?.(date)
    },
    {
      id: 'view-details',
      label: '查看详情',
      icon: '📅',
      action: () => callbacks.onViewDetails?.(date)
    },
    {
      id: 'divider-1',
      label: '',
      divider: true
    },
    {
      id: 'go-today',
      label: '回到今天',
      icon: '🏠',
      action: () => callbacks.onGoToToday?.()
    }
  ]
}

/**
 * 创建默认的事件右键菜单项
 */
export function createEventContextMenuItems(event: any, callbacks: {
  onEditEvent?: (event: any) => void
  onDeleteEvent?: (event: any) => void
  onDuplicateEvent?: (event: any) => void
}): ContextMenuItem[] {
  return [
    {
      id: 'edit-event',
      label: '编辑日程',
      icon: '✏️',
      action: () => callbacks.onEditEvent?.(event)
    },
    {
      id: 'duplicate-event',
      label: '复制日程',
      icon: '📋',
      action: () => callbacks.onDuplicateEvent?.(event)
    },
    {
      id: 'divider-1',
      label: '',
      divider: true
    },
    {
      id: 'delete-event',
      label: '删除日程',
      icon: '🗑️',
      action: () => callbacks.onDeleteEvent?.(event)
    }
  ]
}
