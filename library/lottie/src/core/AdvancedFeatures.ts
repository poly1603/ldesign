/**
 * 高级功能集合
 * 包含音效同步、过渡效果、主题系统、数据绑定、无障碍支持等
 */

import type { ILottieInstance } from '../types'

// 导出新增的高级功能类
export { AudioSync } from './AudioSync'
export type { AudioSyncConfig, AudioMarker } from './AudioSync'

export { TransitionManager } from './TransitionManager'
export type { TransitionConfig, TransitionType, TransitionDirection, EasingFunction } from './TransitionManager'

export { ThemeManager } from './ThemeManager'
export type { ThemeConfig, ColorMap, ColorReplaceOptions } from './ThemeManager'

export { DataBinding } from './DataBinding'
export type { DataBindingConfig } from './DataBinding'

export { AccessibilityManager } from './AccessibilityManager'
export type { AccessibilityConfig } from './AccessibilityManager'

export { PreloadQueue } from './PreloadQueue'
export type { PreloadItem, PreloadProgress, PreloadOptions } from './PreloadQueue'

export { GestureController } from './GestureController'
export type { GestureConfig, GestureType, GestureEvent } from './GestureController'

// ==================== 音效同步 ====================

export interface AudioSyncConfig {
  audio: HTMLAudioElement | string
  syncMode?: 'time' | 'frame'
  offset?: number
}

export class AudioSync {
  private instance: ILottieInstance
  private audio: HTMLAudioElement
  private syncMode: 'time' | 'frame'
  private offset: number
  private rafId: number | null = null
  private isActive = false

  constructor(instance: ILottieInstance, config: AudioSyncConfig) {
    this.instance = instance
    this.syncMode = config.syncMode ?? 'time'
    this.offset = config.offset ?? 0

    if (typeof config.audio === 'string') {
      this.audio = new Audio(config.audio)
    } else {
      this.audio = config.audio
    }

    this.setupListeners()
  }

  private setupListeners(): void {
    this.audio.addEventListener('play', () => this.start())
    this.audio.addEventListener('pause', () => this.pause())
    this.audio.addEventListener('ended', () => this.stop())
    this.audio.addEventListener('seeked', () => this.sync())
  }

  start(): void {
    this.isActive = true
    this.instance.play()
    this.syncLoop()
  }

  pause(): void {
    this.isActive = false
    this.instance.pause()
    if (this.rafId) cancelAnimationFrame(this.rafId)
  }

  stop(): void {
    this.isActive = false
    this.instance.stop()
    this.audio.currentTime = 0
    if (this.rafId) cancelAnimationFrame(this.rafId)
  }

  sync(): void {
    const audioTime = this.audio.currentTime + this.offset
    if (this.syncMode === 'time') {
      const frame = (audioTime / this.audio.duration) * this.instance.totalFrames
      this.instance.goToAndStop(Math.floor(frame), true)
    }
  }

  private syncLoop(): void {
    if (!this.isActive) return
    this.sync()
    this.rafId = requestAnimationFrame(() => this.syncLoop())
  }

  destroy(): void {
    this.stop()
    this.audio.remove()
  }
}

// ==================== 过渡效果 ====================

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'flip' | 'none'

export interface TransitionConfig {
  type: TransitionType
  duration?: number
  easing?: string
  direction?: 'in' | 'out'
}

export class TransitionManager {
  private instance: ILottieInstance
  private container: HTMLElement
  
  constructor(instance: ILottieInstance) {
    this.instance = instance
    this.container = this.getContainer()
  }

  private getContainer(): HTMLElement {
    const container = this.instance.config.container
    if (typeof container === 'string') {
      return document.querySelector(container) as HTMLElement
    }
    return container as HTMLElement
  }

  async transitionIn(config: TransitionConfig): Promise<void> {
    const duration = config.duration ?? 500
    const easing = config.easing ?? 'ease-out'

    this.container.style.transition = `all ${duration}ms ${easing}`
    
    switch (config.type) {
      case 'fade':
        this.container.style.opacity = '0'
        await this.nextFrame()
        this.container.style.opacity = '1'
        break
      
      case 'slide':
        this.container.style.transform = 'translateY(100%)'
        await this.nextFrame()
        this.container.style.transform = 'translateY(0)'
        break
      
      case 'zoom':
        this.container.style.transform = 'scale(0)'
        await this.nextFrame()
        this.container.style.transform = 'scale(1)'
        break
      
      case 'flip':
        this.container.style.transform = 'rotateY(90deg)'
        await this.nextFrame()
        this.container.style.transform = 'rotateY(0deg)'
        break
    }

    await this.wait(duration)
    this.container.style.transition = ''
  }

