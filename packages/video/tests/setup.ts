/**
 * 测试环境设置文件
 * 配置测试环境和全局模拟
 */

import { vi } from 'vitest'

// 修复 MouseEvent 构造函数问题
if (!global.MouseEvent || typeof global.MouseEvent !== 'function') {
  global.MouseEvent = class MockMouseEvent extends Event {
    constructor(type: string, eventInitDict?: MouseEventInit) {
      super(type, eventInitDict)
      // 复制 MouseEvent 特有的属性
      this.button = eventInitDict?.button ?? 0
      this.buttons = eventInitDict?.buttons ?? 0
      this.clientX = eventInitDict?.clientX ?? 0
      this.clientY = eventInitDict?.clientY ?? 0
      this.ctrlKey = eventInitDict?.ctrlKey ?? false
      this.shiftKey = eventInitDict?.shiftKey ?? false
      this.altKey = eventInitDict?.altKey ?? false
      this.metaKey = eventInitDict?.metaKey ?? false
    }

    button: number
    buttons: number
    clientX: number
    clientY: number
    ctrlKey: boolean
    shiftKey: boolean
    altKey: boolean
    metaKey: boolean
  } as any
}

// 保存原始的createElement函数
const originalCreateElement = document.createElement

// 模拟 DOM 工具函数
vi.mock('../src/utils/dom', async () => {
  const actual = await vi.importActual('../src/utils/dom') as any
  return {
    ...actual,
    createElement: vi.fn((tagName: string, options?: any) => {
      if (tagName === 'video') {
        // 返回我们的模拟视频元素
        return createMockVideoElementInternal()
      }
      if (tagName === 'canvas') {
        // 返回我们的模拟Canvas元素
        return createMockCanvasElement()
      }
      // 对于其他元素，使用原始实现
      const element = originalCreateElement.call(document, tagName)

      // 应用选项
      if (options) {
        if (options.className) {
          element.className = options.className
        }

        if (options.id) {
          element.id = options.id
        }

        if (options.attributes) {
          Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value as string)
          })
        }

        if (options.styles) {
          Object.assign(element.style, options.styles)
        }

        if (options.innerHTML) {
          element.innerHTML = options.innerHTML
        }

        if (options.textContent) {
          element.textContent = options.textContent
        }
      }

      return element
    })
  }
})

// 内部模拟视频元素创建函数
function createMockVideoElementInternal(): HTMLVideoElement {
  const video = document.createElement('video') as HTMLVideoElement

  // 模拟基本属性
  Object.defineProperty(video, 'paused', {
    writable: true,
    value: true,
  })

  Object.defineProperty(video, 'currentTime', {
    writable: true,
    value: 0,
  })

  Object.defineProperty(video, 'duration', {
    writable: true,
    value: 100,
  })

  Object.defineProperty(video, 'volume', {
    writable: true,
    value: 1,
  })

  Object.defineProperty(video, 'muted', {
    writable: true,
    value: false,
  })

  Object.defineProperty(video, 'playbackRate', {
    writable: true,
    value: 1,
  })

  Object.defineProperty(video, 'readyState', {
    writable: true,
    value: 4, // HAVE_ENOUGH_DATA
  })

  Object.defineProperty(video, 'networkState', {
    writable: true,
    value: 1, // NETWORK_IDLE
  })

  Object.defineProperty(video, 'buffered', {
    value: {
      length: 1,
      start: () => 0,
      end: () => 100,
    },
  })

  Object.defineProperty(video, 'videoWidth', {
    writable: true,
    value: 800,
  })

  Object.defineProperty(video, 'videoHeight', {
    writable: true,
    value: 450,
  })

  Object.defineProperty(video, 'width', {
    writable: true,
    value: 800,
  })

  Object.defineProperty(video, 'height', {
    writable: true,
    value: 450,
  })

  // 模拟 src 属性的设置，自动触发 loadedmetadata 事件
  Object.defineProperty(video, 'src', {
    get() {
      return this._src || ''
    },
    set(value: string) {
      this._src = value
      // 立即触发 loadedmetadata 事件
      const event = new Event('loadedmetadata')
      queueMicrotask(() => {
        this.dispatchEvent(event)
      })
    },
    configurable: true
  })

  // 模拟 play 方法
  video.play = vi.fn().mockImplementation(() => {
    video.paused = false
    setTimeout(() => {
      const event = new Event('play')
      video.dispatchEvent(event)
    }, 0)
    return Promise.resolve()
  })

  // 模拟 pause 方法
  video.pause = vi.fn().mockImplementation(() => {
    video.paused = true
    setTimeout(() => {
      const event = new Event('pause')
      video.dispatchEvent(event)
    }, 0)
  })

  return video
}

// 模拟浏览器API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// 模拟ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  callback
}))

// 模拟requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id))

