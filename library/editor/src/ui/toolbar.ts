/**
 * 工具栏组件
 * 使用 Lucide 图标
 */

import type { ToolbarItem, Editor as EditorType } from '../types'
import { createIcon } from './icons'
import { showColorPicker } from './ColorPicker'
import { showDropdown } from './Dropdown'
import { FONT_SIZES, FONT_FAMILIES } from '../plugins/font'

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
    const items = this.options.items || this.getDefaultItems()

    items.forEach((item, index) => {
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
      this.options.container.appendChild(this.element)
    }
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

      // 默认命令执行
      const state = this.editor.getState()
      item.command(state, this.editor.dispatch.bind(this.editor))
    })

    return button
  }

  /**
   * 是否添加分隔符
   */
  private shouldAddSeparator(index: number, items: ToolbarItem[]): boolean {
    // 在特定组之间添加分隔符
    const separatorAfter = ['redo', 'clearFormat', 'heading3', 'orderedList', 'codeBlock', 'image', 'alignJustify', 'backgroundColor', 'fontFamily', 'subscript', 'outdent']
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
  private getDefaultItems(): ToolbarItem[] {
    const items: ToolbarItem[] = []

    // 从所有插件收集工具栏项
    this.editor.plugins.getAll().forEach(plugin => {
      if (plugin.config.toolbar) {
        items.push(...plugin.config.toolbar)
      }
    })

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
