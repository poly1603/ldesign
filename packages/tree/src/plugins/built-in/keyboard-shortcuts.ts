/**
 * 快捷键插件
 * 
 * 为树形组件提供键盘快捷键支持
 */

import { BasePlugin } from '../core/base-plugin'
import type { PluginContext, PluginConfig } from '../core/plugin-interface'

/**
 * 快捷键配置
 */
export interface KeyboardShortcut {
  /** 快捷键组合 */
  key: string
  /** 描述 */
  description: string
  /** 处理函数 */
  handler: (context: PluginContext, event: KeyboardEvent) => void
  /** 是否阻止默认行为 */
  preventDefault?: boolean
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean
  /** 是否只在树获得焦点时生效 */
  treeOnly?: boolean
}

/**
 * 快捷键插件配置
 */
export interface KeyboardShortcutsPluginConfig extends PluginConfig {
  /**
   * 快捷键映射
   */
  shortcuts?: Record<string, KeyboardShortcut>

  /**
   * 是否显示快捷键帮助
   */
  showHelp?: boolean

  /**
   * 帮助面板位置
   */
  helpPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  /**
   * 是否启用全局快捷键
   */
  globalShortcuts?: boolean

  /**
   * 快捷键帮助触发键
   */
  helpKey?: string
}

/**
 * 快捷键插件类
 */
export class KeyboardShortcutsPlugin extends BasePlugin {
  private shortcuts = new Map<string, KeyboardShortcut>()
  private helpElement?: HTMLElement
  private helpVisible = false
  private boundKeyHandler?: (event: KeyboardEvent) => void

  constructor(config: KeyboardShortcutsPluginConfig = {}) {
    super(
      {
        name: 'keyboard-shortcuts',
        version: '1.0.0',
        description: '树形组件快捷键插件',
        author: 'LDesign',
        configSchema: {
          shortcuts: { type: 'object', default: {} },
          showHelp: { type: 'boolean', default: true },
          helpPosition: { type: 'string', default: 'top-right' },
          globalShortcuts: { type: 'boolean', default: false },
          helpKey: { type: 'string', default: 'F1' },
        },
      },
      {
        shortcuts: {},
        showHelp: true,
        helpPosition: 'top-right',
        globalShortcuts: false,
        helpKey: 'F1',
        ...config,
      }
    )

    this.initDefaultShortcuts()
  }

  /**
   * 初始化默认快捷键
   */
  private initDefaultShortcuts(): void {
    const defaultShortcuts: Record<string, KeyboardShortcut> = {
      'Ctrl+A': {
        key: 'Ctrl+A',
        description: '全选',
        handler: (context) => context.tree.selectAll(),
        preventDefault: true,
        treeOnly: true,
      },
      'Ctrl+D': {
        key: 'Ctrl+D',
        description: '取消选择',
        handler: (context) => context.tree.unselectAll(),
        preventDefault: true,
        treeOnly: true,
      },
      'Ctrl+E': {
        key: 'Ctrl+E',
        description: '展开所有',
        handler: (context) => context.tree.expandAll(),
        preventDefault: true,
        treeOnly: true,
      },
      'Ctrl+Shift+E': {
        key: 'Ctrl+Shift+E',
        description: '收起所有',
        handler: (context) => context.tree.collapseAll(),
        preventDefault: true,
        treeOnly: true,
      },
      'Ctrl+F': {
        key: 'Ctrl+F',
        description: '搜索',
        handler: (context) => this.focusSearch(context),
        preventDefault: true,
        treeOnly: true,
      },
      'Delete': {
        key: 'Delete',
        description: '删除选中节点',
        handler: (context) => this.deleteSelectedNodes(context),
        preventDefault: true,
        treeOnly: true,
      },
      'F2': {
        key: 'F2',
        description: '重命名节点',
        handler: (context) => this.renameSelectedNode(context),
        preventDefault: true,
        treeOnly: true,
      },
      'Escape': {
        key: 'Escape',
        description: '取消操作/关闭帮助',
        handler: (context) => this.handleEscape(context),
        preventDefault: true,
      },
      'ArrowUp': {
        key: 'ArrowUp',
        description: '向上导航',
        handler: (context) => context.tree.navigateToPrevious(),
        preventDefault: true,
        treeOnly: true,
      },
      'ArrowDown': {
        key: 'ArrowDown',
        description: '向下导航',
        handler: (context) => context.tree.navigateToNext(),
        preventDefault: true,
        treeOnly: true,
      },
      'ArrowLeft': {
        key: 'ArrowLeft',
        description: '收起节点',
        handler: (context) => this.collapseCurrentNode(context),
        preventDefault: true,
        treeOnly: true,
      },
      'ArrowRight': {
        key: 'ArrowRight',
        description: '展开节点',
        handler: (context) => this.expandCurrentNode(context),
        preventDefault: true,
        treeOnly: true,
      },
      'Enter': {
        key: 'Enter',
        description: '选择/激活节点',
        handler: (context) => this.activateCurrentNode(context),
        preventDefault: true,
        treeOnly: true,
      },
      'Space': {
        key: 'Space',
        description: '切换选择状态',
        handler: (context) => this.toggleCurrentNode(context),
        preventDefault: true,
        treeOnly: true,
      },
    }

    // 合并默认快捷键和用户配置的快捷键
    const userShortcuts = this.getConfig<KeyboardShortcutsPluginConfig>('shortcuts') || {}
    const allShortcuts = { ...defaultShortcuts, ...userShortcuts }

    Object.entries(allShortcuts).forEach(([key, shortcut]) => {
      this.shortcuts.set(key, shortcut)
    })
  }

