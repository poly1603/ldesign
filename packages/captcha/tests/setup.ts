/**
 * Vitest 测试环境设置
 */

import { vi } from 'vitest'

// Mock Canvas API
class MockCanvasRenderingContext2D {
  fillStyle = '#000000'
  strokeStyle = '#000000'
  lineWidth = 1
  font = '10px sans-serif'
  textAlign = 'start'
  textBaseline = 'alphabetic'
  globalAlpha = 1
  globalCompositeOperation = 'source-over'

  beginPath = vi.fn()
  closePath = vi.fn()
  moveTo = vi.fn()
  lineTo = vi.fn()
  arc = vi.fn()
  rect = vi.fn()
  fill = vi.fn()
  stroke = vi.fn()
  clearRect = vi.fn()
  fillRect = vi.fn()
  strokeRect = vi.fn()
  fillText = vi.fn()
  strokeText = vi.fn()
  measureText = vi.fn(() => ({ width: 100 }))
  drawImage = vi.fn()
  createImageData = vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }))
  getImageData = vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }))
  putImageData = vi.fn()
  save = vi.fn()
  restore = vi.fn()
  scale = vi.fn()
  rotate = vi.fn()
  translate = vi.fn()
  transform = vi.fn()
  setTransform = vi.fn()
  resetTransform = vi.fn()
  clip = vi.fn()
  createLinearGradient = vi.fn(() => ({
    addColorStop: vi.fn()
  }))
  createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn()
  }))
  createPattern = vi.fn()
  isPointInPath = vi.fn(() => false)
  isPointInStroke = vi.fn(() => false)
}

class MockHTMLCanvasElement {
  width = 300
  height = 150
  style = {}
  
  getContext = vi.fn((type: string) => {
    if (type === '2d') {
      return new MockCanvasRenderingContext2D()
    }
    return null
  })
  
  toDataURL = vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
  toBlob = vi.fn((callback: (blob: Blob) => void) => {
    callback(new Blob([''], { type: 'image/png' }))
  })
  
  getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    width: this.width,
    height: this.height,
    top: 0,
    right: this.width,
    bottom: this.height,
    left: 0,
    toJSON: () => ({})
  }))
  
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  dispatchEvent = vi.fn()
}

// Mock HTMLImageElement
class MockHTMLImageElement {
  src = ''
  width = 0
  height = 0
  naturalWidth = 0
  naturalHeight = 0
  complete = false
  
  onload: ((this: GlobalEventHandlers, ev: Event) => any) | null = null
  onerror: ((this: GlobalEventHandlers, ev: Event) => any) | null = null
  
  constructor() {
    // 模拟图片加载
    setTimeout(() => {
      this.complete = true
      this.width = 300
      this.height = 200
      this.naturalWidth = 300
      this.naturalHeight = 200
      if (this.onload) {
        this.onload.call(this, new Event('load'))
      }
    }, 10)
  }
  
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
}

// Mock DOM APIs
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: MockHTMLCanvasElement,
  writable: true
})

Object.defineProperty(window, 'HTMLImageElement', {
  value: MockHTMLImageElement,
  writable: true
})

// Mock document.createElement
const originalCreateElement = document.createElement
document.createElement = vi.fn((tagName: string) => {
  if (tagName.toLowerCase() === 'canvas') {
    return new MockHTMLCanvasElement() as any
  }
  if (tagName.toLowerCase() === 'img') {
    return new MockHTMLImageElement() as any
  }
  return originalCreateElement.call(document, tagName)
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 16)
})

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id)
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })),
  writable: true
})

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  } as Response)
)

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = vi.fn((...args) => {
  // 只在非测试环境下输出错误
  if (!args[0]?.toString().includes('[Test]')) {
    originalConsoleError(...args)
  }
})

console.warn = vi.fn((...args) => {
  // 只在非测试环境下输出警告
  if (!args[0]?.toString().includes('[Test]')) {
    originalConsoleWarn(...args)
  }
})

// 测试工具函数
export const createMockContainer = (): HTMLElement => {
  const container = document.createElement('div')
  container.style.width = '320px'
  container.style.height = '180px'
  document.body.appendChild(container)
  return container
}

export const cleanupMockContainer = (container: HTMLElement): void => {
  if (container.parentNode) {
    container.parentNode.removeChild(container)
  }
}

export const waitForNextTick = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const waitForAnimation = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 100))
}

// 清理函数
afterEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})
