/**
 * 测试环境设置
 * 为测试环境提供必要的polyfill和mock
 */

import { vi, beforeEach } from 'vitest'

// ===== DOM API Polyfills =====

// 增强 JSDOM 的 Element 原型，确保所有 DOM 方法都可用
if (typeof window !== 'undefined' && window.document) {
  // 确保 Element.prototype 有 setAttribute 方法
  if (!Element.prototype.setAttribute) {
    Element.prototype.setAttribute = function(name: string, value: string) {
      // @ts-ignore
      this[name] = value
    }
  }

  // 确保 Element.prototype 有 getAttribute 方法
  if (!Element.prototype.getAttribute) {
    Element.prototype.getAttribute = function(name: string) {
      // @ts-ignore
      return this[name] || null
    }
  }

  // 确保 Element.prototype 有 remove 方法
  if (!Element.prototype.remove) {
    Element.prototype.remove = function() {
      if (this.parentNode) {
        this.parentNode.removeChild(this)
      }
    }
  }

  // 确保 Element.prototype 有 insertBefore 方法
  if (!Element.prototype.insertBefore) {
    Element.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
      // 确保childNodes数组存在
      if (!this.childNodes) {
        // @ts-ignore
        this.childNodes = []
      }

      // 确保children数组存在
      if (!this.children) {
        // @ts-ignore
        this.children = []
      }

      if (referenceNode && this.childNodes) {
        // 查找参考节点的位置
        const index = Array.from(this.childNodes).indexOf(referenceNode as ChildNode)
        if (index !== -1) {
          // 在指定位置插入
          // @ts-ignore
          this.childNodes.splice(index, 0, newNode)
          if (newNode.nodeType === 1) { // Element node
            // @ts-ignore
            this.children.splice(index, 0, newNode)
          }
        } else {
          // 如果找不到参考节点，追加到末尾
          // @ts-ignore
          this.childNodes.push(newNode)
          if (newNode.nodeType === 1) {
            // @ts-ignore
            this.children.push(newNode)
          }
        }
      } else {
        // 如果没有参考节点，追加到末尾
        // @ts-ignore
        this.childNodes.push(newNode)
        if (newNode.nodeType === 1) {
          // @ts-ignore
          this.children.push(newNode)
        }
      }

      // 设置父节点关系
      // @ts-ignore
      newNode.parentNode = this
      return newNode
    }
  }
}

// ===== Browser API Polyfills =====

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn().mockReturnValue(''),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// ===== Console 优化 =====

// 过滤掉一些测试中的噪音日志
const originalConsoleWarn = console.warn
console.warn = (...args: any[]) => {
  // 过滤掉一些已知的无害警告
  const message = args[0]
  if (typeof message === 'string') {
    // 过滤 Vue 测试相关的警告
    if (message.includes('[Vue warn]') && message.includes('Failed to resolve component')) {
      return
    }
    // 过滤 JSDOM 相关的警告
    if (message.includes('Not implemented')) {
      return
    }
  }
  originalConsoleWarn.apply(console, args)
}

// 确保document.body和document.head有insertBefore方法
if (document.body && !document.body.insertBefore) {
  document.body.insertBefore = Element.prototype.insertBefore
}
if (document.head && !document.head.insertBefore) {
  document.head.insertBefore = Element.prototype.insertBefore
}

// 为所有可能的DOM节点类型添加insertBefore方法
const addInsertBeforeToPrototype = (prototype: any) => {
  if (prototype && !prototype.insertBefore) {
    prototype.insertBefore = Element.prototype.insertBefore
  }
}

// 添加到各种DOM节点原型
if (typeof Node !== 'undefined') {
  addInsertBeforeToPrototype(Node.prototype)
}
if (typeof HTMLElement !== 'undefined') {
  addInsertBeforeToPrototype(HTMLElement.prototype)
}
if (typeof HTMLDivElement !== 'undefined') {
  addInsertBeforeToPrototype(HTMLDivElement.prototype)
}
if (typeof HTMLSpanElement !== 'undefined') {
  addInsertBeforeToPrototype(HTMLSpanElement.prototype)
}
if (typeof HTMLButtonElement !== 'undefined') {
  addInsertBeforeToPrototype(HTMLButtonElement.prototype)
}

// ===== 测试工具函数 =====

/**
 * 创建一个完整的 DOM 元素 mock
 */
export function createMockElement(tagName: string = 'div'): HTMLElement {
  const element = document.createElement(tagName)

  // 确保所有必要的方法都存在
  if (!element.setAttribute) {
    element.setAttribute = vi.fn()
  }
  if (!element.getAttribute) {
    element.getAttribute = vi.fn()
  }
  if (!element.remove) {
    element.remove = vi.fn()
  }

  // 确保DOM结构属性存在
  if (!element.childNodes) {
    // @ts-ignore
    element.childNodes = []
  }
  if (!element.children) {
    // @ts-ignore
    element.children = []
  }
  if (!element.nodeType) {
    // @ts-ignore
    element.nodeType = 1 // Element node
  }

  // 确保insertBefore方法存在
  if (!element.insertBefore) {
    element.insertBefore = Element.prototype.insertBefore
  }

  return element
}

/**
 * 创建一个 mock 的 MediaQueryList
 */
export function createMockMediaQueryList(matches: boolean = false): MediaQueryList {
  return {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList
}

/**
 * 设置 matchMedia 的返回值
 */
export function setMatchMedia(matches: boolean = false) {
  window.matchMedia = vi.fn().mockImplementation(() => createMockMediaQueryList(matches))
}

// ===== 全局测试状态重置 =====

// 在每个测试前重置全局状态
beforeEach(() => {
  // 清理 DOM（安全检查）
  try {
    if (document.head) {
      document.head.innerHTML = ''
    }
    if (document.body) {
      document.body.innerHTML = ''
    }
  } catch (error) {
    // 在某些测试环境中可能无法设置innerHTML，忽略错误
    console.warn('[Test Setup] Failed to clear DOM:', error)
  }

  // 重置 matchMedia
  setMatchMedia(false)

  // 清理所有 mock
  vi.clearAllMocks()
})
