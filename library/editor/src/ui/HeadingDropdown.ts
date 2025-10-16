/**
 * 标题下拉菜单组件
 * 显示当前标题级别并提供切换功能
 */

import { createIcon } from './icons'
import type { Editor } from '../core/Editor'

export interface HeadingDropdownOptions {
  editor: Editor
  container?: HTMLElement
}

/**
 * 获取当前选中文本的标题级别
 */
function getCurrentHeadingLevel(): string {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return '正文'
  }

  // 获取当前节点
  let node = selection.anchorNode
  if (!node) {
    return '正文'
  }

  // 如果是文本节点，获取其父元素
  let element = node.nodeType === Node.TEXT_NODE 
    ? node.parentElement 
    : node as HTMLElement

  // 向上查找标题元素
  while (element && element !== document.body) {
    const tagName = element.tagName?.toUpperCase()
    
    switch (tagName) {
      case 'H1': return '标题 1'
      case 'H2': return '标题 2'
      case 'H3': return '标题 3'
      case 'H4': return '标题 4'
      case 'H5': return '标题 5'
      case 'H6': return '标题 6'
      case 'P':
      case 'DIV':
        // 如果是普通段落或div，继续向上查找以确保不在标题内
        if (!element.closest('h1,h2,h3,h4,h5,h6')) {
          return '正文'
        }
        break
    }
    
    element = element.parentElement
  }

  return '正文'
}

export class HeadingDropdown {
  private editor: Editor
  private container: HTMLElement
  private button: HTMLElement
  private dropdown: HTMLElement
  private currentLevelSpan: HTMLElement
  private isOpen: boolean = false

  constructor(options: HeadingDropdownOptions) {
    this.editor = options.editor
    this.container = options.container || document.body
    
    this.button = this.createButton()
    this.dropdown = this.createDropdown()
    
    this.setupEventListeners()
    this.updateCurrentLevel()
  }

  /**
   * 创建主按钮
   */
  private createButton(): HTMLElement {
    const button = document.createElement('button')
    button.className = 'ldesign-toolbar-button heading-button'
    button.setAttribute('data-tooltip', '标题')
    
    // 创建按钮内容
    const iconWrapper = document.createElement('span')
    iconWrapper.className = 'button-icon'
    iconWrapper.innerHTML = createIcon('heading')
    
    // 创建当前级别显示
    this.currentLevelSpan = document.createElement('span')
    this.currentLevelSpan.className = 'current-level'
    this.currentLevelSpan.textContent = '正文'
    
    // 创建下拉箭头
    const arrow = document.createElement('span')
    arrow.className = 'dropdown-arrow'
    arrow.innerHTML = '▼'
    
    button.appendChild(iconWrapper)
    button.appendChild(this.currentLevelSpan)
    button.appendChild(arrow)
    
    return button
  }

