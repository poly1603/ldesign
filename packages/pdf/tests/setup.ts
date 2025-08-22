/**
 * Vitest 测试设置文件
 * 提供全局的测试环境配置和工具函数
 */

import { vi } from 'vitest'

// 模拟浏览器环境的全局对象
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: class MockCanvas {
    width: number = 0
    height: number = 0

    getContext(type: string) {
      if (type === '2d') {
        return {
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
          })),
          putImageData: vi.fn(),
          createImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
          })),
          setTransform: vi.fn(),
          drawImage: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          fillText: vi.fn(),
          measureText: vi.fn(() => ({ width: 10 })),
        }
      }
      return null
    }

    toDataURL() {
      return 'data:image/png;base64,test'
    }

    toBlob(callback: (blob: Blob | null) => void) {
      setTimeout(() => callback(new Blob()), 0)
    }
  },
})

// 模拟 OffscreenCanvas
Object.defineProperty(window, 'OffscreenCanvas', {
  value: class MockOffscreenCanvas {
    constructor(width: number, height: number) {
      this.width = width
      this.height = height
    }

    getContext() {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
      }
    }

    convertToBlob() {
      return Promise.resolve(new Blob())
    }
  },
})

// 模拟 Worker
Object.defineProperty(window, 'Worker', {
  value: class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null
    onerror: ((error: ErrorEvent) => void) | null = null

    constructor(url: string) {
      // 模拟 Worker 构造函数
    }

    postMessage(data: unknown) {
      // 模拟异步响应
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: { id: 'test', type: 'success', data: 'mock response' },
          } as MessageEvent)
        }
      }, 10)
    }

    terminate() {
      // 模拟终止 Worker
    }
  },
})

// 模拟 File API
Object.defineProperty(window, 'File', {
  value: class MockFile {
    name: string
    size: number
    type: string

    constructor(chunks: BlobPart[], filename: string, options?: FilePropertyBag) {
      this.name = filename
      this.size = chunks.reduce((acc, chunk) =>
        acc + (typeof chunk === 'string' ? chunk.length : chunk.byteLength || 0), 0
      )
      this.type = options?.type || ''
    }

    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(this.size))
    }

    text() {
      return Promise.resolve('mock file content')
    }
  },
})

// 模拟 FileReader
Object.defineProperty(window, 'FileReader', {
  value: class MockFileReader {
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null
    onerror: ((error: ProgressEvent<FileReader>) => void) | null = null
    result: string | ArrayBuffer | null = null

    readAsArrayBuffer(file: File) {
      setTimeout(() => {
        this.result = new ArrayBuffer(file.size)
        if (this.onload) {
          this.onload({ target: this } as ProgressEvent<FileReader>)
        }
      }, 10)
    }

    readAsText(file: File) {
      setTimeout(() => {
        this.result = 'mock file content'
        if (this.onload) {
          this.onload({ target: this } as ProgressEvent<FileReader>)
        }
      }, 10)
    }
  },
})

// 模拟 URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
})

// 模拟 fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  } as Response)
)

// 模拟 console 方法（避免测试时的噪音输出）
const originalConsole = { ...console }

beforeEach(() => {
  // 在每个测试前重置 console mock
  vi.spyOn(console, 'warn').mockImplementation(() => { })
  vi.spyOn(console, 'error').mockImplementation(() => { })
  vi.spyOn(console, 'log').mockImplementation(() => { })
})

afterEach(() => {
  // 在每个测试后清理 mock
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

// 全局测试工具函数
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeWithinRange(floor: number, ceiling: number): T
    }
  }
}

// 自定义匹配器
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})

// 设置测试超时
vi.setConfig({ testTimeout: 10000 })