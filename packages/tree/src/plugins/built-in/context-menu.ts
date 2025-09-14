/**
 * 右键菜单插件
 * 
 * 提供树节点的右键菜单功能
 */

import { BasePlugin } from '../core/base-plugin'
import type { PluginContext, PluginConfig } from '../core/plugin-interface'
import type { TreeNode } from '../../types'

/**
 * 右键菜单插件配置
 */
export interface ContextMenuPluginConfig extends PluginConfig {
  /**
   * 菜单项
   */
  items?: ContextMenuItem[]

  /**
   * 菜单样式
   */
  style?: {
    background?: string
    border?: string
    borderRadius?: string
    boxShadow?: string
    minWidth?: string
  }
}

/**
 * 右键菜单项定义
 */
export interface ContextMenuItem {
  /**
   * 菜单项ID
   */
  id: string

  /**
   * 菜单项标题
   */
  title: string

  /**
   * 菜单项图标
   */
  icon?: string

  /**
   * 点击处理函数
   */
  onClick: (node: TreeNode, context: PluginContext) => void

  /**
   * 是否禁用
   */
  disabled?: boolean | ((node: TreeNode, context: PluginContext) => boolean)

  /**
   * 是否可见
   */
  visible?: boolean | ((node: TreeNode, context: PluginContext) => boolean)

  /**
   * 分隔符
   */
  separator?: boolean

  /**
   * 子菜单
   */
  children?: ContextMenuItem[]
}

/**
 * 右键菜单插件类
 */
export class ContextMenuPlugin extends BasePlugin {
  private menuElement?: HTMLElement
  private currentNode?: TreeNode
  private items: Map<string, ContextMenuItem> = new Map()

  constructor(config: ContextMenuPluginConfig = {}) {
    super(
      {
        name: 'context-menu',
        version: '1.0.0',
        description: '树形组件右键菜单插件',
        author: 'LDesign',
        configSchema: {
          items: { type: 'array', default: [] },
          style: { type: 'object', default: {} },
        },
      },
      {
        items: [],
        style: {},
        ...config,
      }
    )

    this.initBuiltInItems()
  }

  /**
   * 初始化内置菜单项
   */
  private initBuiltInItems(): void {
    this.items.set('expand', {
      id: 'expand',
      title: '展开',
      icon: '📂',
      onClick: (node, context) => context.tree.expandNode(node.id),
      visible: (node) => node.hasChildren && !node.expanded,
    })

    this.items.set('collapse', {
      id: 'collapse',
      title: '收起',
      icon: '📁',
      onClick: (node, context) => context.tree.collapseNode(node.id),
      visible: (node) => node.hasChildren && node.expanded,
    })

    this.items.set('separator1', {
      id: 'separator1',
      title: '',
      separator: true,
      onClick: () => {},
    })

    this.items.set('select', {
      id: 'select',
      title: '选择',
      icon: '☑️',
      onClick: (node, context) => context.tree.selectNode(node.id),
      visible: (node) => !node.selected,
    })

    this.items.set('unselect', {
      id: 'unselect',
      title: '取消选择',
      icon: '☐',
      onClick: (node, context) => context.tree.unselectNode(node.id),
      visible: (node) => node.selected,
    })

    this.items.set('separator2', {
      id: 'separator2',
      title: '',
      separator: true,
      onClick: () => {},
    })

    this.items.set('copy', {
      id: 'copy',
      title: '复制',
      icon: '📋',
      onClick: (node, context) => this.copyNode(node),
    })

    this.items.set('cut', {
      id: 'cut',
      title: '剪切',
      icon: '✂️',
      onClick: (node, context) => this.cutNode(node),
    })

    this.items.set('paste', {
      id: 'paste',
      title: '粘贴',
      icon: '📄',
      onClick: (node, context) => this.pasteNode(node),
      disabled: () => !this.hasClipboardData(),
    })

    this.items.set('separator3', {
      id: 'separator3',
      title: '',
      separator: true,
      onClick: () => {},
    })

    this.items.set('delete', {
      id: 'delete',
      title: '删除',
      icon: '🗑️',
      onClick: (node, context) => {
        if (confirm(`确定要删除节点"${node.label}"吗？`)) {
          context.tree.removeNode(node.id)
        }
      },
    })
  }

