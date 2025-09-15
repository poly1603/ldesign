/**
 * 键盘管理器
 * 
 * 框架无关的键盘快捷键核心逻辑，负责：
 * - 快捷键绑定和管理
 * - 键盘事件处理和分发
 * - 快捷键冲突检测和解决
 * - 无障碍访问支持
 */

/**
 * 快捷键定义
 */
export interface KeyboardShortcut {
  /** 快捷键ID */
  id: string
  /** 快捷键组合 */
  key: string
  /** 修饰键 */
  modifiers?: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  }
  /** 描述 */
  description: string
  /** 处理函数 */
  handler: (event: KeyboardEvent) => void
  /** 是否启用 */
  enabled?: boolean
  /** 是否阻止默认行为 */
  preventDefault?: boolean
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean
}

/**
 * 键盘配置
 */
export interface KeyboardConfig {
  /** 是否启用键盘快捷键 */
  enabled?: boolean
  /** 自定义快捷键 */
  shortcuts?: KeyboardShortcut[]
  /** 是否启用默认快捷键 */
  enableDefaults?: boolean
  /** 焦点管理 */
  focusManagement?: {
    /** 是否自动管理焦点 */
    autoFocus?: boolean
    /** 焦点循环 */
    focusLoop?: boolean
    /** 焦点陷阱 */
    focusTrap?: boolean
  }
}

/**
 * 键盘管理器类
 */
export class KeyboardManager {
  private config: KeyboardConfig
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private isActive = false
  private focusableElements: HTMLElement[] = []
  private currentFocusIndex = -1
  private boundHandleKeyDown: (event: KeyboardEvent) => void

  constructor(config: KeyboardConfig = {}) {
    this.config = {
      enabled: true,
      enableDefaults: true,
      focusManagement: {
        autoFocus: true,
        focusLoop: true,
        focusTrap: false
      },
      ...config
    }

    // 绑定事件处理器
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)

