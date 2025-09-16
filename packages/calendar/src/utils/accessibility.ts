/**
 * 无障碍访问工具
 */

/**
 * ARIA 属性管理器
 */
export class AriaManager {
  /**
   * 设置ARIA标签
   */
  public static setLabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label)
  }

  /**
   * 设置ARIA描述
   */
  public static setDescription(element: HTMLElement, description: string): void {
    element.setAttribute('aria-describedby', description)
  }

  /**
   * 设置ARIA状态
   */
  public static setState(element: HTMLElement, state: string, value: string | boolean): void {
    element.setAttribute(`aria-${state}`, value.toString())
  }

  /**
   * 设置ARIA属性
   */
  public static setProperty(element: HTMLElement, property: string, value: string | boolean): void {
    element.setAttribute(`aria-${property}`, value.toString())
  }

  /**
   * 设置角色
   */
  public static setRole(element: HTMLElement, role: string): void {
    element.setAttribute('role', role)
  }

  /**
   * 设置可访问性名称
   */
  public static setAccessibleName(element: HTMLElement, name: string): void {
    element.setAttribute('aria-label', name)
  }

  /**
   * 设置实时区域
   */
  public static setLiveRegion(element: HTMLElement, politeness: 'off' | 'polite' | 'assertive' = 'polite'): void {
    element.setAttribute('aria-live', politeness)
  }

  /**
   * 设置展开状态
   */
  public static setExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  /**
   * 设置选中状态
   */
  public static setSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString())
  }

  /**
   * 设置禁用状态
   */
  public static setDisabled(element: HTMLElement, disabled: boolean): void {
    element.setAttribute('aria-disabled', disabled.toString())
    if (disabled) {
      element.setAttribute('tabindex', '-1')
    } else {
      element.removeAttribute('tabindex')
    }
  }

  /**
   * 设置隐藏状态
   */
  public static setHidden(element: HTMLElement, hidden: boolean): void {
    element.setAttribute('aria-hidden', hidden.toString())
  }

  /**
   * 设置当前状态
   */
  public static setCurrent(element: HTMLElement, current: 'page' | 'step' | 'location' | 'date' | 'time' | boolean): void {
    if (typeof current === 'boolean') {
      element.setAttribute('aria-current', current.toString())
    } else {
      element.setAttribute('aria-current', current)
    }
  }

  /**
   * 设置级别
   */
  public static setLevel(element: HTMLElement, level: number): void {
    element.setAttribute('aria-level', level.toString())
  }

  /**
   * 设置位置信息
   */
  public static setPosition(element: HTMLElement, position: number, total: number): void {
    element.setAttribute('aria-posinset', position.toString())
    element.setAttribute('aria-setsize', total.toString())
  }

  /**
   * 设置控制关系
   */
  public static setControls(element: HTMLElement, controlledElementId: string): void {
    element.setAttribute('aria-controls', controlledElementId)
  }

  /**
   * 设置拥有关系
   */
  public static setOwns(element: HTMLElement, ownedElementIds: string[]): void {
    element.setAttribute('aria-owns', ownedElementIds.join(' '))
  }

  /**
   * 设置标签关系
   */
  public static setLabelledBy(element: HTMLElement, labelElementIds: string[]): void {
    element.setAttribute('aria-labelledby', labelElementIds.join(' '))
  }

  /**
   * 设置描述关系
   */
  public static setDescribedBy(element: HTMLElement, descriptionElementIds: string[]): void {
    element.setAttribute('aria-describedby', descriptionElementIds.join(' '))
  }
}

