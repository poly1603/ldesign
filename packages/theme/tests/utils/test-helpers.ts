/**
 * @ldesign/theme - 测试辅助工具
 *
 * 提供测试中常用的工具函数和模拟对象
 */

import type {
  AnimationConfig,
  DecorationConfig,
  ThemeConfig,
  ThemeManagerInstance,
} from '@/core/types'
import { vi } from 'vitest'
import { type App, createApp } from 'vue'

/**
 * 创建测试应用
 */
export function createTestApp(): App {
  return createApp({})
}

/**
 * 创建模拟主题管理器
 */
export function createMockThemeManager(): ThemeManagerInstance {
  const themes = new Map<string, ThemeConfig>()
  let currentTheme: string | undefined
  const decorations: DecorationConfig[] = []
  const eventListeners = new Map<string, Function[]>()

  return {
    async init() {
      // 模拟初始化
    },

    async setTheme(name: string) {
      if (!themes.has(name)) {
        throw new Error(`Theme "${name}" not found`)
      }
      currentTheme = name
      this.emit('theme-changed', { theme: name })
    },

    getTheme(name: string) {
      return themes.get(name)
    },

    getCurrentTheme() {
      return currentTheme
    },

    getAvailableThemes() {
      return Array.from(themes.keys())
    },

    addTheme(theme: ThemeConfig) {
      themes.set(theme.name, theme)
    },

    removeTheme(name: string) {
      themes.delete(name)
      if (currentTheme === name) {
        currentTheme = undefined
      }
    },

    addDecoration(decoration: DecorationConfig) {
      decorations.push(decoration)
    },

    removeDecoration(id: string) {
      const index = decorations.findIndex(d => d.id === id)
      if (index > -1) {
        decorations.splice(index, 1)
      }
    },

    updateDecoration(id: string, updates: Partial<DecorationConfig>) {
      const decoration = decorations.find(d => d.id === id)
      if (decoration) {
        Object.assign(decoration, updates)
      }
    },

    getDecorations() {
      return [...decorations]
    },

    startAnimation(name: string) {
      // 模拟开始动画
    },

    stopAnimation(name: string) {
      // 模拟停止动画
    },

    pauseAnimation(name: string) {
      // 模拟暂停动画
    },

    resumeAnimation(name: string) {
      // 模拟恢复动画
    },

    async preloadResources(theme: string) {
      // 模拟预加载资源
    },

    clearResources(theme?: string) {
      // 模拟清理资源
    },

    on(event: string, listener: Function) {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, [])
      }
      eventListeners.get(event)!.push(listener)
    },

    off(event: string, listener: Function) {
      const listeners = eventListeners.get(event)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    },

    emit(event: string, data: any) {
      const listeners = eventListeners.get(event)
      if (listeners) {
        listeners.forEach((listener) => {
          listener({
            type: event,
            timestamp: Date.now(),
            ...data,
          })
        })
      }
    },

    destroy() {
      themes.clear()
      decorations.length = 0
      eventListeners.clear()
      currentTheme = undefined
    },
  }
}

/**
 * 创建测试主题配置
 */
export function createTestThemeConfig(
  overrides: Partial<ThemeConfig> = {},
): ThemeConfig {
  return {
    name: 'test-theme',
    displayName: '测试主题',
    description: '用于测试的主题配置',
    category: 'custom',
    version: '1.0.0',
    author: 'Test',
    colors: {
      name: 'test-colors',
      displayName: '测试配色',
      light: {
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#28a745',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8',
      },
      dark: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        accent: '#198754',
        background: '#212529',
        surface: '#343a40',
        text: '#ffffff',
        textSecondary: '#adb5bd',
        border: '#495057',
        success: '#198754',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#0dcaf0',
      },
    },
    decorations: [],
    animations: [],
    resources: {
      images: {},
      icons: {},
    },
    tags: ['test'],
    ...overrides,
  }
}

/**
 * 创建测试装饰配置
 */