  async transitionOut(config: TransitionConfig): Promise<void> {
    const duration = config.duration ?? 500
    const easing = config.easing ?? 'ease-in'

    this.container.style.transition = `all ${duration}ms ${easing}`
    
    switch (config.type) {
      case 'fade':
        this.container.style.opacity = '0'
        break
      
      case 'slide':
        this.container.style.transform = 'translateY(-100%)'
        break
      
      case 'zoom':
        this.container.style.transform = 'scale(0)'
        break
      
      case 'flip':
        this.container.style.transform = 'rotateY(90deg)'
        break
    }

    await this.wait(duration)
    this.container.style.transition = ''
  }

  async crossfade(newInstance: ILottieInstance, duration = 500): Promise<void> {
    await Promise.all([
      this.transitionOut({ type: 'fade', duration: duration / 2 }),
      new TransitionManager(newInstance).transitionIn({ type: 'fade', duration: duration / 2 })
    ])
  }

  private nextFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// ==================== 主题系统 ====================

export interface ThemeColors {
  [key: string]: string | ThemeColors
}

export interface Theme {
  name: string
  colors: ThemeColors
}

export class ThemeManager {
  private instance: ILottieInstance
  private currentTheme: Theme | null = null
  private colorMappings = new Map<string, string>()

  constructor(instance: ILottieInstance) {
    this.instance = instance
  }

  /**
   * 应用主题
   */
  applyTheme(theme: Theme): void {
    this.currentTheme = theme
    this.colorMappings.clear()
    this.flattenColors(theme.colors, '')
    this.updateColors()
  }

  /**
   * 扁平化颜色对象
   */
  private flattenColors(colors: ThemeColors, prefix: string): void {
    Object.entries(colors).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'string') {
        this.colorMappings.set(path, value)
      } else {
        this.flattenColors(value, path)
      }
    })
  }

  /**
   * 更新动画颜色
   */
  private updateColors(): void {
    const animData = (this.instance.animation as any)?.animationData
    if (!animData) return

    this.traverseAndUpdate(animData)
    this.instance.animation?.renderer.renderFrame(this.instance.currentFrame)
  }

  /**
   * 遍历并更新颜色
   */
  private traverseAndUpdate(obj: any): void {
    if (!obj || typeof obj !== 'object') return

    if (Array.isArray(obj)) {
      obj.forEach(item => this.traverseAndUpdate(item))
      return
    }

    // 查找颜色属性
    if (obj.c && Array.isArray(obj.c.k)) {
      const oldColor = this.rgbToHex(obj.c.k)
      const newColor = this.findColorMapping(oldColor)
      if (newColor) {
        obj.c.k = this.hexToRgb(newColor)
      }
    }

    // 递归处理所有属性
    Object.values(obj).forEach(value => this.traverseAndUpdate(value))
  }

  /**
   * RGB 转 HEX
   */
  private rgbToHex(rgb: number[]): string {
    const r = Math.round(rgb[0] * 255).toString(16).padStart(2, '0')
    const g = Math.round(rgb[1] * 255).toString(16).padStart(2, '0')
    const b = Math.round(rgb[2] * 255).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }

  /**
   * HEX 转 RGB
   */
  private hexToRgb(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return [0, 0, 0, 1]
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
      1
    ]
  }

  /**
   * 查找颜色映射
   */
  private findColorMapping(color: string): string | null {
    for (const [key, value] of this.colorMappings) {
      if (color.toLowerCase() === key.toLowerCase()) {
        return value
      }
    }
    return null
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme | null {
    return this.currentTheme
  }

  /**
   * 切换主题
   */
  async switchTheme(newTheme: Theme, transition = true): Promise<void> {
    if (transition) {
      const transitionMgr = new TransitionManager(this.instance)
      await transitionMgr.transitionOut({ type: 'fade', duration: 300 })
      this.applyTheme(newTheme)
      await transitionMgr.transitionIn({ type: 'fade', duration: 300 })
    } else {
      this.applyTheme(newTheme)
    }
  }
}

// 预定义主题
export const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#ffffff',
      text: '#333333'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      background: '#1a1a1a',
      text: '#f5f5f5'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#ff6b6b',
      secondary: '#feca57',
      background: '#48566b',
      text: '#ffffff'
    }
  }
}
