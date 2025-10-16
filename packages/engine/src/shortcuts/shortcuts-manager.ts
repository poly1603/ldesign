/**
 * 快捷键管理器
 * 统一管理应用中的所有快捷键
 */

export type ShortcutKey = string
export type ShortcutHandler = (event: KeyboardEvent) => void | boolean
export type ShortcutScope = string

export interface ShortcutOptions {
  /** 快捷键描述 */
  description?: string
  /** 作用域，默认为 'global' */
  scope?: ShortcutScope
  /** 是否阻止默认行为 */
  preventDefault?: boolean
  /** 是否阻止事件冒泡 */
  stopPropagation?: boolean
  /** 是否在输入框中也触发 */
  allowInInput?: boolean
  /** 是否启用 */
  enabled?: boolean
  /** 优先级，数字越大优先级越高 */
  priority?: number
}

export interface Shortcut {
  key: ShortcutKey
  handler: ShortcutHandler
  options: Required<ShortcutOptions>
}

export interface ShortcutGroup {
  name: string
  description?: string
  shortcuts: Map<ShortcutKey, Shortcut>
}

/**
 * 解析快捷键字符串
 */
function parseShortcut(key: string): {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  key: string
} {
  const parts = key.toLowerCase().split('+').map(p => p.trim())

  return {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    key: parts[parts.length - 1] // 最后一部分是实际的键
  }
}

/**
 * 检查键盘事件是否匹配快捷键
 */
function matchShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parsed = parseShortcut(shortcut)
  const eventKey = event.key.toLowerCase()

  // 检查修饰键
  if (parsed.ctrl !== (event.ctrlKey || event.metaKey)) return false
  if (parsed.shift !== event.shiftKey) return false
  if (parsed.alt !== event.altKey) return false
  if (parsed.meta !== event.metaKey) return false

  // 检查主键
  // 处理特殊键名
  const keyMap: Record<string, string[]> = {
    'esc': ['escape', 'esc'],
    'escape': ['escape', 'esc'],
    'enter': ['enter', 'return'],
    'return': ['enter', 'return'],
    'space': [' ', 'space', 'spacebar'],
    'spacebar': [' ', 'space', 'spacebar'],
    'up': ['arrowup', 'up'],
    'down': ['arrowdown', 'down'],
    'left': ['arrowleft', 'left'],
    'right': ['arrowright', 'right'],
    'del': ['delete', 'del'],
    'delete': ['delete', 'del'],
    'backspace': ['backspace'],
    'tab': ['tab'],
    '/': ['/', 'slash'],
    '\\': ['\\', 'backslash'],
    '?': ['?', 'question'],
    '.': ['.', 'period'],
    ',': [',', 'comma'],
  }

  const normalizedKey = parsed.key
  const possibleKeys = keyMap[normalizedKey] || [normalizedKey]

  return possibleKeys.includes(eventKey)
}

/**
 * 检查是否在输入元素中
 */
function isInInput(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement
  if (!target) return false

  const tagName = target.tagName.toLowerCase()
  const isContentEditable = target.isContentEditable
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select'

  return isInput || isContentEditable
}

export class ShortcutsManager {
  private shortcuts = new Map<ShortcutKey, Shortcut>()
  private scopes = new Map<ShortcutScope, ShortcutGroup>()
  private activeScopes = new Set<ShortcutScope>(['global'])
  private enabled = true
  private listener?: (event: KeyboardEvent) => void
  private conflictMode: 'error' | 'warn' | 'override' = 'warn'

  constructor() {
    this.init()
  }

