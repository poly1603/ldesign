/**
 * PDF预览器无障碍访问管理器
 * 提供键盘导航、屏幕阅读器支持、焦点管理等无障碍功能
 */

export interface AccessibilityOptions {
  enableKeyboardNavigation?: boolean
  enableScreenReaderSupport?: boolean
  enableFocusManagement?: boolean
  enableHighContrast?: boolean
  announcePageChanges?: boolean
  announceSearchResults?: boolean
  customAnnouncements?: boolean
}

export interface KeyboardShortcut {
  key: string
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  action: string
  description: string
  handler: () => void
}

/**
 * 无障碍访问管理器
 */
export class AccessibilityManager {
  private options: AccessibilityOptions
  private container: HTMLElement | null = null
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private focusableElements: HTMLElement[] = []
  private currentFocusIndex: number = -1
  private announceRegion: HTMLElement | null = null

  constructor(options: AccessibilityOptions = {}) {
    this.options = {
      enableKeyboardNavigation: true,
      enableScreenReaderSupport: true,
      enableFocusManagement: true,
      enableHighContrast: false,
      announcePageChanges: true,
      announceSearchResults: true,
      customAnnouncements: false,
      ...options
    }

    this.setupDefaultShortcuts()
    this.createAnnounceRegion()
  }

  /**
   * 设置容器元素
   */
  setContainer(container: HTMLElement): void {
    this.container = container
    this.setupAccessibility()
  }

  /**
   * 设置无障碍功能
   */
  private setupAccessibility(): void {
    if (!this.container) return

    // 设置ARIA属性
    this.setupAriaAttributes()

    // 启用键盘导航
    if (this.options.enableKeyboardNavigation) {
      this.setupKeyboardNavigation()
    }

    // 启用屏幕阅读器支持
    if (this.options.enableScreenReaderSupport) {
      this.setupScreenReaderSupport()
    }

    // 启用焦点管理
    if (this.options.enableFocusManagement) {
      this.setupFocusManagement()
    }

    // 启用高对比度
    if (this.options.enableHighContrast) {
      this.enableHighContrast()
    }
  }

  /**
   * 设置ARIA属性
   */
  private setupAriaAttributes(): void {
    if (!this.container) return

    this.container.setAttribute('role', 'application')
    this.container.setAttribute('aria-label', 'PDF查看器')
    this.container.setAttribute('aria-describedby', 'pdf-help-text')

    // 创建帮助文本
    const helpText = document.createElement('div')
    helpText.id = 'pdf-help-text'
    helpText.className = 'sr-only'
    helpText.textContent = '使用方向键导航页面，空格键翻页，Ctrl+F搜索，Escape键取消操作'
    document.body.appendChild(helpText)
  }

  /**
   * 设置键盘导航
   */
  private setupKeyboardNavigation(): void {
    if (!this.container) return

    this.container.addEventListener('keydown', this.handleKeyDown.bind(this))
    this.container.setAttribute('tabindex', '0')
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const shortcutKey = this.getShortcutKey(event)
    const shortcut = this.shortcuts.get(shortcutKey)

    if (shortcut) {
      event.preventDefault()
      shortcut.handler()
      this.announceAction(shortcut.description)
    }
  }

  /**
   * 获取快捷键字符串
   */
  private getShortcutKey(event: KeyboardEvent): string {
    const modifiers: string[] = []
    
    if (event.ctrlKey) modifiers.push('ctrl')
    if (event.altKey) modifiers.push('alt')
    if (event.shiftKey) modifiers.push('shift')
    if (event.metaKey) modifiers.push('meta')
    
    return [...modifiers, event.key.toLowerCase()].join('+')
  }

