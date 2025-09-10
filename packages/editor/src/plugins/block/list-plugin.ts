/**
 * 列表插件
 * 提供有序列表和无序列表功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 列表插件实现
 */
export class ListPlugin extends BasePlugin {
  public readonly name = 'list'
  public readonly version = '1.0.0'
  public readonly description = '列表功能插件'

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'bulletList',
        execute: (editor: IEditor) => this.toggleBulletList(editor),
        canExecute: this.canToggleList.bind(this),
        isActive: (editor: IEditor) => this.isBulletListActive(editor)
      },
      {
        name: 'orderedList',
        execute: (editor: IEditor) => this.toggleOrderedList(editor),
        canExecute: this.canToggleList.bind(this),
        isActive: (editor: IEditor) => this.isOrderedListActive(editor)
      },
      {
        name: 'indent',
        execute: (editor: IEditor) => this.indentList(editor),
        canExecute: this.canIndentList.bind(this)
      },
      {
        name: 'outdent',
        execute: (editor: IEditor) => this.outdentList(editor),
        canExecute: this.canOutdentList.bind(this)
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['bulletList', 'orderedList']
  }

  /**
   * 切换无序列表
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleBulletList(editor: IEditor): boolean {
    try {
      const success = document.execCommand('insertUnorderedList', false)
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Bullet list toggled successfully')
        return true
      } else {
        this.log('warn', 'Failed to toggle bullet list using execCommand')
        return this.fallbackToggleBulletList(editor)
      }
    } catch (error) {
      this.log('error', 'Error toggling bullet list:', error)
      return false
    }
  }

  /**
   * 切换有序列表
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private toggleOrderedList(editor: IEditor): boolean {
    try {
      const success = document.execCommand('insertOrderedList', false)
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'Ordered list toggled successfully')
        return true
      } else {
        this.log('warn', 'Failed to toggle ordered list using execCommand')
        return this.fallbackToggleOrderedList(editor)
      }
    } catch (error) {
      this.log('error', 'Error toggling ordered list:', error)
      return false
    }
  }

  /**
   * 增加列表缩进
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private indentList(editor: IEditor): boolean {
    try {
      const success = document.execCommand('indent', false)
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'List indented successfully')
        return true
      } else {
        this.log('warn', 'Failed to indent list using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error indenting list:', error)
      return false
    }
  }

  /**
   * 减少列表缩进
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private outdentList(editor: IEditor): boolean {
    try {
      const success = document.execCommand('outdent', false)
      
      if (success) {
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'List outdented successfully')
        return true
      } else {
        this.log('warn', 'Failed to outdent list using execCommand')
        return false
      }
    } catch (error) {
      this.log('error', 'Error outdenting list:', error)
      return false
    }
  }

  /**
   * 备用切换无序列表方法
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private fallbackToggleBulletList(editor: IEditor): boolean {
    return this.fallbackToggleList(editor, 'ul')
  }

  /**
   * 备用切换有序列表方法
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private fallbackToggleOrderedList(editor: IEditor): boolean {
    return this.fallbackToggleList(editor, 'ol')
  }

  /**
   * 备用切换列表方法
   * @param editor 编辑器实例
   * @param listType 列表类型 ('ul' | 'ol')
   * @returns 是否成功执行
   */
  private fallbackToggleList(editor: IEditor, listType: 'ul' | 'ol'): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection) {
        return false
      }

      const range = editor.selection.getRange()
      if (!range) {
        return false
      }

      // 查找当前的列表元素
      const currentList = this.findListElement(range.startContainer)
      
      if (currentList) {
        // 如果已经在列表中
        if (currentList.tagName.toLowerCase() === listType) {
          // 相同类型的列表，移除列表格式
          return this.removeListFormat(editor, currentList)
        } else {
          // 不同类型的列表，转换列表类型
          return this.convertListType(editor, currentList, listType)
        }
      } else {
        // 不在列表中，创建新列表
        return this.createNewList(editor, listType)
      }
    } catch (error) {
      this.log('error', 'Error in fallback list method:', error)
      return false
    }
  }

  /**
   * 查找列表元素
   * @param node 起始节点
   * @returns 列表元素或null
   */
  private findListElement(node: Node): HTMLElement | null {
    let current = node
    
    while (current && current.nodeType !== Node.ELEMENT_NODE) {
      current = current.parentNode!
    }
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement
      const tagName = element.tagName.toLowerCase()
      
      if (tagName === 'ul' || tagName === 'ol') {
        return element
      }
      
      current = current.parentNode!
    }
    
    return null
  }

  /**
   * 移除列表格式
   * @param editor 编辑器实例
   * @param listElement 列表元素
   * @returns 是否成功执行
   */
  private removeListFormat(editor: IEditor, listElement: HTMLElement): boolean {
    try {
      const listItems = listElement.querySelectorAll('li')
      const fragment = document.createDocumentFragment()
      
      // 将列表项转换为段落
      listItems.forEach(li => {
        const p = document.createElement('p')
        p.innerHTML = li.innerHTML
        fragment.appendChild(p)
      })
      
      // 替换列表
      if (listElement.parentNode) {
        listElement.parentNode.replaceChild(fragment, listElement)
        
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', 'List format removed successfully')
        return true
      }
      
      return false
    } catch (error) {
      this.log('error', 'Error removing list format:', error)
      return false
    }
  }

  /**
   * 转换列表类型
   * @param editor 编辑器实例
   * @param listElement 列表元素
   * @param newType 新列表类型
   * @returns 是否成功执行
   */
  private convertListType(editor: IEditor, listElement: HTMLElement, newType: 'ul' | 'ol'): boolean {
    try {
      const newList = document.createElement(newType)
      newList.innerHTML = listElement.innerHTML
      
      // 复制属性
      for (let i = 0; i < listElement.attributes.length; i++) {
        const attr = listElement.attributes[i]
        if (attr.name !== 'class') {
          newList.setAttribute(attr.name, attr.value)
        }
      }
      
      // 替换列表
      if (listElement.parentNode) {
        listElement.parentNode.replaceChild(newList, listElement)
        
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', `List converted to ${newType} successfully`)
        return true
      }
      
      return false
    } catch (error) {
      this.log('error', 'Error converting list type:', error)
      return false
    }
  }

  /**
   * 创建新列表
   * @param editor 编辑器实例
   * @param listType 列表类型
   * @returns 是否成功执行
   */
  private createNewList(editor: IEditor, listType: 'ul' | 'ol'): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection || selection.collapsed) {
        // 没有选中文本，创建空列表项
        const list = document.createElement(listType)
        const li = document.createElement('li')
        li.innerHTML = '&nbsp;'
        list.appendChild(li)
        
        editor.insertContent(list.outerHTML)
        return true
      } else {
        // 有选中文本，将选中文本转换为列表项
        const selectedText = selection.text
        const list = document.createElement(listType)
        const li = document.createElement('li')
        li.textContent = selectedText
        list.appendChild(li)
        
        // 删除选中内容并插入列表
        editor.selection.deleteContents()
        editor.insertContent(list.outerHTML)
        return true
      }
    } catch (error) {
      this.log('error', 'Error creating new list:', error)
      return false
    }
  }

  /**
   * 检查是否可以切换列表
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canToggleList(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    const selection = editor.selection.getSelection()
    return selection !== null
  }

  /**
   * 检查是否可以增加缩进
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canIndentList(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    // 检查是否在列表中
    const selection = editor.selection.getSelection()
    if (!selection) {
      return false
    }

    const range = editor.selection.getRange()
    if (!range) {
      return false
    }

    return this.findListElement(range.startContainer) !== null
  }

  /**
   * 检查是否可以减少缩进
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canOutdentList(editor: IEditor): boolean {
    return this.canIndentList(editor)
  }

  /**
   * 检查无序列表是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isBulletListActive(editor: IEditor): boolean {
    return this.isListActive(editor, 'ul')
  }

  /**
   * 检查有序列表是否激活
   * @param editor 编辑器实例
   * @returns 是否激活
   */
  private isOrderedListActive(editor: IEditor): boolean {
    return this.isListActive(editor, 'ol')
  }

  /**
   * 检查指定类型的列表是否激活
   * @param editor 编辑器实例
   * @param listType 列表类型
   * @returns 是否激活
   */
  private isListActive(editor: IEditor, listType: 'ul' | 'ol'): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection) {
        return false
      }

      const range = editor.selection.getRange()
      if (!range) {
        return false
      }

      const listElement = this.findListElement(range.startContainer)
      return listElement?.tagName.toLowerCase() === listType
    } catch (error) {
      this.log('error', 'Error checking list state:', error)
      return false
    }
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'List plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    this.log('info', 'List plugin destroyed')
  }
}
