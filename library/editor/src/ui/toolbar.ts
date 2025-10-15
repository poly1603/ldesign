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
import { bindTooltip } from './Tooltip'

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
    // 使用自定义 Tooltip，避免原生 title 样式受限
    if (item.title) {
      bindTooltip(button, item.title)
    }
    button.setAttribute('data-name', item.name)

    // 判断是否是下拉按钮（需要箭头指示器）
    const isDropdown = ['heading', 'align', 'fontSize', 'fontFamily', 'lineHeight', 'textTransform'].includes(item.name)
    
    // 如果是下拉按钮，需要更宽的按钮容纳图标和箭头
    if (isDropdown) {
      button.style.width = 'auto'
      button.style.minWidth = '48px'
      button.style.paddingLeft = '8px'
      button.style.paddingRight = '8px'
      button.style.gap = '4px'
    }

    // 创建图标
    const iconElement = createIcon(item.icon)
    if (iconElement) {
      button.appendChild(iconElement)
      
      // 如果是下拉按钮，添加向下箭头
      if (isDropdown) {
        const chevron = createIcon('chevron-down')
        if (chevron) {
          chevron.style.opacity = '0.6'
          button.appendChild(chevron)
        }
      }
    } else {
      button.textContent = item.title
    }

    // 防止按钮获取焦点导致选区丢失
    button.addEventListener('mousedown', (e) => {
      e.preventDefault()
    })

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

      // 特殊处理：标题级别下拉
      if (item.name === 'heading') {
        showDropdown(button, {
          options: [
            { label: '正文', value: 'p' },
            { label: '标题 1', value: 'h1' },
            { label: '标题 2', value: 'h2' },
            { label: '标题 3', value: 'h3' },
            { label: '标题 4', value: 'h4' },
            { label: '标题 5', value: 'h5' },
            { label: '标题 6', value: 'h6' }
          ],
          onSelect: (value) => {
            const map: Record<string, string> = {
              p: 'setParagraph',
              h1: 'setHeading1',
              h2: 'setHeading2',
              h3: 'setHeading3',
              h4: 'setHeading4',
              h5: 'setHeading5',
              h6: 'setHeading6',
            }
            const cmd = map[value]
            if (cmd) {
              this.editor.commands.execute(cmd)
            } else {
              // 回退到原生命令
              document.execCommand('formatBlock', false, value)
            }
          }
        })
        return
      }

      // 特殊处理：对齐方式下拉
      if (item.name === 'align') {
        showDropdown(button, {
          options: [
            { label: '左对齐', value: 'left' },
            { label: '居中', value: 'center' },
            { label: '右对齐', value: 'right' },
            { label: '两端对齐', value: 'justify' },
          ],
          onSelect: (value) => {
            const map: Record<string, string> = {
              left: 'alignLeft',
              center: 'alignCenter',
              right: 'alignRight',
              justify: 'alignJustify',
            }
            const cmd = map[value]
            if (cmd) {
              this.editor.commands.execute(cmd)
            }
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
    const separatorAfter = ['redo', 'code', 'heading', 'codeblock', 'taskList', 'indent', 'align', 'horizontalRule', 'fontFamily', 'backgroundColor', 'removeFormat']
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
