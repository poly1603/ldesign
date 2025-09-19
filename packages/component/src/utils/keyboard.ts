/**
 * 键盘导航支持工具
 * 
 * 提供键盘事件处理、焦点管理和键盘导航功能
 */

import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

/**
 * 键盘事件类型
 */
export type KeyboardEventType = 'keydown' | 'keyup' | 'keypress'

/**
 * 修饰键
 */
export interface ModifierKeys {
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
}

/**
 * 键盘快捷键配置
 */
export interface KeyboardShortcut {
  /** 主键 */
  key: string
  /** 修饰键 */
  modifiers?: ModifierKeys
  /** 事件类型 */
  eventType?: KeyboardEventType
  /** 是否阻止默认行为 */
  preventDefault?: boolean
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean
  /** 回调函数 */
  handler: (event: KeyboardEvent) => void
  /** 描述 */
  description?: string
}

/**
 * 焦点管理选项
 */
export interface FocusOptions {
  /** 是否循环焦点 */
  loop?: boolean
  /** 是否包含隐藏元素 */
  includeHidden?: boolean
  /** 自定义可聚焦选择器 */
  focusableSelector?: string
  /** 是否自动聚焦第一个元素 */
  autoFocus?: boolean
}

/**
 * 默认可聚焦元素选择器
 */
export const DEFAULT_FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ')

/**
 * 键盘导航管理器
 */
export class KeyboardNavigationManager {
  private element: HTMLElement | null = null
  private shortcuts = new Map<string, KeyboardShortcut>()
  private listeners = new Map<string, (event: KeyboardEvent) => void>()
  private options: FocusOptions

  constructor(options: FocusOptions = {}) {
    this.options = {
      loop: true,
      includeHidden: false,
      focusableSelector: DEFAULT_FOCUSABLE_SELECTOR,
      autoFocus: false,
      ...options
    }
  }

  /**
   * 绑定到元素
   */
  bind(element: HTMLElement): void {
    this.unbind()
    this.element = element

    // 添加键盘事件监听器
    const keydownListener = this.handleKeyDown.bind(this)
    element.addEventListener('keydown', keydownListener)
    this.listeners.set('keydown', keydownListener)

    // 自动聚焦第一个元素
    if (this.options.autoFocus) {
      nextTick(() => {
        this.focusFirst()
      })
    }
  }

  /**
   * 解绑元素
   */
  unbind(): void {
    if (!this.element) return

    this.listeners.forEach((listener, eventType) => {
      this.element!.removeEventListener(eventType as keyof HTMLElementEventMap, listener as EventListener)
    })

    this.element = null
    this.listeners.clear()
  }

  /**
   * 注册键盘快捷键
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut)
    this.shortcuts.set(key, shortcut)
  }

  /**
   * 注销键盘快捷键
   */
  unregisterShortcut(key: string, modifiers?: ModifierKeys): void {
    const shortcutKey = this.getShortcutKey({ key, modifiers } as KeyboardShortcut)
    this.shortcuts.delete(shortcutKey)
  }

  /**
   * 获取所有可聚焦元素
   */
  getFocusableElements(): HTMLElement[] {
    if (!this.element) return []

    const elements = Array.from(
      this.element.querySelectorAll(this.options.focusableSelector!)
    ) as HTMLElement[]

    return elements.filter(element => {
      if (!this.options.includeHidden && !this.isVisible(element)) {
        return false
      }
      return !element.hasAttribute('disabled') && element.tabIndex !== -1
    })
  }

  /**
   * 聚焦第一个元素
   */
  focusFirst(): boolean {
    const elements = this.getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
      return true
    }
    return false
  }

  /**
   * 聚焦最后一个元素
   */
  focusLast(): boolean {
    const elements = this.getFocusableElements()
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
      return true
    }
    return false
  }

  /**
   * 聚焦下一个元素
   */
  focusNext(): boolean {
    const elements = this.getFocusableElements()
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement)

    if (currentIndex === -1) {
      return this.focusFirst()
    }

    const nextIndex = currentIndex + 1
    if (nextIndex < elements.length) {
      elements[nextIndex].focus()
      return true
    } else if (this.options.loop) {
      return this.focusFirst()
    }

    return false
  }

  /**
   * 聚焦上一个元素
   */
  focusPrevious(): boolean {
    const elements = this.getFocusableElements()
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement)

    if (currentIndex === -1) {
      return this.focusLast()
    }

    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      elements[prevIndex].focus()
      return true
    } else if (this.options.loop) {
      return this.focusLast()
    }

    return false
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // 检查快捷键
    const shortcutKey = this.getShortcutKey({
      key: event.key,
      modifiers: {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      }
    } as KeyboardShortcut)

    const shortcut = this.shortcuts.get(shortcutKey)
    if (shortcut) {
      if (shortcut.preventDefault) event.preventDefault()
      if (shortcut.stopPropagation) event.stopPropagation()
      shortcut.handler(event)
      return
    }

    // 默认导航行为
    switch (event.key) {
      case 'Tab':
        if (event.shiftKey) {
          if (this.focusPrevious()) {
            event.preventDefault()
          }
        } else {
          if (this.focusNext()) {
            event.preventDefault()
          }
        }
        break

      case 'Home':
        if (this.focusFirst()) {
          event.preventDefault()
        }
        break

      case 'End':
        if (this.focusLast()) {
          event.preventDefault()
        }
        break
    }
  }

  /**
   * 生成快捷键标识符
   */
  private getShortcutKey(shortcut: Pick<KeyboardShortcut, 'key' | 'modifiers'>): string {
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
   * 检查元素是否可见
   */
  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
  }
}

