/**
 * 工具栏渲染器
 * 负责渲染编辑器工具栏界面
 */

import type { 
  IEditor, 
  ToolbarConfig, 
  ToolbarItem, 
  ToolbarGroup, 
  ToolbarSeparator 
} from '../types'
import { IconManager } from '../utils/icon-manager'
import { createElement, addClass, removeClass } from '../utils'

/**
 * 工具栏渲染器类
 */
export class ToolbarRenderer {
  /** 编辑器实例 */
  private editor: IEditor

  /** 工具栏配置 */
  private config: ToolbarConfig

  /** 工具栏容器元素 */
  private container: HTMLElement | null = null

  /** 工具栏按钮映射 */
  private buttons: Map<string, HTMLElement> = new Map()

  /** 图标管理器 */
  private iconManager: IconManager

  /** 事件监听器清理函数 */
  private eventCleanupFunctions: Array<() => void> = []

  constructor(editor: IEditor, config: ToolbarConfig) {
    this.editor = editor
    this.config = config
    this.iconManager = new IconManager()
  }

  /**
   * 渲染工具栏
   * @param container 容器元素
   */
  render(container: HTMLElement): HTMLElement {
    // 创建工具栏容器
    this.container = createElement('div', {
      className: 'ldesign-editor-toolbar'
    })

    // 设置工具栏位置样式
    addClass(this.container, `ldesign-editor-toolbar-${this.config.position}`)

    if (this.config.sticky) {
      addClass(this.container, 'ldesign-editor-toolbar-sticky')
    }

    // 渲染工具栏项目
    this.renderItems()

    // 绑定事件
    this.bindEvents()

    // 添加到容器
    container.appendChild(this.container)

    return this.container
  }

  /**
   * 渲染工具栏项目
   */
  private renderItems(): void {
    if (!this.container) return

    this.config.items.forEach(item => {
      const element = this.renderItem(item)
      if (element) {
        this.container.appendChild(element)
      }
    })
  }

  /**
   * 渲染单个工具栏项目
   * @param item 工具栏项目
   * @returns 渲染的元素
   */
  private renderItem(item: ToolbarItem): HTMLElement | null {
    if (typeof item === 'string') {
      return this.renderButton(item)
    } else if (item.type === 'group') {
      return this.renderGroup(item as ToolbarGroup)
    } else if (item.type === 'separator') {
      return this.renderSeparator()
    }
    return null
  }

  /**
   * 渲染按钮
   * @param command 命令名称
   * @returns 按钮元素
   */
  private renderButton(command: string): HTMLElement {
    const button = createElement('button', {
      className: 'ldesign-editor-toolbar-button',
      type: 'button',
      'data-command': command,
      title: this.getButtonTitle(command)
    })

    // 添加图标
    const icon = this.iconManager.getIcon(command)
    if (icon) {
      button.appendChild(icon)
    } else {
      // 如果没有图标，显示文本
      button.textContent = this.getButtonTitle(command)
    }

    // 保存按钮引用
    this.buttons.set(command, button)

    return button
  }

  /**
   * 渲染按钮组
   * @param group 按钮组配置
   * @returns 按钮组元素
   */
  private renderGroup(group: ToolbarGroup): HTMLElement {
    const groupElement = createElement('div', {
      className: 'ldesign-editor-toolbar-group'
    })

    if (group.label) {
      groupElement.setAttribute('data-label', group.label)
    }

    group.items.forEach(item => {
      const button = this.renderButton(item)
      groupElement.appendChild(button)
    })

    return groupElement
  }

  /**
   * 渲染分隔符
   * @returns 分隔符元素
   */
  private renderSeparator(): HTMLElement {
    return createElement('div', {
      className: 'ldesign-editor-toolbar-separator'
    })
  }

  /**
   * 获取按钮标题
   * @param command 命令名称
   * @returns 按钮标题
   */
  private getButtonTitle(command: string): string {
    const titles: Record<string, string> = {
      // 格式化
      'bold': '粗体',
      'italic': '斜体',
      'underline': '下划线',
      'strikethrough': '删除线',
      'superscript': '上标',
      'subscript': '下标',
      'code': '内联代码',
      'highlight': '高亮',
      
      // 对齐
      'alignLeft': '左对齐',
      'alignCenter': '居中对齐',
      'alignRight': '右对齐',
      'alignJustify': '两端对齐',
      
      // 列表
      'bulletList': '无序列表',
      'numberedList': '有序列表',
      'checkList': '任务列表',
      'indent': '增加缩进',
      'outdent': '减少缩进',
      
      // 标题
      'heading1': '标题1',
      'heading2': '标题2',
      'heading3': '标题3',
      'heading4': '标题4',
      'heading5': '标题5',
      'heading6': '标题6',
      
      // 块级元素
      'blockquote': '引用',
      'codeBlock': '代码块',
      'horizontalRule': '分割线',
      
      // 媒体
      'image': '插入图片',
      'video': '插入视频',
      'audio': '插入音频',
      'link': '插入链接',
      'table': '插入表格',
      
      // 样式
      'fontSize': '字体大小',
      'fontColor': '字体颜色',
      'backgroundColor': '背景颜色',
      'removeFormat': '清除格式',
      
      // 操作
      'undo': '撤销',
      'redo': '重做',
      'find': '查找',
      'replace': '替换',
      'selectAll': '全选',
      'copy': '复制',
      'cut': '剪切',
      'paste': '粘贴',
      
      // 视图
      'fullscreen': '全屏',
      'preview': '预览',
      'source': '源代码',
      'print': '打印'
    }

    return titles[command] || command
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.container) return