    this.initializeDefaultShortcuts()
  }

  /**
   * 初始化默认快捷键
   */
  private initializeDefaultShortcuts(): void {
    if (!this.config.enableDefaults) return

    const defaultShortcuts: KeyboardShortcut[] = [
      // 导航快捷键
      {
        id: 'go-to-today',
        key: 't',
        description: '回到今天',
        handler: () => this.emit('goToToday')
      },
      {
        id: 'previous-period',
        key: 'ArrowLeft',
        description: '上一个时间段',
        handler: () => this.emit('previousPeriod')
      },
      {
        id: 'next-period',
        key: 'ArrowRight',
        description: '下一个时间段',
        handler: () => this.emit('nextPeriod')
      },
      {
        id: 'previous-view',
        key: 'ArrowUp',
        description: '上一个视图',
        handler: () => this.emit('previousView')
      },
      {
        id: 'next-view',
        key: 'ArrowDown',
        description: '下一个视图',
        handler: () => this.emit('nextView')
      },

      // 事件操作快捷键
      {
        id: 'new-event',
        key: 'n',
        modifiers: { ctrl: true },
        description: '新建事件',
        handler: () => this.emit('newEvent'),
        preventDefault: true
      },
      {
        id: 'edit-event',
        key: 'Enter',
        description: '编辑选中事件',
        handler: () => this.emit('editEvent')
      },
      {
        id: 'delete-event',
        key: 'Delete',
        description: '删除选中事件',
        handler: () => this.emit('deleteEvent')
      },
      {
        id: 'duplicate-event',
        key: 'd',
        modifiers: { ctrl: true },
        description: '复制选中事件',
        handler: () => this.emit('duplicateEvent'),
        preventDefault: true
      },

      // 视图切换快捷键
      {
        id: 'month-view',
        key: 'm',
        description: '月视图',
        handler: () => this.emit('setView', 'month')
      },
      {
        id: 'week-view',
        key: 'w',
        description: '周视图',
        handler: () => this.emit('setView', 'week')
      },
      {
        id: 'day-view',
        key: 'd',
        description: '日视图',
        handler: () => this.emit('setView', 'day')
      },

      // 通用快捷键
      {
        id: 'escape',
        key: 'Escape',
        description: '取消/关闭',
        handler: () => this.emit('escape')
      },
      {
        id: 'refresh',
        key: 'F5',
        description: '刷新',
        handler: () => this.emit('refresh'),
        preventDefault: true
      },

      // 焦点导航
      {
        id: 'focus-next',
        key: 'Tab',
        description: '下一个焦点',
        handler: (event) => this.handleFocusNext(event)
      },
      {
        id: 'focus-previous',
        key: 'Tab',
        modifiers: { shift: true },
        description: '上一个焦点',
        handler: (event) => this.handleFocusPrevious(event)
      }
    ]

    // 注册默认快捷键
    defaultShortcuts.forEach(shortcut => this.registerShortcut(shortcut))

    // 注册自定义快捷键
    if (this.config.shortcuts) {
      this.config.shortcuts.forEach(shortcut => this.registerShortcut(shortcut))
    }
  }

  /**
   * 注册快捷键
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.generateShortcutKey(shortcut)
    this.shortcuts.set(key, { enabled: true, ...shortcut })
  }

  /**
   * 注销快捷键
   */
  unregisterShortcut(id: string): void {
    for (const [key, shortcut] of this.shortcuts) {
      if (shortcut.id === id) {
        this.shortcuts.delete(key)
        break
      }
    }
  }

  /**
   * 生成快捷键标识
   */
  private generateShortcutKey(shortcut: KeyboardShortcut): string {
    const modifiers = shortcut.modifiers || {}
    const parts = []

    if (modifiers.ctrl) parts.push('ctrl')
    if (modifiers.alt) parts.push('alt')
    if (modifiers.shift) parts.push('shift')
    if (modifiers.meta) parts.push('meta')

    parts.push(shortcut.key.toLowerCase())

    return parts.join('+')
  }

  /**
   * 激活键盘管理器
   */
  activate(container?: HTMLElement): void {
    if (this.isActive) return

    this.isActive = true

    // 添加键盘事件监听器
    const target = container || document
    target.addEventListener('keydown', this.boundHandleKeyDown)

    console.log('KeyboardManager activated, shortcuts:', Array.from(this.shortcuts.keys()))

    // 初始化焦点管理
    if (this.config.focusManagement?.autoFocus) {
      this.initializeFocusManagement(container)
    }

    this.emit('activated')
  }

  /**
   * 停用键盘管理器
   */
  deactivate(container?: HTMLElement): void {
    if (!this.isActive) return

    this.isActive = false

    // 移除键盘事件监听器
    const target = container || document
    target.removeEventListener('keydown', this.boundHandleKeyDown)

    this.emit('deactivated')
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.config.enabled) return

    const key = this.generateEventKey(event)
    console.log('KeyboardManager handleKeyDown:', key, 'available shortcuts:', Array.from(this.shortcuts.keys()))

    const shortcut = this.shortcuts.get(key)

    if (shortcut && shortcut.enabled) {
      console.log('Shortcut found and enabled:', shortcut.id)
      if (shortcut.preventDefault) {
        event.preventDefault()
      }
      if (shortcut.stopPropagation) {
        event.stopPropagation()
      }

      shortcut.handler(event)
      this.emit('shortcutTriggered', { shortcut, event })
    } else {
      console.log('No matching shortcut found for key:', key)
    }
  }

  /**
   * 从事件生成快捷键标识
   */
  private generateEventKey(event: KeyboardEvent): string {
    const parts = []

    if (event.ctrlKey) parts.push('ctrl')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    if (event.metaKey) parts.push('meta')

    parts.push(event.key.toLowerCase())

    return parts.join('+')
  }

  /**
   * 初始化焦点管理
   */
  private initializeFocusManagement(container?: HTMLElement): void {
    const root = container || document.body
    this.updateFocusableElements(root)
  }

  /**
   * 更新可焦点元素列表
   */
  updateFocusableElements(container: HTMLElement): void {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '.ldesign-calendar-day-cell',
      '.ldesign-calendar-event'
    ].join(', ')

    this.focusableElements = Array.from(container.querySelectorAll(focusableSelectors))
    this.currentFocusIndex = -1
  }

  /**
   * 处理下一个焦点
   */
  private handleFocusNext(event: KeyboardEvent): void {
    if (!this.config.focusManagement?.autoFocus) return

    event.preventDefault()

    this.currentFocusIndex++

    if (this.currentFocusIndex >= this.focusableElements.length) {
      if (this.config.focusManagement.focusLoop) {
        this.currentFocusIndex = 0
      } else {
        this.currentFocusIndex = this.focusableElements.length - 1
        return
      }
    }

    this.focusElement(this.currentFocusIndex)
  }

  /**
   * 处理上一个焦点
   */
  private handleFocusPrevious(event: KeyboardEvent): void {
    if (!this.config.focusManagement?.autoFocus) return

    event.preventDefault()

    this.currentFocusIndex--

    if (this.currentFocusIndex < 0) {
      if (this.config.focusManagement.focusLoop) {
        this.currentFocusIndex = this.focusableElements.length - 1
      } else {
        this.currentFocusIndex = 0
        return
      }
    }

    this.focusElement(this.currentFocusIndex)
  }

  /**
   * 聚焦元素
   */
  private focusElement(index: number): void {
    if (index >= 0 && index < this.focusableElements.length) {
      const element = this.focusableElements[index]
      element.focus()
      this.emit('focusChanged', { element, index })
    }
  }

  /**
   * 获取所有快捷键
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * 启用/禁用快捷键
   */
  toggleShortcut(id: string, enabled: boolean): void {
    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.id === id) {
        shortcut.enabled = enabled
        break
      }
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<KeyboardConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 发出事件
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(data))
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.deactivate()
    this.shortcuts.clear()
    this.eventListeners.clear()
    this.focusableElements = []
    this.currentFocusIndex = -1
  }
}