/**
 * 焦点管理器
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = []
  private static trapStack: HTMLElement[] = []

  /**
   * 设置焦点
   */
  public static setFocus(element: HTMLElement, options?: FocusOptions): void {
    element.focus(options)
  }

  /**
   * 保存当前焦点
   */
  public static saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement !== document.body) {
      this.focusStack.push(activeElement)
    }
  }

  /**
   * 恢复焦点
   */
  public static restoreFocus(): void {
    const element = this.focusStack.pop()
    if (element && element.isConnected) {
      element.focus()
    }
  }

  /**
   * 陷阱焦点
   */
  public static trapFocus(container: HTMLElement): void {
    this.trapStack.push(container)
    this.setupFocusTrap(container)
  }

  /**
   * 释放焦点陷阱
   */
  public static releaseFocusTrap(): void {
    const container = this.trapStack.pop()
    if (container) {
      this.removeFocusTrap(container)
    }
  }

  /**
   * 设置焦点陷阱
   */
  private static setupFocusTrap(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    container.dataset.focusTrapHandler = 'true'

    // 设置初始焦点
    firstElement.focus()
  }

  /**
   * 移除焦点陷阱
   */
  private static removeFocusTrap(container: HTMLElement): void {
    if (container.dataset.focusTrapHandler) {
      container.removeEventListener('keydown', this.handleFocusTrap)
      delete container.dataset.focusTrapHandler
    }
  }

  /**
   * 处理焦点陷阱
   */
  private static handleFocusTrap(event: KeyboardEvent): void {
    // 这个方法会被动态绑定
  }

  /**
   * 获取可聚焦元素
   */
  public static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[]
    return elements.filter(element => {
      return element.offsetWidth > 0 && 
             element.offsetHeight > 0 && 
             !element.hasAttribute('aria-hidden')
    })
  }

  /**
   * 获取下一个可聚焦元素
   */
  public static getNextFocusableElement(current: HTMLElement, container?: HTMLElement): HTMLElement | null {
    const focusableElements = this.getFocusableElements(container || document.body)
    const currentIndex = focusableElements.indexOf(current)
    
    if (currentIndex === -1) return null
    
    const nextIndex = (currentIndex + 1) % focusableElements.length
    return focusableElements[nextIndex]
  }

  /**
   * 获取上一个可聚焦元素
   */
  public static getPreviousFocusableElement(current: HTMLElement, container?: HTMLElement): HTMLElement | null {
    const focusableElements = this.getFocusableElements(container || document.body)
    const currentIndex = focusableElements.indexOf(current)
    
    if (currentIndex === -1) return null
    
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
    return focusableElements[prevIndex]
  }
}

/**
 * 屏幕阅读器工具
 */
export class ScreenReaderUtils {
  private static announceElement?: HTMLElement

  /**
   * 初始化
   */
  public static init(): void {
    if (!this.announceElement) {
      this.announceElement = document.createElement('div')
      this.announceElement.setAttribute('aria-live', 'polite')
      this.announceElement.setAttribute('aria-atomic', 'true')
      this.announceElement.style.position = 'absolute'
      this.announceElement.style.left = '-10000px'
      this.announceElement.style.width = '1px'
      this.announceElement.style.height = '1px'
      this.announceElement.style.overflow = 'hidden'
      document.body.appendChild(this.announceElement)
    }
  }

  /**
   * 宣布消息
   */
  public static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.init()
    
    if (this.announceElement) {
      this.announceElement.setAttribute('aria-live', priority)
      this.announceElement.textContent = message
      
      // 清空内容以便下次宣布
      setTimeout(() => {
        if (this.announceElement) {
          this.announceElement.textContent = ''
        }
      }, 1000)
    }
  }

  /**
   * 宣布状态变化
   */
  public static announceStateChange(element: HTMLElement, state: string): void {
    const label = element.getAttribute('aria-label') || element.textContent || '元素'
    this.announce(`${label} ${state}`)
  }

  /**
   * 宣布导航
   */
  public static announceNavigation(from: string, to: string): void {
    this.announce(`从 ${from} 导航到 ${to}`)
  }

  /**
   * 宣布错误
   */
  public static announceError(message: string): void {
    this.announce(`错误：${message}`, 'assertive')
  }

  /**
   * 宣布成功
   */
  public static announceSuccess(message: string): void {
    this.announce(`成功：${message}`)
  }
}

/**
 * 键盘导航工具
 */