export function createTestDecorationConfig(
  overrides: Partial<DecorationConfig> = {},
): DecorationConfig {
  return {
    id: 'test-decoration',
    name: '测试装饰',
    type: 'icon',
    src: '/test-icon.svg',
    position: {
      type: 'fixed',
      position: { x: '10px', y: '10px' },
      anchor: 'top-left',
    },
    style: {
      size: { width: '20px', height: '20px' },
      opacity: 1,
      zIndex: 1000,
    },
    interactive: false,
    responsive: true,
    ...overrides,
  }
}

/**
 * 创建测试动画配置
 */
export function createTestAnimationConfig(
  overrides: Partial<AnimationConfig> = {},
): AnimationConfig {
  return {
    name: 'test-animation',
    type: 'css',
    duration: 1000,
    iterations: 1,
    keyframes: [
      {
        offset: 0,
        properties: { opacity: 0 },
      },
      {
        offset: 1,
        properties: { opacity: 1 },
      },
    ],
    ...overrides,
  }
}

/**
 * 模拟 DOM 元素
 */
export function createMockElement(
  tagName = 'div',
  attributes: Record<string, any> = {},
): HTMLElement {
  const element = document.createElement(tagName)
  Object.assign(element, attributes)
  return element
}

/**
 * 模拟 SVG 内容
 */
export function createMockSVG(content = ''): string {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${content}</svg>`
}

/**
 * 模拟网络请求
 */
export function mockFetch(responses: Record<string, any> = {}) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    const response = responses[url] || responses['*']

    if (response instanceof Error) {
      return Promise.reject(response)
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(response || ''),
      json: () => Promise.resolve(response || {}),
      blob: () => Promise.resolve(new Blob([response || ''])),
    })
  })
}

/**
 * 等待动画完成
 */
export function waitForAnimation(duration = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration))
}

/**
 * 等待下一个事件循环
 */
export function waitForNextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * 模拟用户交互
 */
export class MockUserInteraction {
  constructor(private element: HTMLElement) {}

  click() {
    const event = new MouseEvent('click', { bubbles: true })
    this.element.dispatchEvent(event)
    return this
  }

  hover() {
    const enterEvent = new MouseEvent('mouseenter', { bubbles: true })
    this.element.dispatchEvent(enterEvent)
    return this
  }

  leave() {
    const leaveEvent = new MouseEvent('mouseleave', { bubbles: true })
    this.element.dispatchEvent(leaveEvent)
    return this
  }

  focus() {
    const event = new FocusEvent('focus', { bubbles: true })
    this.element.dispatchEvent(event)
    return this
  }

  blur() {
    const event = new FocusEvent('blur', { bubbles: true })
    this.element.dispatchEvent(event)
    return this
  }

  keydown(key: string) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true })
    this.element.dispatchEvent(event)
    return this
  }

  keyup(key: string) {
    const event = new KeyboardEvent('keyup', { key, bubbles: true })
    this.element.dispatchEvent(event)
    return this
  }
}

/**
 * 创建用户交互模拟器
 */
export function createUserInteraction(
  element: HTMLElement,
): MockUserInteraction {
  return new MockUserInteraction(element)
}

/**
 * 测试性能监控
 */
export class PerformanceMonitor {
  private startTime: number = 0
  private marks: Map<string, number> = new Map()

  start() {
    this.startTime = performance.now()
    return this
  }

  mark(name: string) {
    this.marks.set(name, performance.now())
    return this
  }

  measure(name: string): number {
    const markTime = this.marks.get(name)
    if (!markTime) {
      throw new Error(`Mark "${name}" not found`)
    }
    return markTime - this.startTime
  }

  end(): number {
    return performance.now() - this.startTime
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(): PerformanceMonitor {
  return new PerformanceMonitor()
}

/**
 * 清理测试环境
 */
export function cleanupTestEnvironment() {
  // 清理 DOM
  document.body.innerHTML = ''

  // 清理定时器
  vi.clearAllTimers()

  // 清理模拟
  vi.clearAllMocks()

  // 重置 fetch
  if (global.fetch && vi.isMockFunction(global.fetch)) {
    global.fetch.mockReset()
  }
}
