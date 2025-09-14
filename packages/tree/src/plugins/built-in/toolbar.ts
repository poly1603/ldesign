/**
 * 工具栏插件
 * 
 * 提供常用的树操作工具栏
 */

import { BasePlugin } from '../core/base-plugin'
import type { PluginContext, PluginConfig } from '../core/plugin-interface'

/**
 * 工具栏插件配置
 */
export interface ToolbarPluginConfig extends PluginConfig {
  /**
   * 工具栏位置
   */
  position?: 'top' | 'bottom' | 'left' | 'right'

  /**
   * 显示的工具按钮
   */
  tools?: string[]

  /**
   * 自定义工具按钮
   */
  customTools?: ToolbarTool[]

  /**
   * 工具栏样式
   */
  style?: {
    background?: string
    border?: string
    padding?: string
    gap?: string
  }
}

/**
 * 工具栏工具定义
 */
export interface ToolbarTool {
  /**
   * 工具ID
   */
  id: string

  /**
   * 工具标题
   */
  title: string

  /**
   * 工具图标
   */
  icon: string

  /**
   * 点击处理函数
   */
  onClick: (context: PluginContext) => void

  /**
   * 是否禁用
   */
  disabled?: boolean | ((context: PluginContext) => boolean)

  /**
   * 是否可见
   */
  visible?: boolean | ((context: PluginContext) => boolean)
}

/**
 * 工具栏插件类
 */
export class ToolbarPlugin extends BasePlugin {
  private toolbarElement?: HTMLElement
  private tools: Map<string, ToolbarTool> = new Map()

  constructor(config: ToolbarPluginConfig = {}) {
    super(
      {
        name: 'toolbar',
        version: '1.0.0',
        description: '树形组件工具栏插件',
        author: 'LDesign',
        configSchema: {
          position: { type: 'string', default: 'top' },
          tools: { type: 'array', default: ['expand-all', 'collapse-all', 'refresh'] },
          customTools: { type: 'array', default: [] },
          style: { type: 'object', default: {} },
        },
      },
      {
        position: 'top',
        tools: ['expand-all', 'collapse-all', 'refresh'],
        customTools: [],
        style: {},
        ...config,
      }
    )

    this.initBuiltInTools()
  }

  /**
   * 初始化内置工具
   */
  private initBuiltInTools(): void {
    this.tools.set('expand-all', {
      id: 'expand-all',
      title: '展开所有',
      icon: '📂',
      onClick: (context) => context.tree.expandAll(),
    })

    this.tools.set('collapse-all', {
      id: 'collapse-all',
      title: '收起所有',
      icon: '📁',
      onClick: (context) => context.tree.collapseAll(),
    })

    this.tools.set('refresh', {
      id: 'refresh',
      title: '刷新',
      icon: '🔄',
      onClick: (context) => context.tree.refresh(),
    })

    this.tools.set('select-all', {
      id: 'select-all',
      title: '选择所有',
      icon: '☑️',
      onClick: (context) => context.tree.selectAll(),
    })

    this.tools.set('unselect-all', {
      id: 'unselect-all',
      title: '取消选择',
      icon: '☐',
      onClick: (context) => context.tree.unselectAll(),
    })

    this.tools.set('search', {
      id: 'search',
      title: '搜索',
      icon: '🔍',
      onClick: (context) => this.toggleSearch(),
    })
  }

  /**
   * 安装插件
   */
  install(context: PluginContext): void {
    this.addStyle(`
      .ldesign-tree-toolbar {
        display: flex;
        align-items: center;
        gap: var(--ls-spacing-xs);
        padding: var(--ls-padding-sm);
        background: var(--ldesign-bg-color-container);
        border: 1px solid var(--ldesign-border-color);
        border-radius: var(--ls-border-radius-base);
        font-size: var(--ls-font-size-sm);
      }

      .ldesign-tree-toolbar--top {
        border-bottom: none;
        border-radius: var(--ls-border-radius-base) var(--ls-border-radius-base) 0 0;
      }

      .ldesign-tree-toolbar--bottom {
        border-top: none;
        border-radius: 0 0 var(--ls-border-radius-base) var(--ls-border-radius-base);
      }

      .ldesign-tree-toolbar--left {
        flex-direction: column;
        border-right: none;
        border-radius: var(--ls-border-radius-base) 0 0 var(--ls-border-radius-base);
      }

      .ldesign-tree-toolbar--right {
        flex-direction: column;
        border-left: none;
        border-radius: 0 var(--ls-border-radius-base) var(--ls-border-radius-base) 0;
      }

      .ldesign-tree-toolbar__tool {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: var(--ls-border-radius-sm);
        cursor: pointer;
        transition: background-color 0.2s;
        font-size: 16px;
      }

      .ldesign-tree-toolbar__tool:hover {
        background: var(--ldesign-bg-color-container-hover);
      }

      .ldesign-tree-toolbar__tool:active {
        background: var(--ldesign-bg-color-container-active);
      }

      .ldesign-tree-toolbar__tool:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ldesign-tree-toolbar__tool:disabled:hover {
        background: transparent;
      }

      .ldesign-tree-toolbar__separator {
        width: 1px;
        height: 20px;
        background: var(--ldesign-border-color);
        margin: 0 var(--ls-spacing-xs);
      }

      .ldesign-tree-toolbar--left .ldesign-tree-toolbar__separator,
      .ldesign-tree-toolbar--right .ldesign-tree-toolbar__separator {
        width: 20px;
        height: 1px;
        margin: var(--ls-spacing-xs) 0;
      }
    `)
  }