/**
 * 焦点陷阱管理器
 */
export class FocusTrapManager {
  private element: HTMLElement | null = null
  private previousActiveElement: Element | null = null
  private isActive = false

  /**
   * 激活焦点陷阱
   */
  activate(element: HTMLElement): void {
    if (this.isActive) {
      this.deactivate()
    }

    this.element = element
    this.previousActiveElement = document.activeElement
    this.isActive = true

    // 添加事件监听器
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('focusin', this.handleFocusIn.bind(this))

    // 聚焦第一个可聚焦元素
    this.focusFirstElement()
  }

  /**
   * 停用焦点陷阱
   */
  deactivate(): void {
    if (!this.isActive) return

    this.isActive = false

    // 移除事件监听器
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    document.removeEventListener('focusin', this.handleFocusIn.bind(this))

    // 恢复之前的焦点
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as HTMLElement).focus()
    }

    this.element = null
    this.previousActiveElement = null
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isActive || !this.element) return

    if (event.key === 'Tab') {
      const focusableElements = this.getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          event.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          event.preventDefault()
        }
      }
    }
  }

  /**
   * 处理焦点进入事件
   */
  private handleFocusIn(event: FocusEvent): void {
    if (!this.isActive || !this.element) return

    const target = event.target as HTMLElement
    if (!this.element.contains(target)) {
      this.focusFirstElement()
    }
  }

  /**
   * 聚焦第一个元素
   */
  private focusFirstElement(): void {
    const focusableElements = this.getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }

  /**
   * 获取可聚焦元素
   */
  private getFocusableElements(): HTMLElement[] {
    if (!this.element) return []

    return Array.from(
      this.element.querySelectorAll(DEFAULT_FOCUSABLE_SELECTOR)
    ) as HTMLElement[]
  }
}

/**
 * 键盘导航 Composable
 */
export function useKeyboardNavigation(
  element: Ref<HTMLElement | null>,
  options: FocusOptions = {}
) {
  const manager = new KeyboardNavigationManager(options)
  const isActive = ref(false)

  onMounted(() => {
    if (element.value) {
      manager.bind(element.value)
      isActive.value = true
    }
  })

  onUnmounted(() => {
    manager.unbind()
    isActive.value = false
  })

  return {
    isActive,
    registerShortcut: manager.registerShortcut.bind(manager),
    unregisterShortcut: manager.unregisterShortcut.bind(manager),
    focusFirst: manager.focusFirst.bind(manager),
    focusLast: manager.focusLast.bind(manager),
    focusNext: manager.focusNext.bind(manager),
    focusPrevious: manager.focusPrevious.bind(manager),
    getFocusableElements: manager.getFocusableElements.bind(manager)
  }
}

/**
 * 焦点陷阱 Composable
 */
export function useFocusTrap() {
  const manager = new FocusTrapManager()

  onUnmounted(() => {
    manager.deactivate()
  })

  return {
    activate: manager.activate.bind(manager),
    deactivate: manager.deactivate.bind(manager)
  }
}

/**
 * 检查是否按下了指定的键
 */
export function isKeyPressed(event: KeyboardEvent, key: string, modifiers?: ModifierKeys): boolean {
  if (event.key.toLowerCase() !== key.toLowerCase()) {
    return false
  }

  if (modifiers) {
    if (modifiers.ctrl && !event.ctrlKey) return false
    if (modifiers.alt && !event.altKey) return false
    if (modifiers.shift && !event.shiftKey) return false
    if (modifiers.meta && !event.metaKey) return false
  }

  return true
}

/**
 * 获取键盘事件的描述字符串
 */
export function getKeyboardEventDescription(event: KeyboardEvent): string {
  const parts = []

  if (event.ctrlKey) parts.push('Ctrl')
  if (event.altKey) parts.push('Alt')
  if (event.shiftKey) parts.push('Shift')
  if (event.metaKey) parts.push('Meta')

  parts.push(event.key)

  return parts.join(' + ')
}

/**
 * 常用键盘快捷键常量
 */
export const KEYBOARD_SHORTCUTS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const
