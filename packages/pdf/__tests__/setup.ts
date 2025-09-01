/**
 * 测试环境设置
 */

import { vi } from 'vitest'

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 5,
      getPage: vi.fn((pageNumber: number) => Promise.resolve({
        pageNumber,
        getViewport: vi.fn(({ scale = 1, rotation = 0 } = {}) => ({
          width: 595 * scale,
          height: 842 * scale,
          scale,
          rotation,
          transform: [scale, 0, 0, scale, 0, 0],
        })),
        render: vi.fn(() => ({
          promise: Promise.resolve(),
          cancel: vi.fn(),
        })),
        getTextContent: vi.fn(() => Promise.resolve({
          items: [
            { str: 'Sample text content', transform: [12, 0, 0, 12, 100, 700] },
            { str: 'More text here', transform: [12, 0, 0, 12, 100, 680] },
          ],
        })),
        getAnnotations: vi.fn(() => Promise.resolve([
          {
            subtype: 'Link',
            url: 'https://example.com',
            rect: [100, 700, 200, 720],
          },
        ])),
      })),
      getMetadata: vi.fn(() => Promise.resolve({
        info: {
          Title: 'Test PDF',
          Author: 'Test Author',
          Subject: 'Test Subject',
          Creator: 'Test Creator',
          Producer: 'Test Producer',
          CreationDate: new Date('2023-01-01'),
          ModDate: new Date('2023-01-02'),
          PDFFormatVersion: '1.7',
        },
      })),
      destroy: vi.fn(() => Promise.resolve()),
    }),
  })),
}))

// Mock Canvas API
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    rect: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
    putImageData: vi.fn(),
    canvas: {
      width: 595,
      height: 842,
      toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
      toBlob: vi.fn((callback) => {
        const blob = new Blob(['fake-image-data'], { type: 'image/png' })
        callback(blob)
      }),
    },
  })),
})

// Mock FileReader
global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null
  error: any = null
  readyState: number = 0
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onloadend: ((event: any) => void) | null = null

  readAsArrayBuffer(file: File) {
    setTimeout(() => {
      this.readyState = 2
      this.result = new ArrayBuffer(1024)
      if (this.onload) {
        this.onload({ target: this })
      }
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    }, 10)
  }

  readAsText(file: File) {
    setTimeout(() => {
      this.readyState = 2
      this.result = 'fake file content'
      if (this.onload) {
        this.onload({ target: this })
      }
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    }, 10)
  }

  abort() {
    this.readyState = 2
  }
} as any

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock Blob
global.Blob = class MockBlob {
  size: number
  type: string
  
  constructor(parts: any[] = [], options: { type?: string } = {}) {
    this.size = parts.reduce((size, part) => size + (part?.length || 0), 0)
    this.type = options.type || ''
  }
} as any

// Mock File
global.File = class MockFile extends global.Blob {
  name: string
  lastModified: number
  
  constructor(parts: any[], name: string, options: { type?: string; lastModified?: number } = {}) {
    super(parts, options)
    this.name = name
    this.lastModified = options.lastModified || Date.now()
  }
} as any

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => {
    const element = {
      tagName: tagName.toUpperCase(),
      style: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(() => false),
        toggle: vi.fn(),
      },
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      innerHTML: '',
      textContent: '',
      value: '',
      checked: false,
      disabled: false,
      click: vi.fn(),
      focus: vi.fn(),
      blur: vi.fn(),
      scrollIntoView: vi.fn(),
    }

    if (tagName === 'canvas') {
      Object.assign(element, {
        width: 595,
        height: 842,
        getContext: HTMLCanvasElement.prototype.getContext,
        toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
        toBlob: vi.fn((callback) => {
          const blob = new Blob(['fake-image-data'], { type: 'image/png' })
          callback(blob)
        }),
      })
    }

    return element
  }),
})

// Mock window methods
Object.defineProperty(window, 'requestAnimationFrame', {
  value: vi.fn((callback: FrameRequestCallback) => {
    setTimeout(callback, 16)
    return 1
  }),
})

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: vi.fn(),
})

// Mock fullscreen API
Object.defineProperty(document, 'exitFullscreen', {
  value: vi.fn(() => Promise.resolve()),
})

Object.defineProperty(Element.prototype, 'requestFullscreen', {
  value: vi.fn(() => Promise.resolve()),
})

// Mock print
Object.defineProperty(window, 'print', {
  value: vi.fn(),
})

// Mock open
Object.defineProperty(window, 'open', {
  value: vi.fn(() => ({
    document: {
      write: vi.fn(),
      createElement: document.createElement,
      body: { appendChild: vi.fn() },
      readyState: 'complete',
    },
    addEventListener: vi.fn(),
    print: vi.fn(),
    close: vi.fn(),
  })),
})

// Mock console methods to reduce noise in tests
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

console.warn = vi.fn()
console.error = vi.fn()

// Restore console methods after tests if needed
export function restoreConsole() {
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
}

// Helper function to create mock PDF file
export function createMockPdfFile(name = 'test.pdf', size = 1024): File {
  const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]) // %PDF-
  const mockData = new Uint8Array(size)
  mockData.set(pdfHeader, 0)
  
  return new File([mockData], name, { type: 'application/pdf' })
}

// Helper function to create mock ArrayBuffer with PDF signature
export function createMockPdfArrayBuffer(size = 1024): ArrayBuffer {
  const buffer = new ArrayBuffer(size)
  const view = new Uint8Array(buffer)
  const pdfHeader = [0x25, 0x50, 0x44, 0x46, 0x2D] // %PDF-
  view.set(pdfHeader, 0)
  return buffer
}

// Helper function to wait for async operations
export function waitFor(ms = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