  /**
   * 安装插件
   */
  install(context: PluginContext): void {
    this.addStyle(`
      .ldesign-tree-context-menu {
        position: fixed;
        background: var(--ldesign-bg-color-container);
        border: 1px solid var(--ldesign-border-color);
        border-radius: var(--ls-border-radius-base);
        box-shadow: var(--ldesign-shadow-2);
        min-width: 120px;
        padding: var(--ls-padding-xs) 0;
        z-index: 9999;
        font-size: var(--ls-font-size-sm);
        user-select: none;
      }

      .ldesign-tree-context-menu__item {
        display: flex;
        align-items: center;
        padding: var(--ls-padding-xs) var(--ls-padding-sm);
        cursor: pointer;
        transition: background-color 0.2s;
        white-space: nowrap;
      }

      .ldesign-tree-context-menu__item:hover {
        background: var(--ldesign-bg-color-container-hover);
      }

      .ldesign-tree-context-menu__item--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ldesign-tree-context-menu__item--disabled:hover {
        background: transparent;
      }

      .ldesign-tree-context-menu__item-icon {
        margin-right: var(--ls-margin-xs);
        font-size: 14px;
      }

      .ldesign-tree-context-menu__separator {
        height: 1px;
        background: var(--ldesign-border-color);
        margin: var(--ls-margin-xs) 0;
      }

      .ldesign-tree-context-menu__submenu {
        position: relative;
      }

      .ldesign-tree-context-menu__submenu::after {
        content: '▶';
        margin-left: auto;
        font-size: 10px;
        opacity: 0.6;
      }

      .ldesign-tree-context-menu__submenu-content {
        position: absolute;
        left: 100%;
        top: 0;
        background: var(--ldesign-bg-color-container);
        border: 1px solid var(--ldesign-border-color);
        border-radius: var(--ls-border-radius-base);
        box-shadow: var(--ldesign-shadow-2);
        min-width: 120px;
        padding: var(--ls-padding-xs) 0;
        display: none;
      }

      .ldesign-tree-context-menu__submenu:hover .ldesign-tree-context-menu__submenu-content {
        display: block;
      }
    `)
  }

  /**
   * 挂载插件
   */
  mounted(context: PluginContext): void {
    this.bindEvents()
  }

  /**
   * 卸载前钩子
   */
  beforeUnmount(context: PluginContext): void {
    this.unbindEvents()
    this.hideMenu()
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.context) return

    const container = this.getContainer()

    // 绑定右键事件
    container.addEventListener('contextmenu', this.handleContextMenu.bind(this))

    // 绑定点击事件（隐藏菜单）
    document.addEventListener('click', this.handleDocumentClick.bind(this))

    // 绑定键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    if (!this.context) return

    const container = this.getContainer()

    container.removeEventListener('contextmenu', this.handleContextMenu.bind(this))
    document.removeEventListener('click', this.handleDocumentClick.bind(this))
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * 处理右键事件
   */
  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault()

    // 查找节点元素
    const nodeElement = (event.target as HTMLElement).closest('[data-node-id]')
    if (!nodeElement) {
      this.hideMenu()
      return
    }

    const nodeId = nodeElement.getAttribute('data-node-id')!
    const node = this.context!.tree.getNode(nodeId)
    if (!node) return

