/**
 * 代码插件
 * 提供内联代码功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 代码插件实现
 */
export class CodePlugin extends BasePlugin {
  public readonly name = 'code'
  public readonly version = '1.0.0'
  public readonly description = '内联代码功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'code',
        execute: this.toggleCode.bind(this),
        canExecute: this.canToggleCode.bind(this),
        isActive: this.isCodeActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['code']
  }

  /**
   * 切换代码状态
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleCode(editor: IEditor): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection || selection.collapsed) {
        return false
      }

      const range = editor.selection.getRange()
      if (!range) {
        return false
      }

      // 检查选中的文本是否已经在code标签内
      const isInCode = this.isCodeActive(editor)
      
      if (isInCode) {
        // 移除code标签
        this.removeCodeFormatting(range)
      } else {
        // 添加code标签
        this.applyCodeFormatting(range)
      }

      const content = editor.getContent()
      editor.events.emit('contentChange' as any, { content })
      this.log('info', 'Code toggled successfully')
      return true
    } catch (error) {
      this.log('error', 'Error toggling code:', error)
      return false
    }
  }

  /**
   * 应用代码格式
   * @param range 选区范围
   */
  private applyCodeFormatting(range: Range): void {
    const selectedText = range.toString()
    if (selectedText) {
      const codeElement = document.createElement('code')
      codeElement.textContent = selectedText
      
      range.deleteContents()
      range.insertNode(codeElement)
      
      // 重新选择插入的元素
      range.selectNodeContents(codeElement)
    }
  }

  /**
   * 移除代码格式
   * @param range 选区范围
   */
  private removeCodeFormatting(range: Range): void {
    const commonAncestor = range.commonAncestorContainer
    let codeElement: HTMLElement | null = null

    // 查找包含选区的code元素
    if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
      const element = commonAncestor as HTMLElement
      if (element.tagName === 'CODE') {
        codeElement = element
      } else {
        codeElement = element.closest('code')
      }
    } else {
      const parentElement = commonAncestor.parentElement
      if (parentElement && parentElement.tagName === 'CODE') {
        codeElement = parentElement
      } else if (parentElement) {
        codeElement = parentElement.closest('code')
      }
    }

    if (codeElement) {
      // 将code元素的内容替换为纯文本
      const textContent = codeElement.textContent || ''
      const textNode = document.createTextNode(textContent)
      
      if (codeElement.parentNode) {
        codeElement.parentNode.replaceChild(textNode, codeElement)
        
        // 重新选择文本
        range.selectNodeContents(textNode)
      }
    }
  }

  /**
   * 检查是否可以切换代码
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleCode(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查代码是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isCodeActive(editor: IEditor): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection || selection.rangeCount === 0) {
        return false
      }

      const range = selection.getRangeAt(0)
      const commonAncestor = range.commonAncestorContainer
      
      // 检查选区是否在code元素内
      if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
        const element = commonAncestor as HTMLElement
        return element.tagName === 'CODE' || element.closest('code') !== null
      } else {
        const parentElement = commonAncestor.parentElement
        return parentElement ? 
          (parentElement.tagName === 'CODE' || parentElement.closest('code') !== null) : 
          false
      }
    } catch (error) {
      this.log('error', 'Error checking code state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Code plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Code plugin destroyed')
  }
}
