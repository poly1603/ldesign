/**
 * 标题插件
 * 提供标题格式化功能（H1-H6）
 */

import type { Command, IEditor, ToolbarItem } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 标题插件实现
 */
export class HeadingPlugin extends BasePlugin {
  public readonly name = 'heading'
  public readonly version = '1.0.0'
  public readonly description = '标题格式化功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    const commands: Command[] = []

    // 为每个标题级别创建命令
    for (let level = 1; level <= 6; level++) {
      commands.push({
        name: `heading${level}`,
        execute: (editor: IEditor) => this.setHeading(editor, level),
        canExecute: this.canSetHeading.bind(this),
        isActive: (editor: IEditor) => this.isHeadingActive(editor, level)
      })
    }

    // 通用标题命令
    commands.push({
      name: 'heading',
      execute: (editor: IEditor, level: number = 1) => this.setHeading(editor, level),
      canExecute: this.canSetHeading.bind(this),
      isActive: (editor: IEditor, level: number = 1) => this.isHeadingActive(editor, level)
    })

    return commands
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems(): ToolbarItem[] {
    return [
      {
        type: 'group' as const,
        items: ['heading1', 'heading2', 'heading3'],
        label: '标题'
      }
    ]
  }

  /**
   * 设置标题
   * @param editor 编辑器实例
   * @param level 标题级别 (1-6)
   * @returns 是否成功执行
   */
  private setHeading(editor: IEditor, level: number): boolean {
    if (level < 1 || level > 6) {
      this.log('warn', `Invalid heading level: ${level}. Must be between 1 and 6.`)
      return false
    }

    try {
      // 获取当前选区
      const selection = editor.selection.getSelection()
      if (!selection) {
        this.log('warn', 'No selection available for heading formatting')
        return false
      }

      // 检查是否已经是相同级别的标题
      if (this.isHeadingActive(editor, level)) {
        // 如果已经是相同级别的标题，则移除标题格式
        return this.removeHeading(editor)
      }

      // 使用 formatBlock 命令设置标题
      const success = document.execCommand('formatBlock', false, `h${level}`)

      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })

        this.log('info', `Heading level ${level} applied successfully`)
        return true
      } else {
        this.log('warn', `Failed to apply heading level ${level} using execCommand`)
        return this.fallbackSetHeading(editor, level)
      }
    } catch (error) {
      this.log('error', 'Error setting heading:', error)
      return false
    }
  }

  /**
   * 移除标题格式
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private removeHeading(editor: IEditor): boolean {
    try {
      // 使用 formatBlock 命令设置为普通段落
      const success = document.execCommand('formatBlock', false, 'p')

      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })

        this.log('info', 'Heading format removed successfully')
        return true
      } else {
        this.log('warn', 'Failed to remove heading format using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error removing heading:', error)
      return false
    }
  }

  /**
   * 备用设置标题方法
   * @param editor 编辑器实例
   * @param level 标题级别
   * @returns 是否成功执行
   */
  private fallbackSetHeading(editor: IEditor, level: number): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection) {
        return false
      }

      // 获取选区范围
      const range = editor.selection.getRange()
      if (!range) {
        return false
      }

      // 查找包含选区的块级元素
      let blockElement = this.findBlockElement(range.startContainer)
      if (!blockElement) {
        return false
      }

      // 创建新的标题元素
      const headingElement = document.createElement(`h${level}`)
      headingElement.innerHTML = blockElement.innerHTML

      // 替换原元素
      if (blockElement.parentNode) {
        blockElement.parentNode.replaceChild(headingElement, blockElement)

        // 恢复选区
        const newRange = document.createRange()
        newRange.selectNodeContents(headingElement)
        editor.selection.setRange(newRange)

        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })

        this.log('info', `Heading level ${level} applied using fallback method`)
        return true
      }

      return false
    } catch (error) {
      this.log('error', 'Error in fallback heading method:', error)
      return false
    }
  }

  /**
   * 查找块级元素
   * @param node 起始节点
   * @returns 块级元素或null
   */
  private findBlockElement(node: Node): HTMLElement | null {
    let current = node

    while (current && current.nodeType !== Node.ELEMENT_NODE) {
      current = current.parentNode!
    }

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement
      const tagName = element.tagName.toLowerCase()

      // 检查是否是块级元素
      if (this.isBlockElement(tagName)) {
        return element
      }

      current = current.parentNode!
    }

    return null
  }

  /**
   * 检查是否是块级元素
   * @param tagName 标签名
   * @returns 是否是块级元素
   */
  private isBlockElement(tagName: string): boolean {
    const blockElements = [
      'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'ul', 'ol', 'li'
    ]
    return blockElements.includes(tagName)
  }

  /**
   * 检查是否可以设置标题
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canSetHeading(editor: IEditor): boolean {
    // 检查编辑器是否只读
    if (editor.state.readonly) {
      return false
    }

    // 检查是否有选区或光标位置
    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查指定级别的标题是否激活
   * @param editor 编辑器实例
   * @param level 标题级别
   * @returns 是否激活
   */
  private isHeadingActive(editor: IEditor, level: number): boolean {
    try {
      // 获取当前选区
      const selection = editor.selection.getSelection()
      if (!selection) {
        return false
      }

      // 获取选区范围
      const range = editor.selection.getRange()
      if (!range) {
        return false
      }

      // 查找包含选区的块级元素
      const blockElement = this.findBlockElement(range.startContainer)
      if (!blockElement) {
        return false
      }

      // 检查是否是指定级别的标题
      return blockElement.tagName.toLowerCase() === `h${level}`
    } catch (error) {
      this.log('error', 'Error checking heading state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Heading plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Heading plugin destroyed')
  }
}