export class KeyboardNavigation {
  /**
   * 处理方向键导航
   */
  public static handleArrowNavigation(
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    options: {
      horizontal?: boolean
      vertical?: boolean
      wrap?: boolean
    } = {}
  ): number {
    const { horizontal = true, vertical = true, wrap = true } = options
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
        if (horizontal) {
          newIndex = wrap ? 
            (currentIndex - 1 + elements.length) % elements.length :
            Math.max(0, currentIndex - 1)
          event.preventDefault()
        }
        break
      case 'ArrowRight':
        if (horizontal) {
          newIndex = wrap ?
            (currentIndex + 1) % elements.length :
            Math.min(elements.length - 1, currentIndex + 1)
          event.preventDefault()
        }
        break
      case 'ArrowUp':
        if (vertical) {
          newIndex = wrap ?
            (currentIndex - 1 + elements.length) % elements.length :
            Math.max(0, currentIndex - 1)
          event.preventDefault()
        }
        break
      case 'ArrowDown':
        if (vertical) {
          newIndex = wrap ?
            (currentIndex + 1) % elements.length :
            Math.min(elements.length - 1, currentIndex + 1)
          event.preventDefault()
        }
        break
      case 'Home':
        newIndex = 0
        event.preventDefault()
        break
      case 'End':
        newIndex = elements.length - 1
        event.preventDefault()
        break
    }

    if (newIndex !== currentIndex && elements[newIndex]) {
      elements[newIndex].focus()
    }

    return newIndex
  }

  /**
   * 处理网格导航
   */
  public static handleGridNavigation(
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    columns: number,
    options: { wrap?: boolean } = {}
  ): number {
    const { wrap = false } = options
    const rows = Math.ceil(elements.length / columns)
    const currentRow = Math.floor(currentIndex / columns)
    const currentCol = currentIndex % columns
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
        if (currentCol > 0) {
          newIndex = currentIndex - 1
        } else if (wrap && currentRow > 0) {
          newIndex = (currentRow - 1) * columns + columns - 1
        }
        event.preventDefault()
        break
      case 'ArrowRight':
        if (currentCol < columns - 1 && currentIndex + 1 < elements.length) {
          newIndex = currentIndex + 1
        } else if (wrap && currentRow < rows - 1) {
          newIndex = (currentRow + 1) * columns
        }
        event.preventDefault()
        break
      case 'ArrowUp':
        if (currentRow > 0) {
          newIndex = (currentRow - 1) * columns + currentCol
        } else if (wrap) {
          newIndex = Math.min((rows - 1) * columns + currentCol, elements.length - 1)
        }
        event.preventDefault()
        break
      case 'ArrowDown':
        if (currentRow < rows - 1) {
          newIndex = Math.min((currentRow + 1) * columns + currentCol, elements.length - 1)
        } else if (wrap) {
          newIndex = currentCol
        }
        event.preventDefault()
        break
      case 'Home':
        newIndex = currentRow * columns
        event.preventDefault()
        break
      case 'End':
        newIndex = Math.min((currentRow + 1) * columns - 1, elements.length - 1)
        event.preventDefault()
        break
      case 'PageUp':
        newIndex = currentCol
        event.preventDefault()
        break
      case 'PageDown':
        newIndex = Math.min((rows - 1) * columns + currentCol, elements.length - 1)
        event.preventDefault()
        break
    }

    if (newIndex !== currentIndex && elements[newIndex]) {
      elements[newIndex].focus()
    }

    return newIndex
  }
}

/**
 * 无障碍访问工具集合
 */
export const AccessibilityUtils = {
  AriaManager,
  FocusManager,
  ScreenReaderUtils,
  KeyboardNavigation,

  /**
   * 初始化无障碍功能
   */
  init(): void {
    ScreenReaderUtils.init()
  },

  /**
   * 检查无障碍支持
   */
  checkSupport(): {
    screenReader: boolean
    keyboardNavigation: boolean
    highContrast: boolean
    reducedMotion: boolean
  } {
    return {
      screenReader: 'speechSynthesis' in window,
      keyboardNavigation: true, // 总是支持
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  },

  /**
   * 设置高对比度模式
   */
  setHighContrast(enabled: boolean): void {
    document.documentElement.classList.toggle('high-contrast', enabled)
  },

  /**
   * 设置减少动画模式
   */
  setReducedMotion(enabled: boolean): void {
    document.documentElement.classList.toggle('reduced-motion', enabled)
  }
}
