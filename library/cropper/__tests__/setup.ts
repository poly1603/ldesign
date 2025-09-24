/**
 * @file 测试环境设置
 * @description 配置测试环境，包括全局变量、模拟对象等
 */

import { vi } from 'vitest'
import '@testing-library/jest-dom'

// 模拟 Canvas API
class MockCanvas {
  width = 0
  height = 0

  getContext() {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      rect: vi.fn(),
      ellipse: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      clip: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      setLineDash: vi.fn(),
      getLineDash: vi.fn(() => []),
      lineDashOffset: 0,
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      globalCompositeOperation: 'source-over',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      canvas: this,
    }
  }

  toDataURL() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }

  toBlob(callback: (blob: Blob | null) => void) {
    callback(new Blob([''], { type: 'image/png' }))
  }
}

// 模拟 HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function () {
    return new MockCanvas().getContext()
  },
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: function () {
    return new MockCanvas().toDataURL()
  },
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback: (blob: Blob | null) => void) {
    return new MockCanvas().toBlob(callback)
  },
})

// 模拟 Image 对象
class MockImage {
  src = ''
  width = 100
  height = 100
  naturalWidth = 100
  naturalHeight = 100
  crossOrigin: string | null = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor() {
    // 模拟异步加载
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
}

// 替换全局 Image 构造函数
global.Image = MockImage as any

// 模拟 getBoundingClientRect
const mockGetBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  top: 0,
  right: 800,
  bottom: 600,
  left: 0,
  toJSON: vi.fn(),
}))

HTMLCanvasElement.prototype.getBoundingClientRect = mockGetBoundingClientRect
HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect
Element.prototype.getBoundingClientRect = mockGetBoundingClientRect

// 模拟 addEventListener 和 removeEventListener
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

HTMLCanvasElement.prototype.addEventListener = mockAddEventListener
HTMLCanvasElement.prototype.removeEventListener = mockRemoveEventListener
HTMLElement.prototype.addEventListener = mockAddEventListener
HTMLElement.prototype.removeEventListener = mockRemoveEventListener
Element.prototype.addEventListener = mockAddEventListener
Element.prototype.removeEventListener = mockRemoveEventListener

// 模拟其他常用的DOM方法
HTMLElement.prototype.appendChild = vi.fn()
HTMLElement.prototype.removeChild = vi.fn()
HTMLElement.prototype.querySelector = vi.fn()
HTMLElement.prototype.querySelectorAll = vi.fn(() => [])
Element.prototype.appendChild = vi.fn()
Element.prototype.removeChild = vi.fn()
Element.prototype.querySelector = vi.fn()
Element.prototype.querySelectorAll = vi.fn(() => [])

// 模拟 Canvas 2D Context
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(800 * 600 * 4),
        width: 800,
        height: 600
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(800 * 600 * 4),
        width: 800,
        height: 600
      })),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      strokeStyle: '#000000',
      fillStyle: '#000000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      lineDashOffset: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      direction: 'inherit',
      imageSmoothingEnabled: true,
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn(),
      isPointInPath: vi.fn(() => false),
      isPointInStroke: vi.fn(() => false),
      measureText: vi.fn(() => ({ width: 0 })),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      createLinearGradient: vi.fn(),
      createRadialGradient: vi.fn(),
      createPattern: vi.fn(),
      getLineDash: vi.fn(() => []),
      setLineDash: vi.fn(),
      canvas: null as any
    }
  }
  return null
})

// 模拟 FileReader
class MockFileReader {
  result: string | ArrayBuffer | null = null
  onload: ((event: any) => void) | null = null
  onerror: (() => void) | null = null

  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      if (this.onload) {
        this.onload({ target: this })
      }
    }, 0)
  }

  readAsArrayBuffer(file: File) {
    setTimeout(() => {
      this.result = new ArrayBuffer(8)
      if (this.onload) {
        this.onload({ target: this })
      }
    }, 0)
  }
}

global.FileReader = MockFileReader as any

// 模拟 URL.createObjectURL 和 URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// 模拟 requestAnimationFrame 和 cancelAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16) // 模拟 60fps
})

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id)
})

// 模拟 ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.ResizeObserver = MockResizeObserver

// 模拟 IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.IntersectionObserver = MockIntersectionObserver

// 模拟 performance.now
Object.defineProperty(global.performance, 'now', {
  value: vi.fn(() => Date.now()),
})

// 模拟 performance.memory（如果存在）
Object.defineProperty(global.performance, 'memory', {
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
  configurable: true,
})

// 模拟触摸事件
class MockTouchEvent extends Event {
  touches: Touch[]
  changedTouches: Touch[]
  targetTouches: Touch[]

  constructor(type: string, options: any = {}) {
    super(type, options)
    this.touches = options.touches || []
    this.changedTouches = options.changedTouches || []
    this.targetTouches = options.targetTouches || []
  }
}

global.TouchEvent = MockTouchEvent as any

// 模拟 Touch 对象
class MockTouch {
  identifier: number
  target: EventTarget
  clientX: number
  clientY: number
  pageX: number
  pageY: number
  screenX: number
  screenY: number

  constructor(options: any = {}) {
    this.identifier = options.identifier || 0
    this.target = options.target || document.body
    this.clientX = options.clientX || 0
    this.clientY = options.clientY || 0
    this.pageX = options.pageX || 0
    this.pageY = options.pageY || 0
    this.screenX = options.screenX || 0
    this.screenY = options.screenY || 0
  }
}

global.Touch = MockTouch as any

// 模拟 navigator.maxTouchPoints
Object.defineProperty(navigator, 'maxTouchPoints', {
  value: 1,
  configurable: true,
})

// 模拟 window.ontouchstart
Object.defineProperty(window, 'ontouchstart', {
  value: null,
  configurable: true,
})

// 模拟 CSS 变量支持
const originalGetComputedStyle = window.getComputedStyle
window.getComputedStyle = vi.fn((element) => {
  const style = originalGetComputedStyle(element)
  return {
    ...style,
    getPropertyValue: vi.fn((property) => {
      // 模拟 CSS 变量值
      if (property.startsWith('--ldesign-')) {
        switch (property) {
          case '--ldesign-brand-color':
            return '#722ED1'
          case '--ldesign-bg-color-component':
            return '#ffffff'
          case '--ldesign-border-color':
            return '#d9d9d9'
          case '--ldesign-text-color-primary':
            return 'rgba(0, 0, 0, 0.9)'
          default:
            return ''
        }
      }
      return style.getPropertyValue(property)
    }),
  }
})

// 模拟 console 方法（在测试中可能需要）
const originalConsole = { ...console }
global.console = {
  ...originalConsole,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}

// 测试完成后恢复 console
afterAll(() => {
  global.console = originalConsole
})

// 每个测试前清理模拟
beforeEach(() => {
  vi.clearAllMocks()
})

// 导出测试工具函数
export const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024): File => {
  const blob = new Blob([''], { type })
  return new File([blob], name, { type, lastModified: Date.now() })
}

export const createMockImage = (width = 100, height = 100): HTMLImageElement => {
  const img = new Image()
  img.width = width
  img.height = height
  img.naturalWidth = width
  img.naturalHeight = height
  return img
}

export const createMockCanvas = (width = 100, height = 100): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export const createMockMouseEvent = (type: string, options: any = {}): MouseEvent => {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: 0,
    clientY: 0,
    ...options,
  })
}

export const createMockTouchEvent = (type: string, options: any = {}): TouchEvent => {
  const touch = new MockTouch(options.touch || {})
  return new MockTouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: [touch],
    changedTouches: [touch],
    targetTouches: [touch],
    ...options,
  })
}