  /**
   * 设置默认快捷键
   */
  private setupDefaultShortcuts(): void {
    const shortcuts: Omit<KeyboardShortcut, 'handler'>[] = [
      { key: 'arrowleft', action: 'previousPage', description: '上一页' },
      { key: 'arrowright', action: 'nextPage', description: '下一页' },
      { key: 'arrowup', action: 'scrollUp', description: '向上滚动' },
      { key: 'arrowdown', action: 'scrollDown', description: '向下滚动' },
      { key: 'space', action: 'nextPage', description: '下一页' },
      { key: 'space', modifiers: ['shift'], action: 'previousPage', description: '上一页' },
      { key: 'home', action: 'firstPage', description: '首页' },
      { key: 'end', action: 'lastPage', description: '末页' },
      { key: '+', modifiers: ['ctrl'], action: 'zoomIn', description: '放大' },
      { key: '-', modifiers: ['ctrl'], action: 'zoomOut', description: '缩小' },
      { key: '0', modifiers: ['ctrl'], action: 'resetZoom', description: '重置缩放' },
      { key: 'f', modifiers: ['ctrl'], action: 'search', description: '搜索' },
      { key: 'g', modifiers: ['ctrl'], action: 'findNext', description: '查找下一个' },
      { key: 'g', modifiers: ['ctrl', 'shift'], action: 'findPrevious', description: '查找上一个' },
      { key: 'escape', action: 'cancel', description: '取消操作' },
      { key: 'f11', action: 'toggleFullscreen', description: '切换全屏' },
    ]

    shortcuts.forEach(shortcut => {
      const key = shortcut.modifiers ? 
        [...shortcut.modifiers, shortcut.key].join('+') : 
        shortcut.key
      
      this.shortcuts.set(key, {
        ...shortcut,
        handler: () => this.executeAction(shortcut.action)
      })
    })
  }

  /**
   * 执行快捷键动作
   */
  private executeAction(action: string): void {
    // 这里需要与PDF预览器实例集成
    const event = new CustomEvent('accessibility-action', {
      detail: { action }
    })
    this.container?.dispatchEvent(event)
  }