  /**
   * 初始化
   */
  private init(): void {
    this.listener = (event: KeyboardEvent) => this.handleKeyPress(event)

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.listener)
    }

    // 创建默认作用域
    this.scopes.set('global', {
      name: 'global',
      description: '全局快捷键',
      shortcuts: new Map()
    })
  }

  /**
   * 注册快捷键
   */
  register(key: ShortcutKey, handler: ShortcutHandler, options?: ShortcutOptions): void {
    const defaultOptions: Required<ShortcutOptions> = {
      description: '',
      scope: 'global',
      preventDefault: true,
      stopPropagation: false,
      allowInInput: false,
      enabled: true,
      priority: 0
    }

    const mergedOptions = { ...defaultOptions, ...options }
    const scopeName = mergedOptions.scope

    // 检查冲突
    if (this.checkConflict(key, scopeName)) {
      if (this.conflictMode === 'error') {
        throw new Error(`快捷键 ${key} 在作用域 ${scopeName} 中已存在`)
      } else if (this.conflictMode === 'warn') {
        console.warn(`快捷键 ${key} 在作用域 ${scopeName} 中已存在，将被覆盖`)
      }
    }

    const shortcut: Shortcut = {
      key,
      handler,
      options: mergedOptions
    }

    // 添加到全局映射
    const fullKey = `${scopeName}:${key}`
    this.shortcuts.set(fullKey, shortcut)

    // 添加到作用域组
    if (!this.scopes.has(scopeName)) {
      this.scopes.set(scopeName, {
        name: scopeName,
        shortcuts: new Map()
      })
    }

    const scope = this.scopes.get(scopeName)
    if (scope) {
      scope.shortcuts.set(key, shortcut)
    }
  }

  /**
   * 批量注册快捷键
   */
  registerBatch(shortcuts: Record<ShortcutKey, ShortcutHandler | [ShortcutHandler, ShortcutOptions]>): void {
    Object.entries(shortcuts).forEach(([key, value]) => {
      if (typeof value === 'function') {
        this.register(key, value)
      } else {
        const [handler, options] = value
        this.register(key, handler, options)
      }
    })
  }

  /**
   * 注册作用域快捷键
   */
  registerScope(scopeName: ShortcutScope, shortcuts: Record<ShortcutKey, ShortcutHandler>): void {
    Object.entries(shortcuts).forEach(([key, handler]) => {
      this.register(key, handler, { scope: scopeName })
    })
  }

  /**
   * 注销快捷键
   */
  unregister(key: ShortcutKey, scope: ShortcutScope = 'global'): boolean {
    const fullKey = `${scope}:${key}`
    const deleted = this.shortcuts.delete(fullKey)

    const scopeGroup = this.scopes.get(scope)
    if (scopeGroup) {
      scopeGroup.shortcuts.delete(key)
    }

    return deleted
  }

  /**
   * 清空作用域的所有快捷键
   */
  clearScope(scope: ShortcutScope): void {
    const scopeGroup = this.scopes.get(scope)
    if (scopeGroup) {
      scopeGroup.shortcuts.forEach(shortcut => {
        const fullKey = `${scope}:${shortcut.key}`
        this.shortcuts.delete(fullKey)
      })
      scopeGroup.shortcuts.clear()
    }
  }

  /**
   * 启用/禁用快捷键
   */
  setEnabled(key: ShortcutKey, enabled: boolean, scope: ShortcutScope = 'global'): void {
    const fullKey = `${scope}:${key}`
    const shortcut = this.shortcuts.get(fullKey)
    if (shortcut) {
      shortcut.options.enabled = enabled
    }
  }

  /**
   * 激活作用域
   */
  activateScope(scope: ShortcutScope): void {
    this.activeScopes.add(scope)
  }

  /**
   * 停用作用域
   */
  deactivateScope(scope: ShortcutScope): void {
    if (scope !== 'global') {
      this.activeScopes.delete(scope)
    }
  }

  /**
   * 设置独占作用域（只有该作用域生效）
   */
  setExclusiveScope(scope: ShortcutScope): void {
    this.activeScopes.clear()
    this.activeScopes.add(scope)
    if (scope !== 'global') {
      this.activeScopes.add('global') // 全局作用域始终保持
    }
  }

  /**
   * 重置作用域
   */
  resetScopes(): void {
    this.activeScopes.clear()
    this.activeScopes.add('global')
  }

  /**
   * 检查快捷键冲突
   */
  checkConflict(key: ShortcutKey, scope: ShortcutScope = 'global'): boolean {
    const fullKey = `${scope}:${key}`
    return this.shortcuts.has(fullKey)
  }

  /**
   * 获取所有冲突的快捷键
   */
  getConflicts(): Map<ShortcutKey, ShortcutScope[]> {
    const conflicts = new Map<ShortcutKey, ShortcutScope[]>()

    this.scopes.forEach((scopeGroup, scopeName) => {
      scopeGroup.shortcuts.forEach(shortcut => {
        if (!conflicts.has(shortcut.key)) {
          conflicts.set(shortcut.key, [])
        }
        const scopes = conflicts.get(shortcut.key)
        scopes?.push(scopeName)
      })
    })

    // 过滤出有冲突的（出现在多个作用域）
    const realConflicts = new Map<ShortcutKey, ShortcutScope[]>()
    conflicts.forEach((scopes, key) => {
      if (scopes.length > 1) {
        realConflicts.set(key, scopes)
      }
    })

    return realConflicts
  }

  /**
   * 处理按键事件
   */
  private handleKeyPress(event: KeyboardEvent): void {
    if (!this.enabled) return

    // 收集所有匹配的快捷键
    const matches: Shortcut[] = []

    this.activeScopes.forEach(scope => {
      this.shortcuts.forEach((shortcut, fullKey) => {
        if (!fullKey.startsWith(`${scope}:`)) return
        if (!shortcut.options.enabled) return
        if (!shortcut.options.allowInInput && isInInput(event)) return

        if (matchShortcut(event, shortcut.key)) {
          matches.push(shortcut)
        }
      })
    })

    // 按优先级排序
    matches.sort((a, b) => b.options.priority - a.options.priority)

    // 执行最高优先级的快捷键
    if (matches.length > 0) {
      const shortcut = matches[0]

      if (shortcut.options.preventDefault) {
        event.preventDefault()
      }

      if (shortcut.options.stopPropagation) {
        event.stopPropagation()
      }

      const result = shortcut.handler(event)

      // 如果处理器返回 false，继续传播事件
      if (result === false) {
        // 继续传播
      }
    }
  }

  /**
   * 设置冲突处理模式
   */
  setConflictMode(mode: 'error' | 'warn' | 'override'): void {
    this.conflictMode = mode
  }

  /**
   * 启用/禁用管理器
   */
  setManagerEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * 获取快捷键列表
   */
  getShortcuts(scope?: ShortcutScope): Shortcut[] {
    if (scope) {
      const scopeGroup = this.scopes.get(scope)
      return scopeGroup ? Array.from(scopeGroup.shortcuts.values()) : []
    }

    return Array.from(this.shortcuts.values())
  }

  /**
   * 获取快捷键描述（用于显示帮助）
   */
  getShortcutHelp(): Map<ShortcutScope, Array<{ key: string; description: string }>> {
    const help = new Map<ShortcutScope, Array<{ key: string; description: string }>>()

    this.scopes.forEach((scopeGroup, scopeName) => {
      const shortcuts: Array<{ key: string; description: string }> = []

      scopeGroup.shortcuts.forEach(shortcut => {
        if (shortcut.options.description) {
          shortcuts.push({
            key: shortcut.key,
            description: shortcut.options.description
          })
        }
      })

      if (shortcuts.length > 0) {
        help.set(scopeName, shortcuts)
      }
    })

    return help
  }

  /**
   * 导出配置
   */
  export(): {
    shortcuts: Array<{
      key: string
      scope: string
      description: string
      enabled: boolean
    }>
    activeScopes: string[]
  } {
    const shortcuts: Array<{
      key: string
      scope: string
      description: string
      enabled: boolean
    }> = []

    this.shortcuts.forEach((shortcut, fullKey) => {
      const [scope] = fullKey.split(':')
      shortcuts.push({
        key: shortcut.key,
        scope,
        description: shortcut.options.description,
        enabled: shortcut.options.enabled
      })
    })

    return {
      shortcuts,
      activeScopes: Array.from(this.activeScopes)
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.listener && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.listener)
    }

    this.shortcuts.clear()
    this.scopes.clear()
    this.activeScopes.clear()
  }
}
