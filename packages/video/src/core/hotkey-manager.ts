/**
 * 快捷键管理器
 * 负责键盘快捷键的注册、处理和管理
 */

import { EventEmitter } from '../utils/events'
import type { IVideoPlayer } from '../types/player'

/**
 * 快捷键绑定配置
 */
export interface HotkeyBinding {
  /** 快捷键组合 */
  keys: string | string[]
  /** 快捷键描述 */
  description: string
  /** 快捷键处理函数 */
  handler: (event: KeyboardEvent, player: IVideoPlayer) => void | Promise<void>
  /** 是否需要阻止默认行为 */
  preventDefault?: boolean
  /** 是否需要阻止事件冒泡 */
  stopPropagation?: boolean
  /** 是否启用 */
  enabled?: boolean
  /** 修饰键要求 */
  modifiers?: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  }
}

/**
 * 快捷键配置
 */
export interface HotkeyConfig {
  /** 是否启用快捷键 */
  enabled?: boolean
  /** 是否启用全局快捷键 */
  global?: boolean
  /** 快捷键绑定 */
  bindings?: Record<string, HotkeyBinding>
  /** 是否在输入框中禁用快捷键 */
  disableInInput?: boolean
}

/**
 * 快捷键管理器实现
 */
export class HotkeyManager extends EventEmitter {
  private _player: IVideoPlayer
  private _config: HotkeyConfig
  private _bindings = new Map<string, HotkeyBinding>()
  private _keydownHandler?: (event: KeyboardEvent) => void
  private _enabled = true

  constructor(player: IVideoPlayer, config: HotkeyConfig = {}) {
    super()
    
    this._player = player
    this._config = {
      enabled: true,
      global: false,
      disableInInput: true,
      ...config
    }

    this.setupDefaultBindings()
    this.bindEvents()
  }

  /**
   * 快捷键配置
   */
  get config(): HotkeyConfig {
    return { ...this._config }
  }

  /**
   * 是否启用
   */
  get enabled(): boolean {
    return this._enabled
  }

  /**
   * 所有快捷键绑定
   */
  get bindings(): Map<string, HotkeyBinding> {
    return new Map(this._bindings)
  }

  /**
   * 注册快捷键
   */
  register(key: string, binding: HotkeyBinding): void {
    // 标准化快捷键
    const normalizedKey = this.normalizeKey(key)
    
    // 如果快捷键已存在，先移除
    if (this._bindings.has(normalizedKey)) {
      this.unregister(normalizedKey)
    }

    // 注册新的快捷键
    this._bindings.set(normalizedKey, {
      preventDefault: true,
      stopPropagation: true,
      enabled: true,
      ...binding
    })

    this.emit('registered', { key: normalizedKey, binding })
  }

  /**
   * 批量注册快捷键
   */
  registerMultiple(bindings: Record<string, HotkeyBinding>): void {
    Object.entries(bindings).forEach(([key, binding]) => {
      this.register(key, binding)
    })
  }

  /**
   * 移除快捷键
   */
  unregister(key: string): void {
    const normalizedKey = this.normalizeKey(key)
    const binding = this._bindings.get(normalizedKey)
    
    if (binding) {
      this._bindings.delete(normalizedKey)
      this.emit('unregistered', { key: normalizedKey, binding })
    }
  }

  /**
   * 启用快捷键
   */
  enable(key?: string): void {
    if (key) {
      const normalizedKey = this.normalizeKey(key)
      const binding = this._bindings.get(normalizedKey)
      if (binding) {
        binding.enabled = true
        this.emit('enabled', { key: normalizedKey })
      }
    } else {
      this._enabled = true
      this.emit('enabled', { global: true })
    }
  }

  /**
   * 禁用快捷键
   */
  disable(key?: string): void {
    if (key) {
      const normalizedKey = this.normalizeKey(key)
      const binding = this._bindings.get(normalizedKey)
      if (binding) {
        binding.enabled = false
        this.emit('disabled', { key: normalizedKey })
      }
    } else {
      this._enabled = false
      this.emit('disabled', { global: true })
    }
  }

  /**
   * 切换快捷键状态
   */
  toggle(key?: string): void {
    if (key) {
      const normalizedKey = this.normalizeKey(key)
      const binding = this._bindings.get(normalizedKey)
      if (binding) {
        if (binding.enabled) {
          this.disable(key)
        } else {
          this.enable(key)
        }
      }
    } else {
      if (this._enabled) {
        this.disable()
      } else {
        this.enable()
      }
    }
  }

  /**
   * 获取快捷键绑定
   */
  getBinding(key: string): HotkeyBinding | undefined {
    const normalizedKey = this.normalizeKey(key)
    return this._bindings.get(normalizedKey)
  }

  /**
   * 获取所有快捷键列表
   */
  getHotkeyList(): Array<{ key: string; binding: HotkeyBinding }> {
    return Array.from(this._bindings.entries()).map(([key, binding]) => ({
      key,
      binding
    }))
  }

  /**
   * 销毁快捷键管理器
   */
  destroy(): void {
    this.unbindEvents()
    this._bindings.clear()
    this.removeAllListeners()
  }