    this.currentNode = node
    this.showMenu(event.clientX, event.clientY)
  }

  /**
   * 处理文档点击事件
   */
  private handleDocumentClick(event: MouseEvent): void {
    if (this.menuElement && !this.menuElement.contains(event.target as Node)) {
      this.hideMenu()
    }
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hideMenu()
    }
  }

  /**
   * 显示菜单
   */
  private showMenu(x: number, y: number): void {
    if (!this.context || !this.currentNode) return

    this.hideMenu()

    const items = this.getConfig<ContextMenuItem[]>('items')
    const style = this.getConfig<any>('style')

    // 创建菜单元素
    this.menuElement = this.createElement('div', {
      className: 'ldesign-tree-context-menu',
      style,
    })

    // 添加菜单项
    const allItems = [...Array.from(this.items.values()), ...items]
    allItems.forEach(item => {
      if (!this.isItemVisible(item)) return

      if (item.separator) {
        const separator = this.createElement('div', {
          className: 'ldesign-tree-context-menu__separator',
        })
        this.menuElement!.appendChild(separator)
      } else {
        const menuItem = this.createMenuItem(item)
        this.menuElement!.appendChild(menuItem)
      }
    })

    // 添加到文档
    document.body.appendChild(this.menuElement)

    // 调整位置
    this.adjustMenuPosition(x, y)
  }

  /**
   * 创建菜单项
   */
  private createMenuItem(item: ContextMenuItem): HTMLElement {
    const isDisabled = this.isItemDisabled(item)

    const menuItem = this.createElement('div', {
      className: `ldesign-tree-context-menu__item ${isDisabled ? 'ldesign-tree-context-menu__item--disabled' : ''}`,
      onClick: () => {
        if (!isDisabled && this.currentNode) {
          item.onClick(this.currentNode, this.context!)
          this.hideMenu()
        }
      },
    })

    if (item.icon) {
      const icon = this.createElement('span', {
        className: 'ldesign-tree-context-menu__item-icon',
        textContent: item.icon,
      })
      menuItem.appendChild(icon)
    }

    const title = this.createElement('span', {
      textContent: item.title,
    })
    menuItem.appendChild(title)

    // 处理子菜单
    if (item.children && item.children.length > 0) {
      menuItem.classList.add('ldesign-tree-context-menu__submenu')

      const submenu = this.createElement('div', {
        className: 'ldesign-tree-context-menu__submenu-content',
      })

      item.children.forEach(child => {
        if (!this.isItemVisible(child)) return

        if (child.separator) {
          const separator = this.createElement('div', {
            className: 'ldesign-tree-context-menu__separator',
          })
          submenu.appendChild(separator)
        } else {
          const childItem = this.createMenuItem(child)
          submenu.appendChild(childItem)
        }
      })

      menuItem.appendChild(submenu)
    }

    return menuItem
  }

  /**
   * 检查菜单项是否可见
   */
  private isItemVisible(item: ContextMenuItem): boolean {
    if (!this.currentNode) return false

    if (typeof item.visible === 'function') {
      return item.visible(this.currentNode, this.context!)
    }

    return item.visible !== false
  }

  /**
   * 检查菜单项是否禁用
   */
  private isItemDisabled(item: ContextMenuItem): boolean {
    if (!this.currentNode) return true

    if (typeof item.disabled === 'function') {
      return item.disabled(this.currentNode, this.context!)
    }

    return item.disabled === true
  }

  /**
   * 调整菜单位置
   */
  private adjustMenuPosition(x: number, y: number): void {
    if (!this.menuElement) return

    const rect = this.menuElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let left = x
    let top = y

    // 防止菜单超出右边界
    if (left + rect.width > viewportWidth) {
      left = viewportWidth - rect.width - 10
    }

    // 防止菜单超出下边界
    if (top + rect.height > viewportHeight) {
      top = viewportHeight - rect.height - 10
    }

    // 防止菜单超出左边界
    if (left < 0) {
      left = 10
    }

    // 防止菜单超出上边界
    if (top < 0) {
      top = 10
    }

    this.menuElement.style.left = `${left}px`
    this.menuElement.style.top = `${top}px`
  }

  /**
   * 隐藏菜单
   */
  private hideMenu(): void {
    if (this.menuElement && this.menuElement.parentNode) {
      document.body.removeChild(this.menuElement)
      this.menuElement = undefined
    }
    this.currentNode = undefined
  }

  /**
   * 复制节点
   */
  private copyNode(node: TreeNode): void {
    localStorage.setItem('ldesign-tree-clipboard', JSON.stringify({
      action: 'copy',
      node: node,
    }))
  }

  /**
   * 剪切节点
   */
  private cutNode(node: TreeNode): void {
    localStorage.setItem('ldesign-tree-clipboard', JSON.stringify({
      action: 'cut',
      node: node,
    }))
  }

  /**
   * 粘贴节点
   */
  private pasteNode(targetNode: TreeNode): void {
    const clipboardData = this.getClipboardData()
    if (!clipboardData) return

    const { action, node } = clipboardData

    if (action === 'copy') {
      // 复制节点
      const newNode = { ...node, id: `${node.id}_copy_${Date.now()}` }
      this.context!.tree.addNode(newNode, targetNode.id)
    } else if (action === 'cut') {
      // 移动节点
      this.context!.tree.moveNode(node.id, targetNode.id)
      localStorage.removeItem('ldesign-tree-clipboard')
    }
  }

  /**
   * 获取剪贴板数据
   */
  private getClipboardData(): any {
    try {
      const data = localStorage.getItem('ldesign-tree-clipboard')
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  /**
   * 检查是否有剪贴板数据
   */
  private hasClipboardData(): boolean {
    return !!this.getClipboardData()
  }

  /**
   * 添加菜单项
   */
  addItem(item: ContextMenuItem): void {
    this.items.set(item.id, item)
  }

  /**
   * 移除菜单项
   */
  removeItem(itemId: string): void {
    this.items.delete(itemId)
  }

  /**
   * 插件API
   */
  api = {
    addItem: this.addItem.bind(this),
    removeItem: this.removeItem.bind(this),
    showMenu: this.showMenu.bind(this),
    hideMenu: this.hideMenu.bind(this),
  }
}

/**
 * 右键菜单插件工厂函数
 */
export function createContextMenuPlugin(config?: ContextMenuPluginConfig): ContextMenuPlugin {
  return new ContextMenuPlugin(config)
}