// 模拟Canvas API
const mockCanvasContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  canvas: null as any,
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over'
}

// 模拟document.createElement来返回模拟的Canvas
document.createElement = vi.fn((tagName: string) => {
  if (tagName.toLowerCase() === 'canvas') {
    // 创建一个真正的canvas元素，然后模拟其方法
    const realCanvas = originalCreateElement.call(document, 'canvas') as HTMLCanvasElement

    // 模拟getContext方法
    realCanvas.getContext = vi.fn((type: string) => {
      if (type === '2d') {
        return mockCanvasContext
      }
      return null
    }) as any

    // 模拟toDataURL方法
    realCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')

    // 模拟toBlob方法
    realCanvas.toBlob = vi.fn((callback: (blob: Blob | null) => void) => {
      const blob = new Blob(['fake-image-data'], { type: 'image/png' })
      callback(blob)
    }) as any

    // 设置默认尺寸
    realCanvas.width = 800
    realCanvas.height = 450

    return realCanvas
  }
  return originalCreateElement.call(document, tagName)
}) as any

// 模拟HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
})

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(HTMLVideoElement.prototype, 'load', {
  writable: true,
  value: vi.fn(),
})

// 模拟全屏API
Object.defineProperty(document, 'fullscreenEnabled', {
  writable: true,
  value: true,
})

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
})

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
})

Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
})

// 模拟画中画API
Object.defineProperty(document, 'pictureInPictureEnabled', {
  writable: true,
  value: true,
})

Object.defineProperty(document, 'pictureInPictureElement', {
  writable: true,
  value: null,
})

Object.defineProperty(document, 'exitPictureInPicture', {
  writable: true,
  value: vi.fn().mockImplementation(() => {
    // 找到当前的画中画视频元素并触发退出事件
    const videos = document.querySelectorAll('video')
    if (videos && videos.length > 0) {
      Array.from(videos).forEach(video => {
        // 使用setTimeout避免同步事件导致的问题
        setTimeout(() => {
          const leaveEvent = new Event('leavepictureinpicture')
          video.dispatchEvent(leaveEvent)
        }, 0)
      })
    }
    // 清除画中画元素引用
    (document as any).pictureInPictureElement = null
    return Promise.resolve()
  }),
})

Object.defineProperty(HTMLVideoElement.prototype, 'requestPictureInPicture', {
  writable: true,
  value: vi.fn().mockImplementation(function (this: HTMLVideoElement) {
    // 设置画中画元素引用
    (document as any).pictureInPictureElement = this
    // 使用setTimeout避免同步事件导致的问题
    setTimeout(() => {
      const enterEvent = new Event('enterpictureinpicture')
      this.dispatchEvent(enterEvent)
    }, 0)
    return Promise.resolve({})
  }),
})

// 模拟navigator
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
})

Object.defineProperty(navigator, 'platform', {
  writable: true,
  value: 'Win32',
})

Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  value: 0,
})

Object.defineProperty(navigator, 'hardwareConcurrency', {
  writable: true,
  value: 4,
})

Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

// 模拟screen
Object.defineProperty(screen, 'width', {
  writable: true,
  value: 1920,
})

Object.defineProperty(screen, 'height', {
  writable: true,
  value: 1080,
})

Object.defineProperty(screen, 'availWidth', {
  writable: true,
  value: 1920,
})

Object.defineProperty(screen, 'availHeight', {
  writable: true,
  value: 1040,
})

Object.defineProperty(screen, 'colorDepth', {
  writable: true,
  value: 24,
})

// 模拟window属性
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768,
})

Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1,
})

Object.defineProperty(window, 'scrollX', {
  writable: true,
  value: 0,
})

Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
})

// 模拟performance
Object.defineProperty(performance, 'memory', {
  writable: true,
  value: {
    jsHeapSizeLimit: 2172649472,
    totalJSHeapSize: 10000000,
    usedJSHeapSize: 8000000,
  },
})

// 模拟WebGL上下文
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
  if (contextType === 'webgl' || contextType === 'experimental-webgl') {
    return {
      getExtension: vi.fn().mockReturnValue({
        UNMASKED_VENDOR_WEBGL: 37445,
        UNMASKED_RENDERER_WEBGL: 37446,
      }),
      getParameter: vi.fn().mockImplementation((param) => {
        if (param === 37445) return 'Intel Inc.'
        if (param === 37446) return 'Intel(R) HD Graphics'
        return null
      }),
    }
  }
  return null
})

/**
 * 创建模拟容器元素
 * @returns 模拟的HTML容器元素
 */
