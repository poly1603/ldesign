/**
 * 快捷键管理器
 * 负责管理和处理键盘快捷键
 */

import type { IShortcutManager, Shortcut, IEditor, IEventManager } from '../types'
import { EventType } from '../types'

/**
 * 快捷键管理器实现
 */
export class ShortcutManager implements IShortcutManager {
  /** 编辑器实例 */
  private editor: IEditor

  /** 事件管理器 */
  private events: IEventManager

  /** 快捷键映射表 */
  private shortcuts: Map<string, Shortcut> = new Map()

  /** 事件监听器清理函数 */
  private eventCleanupFunctions: Array<() => void> = []

  /** 是否已初始化 */
  private initialized = false

  constructor(editor: IEditor) {
    this.editor = editor
    this.events = editor.events
    this.initializeDefaultShortcuts()
  }

  /**
   * 初始化默认快捷键
   */
  private initializeDefaultShortcuts(): void {
    const defaultShortcuts: Shortcut[] = [
      // 格式化快捷键
      { key: 'Ctrl+B', command: 'bold', description: '粗体', enabled: true },
      { key: 'Ctrl+I', command: 'italic', description: '斜体', enabled: true },
      { key: 'Ctrl+U', command: 'underline', description: '下划线', enabled: true },
      { key: 'Ctrl+Shift+X', command: 'strikethrough', description: '删除线', enabled: true },

      // 操作快捷键
      { key: 'Ctrl+Z', command: 'undo', description: '撤销', enabled: true },
      { key: 'Ctrl+Y', command: 'redo', description: '重做', enabled: true },
      { key: 'Ctrl+Shift+Z', command: 'redo', description: '重做', enabled: true },

      // 选择快捷键
      { key: 'Ctrl+A', command: 'selectAll', description: '全选', enabled: true },
      { key: 'Ctrl+C', command: 'copy', description: '复制', enabled: true },
      { key: 'Ctrl+X', command: 'cut', description: '剪切', enabled: true },
      { key: 'Ctrl+V', command: 'paste', description: '粘贴', enabled: true },

      // 对齐快捷键
      { key: 'Ctrl+Shift+L', command: 'alignLeft', description: '左对齐', enabled: true },
      { key: 'Ctrl+Shift+E', command: 'alignCenter', description: '居中对齐', enabled: true },
      { key: 'Ctrl+Shift+R', command: 'alignRight', description: '右对齐', enabled: true },
      { key: 'Ctrl+Shift+J', command: 'alignJustify', description: '两端对齐', enabled: true },

      // 列表快捷键
      { key: 'Ctrl+Shift+8', command: 'bulletList', description: '无序列表', enabled: true },
      { key: 'Ctrl+Shift+7', command: 'numberedList', description: '有序列表', enabled: true },

      // 代码和引用
      { key: 'Ctrl+`', command: 'code', description: '内联代码', enabled: true },
      { key: 'Ctrl+Shift+.', command: 'blockquote', description: '引用', enabled: true },

      // 标题快捷键
      { key: 'Ctrl+1', command: 'heading1', description: '标题1', enabled: true },
      { key: 'Ctrl+2', command: 'heading2', description: '标题2', enabled: true },
      { key: 'Ctrl+3', command: 'heading3', description: '标题3', enabled: true },
      { key: 'Ctrl+4', command: 'heading4', description: '标题4', enabled: true },
      { key: 'Ctrl+5', command: 'heading5', description: '标题5', enabled: true },
      { key: 'Ctrl+6', command: 'heading6', description: '标题6', enabled: true },

      // 其他功能
      { key: 'Ctrl+K', command: 'link', description: '插入链接', enabled: true },
      { key: 'Ctrl+Shift+I', command: 'image', description: '插入图片', enabled: true },
      { key: 'Ctrl+F', command: 'find', description: '查找', enabled: true },
      { key: 'Ctrl+H', command: 'replace', description: '替换', enabled: true },
      { key: 'F11', command: 'fullscreen', description: '全屏', enabled: true },
      { key: 'Escape', command: 'exitFullscreen', description: '退出全屏', enabled: true }
    ]

    defaultShortcuts.forEach(shortcut => {
      this.register(shortcut)
    })
  }

  /**
   * 初始化快捷键系统
   */
  init(): void {
    if (this.initialized) {
      console.warn('ShortcutManager is already initialized')
      return
    }

    this.bindEvents()
    this.initialized = true
    console.log('ShortcutManager initialized with', this.shortcuts.size, 'shortcuts')
  }

  /**
   * 注册快捷键
   */
  register(shortcut: Shortcut): void {
    const normalizedKey = this.normalizeKey(shortcut.key)
    this.shortcuts.set(normalizedKey, {
      ...shortcut,
      key: normalizedKey
    })
  }

  /**
   * 注销快捷键
   */
  unregister(key: string): void {
    const normalizedKey = this.normalizeKey(key)
    this.shortcuts.delete(normalizedKey)
  }

