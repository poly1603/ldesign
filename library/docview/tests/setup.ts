import { vi } from 'vitest'

// Mock DOM APIs
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn()
  }
})

Object.defineProperty(window, 'FileReader', {
  value: class MockFileReader {
    result: any = null
    onload: ((event: any) => void) | null = null
    onerror: ((event: any) => void) | null = null
    
    readAsArrayBuffer(file: File) {
      setTimeout(() => {
        this.result = new ArrayBuffer(8)
        this.onload?.({ target: this })
      }, 0)
    }
    
    readAsText(file: File) {
      setTimeout(() => {
        this.result = 'mock text content'
        this.onload?.({ target: this })
      }, 0)
    }
  }
})

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  } as Response)
)

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
}
