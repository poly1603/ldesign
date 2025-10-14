/**
 * 工具栏组件
 * 使用 Lucide 图标
 */

import type { ToolbarItem, Editor as EditorType } from '../types'
import { createIcon } from './icons'
import { showColorPicker } from './ColorPicker'
import { showDropdown } from './Dropdown'
import { FONT_SIZES, FONT_FAMILIES } from '../plugins/font'
import { LINE_HEIGHTS } from '../plugins/line-height'
import { DEFAULT_TOOLBAR_ITEMS } from './defaultToolbar'

export interface ToolbarOptions {
  items?: ToolbarItem[]
  container?: HTMLElement
  className?: string
}

export class Toolbar {
  private editor: EditorType
  private options: ToolbarOptions
  private element: HTMLElement
  private buttons: Map<string, HTMLButtonElement> = new Map()

  constructor(editor: EditorType, options: ToolbarOptions = {}) {
    this.editor = editor
    this.options = options

    // 创建工具栏容器
    this.element = document.createElement('div')
    this.element.className = `ldesign-editor-toolbar ${options.className || ''}`

    // 渲染工具栏项
    this.render()

    // 监听编辑器更新，更新按钮状态
    this.editor.on('update', () => this.updateButtonStates())
    this.editor.on('selectionUpdate', () => this.updateButtonStates())
  }

  /**
   * 渲染工具栏
   */
  private render(): void {
    console.log('[Toolbar] Starting render...')
    console.log('[Toolbar] Options:', this.options)
    
    const items = this.options.items || this.getDefaultItems()
    console.log('[Toolbar] Items to render:', items.length, items)

    items.forEach((item, index) => {
      console.log(`[Toolbar] Creating button for: ${item.name}`)
      // 创建按钮
      const button = this.createButton(item)
      this.buttons.set(item.name, button)
      this.element.appendChild(button)

      // 添加分隔符
      if (this.shouldAddSeparator(index, items)) {
        const separator = document.createElement('div')
        separator.className = 'ldesign-editor-toolbar-separator'
        this.element.appendChild(separator)
      }
    })

    // 如果提供了容器，插入到容器中
    if (this.options.container) {
      console.log('[Toolbar] Appending to container:', this.options.container)
      this.options.container.appendChild(this.element)
    } else {
      console.log('[Toolbar] No container provided')
    }
    
    console.log('[Toolbar] Render complete. Element:', this.element)
    console.log('[Toolbar] Element children:', this.element.children.length)
  }

  /**
   * 创建按钮
   */
  private createButton(item: ToolbarItem): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'ldesign-editor-toolbar-button'
    button.type = 'button'
    button.title = item.title
    button.setAttribute('data-name', item.name)

    // 创建图标
    const iconElement = createIcon(item.icon)
    if (iconElement) {
      button.appendChild(iconElement)
    } else {
      button.textContent = item.title
    }

    // 绑定点击事件
    button.addEventListener('click', (e) => {
      e.preventDefault()

      // 特殊处理：颜色选择器
      if (item.name === 'textColor') {
        showColorPicker(button, {
          onSelect: (color) => {
            this.editor.commands.execute('setTextColor', color)
          }
        })
        return
      }

      if (item.name === 'backgroundColor') {
        showColorPicker(button, {
          onSelect: (color) => {
            this.editor.commands.execute('setBackgroundColor', color)
          }
        })
        return
      }

      // 特殊处理：字体大小选择器
      if (item.name === 'fontSize') {
        showDropdown(button, {
          options: FONT_SIZES,
          onSelect: (size) => {
            this.editor.commands.execute('setFontSize', size)
          }
        })
        return
      }

      // 特殊处理：字体家族选择器
      if (item.name === 'fontFamily') {
        showDropdown(button, {
          options: FONT_FAMILIES,
          onSelect: (family) => {
            this.editor.commands.execute('setFontFamily', family)
          }
        })
        return
      }

      // 特殊处理：行高选择器
      if (item.name === 'lineHeight') {
        showDropdown(button, {
          options: LINE_HEIGHTS,
          onSelect: (height) => {
            this.editor.commands.execute('setLineHeight', height)
          }
        })
        return
      }

      // 特殊处理：文本转换
      if (item.name === 'textTransform') {
        showDropdown(button, {
          options: [
            { label: '大写', value: 'toUpperCase' },
            { label: '小写', value: 'toLowerCase' },
            { label: '首字母大写', value: 'toCapitalize' },
            { label: '句子大小写', value: 'toSentenceCase' },
            { label: '全角转半角', value: 'toHalfWidth' },
            { label: '半角转全角', value: 'toFullWidth' }
          ],
          onSelect: (command) => {
            this.editor.commands.execute(command)
          }
        })
        return
      }

      // 如果command是字符串（命令名称），通过命令管理器执行
      if (typeof item.command === 'string') {
        if (this.editor.commands && this.editor.commands.execute) {
          console.log(`[Toolbar] Executing string command: ${item.command}`)
          this.editor.commands.execute(item.command)
          return
        }
      }
      
      // 如果是函数，直接执行
      if (typeof item.command === 'function') {
        console.log(`[Toolbar] Executing function command for: ${item.name}`)
        const state = this.editor.getState()
        item.command(state, this.editor.dispatch.bind(this.editor))
      }
    })

    return button
  }

  /**
   * 是否添加分隔符
   */
  private shouldAddSeparator(index: number, items: ToolbarItem[]): boolean {
    // 在特定组之间添加分隔符
    const separatorAfter = ['redo', 'code', 'paragraph', 'codeblock', 'taskList', 'indent', 'alignJustify', 'horizontalRule', 'backgroundColor', 'removeFormat']
    return separatorAfter.includes(items[index].name) && index < items.length - 1
  }

  /**
   * 更新按钮状态
   */
  private updateButtonStates(): void {
    const items = this.options.items || this.getDefaultItems()
    const state = this.editor.getState()

    items.forEach(item => {
      const button = this.buttons.get(item.name)
      if (!button) return

      // 更新激活状态
      if (item.active) {
        const isActive = item.active(state)
        button.classList.toggle('active', isActive)
      }

      // 更新禁用状态
      if (item.disabled) {
        const isDisabled = item.disabled(state)
        button.disabled = isDisabled
      }
    })
  }

  /**
   * 获取默认工具栏项
   */
  public getDefaultItems(): ToolbarItem[] {
    const items: ToolbarItem[] = []

    console.log('[Toolbar] Getting default items...')
    const plugins = this.editor.plugins.getAll()
    console.log('[Toolbar] Total plugins:', plugins.length)

    // 从所有插件收集工具栏项
    plugins.forEach(plugin => {
      console.log(`[Toolbar] Checking plugin: ${plugin.name}`, plugin)
      if (plugin.config && plugin.config.toolbar) {
        console.log(`[Toolbar] Found toolbar config in ${plugin.name}:`, plugin.config.toolbar)
        items.push(...plugin.config.toolbar)
      } else {
        console.log(`[Toolbar] No toolbar config in ${plugin.name}`)
      }
    })

    console.log('[Toolbar] Total toolbar items collected from plugins:', items.length)
    
    // 如果插件没有提供工具栏配置，使用默认配置
    if (items.length === 0) {
      console.log('[Toolbar] No items from plugins, using default toolbar')
      return DEFAULT_TOOLBAR_ITEMS
    }
    
    return items
  }

  /**
   * 获取工具栏元素
   */
  getElement(): HTMLElement {
    return this.element
  }

  /**
   * 销毁工具栏
   */
  destroy(): void {
    this.buttons.clear()
    this.element.remove()
  }
}
