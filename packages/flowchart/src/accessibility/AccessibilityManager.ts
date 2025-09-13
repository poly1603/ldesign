/**
 * 无障碍访问管理器
 * 提供键盘导航、屏幕阅读器支持、高对比度模式等无障碍功能
 */

export interface AccessibilityConfig {
  /** 启用键盘导航 */
  enableKeyboardNavigation: boolean
  /** 启用屏幕阅读器支持 */
  enableScreenReader: boolean
  /** 启用高对比度模式 */
  enableHighContrast: boolean
  /** 启用焦点指示器 */
  enableFocusIndicator: boolean
  /** 键盘导航步长 */
  keyboardNavigationStep: number
  /** 焦点环颜色 */
  focusRingColor: string
  /** 语音提示语言 */
  speechLanguage: string
}

export interface NavigationItem {
  id: string
  element: HTMLElement
  type: 'node' | 'edge' | 'tool' | 'control'
  label: string
  description?: string
  position: { x: number, y: number }
  focusable: boolean
}

/**
 * 无障碍访问管理器
 */
export class AccessibilityManager {
  private config: AccessibilityConfig
  private container: HTMLElement | null = null
  private navigableItems: NavigationItem[] = []
  private currentFocusIndex: number = -1
  private keyboardEventListener?: (event: KeyboardEvent) => void
  private announcementRegion?: HTMLElement
  private focusIndicator?: HTMLElement
  