  /**
   * 创建下拉菜单
   */
  private createDropdown(): HTMLElement {
    const dropdown = document.createElement('div')
    dropdown.className = 'heading-dropdown-menu'
    dropdown.style.display = 'none'
    
    const items = [
      { level: 'p', label: '正文', icon: 'text' },
      { level: '1', label: '标题 1', icon: 'heading-1' },
      { level: '2', label: '标题 2', icon: 'heading-2' },
      { level: '3', label: '标题 3', icon: 'heading-3' },
      { level: '4', label: '标题 4', icon: 'heading-4' },
      { level: '5', label: '标题 5', icon: 'heading-5' },
      { level: '6', label: '标题 6', icon: 'heading-6' }
    ]
    
    items.forEach(item => {
      const menuItem = document.createElement('button')
      menuItem.className = 'heading-menu-item'
      menuItem.setAttribute('data-level', item.level)
      
      const icon = document.createElement('span')
      icon.className = 'menu-item-icon'
      icon.innerHTML = createIcon(item.icon)
      
      const label = document.createElement('span')
      label.className = 'menu-item-label'
      label.textContent = item.label
      
      menuItem.appendChild(icon)
      menuItem.appendChild(label)
      
      menuItem.addEventListener('click', () => {
        this.setHeading(item.level)
        this.closeDropdown()
      })
      
      dropdown.appendChild(menuItem)
    })
    
    return dropdown
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 按钮点击事件
    this.button.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleDropdown()
    })
    
    // 鼠标悬停时更新当前级别
    this.button.addEventListener('mouseenter', () => {
      this.updateCurrentLevel()
    })
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
      if (this.isOpen) {
        this.closeDropdown()
      }
    })
    
    // 选区变化时更新当前级别
    document.addEventListener('selectionchange', () => {
      this.updateCurrentLevel()
    })
    
    // 编辑器内容变化时更新
    if (this.editor.contentElement) {
      this.editor.contentElement.addEventListener('input', () => {
        this.updateCurrentLevel()
      })
    }
  }

  /**
   * 更新当前级别显示
   */
  private updateCurrentLevel(): void {
    const level = getCurrentHeadingLevel()
    this.currentLevelSpan.textContent = level
    
    // 更新按钮的 data 属性（用于样式）
    this.button.setAttribute('data-current-level', level)
    
    // 高亮当前级别的菜单项
    const menuItems = this.dropdown.querySelectorAll('.heading-menu-item')
    menuItems.forEach(item => {
      const itemLevel = item.getAttribute('data-level')
      const itemLabel = item.querySelector('.menu-item-label')?.textContent
      
      if (itemLabel === level) {
        item.classList.add('active')
      } else {
        item.classList.remove('active')
      }
    })
  }

  /**
   * 切换下拉菜单
   */
  private toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown()
    } else {
      this.openDropdown()
    }
  }

  /**
   * 打开下拉菜单
   */
  private openDropdown(): void {
    this.dropdown.style.display = 'block'
    this.button.classList.add('active')
    this.isOpen = true
    
    // 定位下拉菜单
    const rect = this.button.getBoundingClientRect()
    this.dropdown.style.position = 'absolute'
    this.dropdown.style.top = `${rect.bottom + 2}px`
    this.dropdown.style.left = `${rect.left}px`
    
    // 确保下拉菜单在容器内
    document.body.appendChild(this.dropdown)
  }

  /**
   * 关闭下拉菜单
   */
  private closeDropdown(): void {
    this.dropdown.style.display = 'none'
    this.button.classList.remove('active')
    this.isOpen = false
  }

  /**
   * 设置标题级别
   */
  private setHeading(level: string): void {
    if (level === 'p') {
      this.editor.commands.execute('setParagraph')
    } else {
      this.editor.commands.execute(`setHeading${level}`)
    }
    
    // 更新显示
    setTimeout(() => {
      this.updateCurrentLevel()
    }, 50)
  }

  /**
   * 渲染组件
   */
  render(): HTMLElement {
    return this.button
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.button.remove()
    this.dropdown.remove()
  }
}

// 添加样式
const style = document.createElement('style')
style.textContent = `
  .heading-button {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 100px;
    padding: 4px 8px !important;
  }
  
  .heading-button .current-level {
    font-size: 12px;
    opacity: 0.8;
    white-space: nowrap;
  }
  
  .heading-button .dropdown-arrow {
    font-size: 8px;
    opacity: 0.6;
    margin-left: auto;
  }
  
  .heading-button:hover .current-level {
    opacity: 1;
  }
  
  .heading-dropdown-menu {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 4px;
    z-index: 10000;
    min-width: 150px;
  }
  
  .heading-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    border-radius: 3px;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .heading-menu-item:hover {
    background: #f5f5f5;
  }
  
  .heading-menu-item.active {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  .menu-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    opacity: 0.7;
  }
  
  .menu-item-label {
    font-size: 14px;
    font-weight: normal;
  }
  
  .heading-menu-item[data-level="1"] .menu-item-label {
    font-size: 18px;
    font-weight: bold;
  }
  
  .heading-menu-item[data-level="2"] .menu-item-label {
    font-size: 16px;
    font-weight: bold;
  }
  
  .heading-menu-item[data-level="3"] .menu-item-label {
    font-size: 15px;
    font-weight: 600;
  }
  
  .heading-menu-item[data-level="4"] .menu-item-label {
    font-size: 14px;
    font-weight: 600;
  }
  
  .heading-menu-item[data-level="5"] .menu-item-label {
    font-size: 13px;
    font-weight: 600;
  }
  
  .heading-menu-item[data-level="6"] .menu-item-label {
    font-size: 12px;
    font-weight: 600;
  }
`
document.head.appendChild(style)

export default HeadingDropdown