  /**
   * 获取所有快捷键
   */
  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * 处理键盘事件
   */
  handleKeyEvent(event: KeyboardEvent): boolean {
    if (!this.initialized) return false

    const key = this.getKeyFromEvent(event)
    const shortcut = this.shortcuts.get(key)

    if (!shortcut || !shortcut.enabled) {
      return false
    }

    // 检查命令是否可执行
    if (!this.editor.commands.canExecute(shortcut.command)) {
      return false
    }

    try {
      // 阻止默认行为
      event.preventDefault()
      event.stopPropagation()

      // 执行命令
      const result = this.editor.commands.execute(shortcut.command)
      
      // 触发快捷键执行事件
      this.events.emit(EventType.ShortcutExecuted, {
        shortcut,
        result,
        event
      })

      return result.success
    } catch (error) {
      console.error(`Error executing shortcut ${shortcut.key}:`, error)
      return false
    }
  }

  /**
   * 获取快捷键
   * @param key 快捷键组合
   * @returns 快捷键对象
   */
  getShortcut(key: string): Shortcut | undefined {
    const normalizedKey = this.normalizeKey(key)
    return this.shortcuts.get(normalizedKey)
  }

  /**
   * 启用快捷键
   * @param key 快捷键组合
   */
  enable(key: string): void {
    const shortcut = this.getShortcut(key)
    if (shortcut) {
      shortcut.enabled = true
    }
  }

  /**
   * 禁用快捷键
   * @param key 快捷键组合
   */
  disable(key: string): void {
    const shortcut = this.getShortcut(key)
    if (shortcut) {
      shortcut.enabled = false
    }
  }

  /**
   * 批量注册快捷键
   * @param shortcuts 快捷键数组
   */
  registerMultiple(shortcuts: Shortcut[]): void {
    shortcuts.forEach(shortcut => {
      this.register(shortcut)
    })
  }

  /**
   * 获取命令的快捷键
   * @param command 命令名称
   * @returns 快捷键组合
   */
  getShortcutForCommand(command: string): string | undefined {
    for (const [key, shortcut] of this.shortcuts) {
      if (shortcut.command === command) {
        return key
      }
    }
    return undefined
  }

  /**
   * 绑定事件监听器
   */
  private bindEvents(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      this.handleKeyEvent(event)
    }

    document.addEventListener('keydown', handleKeyDown)

    this.eventCleanupFunctions.push(() => {
      document.removeEventListener('keydown', handleKeyDown)
    })
  }

  /**
   * 从键盘事件获取快捷键字符串
   */
  private getKeyFromEvent(event: KeyboardEvent): string {
    const parts: string[] = []

    // 修饰键
    if (event.ctrlKey || event.metaKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')

    // 主键
    let key = event.key

    // 特殊键处理
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
      'Enter': 'Enter',
      'Escape': 'Escape',
      'Tab': 'Tab',
      'Backspace': 'Backspace',
      'Delete': 'Delete',
      'Home': 'Home',
      'End': 'End',
      'PageUp': 'PageUp',
      'PageDown': 'PageDown',
      'Insert': 'Insert'
    }

    if (keyMap[key]) {
      key = keyMap[key]
    } else if (key.length === 1) {
      // 字母和数字
      key = key.toUpperCase()
    }

    parts.push(key)

    return parts.join('+')
  }

  /**
   * 标准化快捷键字符串
   */
  private normalizeKey(key: string): string {
    return key
      .split('+')
      .map(part => part.trim())
      .join('+')
  }

  /**
   * 检查是否为修饰键
   */
  private isModifierKey(key: string): boolean {
    return ['Control', 'Alt', 'Shift', 'Meta', 'ControlLeft', 'ControlRight', 
            'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight', 'MetaLeft', 'MetaRight'].includes(key)
  }

  /**
   * 获取快捷键帮助信息
   */
  getHelpText(): string {
    const shortcuts = this.getAll().filter(s => s.enabled)
    const groups = new Map<string, Shortcut[]>()

    // 按功能分组
    shortcuts.forEach(shortcut => {
      let group = '其他'
      if (shortcut.command.includes('align')) group = '对齐'
      else if (['bold', 'italic', 'underline', 'strikethrough'].includes(shortcut.command)) group = '格式'
      else if (['undo', 'redo'].includes(shortcut.command)) group = '操作'
      else if (['copy', 'cut', 'paste', 'selectAll'].includes(shortcut.command)) group = '编辑'
      else if (shortcut.command.includes('heading')) group = '标题'
      else if (['bulletList', 'numberedList'].includes(shortcut.command)) group = '列表'

      if (!groups.has(group)) {
        groups.set(group, [])
      }
      groups.get(group)!.push(shortcut)
    })

    let helpText = '快捷键帮助:\n\n'
    groups.forEach((shortcuts, groupName) => {
      helpText += `${groupName}:\n`
      shortcuts.forEach(shortcut => {
        helpText += `  ${shortcut.key}: ${shortcut.description}\n`
      })
      helpText += '\n'
    })

    return helpText
  }

  /**
   * 销毁快捷键管理器
   */
  destroy(): void {
    // 清理事件监听器
    this.eventCleanupFunctions.forEach(cleanup => cleanup())
    this.eventCleanupFunctions = []

    // 清理快捷键
    this.shortcuts.clear()

    this.initialized = false
    console.log('ShortcutManager destroyed')
  }
}
