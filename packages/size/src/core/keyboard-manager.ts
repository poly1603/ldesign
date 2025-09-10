/**
 * 键盘快捷键管理器
 */

import type { SizeMode } from '../types'
import { globalSizeManager } from './size-manager'

export interface KeyboardShortcut {
  /** 快捷键组合 */
  key: string
  /** 修饰键 */
  modifiers?: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  }
  /** 动作 */
  action: 'increase' | 'decrease' | 'toggle' | 'set' | (() => void)
  /** 设置模式时的目标模式 */
  targetMode?: SizeMode
  /** 描述 */
  description?: string
}

export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private enabled = true
  private boundHandler: ((e: KeyboardEvent) => void) | null = null

  constructor() {
    this.setupDefaultShortcuts()
  }

  /**
   * 设置默认快捷键
   */
  private setupDefaultShortcuts() {
    // 增大尺寸: Ctrl + Plus
    this.register({
      key: '+',
      modifiers: { ctrl: true },
      action: 'increase',
      description: '增大页面尺寸'
    })

    // 减小尺寸: Ctrl + Minus
    this.register({
      key: '-',
      modifiers: { ctrl: true },
      action: 'decrease',
      description: '减小页面尺寸'
    })

    // 重置尺寸: Ctrl + 0
    this.register({
      key: '0',
      modifiers: { ctrl: true },
      action: 'set',
      targetMode: 'medium',
      description: '重置页面尺寸'
    })

    // 切换尺寸: Ctrl + Shift + S
    this.register({
      key: 's',
      modifiers: { ctrl: true, shift: true },
      action: 'toggle',
      description: '切换页面尺寸'
    })
  }

  /**
   * 注册快捷键
   */
  register(shortcut: KeyboardShortcut) {
    const key = this.generateKey(shortcut)
    this.shortcuts.set(key, shortcut)
  }

  /**
   * 注销快捷键
   */
  unregister(shortcut: KeyboardShortcut) {
    const key = this.generateKey(shortcut)
    this.shortcuts.delete(key)
  }

  /**
   * 生成快捷键标识
   */
  private generateKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    if (shortcut.modifiers?.ctrl) parts.push('ctrl')
    if (shortcut.modifiers?.alt) parts.push('alt')
    if (shortcut.modifiers?.shift) parts.push('shift')
    if (shortcut.modifiers?.meta) parts.push('meta')
    parts.push(shortcut.key.toLowerCase())
    return parts.join('+')
  }

  /**
   * 从键盘事件生成键
   */
  private generateKeyFromEvent(e: KeyboardEvent): string {
    const parts: string[] = []
    if (e.ctrlKey) parts.push('ctrl')
    if (e.altKey) parts.push('alt')
    if (e.shiftKey) parts.push('shift')
    if (e.metaKey) parts.push('meta')
    
    // 处理特殊键
    let key = e.key.toLowerCase()
    if (key === '=' || key === '+') key = '+'
    if (key === '_' || key === '-') key = '-'
    
    parts.push(key)
    return parts.join('+')
  }

  /**
   * 处理键盘事件
   */
  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.enabled) return

    const key = this.generateKeyFromEvent(e)
    const shortcut = this.shortcuts.get(key)

    if (shortcut) {
      e.preventDefault()
      e.stopPropagation()

      if (typeof shortcut.action === 'function') {
        shortcut.action()
      } else {
        switch (shortcut.action) {
          case 'increase':
            this.increaseSize()
            break
          case 'decrease':
            this.decreaseSize()
            break
          case 'toggle':
            this.toggleSize()
            break
          case 'set':
            if (shortcut.targetMode) {
              globalSizeManager.setMode(shortcut.targetMode)
            }
            break
        }
      }
    }
  }

  /**
   * 增大尺寸
   */
  private increaseSize() {
    const modes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
    const currentMode = globalSizeManager.getCurrentMode()
    const currentIndex = modes.indexOf(currentMode)
    
    if (currentIndex < modes.length - 1) {
      globalSizeManager.setMode(modes[currentIndex + 1])
    }
  }

  /**
   * 减小尺寸
   */
  private decreaseSize() {
    const modes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
    const currentMode = globalSizeManager.getCurrentMode()
    const currentIndex = modes.indexOf(currentMode)
    
    if (currentIndex > 0) {
      globalSizeManager.setMode(modes[currentIndex - 1])
    }
  }

  /**
   * 切换尺寸
   */
  private toggleSize() {
    const modes: SizeMode[] = ['small', 'medium', 'large', 'extra-large']
    const currentMode = globalSizeManager.getCurrentMode()
    const currentIndex = modes.indexOf(currentMode)
    const nextIndex = (currentIndex + 1) % modes.length
    globalSizeManager.setMode(modes[nextIndex])
  }

  /**
   * 启用键盘快捷键
   */
  enable() {
    if (this.enabled || typeof window === 'undefined') return
    
    this.enabled = true
    this.boundHandler = this.handleKeydown.bind(this)
    window.addEventListener('keydown', this.boundHandler)
  }

  /**
   * 禁用键盘快捷键
   */
  disable() {
    if (!this.enabled || typeof window === 'undefined') return
    
    this.enabled = false
    if (this.boundHandler) {
      window.removeEventListener('keydown', this.boundHandler)
      this.boundHandler = null
    }
  }

  /**
   * 获取所有快捷键
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * 格式化快捷键显示
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    if (shortcut.modifiers?.ctrl) parts.push('Ctrl')
    if (shortcut.modifiers?.alt) parts.push('Alt')
    if (shortcut.modifiers?.shift) parts.push('Shift')
    if (shortcut.modifiers?.meta) parts.push('Meta')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  /**
   * 初始化
   */
  init() {
    this.enable()
  }

  /**
   * 销毁
   */
  destroy() {
    this.disable()
    this.shortcuts.clear()
  }
}

// 创建全局键盘管理器实例
export const keyboardManager = new KeyboardManager()

// 导出便捷方法
export function enableKeyboardShortcuts() {
  keyboardManager.enable()
}

export function disableKeyboardShortcuts() {
  keyboardManager.disable()
}

export function registerShortcut(shortcut: KeyboardShortcut) {
  keyboardManager.register(shortcut)
}

export function unregisterShortcut(shortcut: KeyboardShortcut) {
  keyboardManager.unregister(shortcut)
}