    // 工具栏按钮点击事件
    const handleButtonClick = (event: Event) => {
      const target = event.target as HTMLElement
      const button = target.closest('.ldesign-editor-toolbar-button') as HTMLElement
      
      if (button) {
        event.preventDefault()
        event.stopPropagation()
        
        const command = button.getAttribute('data-command')
        if (command) {
          this.executeCommand(command)
        }
      }
    }

    this.container.addEventListener('click', handleButtonClick)

    this.eventCleanupFunctions.push(() => {
      this.container?.removeEventListener('click', handleButtonClick)
    })

    // 监听选区变化，更新按钮状态
    const updateButtonStates = () => {
      this.updateButtonStates()
    }

    this.editor.events.on('selectionChange' as any, updateButtonStates)
    this.editor.events.on('contentChange' as any, updateButtonStates)

    this.eventCleanupFunctions.push(() => {
      this.editor.events.off('selectionChange' as any, updateButtonStates)
      this.editor.events.off('contentChange' as any, updateButtonStates)
    })
  }

  /**
   * 执行命令
   * @param command 命令名称
   */
  private executeCommand(command: string): void {
    try {
      const result = this.editor.executeCommand(command)
      if (!result.success) {
        console.warn(`Failed to execute command: ${command}`, result.error)
      }
    } catch (error) {
      console.error(`Error executing command: ${command}`, error)
    }
  }

  /**
   * 更新按钮状态
   */
  private updateButtonStates(): void {
    this.buttons.forEach((button, command) => {
      try {
        // 更新激活状态
        const isActive = this.editor.commands.isActive(command)
        if (isActive) {
          addClass(button, 'ldesign-editor-toolbar-button-active')
        } else {
          removeClass(button, 'ldesign-editor-toolbar-button-active')
        }

        // 更新禁用状态
        const canExecute = this.editor.commands.canExecute(command)
        button.disabled = !canExecute

        if (!canExecute) {
          addClass(button, 'ldesign-editor-toolbar-button-disabled')
        } else {
          removeClass(button, 'ldesign-editor-toolbar-button-disabled')
        }
      } catch (error) {
        // 忽略错误，某些命令可能没有实现状态检查
      }
    })
  }

  /**
   * 显示工具栏
   */
  show(): void {
    if (this.container) {
      removeClass(this.container, 'ldesign-editor-toolbar-hidden')
      addClass(this.container, 'ldesign-editor-toolbar-visible')
    }
  }

  /**
   * 隐藏工具栏
   */
  hide(): void {
    if (this.container) {
      removeClass(this.container, 'ldesign-editor-toolbar-visible')
      addClass(this.container, 'ldesign-editor-toolbar-hidden')
    }
  }

  /**
   * 更新工具栏配置
   * @param config 新的配置
   */
  updateConfig(config: Partial<ToolbarConfig>): void {
    this.config = { ...this.config, ...config }
    
    if (this.container) {
      // 重新渲染
      this.destroy()
      this.render(this.container.parentElement!)
    }
  }

  /**
   * 添加按钮
   * @param command 命令名称
   * @param position 插入位置（索引）
   */
  addButton(command: string, position?: number): void {
    if (position !== undefined && position >= 0) {
      this.config.items.splice(position, 0, command)
    } else {
      this.config.items.push(command)
    }

    if (this.container) {
      const button = this.renderButton(command)
      if (position !== undefined && position >= 0) {
        const children = Array.from(this.container.children)
        if (position < children.length) {
          this.container.insertBefore(button, children[position])
        } else {
          this.container.appendChild(button)
        }
      } else {
        this.container.appendChild(button)
      }
    }
  }

  /**
   * 移除按钮
   * @param command 命令名称
   */
  removeButton(command: string): void {
    // 从配置中移除
    this.config.items = this.config.items.filter(item => 
      typeof item === 'string' ? item !== command : true
    )

    // 从DOM中移除
    const button = this.buttons.get(command)
    if (button && button.parentNode) {
      button.parentNode.removeChild(button)
    }

    // 从映射中移除
    this.buttons.delete(command)
  }

  /**
   * 获取按钮元素
   * @param command 命令名称
   * @returns 按钮元素
   */
  getButton(command: string): HTMLElement | undefined {
    return this.buttons.get(command)
  }

  /**
   * 销毁工具栏
   */
  destroy(): void {
    // 清理事件监听器
    this.eventCleanupFunctions.forEach(cleanup => cleanup())
    this.eventCleanupFunctions = []

    // 清理DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }

    // 清理引用
    this.buttons.clear()
    this.container = null
  }
}