  // 语音合成API
  private speechSynthesis?: SpeechSynthesis
  private speechVoices: SpeechSynthesisVoice[] = []

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      enableHighContrast: false,
      enableFocusIndicator: true,
      keyboardNavigationStep: 20,
      focusRingColor: '#0066cc',
      speechLanguage: 'zh-CN',
      ...config
    }

    this.initializeSpeechSynthesis()
  }

  /**
   * 初始化无障碍功能
   */
  initialize(container: HTMLElement): void {
    this.container = container
    
    console.log('初始化无障碍访问功能')

    this.setupContainer()
    this.createAnnouncementRegion()
    this.createFocusIndicator()
    this.setupKeyboardNavigation()
    this.setupScreenReader()
    this.applyHighContrastMode()
    this.detectSystemPreferences()
  }

  /**
   * 设置容器
   */
  private setupContainer(): void {
    if (!this.container) return

    // 设置必要的ARIA属性
    this.container.setAttribute('role', 'application')
    this.container.setAttribute('aria-label', '流程图编辑器')
    this.container.setAttribute('aria-description', '用于创建和编辑流程图的可视化编辑器')
    this.container.setAttribute('tabindex', '0')

    // 设置键盘可访问性
    this.container.style.outline = 'none' // 使用自定义焦点指示器
  }

  /**
   * 创建语音提示区域
   */
  private createAnnouncementRegion(): void {
    if (!this.config.enableScreenReader) return

    this.announcementRegion = document.createElement('div')
    this.announcementRegion.setAttribute('aria-live', 'polite')
    this.announcementRegion.setAttribute('aria-atomic', 'true')
    this.announcementRegion.setAttribute('aria-relevant', 'text')
    this.announcementRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `
    document.body.appendChild(this.announcementRegion)
  }

  /**
   * 创建焦点指示器
   */
  private createFocusIndicator(): void {
    if (!this.config.enableFocusIndicator) return

    this.focusIndicator = document.createElement('div')
    this.focusIndicator.className = 'accessibility-focus-indicator'
    this.focusIndicator.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 3px solid ${this.config.focusRingColor};
      border-radius: 4px;
      box-shadow: 0 0 0 1px white, 0 0 8px ${this.config.focusRingColor};
      z-index: 9999;
      display: none;
      transition: all 0.2s ease;
    `
    document.body.appendChild(this.focusIndicator)
  }

  /**
   * 设置键盘导航
   */
  private setupKeyboardNavigation(): void {
    if (!this.config.enableKeyboardNavigation) return

    this.keyboardEventListener = (event: KeyboardEvent) => {
      this.handleKeyboardNavigation(event)
    }

    document.addEventListener('keydown', this.keyboardEventListener)
  }

  /**
   * 处理键盘导航
   */
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    // 只在编辑器获得焦点时处理
    if (!this.container?.contains(document.activeElement)) {
      return
    }

    const { key, ctrlKey, altKey, shiftKey } = event

    switch (key) {
      case 'Tab':
        event.preventDefault()
        this.navigateToNext(shiftKey ? -1 : 1)
        break
        
      case 'ArrowUp':
        event.preventDefault()
        this.moveCurrentItem(0, -this.config.keyboardNavigationStep)
        break
        
      case 'ArrowDown':
        event.preventDefault()
        this.moveCurrentItem(0, this.config.keyboardNavigationStep)
        break
        
      case 'ArrowLeft':
        event.preventDefault()
        this.moveCurrentItem(-this.config.keyboardNavigationStep, 0)
        break
        
      case 'ArrowRight':
        event.preventDefault()
        this.moveCurrentItem(this.config.keyboardNavigationStep, 0)
        break
        
      case 'Enter':
      case ' ':
        event.preventDefault()
        this.activateCurrentItem()
        break
        
      case 'Escape':
        event.preventDefault()
        this.clearFocus()
        break
        
      case 'Home':
        event.preventDefault()
        this.navigateToFirst()
        break
        
      case 'End':
        event.preventDefault()
        this.navigateToLast()
        break

      // 快捷键
      case 'h':
        if (altKey) {
          event.preventDefault()
          this.announceHelp()
        }
        break
        
      case 'd':
        if (altKey) {
          event.preventDefault()
          this.describeCurrentItem()
        }
        break
    }

    // Ctrl + 组合键
    if (ctrlKey) {
      switch (key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault()
          this.navigateToItemType(['node', 'edge', 'tool', 'control'][parseInt(key) - 1] as any)
          break
      }
    }
  }

  /**
   * 更新可导航项目列表
   */
  updateNavigableItems(items: NavigationItem[]): void {
    this.navigableItems = items.filter(item => item.focusable)
    
    // 为每个项目设置无障碍属性
    this.navigableItems.forEach((item, index) => {
      const element = item.element
      element.setAttribute('tabindex', index === this.currentFocusIndex ? '0' : '-1')
      element.setAttribute('role', this.getAriaRole(item.type))
      element.setAttribute('aria-label', item.label)
      
      if (item.description) {
        element.setAttribute('aria-description', item.description)
      }
      
      // 为不同类型的元素设置特定属性
      switch (item.type) {
        case 'node':
          element.setAttribute('aria-selected', 'false')
          break
        case 'tool':
          element.setAttribute('aria-pressed', 'false')
          break
      }
    })
  }

  /**
   * 导航到下一个/上一个项目
   */
  private navigateToNext(direction: number): void {
    if (this.navigableItems.length === 0) return

    const newIndex = this.currentFocusIndex + direction
    const clampedIndex = Math.max(0, Math.min(newIndex, this.navigableItems.length - 1))
    
    this.focusItem(clampedIndex)
  }

  /**
   * 导航到第一个项目
   */
  private navigateToFirst(): void {
    if (this.navigableItems.length > 0) {
      this.focusItem(0)
    }
  }

  /**
   * 导航到最后一个项目
   */
  private navigateToLast(): void {
    if (this.navigableItems.length > 0) {
      this.focusItem(this.navigableItems.length - 1)
    }
  }

  /**
   * 导航到指定类型的项目
   */
  private navigateToItemType(type: NavigationItem['type']): void {
    const itemIndex = this.navigableItems.findIndex(item => item.type === type)
    if (itemIndex !== -1) {
      this.focusItem(itemIndex)
    }
  }

  /**
   * 聚焦到指定项目
   */
  private focusItem(index: number): void {
    if (index < 0 || index >= this.navigableItems.length) return

    // 更新旧焦点
    if (this.currentFocusIndex !== -1 && this.navigableItems[this.currentFocusIndex]) {
      const oldItem = this.navigableItems[this.currentFocusIndex]
      oldItem.element.setAttribute('tabindex', '-1')
      oldItem.element.setAttribute('aria-selected', 'false')
    }

    // 设置新焦点
    this.currentFocusIndex = index
    const currentItem = this.navigableItems[index]
    
    currentItem.element.setAttribute('tabindex', '0')
    currentItem.element.focus()
    currentItem.element.setAttribute('aria-selected', 'true')

    // 更新焦点指示器
    this.updateFocusIndicator(currentItem.element)
    
    // 语音提示
    this.announceItem(currentItem)
  }

  /**
   * 移动当前项目
   */
  private moveCurrentItem(dx: number, dy: number): void {
    if (this.currentFocusIndex === -1) return
    
    const currentItem = this.navigableItems[this.currentFocusIndex]
    if (currentItem.type === 'node') {
      // 触发移动事件
      const moveEvent = new CustomEvent('accessibility:move-item', {
        detail: { 
          itemId: currentItem.id, 
          dx, 
          dy,
          newPosition: {
            x: currentItem.position.x + dx,
            y: currentItem.position.y + dy
          }
        }
      })
      this.container?.dispatchEvent(moveEvent)
      
      this.announce(`节点已移动到位置 ${currentItem.position.x + dx}, ${currentItem.position.y + dy}`)
    }
  }

  /**
   * 激活当前项目
   */
  private activateCurrentItem(): void {
    if (this.currentFocusIndex === -1) return
    
    const currentItem = this.navigableItems[this.currentFocusIndex]
    
    // 触发点击事件
    const clickEvent = new CustomEvent('accessibility:activate-item', {
      detail: { itemId: currentItem.id, type: currentItem.type }
    })
    currentItem.element.dispatchEvent(clickEvent)
    
    this.announceItem(currentItem, '已激活')
  }

  /**
   * 清除焦点
   */
  private clearFocus(): void {
    if (this.currentFocusIndex !== -1 && this.navigableItems[this.currentFocusIndex]) {
      const currentItem = this.navigableItems[this.currentFocusIndex]
      currentItem.element.setAttribute('tabindex', '-1')
      currentItem.element.setAttribute('aria-selected', 'false')
    }
    
    this.currentFocusIndex = -1
    this.hideFocusIndicator()
    this.container?.focus()
    
    this.announce('已清除焦点')
  }

  /**
   * 更新焦点指示器
   */
  private updateFocusIndicator(element: HTMLElement): void {
    if (!this.focusIndicator) return

    const rect = element.getBoundingClientRect()
    this.focusIndicator.style.display = 'block'
    this.focusIndicator.style.left = `${rect.left - 3}px`
    this.focusIndicator.style.top = `${rect.top - 3}px`
    this.focusIndicator.style.width = `${rect.width + 6}px`
    this.focusIndicator.style.height = `${rect.height + 6}px`
  }

  /**
   * 隐藏焦点指示器
   */
  private hideFocusIndicator(): void {
    if (this.focusIndicator) {
      this.focusIndicator.style.display = 'none'
    }
  }

  /**
   * 语音提示项目信息
   */
  private announceItem(item: NavigationItem, suffix = ''): void {
    const message = `${item.label}${item.description ? ', ' + item.description : ''}${suffix}`
    this.announce(message)
  }

  /**
   * 语音提示
   */
  announce(message: string): void {
    if (!this.config.enableScreenReader) return

    // 使用ARIA live region
    if (this.announcementRegion) {
      this.announcementRegion.textContent = message
    }

    // 使用语音合成API（如果可用）
    if (this.speechSynthesis) {
      this.speak(message)
    }
  }

  /**
   * 语音播报
   */
  private speak(text: string): void {
    if (!this.speechSynthesis) return

    // 停止当前语音
    this.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = this.config.speechLanguage
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 0.8

    // 选择合适的语音
    const voice = this.speechVoices.find(v => v.lang.startsWith(this.config.speechLanguage.split('-')[0]))
    if (voice) {
      utterance.voice = voice
    }

    this.speechSynthesis.speak(utterance)
  }

  /**
   * 描述当前项目
   */
  private describeCurrentItem(): void {
    if (this.currentFocusIndex === -1) {
      this.announce('当前没有选中任何项目')
      return
    }
    
    const currentItem = this.navigableItems[this.currentFocusIndex]
    let description = `当前项目：${currentItem.label}，类型：${this.getTypeLabel(currentItem.type)}`
    
    if (currentItem.position) {
      description += `，位置：${currentItem.position.x}, ${currentItem.position.y}`
    }
    
    if (currentItem.description) {
      description += `，详细信息：${currentItem.description}`
    }
    
    this.announce(description)
  }

  /**
   * 提供帮助信息
   */
  private announceHelp(): void {
    const helpText = `
      流程图编辑器键盘快捷键：
      Tab 或 Shift+Tab：在项目间导航，
      方向键：移动选中的节点，
      Enter 或 空格：激活当前项目，
      Home：跳到第一个项目，
      End：跳到最后一个项目，
      Escape：清除焦点，
      Alt+H：获取帮助信息，
      Alt+D：描述当前项目，
      Ctrl+1到5：跳转到不同类型的项目
    `
    this.announce(helpText)
  }

  /**
   * 应用高对比度模式
   */
  private applyHighContrastMode(): void {
    if (!this.config.enableHighContrast) return

    const style = document.createElement('style')
    style.id = 'accessibility-high-contrast'
    style.textContent = `
      .ldesign-flowchart-ui {
        --ldesign-text-color-primary: #000000 !important;
        --ldesign-text-color-secondary: #000000 !important;
        --ldesign-bg-color-container: #ffffff !important;
        --ldesign-bg-color-component: #ffffff !important;
        --ldesign-border-color: #000000 !important;
        --ldesign-brand-color: #0066cc !important;
      }
      
      .ldesign-flowchart-ui * {
        outline-color: #000000 !important;
      }
      
      .ldesign-flowchart-ui .flowchart-node {
        border: 2px solid #000000 !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      
      .ldesign-flowchart-ui .flowchart-edge {
        stroke: #000000 !important;
        stroke-width: 2px !important;
      }
      
      .ldesign-flowchart-ui button:focus,
      .ldesign-flowchart-ui input:focus,
      .ldesign-flowchart-ui select:focus {
        outline: 3px solid #0066cc !important;
        outline-offset: 2px !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 检测系统偏好设置
   */
  private detectSystemPreferences(): void {
    // 检测系统高对比度偏好
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      this.config.enableHighContrast = true
      this.applyHighContrastMode()
    }

    // 检测动画偏好
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // 禁用动画
      const style = document.createElement('style')
      style.textContent = `
        .ldesign-flowchart-ui *,
        .ldesign-flowchart-ui *::before,
        .ldesign-flowchart-ui *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `
      document.head.appendChild(style)
    }

    // 监听偏好设置变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-contrast: high)').addListener((e) => {
        this.config.enableHighContrast = e.matches
        if (e.matches) {
          this.applyHighContrastMode()
        } else {
          const style = document.getElementById('accessibility-high-contrast')
          style?.remove()
        }
      })
    }
  }

  /**
   * 初始化语音合成
   */
  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis
      
      // 获取可用语音
      const loadVoices = () => {
        this.speechVoices = this.speechSynthesis!.getVoices()
      }
      
      loadVoices()
      this.speechSynthesis.onvoiceschanged = loadVoices
    }
  }

  /**
   * 获取ARIA角色
   */
  private getAriaRole(type: NavigationItem['type']): string {
    switch (type) {
      case 'node':
        return 'button'
      case 'edge':
        return 'button'
      case 'tool':
        return 'button'
      case 'control':
        return 'button'
      default:
        return 'button'
    }
  }

  /**
   * 获取类型标签
   */
  private getTypeLabel(type: NavigationItem['type']): string {
    switch (type) {
      case 'node':
        return '节点'
      case 'edge':
        return '连线'
      case 'tool':
        return '工具'
      case 'control':
        return '控件'
      default:
        return '未知'
    }
  }

  /**
   * 启用/禁用高对比度模式
   */
  toggleHighContrastMode(enable?: boolean): void {
    this.config.enableHighContrast = enable ?? !this.config.enableHighContrast
    
    if (this.config.enableHighContrast) {
      this.applyHighContrastMode()
      this.announce('已启用高对比度模式')
    } else {
      const style = document.getElementById('accessibility-high-contrast')
      style?.remove()
      this.announce('已禁用高对比度模式')
    }
  }

  /**
   * 获取当前聚焦的项目
   */
  getCurrentFocusedItem(): NavigationItem | null {
    return this.currentFocusIndex !== -1 ? this.navigableItems[this.currentFocusIndex] : null
  }

  /**
   * 销毁无障碍管理器
   */
  destroy(): void {
    // 移除事件监听器
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener)
    }

    // 清理DOM元素
    if (this.announcementRegion) {
      this.announcementRegion.remove()
    }
    
    if (this.focusIndicator) {
      this.focusIndicator.remove()
    }

    // 停止语音播报
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel()
    }

    // 清理样式
    document.getElementById('accessibility-high-contrast')?.remove()

    // 重置状态
    this.navigableItems = []
    this.currentFocusIndex = -1
  }
}

/**
 * 默认无障碍管理器实例
 */
export const defaultAccessibilityManager = new AccessibilityManager()