  /**
   * 设置默认快捷键绑定
   */
  private setupDefaultBindings(): void {
    const defaultBindings: Record<string, HotkeyBinding> = {
      'Space': {
        keys: 'Space',
        description: '播放/暂停',
        handler: () => this._player.toggle()
      },
      'ArrowLeft': {
        keys: 'ArrowLeft',
        description: '快退10秒',
        handler: () => {
          const currentTime = this._player.status.currentTime
          this._player.seek(Math.max(0, currentTime - 10))
        }
      },
      'ArrowRight': {
        keys: 'ArrowRight',
        description: '快进10秒',
        handler: () => {
          const currentTime = this._player.status.currentTime
          const duration = this._player.status.duration
          this._player.seek(Math.min(duration, currentTime + 10))
        }
      },
      'ArrowUp': {
        keys: 'ArrowUp',
        description: '音量增加',
        handler: () => {
          const volume = this._player.status.volume
          this._player.setVolume(Math.min(1, volume + 0.1))
        }
      },
      'ArrowDown': {
        keys: 'ArrowDown',
        description: '音量减少',
        handler: () => {
          const volume = this._player.status.volume
          this._player.setVolume(Math.max(0, volume - 0.1))
        }
      },
      'KeyM': {
        keys: 'KeyM',
        description: '静音切换',
        handler: () => {
          const muted = this._player.status.muted
          this._player.videoElement.muted = !muted
        }
      },
      'KeyF': {
        keys: 'KeyF',
        description: '全屏切换',
        handler: () => this._player.toggleFullscreen()
      },
      'Escape': {
        keys: 'Escape',
        description: '退出全屏',
        handler: () => {
          if (this._player.status.fullscreen) {
            this._player.toggleFullscreen()
          }
        }
      },
      'Digit1': {
        keys: 'Digit1',
        description: '1倍速播放',
        handler: () => this._player.setPlaybackRate(1)
      },
      'Digit2': {
        keys: 'Digit2',
        description: '2倍速播放',
        handler: () => this._player.setPlaybackRate(2)
      },
      'Digit0': {
        keys: 'Digit0',
        description: '跳转到开始',
        handler: () => this._player.seek(0)
      }
    }

    // 注册默认快捷键
    if (this._config.bindings) {
      this.registerMultiple({ ...defaultBindings, ...this._config.bindings })
    } else {
      this.registerMultiple(defaultBindings)
    }
  }

  /**
   * 绑定键盘事件
   */
  private bindEvents(): void {
    this._keydownHandler = (event: KeyboardEvent) => {
      this.handleKeydown(event)
    }

    const target = this._config.global ? document : this._player.container
    target.addEventListener('keydown', this._keydownHandler)
  }

  /**
   * 解绑键盘事件
   */
  private unbindEvents(): void {
    if (this._keydownHandler) {
      const target = this._config.global ? document : this._player.container
      target.removeEventListener('keydown', this._keydownHandler)
      this._keydownHandler = undefined
    }
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeydown(event: KeyboardEvent): void {
    // 检查是否启用
    if (!this._enabled || !this._config.enabled) {
      return
    }

    // 检查是否在输入框中
    if (this._config.disableInInput && this.isInputElement(event.target as Element)) {
      return
    }

    // 生成快捷键字符串
    const keyString = this.generateKeyString(event)
    
    // 查找匹配的快捷键绑定
    const binding = this._bindings.get(keyString)
    
    if (binding && binding.enabled) {
      // 检查修饰键
      if (this.checkModifiers(event, binding.modifiers)) {
        // 阻止默认行为
        if (binding.preventDefault) {
          event.preventDefault()
        }
        
        // 阻止事件冒泡
        if (binding.stopPropagation) {
          event.stopPropagation()
        }

        // 执行处理函数
        try {
          const result = binding.handler(event, this._player)
          if (result instanceof Promise) {
            result.catch(error => {
              this.emit('error', { key: keyString, error })
            })
          }
          
          this.emit('triggered', { key: keyString, binding, event })
        } catch (error) {
          this.emit('error', { key: keyString, error })
        }
      }
    }
  }

  /**
   * 标准化快捷键字符串
   */
  private normalizeKey(key: string): string {
    return key.trim()
  }

  /**
   * 生成快捷键字符串
   */
  private generateKeyString(event: KeyboardEvent): string {
    const parts: string[] = []
    
    if (event.ctrlKey) parts.push('Ctrl')
    if (event.altKey) parts.push('Alt')
    if (event.shiftKey) parts.push('Shift')
    if (event.metaKey) parts.push('Meta')
    
    parts.push(event.code)
    
    return parts.join('+')
  }

  /**
   * 检查修饰键
   */
  private checkModifiers(event: KeyboardEvent, modifiers?: HotkeyBinding['modifiers']): boolean {
    if (!modifiers) return true

    return (
      (modifiers.ctrl === undefined || modifiers.ctrl === event.ctrlKey) &&
      (modifiers.alt === undefined || modifiers.alt === event.altKey) &&
      (modifiers.shift === undefined || modifiers.shift === event.shiftKey) &&
      (modifiers.meta === undefined || modifiers.meta === event.metaKey)
    )
  }

  /**
   * 检查是否为输入元素
   */
  private isInputElement(element: Element): boolean {
    if (!element) return false

    const tagName = element.tagName.toLowerCase()
    const inputTypes = ['input', 'textarea', 'select']
    
    if (inputTypes.includes(tagName)) {
      return true
    }

    // 检查是否为可编辑元素
    if (element.getAttribute('contenteditable') === 'true') {
      return true
    }

    return false
  }
}