  /**
   * 设置屏幕阅读器支持
   */
  private setupScreenReaderSupport(): void {
    if (!this.container) return

    // 为页面元素添加ARIA标签
    this.container.addEventListener('DOMNodeInserted', this.handleNewElement.bind(this))
    
    // 监听页面变化
    const observer = new MutationObserver(this.handleMutations.bind(this))
    observer.observe(this.container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-page-number']
    })
  }

  /**
   * 处理新元素插入
   */
  private handleNewElement(event: Event): void {
    const element = event.target as HTMLElement
    
    if (element.tagName === 'CANVAS') {
      // 为画布添加描述
      element.setAttribute('role', 'img')
      element.setAttribute('aria-label', `PDF页面 ${element.closest('[data-page-number]')?.getAttribute('data-page-number') || ''}`)
    }
    
    if (element.classList.contains('pdf-page-container')) {
      // 为页面容器添加描述
      const pageNumber = element.getAttribute('data-page-number')
      element.setAttribute('role', 'region')
      element.setAttribute('aria-label', `PDF页面 ${pageNumber}`)
    }
  }

  /**
   * 处理DOM变化
   */
  private handleMutations(mutations: MutationRecord[]): void {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-page-number') {
        const element = mutation.target as HTMLElement
        const pageNumber = element.getAttribute('data-page-number')
        if (pageNumber && this.options.announcePageChanges) {
          this.announce(`当前页面：第${pageNumber}页`)
        }
      }
    })
  }

  /**
   * 设置焦点管理
   */
  private setupFocusManagement(): void {
    if (!this.container) return

    // 收集可聚焦元素
    this.updateFocusableElements()

    // 监听Tab键导航
    this.container.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        this.handleTabNavigation(event)
      }
    })

    // 监听焦点变化
    this.container.addEventListener('focusin', this.handleFocusIn.bind(this))
  }

  /**
   * 更新可聚焦元素列表
   */
  private updateFocusableElements(): void {
    if (!this.container) return

    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'
    this.focusableElements = Array.from(this.container.querySelectorAll(selector))
  }

  /**
   * 处理Tab导航
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    this.updateFocusableElements()
    
    if (this.focusableElements.length === 0) return

    const isShiftTab = event.shiftKey
    let newIndex

    if (isShiftTab) {
      newIndex = this.currentFocusIndex - 1
      if (newIndex < 0) newIndex = this.focusableElements.length - 1
    } else {
      newIndex = this.currentFocusIndex + 1
      if (newIndex >= this.focusableElements.length) newIndex = 0
    }

    event.preventDefault()
    this.focusableElements[newIndex]?.focus()
    this.currentFocusIndex = newIndex
  }

  /**
   * 处理焦点进入
   */
  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement
    const index = this.focusableElements.indexOf(target)
    if (index !== -1) {
      this.currentFocusIndex = index
    }

    // 为焦点元素添加描述
    this.announceFocusedElement(target)
  }

  /**
   * 播报焦点元素
   */
  private announceFocusedElement(element: HTMLElement): void {
    let announcement = ''

    // 获取元素的无障碍标签
    const ariaLabel = element.getAttribute('aria-label')
    const title = element.getAttribute('title')
    const textContent = element.textContent?.trim()

    announcement = ariaLabel || title || textContent || element.tagName

    // 添加角色信息
    const role = element.getAttribute('role') || this.getImplicitRole(element)
    if (role) {
      announcement += `，${this.getRoleDescription(role)}`
    }

    this.announce(announcement)
  }

  /**
   * 获取元素的隐式角色
   */
  private getImplicitRole(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase()
    const roleMap: Record<string, string> = {
      'button': 'button',
      'a': 'link',
      'input': 'textbox',
      'select': 'combobox',
      'textarea': 'textbox'
    }
    return roleMap[tagName] || ''
  }

  /**
   * 获取角色描述
   */
  private getRoleDescription(role: string): string {
    const descriptions: Record<string, string> = {
      'button': '按钮',
      'link': '链接',
      'textbox': '文本框',
      'combobox': '下拉框',
      'region': '区域',
      'application': '应用程序'
    }
    return descriptions[role] || role
  }

  /**
   * 启用高对比度模式
   */
  private enableHighContrast(): void {
    if (!this.container) return

    this.container.classList.add('high-contrast-mode')

    // 添加高对比度样式
    const style = document.createElement('style')
    style.textContent = `
      .high-contrast-mode {
        filter: contrast(150%) brightness(120%);
      }
      .high-contrast-mode .pdf-toolbar {
        background: #000000 !important;
        color: #ffffff !important;
        border-color: #ffffff !important;
      }
      .high-contrast-mode .toolbar-btn {
        background: #000000 !important;
        color: #ffffff !important;
        border: 2px solid #ffffff !important;
      }
      .high-contrast-mode .toolbar-btn:hover {
        background: #ffffff !important;
        color: #000000 !important;
      }
      .high-contrast-mode canvas {
        filter: contrast(120%);
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 创建播报区域
   */
  private createAnnounceRegion(): void {
    this.announceRegion = document.createElement('div')
    this.announceRegion.setAttribute('aria-live', 'polite')
    this.announceRegion.setAttribute('aria-atomic', 'true')
    this.announceRegion.className = 'sr-only'
    this.announceRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(this.announceRegion)
  }

  /**
   * 播报消息
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announceRegion || !this.options.customAnnouncements) return

    this.announceRegion.setAttribute('aria-live', priority)
    this.announceRegion.textContent = message

    // 清空消息以便重复播报相同内容
    setTimeout(() => {
      if (this.announceRegion) {
        this.announceRegion.textContent = ''
      }
    }, 1000)
  }

  /**
   * 播报动作执行
   */
  private announceAction(description: string): void {
    this.announce(`执行操作：${description}`)
  }

  /**
   * 播报页面变化
   */
  announcePageChange(currentPage: number, totalPages: number): void {
    if (this.options.announcePageChanges) {
      this.announce(`当前页面：第${currentPage}页，共${totalPages}页`)
    }
  }

  /**
   * 播报搜索结果
   */
  announceSearchResults(query: string, results: number): void {
    if (this.options.announceSearchResults) {
      const message = results > 0 
        ? `找到${results}个"${query}"的搜索结果`
        : `未找到"${query}"的搜索结果`
      this.announce(message)
    }
  }

  /**
   * 添加自定义快捷键
   */
  addShortcut(shortcut: KeyboardShortcut): void {
    const key = shortcut.modifiers ? 
      [...shortcut.modifiers, shortcut.key].join('+') : 
      shortcut.key
    
    this.shortcuts.set(key, shortcut)
  }

  /**
   * 移除快捷键
   */
  removeShortcut(key: string, modifiers?: string[]): void {
    const shortcutKey = modifiers ? [...modifiers, key].join('+') : key
    this.shortcuts.delete(shortcutKey)
  }

  /**
   * 获取所有快捷键
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * 切换高对比度模式
   */
  toggleHighContrast(): void {
    this.options.enableHighContrast = !this.options.enableHighContrast
    
    if (this.options.enableHighContrast) {
      this.enableHighContrast()
    } else {
      this.container?.classList.remove('high-contrast-mode')
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.shortcuts.clear()
    this.focusableElements = []
    
    if (this.announceRegion) {
      document.body.removeChild(this.announceRegion)
      this.announceRegion = null
    }

    // 移除帮助文本
    const helpText = document.getElementById('pdf-help-text')
    if (helpText) {
      document.body.removeChild(helpText)
    }
  }
}

/**
 * 创建无障碍管理器
 */
export function createAccessibilityManager(options?: AccessibilityOptions): AccessibilityManager {
  return new AccessibilityManager(options)
}