  /**
   * 挂载插件
   */
  mounted(context: PluginContext): void {
    this.createToolbar()
  }

  /**
   * 卸载前钩子
   */
  beforeUnmount(context: PluginContext): void {
    this.destroyToolbar()
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    if (!this.context) return

    const container = this.getContainer()
    const position = this.getConfig<string>('position')
    const tools = this.getConfig<string[]>('tools')
    const customTools = this.getConfig<ToolbarTool[]>('customTools')
    const style = this.getConfig<any>('style')

    // 创建工具栏元素
    this.toolbarElement = this.createElement('div', {
      className: `ldesign-tree-toolbar ldesign-tree-toolbar--${position}`,
      style,
    })

    // 添加自定义工具
    if (customTools) {
      customTools.forEach(tool => this.tools.set(tool.id, tool))
    }

    // 创建工具按钮
    tools.forEach((toolId, index) => {
      const tool = this.tools.get(toolId)
      if (!tool) return

      // 检查可见性
      if (typeof tool.visible === 'function' && !tool.visible(this.context!)) {
        return
      }
      if (typeof tool.visible === 'boolean' && !tool.visible) {
        return
      }

      // 创建工具按钮
      const button = this.createElement('button', {
        className: 'ldesign-tree-toolbar__tool',
        title: tool.title,
        innerHTML: tool.icon,
        onClick: () => {
          if (this.context) {
            tool.onClick(this.context)
          }
        },
      })

      // 检查禁用状态
      if (typeof tool.disabled === 'function') {
        const updateDisabled = () => {
          button.disabled = tool.disabled!(this.context!)
        }
        updateDisabled()
        this.on('tree:update', updateDisabled)
      } else if (tool.disabled) {
        button.disabled = true
      }

      this.toolbarElement!.appendChild(button)

      // 添加分隔符（除了最后一个）
      if (index < tools.length - 1) {
        const separator = this.createElement('div', {
          className: 'ldesign-tree-toolbar__separator',
        })
        this.toolbarElement!.appendChild(separator)
      }
    })

    // 插入工具栏
    this.insertToolbar(container, position)
  }

  /**
   * 插入工具栏到容器
   */
  private insertToolbar(container: HTMLElement, position: string): void {
    if (!this.toolbarElement) return

    switch (position) {
      case 'top':
        container.insertBefore(this.toolbarElement, container.firstChild)
        break
      case 'bottom':
        container.appendChild(this.toolbarElement)
        break
      case 'left':
        container.style.display = 'flex'
        container.insertBefore(this.toolbarElement, container.firstChild)
        break
      case 'right':
        container.style.display = 'flex'
        container.appendChild(this.toolbarElement)
        break
    }
  }

  /**
   * 销毁工具栏
   */
  private destroyToolbar(): void {
    if (this.toolbarElement && this.toolbarElement.parentNode) {
      this.toolbarElement.parentNode.removeChild(this.toolbarElement)
      this.toolbarElement = undefined
    }
  }

  /**
   * 切换搜索
   */
  private toggleSearch(): void {
    if (!this.context) return

    const searchPlugin = this.context.getPlugin('search')
    if (searchPlugin && typeof (searchPlugin as any).toggle === 'function') {
      (searchPlugin as any).toggle()
    } else {
      // 如果没有搜索插件，显示简单的搜索提示
      const keyword = prompt('请输入搜索关键词:')
      if (keyword) {
        this.context.tree.search(keyword)
      }
    }
  }

  /**
   * 添加自定义工具
   */
  addTool(tool: ToolbarTool): void {
    this.tools.set(tool.id, tool)
    
    // 如果工具栏已创建，重新创建
    if (this.toolbarElement) {
      this.destroyToolbar()
      this.createToolbar()
    }
  }

  /**
   * 移除工具
   */
  removeTool(toolId: string): void {
    this.tools.delete(toolId)
    
    // 如果工具栏已创建，重新创建
    if (this.toolbarElement) {
      this.destroyToolbar()
      this.createToolbar()
    }
  }

  /**
   * 获取工具
   */
  getTool(toolId: string): ToolbarTool | undefined {
    return this.tools.get(toolId)
  }

  /**
   * 获取所有工具
   */
  getAllTools(): ToolbarTool[] {
    return Array.from(this.tools.values())
  }

  /**
   * 插件API
   */
  api = {
    addTool: this.addTool.bind(this),
    removeTool: this.removeTool.bind(this),
    getTool: this.getTool.bind(this),
    getAllTools: this.getAllTools.bind(this),
  }
}

/**
 * 工具栏插件工厂函数
 */
export function createToolbarPlugin(config?: ToolbarPluginConfig): ToolbarPlugin {
  return new ToolbarPlugin(config)
}