  /**
   * 插件挂载
   */
  mounted(context: PluginContext): void {
    this.bindKeyboardEvents(context)
    this.createHelpElement(context)
    
    // 绑定帮助快捷键
    const helpKey = this.getConfig<KeyboardShortcutsPluginConfig>('helpKey')
    if (helpKey) {
      this.shortcuts.set(helpKey, {
        key: helpKey,
        description: '显示/隐藏快捷键帮助',
        handler: () => this.toggleHelp(),
        preventDefault: true,
      })
    }
  }

  /**
   * 插件卸载前
   */
  beforeUnmount(context: PluginContext): void {
    this.unbindKeyboardEvents()
    this.removeHelpElement()
  }

  /**
   * 绑定键盘事件
   */
  private bindKeyboardEvents(context: PluginContext): void {
    this.boundKeyHandler = (event: KeyboardEvent) => {
      this.handleKeyboardEvent(context, event)
    }

    const globalShortcuts = this.getConfig<KeyboardShortcutsPluginConfig>('globalShortcuts')
    if (globalShortcuts) {
      document.addEventListener('keydown', this.boundKeyHandler)
    } else {
      const container = context.getContainer()
      container.addEventListener('keydown', this.boundKeyHandler)
      // 确保容器可以获得焦点
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '0')
      }
    }
  }

  /**
   * 解绑键盘事件
   */
  private unbindKeyboardEvents(): void {
    if (this.boundKeyHandler) {
      document.removeEventListener('keydown', this.boundKeyHandler)
      if (this.context) {
        const container = this.context.getContainer()
        container.removeEventListener('keydown', this.boundKeyHandler)
      }
      this.boundKeyHandler = undefined
    }
  }

  /**
   * 处理键盘事件
   */
  private handleKeyboardEvent(context: PluginContext, event: KeyboardEvent): void {
    const keyString = this.getKeyString(event)
    const shortcut = this.shortcuts.get(keyString)

    if (!shortcut) return

    // 检查是否只在树获得焦点时生效
    if (shortcut.treeOnly) {
      const container = context.getContainer()
      const activeElement = document.activeElement
      if (!container.contains(activeElement) && activeElement !== container) {
        return
      }
    }

    // 执行快捷键处理函数
    try {
      shortcut.handler(context, event)

      if (shortcut.preventDefault) {
        event.preventDefault()
      }

      if (shortcut.stopPropagation) {
        event.stopPropagation()
      }

      // 发送快捷键事件
      context.emit('shortcut:executed', { key: keyString, shortcut, event })
    } catch (error) {
      this.error('快捷键处理错误:', error)
    }
  }

  /**
   * 获取按键字符串
   */
  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = []

    if (event.ctrlKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')
    if (event.metaKey) parts.push('Meta')

    parts.push(event.key)

    return parts.join('+')
  }

  /**
   * 创建帮助元素
   */
  private createHelpElement(context: PluginContext): void {
    if (!this.getConfig<KeyboardShortcutsPluginConfig>('showHelp')) return

    const container = context.getContainer()
    const position = this.getConfig<KeyboardShortcutsPluginConfig>('helpPosition')

    this.helpElement = context.createElement('div', {
      className: 'ldesign-tree-shortcuts-help',
      style: {
        position: 'absolute',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: '1000',
        maxWidth: '300px',
        display: 'none',
        ...this.getPositionStyles(position),
      },
    })

    // 创建帮助内容
    const title = context.createElement('div', {
      textContent: '快捷键帮助',
      style: {
        fontWeight: 'bold',
        marginBottom: '12px',
        fontSize: '14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        paddingBottom: '8px',
      },
    })
    this.helpElement.appendChild(title)

    const shortcutsList = context.createElement('div')
    Array.from(this.shortcuts.values()).forEach(shortcut => {
      const shortcutItem = context.createElement('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          alignItems: 'center',
        },
      })

      const keyElement = context.createElement('kbd', {
        textContent: shortcut.key,
        style: {
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '11px',
          fontFamily: 'monospace',
        },
      })

      const descElement = context.createElement('span', {
        textContent: shortcut.description,
        style: { marginLeft: '12px', flex: '1' },
      })

      shortcutItem.appendChild(keyElement)
      shortcutItem.appendChild(descElement)
      shortcutsList.appendChild(shortcutItem)
    })

    this.helpElement.appendChild(shortcutsList)

    // 确保容器有相对定位
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative'
    }

    container.appendChild(this.helpElement)
  }

  /**
   * 获取位置样式
   */
  private getPositionStyles(position?: string): Record<string, string> {
    switch (position) {
      case 'top-left':
        return { top: '8px', left: '8px' }
      case 'top-right':
        return { top: '8px', right: '8px' }
      case 'bottom-left':
        return { bottom: '8px', left: '8px' }
      case 'bottom-right':
        return { bottom: '8px', right: '8px' }
      default:
        return { top: '8px', right: '8px' }
    }
  }

  /**
   * 移除帮助元素
   */
  private removeHelpElement(): void {
    if (this.helpElement && this.helpElement.parentNode) {
      this.helpElement.parentNode.removeChild(this.helpElement)
      this.helpElement = undefined
    }
  }

  /**
   * 切换帮助显示
   */
  private toggleHelp(): void {
    if (!this.helpElement) return

    this.helpVisible = !this.helpVisible
    this.helpElement.style.display = this.helpVisible ? 'block' : 'none'
  }

  /**
   * 处理 Escape 键
   */
  private handleEscape(context: PluginContext): void {
    if (this.helpVisible) {
      this.toggleHelp()
    } else {
      // 取消当前操作
      context.emit('operation:cancel')
    }
  }

  /**
   * 聚焦搜索框
   */
  private focusSearch(context: PluginContext): void {
    const searchInput = context.getContainer().querySelector('.ldesign-tree-search input') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
      searchInput.select()
    }
  }

  /**
   * 删除选中节点
   */
  private deleteSelectedNodes(context: PluginContext): void {
    const selectedNodes = context.getSelectedNodes()
    if (selectedNodes.length > 0) {
      context.emit('nodes:delete', selectedNodes)
    }
  }

  /**
   * 重命名选中节点
   */
  private renameSelectedNode(context: PluginContext): void {
    const selectedNodes = context.getSelectedNodes()
    if (selectedNodes.length === 1) {
      context.emit('node:rename', selectedNodes[0])
    }
  }

  /**
   * 收起当前节点
   */
  private collapseCurrentNode(context: PluginContext): void {
    const currentNode = this.getCurrentNode(context)
    if (currentNode && currentNode.expanded) {
      context.tree.collapseNode(currentNode.id)
    }
  }

  /**
   * 展开当前节点
   */
  private expandCurrentNode(context: PluginContext): void {
    const currentNode = this.getCurrentNode(context)
    if (currentNode && !currentNode.expanded && currentNode.hasChildren) {
      context.tree.expandNode(currentNode.id)
    }
  }

  /**
   * 激活当前节点
   */
  private activateCurrentNode(context: PluginContext): void {
    const currentNode = this.getCurrentNode(context)
    if (currentNode) {
      context.emit('node:activate', currentNode)
    }
  }

  /**
   * 切换当前节点选择状态
   */
  private toggleCurrentNode(context: PluginContext): void {
    const currentNode = this.getCurrentNode(context)
    if (currentNode) {
      if (currentNode.selected) {
        context.tree.unselectNode(currentNode.id)
      } else {
        context.tree.selectNode(currentNode.id)
      }
    }
  }

  /**
   * 获取当前焦点节点
   */
  private getCurrentNode(context: PluginContext): any {
    // 这里需要根据实际的树实现来获取当前焦点节点
    const selectedNodes = context.getSelectedNodes()
    return selectedNodes.length > 0 ? selectedNodes[0] : null
  }

  /**
   * 添加快捷键
   */
  addShortcut(key: string, shortcut: KeyboardShortcut): void {
    this.shortcuts.set(key, shortcut)
  }

  /**
   * 移除快捷键
   */
  removeShortcut(key: string): void {
    this.shortcuts.delete(key)
  }

  /**
   * 获取所有快捷键
   */
  getShortcuts(): Map<string, KeyboardShortcut> {
    return new Map(this.shortcuts)
  }
}

/**
 * 创建快捷键插件实例
 */
export function createKeyboardShortcutsPlugin(config?: KeyboardShortcutsPluginConfig): KeyboardShortcutsPlugin {
  return new KeyboardShortcutsPlugin(config)
}