export function createMockContainer(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'video-container'
  container.style.width = '800px'
  container.style.height = '450px'

  // 确保 document.body 存在并且是正确的类型
  if (!document.body) {
    const body = document.createElement('body')
    if (document.documentElement) {
      document.documentElement.appendChild(body)
    } else {
      // 如果 documentElement 也不存在，创建一个基本的 HTML 结构
      const html = document.createElement('html')
      html.appendChild(body)
      if (document.appendChild) {
        document.appendChild(html)
      }
    }
  }

  // 安全地添加到 body
  try {
    if (document.body && typeof document.body.appendChild === 'function') {
      document.body.appendChild(container)
    }
  } catch (error) {
    // 如果添加失败，直接返回容器
    console.warn('Failed to append container to body:', error)
  }

  return container
}

/**
 * 创建模拟视频元素
 * @returns 模拟的HTML视频元素
 */
export function createMockVideoElement(): HTMLVideoElement {
  return createMockVideoElementInternal()
}

/**
 * 等待异步操作完成
 * @param ms 等待时间（毫秒）
 * @returns Promise
 */
export function waitFor(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 等待条件满足
 * @param condition 条件函数
 * @param timeout 超时时间（毫秒）
 * @returns Promise
 */
export function waitForCondition(
  condition: () => boolean,
  timeout: number = 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const check = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Condition timeout'))
      } else {
        setTimeout(check, 10)
      }
    }

    check()
  })
}

/**
 * 模拟媒体查询
 * @param query 媒体查询字符串
 * @param matches 是否匹配
 * @returns 模拟的MediaQueryList对象
 */
export function mockMediaQuery(query: string, matches: boolean = false): MediaQueryList {
  const mediaQuery = {
    matches,
    media: query,
    onchange: null as ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList

  // 模拟window.matchMedia返回这个对象
  vi.mocked(window.matchMedia).mockReturnValue(mediaQuery)

  return mediaQuery
}

/**
 * 清理测试环境
 */
export function cleanup(): void {
  // 清理DOM
  document.body.innerHTML = ''

  // 清理全局状态
  vi.clearAllMocks()

  // 重置模拟函数
  vi.clearAllTimers()

  // 重置模拟的属性
  Object.defineProperty(document, 'fullscreenElement', {
    writable: true,
    value: null,
  })

  Object.defineProperty(document, 'pictureInPictureElement', {
    writable: true,
    value: null,
  })

  // 清理可能残留的IntersectionObserver实例
  if (typeof window !== 'undefined' && (window as any)._mockObservers) {
    (window as any)._mockObservers.forEach((observer: any) => {
      if (observer.disconnect) {
        observer.disconnect()
      }
    })
      ; (window as any)._mockObservers = []
  }
}

/**
 * 创建模拟的Canvas元素
 */
function createMockCanvasElement(): HTMLCanvasElement {
  // 创建一个真正的canvas元素，然后模拟其方法
  const realCanvas = originalCreateElement.call(document, 'canvas') as HTMLCanvasElement

  // 模拟getContext方法
  realCanvas.getContext = vi.fn((type: string) => {
    if (type === '2d') {
      return mockCanvasContext
    }
    return null
  }) as any

  // 模拟toDataURL方法
  realCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')

  // 模拟toBlob方法
  realCanvas.toBlob = vi.fn((callback: (blob: Blob | null) => void) => {
    const blob = new Blob(['fake-image-data'], { type: 'image/png' })
    callback(blob)
  }) as any

  // 设置默认尺寸
  realCanvas.width = 800
  realCanvas.height = 450

  return realCanvas
}

/**
 * 模拟 Canvas API
 */
export function mockCanvas() {
  const mockContext = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    canvas: null as any,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over'
  }

  const mockCanvas = {
    width: 800,
    height: 450,
    getContext: vi.fn((type: string) => {
      if (type === '2d') {
        mockContext.canvas = mockCanvas
        return mockContext
      }
      return null
    }),
    toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
      const blob = new Blob(['fake-image-data'], { type: 'image/png' })
      callback(blob)
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }

  return { mockCanvas, mockContext }
}

// 模拟HTMLAnchorElement的click方法，避免jsdom导航错误
Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
  writable: true,
  value: vi.fn().mockImplementation(function (this: HTMLAnchorElement) {
    // 模拟点击行为，但不触发实际导航
    // 这避免了jsdom的 "Not implemented: navigation" 错误
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
      // 在jsdom环境中不设置view属性，避免类型错误
    })
    this.dispatchEvent(event)
  }),
})

// 模拟URL对象的方法，用于处理blob URL
if (!globalThis.URL) {
  globalThis.URL = {
    createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
    revokeObjectURL: vi.fn(),
  } as any
} else {
  globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()
}

// 模拟 requestAnimationFrame 和 cancelAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(callback, 16) // 模拟 60fps
})

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id)
})

// 注意：不要在这里添加全局afterEach，因为每个测试文件都有自己的清理逻辑
// 避免重复调用cleanup导致的竞态条件
