/**
 * 引用块插件
 * 提供引用块格式化功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 引用块插件实现
 */
export class BlockquotePlugin extends BasePlugin {
  public readonly name = 'blockquote'
  public readonly version = '1.0.0'
  public readonly description = '引用块功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'blockquote',
        execute: this.toggleBlockquote.bind(this),
        canExecute: this.canToggleBlockquote.bind(this),
        isActive: this.isBlockquoteActive.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['blockquote']
  }

  /**
   * 切换引用块
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleBlockquote(editor: IEditor): boolean {
    try {
      // 获取当前选区
      const selection = editor.selection.getSelection()
      if (!selection) {
        this.log('warn', 'No selection available for blockquote formatting')
        return false
      }

      // 检查是否已经是引用块
      if (this.isBlockquoteActive(editor)) {
        // 如果已经是引用块，则移除引用格式
        return this.removeBlockquote(editor)
      } else {
        // 如果不是引用块，则添加引用格式
        return this.addBlockquote(editor)
      }
    } catch (error) {
      this.log('error', 'Error toggling blockquote:', error)
      return false
    }
  }

  /**
   * 添加引用块
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private addBlockquote(editor: IEditor): boolean {
    try {
      // 尝试使用 formatBlock 命令
      const success = document.execCommand('formatBlock', false, 'blockquote')
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Blockquote added successfully')
        return true
      } else {
        this.log('warn', 'Failed to add blockquote using execCommand')
        return this.fallbackAddBlockquote(editor)
      }
    } catch (error) {
      this.log('error', 'Error adding blockquote:', error)
      return false
    }
  }

  /**
   * 移除引用块
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private removeBlockquote(editor: IEditor): boolean {
    try {
      // 使用 formatBlock 命令设置为普通段落
      const success = document.execCommand('formatBlock', false, 'p')
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Blockquote removed successfully')
        return true
      } else {
        this.log('warn', 'Failed to remove blockquote using execCommand')
        return this.fallbackRemoveBlockquote(editor)
      }
    } catch (error) {
      this.log('error', 'Error removing blockquote:', error)
      return false
    }
  }

  /**
   * 备用添加引用块方法
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private fallbackAddBlockquote(editor: IEditor): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection) {
        return false
      }

      const range = editor.selection.getRange()
      if (!range) {
        return false
      }

      // 查找包含选区的块级元素
      let blockElement = this.findBlockElement(range.startContainer)
      if (!blockElement) {
        return false
      }

      // 创建新的引用块元素
      const blockquoteElement = document.createElement('blockquote')
      
      // 如果当前块元素是段落，直接替换
      if (blockElement.tagName.toLowerCase() === 'p') {
        blockquoteElement.innerHTML = blockElement.innerHTML
      } else {
        // 否则创建一个段落包装内容
        const p = document.createElement('p')
        p.innerHTML = blockElement.innerHTML
        blockquoteElement.appendChild(p)
      }

      // 替换原元素
      if (blockElement.parentNode) {
        blockElement.parentNode.replaceChild(blockquoteElement, blockElement)
        
        // 恢复选区
        const newRange = document.createRange()
        newRange.selectNodeContents(blockquoteElement)
        editor.selection.setRange(newRange)
        
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Blockquote added using fallback method')
        return true
      }

      return false
    } catch (error) {
      this.log('error', 'Error in fallback add blockquote method:', error)
      return false
    }
  }

  /**
   * 备用移除引用块方法
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private fallbackRemoveBlockquote(editor: IEditor): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection) {
        return false
      }

      const range = editor.selection.getRange()
      if (!range) {
        return false
      }

      // 查找引用块元素
      const blockquoteElement = this.findBlockquoteElement(range.startContainer)
      if (!blockquoteElement) {
        return false
      }

      // 创建段落元素来替换引用块
      const fragment = document.createDocumentFragment()
      
      // 将引用块的子元素转换为段落
      const children = Array.from(blockquoteElement.childNodes)
      children.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const element = child as HTMLElement
          if (element.tagName.toLowerCase() === 'p') {
            // 如果已经是段落，直接添加
            fragment.appendChild(element.cloneNode(true))
          } else {
            // 否则创建段落包装
            const p = document.createElement('p')
            p.innerHTML = element.innerHTML
            fragment.appendChild(p)
          }
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
          // 文本节点包装为段落
          const p = document.createElement('p')
          p.textContent = child.textContent
          fragment.appendChild(p)
        }
      })

      // 如果没有子元素，创建一个空段落
      if (!fragment.hasChildNodes()) {
        const p = document.createElement('p')
        p.innerHTML = '&nbsp;'
        fragment.appendChild(p)
      }

      // 替换引用块
      if (blockquoteElement.parentNode) {
        blockquoteElement.parentNode.replaceChild(fragment, blockquoteElement)
        
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Blockquote removed using fallback method')
        return true
      }

      return false
    } catch (error) {
      this.log('error', 'Error in fallback remove blockquote method:', error)
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
   * 查找引用块元素
   * @param node 起始节点
   * @returns 引用块元素或null
   */
  private findBlockquoteElement(node: Node): HTMLElement | null {
    let current = node
    
    while (current && current.nodeType !== Node.ELEMENT_NODE) {
      current = current.parentNode!
    }
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement
      
      if (element.tagName.toLowerCase() === 'blockquote') {
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
   * 检查是否可以切换引用块
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleBlockquote(editor: IEditor): boolean {
    // 检查编辑器是否只读
    if (editor.state.readonly) {
      return false
    }

    // 检查是否有选区或光标位置
    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查引用块是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isBlockquoteActive(editor: IEditor): boolean {
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

      // 查找引用块元素
      const blockquoteElement = this.findBlockquoteElement(range.startContainer)
      return blockquoteElement !== null
    } catch (error) {
      this.log('error', 'Error checking blockquote state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Blockquote plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'Blockquote plugin destroyed')
  }
}
