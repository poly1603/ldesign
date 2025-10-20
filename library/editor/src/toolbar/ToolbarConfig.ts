/**
 * 优化的工具栏配置系统
 * 支持按需加载、动态配置和自定义功能
 */

import type { Editor } from '../core/Editor'

/**
 * 工具栏项基础配置
 */
export interface ToolbarItemBase {
  id: string
  type?: 'button' | 'dropdown' | 'separator' | 'custom'
  icon?: string | (() => string | Promise<string>)
  label?: string
  tooltip?: string
  shortcut?: string
  visible?: boolean | ((editor: Editor) => boolean)
  enabled?: boolean | ((editor: Editor) => boolean)
  active?: boolean | ((editor: Editor) => boolean)
}

/**
 * 按钮类型工具栏项
 */
export interface ToolbarButton extends ToolbarItemBase {
  type?: 'button'
  action: (editor: Editor) => void | Promise<void>
}

/**
 * 下拉菜单工具栏项
 */
export interface ToolbarDropdown extends ToolbarItemBase {
  type: 'dropdown'
  items: ToolbarMenuItem[]
  defaultValue?: string
  onChange?: (value: string, editor: Editor) => void
}

/**
 * 菜单项配置
 */
export interface ToolbarMenuItem {
  value: string
  label: string
  icon?: string
  action?: (editor: Editor) => void
}

/**
 * 分隔符
 */
export interface ToolbarSeparator {
  id: string
  type: 'separator'
}

/**
 * 自定义工具栏项
 */
export interface ToolbarCustomItem extends ToolbarItemBase {
  type: 'custom'
  render: (container: HTMLElement, editor: Editor) => void | HTMLElement
  onMount?: (element: HTMLElement, editor: Editor) => void
  onUnmount?: (element: HTMLElement, editor: Editor) => void
}

export type ToolbarItem = ToolbarButton | ToolbarDropdown | ToolbarSeparator | ToolbarCustomItem

/**
 * 懒加载配置
 */
export interface LazyConfig {
  enabled: boolean
  loader: () => Promise<ToolbarItem | ToolbarItem[]>
  placeholder?: string | HTMLElement
  preload?: boolean
  priority?: 'high' | 'normal' | 'low'
}

/**
 * 工具栏组配置
 */
export interface ToolbarGroup {
  id: string
  label?: string
  items: (string | ToolbarItem)[]
  collapsible?: boolean
  collapsed?: boolean
  visible?: boolean | ((editor: Editor) => boolean)
}

/**
 * 工具栏配置
 */
export interface OptimizedToolbarConfig {
  items?: (string | ToolbarItem | ToolbarGroup)[]
  theme?: 'light' | 'dark' | 'auto'
  size?: 'small' | 'medium' | 'large'
  position?: 'top' | 'bottom' | 'float'
  sticky?: boolean
  compact?: boolean
  showLabels?: boolean
  showTooltips?: boolean
  lazyLoad?: boolean
  virtualScroll?: boolean
  maxVisibleItems?: number
  overflow?: 'scroll' | 'menu' | 'wrap'
  customClass?: string
  onItemClick?: (id: string, editor: Editor) => void
  onReady?: (toolbar: any) => void
}

/**
 * 预设配置
 */
export const TOOLBAR_PRESETS = {
  minimal: {
    items: ['bold', 'italic', 'separator', 'undo', 'redo'],
    compact: true,
    showLabels: false
  },
  standard: {
    items: [
      { id: 'format', items: ['bold', 'italic', 'underline', 'strike'] },
      'separator',
      { id: 'paragraph', items: ['heading', 'bulletList', 'orderedList'] },
      'separator',
      { id: 'insert', items: ['link', 'image', 'table'] },
      'separator',
      'undo', 'redo'
    ],
    showTooltips: true
  },
  full: {
    items: [
      { id: 'file', items: ['new', 'open', 'save'] },
      'separator',
      { id: 'format', items: ['bold', 'italic', 'underline', 'strike', 'code', 'clear'] },
      'separator',
      { id: 'paragraph', items: ['heading', 'paragraph', 'bulletList', 'orderedList', 'taskList'] },
      'separator',
      { id: 'align', items: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'] },
      'separator',
      { id: 'insert', items: ['link', 'image', 'video', 'table', 'horizontalRule'] },
      'separator',
      { id: 'tools', items: ['findReplace', 'spellCheck', 'wordCount'] },
      'separator',
      'undo', 'redo', 'separator', 'fullscreen'
    ],
    showLabels: true,
    showTooltips: true,
    virtualScroll: true
  }
} as const

/**
 * 默认工具栏项配置
 */
export const DEFAULT_ITEMS: Record<string, ToolbarItem> = {
  bold: {
    id: 'bold',
    icon: 'bold',
    tooltip: 'Bold (Ctrl+B)',
    shortcut: 'Ctrl+B',
    action: (editor) => editor.commands.execute('bold')
  },
  italic: {
    id: 'italic',
    icon: 'italic',
    tooltip: 'Italic (Ctrl+I)',
    shortcut: 'Ctrl+I',
    action: (editor) => editor.commands.execute('italic')
  },
  underline: {
    id: 'underline',
    icon: 'underline',
    tooltip: 'Underline (Ctrl+U)',
    shortcut: 'Ctrl+U',
    action: (editor) => editor.commands.execute('underline')
  },
  strike: {
    id: 'strike',
    icon: 'strikethrough',
    tooltip: 'Strikethrough',
    action: (editor) => editor.commands.execute('strike')
  },
  heading: {
    id: 'heading',
    type: 'dropdown',
    icon: 'heading',
    tooltip: 'Heading',
    items: [
      { value: 'h1', label: 'Heading 1', action: (e) => e.commands.execute('heading', { level: 1 }) },
      { value: 'h2', label: 'Heading 2', action: (e) => e.commands.execute('heading', { level: 2 }) },
      { value: 'h3', label: 'Heading 3', action: (e) => e.commands.execute('heading', { level: 3 }) },
      { value: 'h4', label: 'Heading 4', action: (e) => e.commands.execute('heading', { level: 4 }) },
      { value: 'h5', label: 'Heading 5', action: (e) => e.commands.execute('heading', { level: 5 }) },
      { value: 'h6', label: 'Heading 6', action: (e) => e.commands.execute('heading', { level: 6 }) }
    ]
  },
  undo: {
    id: 'undo',
    icon: 'undo',
    tooltip: 'Undo (Ctrl+Z)',
    shortcut: 'Ctrl+Z',
    action: (editor) => editor.commands.execute('undo')
  },
  redo: {
    id: 'redo',
    icon: 'redo',
    tooltip: 'Redo (Ctrl+Y)',
    shortcut: 'Ctrl+Y',
    action: (editor) => editor.commands.execute('redo')
  }
}