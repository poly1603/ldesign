/**
 * 链接插件
 * 提供链接插入、编辑、预览等功能
 */

import type { Command, IEditor, ToolbarItem } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 链接配置
 */
export interface LinkConfig {
  /** 链接URL */
  href: string
  /** 链接文本 */
  text?: string
  /** 链接标题 */
  title?: string
  /** 打开方式 */
  target?: '_blank' | '_self' | '_parent' | '_top'
  /** 关系属性 */
  rel?: string
  /** CSS类名 */
  className?: string
}

/**
 * 链接插件实现
 */
export class LinkPlugin extends BasePlugin {
  name = 'link'
  version = '1.0.0'

  /**
   * 初始化插件
   */
  onInit(): void {
    // 监听点击事件
    this.setupLinkHandlers()
  }

  /**
   * 获取命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'insertLink',
        label: '插入链接',
        execute: (editor: IEditor, config?: LinkConfig) => {
          if (config) {
            this.insertLink(editor, config)
          } else {
            this.showLinkDialog(editor)
          }
        },
        canExecute: () => true,
        isActive: () => false
      },
      {
        name: 'editLink',
        label: '编辑链接',
        execute: (editor: IEditor, linkElement?: HTMLAnchorElement) => {
          this.editLink(editor, linkElement)
        },
        canExecute: (editor: IEditor) => {
          return this.getSelectedLink(editor) !== null
        },
        isActive: () => false
      },
      {
        name: 'removeLink',
        label: '移除链接',
        execute: (editor: IEditor) => {
          this.removeLink(editor)
        },
        canExecute: (editor: IEditor) => {
          return this.getSelectedLink(editor) !== null
        },
        isActive: () => false
      },
      {
        name: 'openLink',
        label: '打开链接',
        execute: (editor: IEditor) => {
          this.openLink(editor)
        },
        canExecute: (editor: IEditor) => {
          return this.getSelectedLink(editor) !== null
        },
        isActive: () => false
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems(): ToolbarItem[] {
    return [
      {
        type: 'group' as const,
        items: ['insertLink'],
        label: '链接'
      }
    ]
  }

  /**
   * 插入链接
   */
  private insertLink(editor: IEditor, config: LinkConfig): void {
    const selection = editor.selection.getSelection()
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      
      // 创建链接元素
      const link = this.createLinkElement(config, selectedText)
      
      // 如果有选中文本，替换选中内容
      if (selectedText) {
        range.deleteContents()
        range.insertNode(link)
      } else {
        // 没有选中文本，插入链接
        range.insertNode(link)
        
        // 将光标移动到链接后面
        range.setStartAfter(link)
        range.collapse(true)
      }
      
      // 更新选区
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      // 在编辑器末尾插入
      const container = editor.getContainer()
      const link = this.createLinkElement(config)
      container.appendChild(link)
    }

    // 触发内容变更事件
    editor.events.emit('content:changed', {
      type: 'insert',
      element: link
    })
  }

  /**
   * 创建链接元素
   */
  private createLinkElement(config: LinkConfig, selectedText?: string): HTMLAnchorElement {
    const link = document.createElement('a')
    
    link.href = config.href
    link.textContent = config.text || selectedText || config.href
    
    if (config.title) {
      link.title = config.title
    }
    
    if (config.target) {
      link.target = config.target
    }
    
    if (config.rel) {
      link.rel = config.rel
    }
    
    if (config.className) {
      link.className = config.className
    }

    // 添加默认样式
    link.style.color = 'var(--ldesign-brand-color)'
    link.style.textDecoration = 'underline'
    link.style.cursor = 'pointer'

    // 添加事件监听器
    link.addEventListener('click', (e) => {
      e.preventDefault()
      this.handleLinkClick(link)
    })

    link.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.showLinkContextMenu(link, e)
    })

    return link
  }

  /**
   * 显示链接对话框
   */
  private showLinkDialog(editor: IEditor): void {
    const selection = editor.selection.getSelection()
    const selectedText = selection?.toString() || ''
    
    const href = prompt('请输入链接URL:')
    if (!href) return
    
    const text = prompt('请输入链接文本:', selectedText || href) || href
    const title = prompt('请输入链接标题 (可选):') || ''
    
    const target = confirm('是否在新窗口打开链接？') ? '_blank' : '_self'
    
    this.insertLink(editor, {
      href,
      text,
      title,
      target,
      rel: target === '_blank' ? 'noopener noreferrer' : undefined
    })
  }

  /**
   * 编辑链接
   */
  private editLink(editor: IEditor, linkElement?: HTMLAnchorElement): void {
    const link = linkElement || this.getSelectedLink(editor)
    if (!link) return

    const newHref = prompt('链接URL:', link.href)
    if (newHref !== null) {
      link.href = newHref
    }

    const newText = prompt('链接文本:', link.textContent || '')
    if (newText !== null) {
      link.textContent = newText
    }

    const newTitle = prompt('链接标题:', link.title)
    if (newTitle !== null) {
      link.title = newTitle
    }

    const newTarget = confirm('是否在新窗口打开？') ? '_blank' : '_self'
    link.target = newTarget
    link.rel = newTarget === '_blank' ? 'noopener noreferrer' : ''

    // 触发内容变更事件
    editor.events.emit('content:changed', {
      type: 'update',
      element: link
    })
  }

  /**
   * 移除链接
   */
  private removeLink(editor: IEditor): void {
    const link = this.getSelectedLink(editor)
    if (!link) return

    // 保留文本内容，移除链接标签
    const textNode = document.createTextNode(link.textContent || '')
    link.parentNode?.replaceChild(textNode, link)

    // 触发内容变更事件
    editor.events.emit('content:changed', {
      type: 'delete',
      element: link
    })
  }

  /**
   * 打开链接
   */
  private openLink(editor: IEditor): void {
    const link = this.getSelectedLink(editor)
    if (!link) return

    const target = link.target || '_self'
    window.open(link.href, target)
  }

  /**
   * 获取选中的链接
   */
  private getSelectedLink(editor: IEditor): HTMLAnchorElement | null {
    const selection = editor.selection.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    let element = range.commonAncestorContainer

    // 向上查找链接元素
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode
    }

    while (element && element !== editor.getContainer()) {
      if (element.nodeName === 'A') {
        return element as HTMLAnchorElement
      }
      element = element.parentNode
    }

    return null
  }

  /**
   * 处理链接点击
   */
  private handleLinkClick(link: HTMLAnchorElement): void {
    // 显示链接预览或编辑选项
    const action = confirm(`链接: ${link.href}\n\n点击"确定"打开链接，点击"取消"编辑链接`)
    
    if (action) {
      // 打开链接
      const target = link.target || '_self'
      window.open(link.href, target)
    } else {
      // 编辑链接
      this.editLinkElement(link)
    }
  }

  /**
   * 编辑链接元素
   */
  private editLinkElement(link: HTMLAnchorElement): void {
    const newHref = prompt('链接URL:', link.href)
    if (newHref !== null && newHref !== link.href) {
      link.href = newHref
    }

    const newText = prompt('链接文本:', link.textContent || '')
    if (newText !== null && newText !== link.textContent) {
      link.textContent = newText
    }
  }

  /**
   * 显示链接上下文菜单
   */
  private showLinkContextMenu(link: HTMLAnchorElement, event: MouseEvent): void {
    // 简单的上下文菜单实现
    const menu = document.createElement('div')
    menu.style.position = 'fixed'
    menu.style.left = event.clientX + 'px'
    menu.style.top = event.clientY + 'px'
    menu.style.background = 'white'
    menu.style.border = '1px solid #ccc'
    menu.style.borderRadius = '4px'
    menu.style.padding = '8px'
    menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
    menu.style.zIndex = '1000'

    const openItem = document.createElement('div')
    openItem.textContent = '打开链接'
    openItem.style.padding = '4px 8px'
    openItem.style.cursor = 'pointer'
    openItem.addEventListener('click', () => {
      window.open(link.href, link.target || '_self')
      document.body.removeChild(menu)
    })

    const editItem = document.createElement('div')
    editItem.textContent = '编辑链接'
    editItem.style.padding = '4px 8px'
    editItem.style.cursor = 'pointer'
    editItem.addEventListener('click', () => {
      this.editLinkElement(link)
      document.body.removeChild(menu)
    })

    const removeItem = document.createElement('div')
    removeItem.textContent = '移除链接'
    removeItem.style.padding = '4px 8px'
    removeItem.style.cursor = 'pointer'
    removeItem.addEventListener('click', () => {
      const textNode = document.createTextNode(link.textContent || '')
      link.parentNode?.replaceChild(textNode, link)
      document.body.removeChild(menu)
    })

    menu.appendChild(openItem)
    menu.appendChild(editItem)
    menu.appendChild(removeItem)
    document.body.appendChild(menu)

    // 点击其他地方关闭菜单
    const closeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        document.body.removeChild(menu)
        document.removeEventListener('click', closeMenu)
      }
    }
    setTimeout(() => document.addEventListener('click', closeMenu), 0)
  }

  /**
   * 设置链接处理器
   */
  private setupLinkHandlers(): void {
    // 可以在这里添加全局链接处理逻辑
  }
}
